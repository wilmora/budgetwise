# BudgetWise - Complete Codebase for LLM Review

> **Copy this entire file and paste it to another LLM for code review and improvement suggestions.**

---

## Project Context

BudgetWise is a personal finance/budget tracking app built with React + Vite for web, wrapped in Capacitor for Android. It uses a neumorphic design system and stores data in LocalStorage.

**Goal**: Get this app ready for beta testing and eventual Play Store release.

**Known Issues**: See the "Areas Needing Work" section at the end.

---

## File Structure Overview

```
src/
├── App.jsx                 # Main app, routing, theme
├── main.jsx                # Entry point
├── index.css               # Design system
├── components/
│   ├── Dashboard.jsx       # Overview, charts, insights
│   ├── Transactions.jsx    # CRUD transactions
│   ├── Budget.jsx          # Budget goals
│   ├── Settings.jsx        # Import/export, preferences
│   └── Onboarding/
│       ├── index.jsx       # Flow controller
│       ├── Welcome.jsx     # Currency selection
│       ├── Reminders.jsx   # Notification prefs
│       ├── Analytics.jsx   # Analytics consent
│       └── Tutorial.jsx    # How it works
└── utils/
    ├── storage.js          # LocalStorage CRUD
    ├── aiCategorizer.js    # AI categorization
    └── csvHandler.js       # CSV import/export
```

---

# SOURCE CODE

## 1. src/App.jsx

```jsx
import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';

function App() {
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem('budgetwise-onboarding-completed');
    });
    const [showTutorial, setShowTutorial] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [refreshKey, setRefreshKey] = useState(0);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('budgetwise-theme') || 'light';
    });

    // Apply theme class to document
    useEffect(() => {
        document.documentElement.className = theme === 'dark' ? 'dark-theme' : '';
        localStorage.setItem('budgetwise-theme', theme);
    }, [theme]);

    const handleUpdate = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(t => t === 'dark' ? 'light' : 'dark');
    }, []);

    const handleOnboardingComplete = (preferences) => {
        // Save preferences to localStorage
        localStorage.setItem('budgetwise-currencies', JSON.stringify(preferences.currencies));
        localStorage.setItem('budgetwise-reminders', JSON.stringify(preferences.reminders));
        localStorage.setItem('budgetwise-analytics', JSON.stringify(preferences.analytics));
        localStorage.setItem('budgetwise-onboarding-completed', 'true');
        setShowOnboarding(false);
    };

    const handleResetOnboarding = () => {
        localStorage.removeItem('budgetwise-onboarding-completed');
        setShowOnboarding(true);
    };

    const handleReopenTutorial = () => {
        setShowTutorial(true);
    };

    // Show onboarding for first-time users
    if (showOnboarding) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard key={refreshKey} />;
            case 'transactions':
                return <Transactions key={refreshKey} onUpdate={handleUpdate} />;
            case 'budget':
                return <Budget key={refreshKey} />;
            case 'settings':
                return (
                    <Settings
                        onUpdate={handleUpdate}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        onResetOnboarding={handleResetOnboarding}
                        onReopenTutorial={handleReopenTutorial}
                    />
                );
            default:
                return <Dashboard key={refreshKey} />;
        }
    };

    return (
        <div className="app">
            {/* Tutorial Overlay */}
            {showTutorial && (
                <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
                    <TutorialContent onComplete={() => setShowTutorial(false)} />
                </div>
            )}

            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">💰</div>
                        <span>BudgetWise</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="nav" style={{ position: 'static', background: 'transparent', boxShadow: 'none' }}>
                        <ul className="nav-list" style={{ gap: '0.5rem', boxShadow: 'var(--neu-shadow)' }}>
                            <li className="nav-item">
                                <button
                                    className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('dashboard')}
                                >
                                    <span className="nav-icon">📊</span>
                                    <span>Dashboard</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-button ${activeTab === 'transactions' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('transactions')}
                                >
                                    <span className="nav-icon">💳</span>
                                    <span>Transactions</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-button ${activeTab === 'budget' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('budget')}
                                >
                                    <span className="nav-icon">🎯</span>
                                    <span>Budget</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('settings')}
                                >
                                    <span className="nav-icon">⚙️</span>
                                    <span>Settings</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                {renderContent()}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="nav">
                <ul className="nav-list">
                    <li className="nav-item">
                        <button
                            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <span className="nav-icon">📊</span>
                            <span>Dashboard</span>
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-button ${activeTab === 'transactions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            <span className="nav-icon">💳</span>
                            <span>Transactions</span>
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-button ${activeTab === 'budget' ? 'active' : ''}`}
                            onClick={() => setActiveTab('budget')}
                        >
                            <span className="nav-icon">🎯</span>
                            <span>Budget</span>
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <span className="nav-icon">⚙️</span>
                            <span>Settings</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

