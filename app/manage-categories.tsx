// Manage Categories screen
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useTransactions } from '../hooks/useTransactions';
import { useAlert } from '@/template';
import { Category } from '../types';

export default function ManageCategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { categories, deleteCategory } = useTransactions();
  const { showAlert } = useAlert();

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const customIncomeCategories = incomeCategories.filter(c => !c.isDefault);
  const customExpenseCategories = expenseCategories.filter(c => !c.isDefault);

  const handleDelete = (category: Category) => {
    if (category.isDefault) {
      showAlert(t('cannotDeleteDefault'));
      return;
    }

    showAlert(t('deleteCategory'), t('deleteCategoryMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(category.id);
          } catch (error: any) {
            showAlert(error.message || 'Error deleting category');
          }
        },
      },
    ]);
  };

  const CategoryItem = ({ category }: { category: Category }) => (
    <Pressable
      onPress={() =>
        category.isDefault
          ? null
          : router.push(`/edit-category?id=${category.id}`)
      }
      style={[styles.categoryItem, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.categoryLeft}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: `${category.color}20` },
          ]}
        >
          <MaterialIcons
            name={category.icon as any}
            size={24}
            color={category.color}
          />
        </View>
        <Text style={[styles.categoryName, { color: theme.colors.text }]}>
          {t(category.name as any) || category.name}
        </Text>
      </View>
      {!category.isDefault && (
        <View style={styles.categoryActions}>
          <Pressable
            onPress={() => router.push(`/edit-category?id=${category.id}`)}
            style={styles.actionButton}
          >
            <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => handleDelete(category)}
            style={styles.actionButton}
          >
            <MaterialIcons name="delete" size={20} color={theme.colors.danger} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('manageCategories')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('incomeCategories')}
            </Text>
            <Pressable
              onPress={() => router.push('/edit-category?type=income')}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <MaterialIcons name="add" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {customIncomeCategories.length > 0 && (
            <>
              <Text
                style={[
                  styles.subsectionTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('customCategories')}
              </Text>
              {customIncomeCategories.map(category => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </>
          )}

          <Text
            style={[
              styles.subsectionTitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t('defaultCategories')}
          </Text>
          {incomeCategories
            .filter(c => c.isDefault)
            .map(category => (
              <CategoryItem key={category.id} category={category} />
            ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('expenseCategories')}
            </Text>
            <Pressable
              onPress={() => router.push('/edit-category?type=expense')}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <MaterialIcons name="add" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {customExpenseCategories.length > 0 && (
            <>
              <Text
                style={[
                  styles.subsectionTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('customCategories')}
              </Text>
              {customExpenseCategories.map(category => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </>
          )}

          <Text
            style={[
              styles.subsectionTitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t('defaultCategories')}
          </Text>
          {expenseCategories
            .filter(c => c.isDefault)
            .map(category => (
              <CategoryItem key={category.id} category={category} />
            ))}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
