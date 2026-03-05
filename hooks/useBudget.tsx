// Hook for accessing budget context
import { useContext } from 'react';
import { BudgetContext } from '../contexts/BudgetContext';

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
}
