export interface SimpleCalculatorProps {
  isPro?: boolean;
  userId?: string;
}

export interface CalculatorUIState {
  isLoading: boolean;
  showProBanner: boolean;
  showAdvancedOptions: boolean;
  showResultPanel: boolean;
}

export type CalculatorDisplayResult = import('./calculator').CalculationResult | null;

export interface CalculatorActions {
  startLoading: () => void;
  stopLoading: () => void;
  setShowProBanner: (show: boolean) => void;
  getDisplayResult: (
    result: import('./calculator').CalculationResult | null,
    preview: import('./calculator').CalculationResult | null
  ) => CalculatorDisplayResult;
}