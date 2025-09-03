import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createStore, KeyValueStore } from '@/services/storage';
import { logger } from '@/services/logger';
import { randomUUID } from '@/utils/crypto';

// Mirror the previous types to keep public API unchanged
export interface OfflineCalculation {
  id: string;
  timestamp: number;
  type: 'simple' | 'pro' | 'batch';
  data: unknown;
  result: unknown;
  synced: boolean;
}

const createOfflineCalculation = (
  type: OfflineCalculation['type'],
  data: unknown,
  result: unknown
): OfflineCalculation => ({
  id: `calc_${randomUUID()}`,
  timestamp: Date.now(),
  type,
  data,
  result,
  synced: false
});

export const useOfflineCalculator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineCalculations, setOfflineCalculations] = useState<OfflineCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const store = useMemo<KeyValueStore<OfflineCalculation>>(() => createStore<OfflineCalculation>('calculations'), []);

  const loadOfflineCalculations = useCallback(async () => {
    try {
      const calculations = await store.getAll();
      setOfflineCalculations(calculations.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      logger.error('Erro ao carregar cálculos offline', { error });
    }
  }, [store]);

  useEffect(() => {
    // Carregar cálculos offline
    loadOfflineCalculations();

    // Event listeners para status online/offline
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "🌐 Conexão restaurada",
        description: "Sincronizando dados...",
      });
  // Best-effort sync can be wired here when backend is ready
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "📱 Modo offline ativo",
        description: "Seus cálculos serão salvos localmente",
      });
    };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, loadOfflineCalculations]);

  const saveCalculationOffline = useCallback(async (
    type: 'simple' | 'pro' | 'batch',
    data: unknown,
    result: unknown
  ) => {
    try {
  const calculation = createOfflineCalculation(type, data, result);
  await store.put(calculation);
      
      // Atualizar lista local
      setOfflineCalculations(prev => [calculation, ...prev]);
      
      if (isOffline) {
        toast({
          title: "💾 Cálculo salvo offline",
          description: "Será sincronizado quando a conexão for restaurada",
        });
      }
      
      return calculation;
    } catch (error) {
  logger.error('Erro ao salvar offline', { error });
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar o cálculo offline",
        variant: "destructive",
      });
      throw error;
    }
  }, [isOffline, toast, store]);

  const clearOfflineData = useCallback(async () => {
    try {
      setIsLoading(true);
  // Simple cleanup by age
  const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const all = await store.getAll();
  await Promise.all(all.filter(c => c.timestamp < cutoff && c.synced).map(c => store.delete(c.id)));
      await loadOfflineCalculations();
      
      toast({
        title: "🧹 Dados limpos",
        description: "Cálculos antigos foram removidos",
      });
    } catch (error) {
  logger.error('Erro ao limpar dados', { error });
      toast({
        title: "❌ Erro na limpeza",
        description: "Não foi possível limpar os dados offline",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadOfflineCalculations, store]);

  const getOfflineStats = useCallback(() => {
    const unsyncedCount = offlineCalculations.filter(calc => !calc.synced).length;
    const totalSize = offlineCalculations.length;
    
    return {
      total: totalSize,
      unsynced: unsyncedCount,
      synced: totalSize - unsyncedCount
    };
  }, [offlineCalculations]);

  return {
    isOffline,
    isLoading,
    offlineCalculations,
    saveCalculationOffline,
    loadOfflineCalculations,
    clearOfflineData,
    getOfflineStats
  };
};