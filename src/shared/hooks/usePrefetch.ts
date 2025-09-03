import { useCallback, useState } from 'react';

/**
 * Hook for prefetching routes and components on hover
 */
export const usePrefetch = (importFn: () => Promise<any>) => {
  const [prefetched, setPrefetched] = useState(false);
  
  const prefetch = useCallback(async () => {
    if (prefetched) {return;}
    
    try {
      await importFn();
      setPrefetched(true);
    } catch (error) {
      // Silently handle prefetch errors
      console.debug('Prefetch failed:', error);
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
export const useBatchPrefetch = (importFns: Array<() => Promise<any>>) => {
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<Set<number>>(new Set());
  
  const prefetchRoute = useCallback(async (index: number) => {
    if (prefetchedRoutes.has(index)) {return;}
    
    try {
      await importFns[index]();
      setPrefetchedRoutes(prev => new Set([...prev, index]));
    } catch (error) {
      console.debug(`Prefetch failed for route ${index}:`, error);
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