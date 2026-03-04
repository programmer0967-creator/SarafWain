// Hook for budget warning management
import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { startOfMonth } from 'date-fns';

export function useBudgetWarnings() {
  const [dismissedWarnings, setDismissedWarnings] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDismissedWarnings();
  }, []);

  const loadDismissedWarnings = async () => {
    const warnings = await storageService.getDismissedWarnings();
    setDismissedWarnings(warnings);
  };

  const dismissWarning = async (warningLevel: 75 | 90) => {
    const monthKey = startOfMonth(new Date()).toISOString();
    const warningKey = `${monthKey}_${warningLevel}`;
    const timestamp = new Date().toISOString();
    
    await storageService.saveDismissedWarning(warningKey, timestamp);
    setDismissedWarnings(prev => ({
      ...prev,
      [warningKey]: timestamp,
    }));
  };

  const isWarningDismissed = (warningLevel: 75 | 90): boolean => {
    const monthKey = startOfMonth(new Date()).toISOString();
    const warningKey = `${monthKey}_${warningLevel}`;
    return !!dismissedWarnings[warningKey];
  };

  const shouldShowWarning = (burnRate: number): 75 | 90 | null => {
    if (burnRate >= 90 && !isWarningDismissed(90)) {
      return 90;
    }
    if (burnRate >= 75 && !isWarningDismissed(75)) {
      return 75;
    }
    return null;
  };

  return {
    dismissWarning,
    isWarningDismissed,
    shouldShowWarning,
  };
}
