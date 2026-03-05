// Smart budget recommendations component
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BudgetRecommendation } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useSettings } from '../../hooks/useSettings';
import { currencies } from '../../constants/currencies';

interface BudgetRecommendationsProps {
  recommendations: BudgetRecommendation[];
  onAccept: (rec: BudgetRecommendation) => void;
}

export function BudgetRecommendations({ recommendations, onAccept }: BudgetRecommendationsProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const currency = currencies.find(c => c.code === settings.currency);

  if (recommendations.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.textTertiary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'check-circle';
      case 'medium':
        return 'info';
      case 'low':
        return 'warning';
      default:
        return 'help';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('smartRecommendations')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('recommendationsDesc')}
      </Text>

      {recommendations.map(rec => (
        <View
          key={rec.categoryId}
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.header}>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                {rec.categoryName}
              </Text>
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(rec.confidence) + '20' }]}>
                <MaterialIcons
                  name={getConfidenceIcon(rec.confidence) as any}
                  size={12}
                  color={getConfidenceColor(rec.confidence)}
                />
                <Text style={[styles.confidenceText, { color: getConfidenceColor(rec.confidence) }]}>
                  {t(rec.confidence)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.amounts}>
            <View style={styles.amountItem}>
              <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
                {t('currentAverage')}
              </Text>
              <Text style={[styles.amountValue, { color: theme.colors.text }]}>
                {currency?.symbol}{rec.currentSpending.toFixed(2)}
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={theme.colors.primary} />
            <View style={styles.amountItem}>
              <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
                {t('suggested')}
              </Text>
              <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                {currency?.symbol}{rec.suggestedLimit.toFixed(2)}
              </Text>
            </View>
          </View>

          <Text style={[styles.reason, { color: theme.colors.textSecondary }]}>
            {rec.reason}
          </Text>

          <Pressable
            onPress={() => onAccept(rec)}
            style={({ pressed }) => [
              styles.acceptButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <MaterialIcons name="add" size={20} color="#ffffff" />
            <Text style={styles.acceptText}>{t('acceptBudget')}</Text>
          </Pressable>
        </View>
      ))}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
    gap: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  reason: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
