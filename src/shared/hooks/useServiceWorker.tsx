import { useEffect, useState } from 'react';

export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isWaitingForUpdate, setIsWaitingForUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerSW();
    }
  }, []);

  const registerSW = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      setIsInstalled(true);

      // Verificar por atualizações
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsWaitingForUpdate(true);
            }
          });
        }
      });

      console.log('✅ Service Worker registrado');
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setIsWaitingForUpdate(false);
      window.location.reload();
    }
  };

  return {
    isSupported,
    isInstalled,
    isWaitingForUpdate,
    updateServiceWorker
  };
};