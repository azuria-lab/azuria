
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/domains/auth";
import { CalculationHistory } from "@/types/simpleCalculator";
import { useHistoryOperations } from "./calculation-history/useHistoryOperations";

export const useCalculationHistory = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConfigured] = useState(true);

  const {
    saveCalculation,
    getHistory,
    deleteItem,
    clearHistory
  } = useHistoryOperations(isAuthenticated, user?.id, setIsLoading, setError);

  // Load history on startup and when user changes
  const loadHistory = useCallback(async () => {
    const historyData = await getHistory();
    setHistory(historyData);
  }, [getHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, user?.id, isAuthenticated]);

  // Load current history
  // loadHistory moved above and memoized

  // Add calculation to history with automatic persistence
  const addToHistory = async (historyItem: CalculationHistory) => {
    const success = await saveCalculation(
      historyItem.cost,
      historyItem.margin,
      historyItem.tax,
      historyItem.cardFee,
      historyItem.shipping,
      historyItem.otherCosts,
      historyItem.includeShipping || false,
      historyItem.result
    );
    
    // Only reload if save was successful
    if (success) {
      await loadHistory();
    }
  };

  // Enhanced delete with optimistic updates
  const deleteHistoryItem = async (id: string) => {
    // Optimistic update
    const originalHistory = [...history];
    setHistory(prev => prev.filter(item => item.id !== id));
    
    const success = await deleteItem(id);
    
    // Revert on failure
    if (!success) {
      setHistory(originalHistory);
    }
  };

  // Enhanced clear with confirmation
  const clearAllHistory = async () => {
    const originalHistory = [...history];
    setHistory([]);
    
    const success = await clearHistory();
    
    // Revert on failure
    if (!success) {
      setHistory(originalHistory);
    }
  };

  return {
    history,
    setHistory,
    addToHistory,
    saveCalculation,
    getHistory,
    deleteItem: deleteHistoryItem,
    clearHistory: clearAllHistory,
    removeCalculation: deleteHistoryItem,
    searchHistory: (
      term: string = "",
      filters?: {
        startDate?: Date;
        endDate?: Date;
        minMargin?: number;
        maxMargin?: number;
        includeShipping?: boolean;
      }
    ): CalculationHistory[] => {
      const t = term.trim().toLowerCase();
      let results = [...history];

      if (t) {
        results = results.filter((item) => {
          const fields = [
            item.cost,
            String(item.margin),
            item.tax,
            item.cardFee,
            item.shipping,
            item.otherCosts,
            String(item.result?.sellingPrice ?? ""),
            String(item.result?.profit ?? ""),
            String(item.result?.breakdown?.realMarginPercent ?? "")
          ]
            .join(" ")
            .toLowerCase();
          return fields.includes(t);
        });
      }

      if (filters) {
        const { startDate, endDate, minMargin, maxMargin, includeShipping } = filters;
        results = results.filter((item) => {
          const dateOk =
            (!startDate || item.date >= startDate) &&
            (!endDate || item.date <= endDate);
          const marginOk =
            (minMargin === undefined || item.margin >= minMargin) &&
            (maxMargin === undefined || item.margin <= maxMargin);
          const shippingOk =
            includeShipping === undefined || item.includeShipping === includeShipping;
          return dateOk && marginOk && shippingOk;
        });
      }

      return results;
    },
    loading: isLoading,
    error,
    isSupabaseConfigured,
    refreshHistory: loadHistory
  };
};
