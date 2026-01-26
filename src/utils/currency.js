/**
 * Currency utility functions
 * Handles all currency formatting using user's preference
 */

// Supported currencies with symbols and locale info
export const SUPPORTED_CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
];

// Storage key for currency preference
const CURRENCY_STORAGE_KEY = 'budgetwise-currencies';
const DEFAULT_CURRENCY = 'USD';

/**
 * Get the user's preferred currency code
 * @returns {string} Currency code (e.g., 'USD', 'CAD', 'EUR')
 */
export function getUserCurrency() {
    try {
        const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (stored) {
            const currencies = JSON.parse(stored);
            // Return the first (primary) currency
            if (Array.isArray(currencies) && currencies.length > 0) {
                return currencies[0];
            }
        }
    } catch (e) {
        console.error('Error reading currency preference:', e);
    }
    return DEFAULT_CURRENCY;
}

/**
 * Set the user's preferred currency
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 */
export function setUserCurrency(currencyCode) {
    try {
        // Store as array for backwards compatibility with onboarding
        localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify([currencyCode]));
    } catch (e) {
        console.error('Error saving currency preference:', e);
    }
}

/**
 * Get currency info by code
 * @param {string} code - Currency code
 * @returns {Object|null} Currency info object
 */
export function getCurrencyInfo(code) {
    return SUPPORTED_CURRENCIES.find(c => c.code === code) || null;
}

/**
 * Format an amount using the user's currency preference
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Override currency code
 * @param {boolean} options.showDecimals - Whether to show decimal places
 * @param {boolean} options.compact - Use compact notation for large numbers
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, options = {}) {
    const currencyCode = options.currency || getUserCurrency();
    const currencyInfo = getCurrencyInfo(currencyCode) || SUPPORTED_CURRENCIES[0];

    const formatOptions = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: options.showDecimals !== false ? 2 : 0,
        maximumFractionDigits: options.showDecimals !== false ? 2 : 0,
    };

    // Use compact notation for large numbers if requested
    if (options.compact && Math.abs(amount) >= 10000) {
        formatOptions.notation = 'compact';
        formatOptions.compactDisplay = 'short';
    }

    try {
        return new Intl.NumberFormat(currencyInfo.locale, formatOptions).format(amount);
    } catch (e) {
        // Fallback if locale is not supported
        return new Intl.NumberFormat('en-US', formatOptions).format(amount);
    }
}

/**
 * Format amount without decimals (for display in summaries)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string without decimals
 */
export function formatCurrencyCompact(amount) {
    return formatCurrency(amount, { showDecimals: false, compact: true });
}

/**
 * Get just the currency symbol
 * @param {string} currencyCode - Optional currency code, uses user preference if not provided
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currencyCode) {
    const code = currencyCode || getUserCurrency();
    const info = getCurrencyInfo(code);
    return info?.symbol || '$';
}

/**
 * Parse a currency string to a number
 * @param {string} value - The string to parse
 * @returns {number} Parsed number or 0 if invalid
 */
export function parseCurrencyInput(value) {
    if (!value) return 0;

    // Remove currency symbols and formatting
    const cleaned = value.toString()
        .replace(/[^\d.-]/g, '')
        .replace(/,/g, '');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

export default formatCurrency;
