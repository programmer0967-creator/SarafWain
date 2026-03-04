// Line Chart component for income vs expense trends
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { ChartDataPoint } from '../../services/chartDataService';

interface LineChartViewProps {
  data: ChartDataPoint[];
  title: string;
}

const screenWidth = Dimensions.get('window').width;

export function LineChartView({ data, title }: LineChartViewProps) {
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
        data: data.map(d => d.income),
        color: (opacity = 1) => theme.colors.income + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
        strokeWidth: 3,
      },
      {
        data: data.map(d => d.expense),
        color: (opacity = 1) => theme.colors.expense + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
        strokeWidth: 3,
      },
    ],
    legend: [t('income'), t('expense')],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => theme.colors.text + Math.floor(opacity * 100).toString(16).padStart(2, '0'),
          labelColor: (opacity = 1) => theme.colors.textSecondary,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
      />
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
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
