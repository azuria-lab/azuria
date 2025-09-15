
import { useCallback, useEffect, useState } from "react";
import { CalculationResult } from "@/types/simpleCalculator";

interface CacheItem {
  key: string;
  result: CalculationResult;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  maxAccessCount: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 100,
  ttl: 30 * 60 * 1000, // 30 minutes
  maxAccessCount: 1000
};

export const useCalculationCache = (config: Partial<CacheConfig> = {}) => {
  // Stable primitive config values to avoid changing deps every render
  const maxSize = config.maxSize ?? DEFAULT_CONFIG.maxSize;
  const ttl = config.ttl ?? DEFAULT_CONFIG.ttl;
  const maxAccessCount = config.maxAccessCount ?? DEFAULT_CONFIG.maxAccessCount;
  const [cache, setCache] = useState<Map<string, CacheItem>>(new Map());

  // Generate cache key from calculation inputs
  const generateCacheKey = (
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    otherCosts: string,
    shipping: string,
    includeShipping: boolean
  ): string => {
    return `${cost}-${margin}-${tax}-${cardFee}-${otherCosts}-${shipping}-${includeShipping}`;
  };

  // Check if cache item is valid
  const isValidCacheItem = useCallback((item: CacheItem): boolean => {
    const now = Date.now();
    const isNotExpired = (now - item.timestamp) < ttl;
    const isUnderAccessLimit = item.accessCount < maxAccessCount;
    return isNotExpired && isUnderAccessLimit;
  }, [ttl, maxAccessCount]);

  // Clean expired items from cache
  const cleanExpiredItems = useCallback(() => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      
      for (const [key, item] of newCache.entries()) {
        if (!isValidCacheItem(item)) {
          newCache.delete(key);
        }
      }
      
      return newCache;
    });
  }, [isValidCacheItem]);

  // Get from cache
  const getFromCache = (
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    otherCosts: string,
    shipping: string,
    includeShipping: boolean
  ): CalculationResult | null => {
    const key = generateCacheKey(cost, margin, tax, cardFee, otherCosts, shipping, includeShipping);
    const item = cache.get(key);
    
    if (!item || !isValidCacheItem(item)) {
      return null;
    }
    
    // Update access statistics
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      const updatedItem = {
        ...item,
        accessCount: item.accessCount + 1,
        lastAccessed: Date.now()
      };
      newCache.set(key, updatedItem);
      return newCache;
    });
    
    return item.result;
  };

  // Set in cache
  const setInCache = (
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    otherCosts: string,
    shipping: string,
    includeShipping: boolean,
    result: CalculationResult
  ) => {
    const key = generateCacheKey(cost, margin, tax, cardFee, otherCosts, shipping, includeShipping);
    const now = Date.now();
    
    const cacheItem: CacheItem = {
      key,
      result,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    };
    
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      
      // Evict LRU if necessary
  if (newCache.size >= maxSize) {
        let oldestKey = '';
        let oldestTime = Date.now();
        
        for (const [k, item] of newCache.entries()) {
          if (item.lastAccessed < oldestTime) {
            oldestTime = item.lastAccessed;
            oldestKey = k;
          }
        }
        
        if (oldestKey) {
          newCache.delete(oldestKey);
        }
      }
      
      newCache.set(key, cacheItem);
      return newCache;
    });
  };

  // Clear cache
  const clearCache = () => {
    setCache(new Map());
  };

  // Get cache stats
  const getCacheStats = () => {
    return {
      size: cache.size,
  maxSize,
      hitRate: 0, // Could be calculated if we track hits/misses
      oldestItem: Math.min(...Array.from(cache.values()).map(item => item.timestamp)),
      totalAccesses: Array.from(cache.values()).reduce((sum, item) => sum + item.accessCount, 0)
    };
  };

  // Cleanup effect
  useEffect(() => {
    const interval = setInterval(cleanExpiredItems, 5 * 60 * 1000); // Clean every 5 minutes
    return () => clearInterval(interval);
  }, [cleanExpiredItems]);

  return {
    getFromCache,
    setInCache,
    clearCache,
    getCacheStats,
    cleanExpiredItems
  };
};
