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

    const handleExport = () => {
        if (transactions.length === 0) {
            alert('No transactions to export');
            return;
        }

        const filename = `budgetwise_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(transactions, filename);
        setImportStatus({ type: 'success', message: `Exported ${transactions.length} transactions` });
        setTimeout(() => setImportStatus(null), 3000);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Store file and show import type modal
        setPendingFile(file);
        setShowImportType(true);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImport = async (importMode) => {
        setShowImportType(false);
        if (!pendingFile) return;

        setImportStatus({ type: 'loading', message: 'Importing...' });

        try {
            const text = await pendingFile.text();
            const importedTransactions = parseCSV(text, importMode);

            // Apply AI categorization to imported transactions (skip credit_payment category)
            const categorizedTransactions = importedTransactions.map(t => {
                if (t.category === 'other' && t.description) {
                    const suggestion = suggestCategory(t.description, t.amount, t.type);
                    if (suggestion.confidence >= 0.5) {
                        return { ...t, category: suggestion.category };
                    }
                }
                return t;
            });

            // Merge with existing transactions
            const existingTransactions = getTransactions();
            const allTransactions = [...categorizedTransactions, ...existingTransactions];

            // Remove duplicates based on date + amount + description
            const seen = new Set();
            const uniqueTransactions = allTransactions.filter(t => {
                const key = `${t.date}_${t.amount}_${t.description}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Sort by date (newest first)
            uniqueTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            saveTransactions(uniqueTransactions);

            setImportStatus({
                type: 'success',
                message: `Successfully imported ${categorizedTransactions.length} transactions`
            });

            onUpdate?.();
        } catch (error) {
            console.error('Import error:', error);
            setImportStatus({
                type: 'error',
                message: `Import failed: ${error.message}`
            });
        }

        setPendingFile(null);
        setTimeout(() => setImportStatus(null), 5000);
    };

    const handleClearData = () => {
        clearAllData();
        setShowClearConfirm(false);
        onUpdate?.();
        setImportStatus({ type: 'success', message: 'All data cleared' });
        setTimeout(() => setImportStatus(null), 3000);
    };

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        saveSettings(newSettings);
    };

    return (
        <div className="settings-page">
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Settings</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Manage your data and preferences
                </p>
            </div>

            {/* Import Status */}
            {importStatus && (
                <div
                    className="card"
                    style={{
                        marginBottom: '1rem',
                        background: importStatus.type === 'success'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : importStatus.type === 'error'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(0, 217, 255, 0.2)',
                        border: `1px solid ${importStatus.type === 'success'
                            ? 'rgba(16, 185, 129, 0.5)'
                            : importStatus.type === 'error'
                                ? 'rgba(239, 68, 68, 0.5)'
                                : 'rgba(0, 217, 255, 0.5)'
                            }`
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>
                            {importStatus.type === 'success' ? '✅' : importStatus.type === 'error' ? '❌' : '⏳'}
                        </span>
                        <span>{importStatus.message}</span>
                    </div>
                </div>
            )}

            {/* Data Section */}
            <div className="settings-section">
                <div className="settings-title">Data Management</div>

                {/* Import */}
                <div className="settings-item" onClick={() => fileInputRef.current?.click()}>
                    <div className="settings-item-content">
                        <div className="settings-item-icon">📥</div>
                        <div>
                            <div className="settings-item-label">Import CSV</div>
                            <div className="settings-item-desc">Import transactions from your bank</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                {/* Export */}
                <div className="settings-item" onClick={handleExport}>
                    <div className="settings-item-content">
                        <div className="settings-item-icon">📤</div>
                        <div>
                            <div className="settings-item-label">Export CSV</div>
                            <div className="settings-item-desc">
                                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                </div>

                {/* Clear Data */}
                <div
                    className="settings-item"
                    onClick={() => setShowClearConfirm(true)}
                    style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                    <div className="settings-item-content">
                        <div className="settings-item-icon" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>🗑️</div>
                        <div>
                            <div className="settings-item-label" style={{ color: 'var(--accent-danger)' }}>
                                Clear All Data
                            </div>
                            <div className="settings-item-desc">Delete all transactions and settings</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="settings-section">
                <div className="settings-title">Appearance</div>

                <div className="settings-item" onClick={onToggleTheme}>
                    <div className="settings-item-content">
                        <div className="settings-item-icon">
                            {theme === 'dark' ? '🌙' : '☀️'}
                        </div>
                        <div>
                            <div className="settings-item-label">Theme</div>
                            <div className="settings-item-desc">
                                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '4px'
                    }}>
                        <span style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '0.8rem',
                            background: theme === 'light' ? 'var(--accent-primary)' : 'transparent',
                            color: theme === 'light' ? 'white' : 'var(--text-muted)'
                        }}>Light</span>
                        <span style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '0.8rem',
                            background: theme === 'dark' ? 'var(--accent-primary)' : 'transparent',
                            color: theme === 'dark' ? 'white' : 'var(--text-muted)'
                        }}>Dark</span>
                    </div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="settings-section">
                <div className="settings-title">Preferences</div>

                {/* Currencies */}
                <div className="settings-item">
                    <div className="settings-item-content">
                        <div className="settings-item-icon">💱</div>
                        <div>
                            <div className="settings-item-label">Currencies</div>
                            <div className="settings-item-desc">
                                {JSON.parse(localStorage.getItem('budgetwise-currencies') || '["USD"]').join(', ')}
                            </div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Edit in onboarding</span>
                </div>

                {/* Reminders */}
                <div className="settings-item" onClick={() => {
                    const current = JSON.parse(localStorage.getItem('budgetwise-reminders') || '{"enabled":false}');
                    const newVal = { ...current, enabled: !current.enabled };
                    localStorage.setItem('budgetwise-reminders', JSON.stringify(newVal));
                    onUpdate?.();
                }}>
                    <div className="settings-item-content">
                        <div className="settings-item-icon">🔔</div>
                        <div>
                            <div className="settings-item-label">Reminders</div>
                            <div className="settings-item-desc">Budget update notifications</div>
                        </div>
                    </div>
                    <div className={`toggle-switch ${JSON.parse(localStorage.getItem('budgetwise-reminders') || '{"enabled":false}').enabled ? 'active' : ''}`} />
                </div>

                {/* Analytics */}
                <div className="settings-item" onClick={() => {
                    const current = JSON.parse(localStorage.getItem('budgetwise-analytics') || '{"analyticsEnabled":true}');
                    const newVal = { ...current, analyticsEnabled: !current.analyticsEnabled };
                    localStorage.setItem('budgetwise-analytics', JSON.stringify(newVal));
                    onUpdate?.();
                }}>
                    <div className="settings-item-content">
                        <div className="settings-item-icon">📊</div>
                        <div>
                            <div className="settings-item-label">Usage Analytics</div>
                            <div className="settings-item-desc">Help improve BudgetWise</div>
                        </div>
                    </div>
                    <div className={`toggle-switch ${JSON.parse(localStorage.getItem('budgetwise-analytics') || '{"analyticsEnabled":true}').analyticsEnabled ? 'active' : ''}`} />
                </div>

                {/* Reopen Tutorial */}
                <div className="settings-item" onClick={onReopenTutorial}>
                    <div className="settings-item-content">
                        <div className="settings-item-icon">📖</div>
                        <div>
                            <div className="settings-item-label">How It Works</div>
                            <div className="settings-item-desc">View the app tutorial again</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                </div>

                {/* Reset Onboarding */}
                <div className="settings-item" onClick={onResetOnboarding}>
                    <div className="settings-item-content">
                        <div className="settings-item-icon">🔄</div>
                        <div>
                            <div className="settings-item-label">Redo Setup</div>
                            <div className="settings-item-desc">Go through onboarding again</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                </div>
            </div>

            {/* CSV Format Help */}
            <div className="settings-section">
                <div className="settings-title">CSV Import Format</div>
                <div className="card" style={{ fontSize: '0.85rem' }}>
                    <p style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                        BudgetWise automatically detects common CSV formats from banks including:
                    </p>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <li>Standard format: Date, Description, Amount</li>
                        <li>Split columns: Date, Description, Debit, Credit</li>
                        <li>Various date formats (MM/DD/YYYY, YYYY-MM-DD, etc.)</li>
                    </ul>
                    <p style={{ marginTop: '0.75rem', color: 'var(--accent-primary)' }}>
                        💡 AI will automatically categorize your transactions after import!
                    </p>
                </div>
            </div>

            {/* App Info */}
            <div className="settings-section">
                <div className="settings-title">About</div>
                <div className="card">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 60,
                            height: 60,
                            background: 'var(--gradient-primary)',
                            borderRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            fontSize: '1.75rem'
                        }}>
                            💰
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            BudgetWise
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Smart Budget Tracker
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Version 1.0.0
                        </p>
                    </div>
                </div>
            </div>

            {/* Install PWA reminder */}
            <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📱</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Install BudgetWise on your home screen for the best experience!
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Look for "Add to Home Screen" in your browser menu
                </p>
            </div>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Clear All Data?</h3>
                            <button className="modal-close" onClick={() => setShowClearConfirm(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: 'var(--text-secondary)' }}>
                                This will permanently delete all your transactions, budgets, and settings.
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowClearConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleClearData}
                            >
                                Delete Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Type Selection Modal */}
            {showImportType && (
                <div className="modal-overlay" onClick={() => { setShowImportType(false); setPendingFile(null); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">What type of file is this?</h3>
                            <button className="modal-close" onClick={() => { setShowImportType(false); setPendingFile(null); }}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Select the type of statement you're importing:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ justifyContent: 'flex-start', padding: '1rem' }}
                                    onClick={() => handleImport('credit_card')}
                                >
                                    <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>💳</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '600' }}>Credit Card Statement</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            All transactions are expenses
                                        </div>
                                    </div>
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    style={{ justifyContent: 'flex-start', padding: '1rem' }}
                                    onClick={() => handleImport('bank')}
                                >
                                    <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>🏦</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '600' }}>Bank Account Statement</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Includes income and expenses
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
