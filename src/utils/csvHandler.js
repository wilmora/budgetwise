import { getCategories } from './storage';

// Parse CSV content to transactions
// importMode: 'credit_card' | 'bank' (default: 'bank')
export function parseCSV(csvContent, importMode = 'bank') {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 1) {
        throw new Error('CSV file is empty');
    }

    const firstRow = parseCSVLine(lines[0]);

    // Detect if first row is a header or data
    // If first cell looks like a date, it's probably headerless
    const isHeaderless = parseDate(firstRow[0]) !== null;

    let dateIdx, descIdx, amountIdx, debitIdx, creditIdx, categoryIdx;
    let startRow = 0;

    if (isHeaderless) {
        // Headerless CSV - use positional mapping
        // Expected format: Date, Description, Charge/Debit, Payment/Credit, [Card Number]
        dateIdx = 0;
        descIdx = 1;
        debitIdx = 2;   // Charges
        creditIdx = 3;  // Payments
        amountIdx = -1; // No single amount column
        categoryIdx = -1;
        startRow = 0;   // Start from first row
    } else {
        // Has headers - use header detection
        const headers = firstRow.map(h => h.toLowerCase().trim());

        dateIdx = headers.findIndex(h =>
            h.includes('date') || h.includes('time') || h.includes('posted') ||
            h.includes('trans') || h.includes('fecha') || h.includes('when') ||
            h.includes('day') || h.includes('effective') || h.includes('booking')
        );
        descIdx = headers.findIndex(h =>
            h.includes('description') || h.includes('memo') || h.includes('name') ||
            h.includes('merchant') || h.includes('payee') || h.includes('detail') ||
            h.includes('narrative') || h.includes('reference') || h.includes('transaction')
        );
        amountIdx = headers.findIndex(h =>
            h.includes('amount') || h.includes('value') || h.includes('sum') ||
            h.includes('total') || h.includes('monto') || h.includes('importe')
        );
        debitIdx = headers.findIndex(h =>
            h.includes('debit') || h.includes('withdrawal') || h.includes('expense') ||
            h.includes('cargo') || h.includes('salida') || h.includes('charge') ||
            h.includes('funds out') || h.includes('out')
        );
        creditIdx = headers.findIndex(h =>
            h.includes('credit') || h.includes('deposit') || h.includes('income') ||
            h.includes('abono') || h.includes('entrada') || h.includes('payment') ||
            h.includes('funds in') || h === 'in'
        );
        categoryIdx = headers.findIndex(h =>
            h.includes('category') || h.includes('type') || h.includes('categoria')
        );
        startRow = 1; // Skip header row
    }

    if (dateIdx === -1) {
        throw new Error('Could not find a date column in CSV');
    }

    const transactions = [];
    const categories = getCategories();
    const isCreditCard = importMode === 'credit_card';

    // Parse data rows
    for (let i = startRow; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);

        try {
            // Parse date
            const dateStr = values[dateIdx];
            const date = parseDate(dateStr);
            if (!date) continue;

            // Parse description
            const description = descIdx !== -1 ? values[descIdx]?.trim() || '' : '';

            // Parse amount and determine type
            let amount = 0;
            let type = 'expense';
            let category = 'other';

            if (debitIdx !== -1 && creditIdx !== -1) {
                // Separate debit/credit columns (common for credit card statements)
                const debit = parseAmount(values[debitIdx]);
                const credit = parseAmount(values[creditIdx]);

                if (credit > 0) {
                    amount = credit;
                    if (isCreditCard) {
                        // For credit cards: payments are still expenses (paying the card)
                        type = 'expense';
                        category = 'credit_payment';
                    } else {
                        type = 'income';
                    }
                } else if (debit > 0) {
                    amount = debit;
                    type = 'expense';
                }
            } else if (amountIdx !== -1) {
                // Single amount column
                const rawAmount = parseAmount(values[amountIdx]);
                if (rawAmount < 0) {
                    amount = Math.abs(rawAmount);
                    type = 'expense';
                } else if (rawAmount > 0) {
                    amount = rawAmount;
                    if (isCreditCard) {
                        type = 'expense';
                        category = 'credit_payment';
                    } else {
                        type = 'income';
                    }
                }
            }

            if (amount === 0) continue;

            // Parse category if available (only if not already set)
            if (category === 'other' && categoryIdx !== -1 && values[categoryIdx]) {
                const catName = values[categoryIdx].toLowerCase().trim();
                const matchedCat = categories.find(c =>
                    c.name.toLowerCase().includes(catName) ||
                    c.id.toLowerCase().includes(catName)
                );
                if (matchedCat) {
                    category = matchedCat.id;
                }
            }

            transactions.push({
                id: `import_${Date.now()}_${i}`,
                date: date.toISOString().split('T')[0],
                description,
                amount,
                type,
                category,
                createdAt: new Date().toISOString(),
                imported: true
            });
        } catch (error) {
            console.warn(`Skipping row ${i}: ${error.message}`);
        }
    }

    return transactions;
}

// Parse a single CSV line handling quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

// Parse various date formats
function parseDate(dateStr) {
    if (!dateStr) return null;

    const cleaned = dateStr.trim().replace(/["']/g, '');

    // Try various formats
    const formats = [
        // ISO format
        /^(\d{4})-(\d{2})-(\d{2})/,
        // US format MM/DD/YYYY or MM-DD-YYYY
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
        // US format MM/DD/YY
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,
        // EU format DD/MM/YYYY
        /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
    ];

    for (const format of formats) {
        const match = cleaned.match(format);
        if (match) {
            let year, month, day;

            if (format === formats[0]) {
                // ISO
                [, year, month, day] = match;
            } else if (format === formats[1] || format === formats[2]) {
                // US format
                [, month, day, year] = match;
                if (year.length === 2) {
                    year = '20' + year;
                }
            } else {
                // EU format - try to detect
                [, day, month, year] = match;
            }

            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    // Fallback to Date.parse
    const parsed = new Date(cleaned);
    return isNaN(parsed.getTime()) ? null : parsed;
}

// Parse amount string to number
function parseAmount(amountStr) {
    if (!amountStr) return 0;

    // Remove currency symbols and whitespace
    let cleaned = amountStr.replace(/[$€£¥₹,\s]/g, '');

    // Handle parentheses as negative (accounting format)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
        cleaned = '-' + cleaned.slice(1, -1);
    }

    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
}

// Export transactions to CSV
export function exportToCSV(transactions) {
    const categories = getCategories();

    // CSV header
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];

    // CSV rows
    const rows = transactions.map(t => {
        const category = categories.find(c => c.id === t.category);
        return [
            t.date,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.type === 'expense' ? -t.amount : t.amount,
            t.type,
            category?.name || t.category
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

// Download CSV file
export function downloadCSV(transactions, filename = 'budgetwise_export.csv') {
    const csv = exportToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}
