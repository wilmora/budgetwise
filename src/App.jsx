import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import { AppLayout } from './components/layout/AppLayout';
import { ToastProvider } from './components/ui/Toast';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';

function App() {
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem('budgetwise-onboarding-completed');
    });
    const [showTutorial, setShowTutorial] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
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

    const handleAddClick = () => {
        // Navigate to transactions tab and trigger add modal
        setActiveTab('transactions');
        setShowAddModal(true);
    };

    // Show onboarding for first-time users
    if (showOnboarding) {
        return (
            <ToastProvider>
                <Onboarding onComplete={handleOnboardingComplete} />
            </ToastProvider>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard key={refreshKey} />;
            case 'transactions':
                return (
                    <Transactions
                        key={refreshKey}
                        onUpdate={handleUpdate}
                        showAddModal={showAddModal}
                        onCloseAddModal={() => setShowAddModal(false)}
                    />
                );
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
        <ToastProvider>
            {/* Tutorial Overlay */}
            <Modal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                size="md"
                showClose={false}
            >
                <TutorialContent onComplete={() => setShowTutorial(false)} />
            </Modal>

            {/* Main App Layout */}
            <AppLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onAddClick={handleAddClick}
            >
                {renderContent()}
            </AppLayout>
        </ToastProvider>
    );
}

// Tutorial Content component
function TutorialContent({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        { icon: '📊', title: 'Track Your Spending', text: 'Import transactions or add them manually to see where your money goes.' },
        { icon: '🎯', title: 'Set Budget Goals', text: 'Create monthly budgets for each category and get alerts when approaching limits.' },
        { icon: '💡', title: 'Get Smart Insights', text: 'AI analyzes your spending patterns and suggests ways to save more.' },
        { icon: '📸', title: 'Scan Receipts', text: 'Take a photo of receipts to automatically create expense entries.' }
    ];
    const slide = slides[currentSlide];
    const isLast = currentSlide === slides.length - 1;

    return (
        <div className="onboarding-card" style={{ padding: 0, border: 'none', boxShadow: 'none' }}>
            <div className="onboarding-icon">{slide.icon}</div>
            <h2 className="onboarding-title">{slide.title}</h2>
            <p className="onboarding-text">{slide.text}</p>

            <div className="onboarding-progress">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`onboarding-dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                        style={{ cursor: 'pointer' }}
                    />
                ))}
            </div>

            <div className="flex gap-4 justify-center" style={{ marginTop: 'var(--space-6)' }}>
                <Button variant="secondary" onClick={onComplete}>Skip</Button>
                <Button
                    variant="primary"
                    onClick={() => isLast ? onComplete() : setCurrentSlide(c => c + 1)}
                >
                    {isLast ? 'Get Started' : 'Next'}
                </Button>
            </div>
        </div>
    );
}

export default App;
