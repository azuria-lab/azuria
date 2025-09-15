/* eslint-disable react-refresh/only-export-components */
// Calculator context with useReducer for complex state management
import React, { createContext, ReactNode, useCallback, useContext, useReducer } from 'react';
import type { CalculationResult } from '../types/calculator';

// State interface
interface CalculatorState {
  // Input values
  cost: string;
  margin: number;
  tax: string;
  cardFee: string;
  otherCosts: string;
  shipping: string;
  includeShipping: boolean;
  
  // Results
  result: CalculationResult | null;
  preview: CalculationResult | null;
  
  // UI state
  isLoading: boolean;
  isManualMode: boolean;
  manualPrice: string;
  
  // Validation
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

// Action types
type CalculatorAction =
  | { type: 'SET_COST'; payload: string }
  | { type: 'SET_MARGIN'; payload: number }
  | { type: 'SET_TAX'; payload: string }
  | { type: 'SET_CARD_FEE'; payload: string }
  | { type: 'SET_OTHER_COSTS'; payload: string }
  | { type: 'SET_SHIPPING'; payload: string }
  | { type: 'SET_INCLUDE_SHIPPING'; payload: boolean }
  | { type: 'SET_RESULT'; payload: CalculationResult | null }
  | { type: 'SET_PREVIEW'; payload: CalculationResult | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MANUAL_MODE'; payload: boolean }
  | { type: 'SET_MANUAL_PRICE'; payload: string }
  | { type: 'SET_ERRORS'; payload: Record<string, string[]> }
  | { type: 'SET_WARNINGS'; payload: Record<string, string[]> }
  | { type: 'RESET_CALCULATOR' }
  | { type: 'APPLY_TEMPLATE'; payload: Partial<CalculatorState> };

// Initial state
const initialState: CalculatorState = {
  cost: '',
  margin: 30,
  tax: '',
  cardFee: '',
  otherCosts: '',
  shipping: '',
  includeShipping: false,
  result: null,
  preview: null,
  isLoading: false,
  isManualMode: false,
  manualPrice: '',
  errors: {},
  warnings: {}
};

// Reducer function
function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'SET_COST':
      return { ...state, cost: action.payload };
    
    case 'SET_MARGIN':
      return { ...state, margin: action.payload };
    
    case 'SET_TAX':
      return { ...state, tax: action.payload };
    
    case 'SET_CARD_FEE':
      return { ...state, cardFee: action.payload };
    
    case 'SET_OTHER_COSTS':
      return { ...state, otherCosts: action.payload };
    
    case 'SET_SHIPPING':
      return { ...state, shipping: action.payload };
    
    case 'SET_INCLUDE_SHIPPING':
      return { ...state, includeShipping: action.payload };
    
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    
    case 'SET_PREVIEW':
      return { ...state, preview: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_MANUAL_MODE':
      return { ...state, isManualMode: action.payload };
    
    case 'SET_MANUAL_PRICE':
      return { ...state, manualPrice: action.payload };
    
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    
    case 'SET_WARNINGS':
      return { ...state, warnings: action.payload };
    
    case 'RESET_CALCULATOR':
      return {
        ...initialState,
        // Keep some settings
        margin: state.margin,
        tax: state.tax,
        cardFee: state.cardFee,
        includeShipping: state.includeShipping
      };
    
    case 'APPLY_TEMPLATE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// Context interface
interface CalculatorContextType {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  
  // Convenient action creators
  setCost: (value: string) => void;
  setMargin: (value: number) => void;
  setTax: (value: string) => void;
  setCardFee: (value: string) => void;
  setOtherCosts: (value: string) => void;
  setShipping: (value: string) => void;
  setIncludeShipping: (value: boolean) => void;
  setResult: (result: CalculationResult | null) => void;
  setPreview: (preview: CalculationResult | null) => void;
  setLoading: (loading: boolean) => void;
  setManualMode: (manual: boolean) => void;
  setManualPrice: (price: string) => void;
  setErrors: (errors: Record<string, string[]>) => void;
  setWarnings: (warnings: Record<string, string[]>) => void;
  resetCalculator: () => void;
  applyTemplate: (template: Partial<CalculatorState>) => void;
}

// Create context
const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

// Provider component
interface CalculatorProviderProps {
  children: ReactNode;
  initialValues?: Partial<CalculatorState>;
}

export const CalculatorProvider: React.FC<CalculatorProviderProps> = ({ 
  children, 
  initialValues 
}) => {
  const [state, dispatch] = useReducer(calculatorReducer, {
    ...initialState,
    ...initialValues
  });

  // Action creators
  const setCost = useCallback((value: string) => {
    dispatch({ type: 'SET_COST', payload: value });
  }, []);

  const setMargin = useCallback((value: number) => {
    dispatch({ type: 'SET_MARGIN', payload: value });
  }, []);

  const setTax = useCallback((value: string) => {
    dispatch({ type: 'SET_TAX', payload: value });
  }, []);

  const setCardFee = useCallback((value: string) => {
    dispatch({ type: 'SET_CARD_FEE', payload: value });
  }, []);

  const setOtherCosts = useCallback((value: string) => {
    dispatch({ type: 'SET_OTHER_COSTS', payload: value });
  }, []);

  const setShipping = useCallback((value: string) => {
    dispatch({ type: 'SET_SHIPPING', payload: value });
  }, []);

  const setIncludeShipping = useCallback((value: boolean) => {
    dispatch({ type: 'SET_INCLUDE_SHIPPING', payload: value });
  }, []);

  const setResult = useCallback((result: CalculationResult | null) => {
    dispatch({ type: 'SET_RESULT', payload: result });
  }, []);

  const setPreview = useCallback((preview: CalculationResult | null) => {
    dispatch({ type: 'SET_PREVIEW', payload: preview });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setManualMode = useCallback((manual: boolean) => {
    dispatch({ type: 'SET_MANUAL_MODE', payload: manual });
  }, []);

  const setManualPrice = useCallback((price: string) => {
    dispatch({ type: 'SET_MANUAL_PRICE', payload: price });
  }, []);

  const setErrors = useCallback((errors: Record<string, string[]>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const setWarnings = useCallback((warnings: Record<string, string[]>) => {
    dispatch({ type: 'SET_WARNINGS', payload: warnings });
  }, []);

  const resetCalculator = useCallback(() => {
    dispatch({ type: 'RESET_CALCULATOR' });
  }, []);

  const applyTemplate = useCallback((template: Partial<CalculatorState>) => {
    dispatch({ type: 'APPLY_TEMPLATE', payload: template });
  }, []);

  const value: CalculatorContextType = {
    state,
    dispatch,
    setCost,
    setMargin,
    setTax,
    setCardFee,
    setOtherCosts,
    setShipping,
    setIncludeShipping,
    setResult,
    setPreview,
    setLoading,
    setManualMode,
    setManualPrice,
    setErrors,
    setWarnings,
    resetCalculator,
    applyTemplate
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
};

// Hook to use the context
export const useCalculatorContext = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
};

export default CalculatorContext;
