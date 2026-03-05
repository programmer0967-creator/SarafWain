// Quick filter buttons component
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { QuickFilterType } from '../../types';

interface QuickFiltersProps {
  selectedFilter: QuickFilterType;
  onFilterSelect: (filter: QuickFilterType) => void;
}

export function QuickFilters({ selectedFilter, onFilterSelect }: QuickFiltersProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const filters: QuickFilterType[] = ['all', 'today', 'week', 'month', 'year'];

  const getFilterLabel = (filter: QuickFilterType): string => {
    switch (filter) {
      case 'all':
        return t('all');
      case 'today':
        return t('today');
      case 'week':
        return t('thisWeek');
      case 'month':
        return t('thisMonth');
      case 'year':
        return t('thisYear');
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map(filter => {
        const isSelected = selectedFilter === filter;
        return (
          <Pressable
            key={filter}
            onPress={() => onFilterSelect(filter)}
            style={({ pressed }) => [
              styles.filterChip,
              {
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: isSelected ? '#ffffff' : theme.colors.text,
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}
            >
              {getFilterLabel(filter)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
  },
});
