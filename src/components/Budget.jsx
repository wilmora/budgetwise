import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, AreaChart, Area, Legend } from 'recharts';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react';
import { getTransactions, getBudgets, saveBudgets, getCategories, getMonthlyTransactions } from '../utils/storage';
import { formatCurrency } from '../utils/currency';
import { generateBudgetSuggestions } from '../utils/aiService';

export default function Budget() {
    const [budgets, setBudgets] = useState(() => getBudgets());
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [budgetLimit, setBudgetLimit] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const categories = getCategories();
    const expenseCategories = categories.filter(c => !['salary', 'freelance', 'investments'].includes(c.id));

    const now = new Date();
    const monthlyTransactions = useMemo(() => getMonthlyTransactions(now.getFullYear(), now.getMonth()), []);

    // AI Suggestions
    useEffect(() => {
        const loadSuggestions = async () => {
            if (Object.keys(budgets).length > 0 || monthlyTransactions.length > 5) {
                const data = await generateBudgetSuggestions(getTransactions());
                setSuggestions(data);
            }
        };
        loadSuggestions();
    }, [budgets, monthlyTransactions.length]);

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

    // Weekly spending data for chart
    const weeklyData = useMemo(() => {
        const transactions = getTransactions();
        const weeks = {};
        const today = new Date();

        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(today);
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
                if (t.type === 'expense') weeks[weekLabel].expense += t.amount;
                else weeks[weekLabel].income += t.amount;
            }
        });

        return Object.values(weeks);
    }, []);

    const handleSaveBudget = () => {
        if (selectedCategory && budgetLimit) {
            const newBudgets = { ...budgets, [selectedCategory]: parseFloat(budgetLimit) };
            setBudgets(newBudgets);
            saveBudgets(newBudgets);
            setShowModal(false);
            setSelectedCategory(null);
            setBudgetLimit('');
            setSuggestions([]);
        }
    };

    const handleApplySuggestion = (suggestion) => {
        const cat = categories.find(c => c.name === suggestion.category);
        if (cat) {
            setSelectedCategory(cat.id);
            setBudgetLimit(suggestion.suggestedLimit.toString());
            setShowModal(true);
        }
    };

    const handleEditBudget = (categoryId) => {
        setSelectedCategory(categoryId);
        setBudgetLimit(budgets[categoryId]?.toString() || '');
        setShowModal(true);
    };

    const handleRemoveBudget = (categoryId) => {
        if (confirm('Delete this budget?')) {
            const newBudgets = { ...budgets };
            delete newBudgets[categoryId];
            setBudgets(newBudgets);
            saveBudgets(newBudgets);
        }
    };

    const getProgressStatus = (spent, limit) => {
        const percentage = (spent / limit) * 100;
        if (percentage >= 100) return 'danger';
        if (percentage >= 85) return 'warning';
        return 'success';
    };

    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const totalSpent = Object.entries(budgets).reduce((sum, [cat]) => sum + (categorySpending[cat] || 0), 0);
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    const healthData = [
        { name: 'Spent', value: totalSpent, color: totalSpent > totalBudget ? '#ef4444' : '#3b82f6' },
        { name: 'Remaining', value: Math.max(totalBudget - totalSpent, 0), color: '#e5e7eb' }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">{payload[0].payload.week}</p>
                    {payload.map((entry, idx) => (
                        <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget & Goals</h1>
                    <p className="text-gray-500 dark:text-gray-400">{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • {daysLeft} days left</p>
                </div>
                <button onClick={() => { setSelectedCategory(null); setBudgetLimit(''); setShowModal(true); }} className="btn btn-primary">
                    <Plus size={18} /> Set Budget
                </button>
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
                <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-blue-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-blue-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-purple-600" size={20} />
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Budget Recommendations</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestions.map((s, idx) => (
                            <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.category}</span>
                                    <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">Suggested</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{s.reason}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(s.suggestedLimit)}</span>
                                    <button onClick={() => handleApplySuggestion(s)} className="text-xs font-medium bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors">
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget Health - Donut Chart */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Budget Health</h3>
                        <Target size={18} className="text-gray-400" />
                    </div>
                    <div style={{ height: 200, width: '100%', maxWidth: 200, margin: '0 auto', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={healthData} cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                                    {healthData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Spent</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</span>
                            <span className="text-xs text-gray-400">of {formatCurrency(totalBudget)}</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-gray-500">Spent</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                            <span className="text-gray-500">Remaining</span>
                        </div>
                    </div>
                </div>

                {/* Weekly Trend - Bar Chart */}
                <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Weekly Spending Trend</h3>
                        <TrendingUp size={18} className="text-gray-400" />
                    </div>
                    <div style={{ height: 220, width: '100%' }}>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weeklyData} barGap={4}>
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `$${v}`} width={50} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded bg-emerald-500" />
                            <span className="text-gray-500">Income</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded bg-rose-500" />
                            <span className="text-gray-500">Expenses</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Categories */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Budgets</h3>
                {Object.keys(budgets).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Plus size={28} className="text-gray-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">No budgets yet</h4>
                        <p className="text-sm text-gray-500 mb-4">Set spending limits to track your goals</p>
                        <button onClick={() => setShowModal(true)} className="btn btn-primary">Create Budget</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Object.entries(budgets).map(([categoryId, limit]) => {
                            const category = categories.find(c => c.id === categoryId);
                            const spent = categorySpending[categoryId] || 0;
                            const percentage = Math.min((spent / limit) * 100, 100);
                            const status = getProgressStatus(spent, limit);

                            return (
                                <div key={categoryId} onClick={() => handleEditBudget(categoryId)} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">{category?.emoji || '📦'}</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{category?.name}</h4>
                                                <p className="text-xs text-gray-500">{formatCurrency(limit)} limit</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${status === 'danger' ? 'text-red-500' : status === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>{Math.round(percentage)}%</span>
                                    </div>

                                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                                        <div className={`h-full rounded-full transition-all duration-500 ${status === 'danger' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }} />
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{formatCurrency(spent)} spent</span>
                                        <span>{formatCurrency(Math.max(limit - spent, 0))} left</span>
                                    </div>

                                    <Edit2 size={14} className="absolute top-3 right-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedCategory ? 'Edit Budget' : 'New Budget'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {!budgets[selectedCategory] && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Category</label>
                                    <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500" value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value)}>
                                        <option value="">Select category...</option>
                                        {expenseCategories.filter(c => !budgets[c.id]).map(cat => (<option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Monthly Limit</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                                    <input type="number" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} className="w-full pl-10 pr-4 py-4 text-3xl font-bold bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500" placeholder="0" autoFocus />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                            {selectedCategory && budgets[selectedCategory] && (
                                <button onClick={() => { handleRemoveBudget(selectedCategory); setShowModal(false); }} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 font-medium">Cancel</button>
                            <button onClick={handleSaveBudget} disabled={!selectedCategory || !budgetLimit} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all">
                                Save Budget
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
