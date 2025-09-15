
import { CalculationResult } from "../types/calculator";
import { parseInputValue } from "./parseInputValue";

interface CalculateSellingPriceArgs {
  cost: string;
  margin: number;
  tax: string;
  cardFee: string;
  otherCosts: string;
  shipping: string;
  includeShipping: boolean;
}

export function calculateSellingPrice(args: CalculateSellingPriceArgs): CalculationResult {
  const costValue = parseInputValue(args.cost);
  const taxValue = parseInputValue(args.tax);
  const cardFeeValue = parseInputValue(args.cardFee);
  const otherCostsValue = parseInputValue(args.otherCosts);
  const shippingValue = args.includeShipping ? parseInputValue(args.shipping) : 0;

  const totalCost = costValue + otherCostsValue + shippingValue;

  // Apply margin planned by the user
  const baseWithMargin = totalCost / (1 - args.margin / 100);

  // Apply tax and card fee
  const totalFeePercent = (taxValue + cardFeeValue) / 100;
  const calculatedPrice = totalFeePercent > 0 
    ? baseWithMargin / (1 - totalFeePercent)
    : baseWithMargin;

  const calculatedProfit = calculatedPrice - totalCost;
  const realMarginPercent = (calculatedProfit / calculatedPrice) * 100;

  return {
    sellingPrice: calculatedPrice,
    profit: calculatedProfit,
    isHealthyProfit: realMarginPercent >= 10,
    breakdown: {
      costValue,
      otherCostsValue,
      shippingValue,
      totalCost,
      marginAmount: baseWithMargin - totalCost,
      realMarginPercent,
      taxAmount: calculatedPrice * (taxValue / 100),
      cardFeeAmount: calculatedPrice * (cardFeeValue / 100),
    }
  };
}
