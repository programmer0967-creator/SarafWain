// Advanced filter modal sheet
import { View, Text, StyleSheet, Modal, ScrollView, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionFilter, FilterPreset } from '../../types';
import { Button } from '../ui/Button';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filter: TransactionFilter;
  onApply: (filter: TransactionFilter) => void;
  onClear: () => void;
  presets: FilterPreset[];
  onSavePreset: (name: string) => void;
  onApplyPreset: (preset: FilterPreset) => void;
  onDeletePreset: (id: string) => void;
}

export function FilterSheet({
  visible,
  onClose,
  filter,
  onApply,
  onClear,
  presets,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { theme, isRTL } = useTheme();
  const { t } = useLanguage();
  const { categories } = useTransactions();

  const [localFilter, setLocalFilter] = useState<TransactionFilter>(filter);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleApply = () => {
    onApply(localFilter);
    onClose();
  };

  const handleClear = () => {
    onClear();
    setLocalFilter({ sortBy: 'date', sortOrder: 'desc' });
    onClose();
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const toggleType = (type: 'income' | 'expense') => {
    const types = localFilter.types || [];
    if (types.includes(type)) {
      setLocalFilter({ ...localFilter, types: types.filter(t => t !== type) });
    } else {
      setLocalFilter({ ...localFilter, types: [...types, type] });
    }
  };

  const toggleCategory = (categoryId: string) => {
    const cats = localFilter.categories || [];
    if (cats.includes(categoryId)) {
      setLocalFilter({ ...localFilter, categories: cats.filter(c => c !== categoryId) });
    } else {
      setLocalFilter({ ...localFilter, categories: [...cats, categoryId] });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('advancedFilters')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Saved Presets */}
            {presets.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('savedPresets')}
                </Text>
                {presets.map(preset => (
                  <View
                    key={preset.id}
                    style={[styles.presetItem, { backgroundColor: theme.colors.surface }]}
                  >
                    <Pressable
                      style={styles.presetContent}
                      onPress={() => {
                        onApplyPreset(preset);
                        setLocalFilter(preset.filter);
                      }}
                    >
                      <MaterialIcons name="bookmark" size={20} color={theme.colors.primary} />
                      <Text style={[styles.presetName, { color: theme.colors.text }]}>
                        {preset.name}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => onDeletePreset(preset.id)} hitSlop={8}>
                      <MaterialIcons name="delete" size={20} color={theme.colors.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Transaction Type */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('transactionType')}
              </Text>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => toggleType('income')}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: localFilter.types?.includes('income')
                        ? theme.colors.income
                        : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: localFilter.types?.includes('income')
                          ? '#ffffff'
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {t('income')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleType('expense')}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: localFilter.types?.includes('expense')
                        ? theme.colors.expense
                        : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: localFilter.types?.includes('expense')
                          ? '#ffffff'
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {t('expense')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('categories')}
              </Text>
              <View style={styles.chipRow}>
                {categories.map(category => (
                  <Pressable
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: localFilter.categories?.includes(category.id)
                          ? category.color
                          : theme.colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: localFilter.categories?.includes(category.id)
                            ? '#ffffff'
                            : theme.colors.text,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Amount Range */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('amountRange')}
              </Text>
              <View style={styles.rangeRow}>
                <View style={styles.rangeInput}>
                  <Text style={[styles.rangeLabel, { color: theme.colors.textSecondary }]}>
                    {t('min')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                    value={localFilter.amountMin?.toString() || ''}
                    onChangeText={text =>
                      setLocalFilter({ ...localFilter, amountMin: parseFloat(text) || undefined })
                    }
                  />
                </View>
                <View style={styles.rangeInput}>
                  <Text style={[styles.rangeLabel, { color: theme.colors.textSecondary }]}>
                    {t('max')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                    value={localFilter.amountMax?.toString() || ''}
                    onChangeText={text =>
                      setLocalFilter({ ...localFilter, amountMax: parseFloat(text) || undefined })
                    }
                  />
                </View>
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('sortBy')}
              </Text>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => setLocalFilter({ ...localFilter, sortBy: 'date' })}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        localFilter.sortBy === 'date'
                          ? theme.colors.primary
                          : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          localFilter.sortBy === 'date' ? '#ffffff' : theme.colors.text,
                      },
                    ]}
                  >
                    {t('date')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setLocalFilter({ ...localFilter, sortBy: 'amount' })}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        localFilter.sortBy === 'amount'
                          ? theme.colors.primary
                          : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          localFilter.sortBy === 'amount' ? '#ffffff' : theme.colors.text,
                      },
                    ]}
                  >
                    {t('amount')}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => setLocalFilter({ ...localFilter, sortOrder: 'asc' })}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        localFilter.sortOrder === 'asc'
                          ? theme.colors.primary
                          : theme.colors.surface,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="arrow-upward"
                    size={16}
                    color={localFilter.sortOrder === 'asc' ? '#ffffff' : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          localFilter.sortOrder === 'asc' ? '#ffffff' : theme.colors.text,
                      },
                    ]}
                  >
                    {t('ascending')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setLocalFilter({ ...localFilter, sortOrder: 'desc' })}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        localFilter.sortOrder === 'desc'
                          ? theme.colors.primary
                          : theme.colors.surface,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="arrow-downward"
                    size={16}
                    color={localFilter.sortOrder === 'desc' ? '#ffffff' : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          localFilter.sortOrder === 'desc' ? '#ffffff' : theme.colors.text,
                      },
                    ]}
                  >
                    {t('descending')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Save Preset */}
            {showSavePreset ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('savePreset')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  placeholder={t('presetName')}
                  placeholderTextColor={theme.colors.textTertiary}
                  value={presetName}
                  onChangeText={setPresetName}
                />
                <View style={styles.presetButtons}>
                  <Button
                    title={t('cancel')}
                    onPress={() => {
                      setShowSavePreset(false);
                      setPresetName('');
                    }}
                    variant="secondary"
                  />
                  <Button title={t('save')} onPress={handleSavePreset} />
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowSavePreset(true)}
                style={[styles.saveButton, { backgroundColor: theme.colors.surface }]}
              >
                <MaterialIcons name="bookmark-add" size={20} color={theme.colors.primary} />
                <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>
                  {t('saveAsPreset')}
                </Text>
              </Pressable>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button title={t('clearAll')} onPress={handleClear} variant="secondary" />
            <Button title={t('applyFilters')} onPress={handleApply} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  presetContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 16,
  },
});
