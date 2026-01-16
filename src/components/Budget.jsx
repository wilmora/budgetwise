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

    // Calculate spending per category
    const categorySpending = useMemo(() => {
        const spending = {};
        monthlyTransactions.forEach(t => {
            if (t.type === 'expense') {
                spending[t.category] = (spending[t.category] || 0) + t.amount;
            }
        });
        return spending;
    }, [monthlyTransactions]);

    // Get weekly spending data for chart
    const weeklyData = useMemo(() => {
        const transactions = getTransactions();
        const weeks = {};
        const now = new Date();

        // Get last 8 weeks
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
            const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            weeks[weekLabel] = { week: weekLabel, expense: 0, income: 0 };
        }

        transactions.forEach(t => {
            const date = new Date(t.date);
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            if (weeks[weekLabel]) {
                if (t.type === 'expense') {
                    weeks[weekLabel].expense += t.amount;
                } else {
                    weeks[weekLabel].income += t.amount;
                }
            }
        });

        return Object.values(weeks);
    }, []);

    const handleSaveBudget = () => {
        if (selectedCategory && budgetLimit) {
            const newBudgets = {
                ...budgets,
                [selectedCategory]: parseFloat(budgetLimit)
            };
            setBudgets(newBudgets);
            saveBudgets(newBudgets);
            setShowModal(false);
            setSelectedCategory(null);
            setBudgetLimit('');
        }
    };

    const handleEditBudget = (categoryId) => {
        setSelectedCategory(categoryId);
        setBudgetLimit(budgets[categoryId]?.toString() || '');
        setShowModal(true);
    };

    const handleRemoveBudget = (categoryId) => {
        const newBudgets = { ...budgets };
        delete newBudgets[categoryId];
        setBudgets(newBudgets);
        saveBudgets(newBudgets);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getProgressStatus = (spent, limit) => {
        const percentage = (spent / limit) * 100;
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'success';
    };

    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const totalSpent = Object.entries(budgets).reduce((sum, [cat]) =>
        sum + (categorySpending[cat] || 0), 0
    );

    return (
        <div className="budget-page">
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Budget</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Overview Card */}
            {totalBudget > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">Monthly Overview</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Spent</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-danger)' }}>
                                {formatCurrency(totalSpent)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Budget</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                {formatCurrency(totalBudget)}
                            </div>
                        </div>
                    </div>
                    <div className="progress-bar" style={{ height: '12px' }}>
                        <div
                            className={`progress-fill ${getProgressStatus(totalSpent, totalBudget)}`}
                            style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                        />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatCurrency(Math.max(totalBudget - totalSpent, 0))} remaining
                    </div>
                </div>
            )}

            {/* Weekly Trend */}
            {weeklyData.some(w => w.expense > 0 || w.income > 0) && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">Weekly Spending Trend</h3>
                    </div>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barGap={0}>
                                <XAxis
                                    dataKey="week"
                                    stroke="#6b6b7b"
                                    fontSize={11}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#6b6b7b"
                                    fontSize={11}
                                    tickLine={false}
                                    tickFormatter={(v) => `$${v}`}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        background: '#1a1a2e',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                            <span style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }} />
                            Income
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                            <span style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }} />
                            Expenses
                        </span>
                    </div>
                </div>
            )}

            {/* Budget Categories */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Category Budgets</h3>
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => {
                            setSelectedCategory(null);
                            setBudgetLimit('');
                            setShowModal(true);
                        }}
                    >
                        + Add Budget
                    </button>
                </div>

                {Object.keys(budgets).length > 0 ? (
                    <div>
                        {Object.entries(budgets).map(([categoryId, limit]) => {
                            const category = categories.find(c => c.id === categoryId);
                            const spent = categorySpending[categoryId] || 0;
                            const percentage = Math.min((spent / limit) * 100, 100);
                            const status = getProgressStatus(spent, limit);

                            return (
                                <div key={categoryId} className="budget-item" onClick={() => handleEditBudget(categoryId)}>
                                    <div className="budget-header">
                                        <div className="budget-category">
                                            <span className="budget-emoji">{category?.emoji || '📦'}</span>
                                            <span className="budget-name">{category?.name || categoryId}</span>
                                        </div>
                                        <div className="budget-amounts">
                                            <span className="budget-spent" style={{ color: status === 'danger' ? 'var(--accent-danger)' : 'inherit' }}>
                                                {formatCurrency(spent)}
                                            </span>
                                            <span className="budget-limit"> / {formatCurrency(limit)}</span>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${status}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    {status === 'danger' && (
                                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--accent-danger)' }}>
                                            ⚠️ Over budget by {formatCurrency(spent - limit)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">💰</div>
                        <div className="empty-title">No budgets set</div>
                        <p className="empty-text">Set budget limits to track your spending</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            Set Your First Budget
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {selectedCategory ? 'Edit Budget' : 'Set Budget Limit'}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            {!selectedCategory && (
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={selectedCategory || ''}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">Select category...</option>
                                        {expenseCategories
                                            .filter(c => !budgets[c.id])
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.emoji} {cat.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Monthly Limit</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0.00"
                                    step="1"
                                    min="0"
                                    value={budgetLimit}
                                    onChange={(e) => setBudgetLimit(e.target.value)}
                                    style={{ fontSize: '1.5rem', fontWeight: '600' }}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            {selectedCategory && budgets[selectedCategory] && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => { handleRemoveBudget(selectedCategory); setShowModal(false); }}
                                >
                                    Remove
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveBudget}
                                disabled={!selectedCategory || !budgetLimit}
                            >
                                Save Budget
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
