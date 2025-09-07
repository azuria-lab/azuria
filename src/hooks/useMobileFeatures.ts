export const useMobileFeatures = () => {
  return {
    isMobile: false,
    isTablet: false,
  shareData: async (_data: { title?: string; text?: string; url?: string }) => false,
    canShare: false,
  vibrate: (_pattern: number | number[]) => {},
    isOnline: true,
    networkType: 'wifi',
    isStandalone: false
  };
};