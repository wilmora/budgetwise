/**
 * Diagnostics Utility
 * Lightweight local event logging when user opts in
 * No external tracking - all data stays on device
 */

const DIAGNOSTICS_KEY = 'budgetwise-diagnostics-events';
const ANALYTICS_PREF_KEY = 'budgetwise-analytics';

/**
 * Check if diagnostics are enabled
 * @returns {boolean} Whether diagnostics are enabled
 */
export function isDiagnosticsEnabled() {
    try {
        const pref = localStorage.getItem(ANALYTICS_PREF_KEY);
        if (pref) {
            const parsed = JSON.parse(pref);
            return parsed.enabled === true;
        }
    } catch {
        // Ignore parsing errors
    }
    return false;
}

/**
 * Enable/disable diagnostics
 * @param {boolean} enabled - Whether to enable diagnostics
 */
export function setDiagnosticsEnabled(enabled) {
    localStorage.setItem(ANALYTICS_PREF_KEY, JSON.stringify({ enabled }));

    if (!enabled) {
        clearEvents();
    }
}

/**
 * Log a diagnostic event (only if enabled)
 * @param {string} eventName - Name of the event
 * @param {Object} data - Optional event data
 */
export function logEvent(eventName, data = {}) {
    if (!isDiagnosticsEnabled()) {
        return;
    }

    try {
        const events = getEvents();
        events.push({
            event: eventName,
            data,
            timestamp: new Date().toISOString(),
        });

        // Keep only last 100 events to limit storage
        const recentEvents = events.slice(-100);
        localStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(recentEvents));
    } catch (error) {
        console.error('Failed to log event:', error);
    }
}

/**
 * Get all logged events
 * @returns {Array} Array of logged events
 */
export function getEvents() {
    try {
        const stored = localStorage.getItem(DIAGNOSTICS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Reset if corrupted
        localStorage.removeItem(DIAGNOSTICS_KEY);
    }
    return [];
}

/**
 * Clear all logged events
 */
export function clearEvents() {
    localStorage.removeItem(DIAGNOSTICS_KEY);
}

/**
 * Get diagnostics summary (for debugging)
 * @returns {Object} Summary of logged events
 */
export function getDiagnosticsSummary() {
    const events = getEvents();
    const eventCounts = {};

    events.forEach(e => {
        eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    return {
        totalEvents: events.length,
        eventTypes: eventCounts,
        firstEvent: events[0]?.timestamp,
        lastEvent: events[events.length - 1]?.timestamp,
    };
}

// Common event names
export const EVENTS = {
    APP_OPEN: 'app_open',
    TRANSACTION_ADD: 'transaction_add',
    TRANSACTION_DELETE: 'transaction_delete',
    TRANSACTION_IMPORT: 'transaction_import',
    BUDGET_SET: 'budget_set',
    RECEIPT_SCAN: 'receipt_scan',
    THEME_CHANGE: 'theme_change',
    CURRENCY_CHANGE: 'currency_change',
};

export default {
    isDiagnosticsEnabled,
    setDiagnosticsEnabled,
    logEvent,
    getEvents,
    clearEvents,
    getDiagnosticsSummary,
    EVENTS,
};
