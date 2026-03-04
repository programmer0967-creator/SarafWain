// Reports screen
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSettings } from '../../hooks/useSettings';
import { useTransactions } from '../../hooks/useTransactions';
import { currencies } from '../../constants/currencies';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { analysis, categorySpending } = useAnalytics();
  const { settings } = useSettings();
  const { categories } = useTransactions();

  const currency = currencies.find(c => c.code === settings.currency);

  const formatAmount = (amount: number) => {
    return `${currency?.symbol || '$'}${amount.toFixed(2)}`;
  };

  const getHealthColor = () => {
    switch (analysis.financialHealth) {
      case 'healthy':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'critical':
        return theme.colors.danger;
    }
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('reports')}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.healthCard, { backgroundColor: getHealthColor() }]}>
          <MaterialIcons name="favorite" size={32} color="#ffffff" />
          <Text style={styles.healthLabel}>{t('financialHealth')}</Text>
          <Text style={styles.healthValue}>
            {t(analysis.financialHealth as any)}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="trending-down"
            label={t('avgDailySpending')}
            value={formatAmount(analysis.avgDailySpending)}
            color={theme.colors.primary}
          />
          <StatCard
            icon="speed"
            label={t('burnRate')}
            value={`${analysis.burnRate.toFixed(1)}%`}
            color={theme.colors.warning}
          />
          <StatCard
            icon="event"
            label={t('estimatedSafeDays')}
            value={analysis.estimatedSafeDays > 999 ? '999+' : analysis.estimatedSafeDays}
            color={theme.colors.success}
          />
          <StatCard
            icon="savings"
            label={t('savingsRate')}
            value={`${analysis.savingsRate.toFixed(1)}%`}
            color={theme.colors.income}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('topExpenseCategories')}
          </Text>

          {analysis.topExpenseCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="pie-chart"
                size={48}
                color={theme.colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('noTransactions')}
              </Text>
            </View>
          ) : (
            analysis.topExpenseCategories.map((item, index) => {
              const category = categories.find(c => c.id === item.category);
              return (
                <View
                  key={item.category}
                  style={[styles.categoryItem, { backgroundColor: theme.colors.surface }]}
                >
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: `${category?.color || theme.colors.primary}20` },
                      ]}
                    >
                      <MaterialIcons
                        name={category?.icon as any || 'category'}
                        size={20}
                        color={category?.color || theme.colors.primary}
                      />
                    </View>
                    <View>
                      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                        {category ? t(category.name as any) : item.category}
                      </Text>
                      <Text
                        style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}
                      >
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                    {formatAmount(item.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  healthCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 12,
    opacity: 0.9,
  },
  healthValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
