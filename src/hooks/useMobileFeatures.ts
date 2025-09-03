export const useMobileFeatures = () => {
  return {
    isMobile: false,
    isTablet: false,
    shareData: async (data: any) => false,
    canShare: false,
    vibrate: (pattern: number | number[]) => {},
    isOnline: true,
    networkType: 'wifi',
    isStandalone: false
  };
};