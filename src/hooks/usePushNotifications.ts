// Placeholder for push notifications hook
export const usePushNotifications = () => {
  return {
    isSupported: false,
    isSubscribed: false,
    permission: { granted: false, denied: false, default: true },
    subscribe: () => {},
    unsubscribe: () => {},
    requestPermission: async () => false,
  sendPriceAlert: (_productName: string, _oldPrice: number, _newPrice: number) => false,
  sendMarketUpdate: (_message: string) => false,
    sendCalculationReminder: () => false
  };
};