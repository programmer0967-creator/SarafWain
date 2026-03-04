// Bar Chart component for monthly comparison
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { ChartDataPoint } from '../../services/chartDataService';

interface BarChartViewProps {
  data: ChartDataPoint[];
  title: string;
}

const screenWidth = Dimensions.get('window').width;

export function BarChartView({ data, title }: BarChartViewProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('noData')}
          </Text>
        </View>
      </View>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.income - d.expense),
      },
    ],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => theme.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
          labelColor: (opacity = 1) => theme.colors.textSecondary,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
        }}
        style={styles.chart}
        withInnerLines={false}
        showValuesOnTopOfBars={true}
        fromZero
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('netSavings')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
