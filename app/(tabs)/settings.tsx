// Settings screen
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useSettings } from '../../hooks/useSettings';
import { useAlert } from '@/template';
import { storageService } from '../../services/storageService';
import { ExportSheet } from '../../components/export/ExportSheet';
import { CloudSyncStatus } from '../../components/cloud/CloudSyncStatus';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const { showAlert } = useAlert();
  const [showExportSheet, setShowExportSheet] = useState(false);

  const handleClearData = () => {
    showAlert(t('clearData'), t('clearDataMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await storageService.clearAllData();
          showAlert(t('dataCleared'));
        },
      },
    ]);
  };

  const SettingItem = ({ icon, label, value, onPress }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.settingLeft}>
        <MaterialIcons name={icon} size={24} color={theme.colors.primary} />
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {value}
          </Text>
        )}
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={theme.colors.textTertiary}
        />
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('settings')}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('cloudSync')}
          </Text>
          <CloudSyncStatus onPress={() => router.push('/cloud-sync')} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('profile')}
          </Text>
          <SettingItem
            icon="person"
            label={t('name')}
            value={settings.name}
            onPress={() => {}}
          />
          <SettingItem
            icon="attach-money"
            label={t('currency')}
            value={settings.currency}
            onPress={() => {}}
          />
          <SettingItem
            icon="category"
            label={t('manageCategories')}
            onPress={() => router.push('/manage-categories')}
          />
          <SettingItem
            icon="savings"
            label={t('budgetManagement')}
            onPress={() => router.push('/budget')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('appearance')}
          </Text>
          <SettingItem
            icon="language"
            label={t('language')}
            value={language === 'ar' ? 'العربية' : 'English'}
            onPress={() => {
              showAlert(t('language'), '', [
                { text: t('cancel'), style: 'cancel' },
                {
                  text: 'English',
                  onPress: () => setLanguage('en'),
                },
                {
                  text: 'العربية',
                  onPress: () => setLanguage('ar'),
                },
              ]);
            }}
          />
          <SettingItem
            icon="brightness-6"
            label={t('theme')}
            value={t(themeMode as any)}
            onPress={() => {
              showAlert(t('theme'), '', [
                { text: t('cancel'), style: 'cancel' },
                {
                  text: t('light'),
                  onPress: () => setThemeMode('light'),
                },
                {
                  text: t('dark'),
                  onPress: () => setThemeMode('dark'),
                },
                {
                  text: t('system'),
                  onPress: () => setThemeMode('system'),
                },
              ]);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('data')}
          </Text>
          <SettingItem
            icon="file-download"
            label={t('exportData')}
            onPress={() => setShowExportSheet(true)}
          />
          <SettingItem
            icon="delete-forever"
            label={t('clearAllData')}
            onPress={handleClearData}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('about')}
          </Text>
          <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="info" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {t('version')}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Export Sheet */}
      <ExportSheet
        visible={showExportSheet}
        onClose={() => setShowExportSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
});
