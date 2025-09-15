
import { useState } from "react";
import type { CalculationHistory, CalculationResult } from "../types/calculator";
import { useCalculation } from "./useCalculation";
import { useCalculatorPricing } from "./useCalculatorPricing";

export const useCalculatorResult = (
  cost: string,
  margin: number,
  tax: string,
  cardFee: string,
  otherCosts: string,
  shipping: string,
  includeShipping: boolean,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  toast: (opts: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void
) => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [preview, setPreview] = useState<CalculationResult | null>(null);
  
  // Initialize the pricing preview effect
  useCalculatorPricing(cost, margin, tax, cardFee, otherCosts, shipping, includeShipping, setPreview);

  // Use the calculation logic
  const { calculatePrice: performCalculation } = useCalculation({ setIsLoading, toast });

  // Wrapper function that also updates local result state
  const calculatePrice = (
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    otherCosts: string,
    shipping: string,
    includeShipping: boolean,
    onCalcComplete: (historyItem: CalculationHistory) => void
  ) => {
    performCalculation(
      cost, 
      margin, 
      tax, 
      cardFee, 
      otherCosts, 
      shipping, 
      includeShipping,
      (historyItem: CalculationHistory) => {
        setResult(historyItem.result);
        onCalcComplete(historyItem);
      }
    );
  };

  return {
    result,
    setResult,
    preview,
    setPreview,
    calculatePrice
  };
};
