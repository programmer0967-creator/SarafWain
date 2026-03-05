// Dashboard screen
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useTransactions } from '../../hooks/useTransactions';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSettings } from '../../hooks/useSettings';
import { useBudgetWarnings } from '../../hooks/useBudgetWarnings';
import { useBudget } from '../../hooks/useBudget';
import { BalanceCard } from '../../components/dashboard/BalanceCard';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { BudgetWarningBanner } from '../../components/dashboard/BudgetWarningBanner';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { currencies } from '../../constants/currencies';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { transactions, categories } = useTransactions();
  const { analysis } = useAnalytics();
  const { settings } = useSettings();
  const { shouldShowWarning, dismissWarning } = useBudgetWarnings();
  const { budgets, alerts } = useBudget();

  const warningLevel = shouldShowWarning(analysis.burnRate);

  const currency = currencies.find(c => c.code === settings.currency);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatAmount = (amount: number) => {
    return `${currency?.symbol || '$'}${amount.toFixed(2)}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            {t('dashboard')}
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {settings.name}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/add-transaction?type=income')}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <MaterialIcons name="add" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {warningLevel && (
          <BudgetWarningBanner
            analysis={analysis}
            onDismiss={() => dismissWarning(warningLevel)}
          />
        )}

        <BalanceCard
          balance={analysis.currentBalance}
          income={analysis.totalIncome}
          expenses={analysis.totalExpenses}
        />

        <StatsGrid
          savingsRate={analysis.savingsRate}
          avgDailySpending={formatAmount(analysis.avgDailySpending)}
          safeDays={analysis.estimatedSafeDays}
        />

        {budgets.length > 0 && (
          <Pressable
            onPress={() => router.push('/budget')}
            style={[styles.budgetCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.budgetHeader}>
              <MaterialIcons name="savings" size={24} color={theme.colors.primary} />
              <Text style={[styles.budgetTitle, { color: theme.colors.text }]}>
                {t('budgetManagement')}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
            </View>
            {alerts.length > 0 && (
              <View style={[styles.alertBadge, { backgroundColor: theme.colors.danger }]}>                <Text style={styles.alertBadgeText}>{alerts.length}</Text>
              </View>
            )}
          </Pressable>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('recentTransactions')}
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
                {t('viewAll')}
              </Text>
            </Pressable>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="receipt-long"
                size={64}
                color={theme.colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('noTransactions')}
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>
                {t('noTransactionsDesc')}
              </Text>
            </View>
          ) : (
            recentTransactions.map(transaction => {
              const category = categories.find(c => c.id === transaction.category);
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  category={category}
                  onPress={() => router.push(`/add-transaction?id=${transaction.id}`)}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push('/add-transaction?type=expense')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.danger,
            bottom: insets.bottom + 80,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <MaterialIcons name="remove" size={28} color="#ffffff" />
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
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
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
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    position: 'relative',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  alertBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
