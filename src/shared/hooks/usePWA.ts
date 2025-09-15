import { useEffect, useState } from "react";

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Initialize online status safely
    try {
      setIsOnline(navigator.onLine);
    } catch {
      setIsOnline(true);
    }

    // Check if app is installed
    const checkIfInstalled = () => {
      try {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        setIsInstalled(isStandalone || isIOSStandalone);
      } catch {
        setIsInstalled(false);
      }
    };

    checkIfInstalled();

    // Event listeners
    // beforeinstallprompt is not yet fully standardized across TS libs
    type BeforeInstallPromptEvent = Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }> };
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const bip = e as BeforeInstallPromptEvent;
      if (bip.prompt && bip.userChoice) {
        setDeferredPrompt({ prompt: bip.prompt, userChoice: bip.userChoice });
      }
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

  const handleOnline = () => { setIsOnline(true); };
  const handleOffline = () => { setIsOnline(false); };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
  if (!deferredPrompt) { return false; }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (_error) {
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp
  };
};
