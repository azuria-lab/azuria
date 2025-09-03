
export interface CalculationResult {
  sellingPrice: number;
  profit: number;
  isHealthyProfit: boolean;
  isManualPrice?: boolean;
  breakdown: {
    costValue: number;
    otherCostsValue: number;
    shippingValue: number;
    totalCost: number;
    marginAmount: number;
    realMarginPercent: number;
    taxAmount: number;
    cardFeeAmount: number;
  };
}

export interface CalculationHistory {
  id: string;
  date: Date;
  cost: string;
  otherCosts: string;
  shipping: string;
  margin: number;
  tax: string;
  cardFee: string;
  includeShipping?: boolean; // Adicionada a propriedade que faltava
  result: CalculationResult;
}
