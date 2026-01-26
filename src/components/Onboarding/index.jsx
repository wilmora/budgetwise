import React, { useState } from 'react';

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
];

const REMINDER_OPTIONS = [
    { id: 'none', label: 'No reminders' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
];

export default function Onboarding({ onComplete }) {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [reminderFrequency, setReminderFrequency] = useState('none');
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

    const handleComplete = () => {
        onComplete({
            currencies: [selectedCurrency],
            reminders: {
                enabled: reminderFrequency !== 'none',
                frequency: reminderFrequency !== 'none' ? reminderFrequency : null
            },
            analytics: { analyticsEnabled }
        });
    };

    return (
        <div className="onboarding">
            <div className="onboarding-content" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
                {/* Logo & Welcome */}
                <div className="onboarding-logo">💰</div>

                <h1 className="onboarding-title">Welcome to BudgetWise</h1>
                <p className="onboarding-subtitle">
                    Let's set up your preferences to get started
                </p>

                {/* Section 1: Currency Selection */}
                <div className="setup-section">
                    <h3 className="setup-section__title">
                        <span className="setup-section__number">1</span>
                        Select your currency
                    </h3>
                    <div className="currency-grid-compact">
                        {CURRENCIES.map(currency => (
                            <button
                                key={currency.code}
                                type="button"
                                className={`currency-chip ${selectedCurrency === currency.code ? 'selected' : ''}`}
                                onClick={() => setSelectedCurrency(currency.code)}
                            >
                                <span className="currency-chip__flag">{currency.flag}</span>
                                <span className="currency-chip__code">{currency.code}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 2: Reminders */}
                <div className="setup-section">
                    <h3 className="setup-section__title">
                        <span className="setup-section__number">2</span>
                        Budget reminders
                    </h3>
                    <div className="reminder-pills">
                        {REMINDER_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                type="button"
                                className={`reminder-pill ${reminderFrequency === option.id ? 'selected' : ''}`}
                                onClick={() => setReminderFrequency(option.id)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 3: Analytics */}
                <div className="setup-section">
                    <h3 className="setup-section__title">
                        <span className="setup-section__number">3</span>
                        Help improve BudgetWise
                    </h3>
                    <label className="analytics-toggle">
                        <div className="analytics-toggle__content">
                            <span className="analytics-toggle__text">
                                Share anonymous usage data
                            </span>
                            <span className="analytics-toggle__hint">
                                No financial data is ever collected
                            </span>
                        </div>
                        <button
                            type="button"
                            className={`toggle-switch ${analyticsEnabled ? 'active' : ''}`}
                            onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                            aria-pressed={analyticsEnabled}
                        />
                    </label>
                </div>
            </div>

            {/* Footer */}
            <div className="onboarding-footer">
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleComplete}
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}
