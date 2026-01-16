import React, { useState } from 'react';

export default function Reminders({ onNext, onBack }) {
    const [enabled, setEnabled] = useState(false);
    const [frequency, setFrequency] = useState('weekly');

    const handleNext = () => {
        onNext({ enabled, frequency: enabled ? frequency : null });
    };

    return (
        <div className="onboarding">
            <div className="onboarding-content">
                <h1 className="onboarding-title">Stay on Track</h1>
                <p className="onboarding-subtitle">
                    Would you like reminders to update your budget?
                </p>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="settings-item" onClick={() => setEnabled(!enabled)}>
                        <div className="settings-item-content">
                            <div className="settings-item-icon">🔔</div>
                            <div>
                                <div className="settings-item-label">Enable Reminders</div>
                                <div className="settings-item-desc">Get notified to log expenses</div>
                            </div>
                        </div>
                        <div className={`toggle-switch ${enabled ? 'active' : ''}`} />
                    </div>
                </div>

                {enabled && (
                    <div className="card">
                        <div className="settings-title">Frequency</div>

                        {['daily', 'weekly', 'monthly'].map(freq => (
                            <div
                                key={freq}
                                className="settings-item"
                                onClick={() => setFrequency(freq)}
                            >
                                <div className="settings-item-content">
                                    <div className="settings-item-icon">
                                        {freq === 'daily' ? '📅' : freq === 'weekly' ? '📆' : '🗓️'}
                                    </div>
                                    <div className="settings-item-label" style={{ textTransform: 'capitalize' }}>
                                        {freq}
                                    </div>
                                </div>
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: '2px solid var(--accent-primary)',
                                    background: frequency === freq ? 'var(--accent-primary)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.7rem'
                                }}>
                                    {frequency === freq && '✓'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
