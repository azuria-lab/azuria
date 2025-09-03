import { useCallback, useEffect, useRef, useState } from 'react';
import type { CalculationMessage, CalculationResult } from '@/workers/calculationWorker';

interface UseWebWorkerOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export const useWebWorker = (options: UseWebWorkerOptions = {}) => {
  const workerRef = useRef<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pendingTasks = useRef(new Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }>());

  // Inicializar worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/calculationWorker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event: MessageEvent<CalculationResult>) => {
        const { type, id, data, progress: workerProgress } = event.data;
        
        switch (type) {
          case 'RESULT':
            const resultTask = pendingTasks.current.get(id);
            if (resultTask) {
              resultTask.resolve(data);
              pendingTasks.current.delete(id);
              setIsLoading(pendingTasks.current.size > 0);
            }
            break;
            
          case 'ERROR':
            const errorTask = pendingTasks.current.get(id);
            if (errorTask) {
              const error = new Error(data.error);
              errorTask.reject(error);
              pendingTasks.current.delete(id);
              options.onError?.(error);
              setIsLoading(pendingTasks.current.size > 0);
            }
            break;
            
          case 'PROGRESS':
            if (workerProgress !== undefined) {
              setProgress(workerProgress);
              options.onProgress?.(workerProgress);
            }
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        options.onError?.(new Error('Worker execution failed'));
      };

    } catch (error) {
      console.warn('Web Workers not supported, falling back to main thread');
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [options]);

  const executeTask = useCallback(<T = any>(
    type: CalculationMessage['type'],
    data: any
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      if (!workerRef.current) {
        // Fallback para main thread se worker não disponível
        reject(new Error('Web Worker not available'));
        return;
      }

      pendingTasks.current.set(id, { resolve, reject });
      setIsLoading(true);
      setProgress(0);

      const message: CalculationMessage = { type, data, id };
      workerRef.current.postMessage(message);

      // Timeout de segurança
      setTimeout(() => {
        if (pendingTasks.current.has(id)) {
          pendingTasks.current.delete(id);
          reject(new Error('Task timeout'));
          setIsLoading(pendingTasks.current.size > 0);
        }
      }, 30000); // 30 segundos
    });
  }, []);

  const calculateBatch = useCallback((products: any[]) => {
    return executeTask('CALCULATE_BATCH', { products });
  }, [executeTask]);

  const calculateScenarios = useCallback((baseData: any, scenarios: any[]) => {
    return executeTask('CALCULATE_SCENARIOS', { baseData, scenarios });
  }, [executeTask]);

  const calculateMarketAnalysis = useCallback((data: any) => {
    return executeTask('CALCULATE_MARKET_ANALYSIS', data);
  }, [executeTask]);

  const cancelAllTasks = useCallback(() => {
    pendingTasks.current.clear();
    setIsLoading(false);
    setProgress(0);
    
    if (workerRef.current) {
      workerRef.current.terminate();
      // Recriar worker
      workerRef.current = new Worker(
        new URL('../workers/calculationWorker.ts', import.meta.url),
        { type: 'module' }
      );
    }
  }, []);

  return {
    isLoading,
    progress,
    calculateBatch,
    calculateScenarios,
    calculateMarketAnalysis,
    cancelAllTasks,
    isWorkerSupported: !!workerRef.current
  };
};