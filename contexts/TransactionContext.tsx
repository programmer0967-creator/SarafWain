// Transaction Context for global transaction state
import { createContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Category } from '../types';
import { storageService } from '../services/storageService';
import { categoryService, defaultCategories } from '../services/categoryService';

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedTransactions, loadedCategories] = await Promise.all([
      storageService.getTransactions(),
      storageService.getCategories(),
    ]);

    setTransactions(loadedTransactions);
    
    if (!loadedCategories || loadedCategories.length === 0) {
      await storageService.saveCategories(defaultCategories);
      setCategories(defaultCategories);
    } else {
      setCategories(loadedCategories);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    await storageService.saveTransactions(updatedTransactions);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updatedTransactions = transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTransactions(updatedTransactions);
    await storageService.saveTransactions(updatedTransactions);
  };

  const deleteTransaction = async (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    await storageService.saveTransactions(updatedTransactions);
  };

  const loadTransactions = async () => {
    await loadData();
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await storageService.saveCategories(updatedCategories);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    setCategories(updatedCategories);
    await storageService.saveCategories(updatedCategories);
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    
    // Prevent deletion of default categories
    if (category?.isDefault) {
      throw new Error('Cannot delete default category');
    }

    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    await storageService.saveCategories(updatedCategories);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        loadTransactions,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
