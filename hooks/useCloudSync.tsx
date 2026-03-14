// Hook for cloud sync operations
import { useContext } from 'react';
import { CloudSyncContext } from '../contexts/CloudSyncContext';

export function useCloudSync() {
  const context = useContext(CloudSyncContext);
  if (!context) {
    throw new Error('useCloudSync must be used within CloudSyncProvider');
  }
  return context;
}
