import { getCategories, getTransactions } from './storage';

// Keyword patterns for automatic categorization
const KEYWORD_PATTERNS = {
    food: [
        'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza',
        'subway', 'chipotle', 'wendy', 'taco', 'doordash', 'ubereats', 'grubhub',
        'pizza hut', 'domino', 'kfc', 'chick-fil-a', 'panera', 'dunkin', 'breakfast',
        'lunch', 'dinner', 'food', 'eat', 'meal'
    ],
    groceries: [
        'walmart', 'target', 'costco', 'kroger', 'safeway', 'whole foods', 'trader joe',
        'aldi', 'publix', 'wegmans', 'grocery', 'supermarket', 'market'
    ],
    transport: [
        'uber', 'lyft', 'taxi', 'gas', 'shell', 'chevron', 'exxon', 'bp', 'fuel',
        'parking', 'toll', 'metro', 'subway', 'bus', 'train', 'amtrak', 'airline',
        'delta', 'united', 'american airlines', 'southwest', 'car', 'auto'
    ],
    shopping: [
        'amazon', 'ebay', 'etsy', 'shop', 'store', 'mall', 'outlet', 'nike', 'adidas',
        'zara', 'h&m', 'gap', 'old navy', 'nordstrom', 'macy', 'best buy', 'apple store',
        'clothing', 'clothes', 'shoes', 'fashion'
    ],
    entertainment: [
        'netflix', 'spotify', 'hulu', 'disney', 'hbo', 'youtube', 'twitch', 'movie',
        'cinema', 'theater', 'concert', 'game', 'steam', 'playstation', 'xbox', 'nintendo',
        'amc', 'regal', 'music', 'ticket'
    ],
    utilities: [
        'electric', 'power', 'water', 'gas bill', 'internet', 'comcast', 'verizon',
        'at&t', 't-mobile', 'phone', 'utility', 'cable', 'wifi', 'broadband'
    ],
    health: [
        'pharmacy', 'cvs', 'walgreens', 'hospital', 'doctor', 'dentist', 'medical',
        'health', 'clinic', 'prescription', 'medicine', 'therapy', 'gym', 'fitness'
    ],
    subscriptions: [
        'subscription', 'membership', 'monthly', 'annual', 'prime', 'icloud', 'dropbox',
        'adobe', 'microsoft', 'google one', 'apple music', 'patreon'
    ],
    education: [
        'college', 'university', 'school', 'course', 'udemy', 'coursera', 'skillshare',
        'book', 'textbook', 'tuition', 'education', 'learning', 'class'
    ],
    travel: [
        'hotel', 'airbnb', 'booking', 'flight', 'vacation', 'trip', 'resort',
        'marriott', 'hilton', 'expedia', 'travel', 'cruise'
    ],
    salary: [
        'payroll', 'salary', 'wage', 'paycheck', 'direct deposit', 'employer'
    ],
    freelance: [
        'freelance', 'contract', 'client payment', 'invoice', 'project payment',
        'consulting', 'gig'
    ],
    investments: [
        'dividend', 'interest', 'investment', 'stock', 'trading', 'robinhood',
        'fidelity', 'vanguard', 'capital gains'
    ],
    gifts: [
        'gift', 'present', 'birthday', 'christmas', 'donation', 'charity'
    ]
};

// Categorize a transaction description using keywords
export function categorizeByKeywords(description) {
    const lowerDesc = description.toLowerCase();

    for (const [categoryId, keywords] of Object.entries(KEYWORD_PATTERNS)) {
        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword)) {
                return categoryId;
            }
        }
    }

    return 'other';
}

// Learn from past transactions to improve categorization
export function categorizeByHistory(description) {
    const transactions = getTransactions();
    const lowerDesc = description.toLowerCase();

    // Find similar past transactions
    const similar = transactions.filter(t => {
        const pastDesc = t.description.toLowerCase();
        // Check if descriptions share significant words
        const descWords = lowerDesc.split(/\s+/).filter(w => w.length > 3);
        const pastWords = pastDesc.split(/\s+/).filter(w => w.length > 3);
        return descWords.some(w => pastWords.includes(w));
    });

    if (similar.length > 0) {
        // Return the most common category from similar transactions
        const categoryCounts = {};
        similar.forEach(t => {
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        });

        const sortedCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1]);

        if (sortedCategories.length > 0) {
            return sortedCategories[0][0];
        }
    }

    return null;
}

