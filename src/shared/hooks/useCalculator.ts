
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CalculatorState {
  cost: string | number;
  taxPercent: string | number;
  marketplace: string;
  shipping: string | number;
  includeShipping: boolean;
  targetProfit: number;
  sellingPrice: number | null;
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  breakdown: {
    cost: number;
    tax: number;
    marketplaceFee: number;
    shipping: number;
    profit: number;
  } | null;
}

export const useCalculator = (marketplaceFeePercent: number = 0) => {
  const { toast } = useToast();
  const [state, setState] = useState<CalculatorState>({
    cost: "",
    taxPercent: "7",
    marketplace: "mercadolivre",
    shipping: "",
    includeShipping: false,
    targetProfit: 30,
    sellingPrice: null,
    discountPercent: 0,
    discountedPrice: null,
    discountedProfit: null,
    breakdown: null
  });

  // Helper function to safely parse number values
  const parseNumberValue = (value: string | number): number => {
    if (typeof value === 'number') {return value;}
    if (value === '') {return 0;}
    const sanitized = value.replace(",", ".");
    return parseFloat(sanitized) || 0;
  };

  // Recalculate discounted price when sellingPrice or discountPercent changes
  useEffect(() => {
    if (state.sellingPrice && state.discountPercent > 0) {
      const discountAmount = state.sellingPrice * (state.discountPercent / 100);
      const newDiscountedPrice = state.sellingPrice - discountAmount;
      
      // Calculate new profit based on discounted price
      const costValue = parseNumberValue(state.cost);
      const shippingValue = parseNumberValue(state.shipping);
      const taxPercentValue = parseNumberValue(state.taxPercent);
      
      const totalCost = costValue + 
        (state.includeShipping ? shippingValue : 0) + 
        (state.sellingPrice * taxPercentValue / 100) +
        (state.sellingPrice * marketplaceFeePercent / 100);
      
      const newDiscountedProfit = newDiscountedPrice - totalCost;
      
      setState(prev => ({
        ...prev,
        discountedPrice: newDiscountedPrice,
        discountedProfit: newDiscountedProfit
      }));
    } else if (state.discountPercent === 0 && state.discountedPrice !== null) {
      setState(prev => ({
        ...prev,
        discountedPrice: null,
        discountedProfit: null
      }));
    }
  }, [state.sellingPrice, state.discountPercent, state.cost, state.shipping, state.includeShipping, state.taxPercent, marketplaceFeePercent]);

  // Calculate selling price based on inputs
  const calculatePrice = () => {
    const costValue = parseNumberValue(state.cost);
    if (costValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "O custo do produto deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const shippingValue = parseNumberValue(state.shipping);
    const taxPercentValue = parseNumberValue(state.taxPercent);

    // Tax and marketplace fee calculation
    const taxRate = taxPercentValue / 100;
    const marketplaceRate = marketplaceFeePercent / 100;
    
    // Base cost including shipping if needed
    const baseCost = costValue + (state.includeShipping ? shippingValue : 0);
    
    // Calculate selling price to achieve target profit percentage
    // Formula: selling_price = base_cost / (1 - target_profit% - tax% - marketplace_fee%)
    const divisor = 1 - (state.targetProfit / 100) - taxRate - marketplaceRate;
    const calculatedPrice = baseCost / (divisor > 0 ? divisor : 0.01);
    
    // Calculate profit
    const taxAmount = calculatedPrice * taxRate;
    const marketplaceFeeAmount = calculatedPrice * marketplaceRate;
    const totalCost = baseCost + taxAmount + marketplaceFeeAmount;
    const profit = calculatedPrice - totalCost;
    
    setState(prev => ({
      ...prev,
      sellingPrice: calculatedPrice,
      breakdown: {
        cost: costValue,
        tax: taxAmount,
        marketplaceFee: marketplaceFeeAmount,
        shipping: state.includeShipping ? shippingValue : 0,
        profit: profit
      }
    }));

    toast({
      title: "Cálculo realizado!",
      description: `Preço sugerido: R$ ${calculatedPrice.toFixed(2).replace(".", ",")}`,
    });
  };

  // Check if profit is healthy (greater than 10% of selling price)
  const isProfitHealthy = (profit: number) => {
    if (state.sellingPrice === null || state.sellingPrice <= 0) {return false;}
    return (profit / state.sellingPrice) * 100 >= 10;
  };

  return {
    ...state,
    setState,
    calculatePrice,
    isProfitHealthy
  };
};
