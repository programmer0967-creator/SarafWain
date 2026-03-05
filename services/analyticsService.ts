// Analytics service for financial calculations
import { Transaction, FinancialAnalysis } from '../types';
import { startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export const analyticsService = {
  calculateAnalysis(
    transactions: Transaction[],
    categories: any[],
    startingBalance: number = 0
  ): FinancialAnalysis {
    return this.calculateFinancialAnalysis(transactions, startingBalance);
  },

  calculateFinancialAnalysis(
    transactions: Transaction[],
    startingBalance: number = 0
  ): FinancialAnalysis {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    const daysPassed = differenceInDays(now, monthStart) + 1;

    // Filter transactions for current month
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    // Calculate totals
    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const allTimeIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const allTimeExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = startingBalance + allTimeIncome - allTimeExpenses;

    // Calculate average daily spending
    const avgDailySpending = daysPassed > 0 ? totalExpenses / daysPassed : 0;

    // Calculate burn rate (percentage of income spent)
    const burnRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    // Calculate estimated safe days
    const estimatedSafeDays = avgDailySpending > 0 ? Math.floor(currentBalance / avgDailySpending) : 999;

    // Calculate financial health
    let financialHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (burnRate >= 90) {
      financialHealth = 'critical';
    } else if (burnRate >= 75) {
      financialHealth = 'warning';
    }

    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Calculate spending velocity (compared to expected spending)
    const expectedDailySpending = totalIncome / daysInMonth;
    const spendingVelocity = expectedDailySpending > 0 ? (avgDailySpending / expectedDailySpending) * 100 : 0;

    // Project balance at end of month
    const remainingDays = daysInMonth - daysPassed;
    const projectedExpenses = avgDailySpending * remainingDays;
    const projectionEndMonth = currentBalance - projectedExpenses;

    // Calculate top expense categories
    const categoryTotals = new Map<string, number>();
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryTotals.get(t.category) || 0;
        categoryTotals.set(t.category, current + t.amount);
      });

    const topExpenseCategories = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      avgDailySpending,
      burnRate,
      estimatedSafeDays,
      financialHealth,
      savingsRate,
      spendingVelocity,
      projectionEndMonth,
      topExpenseCategories,
    };
  },

  getCategorySpending(transactions: Transaction[], type: 'income' | 'expense') {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.type === type && tDate >= monthStart && tDate <= monthEnd;
    });

    const categoryTotals = new Map<string, number>();
    filtered.forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);
    });

    return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  },

  getWeeklyReport(transactions: Transaction[]) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= weekAgo && tDate <= now;
    });

    const income = weekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  },
};
