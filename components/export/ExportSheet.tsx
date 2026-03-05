// Export options modal sheet
import { View, Text, StyleSheet, Modal, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useTransactions } from '../../hooks/useTransactions';
import { useSettings } from '../../hooks/useSettings';
import { useAnalytics } from '../../hooks/useAnalytics';
import { exportService } from '../../services/exportService';
import { analyticsService } from '../../services/analyticsService';
import { ExportOptions, Transaction } from '../../types';
import { Button } from '../ui/Button';
import { useAlert } from '@/template';

interface ExportSheetProps {
  visible: boolean;
  onClose: () => void;
  filteredTransactions?: Transaction[];
}

export function ExportSheet({ visible, onClose, filteredTransactions }: ExportSheetProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { transactions, categories } = useTransactions();
  const { settings } = useSettings();
  const { analysis } = useAnalytics();

  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeTransactions: true,
    includeAnalytics: true,
    includeCategoryBreakdown: true,
    includeCharts: false,
    filteredOnly: false,
  });

  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      // Get transactions to export
      const transactionsToExport = options.filteredOnly && filteredTransactions
        ? filteredTransactions
        : exportService.filterByDateRange(transactions, options.dateFrom, options.dateTo);

      // Calculate analysis for the exported transactions
      const exportAnalysis = analyticsService.calculateAnalysis(
        transactionsToExport,
        categories,
        settings.startingBalance
      );

      let result;
      if (options.format === 'csv') {
        result = await exportService.exportCSV(
          transactionsToExport,
          categories,
          options.includeAnalytics ? exportAnalysis : undefined,
          options
        );
      } else {
        result = await exportService.exportPDF(
          transactionsToExport,
          categories,
          exportAnalysis,
          options,
          settings.name,
          settings.currency
        );
      }

      if (result.success && result.uri) {
        // Show share options
        showAlert(
          t('exportSuccess'),
          t('exportSuccessMsg'),
          [
            {
              text: t('share'),
              onPress: async () => {
                await exportService.shareFile(result.uri!);
                onClose();
              },
            },
            {
              text: t('email'),
              onPress: async () => {
                const subject = `SarafWain Report - ${format(new Date(), 'MMM dd, yyyy')}`;
                const success = await exportService.shareViaEmail(result.uri!, subject);
                if (!success) {
                  showAlert(t('error'), t('emailNotAvailable'));
                }
                onClose();
              },
            },
            {
              text: t('done'),
              style: 'cancel',
              onPress: () => onClose(),
            },
          ]
        );
      } else {
        showAlert(t('error'), result.error || t('exportFailed'));
      }
    } catch (error) {
      console.error('Export error:', error);
      showAlert(t('error'), t('exportFailed'));
    } finally {
      setExporting(false);
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
              {t('exportData')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Format Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('exportFormat')}
              </Text>
              <View style={styles.formatRow}>
                <Pressable
                  onPress={() => setOptions({ ...options, format: 'pdf' })}
                  style={[
                    styles.formatCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: options.format === 'pdf' ? theme.colors.primary : 'transparent',
                      borderWidth: 2,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="picture-as-pdf"
                    size={32}
                    color={options.format === 'pdf' ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text style={[styles.formatLabel, { color: theme.colors.text }]}>PDF</Text>
                  <Text style={[styles.formatDesc, { color: theme.colors.textSecondary }]}>
                    {t('pdfDescription')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setOptions({ ...options, format: 'csv' })}
                  style={[
                    styles.formatCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: options.format === 'csv' ? theme.colors.primary : 'transparent',
                      borderWidth: 2,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="table-chart"
                    size={32}
                    color={options.format === 'csv' ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text style={[styles.formatLabel, { color: theme.colors.text }]}>CSV</Text>
                  <Text style={[styles.formatDesc, { color: theme.colors.textSecondary }]}>
                    {t('csvDescription')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('dateRange')}
              </Text>
              <View style={styles.dateRow}>
                <Pressable
                  onPress={() => setShowDateFromPicker(true)}
                  style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
                >
                  <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                    {t('from')}
                  </Text>
                  <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                    {options.dateFrom ? format(new Date(options.dateFrom), 'MMM dd, yyyy') : t('selectDate')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowDateToPicker(true)}
                  style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
                >
                  <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                    {t('to')}
                  </Text>
                  <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                    {options.dateTo ? format(new Date(options.dateTo), 'MMM dd, yyyy') : t('selectDate')}
                  </Text>
                </Pressable>
              </View>
              {(options.dateFrom || options.dateTo) && (
                <Pressable
                  onPress={() => setOptions({ ...options, dateFrom: undefined, dateTo: undefined })}
                  style={styles.clearDateButton}
                >
                  <Text style={[styles.clearDateText, { color: theme.colors.primary }]}>
                    {t('clearDateRange')}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Include Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('includeInExport')}
              </Text>

              {filteredTransactions && (
                <View style={[styles.optionRow, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                      {t('filteredResultsOnly')}
                    </Text>
                    <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                      {t('exportFilteredDescription')}
                    </Text>
                  </View>
                  <Switch
                    value={options.filteredOnly}
                    onValueChange={value => setOptions({ ...options, filteredOnly: value })}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  />
                </View>
              )}

              <View style={[styles.optionRow, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                    {t('transactions')}
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                    {t('includeAllTransactions')}
                  </Text>
                </View>
                <Switch
                  value={options.includeTransactions}
                  onValueChange={value => setOptions({ ...options, includeTransactions: value })}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>

              <View style={[styles.optionRow, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                    {t('financialAnalysis')}
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                    {t('includeSummaryStats')}
                  </Text>
                </View>
                <Switch
                  value={options.includeAnalytics}
                  onValueChange={value => setOptions({ ...options, includeAnalytics: value })}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>

              <View style={[styles.optionRow, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                    {t('categoryBreakdown')}
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                    {t('includeSpendingByCategory')}
                  </Text>
                </View>
                <Switch
                  value={options.includeCategoryBreakdown}
                  onValueChange={value => setOptions({ ...options, includeCategoryBreakdown: value })}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={t('cancel')}
              onPress={onClose}
              variant="secondary"
              disabled={exporting}
            />
            <Button
              title={exporting ? t('exporting') : t('exportNow')}
              onPress={handleExport}
              disabled={exporting}
              icon={exporting ? undefined : 'file-download'}
            />
          </View>

          {exporting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                {t('generatingReport')}
              </Text>
            </View>
          )}

          {/* Date Pickers */}
          {showDateFromPicker && (
            <DateTimePicker
              value={options.dateFrom ? new Date(options.dateFrom) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDateFromPicker(false);
                if (date) {
                  setOptions({ ...options, dateFrom: date.toISOString() });
                }
              }}
            />
          )}

          {showDateToPicker && (
            <DateTimePicker
              value={options.dateTo ? new Date(options.dateTo) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDateToPicker(false);
                if (date) {
                  setOptions({ ...options, dateTo: date.toISOString() });
                }
              }}
            />
          )}
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
  formatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  formatDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearDateButton: {
    alignSelf: 'center',
    marginTop: 8,
    padding: 8,
  },
  clearDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionInfo: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});
