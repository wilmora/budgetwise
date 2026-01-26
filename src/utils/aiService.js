/**
 * AI Service Utility for BudgetWise
 * Handles interaction with LLM providers (e.g., Gemini, OpenAI)
 * Currently uses MOCK data for demonstration purposes
 */

const AI_CONFIG = {
    useMock: true, // Toggle this to false when real API is integrated
    apiKey: localStorage.getItem('budgetwise_ai_api_key') || '',
};

/**
 * Simulates an API call with a delay
 */
const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * MOCK: Analyze transaction and suggest category
 * @param {string} description - Transaction description (e.g., "Starbucks")
 * @param {number} amount - Transaction amount
 */
export async function suggestCategory(description, amount) {
    if (AI_CONFIG.useMock) {
        await simulateDelay(800);
        const lowerDesc = description.toLowerCase();

        if (lowerDesc.includes('uber') || lowerDesc.includes('lyft') || lowerDesc.includes('gas')) return { category: 'Transport', confidence: 0.95 };
        if (lowerDesc.includes('starbucks') || lowerDesc.includes('mcdonalds') || lowerDesc.includes('restaurant')) return { category: 'Food & Dining', confidence: 0.98 };
        if (lowerDesc.includes('grocery') || lowerDesc.includes('whole foods') || lowerDesc.includes('walmart')) return { category: 'Groceries', confidence: 0.90 };
        if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('cinema')) return { category: 'Entertainment', confidence: 0.92 };
        if (lowerDesc.includes('rent') || lowerDesc.includes('utility') || lowerDesc.includes('electric')) return { category: 'Housing', confidence: 0.99 };

        return { category: 'Shopping', confidence: 0.60 }; // Fallback
    }

    // Real API call would go here
    return { category: 'Uncategorized', confidence: 0.0 };
}

/**
 * MOCK: Generate budget suggestions based on spending history
 * @param {Array} transactions - List of recent transactions
 */
export async function generateBudgetSuggestions(transactions) {
    if (AI_CONFIG.useMock) {
        await simulateDelay(1500);

        return [
            {
                category: 'Food & Dining',
                currentSpend: 450,
                suggestedLimit: 400,
                reason: "You've spent 15% more on dining out this month compared to your 3-month average. Consider cooking at home more often.",
                action: 'Reduce by $50'
            },
            {
                category: 'Entertainment',
                currentSpend: 120,
                suggestedLimit: 100,
                reason: "Subscription costs have increased. You might have unused subscriptions.",
                action: 'Review subscriptions'
            },
            {
                category: 'Groceries',
                currentSpend: 320,
                suggestedLimit: 350,
                reason: "Grocery spending is consistent and within healthy range. Slight increase recommended for inflation.",
                action: 'Increase by $30'
            }
        ];
    }
    return [];
}

/**
 * MOCK: Generate a personalized financial insight/tip
 */
export async function getDailyInsight() {
    if (AI_CONFIG.useMock) {
        await simulateDelay(600);
        const tips = [
            "💡 Tip: You spend mostly on weekends. Try a 'No-Spend Sunday' challenge!",
            "🚀 Insight: Your savings rate is up 5% from last month. Keep it up!",
            "⚠️ Alert: You've used 80% of your Shopping budget with 10 days left.",
            "📉 Trend: Transport costs are lower this month. Great job walking more!",
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
    return "Track your spending to reach your goals!";
}

/**
 * Save API Key
 */
export function setApiKey(key) {
    AI_CONFIG.apiKey = key;
    localStorage.setItem('budgetwise_ai_api_key', key);
}
