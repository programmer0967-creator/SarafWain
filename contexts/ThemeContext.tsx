// Theme Context for dark/light mode
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../constants/theme';
import { storageService } from '../services/storageService';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const loadTheme = async () => {
    const settings = await storageService.getUserSettings();
    if (settings?.theme) {
      setThemeModeState(settings.theme);
      if (settings.theme === 'light') {
        setIsDark(false);
      } else if (settings.theme === 'dark') {
        setIsDark(true);
      }
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    const settings = await storageService.getUserSettings();
    await storageService.saveUserSettings({
      ...settings,
      theme: mode,
    });

    setThemeModeState(mode);

    if (mode === 'light') {
      setIsDark(false);
    } else if (mode === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(systemColorScheme === 'dark');
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
