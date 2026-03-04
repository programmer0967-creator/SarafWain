// Settings Context for user preferences
import { createContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings } from '../types';
import { storageService } from '../services/storageService';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  completeOnboarding: (settings: Partial<UserSettings>) => Promise<void>;
}

const defaultSettings: UserSettings = {
  name: '',
  currency: 'USD',
  language: 'en',
  theme: 'system',
  startingBalance: 0,
  onboardingCompleted: false,
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await storageService.getUserSettings();
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    await storageService.saveUserSettings(updatedSettings);
  };

  const completeOnboarding = async (onboardingSettings: Partial<UserSettings>) => {
    const updatedSettings = {
      ...settings,
      ...onboardingSettings,
      onboardingCompleted: true,
    };
    setSettings(updatedSettings);
    await storageService.saveUserSettings(updatedSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, completeOnboarding }}>
      {children}
    </SettingsContext.Provider>
  );
}
