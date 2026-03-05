// Budget management screen
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useBudget } from '../hooks/useBudget';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import { useAlert } from '@/template';
import { budgetService } from '../services/budgetService';
import { BudgetCard } from '../components/budget/BudgetCard';
import { BudgetChart } from '../components/budget/BudgetChart';
import { BudgetRecommendations } from '../components/budget/BudgetRecommendations';
import { currencies } from '../constants/currencies';
import { BudgetRecommendation } from '../types';

export default function BudgetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { budgets, generateRecommendations, recommendations, addBudget, deleteBudget } = useBudget();
  const { categories } = useTransactions();
  const { settings } = useSettings();

  const [showRecommendations, setShowRecommendations] = useState(false);

  const currency = currencies.find(c => c.code === settings.currency);

  useEffect(() => {
    if (budgets.length === 0) {
      generateRecommendations();
      setShowRecommendations(true);
    }
  }, []);

  const utilization = budgetService.calculateTotalUtilization(budgets);

  const handleAcceptRecommendation = async (rec: BudgetRecommendation) => {
    await addBudget({
      categoryId: rec.categoryId,
      limit: rec.suggestedLimit,
      period: 'monthly',
      rolloverEnabled: false,
    });
    showAlert(t('budgetAdded'));
    generateRecommendations();
  };

  const handleDeleteBudget = (id: string, categoryName: string) => {
    showAlert(
      t('deleteBudget'),
      t('deleteBudgetMsg', { category: categoryName }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteBudget(id);
            showAlert(t('budgetDeleted'));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('budgetManagement')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Utilization Card */}
        {budgets.length > 0 && (
          <View style={[styles.utilizationCard, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.utilizationHeader}>
              <Text style={styles.utilizationTitle}>{t('totalBudget')}</Text>
              <Text style={styles.utilizationAmount}>
                {currency?.symbol}{utilization.totalBudget.toFixed(2)}
              </Text>
            </View>
            <View style={styles.utilizationStats}>
              <View style={styles.utilizationStat}>
                <Text style={styles.utilizationLabel}>{t('spent')}</Text>
                <Text style={styles.utilizationValue}>
                  {currency?.symbol}{utilization.totalSpent.toFixed(2)}
                </Text>
              </View>
              <View style={styles.utilizationStat}>
                <Text style={styles.utilizationLabel}>{t('remaining')}</Text>
                <Text style={styles.utilizationValue}>
                  {currency?.symbol}{utilization.remaining.toFixed(2)}
                </Text>
              </View>
              <View style={styles.utilizationStat}>
                <Text style={styles.utilizationLabel}>{t('utilization')}</Text>
                <Text style={styles.utilizationValue}>
                  {utilization.percentage.toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Chart */}
        {budgets.length > 0 && (
          <BudgetChart budgets={budgets} categories={categories} />
        )}

        {/* Smart Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <BudgetRecommendations
            recommendations={recommendations}
            onAccept={handleAcceptRecommendation}
          />
        )}

        {/* Budget List */}
        {budgets.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('yourBudgets')}
              </Text>
              {!showRecommendations && recommendations.length > 0 && (
                <Pressable onPress={() => setShowRecommendations(true)}>
                  <Text style={[styles.link, { color: theme.colors.primary }]}>
                    {t('viewRecommendations')}
                  </Text>
                </Pressable>
              )}
            </View>

            {budgets.map(budget => {
              const category = categories.find(c => c.id === budget.categoryId);
              if (!category) return null;

              return (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  category={category}
                  onPress={() => router.push(`/edit-budget?id=${budget.id}`)}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="savings" size={64} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {t('noBudgets')}
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              {t('noBudgetsDesc')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/edit-budget')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 24,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  utilizationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  utilizationHeader: {
    marginBottom: 16,
  },
  utilizationTitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  utilizationAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  utilizationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  utilizationStat: {
    alignItems: 'center',
  },
  utilizationLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 4,
  },
  utilizationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
