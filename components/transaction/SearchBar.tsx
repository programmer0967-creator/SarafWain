// Search bar component for transactions
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  hasActiveFilters: boolean;
}

export function SearchBar({ value, onChangeText, onFilterPress, hasActiveFilters }: SearchBarProps) {
  const { theme, isRTL } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
        placeholder={t('searchTransactions')}
        placeholderTextColor={theme.colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
      />
      {value !== '' && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      )}
      <Pressable
        onPress={onFilterPress}
        style={({ pressed }) => [
          styles.filterButton,
          {
            backgroundColor: hasActiveFilters ? theme.colors.primary : 'transparent',
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <MaterialIcons
          name="tune"
          size={20}
          color={hasActiveFilters ? '#ffffff' : theme.colors.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
});
