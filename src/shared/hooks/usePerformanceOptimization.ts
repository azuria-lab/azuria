
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
      
      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.error('Error measuring render time:', error);
    }
  }, []);

  const trackMemoryUsage = useCallback(() => {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage,
          lastUpdate: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error tracking memory usage:', error);
    }
  }, []);

  const startPerformanceMeasure = useCallback((label: string) => {
    try {
      return performance.now();
    } catch (error) {
      console.error('Error starting performance measure:', error);
      return Date.now();
    }
  }, []);

  useEffect(() => {
    try {
      const interval = setInterval(trackMemoryUsage, 30000); // Track every 30s
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error setting up memory tracking interval:', error);
    }
  }, [trackMemoryUsage]);

  return {
    metrics,
    measureRenderTime,
    startPerformanceMeasure,
    trackMemoryUsage
  };
};
