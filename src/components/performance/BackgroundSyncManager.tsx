import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SyncData {
  id: string;
  type: 'calculation' | 'settings' | 'user_data' | 'analytics';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface BackgroundSyncManagerProps {
  children: React.ReactNode;
}

class BackgroundSyncService {
  private pendingSync: Map<string, SyncData> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncInterval?: NodeJS.Timeout;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 segundos

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
    this.loadPendingSync();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting sync');
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Offline - queuing data for sync');
    });

    // Sync quando a página ficar visível
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncAll();
      }
    });
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingSync.size > 0) {
        this.syncAll();
      }
    }, this.SYNC_INTERVAL);
  }

  private async loadPendingSync() {
    try {
      const saved = localStorage.getItem('azuria-pending-sync');
      if (saved) {
        const data = JSON.parse(saved);
        data.forEach((item: SyncData) => {
          this.pendingSync.set(item.id, item);
        });
        console.log(`📦 Loaded ${this.pendingSync.size} pending sync items`);
      }
    } catch (error) {
      console.warn('Failed to load pending sync data:', error);
    }
  }

  private savePendingSync() {
    try {
      const data = Array.from(this.pendingSync.values());
      localStorage.setItem('azuria-pending-sync', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save pending sync data:', error);
    }
  }

  public queueForSync(type: SyncData['type'], data: any): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const syncData: SyncData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.pendingSync.set(id, syncData);
    this.savePendingSync();

    console.log(`📝 Queued for sync: ${type} (${id})`);

    // Tentar sincronizar imediatamente se online
    if (this.isOnline) {
      this.syncItem(id);
    }

    return id;
  }

  private async syncAll() {
    if (!this.isOnline || this.pendingSync.size === 0) {return;}

    console.log(`🔄 Starting sync of ${this.pendingSync.size} items`);
    
    const syncPromises = Array.from(this.pendingSync.keys()).map(id => 
      this.syncItem(id)
    );

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
        console.log(`✅ Synced: ${syncData.type} (${id})`);
        return true;
      } else {
        throw new Error('Server rejected the data');
      }
    } catch (error) {
      syncData.retryCount++;
      
      if (syncData.retryCount >= this.MAX_RETRIES) {
        console.error(`❌ Max retries reached for ${syncData.type} (${id}):`, error);
        this.pendingSync.delete(id);
        this.savePendingSync();
        return false;
      } else {
        console.warn(`⚠️ Retry ${syncData.retryCount}/${this.MAX_RETRIES} for ${syncData.type} (${id}):`, error);
        this.savePendingSync();
        return false;
      }
    }
  }

  private async sendToServer(syncData: SyncData): Promise<boolean> {
    const endpoints = {
      calculation: '/api/calculations/sync',
      settings: '/api/settings/sync',
      user_data: '/api/user/sync',
      analytics: '/api/analytics/sync'
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
        timestamp: syncData.timestamp
      })
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
        .filter(([_, data]) => data.type === type)
        .map(([id]) => id);
      
      toDelete.forEach(id => this.pendingSync.delete(id));
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

// Instância global do serviço
let backgroundSyncService: BackgroundSyncService | null = null;

export const getBackgroundSyncService = (): BackgroundSyncService => {
  if (!backgroundSyncService) {
    backgroundSyncService = new BackgroundSyncService();
  }
  return backgroundSyncService;
};

export const BackgroundSyncManager: React.FC<BackgroundSyncManagerProps> = ({ children }) => {
  const { toast } = useToast();
  const serviceRef = useRef<BackgroundSyncService>();

  useEffect(() => {
    // Inicializar serviço
    serviceRef.current = getBackgroundSyncService();

    // Mostrar status de sync
    const handleOnline = () => {
      const pendingCount = serviceRef.current?.getPendingCount() || 0;
      if (pendingCount > 0) {
        toast({
          title: "🌐 Conectado",
          description: `Sincronizando ${pendingCount} item(s) pendente(s)...`,
          duration: 3000,
        });
      }
    };

    const handleOffline = () => {
      toast({
        title: "📴 Sem conexão",
        description: "Os dados serão sincronizados quando voltar online",
        duration: 3000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      serviceRef.current?.destroy();
    };
  }, [toast]);

  return <>{children}</>;
};

// Hook para usar o background sync
export const useBackgroundSync = () => {
  const service = getBackgroundSyncService();

  const queueCalculation = (calculationData: any) => {
    return service.queueForSync('calculation', calculationData);
  };

  const queueSettings = (settingsData: any) => {
    return service.queueForSync('settings', settingsData);
  };

  const queueUserData = (userData: any) => {
    return service.queueForSync('user_data', userData);
  };

  const queueAnalytics = (analyticsData: any) => {
    return service.queueForSync('analytics', analyticsData);
  };

  const getPendingCount = () => {
    return service.getPendingCount();
  };

  const getPendingItems = () => {
    return service.getPendingItems();
  };

  return {
    queueCalculation,
    queueSettings,
    queueUserData,
    queueAnalytics,
    getPendingCount,
    getPendingItems,
    isOnline: navigator.onLine
  };
};