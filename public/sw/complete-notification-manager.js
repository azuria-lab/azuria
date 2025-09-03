
// Complete Push Notifications Manager
class CompleteNotificationManager {
  static NOTIFICATION_TYPES = {
    PRICE_ALERT: 'price-alert',
    MARKET_UPDATE: 'market-update',
    CALCULATION_REMINDER: 'calculation-reminder',
    SYSTEM_UPDATE: 'system-update',
    SOCIAL: 'social-notification'
  };

  static async handleAdvancedPushEvent(event) {
    let data;
    
    try {
      data = event.data ? event.data.json() : {};
    } catch (error) {
      console.error('Failed to parse push data:', error);
      data = { type: 'default', title: 'Precifica+', body: 'Nova notificação disponível' };
    }

    const notificationConfig = this.buildNotificationConfig(data);
    
    // Store notification for analytics
    await this.storeNotificationMetrics(data);
    
    // Show notification
    await self.registration.showNotification(
      notificationConfig.title,
      notificationConfig.options
    );

    // Badge update
    if ('setAppBadge' in navigator) {
      const badgeCount = await this.getUnreadNotificationsCount();
      navigator.setAppBadge(badgeCount);
    }
  }

  static buildNotificationConfig(data) {
    const baseConfig = {
      icon: '/icon-192.png',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      renotify: true,
      timestamp: Date.now()
    };

    switch (data.type) {
      case this.NOTIFICATION_TYPES.PRICE_ALERT:
        return {
          title: '🔔 Alerta de Preço - Precifica+',
          options: {
            ...baseConfig,
            body: data.body || 'Mudança significativa detectada nos preços',
            icon: '/icon-192.png',
            tag: 'price-alert',
            requireInteraction: true,
            data: {
              url: '/calculadora-simples',
              type: data.type,
              productId: data.productId,
              oldPrice: data.oldPrice,
              newPrice: data.newPrice
            },
            actions: [
              {
                action: 'view-calculator',
                title: 'Ver Calculadora',
                icon: '/icon-192.png'
              },
              {
                action: 'dismiss',
                title: 'Dispensar'
              }
            ]
          }
        };

      case this.NOTIFICATION_TYPES.MARKET_UPDATE:
        return {
          title: '📊 Atualização de Mercado',
          options: {
            ...baseConfig,
            body: data.body || 'Novas tendências de mercado disponíveis',
            tag: 'market-update',
            data: {
              url: '/analytics',
              type: data.type,
              marketData: data.marketData
            },
            actions: [
              {
                action: 'view-analytics',
                title: 'Ver Análise'
              },
              {
                action: 'dismiss',
                title: 'Mais Tarde'
              }
            ]
          }
        };

      case this.NOTIFICATION_TYPES.CALCULATION_REMINDER:
        return {
          title: '💡 Lembrete Precifica+',
          options: {
            ...baseConfig,
            body: data.body || 'Que tal fazer uma nova análise de preços?',
            tag: 'calculation-reminder',
            data: {
              url: '/calculadora-simples',
              type: data.type
            },
            actions: [
              {
                action: 'new-calculation',
                title: 'Nova Calculadora'
              },
              {
                action: 'remind-later',
                title: 'Lembrar Mais Tarde'
              }
            ]
          }
        };

      case this.NOTIFICATION_TYPES.SYSTEM_UPDATE:
        return {
          title: '🚀 Precifica+ Atualizado',
          options: {
            ...baseConfig,
            body: data.body || 'Nova versão disponível com melhorias',
            tag: 'system-update',
            requireInteraction: true,
            data: {
              url: '/',
              type: data.type,
              version: data.version,
              features: data.features
            },
            actions: [
              {
                action: 'view-updates',
                title: 'Ver Novidades'
              },
              {
                action: 'dismiss',
                title: 'OK'
              }
            ]
          }
        };

      case this.NOTIFICATION_TYPES.SOCIAL:
        return {
          title: '👥 Precifica+ Social',
          options: {
            ...baseConfig,
            body: data.body || 'Nova atividade social disponível',
            tag: 'social',
            data: {
              url: '/social',
              type: data.type,
              socialData: data.socialData
            },
            actions: [
              {
                action: 'view-activity',
                title: 'Ver Atividade'
              },
              {
                action: 'dismiss',
                title: 'Dispensar'
              }
            ]
          }
        };

      default:
        return {
          title: data.title || 'Precifica+',
          options: {
            ...baseConfig,
            body: data.body || 'Nova notificação disponível',
            tag: 'default',
            data: {
              url: data.url || '/',
              type: 'default'
            }
          }
        };
    }
  }

