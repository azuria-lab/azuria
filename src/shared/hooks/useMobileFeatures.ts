
import { useEffect, useState } from 'react';

export const useMobileFeatures = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone app
    try {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const nav = window.navigator as unknown as { standalone?: boolean };
      const iosStandalone = nav.standalone === true;
      setIsStandalone(standalone || iosStandalone);
    } catch {
      setIsStandalone(false);
    }
  }, []);

  const shareData = async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (_err: unknown) {
        return false;
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(data.url || window.location.href);
      return true;
    } catch {
      return false;
    }
  };

  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  return {
    shareData,
    vibrate,
    isStandalone
  };
};
