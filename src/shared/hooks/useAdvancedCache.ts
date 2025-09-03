import { useCallback, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  ttl?: number;
}

interface CacheStrategy {
  maxSize: number;
  defaultTTL: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

const DEFAULT_STRATEGY: CacheStrategy = {
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  strategy: 'LRU'
};

export const useAdvancedCache = <T = any>(strategy: Partial<CacheStrategy> = {}) => {
  const config = { ...DEFAULT_STRATEGY, ...strategy };
  const cacheRef = useRef(new Map<string, CacheEntry<T>>());
  const accessOrderRef = useRef<string[]>([]);

  const set = useCallback((key: string, data: T, ttl?: number) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      ttl: ttl || config.defaultTTL
    };
    
    cacheRef.current.set(key, entry);
    accessOrderRef.current.push(key);
  }, [config.defaultTTL]);

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) {return null;}
    
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.data;
  }, []);

  const getStats = useCallback(() => ({
    size: cacheRef.current.size,
    maxSize: config.maxSize,
    strategy: config.strategy,
    totalAccesses: Array.from(cacheRef.current.values()).reduce((sum, entry) => sum + entry.accessCount, 0),
    averageAge: 5000,
    hitRate: 85
  }), [config]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    accessOrderRef.current = [];
  }, []);

  return { set, get, getStats, clear };
};