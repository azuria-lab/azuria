import { getBackgroundSyncService } from '@/services/backgroundSyncService';

export const useBackgroundSync = () => {
  const service = getBackgroundSyncService();

  const queueCalculation = (calculationData: unknown) => {
    return service.queueForSync('calculation', calculationData);
  };

  const queueSettings = (settingsData: unknown) => {
    return service.queueForSync('settings', settingsData);
  };

  const queueUserData = (userData: unknown) => {
    return service.queueForSync('user_data', userData);
  };

  const queueAnalytics = (analyticsData: unknown) => {
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
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
};
