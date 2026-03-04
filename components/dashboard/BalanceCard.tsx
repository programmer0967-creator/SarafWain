// Balance Card component
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useSettings } from '../../hooks/useSettings';
import { currencies } from '../../constants/currencies';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const currency = currencies.find(c => c.code === settings.currency);
  const formatAmount = (amount: number) => {
    return `${currency?.symbol || '$'}${amount.toFixed(2)}`;
  };

  return (
    <LinearGradient
      colors={isDark ? ['#10b981', '#059669'] : ['#10b981', '#34d399']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{t('currentBalance')}</Text>
        <MaterialIcons name="account-balance-wallet" size={24} color="#ffffff" />
      </View>

      <Text style={styles.balance}>{formatAmount(balance)}</Text>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <MaterialIcons name="arrow-downward" size={16} color="#ffffff" />
          <Text style={styles.statLabel}>{t('income')}</Text>
          <Text style={styles.statValue}>{formatAmount(income)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <MaterialIcons name="arrow-upward" size={16} color="#ffffff" />
          <Text style={styles.statLabel}>{t('expense')}</Text>
          <Text style={styles.statValue}>{formatAmount(expenses)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.9,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 'auto',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#ffffff',
    opacity: 0.3,
    marginHorizontal: 16,
  },
});
