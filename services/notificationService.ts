// Notification service for push notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BudgetAlert } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  },

  // Send budget alert notification
  async sendBudgetAlert(
    alert: BudgetAlert,
    categoryName: string,
    t: (key: string, params?: any) => string
  ): Promise<void> {
    const hasPermission = await this.areNotificationsEnabled();
    if (!hasPermission) return;

    let title: string;
    let body: string;

    switch (alert.type) {
      case 'exceeded':
        title = t('budgetExceeded');
        body = t('budgetExceededMsg', { 
          category: categoryName, 
          percentage: alert.percentage.toFixed(0) 
        });
        break;
      case 'warning':
        title = t('budgetWarningTitle');
        body = t('budgetWarningMsg', { 
          category: categoryName, 
          percentage: alert.percentage.toFixed(0) 
        });
        break;
      case 'approaching':
        title = t('budgetApproaching');
        body = t('budgetApproachingMsg', { 
          category: categoryName, 
          percentage: alert.percentage.toFixed(0) 
        });
        break;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { alertId: alert.id, budgetId: alert.budgetId },
        sound: true,
      },
      trigger: null, // Send immediately
    });
  },

  // Schedule monthly budget reset notification
  async scheduleBudgetResetReminder(t: (key: string) => string): Promise<void> {
    const hasPermission = await this.areNotificationsEnabled();
    if (!hasPermission) return;

    // Cancel existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for the 1st of next month
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('newBudgetPeriod'),
        body: t('newBudgetPeriodMsg'),
        sound: true,
      },
      trigger: {
        date: nextMonth,
        repeats: true,
      },
    });
  },

  // Cancel all notifications
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
