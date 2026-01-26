/**
 * Notifications Utility
 * Handles reminders for web (PWA notifications) and Android (Capacitor LocalNotifications)
 */

// Check if we're running in Capacitor
const isCapacitor = typeof window !== 'undefined' && window.Capacitor?.isNative;

/**
 * Request notification permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestNotificationPermission() {
    try {
        if (isCapacitor) {
            // Capacitor LocalNotifications
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const result = await LocalNotifications.requestPermissions();
            return result.display === 'granted';
        } else {
            // Web Notifications API
            if (!('Notification' in window)) {
                console.warn('Notifications not supported');
                return false;
            }

            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
    } catch (error) {
        console.error('Permission request failed:', error);
        return false;
    }
}

/**
 * Check if notifications are enabled
 * @returns {Promise<boolean>} Whether notifications are enabled
 */
export async function areNotificationsEnabled() {
    try {
        if (isCapacitor) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const status = await LocalNotifications.checkPermissions();
            return status.display === 'granted';
        } else {
            return 'Notification' in window && Notification.permission === 'granted';
        }
    } catch {
        return false;
    }
}

/**
 * Schedule a reminder notification
 * @param {Object} options - Reminder options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Date} options.at - When to show the notification
 * @param {number} options.id - Unique ID for this notification
 */
export async function scheduleReminder({ title, body, at, id }) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        throw new Error('Notification permission not granted');
    }

    try {
        if (isCapacitor) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id,
                        title,
                        body,
                        schedule: { at },
                        actionTypeId: 'reminder',
                        extra: { type: 'reminder' },
                    },
                ],
            });
        } else {
            // For web, we use setTimeout as a simple fallback
            // In a production app, you'd use a service worker
            const delay = at.getTime() - Date.now();
            if (delay > 0) {
                setTimeout(() => {
                    new Notification(title, { body });
                }, delay);
            }
        }
    } catch (error) {
        console.error('Failed to schedule reminder:', error);
        throw error;
    }
}

/**
 * Cancel all scheduled reminders
 */
export async function cancelAllReminders() {
    try {
        if (isCapacitor) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({
                    notifications: pending.notifications.map(n => ({ id: n.id }))
                });
            }
        }
        // For web, we'd need to track scheduled timeouts, which is complex
    } catch (error) {
        console.error('Failed to cancel reminders:', error);
    }
}

/**
 * Schedule daily spending reminder
 * @param {string} time - Time in HH:MM format (e.g., "20:00")
 */
export async function scheduleDailyReminder(time) {
    const [hours, minutes] = time.split(':').map(Number);

    // Schedule for each of the next 7 days
    const now = new Date();

    for (let i = 1; i <= 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        date.setHours(hours, minutes, 0, 0);

        await scheduleReminder({
            id: 1000 + i,
            title: '💰 BudgetWise',
            body: 'Don\'t forget to log your expenses today!',
            at: date,
        });
    }
}

/**
 * Show an in-app reminder toast/banner (for when permissions are denied)
 * @param {Function} showToast - Toast function from useToast hook
 */
export function showInAppReminder(showToast) {
    showToast('Remember to log your expenses today!', 'info', 5000);
}

export default {
    requestNotificationPermission,
    areNotificationsEnabled,
    scheduleReminder,
    cancelAllReminders,
    scheduleDailyReminder,
    showInAppReminder,
};
