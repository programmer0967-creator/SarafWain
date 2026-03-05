// Budget vs Actual comparison chart
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { budgetService } from '../../services/budgetService';
import { Budget, Category } from '../../types';

const screenWidth = Dimensions.get('window').width;

interface BudgetChartProps {
  budgets: Budget[];
  categories: Category[];
}

export function BudgetChart({ budgets, categories }: BudgetChartProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (budgets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {t('noBudgetData')}
        </Text>
      </View>
    );
  }

  const data = budgetService.getBudgetVsActual(budgets, categories);

  // Prepare chart data
  const labels = data.map(d => d.category.substring(0, 8));
  const budgetData = data.map(d => d.budget);
  const actualData = data.map(d => d.actual);

  const chartData = {
    labels,
    datasets: [
      {
        data: budgetData,
        color: () => theme.colors.primary,
      },
      {
        data: actualData,
        color: () => theme.colors.warning,
      },
    ],
    legend: [t('budget'), t('actual')],
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('budgetVsActual')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          width={Math.max(screenWidth - 48, data.length * 80)}
          height={220}
          chartConfig={chartConfig}
          withInnerLines={false}
          showBarTops={false}
          fromZero
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
