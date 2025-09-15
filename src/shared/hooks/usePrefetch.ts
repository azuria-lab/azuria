import { useCallback, useState } from 'react';

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
    } catch (_err) {
      // Silently ignore prefetch errors in production
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
    } catch (_err) {
      // ignore individual prefetch failures
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