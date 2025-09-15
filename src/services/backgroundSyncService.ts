import { logger } from '@/services/logger';

export interface SyncData<T = unknown> {
  id: string;
  type: 'calculation' | 'settings' | 'user_data' | 'analytics';
  data: T;
  timestamp: number;
  retryCount: number;
}

export class BackgroundSyncService {
  private pendingSync: Map<string, SyncData> = new Map();
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInterval?: ReturnType<typeof setInterval>;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 segundos

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
    this.loadPendingSync();
  }

  private setupEventListeners() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {return;}

    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Back online - starting sync');
      void this.syncAll();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('Offline - queuing data for sync');
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        void this.syncAll();
      }
    });
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingSync.size > 0) {
        void this.syncAll();
      }
    }, this.SYNC_INTERVAL);
  }

  private async loadPendingSync() {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('azuria-pending-sync') : null;
      if (saved) {
        const data: SyncData[] = JSON.parse(saved);
        data.forEach((item) => {
          this.pendingSync.set(item.id, item);
        });
        logger.info(`Loaded ${this.pendingSync.size} pending sync items`);
      }
    } catch (err) {
      logger.warn('Failed to load pending sync data', { err });
    }
  }

  private savePendingSync() {
    try {
      const data = Array.from(this.pendingSync.values());
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('azuria-pending-sync', JSON.stringify(data));
      }
    } catch (err) {
      logger.warn('Failed to save pending sync data', { err });
    }
  }

  public queueForSync<T = unknown>(type: SyncData['type'], data: T): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const syncData: SyncData<T> = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingSync.set(id, syncData as SyncData);
    this.savePendingSync();

    logger.info(`Queued for sync: ${type} (${id})`);

    if (this.isOnline) {
      void this.syncItem(id);
    }

    return id;
  }

  private async syncAll() {
    if (!this.isOnline || this.pendingSync.size === 0) {return;}

    logger.info(`Starting sync of ${this.pendingSync.size} items`);

    const syncPromises = Array.from(this.pendingSync.keys()).map((id) => this.syncItem(id));
    await Promise.allSettled(syncPromises);
  }

  private async syncItem(id: string): Promise<boolean> {
    const syncData = this.pendingSync.get(id);
    if (!syncData) {return false;}

    try {
      const success = await this.sendToServer(syncData);

      if (success) {
        this.pendingSync.delete(id);
        this.savePendingSync();
        logger.info(`Synced: ${syncData.type} (${id})`);
        return true;
      }
      throw new Error('Server rejected the data');
    } catch (err) {
      syncData.retryCount += 1;

      if (syncData.retryCount >= this.MAX_RETRIES) {
        logger.error(`Max retries reached for ${syncData.type} (${id})`, { err });
        this.pendingSync.delete(id);
        this.savePendingSync();
        return false;
      }
      logger.warn(`Retry ${syncData.retryCount}/${this.MAX_RETRIES} for ${syncData.type} (${id})`, { err });
      this.savePendingSync();
      return false;
    }
  }

  private async sendToServer(syncData: SyncData): Promise<boolean> {
    const endpoints: Record<SyncData['type'], string> = {
      calculation: '/api/calculations/sync',
      settings: '/api/settings/sync',
      user_data: '/api/user/sync',
      analytics: '/api/analytics/sync',
    };

    const endpoint = endpoints[syncData.type];
    if (!endpoint) {
      throw new Error(`Unknown sync type: ${syncData.type}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: syncData.id,
        data: syncData.data,
        timestamp: syncData.timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return true;
  }

  public getPendingCount(): number {
    return this.pendingSync.size;
  }

  public getPendingItems(): SyncData[] {
    return Array.from(this.pendingSync.values());
  }

  public clearPending(type?: SyncData['type']) {
    if (type) {
      const toDelete = Array.from(this.pendingSync.entries())
        .filter(([, data]) => data.type === type)
        .map(([entryId]) => entryId);
      toDelete.forEach((entryId) => this.pendingSync.delete(entryId));
    } else {
      this.pendingSync.clear();
    }

    this.savePendingSync();
  }

  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.savePendingSync();
  }
}

let backgroundSyncService: BackgroundSyncService | null = null;
export const getBackgroundSyncService = (): BackgroundSyncService => {
  if (!backgroundSyncService) {
    backgroundSyncService = new BackgroundSyncService();
  }
  return backgroundSyncService;
};
