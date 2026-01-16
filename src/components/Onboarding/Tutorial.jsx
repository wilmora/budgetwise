import React, { useState } from 'react';

const SLIDES = [
    {
        icon: '📊',
        title: 'Track Your Spending',
        text: 'Import transactions from your bank or add them manually. See where your money goes at a glance.'
    },
    {
        icon: '🎯',
        title: 'Set Budget Goals',
        text: 'Create budgets for different categories and get alerts when you\'re close to your limit.'
    },
    {
        icon: '💡',
        title: 'Get Smart Insights',
        text: 'Our AI analyzes your spending patterns and suggests ways to save more.'
    }
];

export default function Tutorial({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const slide = SLIDES[currentSlide];
    const isLast = currentSlide === SLIDES.length - 1;

    return (
        <div className="tutorial-overlay" onClick={onComplete}>
            <div className="tutorial-card" onClick={e => e.stopPropagation()}>
                <div className="tutorial-illustration">
                    {slide.icon}
                </div>

                <h2 className="tutorial-title">{slide.title}</h2>
                <p className="tutorial-text">{slide.text}</p>

                <div className="tutorial-dots">
                    {SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            className={`tutorial-dot ${idx === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(idx)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>

                <div className="tutorial-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onComplete}
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        Skip
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        {isLast ? 'Get Started' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
