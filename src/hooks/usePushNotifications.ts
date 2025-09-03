// Placeholder for push notifications hook
export const usePushNotifications = () => {
  return {
    isSupported: false,
    isSubscribed: false,
    permission: { granted: false, denied: false, default: true },
    subscribe: () => {},
    unsubscribe: () => {},
    requestPermission: async () => false,
    sendPriceAlert: (productName: string, oldPrice: number, newPrice: number) => false,
    sendMarketUpdate: (message: string) => false,
    sendCalculationReminder: () => false
  };
};