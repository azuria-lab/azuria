// Offline service for PWA capabilities and data sync
import type { CalculationHistory } from '../types/calculator';
import { logger } from '@/services/logger';

interface OfflineData {
  calculations: CalculationHistory[];
  settings: Record<string, unknown>;
  lastSync: string;
}

type SyncResource = 'calculation' | 'settings';
type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE';
interface SyncQueueItemBase<TResource extends SyncResource = SyncResource> {
  id: string;
  type: SyncActionType;
  resource: TResource;
  data: unknown;
  timestamp: string;
}

export class OfflineService {
  private static readonly OFFLINE_STORAGE_KEY = 'azuria_offline_data';
  private static readonly SYNC_QUEUE_KEY = 'azuria_sync_queue';

  static async cacheData(data: Partial<OfflineData>): Promise<void> {
    try {
      const existingData = await this.getOfflineData();
      const updatedData = {
        ...existingData,
        ...data,
        lastSync: new Date().toISOString()
      };

      localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(updatedData));
      
      // Update service worker cache if available
      if ('serviceWorker' in navigator && 'caches' in window) {
        await this.updateServiceWorkerCache(updatedData);
      }
    } catch (error) {
      logger.error('Failed to cache offline data:', error);
    }
  }

  static async getOfflineData(): Promise<OfflineData> {
    try {
      const stored = localStorage.getItem(this.OFFLINE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        calculations: [],
        settings: {},
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get offline data:', error);
      return {
        calculations: [],
        settings: {},
        lastSync: new Date().toISOString()
      };
    }
  }

  static async addToSyncQueue(action: Omit<SyncQueueItemBase, 'id'>): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const item: SyncQueueItemBase = { ...action, id: this.generateId() };
      queue.push(item);

      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      logger.error('Failed to add to sync queue:', error);
    }
  }

  static async getSyncQueue(): Promise<SyncQueueItemBase[]> {
    try {
      const stored = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return stored ? JSON.parse(stored) as SyncQueueItemBase[] : [];
    } catch (error) {
      logger.error('Failed to get sync queue:', error);
      return [];
    }
  }

  static async processSyncQueue(): Promise<void> {
    if (!navigator.onLine) {
      logger.info('Offline: deferring sync queue processing');
      return;
    }

    try {
      const queue = await this.getSyncQueue();
      const processedIds: string[] = [];

    for (const item of queue) {
        try {
          await this.processSyncItem(item);
          processedIds.push(item.id);
        } catch (error) {
      logger.error('Failed to process sync item:', item, error);
          // Continue with other items
        }
      }

      // Remove processed items from queue
      const remainingQueue = queue.filter(item => !processedIds.includes(item.id));
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));

    } catch (error) {
      logger.error('Failed to process sync queue:', error);
    }
  }

  static async clearOfflineData(): Promise<void> {
    try {
      localStorage.removeItem(this.OFFLINE_STORAGE_KEY);
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
      
      // Clear service worker cache if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => 
            cacheName.includes('azuria') ? caches.delete(cacheName) : Promise.resolve()
          )
        );
      }
    } catch (error) {
      logger.error('Failed to clear offline data:', error);
    }
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static async getStorageUsage(): Promise<{
    used: number;
    available: number;
    percentage: number;
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;

        return { used, available, percentage };
      }
    } catch (error) {
      logger.error('Failed to get storage usage:', error);
    }

    return { used: 0, available: 0, percentage: 0 };
  }

  // Private methods
  private static async updateServiceWorkerCache(data: OfflineData): Promise<void> {
    try {
      const cache = await caches.open('azuria-offline-v1');
      const dataResponse = new Response(JSON.stringify(data));
      await cache.put('/offline-data', dataResponse);
    } catch (error) {
      logger.error('Failed to update service worker cache:', error);
    }
  }

  private static async processSyncItem(item: SyncQueueItemBase): Promise<void> {
    // TODO: Implement actual sync with backend
    logger.debug('Processing sync item:', item);
    
    switch (item.type) {
      case 'CREATE':
        // Handle creation sync
        break;
      case 'UPDATE':
        // Handle update sync
        break;
      case 'DELETE':
        // Handle deletion sync
        break;
    }
  }

  private static generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Setup offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
  logger.info('Back online, processing sync queue...');
    OfflineService.processSyncQueue();
  });

  window.addEventListener('offline', () => {
  logger.info('Gone offline, operations will be queued');
  });
}