  static async handleAdvancedNotificationClick(event) {
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    const action = event.action;

    // Analytics tracking
    await this.trackNotificationInteraction(notificationData.type, action || 'click');

    // Handle specific actions
    switch (action) {
      case 'view-calculator':
      case 'new-calculation':
        await this.openWindow('/calculadora-simples');
        break;
        
      case 'view-analytics':
        await this.openWindow('/analytics');
        break;
        
      case 'view-updates':
        await this.openWindow('/', { showUpdateModal: true });
        break;
        
      case 'view-activity':
        await this.openWindow('/social');
        break;
        
      case 'remind-later':
        await this.scheduleReminder(4 * 60 * 60 * 1000); // 4 hours
        break;
        
      case 'dismiss':
        // Just close - no action needed
        break;
        
      default:
        // Default click behavior
        const targetUrl = notificationData.url || '/';
        await this.openWindow(targetUrl);
    }

    // Update badge count
    if ('setAppBadge' in navigator) {
      const badgeCount = await this.getUnreadNotificationsCount();
      navigator.setAppBadge(Math.max(0, badgeCount - 1));
    }
  }

  static async openWindow(url, params = {}) {
    const clients = await self.clients.matchAll({ type: 'window' });
    
    // Try to focus existing window
    for (const client of clients) {
      if (client.url.includes(url.split('?')[0])) {
        await client.focus();
        
        // Send params to existing window
        if (Object.keys(params).length > 0) {
          client.postMessage({ type: 'NOTIFICATION_PARAMS', params });
        }
        
        return;
      }
    }
    
    // Open new window
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    await self.clients.openWindow(fullUrl);
  }

  static async storeNotificationMetrics(data) {
    try {
      const metrics = {
        id: self.crypto.randomUUID(),
        type: data.type,
        timestamp: new Date().toISOString(),
        title: data.title,
        body: data.body,
        delivered: true
      };

      // Store in IndexedDB for later sync
      await this.storeInIndexedDB('notificationMetrics', metrics);
    } catch (error) {
      console.error('Failed to store notification metrics:', error);
    }
  }

  static async trackNotificationInteraction(type, action) {
    try {
      const interaction = {
        id: self.crypto.randomUUID(),
        type: type,
        action: action,
        timestamp: new Date().toISOString()
      };

      await this.storeInIndexedDB('notificationInteractions', interaction);
    } catch (error) {
      console.error('Failed to track notification interaction:', error);
    }
  }

  static async storeInIndexedDB(storeName, data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PrecificaNotificationsDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const addRequest = store.add(data);
        
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }

  static async getUnreadNotificationsCount() {
    // Implement logic to get unread notifications count
    // This would typically check with your backend or local storage
    return 0;
  }

  static async scheduleReminder(delayMs) {
    // Schedule a reminder notification
    setTimeout(async () => {
      await self.registration.showNotification('💡 Lembrete Precifica+', {
        body: 'Que tal fazer uma nova análise de preços agora?',
        icon: '/icon-192.png',
        tag: 'scheduled-reminder',
        data: { url: '/calculadora-simples', type: 'reminder' }
      });
    }, delayMs);
  }

  // Notification templates for easy use
  static async sendPriceAlert(productName, oldPrice, newPrice) {
    const data = {
      type: this.NOTIFICATION_TYPES.PRICE_ALERT,
      productId: productName,
      oldPrice: oldPrice,
      newPrice: newPrice,
      body: `${productName}: R$ ${newPrice.toFixed(2)} (antes R$ ${oldPrice.toFixed(2)})`
    };

    const config = this.buildNotificationConfig(data);
    await self.registration.showNotification(config.title, config.options);
  }

  static async sendMarketUpdate(message, marketData) {
    const data = {
      type: this.NOTIFICATION_TYPES.MARKET_UPDATE,
      body: message,
      marketData: marketData
    };

    const config = this.buildNotificationConfig(data);
    await self.registration.showNotification(config.title, config.options);
  }
}

// Export for main service worker
self.CompleteNotificationManager = CompleteNotificationManager;
