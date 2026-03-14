// Cloud Sync Context for managing cloud synchronization
import { createContext, useState, useEffect, ReactNode } from 'react';
import { cloudSyncService } from '../services/cloudSyncService';
import { storageService } from '../services/storageService';
import { 
  CloudSyncSettings, 
  SyncStatus, 
  BackupMetadata, 
  CloudData, 
  DataConflict 
} from '../types';

interface CloudSyncContextType {
  syncSettings: CloudSyncSettings;
  syncStatus: SyncStatus;
  backups: BackupMetadata[];
  conflicts: DataConflict[];
  updateSyncSettings: (settings: Partial<CloudSyncSettings>) => Promise<void>;
  syncNow: (localData: CloudData) => Promise<void>;
  createBackup: (localData: CloudData, backupName: string) => Promise<void>;
  restoreFromBackup: () => Promise<CloudData | null>;
  deleteBackup: (backupId: string) => Promise<void>;
  loadBackupHistory: () => Promise<void>;
  resolveConflicts: (strategy: 'local' | 'remote' | 'merge') => void;
  isAuthenticated: boolean;
}

export const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const [syncSettings, setSyncSettings] = useState<CloudSyncSettings>({
    autoSyncEnabled: false,
    syncFrequency: 'manual',
    deviceId: '',
    deviceName: '',
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    itemsSynced: 0,
    conflictsResolved: 0,
  });

  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeSync();
  }, []);

  const initializeSync = async () => {
    // Check authentication
    const authenticated = await cloudSyncService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const { deviceId, deviceName } = cloudSyncService.getDeviceInfo();
      setSyncSettings(prev => ({
        ...prev,
        deviceId,
        deviceName,
      }));

      await loadBackupHistory();
    }
  };

  const updateSyncSettings = async (settings: Partial<CloudSyncSettings>) => {
    const updated = { ...syncSettings, ...settings };
    setSyncSettings(updated);
  };

  const syncNow = async (localData: CloudData) => {
    if (!isAuthenticated) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Not authenticated. Please log in to sync.',
      }));
      return;
    }

    setSyncStatus({
      isSyncing: true,
      itemsSynced: 0,
      conflictsResolved: 0,
    });

    try {
      // Pull remote data
      const { success: pullSuccess, data: remoteData, error: pullError } = 
        await cloudSyncService.pullFromCloud();

      if (!pullSuccess || !remoteData) {
        throw new Error(pullError || 'Failed to fetch remote data');
      }

      // Detect conflicts
      const detectedConflicts = await cloudSyncService.detectConflicts(localData, remoteData);
      
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        setSyncStatus({
          isSyncing: false,
          itemsSynced: 0,
          conflictsResolved: 0,
          error: `${detectedConflicts.length} conflicts detected`,
        });
        return;
      }

      // Merge data (last-write-wins)
      const mergedData = cloudSyncService.mergeData(localData, remoteData);

      // Push merged data back to cloud
      const { success: pushSuccess, error: pushError, itemsSynced } = 
        await cloudSyncService.pushToCloud(mergedData);

      if (!pushSuccess) {
        throw new Error(pushError || 'Failed to push data to cloud');
      }

      setSyncStatus({
        isSyncing: false,
        lastSyncAt: new Date().toISOString(),
        itemsSynced,
        conflictsResolved: 0,
      });

      setSyncSettings(prev => ({
        ...prev,
        lastSyncAt: new Date().toISOString(),
      }));

    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStatus({
        isSyncing: false,
        error: error.message,
        itemsSynced: 0,
        conflictsResolved: 0,
      });
    }
  };

  const createBackup = async (localData: CloudData, backupName: string) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const { success, backupId, error } = await cloudSyncService.createBackup(
        localData,
        backupName
      );

      if (!success) {
        throw new Error(error || 'Failed to create backup');
      }

      await loadBackupHistory();

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date().toISOString(),
      }));
    } catch (error: any) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error.message,
      }));
    }
  };

  const restoreFromBackup = async (): Promise<CloudData | null> => {
    try {
      const { success, data, error } = await cloudSyncService.pullFromCloud();
      
      if (!success || !data) {
        throw new Error(error || 'Failed to restore backup');
      }

      return data;
    } catch (error: any) {
      console.error('Restore error:', error);
      setSyncStatus(prev => ({
        ...prev,
        error: error.message,
      }));
      return null;
    }
  };

  const deleteBackup = async (backupId: string) => {
    const { success, error } = await cloudSyncService.deleteBackup(backupId);
    if (success) {
      await loadBackupHistory();
    } else {
      console.error('Delete backup error:', error);
    }
  };

  const loadBackupHistory = async () => {
    const { success, backups: fetchedBackups, error } = 
      await cloudSyncService.getBackupHistory();

    if (success && fetchedBackups) {
      setBackups(fetchedBackups);
    } else {
      console.error('Load backup history error:', error);
    }
  };

  const resolveConflicts = (strategy: 'local' | 'remote' | 'merge') => {
    // Clear conflicts - actual resolution happens in mergeData
    setConflicts([]);
    setSyncStatus(prev => ({
      ...prev,
      conflictsResolved: conflicts.length,
    }));
  };

  return (
    <CloudSyncContext.Provider
      value={{
        syncSettings,
        syncStatus,
        backups,
        conflicts,
        updateSyncSettings,
        syncNow,
        createBackup,
        restoreFromBackup,
        deleteBackup,
        loadBackupHistory,
        resolveConflicts,
        isAuthenticated,
      }}
    >
      {children}
    </CloudSyncContext.Provider>
  );
}
