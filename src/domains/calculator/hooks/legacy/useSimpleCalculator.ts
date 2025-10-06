
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import { useCalculatorInputs } from "../useCalculatorInputs";
import { useCalculatorResult } from "../useCalculatorResult";
import { useManualPricing } from "../useManualPricing";
import { formatCurrency } from "../../utils/formatCurrency";
import { parseInputValue } from "../../utils/parseInputValue";
import { useOfflineCalculator } from "@/hooks/useOfflineCalculator";
import type { CalculationHistory } from "../../types/calculator";

export interface SimpleCalculatorOptions {
  onAfterCalculation?: (historyItem: CalculationHistory) => void | Promise<void>;
}

export const useSimpleCalculator = (
  isPro: boolean = false,
  userId?: string,
  options: SimpleCalculatorOptions = {}
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { onAfterCalculation } = options;
  
  // Use specialized hooks for different concerns
  const {
    cost,
    margin,
    tax,
    cardFee,
    otherCosts,
    shipping,
    includeShipping,
    setCost,
    setMargin,
    setTax,
    setCardFee,
    setOtherCosts,
    setShipping,
    setIncludeShipping,
    // Use direct value setters
    setCostValue,
    setTaxValue,
    setCardFeeValue,
    setOtherCostsValue,
    setShippingValue
  } = useCalculatorInputs(userId);

  const {
    result,
    setResult,
    preview,
    setPreview,
    calculatePrice
  } = useCalculatorResult(cost, margin, tax, cardFee, otherCosts, shipping, includeShipping, setIsLoading, toast);

  const {
    isManualMode,
    manualPrice,
    togglePriceMode,
    handleManualPriceChange
  } = useManualPricing(result, setResult, setMargin, cost, tax, cardFee, otherCosts, shipping, includeShipping);

  const { 
    history,
    addToHistory,
  // clearHistory,
  // deleteItem,
    loading: historyLoading, 
    error: historyError,
    isSupabaseConfigured 
  } = useCalculationHistory();
  
  const { saveCalculationOffline } = useOfflineCalculator();

  const resetCalculator = () => {
    setCostValue("");
    setMargin(30);
    setTaxValue("");
    setCardFeeValue("");
    setOtherCostsValue("");
    setShippingValue("");
    setIncludeShipping(false);
    setResult(null);
    setPreview(null);
    toast({
      title: "Valores limpos",
      description: "Todos os campos foram resetados para um novo cálculo.",
    });
  };

  // Função para calcular resultado baseado no preço manual - CORRIGIDA
  const calculateManualResult = (manualPriceValue: number) => {
    const costValue = parseInputValue(cost);
    const taxValue = parseInputValue(tax);
    const cardFeeValue = parseInputValue(cardFee);
    const otherCostsValue = parseInputValue(otherCosts);
    const shippingValue = includeShipping ? parseInputValue(shipping) : 0;

    // Calcular os valores das taxas baseados no preço de venda
    const taxAmount = manualPriceValue * (taxValue / 100);
    const cardFeeAmount = manualPriceValue * (cardFeeValue / 100);
    
    // CORREÇÃO: Custo total agora inclui TODAS as taxas
    const totalCost = costValue + otherCostsValue + shippingValue + taxAmount + cardFeeAmount;
    
    // Lucro = Preço de venda - Custo total (já incluindo todas as taxas)
    const profit = manualPriceValue - totalCost;
    const realMarginPercent = (profit / manualPriceValue) * 100;

    return {
      sellingPrice: manualPriceValue,
      profit: profit,
      isHealthyProfit: realMarginPercent >= 10,
      isManualPrice: true,
      breakdown: {
        costValue,
        otherCostsValue,
        shippingValue,
        totalCost, // Agora inclui todas as taxas
        marginAmount: profit,
        realMarginPercent,
        taxAmount,
        cardFeeAmount,
      }
    };
  };

  // Execute the main calculation - modificado para lidar com modo manual
  const handleCalculatePrice = () => {
    if (isManualMode) {
      // Modo manual: usar o preço informado e calcular lucro/margem
      const manualPriceValue = parseInputValue(manualPrice);

      if (manualPriceValue <= 0) {
        toast({
          title: "Valor inválido",
          description: "O preço de venda deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      const costValue = parseInputValue(cost);

      if (costValue <= 0) {
        toast({
          title: "Valor inválido",
          description: "O custo do produto deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const meta = import.meta as (ImportMeta & { vitest?: unknown });
      const delay = ("vitest" in meta) ? 0 : 400;
      setTimeout(async () => {
        const manualResult = calculateManualResult(manualPriceValue);
        setResult(manualResult);

        const newHistoryItem: CalculationHistory = {
          id: Date.now().toString(),
          date: new Date(),
          cost,
          otherCosts,
          shipping,
          margin,
          tax,
          cardFee,
          includeShipping,
          result: manualResult,
        };

        addToHistory(newHistoryItem);
        onAfterCalculation?.(newHistoryItem);

        await saveCalculationOffline(
          "simple",
          { cost, margin, tax, cardFee, otherCosts, shipping, includeShipping },
          manualResult
        );

        setIsLoading(false);

        toast({
          title: "Cálculo processado!",
          description: `Preço mantido: R$ ${formatCurrency(manualPriceValue)}`,
        });
      }, delay);
    } else {
      // Modo normal: calcular preço baseado na margem
      calculatePrice(
        cost,
        margin,
        tax,
        cardFee,
        otherCosts,
        shipping,
        includeShipping,
        (historyItem) => {
          addToHistory(historyItem);
          onAfterCalculation?.(historyItem);
        }
      );
    }
  };

  // Função para aplicar templates - definir setState para permitir aplicação de templates
  const setState = useCallback((newState: Partial<{
    cost: string | number;
    margin: number;
    tax: string | number;
    cardFee: string | number;
    otherCosts: string | number;
    shipping: string | number;
    includeShipping: boolean;
  }>) => {
    if (newState.cost !== undefined) {
      setCostValue(String(newState.cost));
    }
    if (newState.margin !== undefined) {
      setMargin(newState.margin);
    }
    if (newState.tax !== undefined) {
      setTaxValue(String(newState.tax));
    }
    if (newState.cardFee !== undefined) {
      setCardFeeValue(String(newState.cardFee));
    }
    if (newState.otherCosts !== undefined) {
      setOtherCostsValue(String(newState.otherCosts));
    }
    if (newState.shipping !== undefined) {
      setShippingValue(String(newState.shipping));
    }
    if (newState.includeShipping !== undefined) {
      setIncludeShipping(newState.includeShipping);
    }
  }, [setCostValue, setMargin, setTaxValue, setCardFeeValue, setOtherCostsValue, setShippingValue, setIncludeShipping]);

  return {
    // Inputs
    cost,
    margin,
    tax,
    cardFee,
    otherCosts,
    shipping,
    includeShipping,
    
    // Results
    result,
    preview,
    
    // History
    history,
    historyLoading,
    historyError,
    isSupabaseConfigured,
    
    // Status
    isPro,
    isLoading,
    
    // Input handlers - both event handlers and direct value setters
    setCost,
    setMargin,
    setTax,
    setCardFee,
    setOtherCosts,
    setShipping,
    setIncludeShipping,
    
    // Direct value setters
    setCostValue,
    setTaxValue,
    setCardFeeValue,
    setOtherCostsValue,
    setShippingValue,
    
    // Actions
    calculatePrice: handleCalculatePrice,
    resetCalculator,
    
    // Utilities
    formatCurrency,
    parseInputValue,
    
    // Manual pricing
    manualPrice,
    isManualMode,
    handleManualPriceChange,
    togglePriceMode,
    
    // Adicionar setState para templates
    setState
  };
};
