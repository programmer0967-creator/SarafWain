// Type definitions
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
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

export interface Settings {
  name: string;
  currency: string;
  language: 'en' | 'ar';
  theme: 'light' | 'dark' | 'system';
  startingBalance: number;
  hasCompletedOnboarding: boolean;
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
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface TransactionFilter {
  searchQuery?: string;
  types?: Array<'income' | 'expense'>;
  categories?: string[];
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface FilterPreset {
  id: string;
  name: string;
  filter: TransactionFilter;
  createdAt: string;
}

export type QuickFilterType = 'all' | 'today' | 'week' | 'month' | 'year';

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dateFrom?: string;
  dateTo?: string;
  includeTransactions: boolean;
  includeAnalytics: boolean;
  includeCategoryBreakdown: boolean;
  includeCharts: boolean;
  filteredOnly?: boolean;
}

export interface ExportResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
  rolloverEnabled: boolean;
  rolloverAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSettings {
  notificationsEnabled: boolean;
  warningThreshold: number; // percentage (e.g., 80)
  criticalThreshold: number; // percentage (e.g., 100)
  rolloverEnabled: boolean;
}

export interface BudgetRecommendation {
  categoryId: string;
  categoryName: string;
  currentSpending: number;
  suggestedLimit: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  categoryId: string;
  type: 'warning' | 'exceeded' | 'approaching';
  percentage: number;
  timestamp: string;
  dismissed: boolean;
}
