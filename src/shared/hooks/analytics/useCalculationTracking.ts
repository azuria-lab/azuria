
import { useCallback } from 'react';

interface CalculationResult {
  cost: number;
  margin: number;
  sellingPrice: number;
  profit: number;
}

type TrackEvent = (
  eventName: string,
  category: string,
  action: string,
  label?: string,
  value?: number,
  props?: Record<string, unknown>
) => void;

export const useCalculationTracking = (trackEvent: TrackEvent) => {
  const trackCalculation = useCallback((calculatorType: string, result: CalculationResult) => {
    trackEvent(
      'calculation_completed',
      'calculator',
      'calculate',
      calculatorType,
      result.sellingPrice,
      {
        calculator_type: calculatorType,
        cost: result.cost,
        margin: result.margin,
        selling_price: result.sellingPrice,
        profit: result.profit
      }
    );
  }, [trackEvent]);

  return { trackCalculation };
};
