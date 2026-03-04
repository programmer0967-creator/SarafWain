// Hook for financial analytics
import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useSettings } from './useSettings';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics() {
  const { transactions } = useTransactions();
  const { settings } = useSettings();

  const analysis = useMemo(() => {
    return analyticsService.calculateFinancialAnalysis(
      transactions,
      settings.startingBalance
    );
  }, [transactions, settings.startingBalance]);

  const categorySpending = useMemo(() => {
    return analyticsService.getCategorySpending(transactions, 'expense');
  }, [transactions]);

  const weeklyReport = useMemo(() => {
    return analyticsService.getWeeklyReport(transactions);
  }, [transactions]);

  return {
    analysis,
    categorySpending,
    weeklyReport,
  };
}
