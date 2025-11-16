/**
 * Custom hook for Advanced Calculator History
 * Integrates with Supabase and localStorage
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/domains/auth';
import AdvancedCalculatorHistoryService, {
  type AdvancedCalculationEntry,
  type SaveCalculationParams,
} from '@/services/advancedCalculatorHistory';
import { logger } from '@/services/logger';

export const useAdvancedCalculatorHistory = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [history, setHistory] = useState<AdvancedCalculationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load history from storage
   */
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const entries = await AdvancedCalculatorHistoryService.getHistory(
        isAuthenticated ? user?.id : undefined
      );

      setHistory(entries);
      logger.info('[AdvancedHistory] Loaded entries:', entries.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(message);
      logger.error('[AdvancedHistory] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  /**
   * Save calculation to history
   */
  const saveCalculation = useCallback(
    async (params: Omit<SaveCalculationParams, 'userId'>) => {
      try {
        setIsLoading(true);
        setError(null);

        const entry = await AdvancedCalculatorHistoryService.saveCalculation({
          ...params,
          userId: isAuthenticated ? user?.id : undefined,
        });

        // Update local state
        setHistory((prev) => [entry, ...prev].slice(0, 50));
        
        logger.info('[AdvancedHistory] Saved calculation:', entry.id);
        return entry;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar cálculo';
        setError(message);
        logger.error('[AdvancedHistory] Save error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, isAuthenticated]
  );

  /**
   * Delete single entry
   */
  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        await AdvancedCalculatorHistoryService.deleteEntry(
          id,
          isAuthenticated ? user?.id : undefined
        );

        // Update local state
        setHistory((prev) => prev.filter((entry) => entry.id !== id));
        
        logger.info('[AdvancedHistory] Deleted entry:', id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao deletar entrada';
        setError(message);
        logger.error('[AdvancedHistory] Delete error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, isAuthenticated]
  );

  /**
   * Clear all history
   */
  const clearHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await AdvancedCalculatorHistoryService.clearHistory(
        isAuthenticated ? user?.id : undefined
      );

      // Clear local state
      setHistory([]);
      
      logger.info('[AdvancedHistory] Cleared all history');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar histórico';
      setError(message);
      logger.error('[AdvancedHistory] Clear error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  /**
   * Get statistics from history
   */
  const getStatistics = useCallback(() => {
    if (history.length === 0) {
      return null;
    }

    const totalCalculations = history.length;
    const avgMargin = history.reduce((sum, entry) => sum + entry.totalMargin, 0) / totalCalculations;
    const avgProfit = history.reduce((sum, entry) => sum + entry.netProfit, 0) / totalCalculations;
    
    const marketplaceCount = history.reduce((acc, entry) => {
      acc[entry.marketplaceId] = (acc[entry.marketplaceId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedMarketplace = Object.entries(marketplaceCount).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCalculations,
      avgMargin,
      avgProfit,
      mostUsedMarketplace: mostUsedMarketplace ? {
        id: mostUsedMarketplace[0],
        count: mostUsedMarketplace[1],
      } : null,
      dateRange: {
        oldest: history[history.length - 1]?.date,
        newest: history[0]?.date,
      },
    };
  }, [history]);

  /**
   * Filter history by date range
   */
  const filterByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return history.filter(
        (entry) => entry.date >= startDate && entry.date <= endDate
      );
    },
    [history]
  );

  /**
   * Search history by marketplace or tags
   */
  const searchHistory = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return history.filter(
        (entry) =>
          entry.marketplaceId.toLowerCase().includes(lowerQuery) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          entry.notes?.toLowerCase().includes(lowerQuery)
      );
    },
    [history]
  );

  // Auto-load on mount and when user changes
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    // State
    history,
    isLoading,
    error,
    
    // Actions
    loadHistory,
    saveCalculation,
    deleteEntry,
    clearHistory,
    
    // Utilities
    getStatistics,
    filterByDateRange,
    searchHistory,
    
    // Metadata
    isSupabaseConfigured: AdvancedCalculatorHistoryService.isSupabaseAvailable(),
  };
};
