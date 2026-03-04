// Chart data service for analytics visualization
import { Transaction, Category } from '../types';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  subWeeks,
  subMonths,
  subYears,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from 'date-fns';

export type TimeRange = 'week' | 'month' | 'year';

export interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

export interface CategoryChartData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export const chartDataService = {
  getTimeRangeData(transactions: Transaction[], range: TimeRange): ChartDataPoint[] {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let intervals: Date[];

    switch (range) {
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        intervals = eachWeekOfInterval({ start: startDate, end: endDate });
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        break;
    }

    return intervals.map(date => {
      const label = range === 'week' 
        ? format(date, 'EEE')
        : range === 'month'
        ? format(date, 'MMM dd')
        : format(date, 'MMM');

      const income = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          if (range === 'week') return isSameDay(tDate, date);
          if (range === 'month') return isSameWeek(tDate, date);
          return isSameMonth(tDate, date);
        })
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          if (range === 'week') return isSameDay(tDate, date);
          if (range === 'month') return isSameWeek(tDate, date);
          return isSameMonth(tDate, date);
        })
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return { label, income, expense };
    });
  },

  getComparisonData(transactions: Transaction[], range: TimeRange): ChartDataPoint[] {
    const now = new Date();
    const periods: Date[] = [];

    switch (range) {
      case 'week':
        for (let i = 3; i >= 0; i--) {
          periods.push(subWeeks(now, i));
        }
        break;
      case 'month':
        for (let i = 5; i >= 0; i--) {
          periods.push(subMonths(now, i));
        }
        break;
      case 'year':
        for (let i = 2; i >= 0; i--) {
          periods.push(subYears(now, i));
        }
        break;
    }

    return periods.map(date => {
      const start = range === 'week' 
        ? startOfWeek(date)
        : range === 'month'
        ? startOfMonth(date)
        : startOfYear(date);

      const end = range === 'week'
        ? endOfWeek(date)
        : range === 'month'
        ? endOfMonth(date)
        : endOfYear(date);

      const label = range === 'week'
        ? format(date, 'MMM dd')
        : range === 'month'
        ? format(date, 'MMM')
        : format(date, 'yyyy');

      const periodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= start && tDate <= end;
      });

      const income = periodTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = periodTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return { label, income, expense };
    });
  },

  getCategoryPieData(
    transactions: Transaction[], 
    categories: Category[], 
    range: TimeRange,
    textColor: string
  ): CategoryChartData[] {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    const expenseTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' && tDate >= startDate && tDate <= endDate;
    });

    const categoryTotals = new Map<string, number>();
    const categoryColors = new Map<string, string>();

    expenseTransactions.forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);

      if (!categoryColors.has(t.category)) {
        const category = categories.find(c => c.id === t.category);
        categoryColors.set(t.category, category?.color || '#6b7280');
      }
    });

    const chartData = Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Unknown',
          amount,
          color: categoryColors.get(categoryId) || '#6b7280',
          legendFontColor: textColor,
          legendFontSize: 12,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categories

    return chartData;
  },
};
