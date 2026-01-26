import React, { useState, useEffect } from 'react';
import { getDailyInsight } from '../utils/aiService';

const AIInsights = () => {
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(true);
    const [animating, setAnimating] = useState(false);

    const fetchInsight = async () => {
        setLoading(true);
        setAnimating(true);
        try {
            const data = await getDailyInsight();
            setInsight(data);
        } catch (error) {
            console.error("Failed to fetch insight:", error);
            setInsight("Unable to load insights at this moment.");
        } finally {
            setLoading(false);
            setTimeout(() => setAnimating(false), 500);
        }
    };

    useEffect(() => {
        fetchInsight();
    }, []);

    // Determine insight type for icon
    const getInsightType = () => {
        if (insight.toLowerCase().includes('alert') || insight.toLowerCase().includes('warning')) return 'warning';
        if (insight.toLowerCase().includes('trend') || insight.toLowerCase().includes('up')) return 'trend';
        return 'tip';
    };

    const insightType = getInsightType();

    return (
        <div className="ai-insights-card">
            {/* Header with inline sparkle */}
            <div className="ai-insights-card__header">
                <div className="ai-insights-card__title-row">
                    <span className="ai-insights-card__sparkle">✨</span>
                    <h3 className="ai-insights-card__title">AI Insights</h3>
                </div>
                <button
                    onClick={fetchInsight}
                    disabled={loading}
                    className={`ai-insights-card__refresh ${animating ? 'spinning' : ''}`}
                    title="Refresh Insight"
                    aria-label="Refresh insight"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21h5v-5" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="ai-insights-card__content">
                {loading ? (
                    <div className="ai-insights-card__skeleton">
                        <div className="skeleton-line skeleton-line--long" />
                        <div className="skeleton-line skeleton-line--medium" />
                    </div>
                ) : (
                    <div className="ai-insights-card__message">
                        <span className={`ai-insights-card__icon ai-insights-card__icon--${insightType}`}>
                            {insightType === 'warning' ? '⚠️' : insightType === 'trend' ? '📈' : '💡'}
                        </span>
                        <p className="ai-insights-card__text">{insight}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsights;
