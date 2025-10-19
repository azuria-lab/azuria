
import { useCallback, useMemo, useRef, useState } from "react";
import { debounce1 } from "@/utils/performance";
import { logger } from "@/services/logger";
import { useCalculationCache as calculationCacheStrict } from "./useCalculationCache";
import { useGenericCache } from './useGenericCache';

// Hook otimizado para inputs com debounce
export const useOptimizedInput = (initialValue: string = "", debounceMs: number = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  const debouncedSetValue = useMemo(() => (
    // use typed single-arg debounce to satisfy strict typing
    debounce1<string>((newValue: string) => setDebouncedValue(newValue), debounceMs)
  ), [debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSetValue(newValue);
  }, [debouncedSetValue]);

  return {
    value,
    debouncedValue,
    handleChange,
    setValue
  };
};

// Re-export the canonical cache hook to avoid duplication
// Keep a lightweight test-friendly cache API for legacy tests (params: unknown, result: unknown)
export const useCalculationCache = () => useGenericCache<unknown, unknown>({ maxSize: 100 });

// Export strict calculation cache under a distinct alias for consumers ready to adopt the typed API
export { calculationCacheStrict };

// Hook para operações retry
export const useRetryOperation = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const executeWithRetry = useCallback(async (
  operation: () => Promise<unknown>,
  onSuccess?: (result: unknown) => void,
  onError?: (error: unknown) => void
  ) => {
    setIsRetrying(true);
    let attempts = 0;

  while (attempts < maxRetries) {
      try {
        const result = await operation();
        setRetryCount(0);
        setIsRetrying(false);
        onSuccess?.(result);
        return result;
      } catch (error) {
        attempts++;
        setRetryCount(attempts);
        
        if (attempts >= maxRetries) {
          setIsRetrying(false);
          onError?.(error);
          return undefined;
        }
        
        // Delay progressivo: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
  }, [maxRetries]);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    maxRetries
  };
};

// Hook para monitoramento de performance
export const usePerformanceTracker = (componentName: string) => {
  const startTime = useRef<number>();
  const renderCount = useRef(0);

  const startTracking = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endTracking = useCallback(() => {
    if (startTime.current !== undefined) {
      const duration = performance.now() - startTime.current;
      renderCount.current++;
      
      if (duration > 16) { // Mais de 1 frame
        const msg = `${componentName} render took ${Math.round(duration)}ms`;
        logger.warn(msg);
        // eslint-disable-next-line no-console
        logger.warn(msg); // keep for tests compatibility
      } else {
        // noop in tests
      }
    }
  }, [componentName]);

  const resetTracking = useCallback(() => {
    renderCount.current = 0;
    startTime.current = undefined;
  }, []);

  return {
    startTracking,
    endTracking,
    resetTracking,
    renderCount: renderCount.current
  };
};

// Export principal do hook otimizado
export const useOptimizedHooks = () => {
  return {
    useOptimizedInput,
  useCalculationCache, // legacy/test-friendly
  calculationCacheStrict, // strict typed version
    useRetryOperation,
    usePerformanceTracker
  };
};
