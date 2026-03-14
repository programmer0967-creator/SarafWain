// Cloud sync status indicator
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useCloudSync } from '../../hooks/useCloudSync';

interface CloudSyncStatusProps {
  onPress?: () => void;
}

export function CloudSyncStatus({ onPress }: CloudSyncStatusProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { syncStatus, syncSettings, isAuthenticated } = useCloudSync();

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <ActivityIndicator size="small" color={theme.colors.primary} />;
    }
    if (syncStatus.error) {
      return <MaterialIcons name="cloud-off" size={20} color={theme.colors.danger} />;
    }
    if (syncStatus.lastSyncAt) {
      return <MaterialIcons name="cloud-done" size={20} color={theme.colors.success} />;
    }
    return <MaterialIcons name="cloud-queue" size={20} color={theme.colors.textTertiary} />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return t('syncing');
    }
    if (syncStatus.error) {
      return t('syncError');
    }
    if (syncStatus.lastSyncAt) {
      const date = new Date(syncStatus.lastSyncAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return t('syncedJustNow');
      if (diffMins < 60) return t('syncedMinutesAgo', { minutes: diffMins });
      if (diffMins < 1440) return t('syncedHoursAgo', { hours: Math.floor(diffMins / 60) });
      return t('syncedDaysAgo', { days: Math.floor(diffMins / 1440) });
    }
    return t('notSynced');
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
      <View style={styles.iconContainer}>
        {getStatusIcon()}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          {getStatusText()}
        </Text>
        {syncStatus.lastSyncAt && !syncStatus.isSyncing && (
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            {t('itemsSynced', { count: syncStatus.itemsSynced })}
          </Text>
        )}
      </View>
      {onPress && (
        <MaterialIcons 
          name="chevron-right" 
          size={20} 
          color={theme.colors.textTertiary} 
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 12,
    marginTop: 2,
  },
});
