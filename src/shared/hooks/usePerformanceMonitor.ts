import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWebVitals } from './useWebVitals';

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'component' | 'api' | 'user-interaction' | 'navigation';
  metadata?: Record<string, any>;
}

interface PerformanceBudget {
  componentRender: number; // ms
  apiResponse: number; // ms
  userInteraction: number; // ms
  pageLoad: number; // ms
}

const DEFAULT_BUDGET: PerformanceBudget = {
  componentRender: 16, // 1 frame
  apiResponse: 1000, // 1 segundo
  userInteraction: 100, // 100ms
  pageLoad: 3000 // 3 segundos
};

export const usePerformanceMonitor = (budget: Partial<PerformanceBudget> = {}) => {
  const performanceBudget = { ...DEFAULT_BUDGET, ...budget };
  const performanceEntries = useRef<PerformanceEntry[]>([]);
  const [violations, setViolations] = useState<PerformanceEntry[]>([]);
  const metricsRef = useRef({
    totalMeasures: 0,
    violationsCount: 0,
    averageRenderTime: 0,
    averageApiTime: 0
  });

  // Web Vitals monitoring
  const { getMetrics, getScore } = useWebVitals({
    onMetric: (metric) => {
      console.log(`[Performance] ${metric.name}: ${metric.value} (${metric.rating})`);
      
      // Alert sobre métricas ruins
      if (metric.rating === 'poor') {
        console.warn(`[Performance Alert] Poor ${metric.name}: ${metric.value}`);
      }
    }
  });

  // Adicionar entrada de performance
  const addEntry = useCallback((entry: Omit<PerformanceEntry, 'startTime'>) => {
    const fullEntry: PerformanceEntry = {
      ...entry,
      startTime: performance.now()
    };
    
    performanceEntries.current.push(fullEntry);
    
    // Manter apenas as últimas 100 entradas
    if (performanceEntries.current.length > 100) {
      performanceEntries.current.shift();
    }
    
    metricsRef.current.totalMeasures++;
    
    // Verificar violações de budget
    const budgetLimit = getBudgetLimit(entry.type);
    if (entry.duration > budgetLimit) {
      const violation = fullEntry;
      setViolations(prev => [...prev.slice(-19), violation]); // Manter últimas 20
      metricsRef.current.violationsCount++;
      
      console.warn(`[Performance Budget Violation] ${entry.type}: ${entry.duration}ms > ${budgetLimit}ms`, {
        name: entry.name,
        metadata: entry.metadata
      });
    }
    
    // Atualizar métricas
    updateMetrics();
  }, []);

  const getBudgetLimit = (type: PerformanceEntry['type']): number => {
    switch (type) {
      case 'component': return performanceBudget.componentRender;
      case 'api': return performanceBudget.apiResponse;
      case 'user-interaction': return performanceBudget.userInteraction;
      case 'navigation': return performanceBudget.pageLoad;
      default: return 1000;
    }
  };

  const updateMetrics = useCallback(() => {
    const entries = performanceEntries.current;
    const componentEntries = entries.filter(e => e.type === 'component');
    const apiEntries = entries.filter(e => e.type === 'api');
    
    metricsRef.current.averageRenderTime = componentEntries.length > 0
      ? componentEntries.reduce((sum, e) => sum + e.duration, 0) / componentEntries.length
      : 0;
      
    metricsRef.current.averageApiTime = apiEntries.length > 0
      ? apiEntries.reduce((sum, e) => sum + e.duration, 0) / apiEntries.length
      : 0;
  }, []);

  // Measure component render time
  const measureComponent = useCallback((name: string) => {
    const startTime = performance.now();
    
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        addEntry({
          name,
          duration,
          type: 'component',
          metadata
        });
        return duration;
      }
    };
  }, [addEntry]);

  // Measure API call time
  const measureAPI = useCallback((name: string) => {
    const startTime = performance.now();
    
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        addEntry({
          name,
          duration,
          type: 'api',
          metadata
        });
        return duration;
      }
    };
  }, [addEntry]);

  // Measure user interaction time
  const measureInteraction = useCallback((name: string) => {
    const startTime = performance.now();
    
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        addEntry({
          name,
          duration,
          type: 'user-interaction',
          metadata
        });
        return duration;
      }
    };
  }, [addEntry]);

  // HOC para monitorar componentes automaticamente
  const withPerformanceMonitoring = useCallback((
    Component: React.ComponentType<any>,
    componentName?: string
  ) => {
    return React.forwardRef((props: any, ref: any) => {
      const name = componentName || Component.displayName || Component.name || 'Unknown';
      const measure = measureComponent(name);
      
      useEffect(() => {
        measure.end();
      });
      
      return React.createElement(Component, { ...props, ref });
    });
  }, [measureComponent]);

  // Obter relatório de performance
  const getPerformanceReport = useCallback(() => {
    const entries = performanceEntries.current;
    const vitalsMetrics = getMetrics();
    const vitalsScore = getScore();
    
    return {
      entries: entries.slice(-50), // Últimas 50 entradas
      violations: violations.slice(-20), // Últimas 20 violações
      metrics: {
        ...metricsRef.current,
        violationRate: metricsRef.current.totalMeasures > 0 
          ? (metricsRef.current.violationsCount / metricsRef.current.totalMeasures) * 100 
          : 0
      },
      webVitals: vitalsMetrics,
      webVitalsScore: vitalsScore,
      budget: performanceBudget,
      recommendations: generateRecommendations()
    };
  }, [violations, getMetrics, getScore]);

  const generateRecommendations = useCallback(() => {
    const recommendations = [];
    const metrics = metricsRef.current;
    
    if (metrics.averageRenderTime > performanceBudget.componentRender) {
      recommendations.push({
        type: 'component-optimization',
        message: 'Componentes estão renderizando lentamente. Considere usar React.memo() e otimizar re-renders.',
        priority: 'high'
      });
    }
    
    if (metrics.averageApiTime > performanceBudget.apiResponse) {
      recommendations.push({
        type: 'api-optimization',
        message: 'APIs estão respondendo lentamente. Implemente cache e otimize queries.',
        priority: 'medium'
      });
    }
    
    const violationRate = metrics.totalMeasures > 0 ? (metrics.violationsCount / metrics.totalMeasures) * 100 : 0;
    if (violationRate > 20) {
      recommendations.push({
        type: 'budget-review',
        message: 'Muitas violações de performance budget. Revise os limites ou otimize o código.',
        priority: 'high'
      });
    }
    
    return recommendations;
  }, [performanceBudget]);

  // Limpar dados antigos
  const clearData = useCallback(() => {
    performanceEntries.current = [];
    setViolations([]);
    metricsRef.current = {
      totalMeasures: 0,
      violationsCount: 0,
      averageRenderTime: 0,
      averageApiTime: 0
    };
  }, []);

  // Monitor de long tasks (experimental)
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Long task > 50ms
              console.warn(`[Long Task] ${entry.name}: ${entry.duration}ms`);
              addEntry({
                name: `Long Task: ${entry.name}`,
                duration: entry.duration,
                type: 'navigation',
                metadata: { type: 'long-task' }
              });
            }
          }
        });
        
        observer.observe({ type: 'longtask', buffered: true });
        
        return () => observer.disconnect();
      } catch (error) {
        console.warn('PerformanceObserver not fully supported');
      }
    }
  }, [addEntry]);

  return {
    measureComponent,
    measureAPI,
    measureInteraction,
    withPerformanceMonitoring,
    getPerformanceReport,
    clearData,
    violations,
    performanceBudget
  };
};

// Hook para monitorar performance de uma função específica
export const usePerformanceFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  const { measureInteraction } = usePerformanceMonitor();
  
  return useCallback((...args: Parameters<T>) => {
    const measure = measureInteraction(name);
    try {
      const result = fn(...args);
      
      // Se for promise, medir tempo completo
      if (result instanceof Promise) {
        return result.finally(() => {
          measure.end({ args: args.length });
        });
      }
      
      measure.end({ args: args.length });
      return result;
    } catch (error) {
      measure.end({ error: true, args: args.length });
      throw error;
    }
  }, [fn, name, measureInteraction]) as T;
};