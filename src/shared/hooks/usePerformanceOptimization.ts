
import { useCallback, useEffect, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  lastUpdate: number;
}

export const usePerformanceOptimization = () => {
  // Initialize with default values and add error handling
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => ({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    lastUpdate: Date.now()
  }));

  const measureRenderTime = useCallback((componentName: string, startTime: number) => {
    try {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setMetrics(prev => ({
        ...prev,
        renderTime,
        lastUpdate: Date.now()
      }));
  } catch (_error) {
      // swallow errors silently; alternatively emit to a centralized logger
    }
  }, []);

  const trackMemoryUsage = useCallback(() => {
    try {
      const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
      if (perf.memory && typeof perf.memory.usedJSHeapSize === 'number') {
        const memoryUsage = perf.memory.usedJSHeapSize / 1024 / 1024; // MB

        setMetrics(prev => ({
          ...prev,
          memoryUsage,
          lastUpdate: Date.now()
        }));
      }
  } catch (_error) {
      // noop
    }
  }, []);

  const startPerformanceMeasure = useCallback((_label: string) => {
    try {
      return performance.now();
  } catch (_error) {
      return Date.now();
    }
  }, []);

  useEffect(() => {
    try {
      const interval = setInterval(trackMemoryUsage, 30000); // Track every 30s
      return () => clearInterval(interval);
  } catch (_error) {
  // noop
    }
  }, [trackMemoryUsage]);

  return {
    metrics,
    measureRenderTime,
    startPerformanceMeasure,
    trackMemoryUsage
  };
};
