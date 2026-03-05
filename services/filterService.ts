// Filter service for transaction filtering and sorting
import { Transaction, TransactionFilter, QuickFilterType } from '../types';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

export const filterService = {
  applyFilter(transactions: Transaction[], filter: TransactionFilter): Transaction[] {
    let filtered = [...transactions];

    // Search query (amount, category, note)
    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const amountStr = t.amount.toString();
        const noteStr = (t.note || '').toLowerCase();
        return amountStr.includes(query) || noteStr.includes(query);
      });
    }

    // Filter by type
    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter(t => filter.types!.includes(t.type));
    }

    // Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter(t => filter.categories!.includes(t.category));
    }

    // Filter by amount range
    if (filter.amountMin !== undefined && filter.amountMin > 0) {
      filtered = filtered.filter(t => t.amount >= filter.amountMin!);
    }
    if (filter.amountMax !== undefined && filter.amountMax > 0) {
      filtered = filtered.filter(t => t.amount <= filter.amountMax!);
    }

    // Filter by date range
    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom);
      filtered = filtered.filter(t => new Date(t.date) >= fromDate);
    }
    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo);
      filtered = filtered.filter(t => new Date(t.date) <= toDate);
    }

    // Sort
    const sortBy = filter.sortBy || 'date';
    const sortOrder = filter.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  },

  getQuickFilterDates(type: QuickFilterType): { dateFrom?: string; dateTo?: string } {
    const now = new Date();

    switch (type) {
      case 'today':
        return {
          dateFrom: startOfDay(now).toISOString(),
          dateTo: endOfDay(now).toISOString(),
        };
      case 'week':
        return {
          dateFrom: startOfWeek(now).toISOString(),
          dateTo: endOfWeek(now).toISOString(),
        };
      case 'month':
        return {
          dateFrom: startOfMonth(now).toISOString(),
          dateTo: endOfMonth(now).toISOString(),
        };
      case 'year':
        return {
          dateFrom: startOfYear(now).toISOString(),
          dateTo: endOfYear(now).toISOString(),
        };
      default:
        return {};
    }
  },

  isFilterActive(filter: TransactionFilter): boolean {
    return !!(
      filter.searchQuery ||
      (filter.types && filter.types.length > 0) ||
      (filter.categories && filter.categories.length > 0) ||
      filter.amountMin ||
      filter.amountMax ||
      filter.dateFrom ||
      filter.dateTo
    );
  },

  clearFilter(): TransactionFilter {
    return {
      sortBy: 'date',
      sortOrder: 'desc',
    };
  },
};
