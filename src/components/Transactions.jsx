import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Filter, Plus, Camera, Trash2, Edit2, Check, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, getCategories } from '../utils/storage';
import { suggestCategory } from '../utils/aiCategorizer';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import ReceiptCapture from './ReceiptCapture';

export default function Transactions({ onUpdate, showAddModal, onCloseAddModal }) {
    const [transactions, setTransactions] = useState(() => getTransactions());
    const [showModal, setShowModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});

    const categories = getCategories();

    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [aiSuggestion, setAiSuggestion] = useState(null);

    // Handle external trigger to open add modal
    useEffect(() => {
        if (showAddModal) {
            openModal();
        }
    }, [showAddModal]);

    const refreshTransactions = useCallback(() => {
        setTransactions(getTransactions());
        onUpdate?.();
    }, [onUpdate]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (filter !== 'all' && t.type !== filter) return false;

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesDesc = t.description?.toLowerCase().includes(query);
                const category = categories.find(c => c.id === t.category);
                const matchesCat = category?.name.toLowerCase().includes(query);
                if (!matchesDesc && !matchesCat) return false;
            }
            return true;
        });
    }, [transactions, filter, searchQuery, categories]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        const amount = parseFloat(formData.amount);

        if (!formData.amount || isNaN(amount)) newErrors.amount = 'Amount is required';
        else if (amount <= 0) newErrors.amount = 'Amount must be > 0';

        if (!formData.description?.trim()) newErrors.description = 'Description is required';

        if (!formData.date) newErrors.date = 'Date is required';
        else if (isNaN(new Date(formData.date).getTime())) newErrors.date = 'Invalid date';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleDescriptionChange = (e) => {
        const description = e.target.value;
        setFormData(prev => ({ ...prev, description }));
        setErrors(prev => ({ ...prev, description: null }));

        if (description.length > 3) {
            const suggestion = suggestCategory(description, parseFloat(formData.amount) || 0, formData.type);
            setAiSuggestion(suggestion);

            if (suggestion.confidence >= 0.7 && !formData.category) {
                setFormData(prev => ({ ...prev, category: suggestion.category }));
            }
        } else {
            setAiSuggestion(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const transactionData = {
            type: formData.type,
            amount: parseFloat(formData.amount),
            description: formData.description.trim(),
            category: formData.category || 'other',
            date: formData.date
        };

        if (editingId) updateTransaction(editingId, transactionData);
        else addTransaction(transactionData);

        refreshTransactions();
        closeModal();
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(id);
            refreshTransactions();
        }
    };

    const handleEdit = (transaction) => {
        setEditingId(transaction.id);
        setFormData({
            type: transaction.type,
            amount: transaction.amount.toString(),
            description: transaction.description,
            category: transaction.category,
            date: transaction.date
        });
        setErrors({});
        setShowModal(true);
    };

    const openModal = () => {
        setEditingId(null);
        setFormData({
            type: 'expense',
            amount: '',
            description: '',
            category: '',
            date: new Date().toISOString().split('T')[0]
        });
        setAiSuggestion(null);
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setAiSuggestion(null);
        setErrors({});
        onCloseAddModal?.();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track your financial activity</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={openModal} className="btn btn-primary flex-1 md:flex-none">
                        <Plus size={18} /> Add New
                    </button>
                    <button onClick={() => setShowReceiptModal(true)} className="btn btn-secondary flex-1 md:flex-none">
                        <Camera size={18} /> Scan Receipt
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 dark:border-gray-700/50">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-sm"
                    />
                </div>

                <div className="flex gap-2">
                    {['all', 'expense', 'income'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${filter === f
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                }`}
                        >
                            {f === 'all' ? '📊 All' : f === 'expense' ? '💸 Expenses' : '💰 Income'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {/* List */}
            <div className="space-y-3 min-h-[400px]">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(transaction => {
                        const category = categories.find(c => c.id === transaction.category);
                        return (
                            <div
                                key={transaction.id}
                                onClick={() => handleEdit(transaction)}
                                className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 dark:border-gray-700/50 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ring-1 ring-black/5"
                                            style={{ backgroundColor: `${category?.color || '#9ca3af'}20` }}
                                        >
                                            {category?.emoji || '📦'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">{transaction.description}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-xs font-medium">
                                                    {category?.name || transaction.category}
                                                </span>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <span className="flex items-center gap-1 text-xs">
                                                    <Calendar size={12} />
                                                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-lg font-bold tracking-tight ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 dark:from-blue-900/0 dark:via-blue-900/10 dark:to-blue-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/30 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700/50">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-4 shadow-inner ring-1 ring-black/5">
                            {searchQuery ? (
                                <Search size={32} className="text-gray-300 dark:text-gray-600" />
                            ) : (
                                <div className="text-4xl opacity-50">🧾</div>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {searchQuery ? 'No matching transactions' : 'No transactions yet'}
                        </h3>
                        <p className="text-gray-500 max-w-xs text-center">
                            {searchQuery ? 'Try adjusting your filters or search terms' : 'Tap the + button to add your first transaction'}
                        </p>
                    </div>
                )}
            </div>

            <ReceiptCapture
                isOpen={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                onSuccess={refreshTransactions}
            />

            {/* Edit/Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Edit Transaction' : 'New Transaction'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Type Toggle */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                {['expense', 'income'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                                        className={`py-2 rounded-md text-sm font-medium transition-all ${formData.type === type
                                            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {type === 'expense' ? '💸 Expense' : '💰 Income'}
                                    </button>
                                ))}
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full pl-8 pr-4 py-3 text-2xl font-bold bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                                {errors.amount && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.amount}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="What was this for?"
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}

                                {/* AI Suggestion */}
                                {aiSuggestion && aiSuggestion.confidence >= 0.5 && (
                                    <div className="mt-2 text-xs flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                        <Sparkles size={12} />
                                        <span>AI Suggestion: <strong>{categories.find(c => c.id === aiSuggestion.category)?.name || aiSuggestion.category}</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select category...</option>
                                    {categories
                                        .filter(c => formData.type === 'income'
                                            ? ['salary', 'freelance', 'investments', 'gifts', 'other'].includes(c.id)
                                            : !['salary', 'freelance', 'investments'].includes(c.id))
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.emoji} {cat.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { handleDelete(editingId); closeModal(); }}
                                        className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button type="button" onClick={closeModal} className="flex-1 py-3 text-gray-500 hover:text-gray-900">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                                    {editingId ? 'Save Changes' : 'Add Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
