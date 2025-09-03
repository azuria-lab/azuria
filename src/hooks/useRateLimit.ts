export const useRateLimit = (config?: any) => {
  return {
    isLimited: false,
    remaining: 100,
    resetTime: new Date(),
    checkLimit: (config?: any) => false,
    getResetTime: () => Date.now(),
    getRemainingRequests: () => 100
  };
};