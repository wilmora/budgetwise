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
