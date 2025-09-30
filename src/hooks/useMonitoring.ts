/**
 * Custom hook for system monitoring and health checks
 * Provides real-time monitoring capabilities with automatic refresh
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { monitoringConfig, MonitoringUtils } from '@/config/monitoring';
import { generateSecureId } from '@/utils/secureRandom';

interface MonitoringMetric {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  description: string;
  lastChecked: Date;
  trend?: 'up' | 'down' | 'stable';
  rawValue?: number;
  unit?: string;
}

interface MonitoringState {
  metrics: MonitoringMetric[];
  overall: 'healthy' | 'warning' | 'critical';
  score: number;
  uptime: string;
  lastUpdate: Date;
  isLoading: boolean;
  error: string | null;
}

interface UseMonitoringOptions {
  autoRefresh?: boolean;
  interval?: number;
  enablePerformanceTracking?: boolean;
}

export const useMonitoring = (options: UseMonitoringOptions = {}) => {
  const {
    autoRefresh = true,
    interval = monitoringConfig.healthCheck.interval,
    enablePerformanceTracking = true
  } = options;

  const [state, setState] = useState<MonitoringState>({
    metrics: [],
    overall: 'healthy',
    score: 100,
    uptime: '0%',
    lastUpdate: new Date(),
    isLoading: true,
    error: null
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  /**
   * Fetch performance metrics from the browser
   */
  const getPerformanceMetrics = useCallback((): MonitoringMetric[] => {
    const metrics: MonitoringMetric[] = [];

    try {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Time to First Byte
        const ttfb = navigation.responseStart - navigation.requestStart;
        metrics.push({
          id: generateSecureId(),
          name: 'Time to First Byte',
          status: MonitoringUtils.checkThreshold(ttfb, { warning: 600, critical: 1000 }),
          value: MonitoringUtils.formatMetric(ttfb, 'ms'),
          description: 'Server response time',
          lastChecked: new Date(),
          rawValue: ttfb,
          unit: 'ms',
          trend: 'stable'
        });

        // DOM Content Loaded
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metrics.push({
          id: generateSecureId(),
          name: 'DOM Content Loaded',
          status: MonitoringUtils.checkThreshold(domContentLoaded, { warning: 1000, critical: 2000 }),
          value: MonitoringUtils.formatMetric(domContentLoaded, 'ms'),
          description: 'DOM parsing and loading time',
          lastChecked: new Date(),
          rawValue: domContentLoaded,
          unit: 'ms',
          trend: 'stable'
        });

        // Load Complete
        const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        if (loadComplete > 0) {
          metrics.push({
            id: generateSecureId(),
            name: 'Page Load Complete',
            status: MonitoringUtils.checkThreshold(loadComplete, { warning: 2000, critical: 4000 }),
            value: MonitoringUtils.formatMetric(loadComplete, 'ms'),
            description: 'Complete page load time',
            lastChecked: new Date(),
            rawValue: loadComplete,
            unit: 'ms',
            trend: 'stable'
          });
        }
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        metrics.push({
          id: generateSecureId(),
          name: 'JavaScript Memory Usage',
          status: MonitoringUtils.checkThreshold(memoryUsage, { warning: 70, critical: 85 }),
          value: `${memoryUsage.toFixed(1)}%`,
          description: `${MonitoringUtils.formatMetric(memory.usedJSHeapSize, 'bytes')} / ${MonitoringUtils.formatMetric(memory.totalJSHeapSize, 'bytes')}`,
          lastChecked: new Date(),
          rawValue: memoryUsage,
          unit: '%',
          trend: 'stable'
        });
      }

      // Connection information
      if ('connection' in navigator) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connection = (navigator as any).connection;
        if (connection) {
          metrics.push({
            id: generateSecureId(),
            name: 'Network Connection',
            status: (() => {
              if (connection.effectiveType === '4g') {
                return 'healthy';
              }
              if (connection.effectiveType === '3g') {
                return 'warning';
              }
              return 'critical';
            })(),
            value: connection.effectiveType || 'unknown',
            description: `${connection.downlink || 0} Mbps, RTT: ${connection.rtt || 0}ms`,
            lastChecked: new Date(),
            trend: 'stable'
          });
        }
      }

    } catch {
      // Handle errors silently
    }

    return metrics;
  }, []);

  /**
   * Fetch application health metrics
   */
  const getApplicationMetrics = useCallback(async (signal: AbortSignal): Promise<MonitoringMetric[]> => {
    const metrics: MonitoringMetric[] = [];
    
    try {
      // Simulate API health check
      const startTime = performance.now();
      
      // In a real application, you would make actual API calls here
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const responseTime = performance.now() - startTime;
      
      metrics.push({
        id: generateSecureId(),
        name: 'API Health',
        status: MonitoringUtils.checkThreshold(responseTime, monitoringConfig.metrics.thresholds.responseTime),
        value: MonitoringUtils.formatMetric(responseTime, 'ms'),
        description: 'Application API response time',
        lastChecked: new Date(),
        rawValue: responseTime,
        unit: 'ms',
        trend: 'stable'
      });

      // Simulate other metrics
      const errorRate = Math.random() * 2; // 0-2% error rate
      metrics.push({
        id: generateSecureId(),
        name: 'Error Rate',
        status: MonitoringUtils.checkThreshold(errorRate, monitoringConfig.metrics.thresholds.errorRate),
        value: `${errorRate.toFixed(2)}%`,
        description: 'Application error rate (24h)',
        lastChecked: new Date(),
        rawValue: errorRate,
        unit: '%',
        trend: (() => {
          if (errorRate < 0.5) {
            return 'down';
          }
          if (errorRate > 1.5) {
            return 'up';
          }
          return 'stable';
        })()
      });

      // Service availability
      metrics.push({
        id: generateSecureId(),
        name: 'Service Availability',
        status: 'healthy',
        value: '99.9%',
        description: 'Service uptime (30 days)',
        lastChecked: new Date(),
        rawValue: 99.9,
        unit: '%',
        trend: 'stable'
      });

    } catch {
      if (!signal.aborted) {
        metrics.push({
          id: generateSecureId(),
          name: 'API Health',
          status: 'critical',
          value: 'Unavailable',
          description: 'Failed to connect to application services',
          lastChecked: new Date(),
          trend: 'down'
        });
      }
    }

    return metrics;
  }, []);

  /**
   * Refresh monitoring data
   */
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Collect metrics
      const performanceMetrics = enablePerformanceTracking ? getPerformanceMetrics() : [];
      const applicationMetrics = await getApplicationMetrics(signal);

      if (signal.aborted) {
        return;
      }

      const allMetrics = [...performanceMetrics, ...applicationMetrics];
      const healthScore = MonitoringUtils.calculateHealthScore(allMetrics);
      
      // Determine overall status
      const criticalCount = allMetrics.filter(m => m.status === 'critical').length;
      const warningCount = allMetrics.filter(m => m.status === 'warning').length;
      
      let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (criticalCount > 0) {
        overall = 'critical';
      } else if (warningCount > 0) {
        overall = 'warning';
      }

      setState(prev => ({
        ...prev,
        metrics: allMetrics,
        overall,
        score: healthScore,
        uptime: '99.8%', // This would come from your monitoring service
        lastUpdate: new Date(),
        isLoading: false,
        error: null
      }));

    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch monitoring data'
        }));
      }
    }
  }, [enablePerformanceTracking, getPerformanceMetrics, getApplicationMetrics]);

  /**
   * Start auto refresh
   */
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(refresh, interval);
  }, [refresh, interval]);

  /**
   * Stop auto refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Initial load and auto refresh setup
  useEffect(() => {
    refresh();
    
    if (autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh, autoRefresh, startAutoRefresh, stopAutoRefresh]);

  return {
    ...state,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    generateReport: () => MonitoringUtils.generateReport(state.metrics, '24h')
  };
};