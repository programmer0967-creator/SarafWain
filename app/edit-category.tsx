// Edit Category modal
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useTransactions } from '../hooks/useTransactions';
import { useAlert } from '@/template';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { IconPicker } from '../components/ui/IconPicker';
import { ColorPicker } from '../components/ui/ColorPicker';
import { TransactionType } from '../types';

export default function EditCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { categories, addCategory, updateCategory } = useTransactions();
  const { showAlert } = useAlert();

  const editingId = params.id as string | undefined;
  const initialType = params.type as TransactionType | undefined;

  const [type, setType] = useState<TransactionType>(initialType || 'expense');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingId) {
      const category = categories.find(c => c.id === editingId);
      if (category) {
        setType(category.type);
        setName(category.name);
        setSelectedIcon(category.icon);
        setSelectedColor(category.color);
      }
    }
  }, [editingId]);

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert(t('errorCategoryName'));
      return;
    }

    if (!selectedIcon) {
      showAlert(t('errorCategoryIcon'));
      return;
    }

    if (!selectedColor) {
      showAlert(t('errorCategoryColor'));
      return;
    }

    setLoading(true);

    try {
      const categoryData = {
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
        isDefault: false,
      };

      if (editingId) {
        await updateCategory(editingId, categoryData);
      } else {
        await addCategory(categoryData);
      }

      router.back();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {editingId ? t('editCategory') : t('addCategory')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!editingId && (
          <View style={styles.typeSelector}>
            <Text style={[styles.typeLabel, { color: theme.colors.text }]}>
              {t('categoryType')}
            </Text>
            <View style={styles.typeButtons}>
              <Pressable
                onPress={() => setType('income')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      type === 'income'
                        ? theme.colors.income
                        : theme.colors.surface,
                  },
                ]}
              >
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
                    backgroundColor:
                      type === 'expense'
                        ? theme.colors.expense
                        : theme.colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: type === 'expense' ? '#ffffff' : theme.colors.text,
                    },
                  ]}
                >
                  {t('expense')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <Input
          label={t('categoryName')}
          value={name}
          onChangeText={setName}
          placeholder={t('categoryNamePlaceholder')}
        />

        <IconPicker selectedIcon={selectedIcon} onSelect={setSelectedIcon} />

        <ColorPicker selectedColor={selectedColor} onSelect={setSelectedColor} />

        <Button
          title={t('save')}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
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
  typeSelector: {
    marginBottom: 24,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 8,
  },
});
