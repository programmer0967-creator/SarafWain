// Transactions list screen with advanced search and filtering
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useTransactionFilters } from '../../hooks/useTransactionFilters';
import { SearchBar } from '../../components/transaction/SearchBar';
import { QuickFilters } from '../../components/transaction/QuickFilters';
import { FilterSheet } from '../../components/transaction/FilterSheet';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { QuickFilterType } from '../../types';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const {
    filter,
    updateFilter,
    applyQuickFilter,
    clearFilter,
    isFilterActive,
    filteredTransactions,
    presets,
    loadPresets,
    savePreset,
    applyPreset,
    deletePreset,
  } = useTransactionFilters();

  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<QuickFilterType>('all');

  useEffect(() => {
    loadPresets();
  }, []);

  const handleQuickFilterSelect = (type: QuickFilterType) => {
    setSelectedQuickFilter(type);
    applyQuickFilter(type);
  };

  const handleSearchChange = (text: string) => {
    updateFilter({ searchQuery: text });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('transactions')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {filteredTransactions.length} {t('transactions').toLowerCase()}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={filter.searchQuery || ''}
          onChangeText={handleSearchChange}
          onFilterPress={() => setShowFilterSheet(true)}
          hasActiveFilters={isFilterActive}
        />
      </View>

      {/* Quick Filters */}
      <QuickFilters
        selectedFilter={selectedQuickFilter}
        onFilterSelect={handleQuickFilterSelect}
      />

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            category={undefined}
            onPress={() => router.push(`/add-transaction?id=${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons
              name={isFilterActive ? 'filter-list-off' : 'receipt-long'}
              size={64}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {isFilterActive ? t('noMatchingTransactions') : t('noTransactions')}
            </Text>
            {isFilterActive && (
              <Pressable onPress={clearFilter} style={styles.clearButton}>
                <Text style={[styles.clearButtonText, { color: theme.colors.primary }]}>
                  {t('clearFilters')}
                </Text>
              </Pressable>
            )}
          </View>
        }
      />

      {/* Filter Sheet */}
      <FilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filter={filter}
        onApply={updateFilter}
        onClear={clearFilter}
        presets={presets}
        onSavePreset={savePreset}
        onApplyPreset={applyPreset}
        onDeletePreset={deletePreset}
      />

      {/* FAB - Add Transaction */}
      <Pressable
        onPress={() => router.push('/add-transaction?type=income')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 80,
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
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
