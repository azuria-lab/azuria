
import { useCallback, useState } from "react";
import { useCalculationCache } from "./useCalculationCache";
import { calculateSellingPrice } from "@/utils/calculator/calculateSellingPrice";
import { CalculationHistory, CalculationResult } from "@/types/simpleCalculator";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/services/logger";

interface UseOptimizedCalculatorProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useOptimizedCalculator = ({ setIsLoading }: UseOptimizedCalculatorProps) => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const { getFromCache, setInCache, getCacheStats } = useCalculationCache();

  const calculateOptimized = useCallback((
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    otherCosts: string,
    shipping: string,
    includeShipping: boolean,
    onCalcComplete: (historyItem: CalculationHistory) => void
  ) => {
    // Try to get from cache first
    const cachedResult = getFromCache(
      cost, margin, tax, cardFee, otherCosts, shipping, includeShipping
    );

    if (cachedResult) {
      logger.debug?.('Cache hit! Using cached result');
      setResult(cachedResult);
      
      const historyItem: CalculationHistory = {
        id: Date.now().toString(),
        date: new Date(),
        cost,
        otherCosts,
        shipping,
        margin,
        tax,
        cardFee,
        includeShipping,
        result: cachedResult
      };
      
      onCalcComplete(historyItem);
      
      toast.success("Cálculo carregado do cache", {
        description: "Resultado obtido instantaneamente!"
      });
      
      return;
    }

  // If not in cache, calculate normally
  logger.debug?.('Cache miss. Calculating...');
    setIsLoading(true);
    
    setTimeout(() => {
      const calculationResult = calculateSellingPrice({
        cost,
        margin,
        tax,
        cardFee,
        otherCosts,
        shipping,
        includeShipping,
      });

      // Store in cache
      setInCache(
        cost, margin, tax, cardFee, otherCosts, shipping, includeShipping, calculationResult
      );

      setResult(calculationResult);
      setIsLoading(false);

      const historyItem: CalculationHistory = {
        id: Date.now().toString(),
        date: new Date(),
        cost,
        otherCosts,
        shipping,
        margin,
        tax,
        cardFee,
        includeShipping,
        result: calculationResult
      };

      onCalcComplete(historyItem);

      const stats = getCacheStats();
  logger.debug?.('Calculation cached. Cache stats:', stats);
      
    }, 400);
  }, [getFromCache, setInCache, getCacheStats, setIsLoading]);

  return {
    result,
    setResult,
    calculateOptimized,
    getCacheStats
  };
};
