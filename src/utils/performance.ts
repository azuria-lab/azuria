
/**
 * Utilitários de performance e monitoramento - Somente para desenvolvimento
 */

// Monitorar renderizações lentas
export const measureRender = (componentName: string) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16) { // Mais de 1 frame (16ms)
      logger.warn('Renderização lenta', { component: componentName, durationMs: Number(duration.toFixed(2)) });
    }
  };
};

// Debounce para otimizar eventos frequentes
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Convenience overload for single-argument functions with a specific type
export function debounce1<A>(func: (a: A) => void, wait: number): (a: A) => void {
  let timeout: NodeJS.Timeout;
  return (a: A) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(a), wait);
  };
}

// Throttle para limitar execução de funções
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Convenience overload for single-arg throttle with specific type
export function throttle1<A>(func: (a: A) => void, limit: number): (a: A) => void {
  let inThrottle = false;
  return (a: A) => {
    if (!inThrottle) {
      func(a);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// Detectar problemas de memory leaks - APENAS EM DESENVOLVIMENTO
import { logger } from '../services/logger';

export const detectMemoryLeaks = () => {
  if (process.env.NODE_ENV !== 'development') {return;}
  
  if (typeof window !== 'undefined' && 'performance' in window) {
    const perfAny = performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
    const memory = perfAny.memory;
    
    if (memory) {
      const used = memory.usedJSHeapSize / 1048576; // MB
      const total = memory.totalJSHeapSize / 1048576; // MB
      const limit = memory.jsHeapSizeLimit / 1048576; // MB
      
      logger.info('Memory usage', { usedMB: used.toFixed(2), totalMB: total.toFixed(2), limitMB: limit.toFixed(2) });
      
      if (used / limit > 0.8) {
        logger.warn('High memory usage detected');
      }
    }
  }
};

// Monitor de performance geral - DESABILITADO POR PADRÃO
export const performanceMonitor = {
  init() {
    // Só inicializar se explicitamente habilitado
    const enableMonitoring = localStorage.getItem('azuria-enable-perf-monitor') === 'true';
    
    if (!enableMonitoring || process.env.NODE_ENV !== 'development') {
      return;
    }
    
    if (typeof window !== 'undefined') {
      // Monitorar carregamento inicial
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          logger.info('Page load time', { durationMs: navigation.loadEventEnd - navigation.loadEventStart });
        }, 0);
      });
      
      // Monitorar memory periodicamente em desenvolvimento
      setInterval(detectMemoryLeaks, 60000); // A cada 60 segundos
    }
  }
};

// Hook para medir performance de componentes - OPCIONAL
export const usePerformanceMonitor = (componentName: string) => {
  const measureStart = () => measureRender(componentName);
  
  return { measureStart };
};
