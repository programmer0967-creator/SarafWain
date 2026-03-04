// Reports and Analytics screen
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useTransactions } from '../../hooks/useTransactions';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSettings } from '../../hooks/useSettings';
import { TimeRangeToggle } from '../../components/charts/TimeRangeToggle';
import { PieChartView } from '../../components/charts/PieChartView';
import { LineChartView } from '../../components/charts/LineChartView';
import { BarChartView } from '../../components/charts/BarChartView';
import { chartDataService, TimeRange } from '../../services/chartDataService';
import { currencies } from '../../constants/currencies';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { transactions, categories } = useTransactions();
  const { analysis } = useAnalytics();
  const { settings } = useSettings();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');

  const currency = currencies.find(c => c.code === settings.currency);

  const formatAmount = (amount: number) => {
    return `${currency?.symbol || '$'}${amount.toFixed(2)}`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning || '#f59e0b';
      case 'critical':
        return theme.colors.danger;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'check-circle';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'help';
    }
  };

  // Get chart data based on selected range
  const trendData = chartDataService.getTimeRangeData(transactions, selectedRange);
  const comparisonData = chartDataService.getComparisonData(transactions, selectedRange);
  const pieData = chartDataService.getCategoryPieData(
    transactions,
    categories,
    selectedRange,
    theme.colors.text
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('reports')}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Toggle */}
        <TimeRangeToggle
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />

        {/* Financial Health Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              {t('financialAnalysis')}
            </Text>
            <View style={styles.healthBadge}>
              <MaterialIcons
                name={getHealthIcon(analysis.financialHealth) as any}
                size={20}
                color={getHealthColor(analysis.financialHealth)}
              />
              <Text
                style={[
                  styles.healthText,
                  { color: getHealthColor(analysis.financialHealth) },
                ]}
              >
                {t(analysis.financialHealth)}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('savingsRate')}
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {analysis.savingsRate.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('avgDailySpending')}
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {formatAmount(analysis.avgDailySpending)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('burnRate')}
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {analysis.burnRate.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('estimatedSafeDays')}
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {analysis.estimatedSafeDays > 365 ? '365+' : analysis.estimatedSafeDays}
              </Text>
            </View>
          </View>
        </View>

        {/* Pie Chart - Spending Distribution */}
        <PieChartView
          data={pieData}
          title={t('spendingDistribution')}
        />

        {/* Line Chart - Trend Analysis */}
        <LineChartView
          data={trendData}
          title={t('trendAnalysis')}
        />

        {/* Bar Chart - Period Comparison */}
        <BarChartView
          data={comparisonData}
          title={t('periodComparison')}
        />

        {/* Top Expense Categories */}
        {analysis.topExpenseCategories.length > 0 && (
          <View style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
              {t('topExpenseCategories')}
            </Text>
            {analysis.topExpenseCategories.map((cat, index) => {
              const category = categories.find(c => c.id === cat.category);
              return (
                <View key={cat.category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryRank,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.categoryDetails}>
                      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                        {category?.name || 'Unknown'}
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${cat.percentage}%`,
                              backgroundColor: category?.color || theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.categoryAmount}>
                    <Text style={[styles.categoryAmountText, { color: theme.colors.text }]}>
                      {formatAmount(cat.amount)}
                    </Text>
                    <Text
                      style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}
                    >
                      {cat.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  categoryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  categoryRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryAmountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
  },
});
