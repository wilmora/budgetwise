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

    // Prepare chart data
    const pieData = categoryData.slice(0, 6).map(cat => ({
        name: cat.name,
        value: cat.amount,
        color: cat.color
    }));

    // Get daily spending for area chart
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

    return (
        <div className="dashboard">
            {/* Period Selector */}
            <div className="toggle-group">
                <button
                    className={`toggle-btn ${period === 'week' ? 'active' : ''}`}
                    onClick={() => setPeriod('week')}
                >
                    Week
                </button>
                <button
                    className={`toggle-btn ${period === 'month' ? 'active' : ''}`}
                    onClick={() => setPeriod('month')}
                >
                    Month
                </button>
                <button
                    className={`toggle-btn ${period === 'all' ? 'active' : ''}`}
                    onClick={() => setPeriod('all')}
                >
                    All Time
                </button>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="card summary-card">
                    <div className="summary-icon income">💰</div>
                    <div className="summary-label">Income</div>
                    <div className="summary-value positive">{formatCurrency(totals.income)}</div>
                </div>

                <div className="card summary-card">
                    <div className="summary-icon expense">💸</div>
                    <div className="summary-label">Expenses</div>
                    <div className="summary-value negative">{formatCurrency(totals.expense)}</div>
                </div>

                <div className="card summary-card">
                    <div className="summary-icon balance">⚖️</div>
                    <div className="summary-label">Balance</div>
                    <div className={`summary-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(balance)}
                    </div>
                </div>

                <div className="card summary-card">
                    <div className="summary-icon savings">📊</div>
                    <div className="summary-label">Savings Rate</div>
                    <div className={`summary-value ${savingsRate >= 20 ? 'positive' : savingsRate >= 0 ? '' : 'negative'}`}>
                        {savingsRate}%
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            {insights.length > 0 && (
                <div className="insights-section" style={{ marginBottom: '1.5rem' }}>
                    {insights.slice(0, 2).map((insight, idx) => (
                        <div key={idx} className="insight-card">
                            <div className="insight-header">
                                <span className="insight-icon">{insight.icon}</span>
                                <span className="insight-title">{insight.title}</span>
                            </div>
                            <p className="insight-text">{insight.text}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Spending by Category */}
                {pieData.length > 0 && (
                    <div className="card chart-card">
                        <div className="card-header">
                            <h3 className="card-title">Spending by Category</h3>
                        </div>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            background: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {pieData.map((cat, idx) => (
                                <span key={idx} className="category-badge" style={{ borderLeft: `3px solid ${cat.color}` }}>
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Spending Trend */}
                {dailyData.length > 1 && (
                    <div className="card chart-card">
                        <div className="card-header">
                            <h3 className="card-title">Daily Spending Trend</h3>
                        </div>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6b6b7b"
                                        fontSize={12}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#6b6b7b"
                                        fontSize={12}
                                        tickLine={false}
                                        tickFormatter={(v) => `$${v}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            background: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#00d9ff"
                                        fillOpacity={1}
                                        fill="url(#colorSpending)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Monthly Projection */}
            {period === 'month' && prediction.currentSpending > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">📈 Monthly Projection</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Based on your daily average of <strong style={{ color: 'var(--accent-primary)' }}>{formatCurrency(prediction.dailyAverage)}</strong>,
                        you're projected to spend <strong style={{ color: 'var(--accent-danger)' }}>{formatCurrency(prediction.projectedSpending)}</strong> this month.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {prediction.daysLeft} days remaining in the month
                    </p>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent Transactions</h3>
                </div>

                {recentTransactions.length > 0 ? (
                    <div className="transactions-list">
                        {recentTransactions.map(transaction => {
                            const category = categories.find(c => c.id === transaction.category);
                            return (
                                <div key={transaction.id} className="transaction-item">
                                    <div
                                        className="transaction-icon"
                                        style={{ background: `${category?.color || '#6b7280'}20`, color: category?.color || '#6b7280' }}
                                    >
                                        {category?.emoji || '📦'}
                                    </div>
                                    <div className="transaction-details">
                                        <div className="transaction-name">{transaction.description || 'Unnamed'}</div>
                                        <div className="transaction-category">{category?.name || transaction.category}</div>
                                    </div>
                                    <div>
                                        <div className={`transaction-amount ${transaction.type}`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </div>
                                        <div className="transaction-date">
                                            {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <div className="empty-title">No transactions yet</div>
                        <p className="empty-text">Add your first transaction to start tracking your budget</p>
                    </div>
                )}
            </div>
        </div>
    );
}
