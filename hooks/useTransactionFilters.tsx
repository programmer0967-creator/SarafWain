// Hook for managing transaction filters
import { useState, useMemo } from 'react';
import { TransactionFilter, FilterPreset, QuickFilterType } from '../types';
import { filterService } from '../services/filterService';
import { storageService } from '../services/storageService';
import { useTransactions } from './useTransactions';

export function useTransactionFilters() {
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState<TransactionFilter>({
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets
  const loadPresets = async () => {
    const loaded = await storageService.getFilterPresets();
    setPresets(loaded);
  };

  // Apply filter
  const filteredTransactions = useMemo(() => {
    return filterService.applyFilter(transactions, filter);
  }, [transactions, filter]);

  // Update filter
  const updateFilter = (updates: Partial<TransactionFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  // Apply quick filter
  const applyQuickFilter = (type: QuickFilterType) => {
    if (type === 'all') {
      setFilter({ sortBy: 'date', sortOrder: 'desc' });
    } else {
      const dates = filterService.getQuickFilterDates(type);
      setFilter(prev => ({ ...prev, ...dates }));
    }
  };

  // Clear filter
  const clearFilter = () => {
    setFilter(filterService.clearFilter());
  };

  // Check if filter is active
  const isFilterActive = useMemo(() => {
    return filterService.isFilterActive(filter);
  }, [filter]);

  // Save preset
  const savePreset = async (name: string) => {
    const preset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filter: { ...filter },
      createdAt: new Date().toISOString(),
    };
    await storageService.saveFilterPreset(preset);
    await loadPresets();
  };

  // Apply preset
  const applyPreset = (preset: FilterPreset) => {
    setFilter(preset.filter);
  };

  // Delete preset
  const deletePreset = async (id: string) => {
    await storageService.deleteFilterPreset(id);
    await loadPresets();
  };

  return {
    filter,
    updateFilter,
    applyQuickFilter,
    clearFilter,
    isFilterActive,
    filteredTransactions,
    presets,
    loadPresets,
    savePreset,
    applyPreset,
    deletePreset,
  };
}
