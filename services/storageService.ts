// Storage service for AsyncStorage operations
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: '@sarafwain_transactions',
  CATEGORIES: '@sarafwain_categories',
  SAVINGS_GOALS: '@sarafwain_goals',
  USER_SETTINGS: '@sarafwain_settings',
};

export const storageService = {
  async getTransactions() {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  async saveTransactions(transactions: any[]) {
    try {
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return true;
    } catch (error) {
      console.error('Error saving transactions:', error);
      return false;
    }
  },

  async getCategories() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting categories:', error);
      return null;
    }
  },

  async saveCategories(categories: any[]) {
    try {
      await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  },

  async getSavingsGoals() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVINGS_GOALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting savings goals:', error);
      return [];
    }
  },

  async saveSavingsGoals(goals: any[]) {
    try {
      await AsyncStorage.setItem(KEYS.SAVINGS_GOALS, JSON.stringify(goals));
      return true;
    } catch (error) {
      console.error('Error saving savings goals:', error);
      return false;
    }
  },

  async getUserSettings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
  },

  async saveUserSettings(settings: any) {
    try {
      await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  },

  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.TRANSACTIONS,
        KEYS.CATEGORIES,
        KEYS.SAVINGS_GOALS,
        KEYS.USER_SETTINGS,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },
};
