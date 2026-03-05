// Add/Edit budget screen
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useBudget } from '../hooks/useBudget';
import { useTransactions } from '../hooks/useTransactions';
import { useAlert } from '@/template';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CategoryPicker } from '../components/transaction/CategoryPicker';

export default function EditBudgetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();
  const { categories } = useTransactions();

  const isEditing = !!params.id;
  const existingBudget = isEditing ? budgets.find(b => b.id === params.id) : null;

  const [categoryId, setCategoryId] = useState(existingBudget?.categoryId || '');
  const [limit, setLimit] = useState(existingBudget?.limit.toString() || '');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>(existingBudget?.period || 'monthly');
  const [rolloverEnabled, setRolloverEnabled] = useState(existingBudget?.rolloverEnabled || false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSave = async () => {
    const limitNum = parseFloat(limit);

    if (!categoryId) {
      showAlert(t('error'), t('errorCategory'));
      return;
    }

    if (!limit || limitNum <= 0) {
      showAlert(t('error'), t('errorBudgetLimit'));
      return;
    }

    // Check if budget already exists for this category
    if (!isEditing) {
      const exists = budgets.find(b => b.categoryId === categoryId);
      if (exists) {
        showAlert(t('error'), t('budgetAlreadyExists'));
        return;
      }
    }

    if (isEditing && existingBudget) {
      await updateBudget(existingBudget.id, {
        categoryId,
        limit: limitNum,
        period,
        rolloverEnabled,
      });
      showAlert(t('budgetUpdated'));
    } else {
      await addBudget({
        categoryId,
        limit: limitNum,
        period,
        rolloverEnabled,
      });
      showAlert(t('budgetAdded'));
    }

    router.back();
  };

  const handleDelete = () => {
    if (!existingBudget) return;

    const category = categories.find(c => c.id === existingBudget.categoryId);
    showAlert(
      t('deleteBudget'),
      t('deleteBudgetMsg', { category: category?.name || '' }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteBudget(existingBudget.id);
            showAlert(t('budgetDeleted'));
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isEditing ? t('editBudget') : t('addBudget')}
        </Text>
        {isEditing && (
          <Pressable onPress={handleDelete} hitSlop={8}>
            <MaterialIcons name="delete" size={24} color={theme.colors.danger} />
          </Pressable>
        )}
        {!isEditing && <View style={{ width: 24 }} />}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('category')}
          </Text>
          <Pressable
            onPress={() => setShowCategoryPicker(true)}
            style={[styles.categoryButton, { backgroundColor: theme.colors.surface }]}
          >
            {selectedCategory ? (
              <>
                <View style={[styles.iconContainer, { backgroundColor: selectedCategory.color + '20' }]}>
                  <MaterialIcons
                    name={selectedCategory.icon as any}
                    size={24}
                    color={selectedCategory.color}
                  />
                </View>
                <Text style={[styles.categoryText, { color: theme.colors.text }]}>
                  {selectedCategory.name}
                </Text>
              </>
            ) : (
              <Text style={[styles.placeholder, { color: theme.colors.textTertiary }]}>
                {t('selectCategory')}
              </Text>
            )}
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
          </Pressable>
        </View>

        {/* Budget Limit */}
        <View style={styles.field}>
          <Input
            label={t('budgetLimit')}
            value={limit}
            onChangeText={setLimit}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>

        {/* Period Selection */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('budgetPeriod')}
          </Text>
          <View style={styles.periodButtons}>
            <Pressable
              onPress={() => setPeriod('monthly')}
              style={[
                styles.periodButton,
                {
                  backgroundColor: period === 'monthly' ? theme.colors.primary : theme.colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: period === 'monthly' ? '#ffffff' : theme.colors.text },
                ]}
              >
                {t('monthly')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPeriod('yearly')}
              style={[
                styles.periodButton,
                {
                  backgroundColor: period === 'yearly' ? theme.colors.primary : theme.colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: period === 'yearly' ? '#ffffff' : theme.colors.text },
                ]}
              >
                {t('yearly')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Rollover Option */}
        <View style={[styles.switchRow, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.switchInfo}>
            <MaterialIcons name="autorenew" size={24} color={theme.colors.primary} />
            <View style={styles.switchText}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                {t('enableRollover')}
              </Text>
              <Text style={[styles.switchDesc, { color: theme.colors.textSecondary }]}>
                {t('rolloverDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={rolloverEnabled}
            onValueChange={setRolloverEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10' }]}>
          <MaterialIcons name="info" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            {t('budgetInfoMsg')}
          </Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title={t('cancel')}
          onPress={() => router.back()}
          variant="secondary"
        />
        <Button
          title={t('save')}
          onPress={handleSave}
        />
      </View>

      {/* Category Picker Modal */}
      <CategoryPicker
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        type="expense"
        selectedCategory={categoryId}
        onSelect={(id) => {
          setCategoryId(id);
          setShowCategoryPicker(false);
        }}
      />
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
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
