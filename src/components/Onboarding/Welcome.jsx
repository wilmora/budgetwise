import React, { useState } from 'react';

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

export default function Welcome({ onNext, initialCurrencies = ['USD'] }) {
    const [selected, setSelected] = useState(initialCurrencies);

    const toggleCurrency = (code) => {
        setSelected(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const handleNext = () => {
        if (selected.length > 0) {
            onNext(selected);
        }
    };

    return (
        <div className="onboarding">
            <div className="onboarding-content">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="onboarding-logo">
                        💰
                    </div>
                </div>

                <h1 className="onboarding-title">Welcome to BudgetWise</h1>
                <p className="onboarding-subtitle">
                    Select the currencies you want to track
                </p>

                <div className="currency-grid">
                    {CURRENCIES.map(currency => (
                        <div
                            key={currency.code}
                            className={`currency-option ${selected.includes(currency.code) ? 'selected' : ''}`}
                            onClick={() => toggleCurrency(currency.code)}
                        >
                            <div className="currency-symbol">{currency.symbol}</div>
                            <div className="currency-info">
                                <div className="currency-code">{currency.code}</div>
                                <div className="currency-name">{currency.name}</div>
                            </div>
                            {selected.includes(currency.code) && (
                                <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="onboarding-footer">
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem' }}
                    onClick={handleNext}
                    disabled={selected.length === 0}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
