import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  isLowEndDevice: boolean;
  prefersReducedMotion: boolean;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
}

/**
 * Hook para detectar performance do dispositivo e otimizar carregamento
 */
export const usePerformanceOptimization = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isLowEndDevice: false,
    prefersReducedMotion: false,
    connectionSpeed: 'unknown',
  });

  useEffect(() => {
    // Detectar preferência de movimento reduzido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    // Detectar dispositivo de baixo desempenho
    // Baseado em: número de cores, memória, hardware concurrency
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4; // GB
    const isLowEndDevice = hardwareConcurrency <= 2 || deviceMemory <= 2;

    // Detectar velocidade de conexão
    interface NetworkInformation {
      effectiveType?: string;
    }
    const connection = (navigator as Navigator & { 
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    }).connection || (navigator as Navigator & { mozConnection?: NetworkInformation }).mozConnection || (navigator as Navigator & { webkitConnection?: NetworkInformation }).webkitConnection;
    let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'unknown';
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionSpeed = 'slow';
      } else if (effectiveType === '3g' || effectiveType === '4g') {
        connectionSpeed = 'fast';
      }
    }

    setMetrics({
      isLowEndDevice,
      prefersReducedMotion,
      connectionSpeed,
    });

    // Listener para mudanças na preferência de movimento
    const handleChange = (e: MediaQueryListEvent) => {
      setMetrics(prev => ({
        ...prev,
        prefersReducedMotion: e.matches,
      }));
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return metrics;
};

