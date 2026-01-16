// Default categories with emojis and colors
export const DEFAULT_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', emoji: '🍔', color: '#ef4444' },
    { id: 'transport', name: 'Transportation', emoji: '🚗', color: '#f59e0b' },
    { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#8b5cf6' },
    { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#ec4899' },
    { id: 'utilities', name: 'Utilities', emoji: '💡', color: '#06b6d4' },
    { id: 'health', name: 'Healthcare', emoji: '🏥', color: '#10b981' },
    { id: 'education', name: 'Education', emoji: '📚', color: '#3b82f6' },
    { id: 'travel', name: 'Travel', emoji: '✈️', color: '#14b8a6' },
    { id: 'subscriptions', name: 'Subscriptions', emoji: '📱', color: '#6366f1' },
    { id: 'groceries', name: 'Groceries', emoji: '🛒', color: '#22c55e' },
    { id: 'salary', name: 'Salary', emoji: '💰', color: '#10b981' },
    { id: 'freelance', name: 'Freelance', emoji: '💻', color: '#06b6d4' },
    { id: 'investments', name: 'Investments', emoji: '📈', color: '#8b5cf6' },
    { id: 'gifts', name: 'Gifts', emoji: '🎁', color: '#ec4899' },
    { id: 'other', name: 'Other', emoji: '📦', color: '#6b7280' },
];

// Storage keys
const STORAGE_KEYS = {
    TRANSACTIONS: 'budgetwise_transactions',
    CATEGORIES: 'budgetwise_categories',
    BUDGETS: 'budgetwise_budgets',
    SETTINGS: 'budgetwise_settings',
};

// Get all transactions
export function getTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading transactions:', error);
        return [];
    }
}

// Save all transactions
export function saveTransactions(transactions) {
    try {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        return true;
    } catch (error) {
        console.error('Error saving transactions:', error);
        return false;
    }
}

// Add a new transaction
export function addTransaction(transaction) {
    const transactions = getTransactions();
    const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
}

// Update a transaction
export function updateTransaction(id, updates) {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        saveTransactions(transactions);
        return transactions[index];
    }
    return null;
}

// Delete a transaction
export function deleteTransaction(id) {
    const transactions = getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    saveTransactions(filtered);
    return true;
}

// Get categories
export function getCategories() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch (error) {
        console.error('Error reading categories:', error);
        return DEFAULT_CATEGORIES;
    }
}

// Save categories
export function saveCategories(categories) {
    try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        return true;
    } catch (error) {
        console.error('Error saving categories:', error);
        return false;
    }
}

// Get budgets
export function getBudgets() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading budgets:', error);
        return {};
    }
}

// Save budgets
export function saveBudgets(budgets) {
    try {
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
        return true;
    } catch (error) {
        console.error('Error saving budgets:', error);
        return false;
    }
}

// Get settings
export function getSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : { currency: 'USD' };
    } catch (error) {
        console.error('Error reading settings:', error);
        return { currency: 'USD' };
    }
}

// Save settings
export function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Clear all data
export function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    return true;
}

// Get transactions for a specific month
export function getMonthlyTransactions(year, month) {
    const transactions = getTransactions();
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === month;
    });
}

// Calculate totals for transactions
export function calculateTotals(transactions) {
    return transactions.reduce(
        (acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount;
            } else {
                acc.expense += t.amount;
            }
            return acc;
        },
        { income: 0, expense: 0 }
    );
}

// Get spending by category
export function getSpendingByCategory(transactions) {
    const categories = getCategories();
    const spending = {};

    transactions.forEach(t => {
        if (t.type === 'expense') {
            if (!spending[t.category]) {
                const cat = categories.find(c => c.id === t.category) || { name: t.category, emoji: '📦', color: '#6b7280' };
                spending[t.category] = { ...cat, amount: 0 };
            }
            spending[t.category].amount += t.amount;
        }
    });

    return Object.values(spending).sort((a, b) => b.amount - a.amount);
}
