// Performance optimized hooks with debounce and memoization
import { useCallback, useEffect, useMemo } from "react";
import { parseInputValue } from "../utils/parseInputValue";
import { calculateSellingPrice } from "../utils/calculateSellingPrice";
import { useDebounce } from "@/hooks/useDebounce";
import type { CalculationResult } from "../types/calculator";

export const useCalculatorPricingOptimized = (
  cost: string,
  margin: number,
  tax: string,
  cardFee: string,
  otherCosts: string,
  shipping: string,
  includeShipping: boolean,
  setPreview: React.Dispatch<React.SetStateAction<CalculationResult | null>>
) => {
  // Debounce inputs to prevent excessive calculations
  const debouncedCost = useDebounce(cost, 300);
  const debouncedTax = useDebounce(tax, 300);
  const debouncedCardFee = useDebounce(cardFee, 300);
  const debouncedOtherCosts = useDebounce(otherCosts, 300);
  const debouncedShipping = useDebounce(shipping, 300);

  // Memoize calculation parameters to prevent unnecessary recalculations
  const calculationParams = useMemo(() => ({
    cost: debouncedCost,
    margin,
    tax: debouncedTax,
    cardFee: debouncedCardFee,
    otherCosts: debouncedOtherCosts,
    shipping: debouncedShipping,
    includeShipping,
  }), [debouncedCost, margin, debouncedTax, debouncedCardFee, debouncedOtherCosts, debouncedShipping, includeShipping]);

  // Memoize the calculation function to prevent recreation
  const calculatePreview = useCallback(() => {
    const costValue = parseInputValue(calculationParams.cost);
    if (!calculationParams.cost || costValue <= 0) {
      setPreview(null);
      return;
    }
    
    const previewResult = calculateSellingPrice(calculationParams);
    setPreview(previewResult);
  }, [calculationParams, setPreview]);

  // Calculate preview with debounced values
  useEffect(() => {
    const timeoutId = setTimeout(calculatePreview, 100); // Additional small delay for smooth UX
    return () => clearTimeout(timeoutId);
  }, [calculatePreview]);
};