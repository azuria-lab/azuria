import { useCallback, useRef, useState } from 'react';

/**
 * @fileoverview Hooks para prefetch de rotas e componentes
 * 
 * Estratégias:
 * 1. Prefetch em hover com delay (evita prefetch em mouse passando rápido)
 * 2. Cache de módulos já carregados
 * 3. Prefetch em batch para múltiplas rotas
 */

// Mapeamento de rotas para módulos lazy-loaded
const ROUTE_MODULES: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/pages/DashboardPage'),
  '/calculadora-simples': () => import('@/pages/SimpleCalculatorPage'),
  '/calculadora-avancada': () => import('@/pages/AdvancedProCalculatorPage'),
  '/calculadora-tributaria': () => import('@/pages/TaxCalculatorPage'),
  '/calculadora-lotes': () => import('@/pages/BatchCalculatorPage'),
  '/calculadora-licitacao': () => import('@/pages/BiddingCalculatorPage'),
  '/analytics': () => import('@/pages/AdvancedAnalyticsDashboard'),
  '/analytics-basico': () => import('@/pages/AnalyticsDashboardPage'),
  '/historico': () => import('@/pages/HistoryPage'),
  '/integracoes': () => import('@/pages/IntegrationsPage'),
  '/templates': () => import('@/pages/Templates'),
  '/relatorios': () => import('@/pages/ReportsPage'),
  '/marketplace': () => import('@/pages/MarketplacePage'),
  '/dashboard-licitacoes': () => import('@/pages/BiddingDashboardPage'),
  '/azuria-ia': () => import('@/pages/AzuriaAIHub'),
  '/configuracoes': () => import('@/pages/SettingsPage'),
};

// Cache global de módulos já carregados
const loadedModules = new Set<string>();

/**
 * Hook for prefetching routes and components on hover
 */
type Importer<T = unknown> = () => Promise<T>;
export const usePrefetch = (importFn: Importer) => {
  const [prefetched, setPrefetched] = useState(false);
  
  const prefetch = useCallback(async () => {
    if (prefetched) {return;}
    
    try {
      await importFn();
      setPrefetched(true);
    } catch {
      // Prefetch errors are non-critical, component will load on demand
      setPrefetched(false);
    }
  }, [importFn, prefetched]);
  
  const handleMouseEnter = useCallback(() => {
    prefetch();
  }, [prefetch]);
  
  const handleFocus = useCallback(() => {
    prefetch();
  }, [prefetch]);
  
  return {
    prefetch,
    prefetched,
    onMouseEnter: handleMouseEnter,
    onFocus: handleFocus,
  };
};

/**
 * Hook for prefetching multiple routes
 */
export const useBatchPrefetch = (importFns: Array<Importer>) => {
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<Set<number>>(new Set());
  
  const prefetchRoute = useCallback(async (index: number) => {
    if (prefetchedRoutes.has(index)) {return;}
    
    try {
      await importFns[index]();
      setPrefetchedRoutes(prev => new Set([...prev, index]));
    } catch {
      // Individual prefetch failures are non-critical
      // Component will load on demand when user navigates
    }
  }, [importFns, prefetchedRoutes]);
  
  const prefetchAll = useCallback(async () => {
    const promises = importFns.map((fn, index) => 
      prefetchedRoutes.has(index) ? Promise.resolve() : prefetchRoute(index)
    );
    
    await Promise.allSettled(promises);
  }, [importFns, prefetchRoute, prefetchedRoutes]);
  
  return {
    prefetchRoute,
    prefetchAll,
    prefetchedRoutes: Array.from(prefetchedRoutes),
  };
};

/**
 * Hook para prefetch inteligente de rotas em hover
 * 
 * @example
 * ```tsx
 * const { prefetchRoute, getLinkProps } = useRoutePrefetch();
 * 
 * // Uso com helper
 * <Link {...getLinkProps('/dashboard')}>Dashboard</Link>
 * ```
 */
export const useRoutePrefetch = () => {
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchingRef = useRef<Set<string>>(new Set());

  /**
   * Prefetch de uma rota específica
   */
  const prefetchRoute = useCallback((path: string) => {
    // Normaliza o path
    const normalizedPath = path.split('?')[0].split('#')[0];
    
    // Já carregado ou carregando
    if (loadedModules.has(normalizedPath) || prefetchingRef.current.has(normalizedPath)) {
      return;
    }

    const moduleLoader = ROUTE_MODULES[normalizedPath];
    if (!moduleLoader) {
      return;
    }

    prefetchingRef.current.add(normalizedPath);

    // Carrega o módulo em background
    moduleLoader()
      .then(() => {
        loadedModules.add(normalizedPath);
        prefetchingRef.current.delete(normalizedPath);
      })
      .catch(() => {
        prefetchingRef.current.delete(normalizedPath);
      });
  }, []);

  /**
   * Prefetch com delay (evita prefetch em mouse passando rápido)
   */
  const prefetchRouteDelayed = useCallback((path: string, delay = 100) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      prefetchRoute(path);
    }, delay);
  }, [prefetchRoute]);

  /**
   * Cancela prefetch em andamento
   */
  const cancelPrefetch = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  /**
   * Retorna props para aplicar em Links
   */
  const getLinkProps = useCallback((to: string) => ({
    to,
    onMouseEnter: () => prefetchRouteDelayed(to),
    onMouseLeave: cancelPrefetch,
    onFocus: () => prefetchRouteDelayed(to),
    onBlur: cancelPrefetch,
  }), [prefetchRouteDelayed, cancelPrefetch]);

  return {
    prefetchRoute,
    prefetchRouteDelayed,
    cancelPrefetch,
    getLinkProps,
  };
};