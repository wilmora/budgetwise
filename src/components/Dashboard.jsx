import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Calendar, ChevronRight } from 'lucide-react';
import { getTransactions, getMonthlyTransactions, calculateTotals, getSpendingByCategory, getCategories } from '../utils/storage';
import { predictMonthlySpending } from '../utils/aiCategorizer';
import { formatCurrency } from '../utils/currency';
import AIInsights from './AIInsights';

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
    const prediction = useMemo(() => predictMonthlySpending(getTransactions()), []);
    const categories = getCategories();

    const balance = totals.income - totals.expense;
    const savingsRate = totals.income > 0 ? Math.round(((totals.income - totals.expense) / totals.income) * 100) : 0;

    // Chart Colors
    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    const pieData = categoryData.slice(0, 6).map((cat, index) => ({
        name: cat.name,
        value: cat.amount,
        color: cat.color || COLORS[index % COLORS.length]
    }));

    const dailyData = useMemo(() => {
        const days = {};
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
        }

        transactions.forEach(t => {
            if (t.type === 'expense') {
                const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (days[date] !== undefined) days[date] += t.amount;
            }
        });
        return Object.entries(days).map(([date, amount]) => ({ date, amount }));
    }, [transactions]);

    const recentTransactions = transactions.slice(0, 5);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="dashboard page-enter">
            {/* Header */}
            <div className="dashboard-header animate-fade-up">
                <div className="dashboard-greeting">
                    <h1>{getTimeGreeting()}</h1>
                    <p>Here's your financial overview</p>
                </div>
                <div className="dashboard-date">{formatDate()}</div>
            </div>

            {/* Period Toggle */}
            <div className="period-toggle animate-fade-up animate-stagger-1">
                {['week', 'month', 'all'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`period-toggle__btn ${period === p ? 'period-toggle__btn--active' : ''}`}
                    >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            {/* Premium Summary Cards */}
            <div className="summary-section">
                <div className="summary-card summary-card--balance animate-fade-up animate-stagger-2">
                    <div className="summary-card__icon">
                        <Wallet size={20} />
                    </div>
                    <div className="summary-card__label">Total Balance</div>
                    <div className="summary-card__value animate-count">{formatCurrency(balance)}</div>
                </div>

                <div className="summary-card summary-card--income animate-fade-up animate-stagger-3">
                    <div className="summary-card__icon">
                        <TrendingUp size={20} />
                    </div>
                    <div className="summary-card__label">Income</div>
                    <div className="summary-card__value animate-count">{formatCurrency(totals.income)}</div>
                </div>

                <div className="summary-card summary-card--expense animate-fade-up animate-stagger-4">
                    <div className="summary-card__icon">
                        <TrendingDown size={20} />
                    </div>
                    <div className="summary-card__label">Expenses</div>
                    <div className="summary-card__value animate-count">{formatCurrency(totals.expense)}</div>
                </div>

                <div className="summary-card summary-card--savings animate-fade-up animate-stagger-5">
                    <div className="summary-card__icon">
                        <PiggyBank size={20} />
                    </div>
                    <div className="summary-card__label">Savings Rate</div>
                    <div className="summary-card__value animate-count">{savingsRate}%</div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="animate-fade-up animate-stagger-6">
                <AIInsights />
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Spending Trend Chart */}
                <div className="chart-card animate-fade-up animate-stagger-7">
                    <div className="chart-card__header">
                        <div>
                            <h3 className="chart-card__title">Spending Trend</h3>
                            <p className="chart-card__subtitle">Last 14 days</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                    dy={10}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                    tickFormatter={(v) => `$${v}`}
                                    width={50}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        padding: '12px'
                                    }}
                                    formatter={(value) => [formatCurrency(value), 'Spent']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSpending)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spending Breakdown Pie Chart */}
                <div className="chart-card animate-fade-up animate-stagger-8">
                    <div className="chart-card__header">
                        <div>
                            <h3 className="chart-card__title">Spending Breakdown</h3>
                            <p className="chart-card__subtitle">By category</p>
                        </div>
                    </div>
                    {pieData.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'center' }}>
                            <div className="chart-container" style={{ height: '180px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                                            }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {pieData.slice(0, 5).map((cat, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: 'var(--text-xs)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <div
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    backgroundColor: cat.color
                                                }}
                                            />
                                            <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                                            {formatCurrency(cat.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon">📊</div>
                            <p className="empty-state__title">No spending data</p>
                            <p className="empty-state__text">Add some transactions to see your breakdown</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Projection (only show in month view) */}
            {period === 'month' && prediction.currentSpending > 0 && (
                <div className="insights-card animate-fade-up">
                    <div className="insights-card__header">
                        <span className="insights-card__badge">
                            <Calendar size={12} />
                            Forecast
                        </span>
                    </div>
                    <h3 className="insights-card__title">End of Month Projection</h3>
                    <div className="insights-list">
                        <div className="insight-item">
                            <div className="insight-item__icon">📈</div>
                            <div className="insight-item__text">
                                <strong>Projected spending:</strong> {formatCurrency(prediction.projectedSpending)}
                                <br />
                                <span style={{ opacity: 0.8 }}>
                                    Daily average: {formatCurrency(prediction.dailyAverage)} • {prediction.daysLeft} days left
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="recent-transactions animate-fade-up">
                <div className="recent-transactions__header">
                    <h3 className="recent-transactions__title">Recent Activity</h3>
                    <a href="#" className="recent-transactions__link">
                        View All <ChevronRight size={14} />
                    </a>
                </div>
                <ul className="transaction-list">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((transaction, index) => {
                            const category = categories.find(c => c.id === transaction.category);
                            return (
                                <li
                                    key={transaction.id}
                                    className="transaction-item animate-slide-right"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="transaction-item__left">
                                        <div className="transaction-item__icon">
                                            {category?.emoji || '📦'}
                                        </div>
                                        <div className="transaction-item__details">
                                            <span className="transaction-item__name">
                                                {transaction.description || 'Unnamed'}
                                            </span>
                                            <span className="transaction-item__category">
                                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`transaction-item__amount transaction-item__amount--${transaction.type}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </span>
                                </li>
                            );
                        })
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon">💸</div>
                            <p className="empty-state__title">No transactions yet</p>
                            <p className="empty-state__text">Tap the + button to add your first transaction</p>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
}
