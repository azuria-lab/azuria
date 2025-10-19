
/**
 * Utilitários de performance e monitoramento
 * 
 * Funções para otimizar performance, detectar memory leaks e throttle/debounce.
 * **IMPORTANTE**: Alguns recursos funcionam apenas em desenvolvimento.
 * 
 * @module performance
 */

/**
 * Mede tempo de renderização de componente React
 * 
 * Detecta renderizações lentas (>16ms = 1 frame) e loga warnings.
 * 
 * @param componentName - Nome do componente para rastreamento
 * @returns Função cleanup para ser chamada após renderização
 * 
 * @example
 * ```typescript
 * function HeavyComponent() {
 *   const endMeasure = measureRender('HeavyComponent');
 *   
 *   useEffect(() => {
 *     // Lógica pesada
 *     return endMeasure; // Cleanup
 *   }, []);
 * }
 * ```
 * 
 * @remarks
 * **Threshold**: 16ms (1 frame a 60fps)
 * 
 * **Log**: Warnings no console para renderizações lentas
 * 
 * **Uso**: Desenvolvimento e debugging de performance
 */
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

/**
 * Debounce: Atrasa execução de função até pausa em chamadas
 * 
 * Útil para otimizar eventos frequentes como scroll, resize, input.
 * 
 * @template T - Tipo da função a ser debounced
 * @param func - Função a executar após delay
 * @param wait - Tempo de espera em millisegundos
 * @returns Função debounced
 * 
 * @example
 * ```typescript
 * const searchProducts = (query: string) => {
 *   console.log('Searching:', query);
 *   // Busca na API
 * };
 * 
 * const debouncedSearch = debounce(searchProducts, 300);
 * 
 * // Em um input
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * 
 * // Só executa após 300ms sem novas chamadas
 * ```
 * 
 * @remarks
 * **Padrão**: Cancela execução anterior se nova chamada ocorrer antes do delay
 * 
 * **Use case**: Search bars, form validation, resize handlers
 * 
 * **Performance**: Reduz chamadas de API em ~90% para inputs rápidos
 */
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

/**
 * Throttle: Limita taxa de execução de função
 * 
 * Executa função no máximo uma vez por intervalo, ignorando chamadas extras.
 * 
 * @template T - Tipo da função a ser throttled
 * @param func - Função a executar
 * @param limit - Intervalo mínimo entre execuções (ms)
 * @returns Função throttled
 * 
 * @example
 * ```typescript
 * const trackScroll = (scrollY: number) => {
 *   console.log('Scroll position:', scrollY);
 *   analytics.track('scroll', { position: scrollY });
 * };
 * 
 * const throttledScroll = throttle(trackScroll, 1000);
 * 
 * window.addEventListener('scroll', () => {
 *   throttledScroll(window.scrollY);
 * });
 * 
 * // Executa no máximo 1x por segundo, independente de scroll rápido
 * ```
 * 
 * @remarks
 * **Padrão**: Executa primeira chamada imediatamente, bloqueia próximas até intervalo passar
 * 
 * **Diferença de debounce**: Throttle garante execução regular; debounce pode nunca executar
 * 
 * **Use case**: Scroll handlers, mouse move, window resize
 * 
 * **Performance**: Reduz carga da CPU em eventos de alta frequência
 */
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

/**
 * Detecta vazamentos de memória (memory leaks)
 * 
 * Monitora uso de heap JavaScript e emite warnings se ultrapassar 80% do limite.
 * **Funciona apenas em desenvolvimento e navegadores com API memory**.
 * 
 * @returns void
 * 
 * @example
 * ```typescript
 * // Em componente raiz ou DevTools
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     detectMemoryLeaks();
 *   }, 30000); // A cada 30 segundos
 *   
 *   return () => clearInterval(interval);
 * }, []);
 * 
 * // Output no console:
 * // INFO: Memory usage { usedMB: 45.32, totalMB: 52.10, limitMB: 128.00 }
 * // WARN: High memory usage detected (se > 80%)
 * ```
 * 
 * @remarks
 * **Disponibilidade**: Só funciona em Chrome/Edge (performance.memory)
 * 
 * **Threshold**: Warning a 80% do heap limit
 * 
 * **Environment**: Apenas NODE_ENV=development
 * 
 * **Uso**: Debugging de memory leaks, não para produção
 */
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
