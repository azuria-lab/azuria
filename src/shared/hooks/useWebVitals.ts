
import { useEffect, useRef } from 'react';

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries?: PerformanceEntry[];
}

interface UseWebVitalsOptions {
  onMetric?: (metric: WebVitalsMetric) => void;
  reportAllChanges?: boolean;
}

export const useWebVitals = ({ onMetric, reportAllChanges = false }: UseWebVitalsOptions = {}) => {
  const metricsRef = useRef<Map<string, WebVitalsMetric>>(new Map());

  useEffect(() => {
    // Dynamic import to avoid loading web-vitals in SSR
    const loadWebVitals = async () => {
      try {
        // Check if web-vitals is available
        type WebVitalsModule = {
          onCLS?: (cb: (m: WebVitalsMetric) => void, options?: { reportAllChanges?: boolean }) => void;
          onFID?: (cb: (m: WebVitalsMetric) => void) => void;
          onFCP?: (cb: (m: WebVitalsMetric) => void) => void;
          onLCP?: (cb: (m: WebVitalsMetric) => void, options?: { reportAllChanges?: boolean }) => void;
          onTTFB?: (cb: (m: WebVitalsMetric) => void) => void;
          onINP?: (cb: (m: WebVitalsMetric) => void) => void;
        };
        const webVitals = (await import('web-vitals').catch(() => null)) as unknown as WebVitalsModule | null;
        if (!webVitals) { return; }

        // web-vitals v3 uses onCLS/onINP/onLCP/onFID/onTTFB/onFCP
        const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals;

        const handleMetric = (metric: WebVitalsMetric) => {
          metricsRef.current.set(metric.name, metric);
          onMetric?.(metric);
        };

        // Coletar métricas
        // For CLS/LCP use the options object for reportAllChanges
        onCLS?.(handleMetric, { reportAllChanges });
        onFID?.(handleMetric);
        onFCP?.(handleMetric);
        onLCP?.(handleMetric, { reportAllChanges });
        onTTFB?.(handleMetric);
        onINP?.(handleMetric);

      } catch (_error) {
        // Silencioso para cumprir regra no-console
      }
    };

    loadWebVitals();
  }, [onMetric, reportAllChanges]);

  const getMetrics = () => {
    return Array.from(metricsRef.current.values());
  };

  const getMetric = (name: WebVitalsMetric['name']) => {
    return metricsRef.current.get(name);
  };

  const getScore = () => {
    const metrics = getMetrics();
    if (metrics.length === 0) {return null;}

    const scores = {
      good: 0,
      'needs-improvement': 0,
      poor: 0
    };

    metrics.forEach(metric => {
      scores[metric.rating]++;
    });

    const total = metrics.length;
    return {
      good: (scores.good / total) * 100,
      needsImprovement: (scores['needs-improvement'] / total) * 100,
      poor: (scores.poor / total) * 100,
      total
    };
  };

  return {
    getMetrics,
    getMetric,
    getScore
  };
};

// Hook para monitoramento de performance customizado
export const usePerformanceMonitoring = () => {
  const performanceDataRef = useRef<{
    navigationStart: number;
    renderTimes: number[];
    userInteractions: number;
  errors: Array<{ message: string; stack?: string; timestamp: number }>;
  }>({
    navigationStart: performance.now(),
    renderTimes: [],
    userInteractions: 0,
    errors: []
  });

  const recordRenderTime = (duration: number) => {
    performanceDataRef.current.renderTimes.push(duration);
    
    // Manter apenas os últimos 50 renders
    if (performanceDataRef.current.renderTimes.length > 50) {
      performanceDataRef.current.renderTimes.shift();
    }
  };

  const recordUserInteraction = () => {
    performanceDataRef.current.userInteractions++;
  };

  const recordError = (error: Error) => {
    performanceDataRef.current.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  };

  const getPerformanceReport = () => {
    const data = performanceDataRef.current;
    const avgRenderTime = data.renderTimes.length > 0 
      ? data.renderTimes.reduce((a, b) => a + b, 0) / data.renderTimes.length 
      : 0;
    
    const slowRenders = data.renderTimes.filter(time => time > 16).length;
    const sessionDuration = performance.now() - data.navigationStart;

    return {
      averageRenderTime: avgRenderTime,
      slowRenders,
      totalRenders: data.renderTimes.length,
      userInteractions: data.userInteractions,
      errors: data.errors.length,
      sessionDuration,
      performanceScore: calculatePerformanceScore(avgRenderTime, slowRenders, data.errors.length)
    };
  };

  return {
    recordRenderTime,
    recordUserInteraction,
    recordError,
    getPerformanceReport
  };
};

const calculatePerformanceScore = (avgRenderTime: number, slowRenders: number, errorCount: number): number => {
  let score = 100;
  
  // Penalizar renders lentos
  if (avgRenderTime > 16) {score -= Math.min(30, (avgRenderTime - 16) * 2);}
  
  // Penalizar muitos renders lentos
  if (slowRenders > 5) {score -= Math.min(20, (slowRenders - 5) * 2);}
  
  // Penalizar erros
  score -= errorCount * 10;
  
  return Math.max(0, Math.floor(score));
};
