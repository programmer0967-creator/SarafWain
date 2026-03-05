// Budget Context for global budget state
import { createContext, useState, useEffect, ReactNode } from 'react';
import { Budget, BudgetSettings, BudgetAlert, BudgetRecommendation } from '../types';
import { storageService } from '../services/storageService';
import { budgetService } from '../services/budgetService';
import { notificationService } from '../services/notificationService';
import { useTransactions } from '../hooks/useTransactions';
import { useLanguage } from '../hooks/useLanguage';

interface BudgetContextType {
  budgets: Budget[];
  budgetSettings: BudgetSettings;
  alerts: BudgetAlert[];
  recommendations: BudgetRecommendation[];
  addBudget: (budget: Omit<Budget, 'id' | 'spent' | 'rolloverAmount' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  loadBudgets: () => Promise<void>;
  generateRecommendations: () => void;
  refreshBudgets: () => Promise<void>;
}

export const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>({
    notificationsEnabled: true,
    warningThreshold: 80,
    criticalThreshold: 100,
    rolloverEnabled: false,
  });
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);

  const { transactions, categories } = useTransactions();
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Update budgets when transactions change
    if (transactions.length > 0 && budgets.length > 0) {
      updateBudgetSpending();
    }
  }, [transactions]);

  const loadData = async () => {
    const [loadedBudgets, loadedSettings, loadedAlerts] = await Promise.all([
      storageService.getBudgets(),
      storageService.getBudgetSettings(),
      storageService.getBudgetAlerts(),
    ]);

    setBudgets(loadedBudgets);
    setBudgetSettings(loadedSettings);
    setAlerts(loadedAlerts.filter(a => !a.dismissed));
  };

  const updateBudgetSpending = async () => {
    const updatedBudgets = budgets.map(budget => {
      const spent = budgetService.calculateSpent(transactions, budget.categoryId, budget.period);
      return { ...budget, spent };
    });

    setBudgets(updatedBudgets);
    await storageService.saveBudgets(updatedBudgets);

    // Check for alerts
    await checkBudgetAlerts(updatedBudgets);
  };

  const checkBudgetAlerts = async (currentBudgets: Budget[]) => {
    if (!budgetSettings.notificationsEnabled) return;

    const newAlerts: BudgetAlert[] = [];

    for (const budget of currentBudgets) {
      const alert = budgetService.checkBudgetAlert(
        budget,
        budgetSettings.warningThreshold,
        budgetSettings.criticalThreshold
      );

      if (alert) {
        // Check if we already have this alert
        const existingAlert = alerts.find(
          a => a.budgetId === alert.budgetId && a.type === alert.type
        );

        if (!existingAlert) {
          newAlerts.push(alert);

          // Send notification
          const category = categories.find(c => c.id === budget.categoryId);
          if (category) {
            await notificationService.sendBudgetAlert(alert, category.name, t);
          }
        }
      }
    }

    if (newAlerts.length > 0) {
      const updatedAlerts = [...alerts, ...newAlerts];
      setAlerts(updatedAlerts);
      await storageService.saveBudgetAlerts(updatedAlerts);
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'spent' | 'rolloverAmount' | 'createdAt' | 'updatedAt'>) => {
    const spent = budgetService.calculateSpent(transactions, budget.categoryId, budget.period);

    const newBudget: Budget = {
      ...budget,
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      spent,
      rolloverAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);
    await storageService.saveBudgets(updatedBudgets);

    // Check for immediate alerts
    await checkBudgetAlerts(updatedBudgets);
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const updatedBudgets = budgets.map(b =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    setBudgets(updatedBudgets);
    await storageService.saveBudgets(updatedBudgets);
  };

  const deleteBudget = async (id: string) => {
    const updatedBudgets = budgets.filter(b => b.id !== id);
    setBudgets(updatedBudgets);
    await storageService.saveBudgets(updatedBudgets);

    // Remove related alerts
    const updatedAlerts = alerts.filter(a => a.budgetId !== id);
    setAlerts(updatedAlerts);
    await storageService.saveBudgetAlerts(updatedAlerts);
  };

  const updateBudgetSettings = async (settings: Partial<BudgetSettings>) => {
    const newSettings = { ...budgetSettings, ...settings };
    setBudgetSettings(newSettings);
    await storageService.saveBudgetSettings(newSettings);

    // Request notification permissions if enabling
    if (settings.notificationsEnabled && !budgetSettings.notificationsEnabled) {
      await notificationService.requestPermissions();
    }
  };

  const dismissAlert = async (id: string) => {
    const updatedAlerts = alerts.map(a =>
      a.id === id ? { ...a, dismissed: true } : a
    );
    await storageService.saveBudgetAlerts(updatedAlerts);
    setAlerts(updatedAlerts.filter(a => !a.dismissed));
  };

  const loadBudgets = async () => {
    await loadData();
  };

  const generateRecommendations = () => {
    const recs = budgetService.generateRecommendations(transactions, categories, budgets);
    setRecommendations(recs);
  };

  const refreshBudgets = async () => {
    const resetBudgets = budgetService.resetBudgetsForNewPeriod(budgets, transactions);
    setBudgets(resetBudgets);
    await storageService.saveBudgets(resetBudgets);
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        budgetSettings,
        alerts,
        recommendations,
        addBudget,
        updateBudget,
        deleteBudget,
        updateBudgetSettings,
        dismissAlert,
        loadBudgets,
        generateRecommendations,
        refreshBudgets,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}
