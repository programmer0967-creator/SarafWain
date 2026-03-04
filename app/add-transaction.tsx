// Add/Edit Transaction modal
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useTransactions } from '../hooks/useTransactions';
import { useAlert } from '@/template';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CategoryPicker } from '../components/transaction/CategoryPicker';
import { TransactionType, Category } from '../types';
import { format } from 'date-fns';

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { showAlert } = useAlert();

  const editingId = params.id as string | undefined;
  const initialType = params.type as TransactionType | undefined;

  const [type, setType] = useState<TransactionType>(initialType || 'expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingId) {
      const transaction = transactions.find(t => t.id === editingId);
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setDate(new Date(transaction.date));
        setNote(transaction.note || '');
        const category = categories.find(c => c.id === transaction.category);
        setSelectedCategory(category || null);
      }
    }
  }, [editingId]);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showAlert(t('errorAmount'));
      return;
    }

    if (!selectedCategory) {
      showAlert(t('errorCategory'));
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        type,
        amount: parseFloat(amount),
        category: selectedCategory.id,
        date: date.toISOString(),
        note: note.trim() || undefined,
      };

      if (editingId) {
        await updateTransaction(editingId, transactionData);
        showAlert(t('transactionUpdated'));
      } else {
        await addTransaction(transactionData);
        showAlert(t('transactionAdded'));
      }

      router.back();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showAlert(t('deleteTransaction'), t('deleteTransactionMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          if (editingId) {
            await deleteTransaction(editingId);
            showAlert(t('transactionDeleted'));
            router.back();
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {editingId
            ? type === 'income'
              ? t('editIncome')
              : t('editExpense')
            : type === 'income'
            ? t('addIncome')
            : t('addExpense')}
        </Text>
        {editingId && (
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color={theme.colors.danger} />
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!editingId && (
          <View style={styles.typeSelector}>
            <Pressable
              onPress={() => setType('income')}
              style={[
                styles.typeButton,
                {
                  backgroundColor: type === 'income' ? theme.colors.income : theme.colors.surface,
                },
              ]}
            >
              <MaterialIcons
                name="arrow-downward"
                size={20}
                color={type === 'income' ? '#ffffff' : theme.colors.text}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: type === 'income' ? '#ffffff' : theme.colors.text },
                ]}
              >
                {t('income')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setType('expense')}
              style={[
                styles.typeButton,
                {
                  backgroundColor: type === 'expense' ? theme.colors.expense : theme.colors.surface,
                },
              ]}
            >
              <MaterialIcons
                name="arrow-upward"
                size={20}
                color={type === 'expense' ? '#ffffff' : theme.colors.text}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: type === 'expense' ? '#ffffff' : theme.colors.text },
                ]}
              >
                {t('expense')}
              </Text>
            </Pressable>
          </View>
        )}

        <Input
          label={t('amount')}
          value={amount}
          onChangeText={setAmount}
          placeholder={t('amountPlaceholder')}
          keyboardType="numeric"
        />

        <CategoryPicker
          categories={filteredCategories}
          selectedId={selectedCategory?.id}
          onSelect={setSelectedCategory}
        />

        <View style={styles.dateContainer}>
          <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
            {t('date')}
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
          >
            <MaterialIcons name="event" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {format(date, 'MMM dd, yyyy')}
            </Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        <Input
          label={t('note')}
          value={note}
          onChangeText={setNote}
          placeholder={t('notePlaceholder')}
          multiline
        />

        <Button
          title={editingId ? t('save') : t('addTransaction')}
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
