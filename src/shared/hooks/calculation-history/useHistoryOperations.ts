
import { CalculationHistory, CalculationResult } from "@/types/simpleCalculator";
import { useCallback } from "react";
import { useSupabaseHistory } from "./useSupabaseHistory";
import { localStorageUtils } from "./useLocalStorage";
import { randomUUID } from "@/utils/crypto";
import { logger } from "@/services/logger";

/**
 * Hook that provides CRUD operations for calculation history
 */
export const useHistoryOperations = (
  isAuthenticated: boolean, 
  userId: string | undefined,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const {
    getSupabaseHistory,
    saveToSupabase,
    deleteSupabaseItem,
    clearSupabaseHistory
  } = useSupabaseHistory(userId);

  // Save calculation to history (Supabase or localStorage)
  const saveCalculation = useCallback(async (
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    shipping: string,
    otherCosts: string,
    includeShipping: boolean,
    result: CalculationResult
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // If authenticated, save to Supabase
      if (isAuthenticated && userId) {
        return await saveToSupabase(
          cost, margin, tax, cardFee, shipping, otherCosts, includeShipping, result
        );
      } else {
        // If not authenticated, save to localStorage
        const historyData: CalculationHistory = {
          id: randomUUID(),
          date: new Date(),
          cost,
          margin,
          tax,
          cardFee,
          shipping,
          otherCosts,
          includeShipping,
          result
        };

        return localStorageUtils.saveToLocalStorage(historyData);
      }
    } catch (err) {
      logger.error("Erro ao salvar cálculo:", err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, setIsLoading, setError, saveToSupabase]);

  // Get history from Supabase or localStorage
  const getHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If authenticated, get from Supabase
      if (isAuthenticated && userId) {
        return await getSupabaseHistory();
      } else {
        // If not authenticated, get from localStorage
        return localStorageUtils.getLocalHistory();
      }
    } catch (err) {
      logger.error("Erro ao obter histórico:", err);
      setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, setIsLoading, setError, getSupabaseHistory]);

  // Delete item from history
  const deleteItem = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // If authenticated, delete from Supabase
      if (isAuthenticated && userId) {
        return await deleteSupabaseItem(id);
      } else {
        // If not authenticated, delete from localStorage
        return localStorageUtils.deleteLocalItem(id);
      }
    } catch (err) {
      logger.error("Erro ao excluir item:", err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, setIsLoading, setError, deleteSupabaseItem]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If authenticated, clear from Supabase
      if (isAuthenticated && userId) {
        return await clearSupabaseHistory();
      } else {
        // If not authenticated, clear from localStorage
        return localStorageUtils.clearLocalHistory();
      }
    } catch (err) {
      logger.error("Erro ao limpar histórico:", err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, setIsLoading, setError, clearSupabaseHistory]);

  return {
    saveCalculation,
    getHistory,
    deleteItem,
    clearHistory
  };
};
