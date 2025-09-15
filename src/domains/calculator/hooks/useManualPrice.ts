
import { parseInputValue } from "../utils/parseInputValue";
import type { CalculationResult } from "../types/calculator";

export const useManualPrice = (
  cost: string,
  tax: string,
  cardFee: string,
  otherCosts: string,
  shipping: string,
  includeShipping: boolean,
  setMargin: React.Dispatch<React.SetStateAction<number>>,
  setResult: React.Dispatch<React.SetStateAction<CalculationResult | null>>
) => {
  const calculateReverseMargin = (priceString: string) => {
    const price = parseInputValue(priceString);
    if (!price || price <= 0) {return;}

    const costValue = parseInputValue(cost);
    if (!costValue || costValue <= 0) {return;}

    const taxValue = parseInputValue(tax);
    const cardFeeValue = parseInputValue(cardFee);
    const otherCostsValue = parseInputValue(otherCosts);
    const shippingValue = includeShipping ? parseInputValue(shipping) : 0;

    const totalCost = costValue + otherCostsValue + shippingValue;
    const taxAmount = price * (taxValue / 100);
    const cardFeeAmount = price * (cardFeeValue / 100);
    
    const profit = price - totalCost - taxAmount - cardFeeAmount;
    const realMargin = (profit / price) * 100;

    setMargin(Math.round(realMargin));
    
    const reverseResult: CalculationResult = {
      sellingPrice: price,
      profit: profit,
      isHealthyProfit: realMargin >= 10,
      isManualPrice: true,
      breakdown: {
        costValue,
        otherCostsValue,
        shippingValue,
        totalCost,
        marginAmount: profit,
        realMarginPercent: realMargin,
        taxAmount: price * (taxValue / 100),
        cardFeeAmount: price * (cardFeeValue / 100),
      }
    };

    setResult(reverseResult);
  };

  return {
    calculateReverseMargin
  };
};
