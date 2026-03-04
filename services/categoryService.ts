// Category service for default categories
import { Category } from '../types';

export const defaultCategories: Category[] = [
  // Income categories
  { id: 'income_salary', name: 'salary', type: 'income', icon: 'payments', color: '#10b981', isDefault: true },
  { id: 'income_freelance', name: 'freelance', type: 'income', icon: 'laptop-mac', color: '#3b82f6', isDefault: true },
  { id: 'income_business', name: 'business', type: 'income', icon: 'business-center', color: '#8b5cf6', isDefault: true },
  { id: 'income_gift', name: 'gift', type: 'income', icon: 'card-giftcard', color: '#ec4899', isDefault: true },
  { id: 'income_investment', name: 'investment', type: 'income', icon: 'trending-up', color: '#14b8a6', isDefault: true },
  { id: 'income_other', name: 'otherIncome', type: 'income', icon: 'add-circle', color: '#6b7280', isDefault: true },
  
  // Expense categories
  { id: 'expense_food', name: 'food', type: 'expense', icon: 'restaurant', color: '#f59e0b', isDefault: true },
  { id: 'expense_transport', name: 'transport', type: 'expense', icon: 'directions-car', color: '#3b82f6', isDefault: true },
  { id: 'expense_rent', name: 'rent', type: 'expense', icon: 'home', color: '#8b5cf6', isDefault: true },
  { id: 'expense_bills', name: 'bills', type: 'expense', icon: 'receipt', color: '#ef4444', isDefault: true },
  { id: 'expense_shopping', name: 'shopping', type: 'expense', icon: 'shopping-cart', color: '#ec4899', isDefault: true },
  { id: 'expense_entertainment', name: 'entertainment', type: 'expense', icon: 'movie', color: '#a855f7', isDefault: true },
  { id: 'expense_health', name: 'health', type: 'expense', icon: 'local-hospital', color: '#10b981', isDefault: true },
  { id: 'expense_other', name: 'otherExpense', type: 'expense', icon: 'more-horiz', color: '#6b7280', isDefault: true },
];

export const categoryService = {
  getDefaultCategories() {
    return defaultCategories;
  },

  getCategoryById(id: string, categories: Category[]) {
    return categories.find(cat => cat.id === id);
  },

  getCategoryByName(name: string, categories: Category[]) {
    return categories.find(cat => cat.name === name);
  },

  getIncomeCategories(categories: Category[]) {
    return categories.filter(cat => cat.type === 'income');
  },

  getExpenseCategories(categories: Category[]) {
    return categories.filter(cat => cat.type === 'expense');
  },
};
