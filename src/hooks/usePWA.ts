// Placeholder for PWA hook
export const usePWA = () => {
  return {
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    installPrompt: null,
    install: () => {},
    installApp: async () => false,
    isStandalone: false
  };
};