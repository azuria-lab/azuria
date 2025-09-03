import { useCallback, useMemo, useRef } from 'react';

export interface GenericCacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
}

export interface GenericCacheOptions {
  maxSize?: number;
  // Not implementing TTL/lastAccess eviction here to keep it minimal; callers can choose keys accordingly
}

export interface GenericCacheApi<TParams, TResult> {
  getFromCache: (params: TParams) => TResult | null;
  setInCache: (params: TParams, result: TResult) => void;
  clearCache: () => void;
  getCacheStats: () => GenericCacheStats;
}

export function useGenericCache<TParams, TResult>(options: GenericCacheOptions = {}): GenericCacheApi<TParams, TResult> {
  const maxCacheSize = options.maxSize ?? 100;
  const cache = useRef(new Map<string, TResult>());
  const requests = useRef(0);
  const hits = useRef(0);

  const getCacheKey = useMemo(() => {
    return (params: TParams) => {
      try { return JSON.stringify(params); } catch { return String(params as unknown); }
    };
  }, []);

  const getFromCache = useCallback((params: TParams): TResult | null => {
    const key = getCacheKey(params);
    requests.current += 1;
    if (cache.current.has(key)) {
      hits.current += 1;
      return cache.current.get(key) as TResult;
    }
    return null;
  }, [getCacheKey]);

  const setInCache = useCallback((params: TParams, result: TResult) => {
    const key = getCacheKey(params);
    if (cache.current.size >= maxCacheSize) {
      const firstKey = cache.current.keys().next().value as string | undefined;
      if (firstKey) { cache.current.delete(firstKey); }
    }
    cache.current.set(key, result);
  }, [getCacheKey, maxCacheSize]);

  const clearCache = useCallback(() => {
    cache.current.clear();
    requests.current = 0;
    hits.current = 0;
  }, []);

  const getCacheStats = useCallback((): GenericCacheStats => ({
    size: cache.current.size,
    maxSize: maxCacheSize,
    hitRate: requests.current === 0 ? 0 : +(hits.current / requests.current).toFixed(2)
  }), [maxCacheSize]);

  return { getFromCache, setInCache, clearCache, getCacheStats };
}
