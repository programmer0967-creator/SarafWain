// Transactions list screen
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { TransactionType } from '../../types';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { transactions, categories } = useTransactions();
  const [filter, setFilter] = useState<'all' | TransactionType>('all');

  const filteredTransactions = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const FilterButton = ({ value, label }: { value: 'all' | TransactionType; label: string }) => (
    <Pressable
      onPress={() => setFilter(value)}
      style={({ pressed }) => [
        styles.filterButton,
        {
          backgroundColor: filter === value ? theme.colors.primary : theme.colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.filterText,
          { color: filter === value ? '#ffffff' : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('transactions')}
        </Text>
        <Pressable
          onPress={() => router.push('/add-transaction')}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <MaterialIcons name="add" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton value="all" label={t('all')} />
        <FilterButton value="income" label={t('income')} />
        <FilterButton value="expense" label={t('expense')} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length === 0 ? (
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
          filteredTransactions.map(transaction => {
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
      </ScrollView>
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
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
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
});
