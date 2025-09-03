
import { useEffect } from "react";
import { parseInputValue } from "../utils/parseInputValue";
import { calculateSellingPrice } from "../utils/calculateSellingPrice";
import type { CalculationResult } from "../types/calculator";

export const useCalculatorPricing = (
  cost: string,
  margin: number,
  tax: string,
  cardFee: string,
  otherCosts: string,
  shipping: string,
  includeShipping: boolean,
  setPreview: React.Dispatch<React.SetStateAction<CalculationResult | null>>
) => {
  // Calculate preview price when inputs change
  useEffect(() => {
    const costValue = parseInputValue(cost);
    if (!cost || costValue <= 0) {
      // Defer to next tick to avoid synchronous state updates during mount in tests
      const nullTimer = setTimeout(() => setPreview(null), 0);
      return () => clearTimeout(nullTimer);
    }

    const handler = setTimeout(() => {
      const previewResult = calculateSellingPrice({
        cost,
        margin,
        tax,
        cardFee,
        otherCosts,
        shipping,
        includeShipping,
      });
      setPreview(previewResult);
    }, 350);

    return () => clearTimeout(handler);
  }, [cost, margin, tax, cardFee, otherCosts, shipping, includeShipping, setPreview]);
};
