
import { useEffect, useState } from 'react';
import { logger } from '@/services/logger';
import { BRANDING } from '@/config/branding';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);

    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default'
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {return false;}

    try {
      const result = await Notification.requestPermission();
      const newPermission = {
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default'
      };
      setPermission(newPermission);
      return newPermission.granted;
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!permission.granted) {return false;}

    try {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
      return true;
    } catch (error) {
      logger.error('Error showing notification:', error);
      return false;
    }
  };

  // Utility functions for specific notification types
  const sendPriceAlert = (productName: string, oldPrice: number, newPrice: number) => {
  return showNotification(`🔔 Alerta de Preço - ${BRANDING.productName}`, {
      body: `${productName}: R$ ${newPrice.toFixed(2)} (antes R$ ${oldPrice.toFixed(2)})`,
      tag: 'price-alert',
      requireInteraction: true
    });
  };

  const sendMarketUpdate = (message: string) => {
    return showNotification('📊 Atualização de Mercado', {
      body: message,
      tag: 'market-update'
    });
  };

  const sendCalculationReminder = () => {
  return showNotification(`💡 Lembrete ${BRANDING.productName}`, {
      body: 'Que tal fazer uma nova análise de preços?',
      tag: 'calculation-reminder'
    });
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    sendPriceAlert,
    sendMarketUpdate,
    sendCalculationReminder
  };
};
