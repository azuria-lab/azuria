
// App Update Manager for PWA
const BRAND_PRODUCT = 'Azuria';
const BRAND_DB_PREFIX = 'azuria';

class AppUpdateManager {
  static UPDATE_TYPES = {
    CRITICAL: 'critical',
    FEATURE: 'feature',
    BUGFIX: 'bugfix',
    SECURITY: 'security'
  };

  static currentVersion = '3.0.0';
  static isUpdateAvailable = false;
  static pendingUpdate = null;

  static async checkForUpdates() {
    try {
      // Check for new version from server
      const response = await fetch('/api/version-check', {
        method: 'GET',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }

      const versionInfo = await response.json();
      
      if (this.isNewerVersion(versionInfo.version, this.currentVersion)) {
        this.isUpdateAvailable = true;
        this.pendingUpdate = versionInfo;
        
        await this.handleUpdateAvailable(versionInfo);
      }
      
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  static isNewerVersion(newVersion, currentVersion) {
    const newParts = newVersion.split('.').map(Number);
    const currentParts = currentVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }
    
    return false;
  }

  static async handleUpdateAvailable(versionInfo) {
    // Notify clients about available update
    await this.notifyClientsAboutUpdate(versionInfo);
    
    // Show notification based on update type
    await this.showUpdateNotification(versionInfo);
    
    // For critical updates, force update
    if (versionInfo.type === this.UPDATE_TYPES.CRITICAL) {
      setTimeout(() => {
        this.performUpdate();
      }, 5000); // Give user 5 seconds to see the notification
    }
  }

  static async showUpdateNotification(versionInfo) {
    const urgencyLevel = this.getUrgencyLevel(versionInfo.type);
    const notificationConfig = {
      title: this.getUpdateTitle(versionInfo.type),
      options: {
        body: versionInfo.description || 'Nova versão disponível',
        icon: '/icon-192.png',
        badge: '/favicon.ico',
        tag: 'app-update',
        requireInteraction: urgencyLevel === 'high',
        data: {
          type: 'app-update',
          version: versionInfo.version,
          updateType: versionInfo.type,
          features: versionInfo.features || []
        },
        actions: [
          {
            action: 'update-now',
            title: 'Atualizar Agora'
          },
          {
            action: 'update-later',
            title: 'Mais Tarde'
          }
        ]
      }
    };

    await self.registration.showNotification(
      notificationConfig.title,
      notificationConfig.options
    );
  }

  static getUpdateTitle(type) {
    switch (type) {
      case this.UPDATE_TYPES.CRITICAL:
        return '🚨 Atualização Crítica Disponível';
      case this.UPDATE_TYPES.SECURITY:
        return '🔒 Atualização de Segurança';
      case this.UPDATE_TYPES.FEATURE:
        return '✨ Novas Funcionalidades';
      case this.UPDATE_TYPES.BUGFIX:
        return '🔧 Correções Disponíveis';
      default:
        return '🚀 Atualização Disponível';
    }
  }

  static getUrgencyLevel(type) {
    switch (type) {
      case this.UPDATE_TYPES.CRITICAL:
      case this.UPDATE_TYPES.SECURITY:
        return 'high';
      case this.UPDATE_TYPES.FEATURE:
        return 'medium';
      case this.UPDATE_TYPES.BUGFIX:
        return 'low';
      default:
        return 'medium';
    }
  }

  static async notifyClientsAboutUpdate(versionInfo) {
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: versionInfo.version,
        updateType: versionInfo.type,
        description: versionInfo.description,
        features: versionInfo.features || [],
        changelog: versionInfo.changelog || []
      });
    });
  }

  static async performUpdate() {
    try {
      console.log('Performing app update...');
      
      // Clear all caches to force fresh content loading
      await this.clearAllCaches();
      
      // Notify clients about update start
      await this.notifyClientsAboutUpdateStart();
      
      // Skip waiting and claim clients
      await self.skipWaiting();
      
      console.log('Update completed successfully');
      
    } catch (error) {
      console.error('Update failed:', error);
      await this.notifyClientsAboutUpdateError(error);
    }
  }

  static async clearAllCaches() {
    const cacheNames = await caches.keys();
    
    return Promise.all(
      cacheNames.map(cacheName => {
        console.log('Clearing cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }

  static async notifyClientsAboutUpdateStart() {
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_INSTALLING',
        message: 'Instalando atualização...'
      });
    });
  }

  static async notifyClientsAboutUpdateError(error) {
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_ERROR',
        error: error.message
      });
    });
  }

  static async handleUpdateAction(action) {
    switch (action) {
      case 'update-now':
        await this.performUpdate();
        break;
        
      case 'update-later':
        // Schedule reminder for later
        setTimeout(() => {
          this.showUpdateReminder();
        }, 2 * 60 * 60 * 1000); // 2 hours later
        break;
        
      default:
        console.warn('Unknown update action:', action);
    }
  }

  static async showUpdateReminder() {
    if (this.isUpdateAvailable && this.pendingUpdate) {
      await self.registration.showNotification('🔔 Lembrete de Atualização', {
  body: `Sua atualização do ${BRAND_PRODUCT} ainda está pendente`,
        icon: '/icon-192.png',
        tag: 'update-reminder',
        data: {
          type: 'update-reminder',
          version: this.pendingUpdate.version
        },
        actions: [
          {
            action: 'update-now',
            title: 'Atualizar Agora'
          },
          {
            action: 'dismiss',
            title: 'Dispensar'
          }
        ]
      });
    }
  }

  static async schedulePeriodicUpdateCheck() {
    // Check for updates every 6 hours
    setInterval(() => {
      this.checkForUpdates();
    }, 6 * 60 * 60 * 1000);
    
    // Initial check
    setTimeout(() => {
      this.checkForUpdates();
    }, 30000); // Check 30 seconds after startup
  }

  // Version management
  static getChangelogForVersion(version) {
    // This would typically come from your backend
    return {
      '3.0.0': [
        'Cache strategies avançadas implementadas',
        'Sistema completo de push notifications',
        'Background sync melhorado',
        'Gestão automática de atualizações',
        'Melhorias significativas de performance'
      ]
    }[version] || [];
  }

  static async logUpdateEvent(eventType, data = {}) {
    const event = {
      id: self.crypto.randomUUID(),
      type: eventType,
      timestamp: new Date().toISOString(),
      version: this.currentVersion,
      data: data
    };

    // Store for analytics
    try {
      await this.storeUpdateEvent(event);
    } catch (error) {
      console.error('Failed to log update event:', error);
    }
  }

  static async storeUpdateEvent(event) {
    return new Promise((resolve, reject) => {
  const request = indexedDB.open(`${BRAND_DB_PREFIX}UpdatesDB`, 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['updateEvents'], 'readwrite');
        const store = transaction.objectStore('updateEvents');
        const addRequest = store.add(event);
        
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('updateEvents')) {
          db.createObjectStore('updateEvents', { keyPath: 'id' });
        }
      };
    });
  }
}

// Export for main service worker
self.AppUpdateManager = AppUpdateManager;
