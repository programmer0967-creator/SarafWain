// Cloud Sync & Backup Management screen
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useCloudSync } from '../hooks/useCloudSync';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { useSettings } from '../hooks/useSettings';
import { useAlert } from '@/template';
import { CloudSyncStatus } from '../components/cloud/CloudSyncStatus';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CloudData } from '../types';

export default function CloudSyncScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  
  const {
    syncSettings,
    syncStatus,
    backups,
    conflicts,
    updateSyncSettings,
    syncNow,
    createBackup,
    restoreFromBackup,
    deleteBackup,
    resolveConflicts,
    isAuthenticated,
  } = useCloudSync();

  const { transactions, categories } = useTransactions();
  const { budgets } = useBudget();
  const { settings } = useSettings();

  const [backupName, setBackupName] = useState('');
  const [showCreateBackup, setShowCreateBackup] = useState(false);

  const getCurrentData = (): CloudData => ({
    transactions,
    categories,
    budgets,
    settings,
  });

  const handleSyncNow = async () => {
    const localData = getCurrentData();
    await syncNow(localData);
    
    if (!syncStatus.error) {
      showAlert(t('syncSuccess'), t('syncSuccessMsg'));
    } else {
      showAlert(t('syncFailed'), syncStatus.error);
    }
  };

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      showAlert(t('error'), t('errorBackupName'));
      return;
    }

    const localData = getCurrentData();
    await createBackup(localData, backupName.trim());
    
    if (!syncStatus.error) {
      showAlert(t('backupCreated'), t('backupCreatedMsg'));
      setBackupName('');
      setShowCreateBackup(false);
    } else {
      showAlert(t('backupFailed'), syncStatus.error);
    }
  };

  const handleRestoreBackup = () => {
    showAlert(
      t('restoreBackup'),
      t('restoreBackupMsg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('restore'),
          style: 'destructive',
          onPress: async () => {
            const restoredData = await restoreFromBackup();
            if (restoredData) {
              showAlert(t('restoreSuccess'), t('restoreSuccessMsg'));
              // Need to reload app or update contexts with restored data
            } else {
              showAlert(t('restoreFailed'), syncStatus.error || t('unknownError'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteBackup = (backupId: string, backupName: string) => {
    showAlert(
      t('deleteBackup'),
      t('deleteBackupMsg', { name: backupName }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteBackup(backupId);
            showAlert(t('backupDeleted'));
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('cloudSync')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.notAuthContainer}>
          <MaterialIcons name="cloud-off" size={64} color={theme.colors.textTertiary} />
          <Text style={[styles.notAuthTitle, { color: theme.colors.text }]}>
            {t('authRequired')}
          </Text>
          <Text style={[styles.notAuthDesc, { color: theme.colors.textSecondary }]}>
            {t('authRequiredDesc')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('cloudSync')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('syncStatus')}
          </Text>
          <CloudSyncStatus />
          
          <Button
            title={syncStatus.isSyncing ? t('syncing') : t('syncNow')}
            onPress={handleSyncNow}
            disabled={syncStatus.isSyncing}
            style={styles.syncButton}
          />

          {conflicts.length > 0 && (
            <View style={[styles.conflictBanner, { backgroundColor: theme.colors.warning + '20' }]}>
              <MaterialIcons name="warning" size={20} color={theme.colors.warning} />
              <Text style={[styles.conflictText, { color: theme.colors.text }]}>
                {t('conflictsDetected', { count: conflicts.length })}
              </Text>
              <Pressable onPress={() => resolveConflicts('merge')}>
                <Text style={[styles.resolveLink, { color: theme.colors.primary }]}>
                  {t('resolve')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('syncSettings')}
          </Text>

          <View style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {t('autoSync')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                {t('autoSyncDesc')}
              </Text>
            </View>
            <Switch
              value={syncSettings.autoSyncEnabled}
              onValueChange={(value) => updateSyncSettings({ autoSyncEnabled: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10' }]}>
            <MaterialIcons name="info" size={20} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {t('deviceInfo')}
              </Text>
              <Text style={[styles.infoDetail, { color: theme.colors.textSecondary }]}>
                {syncSettings.deviceName}
              </Text>
            </View>
          </View>
        </View>

        {/* Backup Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('backupHistory')}
            </Text>
            <Pressable onPress={() => setShowCreateBackup(!showCreateBackup)}>
              <MaterialIcons 
                name={showCreateBackup ? 'close' : 'add'} 
                size={24} 
                color={theme.colors.primary} 
              />
            </Pressable>
          </View>

          {showCreateBackup && (
            <View style={styles.createBackupForm}>
              <Input
                label={t('backupName')}
                value={backupName}
                onChangeText={setBackupName}
                placeholder={t('backupNamePlaceholder')}
              />
              <Button
                title={t('createBackup')}
                onPress={handleCreateBackup}
                disabled={syncStatus.isSyncing || !backupName.trim()}
              />
            </View>
          )}

          {backups.length === 0 ? (
            <View style={styles.emptyBackups}>
              <MaterialIcons name="cloud-upload" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('noBackups')}
              </Text>
            </View>
          ) : (
            backups.map(backup => (
              <View 
                key={backup.id} 
                style={[styles.backupCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.backupHeader}>
                  <MaterialIcons name="backup" size={24} color={theme.colors.primary} />
                  <View style={styles.backupInfo}>
                    <Text style={[styles.backupName, { color: theme.colors.text }]}>
                      {backup.backupName}
                    </Text>
                    <Text style={[styles.backupDate, { color: theme.colors.textSecondary }]}>
                      {formatDate(backup.createdAt)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteBackup(backup.id, backup.backupName)}
                    hitSlop={8}
                  >
                    <MaterialIcons name="delete" size={20} color={theme.colors.danger} />
                  </Pressable>
                </View>

                <View style={styles.backupStats}>
                  <View style={styles.backupStat}>
                    <MaterialIcons name="receipt" size={16} color={theme.colors.textTertiary} />
                    <Text style={[styles.backupStatText, { color: theme.colors.textSecondary }]}>
                      {backup.transactionsCount}
                    </Text>
                  </View>
                  <View style={styles.backupStat}>
                    <MaterialIcons name="category" size={16} color={theme.colors.textTertiary} />
                    <Text style={[styles.backupStatText, { color: theme.colors.textSecondary }]}>
                      {backup.categoriesCount}
                    </Text>
                  </View>
                  <View style={styles.backupStat}>
                    <MaterialIcons name="savings" size={16} color={theme.colors.textTertiary} />
                    <Text style={[styles.backupStatText, { color: theme.colors.textSecondary }]}>
                      {backup.budgetsCount}
                    </Text>
                  </View>
                  <Text style={[styles.backupSize, { color: theme.colors.textTertiary }]}>
                    {formatBytes(backup.backupSize)}
                  </Text>
                </View>

                <Text style={[styles.backupDevice, { color: theme.colors.textTertiary }]}>
                  {backup.deviceName}
                </Text>
              </View>
            ))
          )}

          {backups.length > 0 && (
            <Button
              title={t('restoreFromLatest')}
              onPress={handleRestoreBackup}
              variant="secondary"
              style={styles.restoreButton}
            />
          )}
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
    marginBottom: 16,
  },
  syncButton: {
    marginTop: 16,
  },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  conflictText: {
    flex: 1,
    fontSize: 14,
  },
  resolveLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDetail: {
    fontSize: 12,
  },
  createBackupForm: {
    gap: 16,
    marginBottom: 16,
  },
  emptyBackups: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  backupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  backupDate: {
    fontSize: 12,
  },
  backupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  backupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backupStatText: {
    fontSize: 12,
  },
  backupSize: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  backupDevice: {
    fontSize: 11,
  },
  restoreButton: {
    marginTop: 8,
  },
  notAuthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  notAuthTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  notAuthDesc: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