// Main AI categorization function
export function suggestCategory(description, amount, type = 'expense') {
    // First, try to match from history
    const historyMatch = categorizeByHistory(description);
    if (historyMatch) {
        return {
            category: historyMatch,
            confidence: 0.9,
            source: 'history'
        };
    }

    // Then try keyword matching
    const keywordMatch = categorizeByKeywords(description);
    if (keywordMatch !== 'other') {
        return {
            category: keywordMatch,
            confidence: 0.7,
            source: 'keywords'
        };
    }

    // Default based on type
    if (type === 'income') {
        return {
            category: 'salary',
            confidence: 0.3,
            source: 'default'
        };
    }

    return {
        category: 'other',
        confidence: 0.1,
        source: 'default'
    };
}

// Generate spending insights based on transaction patterns
export function generateInsights(transactions) {
    const insights = [];
    const categories = getCategories();

    if (transactions.length === 0) {
        return insights;
    }

    // Calculate spending by category
    const categorySpending = {};
    const dailySpending = {};
    let totalExpenses = 0;
    let totalIncome = 0;

    transactions.forEach(t => {
        if (t.type === 'expense') {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
            totalExpenses += t.amount;

            const day = new Date(t.date).toDateString();
            dailySpending[day] = (dailySpending[day] || 0) + t.amount;
        } else {
            totalIncome += t.amount;
        }
    });

    // Find top spending category
    const sortedCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length > 0) {
        const [topCatId, topAmount] = sortedCategories[0];
        const topCat = categories.find(c => c.id === topCatId);
        const percentage = Math.round((topAmount / totalExpenses) * 100);

        if (percentage > 30) {
            insights.push({
                type: 'warning',
                icon: topCat?.emoji || '📊',
                title: 'High Spending Alert',
                text: `${topCat?.name || topCatId} accounts for ${percentage}% of your expenses. Consider setting a budget limit.`
            });
        }
    }

    // Savings rate insight
    if (totalIncome > 0) {
        const savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);

        if (savingsRate >= 20) {
            insights.push({
                type: 'success',
                icon: '🎉',
                title: 'Great Savings!',
                text: `You're saving ${savingsRate}% of your income. Keep up the excellent work!`
            });
        } else if (savingsRate < 10 && savingsRate >= 0) {
            insights.push({
                type: 'tip',
                icon: '💡',
                title: 'Savings Opportunity',
                text: `Your savings rate is ${savingsRate}%. Try to save at least 20% of your income for financial security.`
            });
        } else if (savingsRate < 0) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Overspending Alert',
                text: `You're spending more than you earn. Review your expenses to identify areas to cut back.`
            });
        }
    }

    // Daily spending pattern
    const days = Object.keys(dailySpending);
    if (days.length > 1) {
        const avgDaily = totalExpenses / days.length;
        const highSpendDays = days.filter(d => dailySpending[d] > avgDaily * 1.5);

        if (highSpendDays.length > 0) {
            insights.push({
                type: 'info',
                icon: '📅',
                title: 'Spending Pattern',
                text: `You had ${highSpendDays.length} high-spending day(s) this period. Consider spreading purchases more evenly.`
            });
        }
    }

    return insights;
}

// Predict monthly spending based on current trends
export function predictMonthlySpending(transactions) {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Get this month's expenses
    const thisMonthExpenses = transactions
        .filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear() &&
                t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

    // Project to end of month
    const dailyAvg = thisMonthExpenses / currentDay;
    const projectedTotal = dailyAvg * daysInMonth;

    return {
        currentSpending: thisMonthExpenses,
        projectedSpending: Math.round(projectedTotal),
        dailyAverage: Math.round(dailyAvg),
        remainingBudget: daysInMonth - currentDay,
        daysLeft: daysInMonth - currentDay
    };
}
