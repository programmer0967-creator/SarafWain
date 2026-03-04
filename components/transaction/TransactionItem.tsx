// Transaction Item component
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Transaction, Category } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useSettings } from '../../hooks/useSettings';
import { currencies } from '../../constants/currencies';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onPress: () => void;
}

export function TransactionItem({ transaction, category, onPress }: TransactionItemProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { settings } = useSettings();

  const currency = currencies.find(c => c.code === settings.currency);
  const isIncome = transaction.type === 'income';
  const color = isIncome ? theme.colors.income : theme.colors.expense;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy', { locale: language === 'ar' ? ar : enUS });
  };

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
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <MaterialIcons
          name={category?.icon as any || 'attach-money'}
          size={24}
          color={color}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.category, { color: theme.colors.text }]}>
          {category ? t(category.name as any) : transaction.category}
        </Text>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          {formatDate(transaction.date)}
        </Text>
        {transaction.note && (
          <Text
            style={[styles.note, { color: theme.colors.textTertiary }]}
            numberOfLines={1}
          >
            {transaction.note}
          </Text>
        )}
      </View>

      <Text style={[styles.amount, { color }]}>
        {isIncome ? '+' : '-'}{currency?.symbol || '$'}{transaction.amount.toFixed(2)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  note: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
