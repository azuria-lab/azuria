
// Enhanced Background Sync Manager
const BRAND_DB_PREFIX = 'azuria';

class EnhancedSyncManager {
  static SYNC_TAGS = {
    CALCULATIONS: 'sync-calculations',
    USER_DATA: 'sync-user-data',
    SETTINGS: 'sync-settings',
    ANALYTICS: 'sync-analytics'
  };

  static async handleEnhancedBackgroundSync(event) {
    console.log('Background sync triggered:', event.tag);
    
    switch (event.tag) {
      case this.SYNC_TAGS.CALCULATIONS:
        return this.syncCalculations();
      case this.SYNC_TAGS.USER_DATA:
        return this.syncUserData();
      case this.SYNC_TAGS.SETTINGS:
        return this.syncSettings();
      case this.SYNC_TAGS.ANALYTICS:
        return this.syncAnalytics();
      default:
        console.warn('Unknown sync tag:', event.tag);
    }
  }

  static async syncCalculations() {
    try {
      const pendingCalculations = await this.getPendingData('calculations');
      
      if (pendingCalculations.length === 0) {
        console.log('No pending calculations to sync');
        return;
      }

      console.log(`Syncing ${pendingCalculations.length} calculations...`);
      
      for (const calculation of pendingCalculations) {
        try {
          await this.syncCalculationToServer(calculation);
          await this.removeFromPending('calculations', calculation.id);
          console.log('Calculation synced:', calculation.id);
        } catch (error) {
          console.error('Failed to sync calculation:', calculation.id, error);
          // Mark as failed but don't remove - will retry later
          await this.markAsFailed('calculations', calculation.id, error.message);
        }
      }
      
      // Notify the client about sync completion
      await this.notifyClients('calculations-synced', {
        synced: pendingCalculations.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Calculation sync failed:', error);
    }
  }

  static async syncUserData() {
    try {
      const pendingUserData = await this.getPendingData('userData');
      
      for (const data of pendingUserData) {
        await this.syncUserDataToServer(data);
        await this.removeFromPending('userData', data.id);
      }
      
      console.log('User data synced successfully');
    } catch (error) {
      console.error('User data sync failed:', error);
    }
  }

  static async syncSettings() {
    try {
      const pendingSettings = await this.getPendingData('settings');
      
      for (const setting of pendingSettings) {
        await this.syncSettingToServer(setting);
        await this.removeFromPending('settings', setting.id);
      }
      
      console.log('Settings synced successfully');
    } catch (error) {
      console.error('Settings sync failed:', error);
    }
  }

  static async syncAnalytics() {
    try {
      const pendingAnalytics = await this.getPendingData('analytics');
      
      if (pendingAnalytics.length > 0) {
        await this.batchSyncAnalytics(pendingAnalytics);
        await this.clearPendingData('analytics');
        console.log(`Analytics events synced: ${pendingAnalytics.length}`);
      }
    } catch (error) {
      console.error('Analytics sync failed:', error);
    }
  }

  // Database operations using IndexedDB
  static async getPendingData(type) {
    return new Promise((resolve, reject) => {
  const request = indexedDB.open(`${BRAND_DB_PREFIX}SyncDB`, 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([type], 'readonly');
        const store = transaction.objectStore(type);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(type)) {
          db.createObjectStore(type, { keyPath: 'id' });
        }
      };
    });
  }

  static async removeFromPending(type, id) {
    return new Promise((resolve, reject) => {
  const request = indexedDB.open(`${BRAND_DB_PREFIX}SyncDB`, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([type], 'readwrite');
        const store = transaction.objectStore(type);
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  static async markAsFailed(type, id, errorMessage) {
    return new Promise((resolve, reject) => {
  const request = indexedDB.open(`${BRAND_DB_PREFIX}SyncDB`, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([type], 'readwrite');
        const store = transaction.objectStore(type);
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          const item = getRequest.result;
          if (item) {
            item.syncFailed = true;
            item.lastError = errorMessage;
            item.failedAt = new Date().toISOString();
            
            const putRequest = store.put(item);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
      };
    });
  }

  static async clearPendingData(type) {
    return new Promise((resolve, reject) => {
  const request = indexedDB.open(`${BRAND_DB_PREFIX}SyncDB`, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([type], 'readwrite');
        const store = transaction.objectStore(type);
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      };
    });
  }

  // Server communication methods
  static async syncCalculationToServer(calculation) {
    const response = await fetch('/api/calculations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calculation)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async syncUserDataToServer(userData) {
    const response = await fetch('/api/user-data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async syncSettingToServer(setting) {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(setting)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  static async batchSyncAnalytics(events) {
    const response = await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Client notification
  static async notifyClients(type, data) {
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        syncType: type,
        data: data
      });
    });
  }

  // Schedule periodic sync
  static async schedulePeriodicSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(this.SYNC_TAGS.ANALYTICS);
        console.log('Periodic sync scheduled');
      } catch (error) {
        console.error('Failed to schedule periodic sync:', error);
      }
    }
  }
}

// Export for main service worker
self.EnhancedSyncManager = EnhancedSyncManager;
