
import { useState } from "react";
import { validateNumericInput } from "../utils/validateInput";
import { useManualPrice } from "./useManualPrice";
import type { CalculationResult } from "../types/calculator";

export const useManualPricing = (
  result: CalculationResult | null,
  setResult: React.Dispatch<React.SetStateAction<CalculationResult | null>>,
  setMargin: React.Dispatch<React.SetStateAction<number>>,
  cost: string,
  tax: string,
  cardFee: string,
  otherCosts: string,
  shipping: string,
  includeShipping: boolean
) => {
  const [manualPrice, setManualPrice] = useState<string>("");
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  
  // Use the manual price calculator hook
  const { calculateReverseMargin } = useManualPrice(
    cost, 
    tax, 
    cardFee, 
    otherCosts, 
    shipping, 
    includeShipping, 
    setMargin, 
    setResult
  );

  const handleManualPriceChange = (value: string) => {
    if (validateNumericInput(value)) {
      setManualPrice(value);
      calculateReverseMargin(value);
    }
  };

  const togglePriceMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode) {
      setManualPrice(result?.sellingPrice.toFixed(2).toString() || "");
    } else {
      setResult(null);
    }
  };

  return {
    manualPrice,
    isManualMode,
    handleManualPriceChange,
    togglePriceMode
  };
};
