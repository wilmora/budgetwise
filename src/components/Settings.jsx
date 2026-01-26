import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Upload, Download, Trash2, Moon, Sun, Bell, Wrench, BookOpen, RotateCcw, Smartphone, Info } from 'lucide-react';
import { getTransactions, saveTransactions, clearAllData, getSettings, saveSettings } from '../utils/storage';
import { parseCSV, downloadCSV } from '../utils/csvHandler';
import { suggestCategory } from '../utils/aiCategorizer';
import { SUPPORTED_CURRENCIES, getUserCurrency, setUserCurrency } from '../utils/currency';
import { requestNotificationPermission, areNotificationsEnabled, scheduleDailyReminder, cancelAllReminders } from '../utils/notifications';
import { isDiagnosticsEnabled, setDiagnosticsEnabled as setDiagEnabled, logEvent, EVENTS } from '../utils/diagnostics';

export default function Settings({ onUpdate, theme, onToggleTheme, onResetOnboarding, onReopenTutorial }) {
    const [settings, setSettings] = useState(() => getSettings());
    const [currentCurrency, setCurrentCurrency] = useState(() => getUserCurrency());
    const [importStatus, setImportStatus] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showImportType, setShowImportType] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const fileInputRef = useRef(null);

    const [remindersEnabled, setRemindersEnabled] = useState(() => {
        const stored = localStorage.getItem('budgetwise-reminders');
        return stored ? JSON.parse(stored).enabled : false;
    });
    const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(() => isDiagnosticsEnabled());

    const transactions = getTransactions();

    useEffect(() => {
        areNotificationsEnabled().then(enabled => {
            // Update state if needed
        });
    }, []);

    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value;
        setCurrentCurrency(newCurrency);
        setUserCurrency(newCurrency);
        logEvent(EVENTS.CURRENCY_CHANGE, { currency: newCurrency });
        onUpdate?.();
    };

    const handleRemindersToggle = async () => {
        if (!remindersEnabled) {
            const granted = await requestNotificationPermission();
            if (granted) {
                setRemindersEnabled(true);
                localStorage.setItem('budgetwise-reminders', JSON.stringify({ enabled: true }));
                await scheduleDailyReminder('20:00');
                showToast('success', 'Reminders enabled! Daily notifications at 8 PM.');
            } else {
                showToast('error', 'Please enable notifications in your browser settings.');
            }
        } else {
            setRemindersEnabled(false);
            localStorage.setItem('budgetwise-reminders', JSON.stringify({ enabled: false }));
            await cancelAllReminders();
            showToast('success', 'Reminders disabled');
        }
    };

    const handleDiagnosticsToggle = () => {
        const newValue = !diagnosticsEnabled;
        setDiagnosticsEnabled(newValue);
        setDiagEnabled(newValue);
        showToast('success', newValue ? 'Diagnostics enabled' : 'Diagnostics disabled');
    };

    const showToast = (type, message) => {
        setImportStatus({ type, message });
        setTimeout(() => setImportStatus(null), 3000);
    };

    const handleExport = () => {
        if (transactions.length === 0) {
            showToast('error', 'No transactions to export');
            return;
        }
        const filename = `budgetwise_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(transactions, filename);
        showToast('success', `Exported ${transactions.length} transactions`);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setShowImportType(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImport = async (importMode) => {
        setShowImportType(false);
        if (!pendingFile) return;
        showToast('loading', 'Importing...');

        try {
            const text = await pendingFile.text();
            const importedTransactions = parseCSV(text, importMode);
            const categorizedTransactions = importedTransactions.map(t => {
                if (t.category === 'other' && t.description) {
                    const suggestion = suggestCategory(t.description, t.amount, t.type);
                    if (suggestion.confidence >= 0.5) return { ...t, category: suggestion.category };
                }
                return t;
            });

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
            showToast('success', `Imported ${categorizedTransactions.length} transactions`);
            onUpdate?.();
        } catch (error) {
            showToast('error', `Import failed: ${error.message}`);
        }
        setPendingFile(null);
    };

    const handleClearData = () => {
        clearAllData();
        setShowClearConfirm(false);
        onUpdate?.();
        showToast('success', 'All data cleared');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your preferences and data</p>
            </div>

            {/* Toast Notification */}
            {importStatus && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${importStatus.type === 'success' ? 'bg-emerald-500 text-white' :
                        importStatus.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                    <span>{importStatus.type === 'success' ? '✓' : importStatus.type === 'error' ? '✕' : '⏳'}</span>
                    <span className="text-sm font-medium">{importStatus.message}</span>
                </div>
            )}

            {/* Main Grid - 2 columns on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">

                    {/* Data Management */}
                    <div className="settings-section-card">
                        <h3 className="settings-section-title">Data Management</h3>

                        <div className="settings-action" onClick={() => fileInputRef.current?.click()}>
                            <div className="settings-action-content">
                                <div className="settings-action-icon"><Upload size={20} /></div>
                                <div className="settings-action-text">
                                    <h4>Import CSV</h4>
                                    <p>Import transactions from your bank</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="settings-action-chevron" />
                        </div>
                        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />

                        <div className="settings-action" onClick={handleExport}>
                            <div className="settings-action-content">
                                <div className="settings-action-icon"><Download size={20} /></div>
                                <div className="settings-action-text">
                                    <h4>Export CSV</h4>
                                    <p>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} available</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="settings-action-chevron" />
                        </div>

                        <div className="settings-action settings-action-danger" onClick={() => setShowClearConfirm(true)}>
                            <div className="settings-action-content">
                                <div className="settings-action-icon"><Trash2 size={20} /></div>
                                <div className="settings-action-text">
                                    <h4>Clear All Data</h4>
                                    <p>Delete transactions and settings</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="settings-action-chevron" />
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="settings-section-card">
                        <h3 className="settings-section-title">Appearance</h3>

                        <div className="settings-action">
                            <div className="settings-action-content">
                                <div className="settings-action-icon">{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}</div>
                                <div className="settings-action-text">
                                    <h4>Theme</h4>
                                    <p>Choose your preferred look</p>
                                </div>
                            </div>
                            <div className="theme-picker">
                                <button className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => theme !== 'light' && onToggleTheme()}>Light</button>
                                <button className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => theme !== 'dark' && onToggleTheme()}>Dark</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Preferences */}
                    <div className="settings-section-card">
                        <h3 className="settings-section-title">Preferences</h3>

                        <div className="settings-action">
                            <div className="settings-action-content">
                                <div className="settings-action-icon">💱</div>
                                <div className="settings-action-text">
                                    <h4>Currency</h4>
                                    <p>Display format for money</p>
                                </div>
                            </div>
                            <select value={currentCurrency} onChange={handleCurrencyChange} className="select-premium">
                                {SUPPORTED_CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                                ))}
                            </select>
                        </div>

                        <div className="settings-action" onClick={handleRemindersToggle}>
                            <div className="settings-action-content">
                                <div className="settings-action-icon"><Bell size={20} /></div>
                                <div className="settings-action-text">
                                    <h4>Daily Reminders</h4>
                                    <p>Get notified at 8 PM to log expenses</p>
                                </div>
                            </div>
                            <div className={`toggle-premium ${remindersEnabled ? 'active' : ''}`} />
                        </div>

                        <div className="settings-action" onClick={handleDiagnosticsToggle}>
                            <div className="settings-action-content">
                                <div className="settings-action-icon"><Wrench size={20} /></div>
                                <div className="settings-action-text">
                                    <h4>Diagnostics</h4>
                                    <p>Store usage events locally</p>
                                </div>
                            </div>
                            <div className={`toggle-premium ${diagnosticsEnabled ? 'active' : ''}`} />
                        </div>
                    </div>

                    {/* Help & Support */}
                    <div className="settings-section-card">
                        <h3 className="settings-section-title">Help & Support</h3>

                        <div className="settings-action" onClick={onReopenTutorial}>
                            <div className="settings-action-content">
                                <div className="settings-action-icon"><BookOpen size={20} /></div>
                                <div className="settings-action-text">
                                    <h4>How It Works</h4>
                                    <p>View the app tutorial again</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="settings-action-chevron" />
                        </div>

                        <div className="settings-action" onClick={onResetOnboarding}>
                            <div className="settings-action-content">
                                <div className="settings-action-icon"><RotateCcw size={20} /></div>
                                <div className="settings-action-text">
                                    <h4>Redo Setup</h4>
                                    <p>Go through onboarding again</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="settings-action-chevron" />
                        </div>
                    </div>

                    {/* About */}
                    <div className="settings-section-card about-card">
                        <div className="about-logo">💰</div>
                        <h3 className="about-name">BudgetWise</h3>
                        <p className="about-tagline">Smart Budget Tracker</p>
                        <p className="about-version">Version 2.0.0</p>
                    </div>
                </div>
            </div>

            {/* Install PWA Banner */}
            <div className="settings-section-card flex items-center gap-4 p-4">
                <div className="settings-action-icon flex-shrink-0"><Smartphone size={20} /></div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Install BudgetWise</h4>
                    <p className="text-xs text-gray-500">Add to home screen for the best experience</p>
                </div>
                <Info size={16} className="text-gray-400" />
            </div>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clear All Data?</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">This will permanently delete all your transactions, budgets, and settings. This action cannot be undone.</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                            <button className="flex-1 py-2.5 text-gray-600 font-medium" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                            <button className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl" onClick={handleClearData}>Delete Everything</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Type Modal */}
            {showImportType && (
                <div className="modal-overlay" onClick={() => { setShowImportType(false); setPendingFile(null); }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">What type of file?</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <button className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleImport('credit_card')}>
                                <span className="text-2xl">💳</span>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 dark:text-white">Credit Card</div>
                                    <div className="text-xs text-gray-500">All transactions are expenses</div>
                                </div>
                            </button>
                            <button className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleImport('bank')}>
                                <span className="text-2xl">🏦</span>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 dark:text-white">Bank Account</div>
                                    <div className="text-xs text-gray-500">Includes income and expenses</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
