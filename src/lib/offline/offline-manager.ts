export interface OfflineAction {
  id: string;
  type: 'message' | 'session_update' | 'review' | 'booking' | 'payment';
  payload: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface OfflineData {
  sessions: any[];
  messages: any[];
  notifications: any[];
  userPreferences: any;
  lastSync: Date;
}

export class OfflineManager {
  private readonly STORAGE_KEY = 'tutorconnect_offline_data';
  private readonly ACTIONS_KEY = 'tutorconnect_offline_actions';
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private syncInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeOfflineSupport();
  }

  private initializeOfflineSupport(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OFFLINE_STATUS') {
          this.handleOfflineStatusChange(event.data.isOnline);
        }
      });
    }

    // Start periodic sync when online
    this.startPeriodicSync();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOnline(): void {
    console.log('Device is online - starting sync');
    this.startPeriodicSync();
    this.syncAllPendingActions();
  }

  private handleOffline(): void {
    console.log('Device is offline - stopping sync');
    this.stopPeriodicSync();
  }

  private handleOfflineStatusChange(isOnline: boolean): void {
    if (isOnline) {
      this.handleOnline();
    } else {
      this.handleOffline();
    }
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAllPendingActions();
      }
    }, this.SYNC_INTERVAL);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  // Storage Management
  private getStoredData(): OfflineData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error retrieving offline data:', error);
    }
    
    return {
      sessions: [],
      messages: [],
      notifications: [],
      userPreferences: {},
      lastSync: new Date()
    };
  }

  private setStoredData(data: OfflineData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  private getStoredActions(): OfflineAction[] {
    try {
      const stored = localStorage.getItem(this.ACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving offline actions:', error);
      return [];
    }
  }

  private setStoredActions(actions: OfflineAction[]): void {
    try {
      localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Error storing offline actions:', error);
    }
  }

  // Data Management
  async cacheData(type: keyof OfflineData, data: any[]): Promise<void> {
    try {
      const currentData = this.getStoredData();
      currentData[type] = data;
      currentData.lastSync = new Date();
      this.setStoredData(currentData);
      
      console.log(`Cached ${data.length} ${type} for offline access`);
    } catch (error) {
      console.error(`Error caching ${type} data:`, error);
    }
  }

  async getCachedData(type: keyof OfflineData): Promise<any[]> {
    try {
      const data = this.getStoredData();
      return data[type] || [];
    } catch (error) {
      console.error(`Error retrieving cached ${type} data:`, error);
      return [];
    }
  }

  async clearCachedData(type?: keyof OfflineData): Promise<void> {
    try {
      if (type) {
        const data = this.getStoredData();
        data[type] = [];
        this.setStoredData(data);
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      console.log(`Cleared cached ${type || 'all'} data`);
    } catch (error) {
      console.error('Error clearing cached data:', error);
    }
  }

  // Action Management
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    try {
      const actions = this.getStoredActions();
      const newAction: OfflineAction = {
        ...action,
        id: this.generateId(),
        timestamp: new Date(),
        retryCount: 0,
        status: 'pending'
      };

      actions.push(newAction);
      this.setStoredActions(actions);

      // Register background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-actions');
      }

      console.log('Queued offline action:', newAction);
      return newAction.id;
    } catch (error) {
      console.error('Error queueing offline action:', error);
      throw error;
    }
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    try {
      const actions = this.getStoredActions();
      return actions.filter(action => action.status === 'pending');
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  async updateActionStatus(actionId: string, status: OfflineAction['status']): Promise<void> {
    try {
      const actions = this.getStoredActions();
      const actionIndex = actions.findIndex(action => action.id === actionId);
      
      if (actionIndex !== -1) {
        actions[actionIndex].status = status;
        if (status === 'syncing') {
          actions[actionIndex].retryCount++;
        }
        this.setStoredActions(actions);
      }
    } catch (error) {
      console.error('Error updating action status:', error);
    }
  }

  async removeAction(actionId: string): Promise<void> {
    try {
      const actions = this.getStoredActions();
      const filteredActions = actions.filter(action => action.id !== actionId);
      this.setStoredActions(filteredActions);
    } catch (error) {
      console.error('Error removing action:', error);
    }
  }

  // Sync Management
  async syncAllPendingActions(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const pendingActions = await this.getPendingActions();
      
      if (pendingActions.length === 0) return;

      console.log(`Syncing ${pendingActions.length} pending actions`);
      
      for (const action of pendingActions) {
        await this.syncAction(action);
      }
    } catch (error) {
      console.error('Error syncing pending actions:', error);
    }
  }

  private async syncAction(action: OfflineAction): Promise<void> {
    try {
      await this.updateActionStatus(action.id, 'syncing');

      let success = false;

      switch (action.type) {
        case 'message':
          success = await this.syncMessage(action.payload);
          break;
        case 'session_update':
          success = await this.syncSessionUpdate(action.payload);
          break;
        case 'review':
          success = await this.syncReview(action.payload);
          break;
        case 'booking':
          success = await this.syncBooking(action.payload);
          break;
        case 'payment':
          success = await this.syncPayment(action.payload);
          break;
        default:
          console.warn('Unknown action type:', action.type);
          success = false;
      }

      if (success) {
        await this.updateActionStatus(action.id, 'completed');
        await this.removeAction(action.id);
        console.log('Successfully synced action:', action.id);
      } else {
        await this.updateActionStatus(action.id, 'pending');
        console.error('Failed to sync action:', action.id);
      }
    } catch (error) {
      console.error('Error syncing action:', action.id, error);
      await this.updateActionStatus(action.id, 'pending');
    }
  }

  private async syncMessage(payload: any): Promise<boolean> {
    try {
      const response = await fetch('/api/parent/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing message:', error);
      return false;
    }
  }

  private async syncSessionUpdate(payload: any): Promise<boolean> {
    try {
      const response = await fetch(`/api/sessions/${payload.sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing session update:', error);
      return false;
    }
  }

  private async syncReview(payload: any): Promise<boolean> {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing review:', error);
      return false;
    }
  }

  private async syncBooking(payload: any): Promise<boolean> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing booking:', error);
      return false;
    }
  }

  private async syncPayment(payload: any): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing payment:', error);
      return false;
    }
  }

  // Utility Methods
  private generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async getSyncStatus(): Promise<{
    isOnline: boolean;
    pendingActions: number;
    lastSync: Date;
    cachedData: OfflineData;
  }> {
    const pendingActions = await this.getPendingActions();
    const cachedData = this.getStoredData();

    return {
      isOnline: navigator.onLine,
      pendingActions: pendingActions.length,
      lastSync: cachedData.lastSync,
      cachedData
    };
  }

  async forceSync(): Promise<void> {
    if (navigator.onLine) {
      await this.syncAllPendingActions();
    }
  }

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.ACTIONS_KEY);
      console.log('Cleared all offline data');
    } catch (error) {
      console.error('Error clearing all offline data:', error);
    }
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();