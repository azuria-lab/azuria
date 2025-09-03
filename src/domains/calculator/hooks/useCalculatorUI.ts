import { useState } from "react";
import type { CalculationResult } from "../types/calculator";
import type { CalculatorActions, CalculatorUIState } from "../types/ui";

export const useCalculatorUI = (isPro: boolean): CalculatorUIState & CalculatorActions => {
  // UI-specific state
  const [isLoading, setIsLoading] = useState(false);
  const [showProBanner, setShowProBanner] = useState(!isPro);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showResultPanel, setShowResultPanel] = useState(false);
  
  // Actions
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  // Function to display a preview of calculation result
  const getDisplayResult = (result: CalculationResult | null, preview: CalculationResult | null) => {
    return result || preview;
  };

  return {
    // State
    isLoading,
    showProBanner,
    showAdvancedOptions,
    showResultPanel,
    
    // Actions
    startLoading,
    stopLoading,
    setShowProBanner,
    getDisplayResult
  };
};