// Inline Tutorial Content component
function TutorialContent({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        { icon: '📊', title: 'Track Your Spending', text: 'Import transactions or add them manually.' },
        { icon: '🎯', title: 'Set Budget Goals', text: 'Create budgets and get alerts.' },
        { icon: '💡', title: 'Get Smart Insights', text: 'AI analyzes your spending patterns.' }
    ];
    const slide = slides[currentSlide];
    const isLast = currentSlide === slides.length - 1;

    return (
        <div className="tutorial-card" onClick={e => e.stopPropagation()}>
            <div className="tutorial-illustration">{slide.icon}</div>
            <h2 className="tutorial-title">{slide.title}</h2>
            <p className="tutorial-text">{slide.text}</p>
            <div className="tutorial-dots">
                {slides.map((_, idx) => (
                    <div key={idx} className={`tutorial-dot ${idx === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)} style={{ cursor: 'pointer' }} />
                ))}
            </div>
            <div className="tutorial-actions">
                <button className="btn btn-secondary" onClick={onComplete}>Skip</button>
                <button className="btn btn-primary" onClick={() => isLast ? onComplete() : setCurrentSlide(c => c + 1)}>
                    {isLast ? 'Done' : 'Next'}
                </button>
            </div>
        </div>
    );
}

export default App;
```

---

## 2. src/utils/storage.js

```javascript
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
```

---

## 3. src/utils/aiCategorizer.js

```javascript
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
```

---

## 4. src/utils/csvHandler.js

```javascript
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
    const isHeaderless = parseDate(firstRow[0]) !== null;

    let dateIdx, descIdx, amountIdx, debitIdx, creditIdx, categoryIdx;
    let startRow = 0;

    if (isHeaderless) {
        // Headerless CSV - use positional mapping
        dateIdx = 0;
        descIdx = 1;
        debitIdx = 2;
        creditIdx = 3;
        amountIdx = -1;
        categoryIdx = -1;
        startRow = 0;
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
        startRow = 1;
    }

    if (dateIdx === -1) {
        throw new Error('Could not find a date column in CSV');
    }

    const transactions = [];
    const categories = getCategories();
    const isCreditCard = importMode === 'credit_card';

    for (let i = startRow; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);

        try {
            const dateStr = values[dateIdx];
            const date = parseDate(dateStr);
            if (!date) continue;

            const description = descIdx !== -1 ? values[descIdx]?.trim() || '' : '';

            let amount = 0;
            let type = 'expense';
            let category = 'other';

            if (debitIdx !== -1 && creditIdx !== -1) {
                const debit = parseAmount(values[debitIdx]);
                const credit = parseAmount(values[creditIdx]);

                if (credit > 0) {
                    amount = credit;
                    if (isCreditCard) {
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

function parseDate(dateStr) {
    if (!dateStr) return null;

    const cleaned = dateStr.trim().replace(/["']/g, '');

    const formats = [
        /^(\d{4})-(\d{2})-(\d{2})/,
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,
        /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
    ];

    for (const format of formats) {
        const match = cleaned.match(format);
        if (match) {
            let year, month, day;

            if (format === formats[0]) {
                [, year, month, day] = match;
            } else if (format === formats[1] || format === formats[2]) {
                [, month, day, year] = match;
                if (year.length === 2) {
                    year = '20' + year;
                }
            } else {
                [, day, month, year] = match;
            }

            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    const parsed = new Date(cleaned);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function parseAmount(amountStr) {
    if (!amountStr) return 0;

    let cleaned = amountStr.replace(/[$€£¥₹,\s]/g, '');

    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
        cleaned = '-' + cleaned.slice(1, -1);
    }

    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
}

export function exportToCSV(transactions) {
    const categories = getCategories();
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];

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
```

---

## 5. src/components/Dashboard.jsx

```jsx
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { getTransactions, getMonthlyTransactions, calculateTotals, getSpendingByCategory, getCategories } from '../utils/storage';
import { generateInsights, predictMonthlySpending } from '../utils/aiCategorizer';

export default function Dashboard() {
    const [period, setPeriod] = useState('all');

    const transactions = useMemo(() => {
        const now = new Date();
        if (period === 'month') {
            return getMonthlyTransactions(now.getFullYear(), now.getMonth());
        } else if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return getTransactions().filter(t => new Date(t.date) >= weekAgo);
        }
        return getTransactions();
    }, [period]);

    const totals = useMemo(() => calculateTotals(transactions), [transactions]);
    const categoryData = useMemo(() => getSpendingByCategory(transactions), [transactions]);
    const insights = useMemo(() => generateInsights(transactions), [transactions]);
    const prediction = useMemo(() => predictMonthlySpending(getTransactions()), []);

    const balance = totals.income - totals.expense;
    const savingsRate = totals.income > 0 ? Math.round(((totals.income - totals.expense) / totals.income) * 100) : 0;

    const pieData = categoryData.slice(0, 6).map(cat => ({
        name: cat.name,
        value: cat.amount,
        color: cat.color
    }));

    const dailyData = useMemo(() => {
        const days = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                days[date] = (days[date] || 0) + t.amount;
            }
        });
        return Object.entries(days)
            .map(([date, amount]) => ({ date, amount }))
            .slice(-14);
    }, [transactions]);

    const recentTransactions = transactions.slice(0, 5);
    const categories = getCategories();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // ... JSX rendering (period selector, summary cards, charts, insights, recent transactions)
    // See full file for complete JSX
}
```

---

## 6. src/components/Transactions.jsx

```jsx
import React, { useState, useMemo, useCallback } from 'react';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, getCategories } from '../utils/storage';
import { suggestCategory } from '../utils/aiCategorizer';

export default function Transactions({ onUpdate }) {
    const [transactions, setTransactions] = useState(() => getTransactions());
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState(null);

    const categories = getCategories();

    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleDescriptionChange = (e) => {
        const description = e.target.value;
        setFormData(prev => ({ ...prev, description }));

        // Get AI suggestion after typing
        if (description.length > 3) {
            const suggestion = suggestCategory(description, parseFloat(formData.amount) || 0, formData.type);
            setAiSuggestion(suggestion);

            // Auto-fill category if confidence is high
            if (suggestion.confidence >= 0.7 && !formData.category) {
                setFormData(prev => ({ ...prev, category: suggestion.category }));
            }
        } else {
            setAiSuggestion(null);
        }
    };

    // ... rest of component (filtering, CRUD operations, modal)
}
```

---

## 7. src/components/Budget.jsx

```jsx
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getTransactions, getBudgets, saveBudgets, getCategories, getMonthlyTransactions } from '../utils/storage';

export default function Budget() {
    const [budgets, setBudgets] = useState(() => getBudgets());
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [budgetLimit, setBudgetLimit] = useState('');

    const categories = getCategories();
    const expenseCategories = categories.filter(c =>
        !['salary', 'freelance', 'investments'].includes(c.id)
    );

    const now = new Date();
    const monthlyTransactions = useMemo(() =>
        getMonthlyTransactions(now.getFullYear(), now.getMonth()),
        []
    );

    const categorySpending = useMemo(() => {
        const spending = {};
        monthlyTransactions.forEach(t => {
            if (t.type === 'expense') {
                spending[t.category] = (spending[t.category] || 0) + t.amount;
            }
        });
        return spending;
    }, [monthlyTransactions]);

    // Weekly data for chart, budget CRUD, progress status calculation
    // ... rest of component
}
```

---

## 8. src/components/Settings.jsx

```jsx
import React, { useState, useRef } from 'react';
import { getTransactions, saveTransactions, clearAllData, getSettings, saveSettings } from '../utils/storage';
import { parseCSV, downloadCSV } from '../utils/csvHandler';
import { suggestCategory } from '../utils/aiCategorizer';

export default function Settings({ onUpdate, theme, onToggleTheme, onResetOnboarding, onReopenTutorial }) {
    const [settings, setSettings] = useState(() => getSettings());
    const [importStatus, setImportStatus] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showImportType, setShowImportType] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const fileInputRef = useRef(null);

    const transactions = getTransactions();

    const handleImport = async (importMode) => {
        setShowImportType(false);
        if (!pendingFile) return;

        setImportStatus({ type: 'loading', message: 'Importing...' });

        try {
            const text = await pendingFile.text();
            const importedTransactions = parseCSV(text, importMode);

            // Apply AI categorization to imported transactions
            const categorizedTransactions = importedTransactions.map(t => {
                if (t.category === 'other' && t.description) {
                    const suggestion = suggestCategory(t.description, t.amount, t.type);
                    if (suggestion.confidence >= 0.5) {
                        return { ...t, category: suggestion.category };
                    }
                }
                return t;
            });

            // Merge and deduplicate
            const existingTransactions = getTransactions();
            const allTransactions = [...categorizedTransactions, ...existingTransactions];
            const seen = new Set();
            const uniqueTransactions = allTransactions.filter(t => {
                const key = `${t.date}_${t.amount}_${t.description}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            uniqueTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            saveTransactions(uniqueTransactions);

            setImportStatus({
                type: 'success',
                message: `Successfully imported ${categorizedTransactions.length} transactions`
            });

            onUpdate?.();
        } catch (error) {
            setImportStatus({
                type: 'error',
                message: `Import failed: ${error.message}`
            });
        }
    };

    // ... rest of component (export, clear data, theme toggle, preferences)
}
```

---

## 9. src/components/Onboarding/index.jsx

```jsx
import React, { useState } from 'react';
import Welcome from './Welcome';
import Reminders from './Reminders';
import Analytics from './Analytics';
import Tutorial from './Tutorial';

const STEPS = {
    WELCOME: 0,
    REMINDERS: 1,
    ANALYTICS: 2,
    TUTORIAL: 3,
    DONE: 4
};

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(STEPS.WELCOME);
    const [preferences, setPreferences] = useState({
        currencies: ['USD'],
        reminders: { enabled: false, frequency: null },
        analytics: { analyticsEnabled: true }
    });

    const handleWelcomeNext = (currencies) => {
        setPreferences(prev => ({ ...prev, currencies }));
        setStep(STEPS.REMINDERS);
    };

    const handleRemindersNext = (reminders) => {
        setPreferences(prev => ({ ...prev, reminders }));
        setStep(STEPS.ANALYTICS);
    };

    const handleAnalyticsNext = (analytics) => {
        setPreferences(prev => ({ ...prev, analytics }));
        setStep(STEPS.TUTORIAL);
    };

    const handleTutorialComplete = () => {
        onComplete(preferences);
    };

    // Step switching logic...
}
```

---

# AREAS NEEDING WORK

## Critical Issues
1. **Currency hardcoded to USD** - Onboarding collects currency but `formatCurrency()` ignores it
2. **No input validation** - Amounts can be negative/zero, dates unchecked
3. **LocalStorage only** - No backup, ~5MB limit, data loss risk

## Medium Priority
4. **Reminders do nothing** - UI exists but no push notification implementation
5. **Analytics toggle non-functional** - Either implement or remove
6. **No edit affordance on mobile** - Users don't know transactions are tappable
7. **Basic AI categorization** - Needs more keywords or ML
8. **CSV date format issues** - Non-US formats may fail

## Polish Items
9. No loading states during CSV import
10. Chart tooltips don't adapt to theme
11. Currency can't be changed post-onboarding
12. No recurring transactions feature
13. No custom categories

---

## Questions for the Reviewing LLM

1. What refactoring would improve code quality and maintainability?
2. Are there UX patterns that could be improved?
3. What performance optimizations are needed?
4. How should accessibility be improved?
5. What's the best approach to add the missing features?

---

*Generated: January 2026*
