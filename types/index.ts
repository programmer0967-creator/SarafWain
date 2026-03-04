// Type definitions

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

export interface UserSettings {
  name: string;
  currency: string;
  language: 'en' | 'ar';
  theme: 'light' | 'dark' | 'system';
  startingBalance: number;
  onboardingCompleted: boolean;
}

export interface FinancialAnalysis {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  avgDailySpending: number;
  burnRate: number;
  estimatedSafeDays: number;
  financialHealth: 'healthy' | 'warning' | 'critical';
  savingsRate: number;
  spendingVelocity: number;
  projectionEndMonth: number;
  topExpenseCategories: { category: string; amount: number; percentage: number }[];
}
