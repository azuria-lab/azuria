
import { useCallback, useEffect, useState } from 'react';
import { useMultiTenant } from '@/contexts/useMultiTenant';
import { ConsolidatedMetrics, Store, StoreMetrics } from '@/types/multi-tenant';

export const useConsolidatedMetrics = (dateRange?: { start: Date; end: Date }) => {
  const { currentOrganization, stores } = useMultiTenant();
  const [metrics, setMetrics] = useState<ConsolidatedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConsolidatedMetrics = useCallback(async () => {
    if (!currentOrganization) {return;}

    setIsLoading(true);
    setError(null);

    try {
      // Simular carregamento de métricas
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Gerar métricas mockadas baseadas nas lojas
  const mockStoreMetrics: StoreMetrics[] = stores.map((store: Store) => ({
        store,
        revenue: Math.random() * 50000 + 10000, // Entre R$10k e R$60k
        calculations: Math.floor(Math.random() * 500) + 100, // Entre 100 e 600 cálculos
        activeUsers: Math.floor(Math.random() * 20) + 5, // Entre 5 e 25 usuários
        avgMargin: Math.random() * 20 + 20, // Entre 20% e 40%
        conversionRate: Math.random() * 0.1 + 0.02 // Entre 2% e 12%
      }));

      const totalRevenue = mockStoreMetrics.reduce((sum, metric) => sum + metric.revenue, 0);
      const totalCalculations = mockStoreMetrics.reduce((sum, metric) => sum + metric.calculations, 0);
      const activeUsers = mockStoreMetrics.reduce((sum, metric) => sum + metric.activeUsers, 0);
      
      const topPerformingStoreMetric = mockStoreMetrics.reduce((top, current) => 
        current.revenue > top.revenue ? current : top, mockStoreMetrics[0]
      );
      const topPerformingStore = topPerformingStoreMetric?.store || null;

      // Taxa de crescimento simulada
      const growthRate = Math.random() * 40 - 10; // Entre -10% e +30%

      const consolidatedMetrics: ConsolidatedMetrics = {
        totalRevenue,
        totalCalculations,
        totalStores: stores.length,
        activeUsers,
        topPerformingStore,
        growthRate,
        storeComparison: mockStoreMetrics
      };

      setMetrics(consolidatedMetrics);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar métricas consolidadas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization, stores]);

  useEffect(() => {
    if (currentOrganization && stores.length > 0) {
      void loadConsolidatedMetrics();
    }
  }, [currentOrganization, stores, dateRange, loadConsolidatedMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refreshMetrics: loadConsolidatedMetrics
  };
};
