// Language Context for i18n support
import { createContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import { translations, TranslationKey } from '../constants/translations';
import { storageService } from '../services/storageService';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const settings = await storageService.getUserSettings();
    if (settings?.language) {
      setLanguageState(settings.language);
      setIsRTL(settings.language === 'ar');
    }
  };

  const setLanguage = async (lang: Language) => {
    const needsReload = (lang === 'ar') !== isRTL;

    const settings = await storageService.getUserSettings();
    await storageService.saveUserSettings({
      ...settings,
      language: lang,
    });

    setLanguageState(lang);
    setIsRTL(lang === 'ar');

    if (needsReload && I18nManager.isRTL !== (lang === 'ar')) {
      I18nManager.forceRTL(lang === 'ar');
      if (!__DEV__) {
        Updates.reloadAsync();
      }
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}
