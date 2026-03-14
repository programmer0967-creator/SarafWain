// Cloud sync service for OnSpace Cloud integration
import { getSupabaseClient } from '@/template';
import * as Device from 'expo-device';
import { Transaction, Category, Budget, Settings, BackupMetadata, SyncLogEntry, DataConflict, CloudData } from '../types';

const supabase = getSupabaseClient();

export const cloudSyncService = {
  // Get device information
  getDeviceInfo(): { deviceId: string; deviceName: string } {
    const deviceId = Device.modelId || `device_${Date.now()}`;
    const deviceName = `${Device.modelName || 'Unknown'} - ${Device.osName || 'Unknown'}`;
    return { deviceId, deviceName };
  },

  // Push local data to cloud
  async pushToCloud(data: CloudData): Promise<{ success: boolean; error?: string; itemsSynced: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated', itemsSynced: 0 };
      }

      const { deviceId, deviceName } = this.getDeviceInfo();
      let itemsSynced = 0;

      // Push transactions
      for (const transaction of data.transactions) {
        const { error } = await supabase
          .from('user_transactions')
          .upsert({
            id: transaction.id,
            user_id: user.id,
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            note: transaction.note || null,
            date: transaction.date,
            created_at: transaction.createdAt,
            device_id: deviceId,
          }, { onConflict: 'id' });

        if (!error) itemsSynced++;
      }

      // Push categories
      for (const category of data.categories) {
        const { error } = await supabase
          .from('user_categories')
          .upsert({
            id: category.id,
            user_id: user.id,
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
            is_default: category.isDefault,
            device_id: deviceId,
          }, { onConflict: 'id' });

        if (!error) itemsSynced++;
      }

      // Push budgets
      for (const budget of data.budgets) {
        const { error } = await supabase
          .from('user_budgets')
          .upsert({
            id: budget.id,
            user_id: user.id,
            category_id: budget.categoryId,
            limit_amount: budget.limit,
            period: budget.period,
            rollover_enabled: budget.rolloverEnabled,
            rollover_amount: budget.rolloverAmount,
            created_at: budget.createdAt,
            device_id: deviceId,
          }, { onConflict: 'id' });

        if (!error) itemsSynced++;
      }

      // Push settings
      const { error: settingsError } = await supabase
        .from('user_cloud_settings')
        .upsert({
          user_id: user.id,
          name: data.settings.name,
          currency: data.settings.currency,
          language: data.settings.language,
          theme: data.settings.theme,
          last_sync_at: new Date().toISOString(),
          device_id: deviceId,
        }, { onConflict: 'user_id' });

      if (!settingsError) itemsSynced++;

      // Log sync
      await this.logSync(user.id, deviceId, 'push', 'success', itemsSynced);

      return { success: true, itemsSynced };
    } catch (error: any) {
      console.error('Push to cloud error:', error);
      return { success: false, error: error.message, itemsSynced: 0 };
    }
  },

  // Pull data from cloud
  async pullFromCloud(): Promise<{ success: boolean; data?: CloudData; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { deviceId } = this.getDeviceInfo();

      // Fetch transactions
      const { data: transactionsData, error: transError } = await supabase
        .from('user_transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transError) throw transError;

      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id);

      if (catError) throw catError;

      // Fetch budgets
      const { data: budgetsData, error: budgetError } = await supabase
        .from('user_budgets')
        .select('*')
        .eq('user_id', user.id);

      if (budgetError) throw budgetError;

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_cloud_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Transform data
      const transactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        category: t.category,
        note: t.note,
        date: t.date,
        createdAt: t.created_at,
      }));

      const categories: Category[] = (categoriesData || []).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        isDefault: c.is_default,
      }));

      const budgets: Budget[] = (budgetsData || []).map(b => ({
        id: b.id,
        categoryId: b.category_id,
        limit: parseFloat(b.limit_amount),
        spent: 0, // Calculate on client side
        period: b.period,
        rolloverEnabled: b.rollover_enabled,
        rolloverAmount: parseFloat(b.rollover_amount || 0),
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));

      const settings: Settings = settingsData ? {
        name: settingsData.name || '',
        currency: settingsData.currency || 'USD',
        language: settingsData.language || 'en',
        theme: settingsData.theme || 'system',
        startingBalance: 0,
        hasCompletedOnboarding: true,
      } : {
        name: '',
        currency: 'USD',
        language: 'en',
        theme: 'system',
        startingBalance: 0,
        hasCompletedOnboarding: false,
      };

      const cloudData: CloudData = {
        transactions,
        categories,
        budgets,
        settings,
      };

      const itemsSynced = transactions.length + categories.length + budgets.length + 1;
      await this.logSync(user.id, deviceId, 'pull', 'success', itemsSynced);

      return { success: true, data: cloudData };
    } catch (error: any) {
      console.error('Pull from cloud error:', error);
      return { success: false, error: error.message };
    }
  },

  // Detect conflicts between local and remote data
  async detectConflicts(localData: CloudData, remoteData: CloudData): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];

    // Check transaction conflicts
    for (const localTx of localData.transactions) {
      const remoteTx = remoteData.transactions.find(t => t.id === localTx.id);
      if (remoteTx) {
        const localTime = new Date(localTx.createdAt || '').getTime();
        const remoteTime = new Date(remoteTx.createdAt || '').getTime();
        
        if (localTime !== remoteTime && (
          localTx.amount !== remoteTx.amount ||
          localTx.category !== remoteTx.category ||
          localTx.note !== remoteTx.note
        )) {
          conflicts.push({
            id: localTx.id,
            type: 'transaction',
            localData: localTx,
            remoteData: remoteTx,
            localVersion: 1,
            remoteVersion: 1,
            localUpdatedAt: localTx.createdAt || '',
            remoteUpdatedAt: remoteTx.createdAt || '',
          });
        }
      }
    }

    return conflicts;
  },

  // Merge data with conflict resolution (last-write-wins)
  mergeData(localData: CloudData, remoteData: CloudData): CloudData {
    const mergedTransactions = new Map<string, Transaction>();
    const mergedCategories = new Map<string, Category>();
    const mergedBudgets = new Map<string, Budget>();

    // Merge transactions (last-write-wins based on createdAt)
    [...localData.transactions, ...remoteData.transactions].forEach(tx => {
      const existing = mergedTransactions.get(tx.id);
      if (!existing) {
        mergedTransactions.set(tx.id, tx);
      } else {
        const existingTime = new Date(existing.createdAt || 0).getTime();
        const currentTime = new Date(tx.createdAt || 0).getTime();
        if (currentTime > existingTime) {
          mergedTransactions.set(tx.id, tx);
        }
      }
    });

    // Merge categories
    [...localData.categories, ...remoteData.categories].forEach(cat => {
      const existing = mergedCategories.get(cat.id);
      if (!existing || !cat.isDefault) { // Prefer custom categories
        mergedCategories.set(cat.id, cat);
      }
    });

    // Merge budgets
    [...localData.budgets, ...remoteData.budgets].forEach(budget => {
      mergedBudgets.set(budget.id, budget);
    });

    // Use remote settings if available, otherwise local
    const mergedSettings = remoteData.settings.name ? remoteData.settings : localData.settings;

    return {
      transactions: Array.from(mergedTransactions.values()),
      categories: Array.from(mergedCategories.values()),
      budgets: Array.from(mergedBudgets.values()),
      settings: mergedSettings,
    };
  },

  // Create backup
  async createBackup(data: CloudData, backupName: string): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { deviceId, deviceName } = this.getDeviceInfo();

      // First push current data to cloud
      await this.pushToCloud(data);

      // Create backup metadata
      const { data: backup, error } = await supabase
        .from('user_backups')
        .insert({
          user_id: user.id,
          backup_name: backupName,
          device_id: deviceId,
          device_name: deviceName,
          transactions_count: data.transactions.length,
          categories_count: data.categories.length,
          budgets_count: data.budgets.length,
          backup_size: JSON.stringify(data).length,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, backupId: backup.id };
    } catch (error: any) {
      console.error('Create backup error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get backup history
  async getBackupHistory(): Promise<{ success: boolean; backups?: BackupMetadata[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('user_backups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const backups: BackupMetadata[] = (data || []).map(b => ({
        id: b.id,
        userId: b.user_id,
        backupName: b.backup_name,
        deviceId: b.device_id,
        deviceName: b.device_name,
        transactionsCount: b.transactions_count,
        categoriesCount: b.categories_count,
        budgetsCount: b.budgets_count,
        backupSize: b.backup_size,
        createdAt: b.created_at,
      }));

      return { success: true, backups };
    } catch (error: any) {
      console.error('Get backup history error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete backup
  async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_backups')
        .delete()
        .eq('id', backupId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Log sync operation
  async logSync(
    userId: string,
    deviceId: string,
    syncType: 'push' | 'pull' | 'merge',
    status: 'success' | 'failed' | 'conflict',
    itemsSynced: number,
    conflictsResolved: number = 0,
    errorMessage?: string
  ): Promise<void> {
    try {
      await supabase.from('sync_log').insert({
        user_id: userId,
        device_id: deviceId,
        sync_type: syncType,
        status,
        items_synced: itemsSynced,
        conflicts_resolved: conflictsResolved,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error('Log sync error:', error);
    }
  },

  // Get sync history
  async getSyncHistory(): Promise<{ success: boolean; logs?: SyncLogEntry[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('sync_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const logs: SyncLogEntry[] = (data || []).map(log => ({
        id: log.id,
        userId: log.user_id,
        deviceId: log.device_id,
        syncType: log.sync_type,
        status: log.status,
        itemsSynced: log.items_synced,
        conflictsResolved: log.conflicts_resolved,
        errorMessage: log.error_message,
        createdAt: log.created_at,
      }));

      return { success: true, logs };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  },
};
