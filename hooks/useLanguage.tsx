// Hook for language management
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  // Enhanced translation function with variable interpolation
  const t = (key: string, variables?: Record<string, string | number>) => {
    let translation = context.t(key);
    
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{{${varKey}}}`, String(value));
      });
    }
    
    return translation;
  };

  return {
    ...context,
    t,
  };
}
