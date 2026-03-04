// Stats Grid component
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

interface StatItemProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <MaterialIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

interface StatsGridProps {
  savingsRate: number;
  avgDailySpending: string;
  safeDays: number;
}

export function StatsGrid({ savingsRate, avgDailySpending, safeDays }: StatsGridProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <StatItem
        icon="savings"
        label={t('savingsRate')}
        value={`${savingsRate.toFixed(1)}%`}
        color={theme.colors.success}
      />
      <StatItem
        icon="trending-down"
        label={t('avgDailySpending')}
        value={avgDailySpending}
      />
      <StatItem
        icon="event"
        label={t('estimatedSafeDays')}
        value={safeDays > 999 ? '999+' : safeDays.toString()}
        color={theme.colors.warning}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
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
});
