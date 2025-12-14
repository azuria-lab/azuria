// PWA initialization and registration
import { logger } from '../services/logger';

export interface PWAOptions {
  enableNotifications?: boolean;
  enableBackgroundSync?: boolean;
  updateCheckInterval?: number;
}

class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private readonly options: PWAOptions;

  constructor(options: PWAOptions = {}) {
    this.options = {
      enableNotifications: true,
      enableBackgroundSync: true,
      updateCheckInterval: 60000, // 1 minute
      ...options
    };
  }

  async init(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
  logger.warn('Service Worker not supported');
      return;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

  logger.info('Service Worker registered successfully');

      // Set up update checking
      this.setupUpdateChecking();

      // Set up push notifications
      if (this.options.enableNotifications) {
        await this.setupNotifications();
      }

      // Set up background sync
      if (this.options.enableBackgroundSync) {
        this.setupBackgroundSync();
      }

      // Listen for service worker events
      this.setupEventListeners();

    } catch (error) {
      logger.error('Service Worker registration failed', { error });
    }
  }

  private setupUpdateChecking(): void {
    if (!this.swRegistration) {return;}

    // Check for updates periodically
    setInterval(() => {
      this.swRegistration?.update();
    }, this.options.updateCheckInterval);

    // Listen for updates
    this.swRegistration.addEventListener('updatefound', () => {
      const newWorker = this.swRegistration?.installing ?? null;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.notifyUpdate();
          }
        });
      }
    });
  }

  private async setupNotifications(): Promise<void> {
    if (!('Notification' in globalThis)) {
      logger.warn('Notifications not supported');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        logger.info('Notifications enabled');
        this.subscribeToNotifications();
      }
    } else if (Notification.permission === 'granted') {
      this.subscribeToNotifications();
    }
  }

  private async subscribeToNotifications(): Promise<void> {
    if (!this.swRegistration) {return;}

    try {
      const vapidKey = this.urlB64ToUint8Array(
        // Your VAPID public key would go here
        'YOUR_VAPID_PUBLIC_KEY'
      );
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey.buffer as ArrayBuffer
      });

  logger.info('Push subscription created', { endpoint: subscription.endpoint });
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
    } catch (error) {
      logger.error('Failed to subscribe to notifications', { error });
    }
  }

  private setupBackgroundSync(): void {
    if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
      logger.warn('Background Sync not supported');
      return;
    }

    // This will be called when data needs to be synced
    globalThis.addEventListener('online', () => {
      this.triggerBackgroundSync('sync-calculations');
    });
  }

  private setupEventListeners(): void {
    navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
      const data = event.data as unknown;
      if (!data || typeof data !== 'object') {return;}
      const { type, payload } = data as { type?: string; payload?: unknown };

      switch (type) {
        case 'UPDATE_AVAILABLE':
          this.notifyUpdate();
          break;
        case 'SYNC_COMPLETE':
          this.notifySyncComplete(payload);
          break;
        case 'CACHE_UPDATED':
          logger.info('Cache updated', { payload });
          break;
      }
    });

    // Handle app installation
    globalThis.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.showInstallPrompt(event);
    });

    // Handle app installation success
    globalThis.addEventListener('appinstalled', () => {
      logger.info('PWA installed successfully');
      this.trackInstallation();
    });
  }

  async triggerBackgroundSync(tag: string): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    // Check if background sync is supported
    const hasBackgroundSync = (
      reg: ServiceWorkerRegistration
    ): reg is ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } } => {
      return 'sync' in (reg as unknown as Record<string, unknown>);
    };

    if (this.swRegistration && hasBackgroundSync(this.swRegistration)) {
      try {
        await this.swRegistration.sync.register(tag);
        logger.info('Background sync registered', { tag });
      } catch (error) {
        logger.error('Background sync registration failed', { error });
      }
    } else {
      logger.warn('Background Sync not supported');
    }
  }

  private notifyUpdate(): void {
    // Show update notification to user
    const event = new CustomEvent('pwa-update-available', {
      detail: {
        message: 'Nova versão disponível! Recarregue para atualizar.',
        action: () => globalThis.location.reload()
      }
    });
    
    globalThis.dispatchEvent(event);
  }

  private notifySyncComplete(payload: unknown): void {
    const event = new CustomEvent('pwa-sync-complete', {
      detail: payload
    });
    
    globalThis.dispatchEvent(event);
  }

  // Minimal BeforeInstallPromptEvent guard
  private isBeforeInstallPromptEvent(e: unknown): e is Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  } {
    return !!e && typeof e === 'object' && 'prompt' in e && 'userChoice' in e;
  }

  private showInstallPrompt(event: Event): void {
    // Show custom install prompt
    const installEvent = new CustomEvent('pwa-install-prompt', {
      detail: {
        prompt: event,
        install: async () => {
          if (this.isBeforeInstallPromptEvent(event)) {
            await event.prompt();
            const { outcome } = await event.userChoice;
            logger.info('Install prompt outcome', { outcome });
          } else {
            logger.warn('beforeinstallprompt event missing expected API');
          }
        }
      }
    });
    
    globalThis.dispatchEvent(installEvent);
  }

  private trackInstallation(): void {
    // Track installation analytics
    const event = new CustomEvent('pwa-installed');
    globalThis.dispatchEvent(event);
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      logger.error('Failed to send subscription to server', { error });
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replaceAll('-', '+')
      .replaceAll('_', '/');

    const rawData = globalThis.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.codePointAt(i) ?? 0;
    }
    return outputArray;
  }

  // Public methods for manual control
  async checkForUpdates(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.update();
    }
  }

  async skipWaiting(): Promise<void> {
    if (this.swRegistration?.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  isInstalled(): boolean {
    return globalThis.matchMedia('(display-mode: standalone)').matches;
  }
}

// Create singleton instance
const pwaManager = new PWAManager();

// Auto-initialize
if (globalThis.window !== undefined) {
  globalThis.window.addEventListener('load', () => {
    pwaManager.init();
  });
}

export default pwaManager;