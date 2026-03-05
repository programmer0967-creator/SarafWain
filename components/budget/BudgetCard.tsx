// Budget card component showing category budget progress
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Budget, Category } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useSettings } from '../../hooks/useSettings';
import { currencies } from '../../constants/currencies';

interface BudgetCardProps {
  budget: Budget;
  category: Category;
  onPress: () => void;
}

export function BudgetCard({ budget, category, onPress }: BudgetCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const currency = currencies.find(c => c.code === settings.currency);
  const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
  const remaining = Math.max(0, budget.limit - budget.spent);
  const isOverBudget = budget.spent > budget.limit;

  const getStatusColor = () => {
    if (isOverBudget) return theme.colors.danger;
    if (percentage >= 90) return theme.colors.warning;
    if (percentage >= 75) return '#FFA500';
    return theme.colors.success;
  };

  const statusColor = getStatusColor();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
            <MaterialIcons name={category.icon as any} size={24} color={category.color} />
          </View>
          <View style={styles.categoryText}>
            <Text style={[styles.categoryName, { color: theme.colors.text }]}>
              {category.name}
            </Text>
            <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
              {t(budget.period)}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
      </View>

      <View style={styles.amounts}>
        <View style={styles.amountRow}>
          <Text style={[styles.spent, { color: statusColor }]}>
            {currency?.symbol}{budget.spent.toFixed(2)}
          </Text>
          <Text style={[styles.limit, { color: theme.colors.textSecondary }]}>
            / {currency?.symbol}{budget.limit.toFixed(2)}
          </Text>
        </View>
        <Text style={[styles.remaining, { color: isOverBudget ? theme.colors.danger : theme.colors.success }]}>
          {isOverBudget ? t('overBudget') : t('remaining')}: {currency?.symbol}{Math.abs(remaining).toFixed(2)}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: statusColor,
                width: `${Math.min(percentage, 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentage, { color: statusColor }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>

      {budget.rolloverEnabled && budget.rolloverAmount > 0 && (
        <View style={[styles.rolloverBadge, { backgroundColor: theme.colors.primary + '20' }]}>
          <MaterialIcons name="autorenew" size={14} color={theme.colors.primary} />
          <Text style={[styles.rolloverText, { color: theme.colors.primary }]}>
            {t('rollover')}: {currency?.symbol}{budget.rolloverAmount.toFixed(2)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    gap: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  period: {
    fontSize: 12,
  },
  amounts: {
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  spent: {
    fontSize: 24,
    fontWeight: '700',
  },
  limit: {
    fontSize: 16,
    marginLeft: 4,
  },
  remaining: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  rolloverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  rolloverText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
