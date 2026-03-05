// Budget service for budget calculations and recommendations
import { startOfMonth, endOfMonth, subMonths, differenceInMonths } from 'date-fns';
import { Budget, Transaction, Category, BudgetRecommendation, BudgetAlert } from '../types';

export const budgetService = {
  // Calculate spent amount for a budget period
  calculateSpent(
    transactions: Transaction[],
    categoryId: string,
    period: 'monthly' | 'yearly'
  ): number {
    const now = new Date();
    const start = period === 'monthly' ? startOfMonth(now) : new Date(now.getFullYear(), 0, 1);
    const end = period === 'monthly' ? endOfMonth(now) : new Date(now.getFullYear(), 11, 31);

    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === categoryId &&
          tDate >= start &&
          tDate <= end
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  },

  // Generate smart budget recommendations based on spending history
  generateRecommendations(
    transactions: Transaction[],
    categories: Category[],
    existingBudgets: Budget[]
  ): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];
    const expenseCategories = categories.filter(c => c.type === 'expense');

    expenseCategories.forEach(category => {
      // Skip if budget already exists
      const existingBudget = existingBudgets.find(b => b.categoryId === category.id);
      if (existingBudget) return;

      // Calculate average spending over last 3 months
      const monthlySpending = this.getMonthlySpending(transactions, category.id, 3);
      
      if (monthlySpending.length === 0) return;

      const avgSpending = monthlySpending.reduce((sum, m) => sum + m.amount, 0) / monthlySpending.length;
      const maxSpending = Math.max(...monthlySpending.map(m => m.amount));
      const minSpending = Math.min(...monthlySpending.map(m => m.amount));

      // Calculate variance to determine confidence
      const variance = maxSpending - minSpending;
      const coefficient = avgSpending > 0 ? variance / avgSpending : 0;

      let confidence: 'high' | 'medium' | 'low';
      let suggestedLimit: number;
      let reason: string;

      if (coefficient < 0.3) {
        // Low variance - high confidence
        confidence = 'high';
        suggestedLimit = Math.ceil(avgSpending * 1.1); // 10% buffer
        reason = 'Consistent spending pattern detected';
      } else if (coefficient < 0.6) {
        // Medium variance
        confidence = 'medium';
        suggestedLimit = Math.ceil(maxSpending * 1.05); // 5% above max
        reason = 'Moderate spending variation';
      } else {
        // High variance - low confidence
        confidence = 'low';
        suggestedLimit = Math.ceil(maxSpending * 1.15); // 15% above max
        reason = 'High spending variation detected';
      }

      recommendations.push({
        categoryId: category.id,
        categoryName: category.name,
        currentSpending: avgSpending,
        suggestedLimit,
        reason,
        confidence,
      });
    });

    // Sort by current spending (highest first)
    return recommendations.sort((a, b) => b.currentSpending - a.currentSpending);
  },

  // Get monthly spending for a category over N months
  getMonthlySpending(
    transactions: Transaction[],
    categoryId: string,
    months: number
  ): Array<{ month: string; amount: number }> {
    const result: Array<{ month: string; amount: number }> = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const amount = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return (
            t.type === 'expense' &&
            t.category === categoryId &&
            tDate >= start &&
            tDate <= end
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        month: start.toISOString(),
        amount,
      });
    }

    return result.reverse();
  },

  // Calculate rollover amount from previous period
  calculateRollover(
    budget: Budget,
    previousPeriodSpent: number
  ): number {
    if (!budget.rolloverEnabled) return 0;

    const unused = Math.max(0, budget.limit - previousPeriodSpent);
    return unused;
  },

  // Check if budget should trigger an alert
  checkBudgetAlert(
    budget: Budget,
    warningThreshold: number,
    criticalThreshold: number
  ): BudgetAlert | null {
    const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

    if (percentage >= criticalThreshold) {
      return {
        id: `alert_${budget.id}_${Date.now()}`,
        budgetId: budget.id,
        categoryId: budget.categoryId,
        type: 'exceeded',
        percentage,
        timestamp: new Date().toISOString(),
        dismissed: false,
      };
    } else if (percentage >= warningThreshold) {
      return {
        id: `alert_${budget.id}_${Date.now()}`,
        budgetId: budget.id,
        categoryId: budget.categoryId,
        type: 'warning',
        percentage,
        timestamp: new Date().toISOString(),
        dismissed: false,
      };
    } else if (percentage >= warningThreshold - 10) {
      return {
        id: `alert_${budget.id}_${Date.now()}`,
        budgetId: budget.id,
        categoryId: budget.categoryId,
        type: 'approaching',
        percentage,
        timestamp: new Date().toISOString(),
        dismissed: false,
      };
    }

    return null;
  },

  // Get budget vs actual data for charts
  getBudgetVsActual(
    budgets: Budget[],
    categories: Category[]
  ): Array<{ category: string; budget: number; actual: number; percentage: number }> {
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

      return {
        category: category?.name || 'Unknown',
        budget: budget.limit,
        actual: budget.spent,
        percentage: Math.min(percentage, 100),
      };
    });
  },

  // Calculate total budget utilization
  calculateTotalUtilization(budgets: Budget[]): {
    totalBudget: number;
    totalSpent: number;
    percentage: number;
    remaining: number;
  } {
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = Math.max(0, totalBudget - totalSpent);

    return { totalBudget, totalSpent, percentage, remaining };
  },

  // Reset budgets for new period (handle rollover)
  resetBudgetsForNewPeriod(
    budgets: Budget[],
    transactions: Transaction[]
  ): Budget[] {
    return budgets.map(budget => {
      let rolloverAmount = 0;

      if (budget.rolloverEnabled) {
        // Calculate previous period spending
        const previousPeriodSpent = budget.spent;
        rolloverAmount = this.calculateRollover(budget, previousPeriodSpent);
      }

      // Calculate new period spending
      const newSpent = this.calculateSpent(transactions, budget.categoryId, budget.period);

      return {
        ...budget,
        spent: newSpent,
        rolloverAmount,
        limit: budget.limit + rolloverAmount,
        updatedAt: new Date().toISOString(),
      };
    });
  },
};
