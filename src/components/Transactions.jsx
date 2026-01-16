import React, { useState, useMemo, useCallback } from 'react';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, getCategories } from '../utils/storage';
import { suggestCategory } from '../utils/aiCategorizer';

export default function Transactions({ onUpdate }) {
    const [transactions, setTransactions] = useState(() => getTransactions());
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = getCategories();

    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [aiSuggestion, setAiSuggestion] = useState(null);

    const refreshTransactions = useCallback(() => {
        setTransactions(getTransactions());
        onUpdate?.();
    }, [onUpdate]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Type filter
            if (filter !== 'all' && t.type !== filter) return false;

            // Search filter
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const transactionData = {
            type: formData.type,
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category || 'other',
            date: formData.date
        };

        if (editingId) {
            updateTransaction(editingId, transactionData);
        } else {
            addTransaction(transactionData);
        }

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
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setAiSuggestion(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="transactions-page">
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Transactions</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div className="toggle-group" style={{ marginBottom: 0, flex: '1 1 auto' }}>
                    <button
                        className={`toggle-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`toggle-btn ${filter === 'expense' ? 'active' : ''}`}
                        onClick={() => setFilter('expense')}
                    >
                        Expenses
                    </button>
                    <button
                        className={`toggle-btn ${filter === 'income' ? 'active' : ''}`}
                        onClick={() => setFilter('income')}
                    >
                        Income
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Transactions List */}
            <div className="card">
                {filteredTransactions.length > 0 ? (
                    <div className="transactions-list">
                        {filteredTransactions.map(transaction => {
                            const category = categories.find(c => c.id === transaction.category);
                            return (
                                <div
                                    key={transaction.id}
                                    className="transaction-item"
                                    onClick={() => handleEdit(transaction)}
                                >
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
                                            {new Date(transaction.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <div className="empty-title">
                            {searchQuery ? 'No matching transactions' : 'No transactions yet'}
                        </div>
                        <p className="empty-text">
                            {searchQuery ? 'Try a different search term' : 'Tap the + button to add your first transaction'}
                        </p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fab" onClick={openModal} aria-label="Add transaction">
                +
            </button>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingId ? 'Edit Transaction' : 'Add Transaction'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* Type Toggle */}
                                <div className="toggle-group">
                                    <button
                                        type="button"
                                        className={`toggle-btn ${formData.type === 'expense' ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                                        style={formData.type === 'expense' ? { background: 'var(--accent-danger)' } : {}}
                                    >
                                        💸 Expense
                                    </button>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${formData.type === 'income' ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                                        style={formData.type === 'income' ? { background: 'var(--accent-success)' } : {}}
                                    >
                                        💰 Income
                                    </button>
                                </div>

                                {/* Amount */}
                                <div className="form-group">
                                    <label className="form-label">Amount</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        style={{ fontSize: '1.5rem', fontWeight: '600' }}
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Starbucks coffee"
                                        value={formData.description}
                                        onChange={handleDescriptionChange}
                                    />

                                    {/* AI Suggestion */}
                                    {aiSuggestion && aiSuggestion.confidence >= 0.5 && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            background: 'rgba(0, 217, 255, 0.1)',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            color: 'var(--accent-primary)'
                                        }}>
                                            🤖 AI suggests: {categories.find(c => c.id === aiSuggestion.category)?.name || aiSuggestion.category}
                                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                                ({Math.round(aiSuggestion.confidence * 100)}% confidence)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        required
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
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                {editingId && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => { handleDelete(editingId); closeModal(); }}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
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
