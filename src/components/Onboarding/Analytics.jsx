import React, { useState } from 'react';

export default function Analytics({ onNext, onBack }) {
    const [enabled, setEnabled] = useState(true);

    const handleNext = () => {
        onNext({ analyticsEnabled: enabled });
    };

    return (
        <div className="onboarding">
            <div className="onboarding-content">
                <h1 className="onboarding-title">Help Us Improve</h1>
                <p className="onboarding-subtitle">
                    Share anonymous usage data to help make BudgetWise better
                </p>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="settings-item" onClick={() => setEnabled(!enabled)}>
                        <div className="settings-item-content">
                            <div className="settings-item-icon">📊</div>
                            <div>
                                <div className="settings-item-label">Usage Analytics</div>
                                <div className="settings-item-desc">Send anonymous usage stats</div>
                            </div>
                        </div>
                        <div className={`toggle-switch ${enabled ? 'active' : ''}`} />
                    </div>
                </div>

                <div style={{
                    background: 'rgba(124, 92, 252, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-md)',
                    marginBottom: '1rem'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        <strong>🔒 Your privacy matters</strong><br />
                        We never collect personal financial data. Analytics help us understand how
                        features are used so we can improve the app. You can change this anytime in Settings.
                    </p>
                </div>
            </div>

            <div className="onboarding-footer">
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '1rem' }}
                        onClick={onBack}
                    >
                        Back
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 2, padding: '1rem' }}
                        onClick={handleNext}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
