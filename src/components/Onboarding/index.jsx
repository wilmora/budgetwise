import React, { useState } from 'react';
import Welcome from './Welcome';
import Reminders from './Reminders';
import Analytics from './Analytics';
import Tutorial from './Tutorial';

const STEPS = {
    WELCOME: 0,
    REMINDERS: 1,
    ANALYTICS: 2,
    TUTORIAL: 3,
    DONE: 4
};

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(STEPS.WELCOME);
    const [preferences, setPreferences] = useState({
        currencies: ['USD'],
        reminders: { enabled: false, frequency: null },
        analytics: { analyticsEnabled: true }
    });

    const handleWelcomeNext = (currencies) => {
        setPreferences(prev => ({ ...prev, currencies }));
        setStep(STEPS.REMINDERS);
    };

    const handleRemindersNext = (reminders) => {
        setPreferences(prev => ({ ...prev, reminders }));
        setStep(STEPS.ANALYTICS);
    };

    const handleAnalyticsNext = (analytics) => {
        setPreferences(prev => ({ ...prev, analytics }));
        setStep(STEPS.TUTORIAL);
    };

    const handleTutorialComplete = () => {
        // Save all preferences and complete onboarding
        onComplete(preferences);
    };

    const handleBack = () => {
        setStep(prev => Math.max(0, prev - 1));
    };

    switch (step) {
        case STEPS.WELCOME:
            return (
                <Welcome
                    onNext={handleWelcomeNext}
                    initialCurrencies={preferences.currencies}
                />
            );

        case STEPS.REMINDERS:
            return (
                <Reminders
                    onNext={handleRemindersNext}
                    onBack={handleBack}
                />
            );

        case STEPS.ANALYTICS:
            return (
                <Analytics
                    onNext={handleAnalyticsNext}
                    onBack={handleBack}
                />
            );

        case STEPS.TUTORIAL:
            return <Tutorial onComplete={handleTutorialComplete} />;

        default:
            return null;
    }
}
