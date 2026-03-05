// Storage service for AsyncStorage operations
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: '@sarafwain_transactions',
  CATEGORIES: '@sarafwain_categories',
  SAVINGS_GOALS: '@sarafwain_goals',
  USER_SETTINGS: '@sarafwain_settings',
  DISMISSED_WARNINGS: '@sarafwain_dismissed_warnings',
  FILTER_PRESETS: '@sarafwain_filter_presets',
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

  async getDismissedWarnings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.DISMISSED_WARNINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting dismissed warnings:', error);
      return {};
    }
  },

  async saveDismissedWarning(warningKey: string, timestamp: string) {
    try {
      const dismissed = await this.getDismissedWarnings();
      dismissed[warningKey] = timestamp;
      await AsyncStorage.setItem(KEYS.DISMISSED_WARNINGS, JSON.stringify(dismissed));
      return true;
    } catch (error) {
      console.error('Error saving dismissed warning:', error);
      return false;
    }
  },

  async clearDismissedWarnings() {
    try {
      await AsyncStorage.removeItem(KEYS.DISMISSED_WARNINGS);
      return true;
    } catch (error) {
      console.error('Error clearing dismissed warnings:', error);
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
        KEYS.DISMISSED_WARNINGS,
        KEYS.FILTER_PRESETS,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  async getFilterPresets() {
    try {
      const data = await AsyncStorage.getItem(KEYS.FILTER_PRESETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting filter presets:', error);
      return [];
    }
  },

  async saveFilterPreset(preset: any) {
    try {
      const presets = await this.getFilterPresets();
      const exists = presets.find((p: any) => p.id === preset.id);
      
      if (exists) {
        const updated = presets.map((p: any) => p.id === preset.id ? preset : p);
        await AsyncStorage.setItem(KEYS.FILTER_PRESETS, JSON.stringify(updated));
      } else {
        presets.push(preset);
        await AsyncStorage.setItem(KEYS.FILTER_PRESETS, JSON.stringify(presets));
      }
      return true;
    } catch (error) {
      console.error('Error saving filter preset:', error);
      return false;
    }
  },

  async deleteFilterPreset(id: string) {
    try {
      const presets = await this.getFilterPresets();
      const filtered = presets.filter((p: any) => p.id !== id);
      await AsyncStorage.setItem(KEYS.FILTER_PRESETS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting filter preset:', error);
      return false;
    }
  },
};
