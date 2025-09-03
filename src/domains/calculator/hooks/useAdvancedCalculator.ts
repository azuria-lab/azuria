import { useCallback, useMemo, useState } from "react";
import { logger } from "@/services/logger";
import { useToast } from "@/hooks/use-toast";
import type { AdvancedCalculationResult, TaxRegime } from "../types/advanced";
import { CalculationService } from "../services/CalculationService";
import { ValidationService } from "../services/ValidationService";
import { marketplaces } from "@/data/marketplaces";

export const useAdvancedCalculator = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AdvancedCalculationResult | null>(null);

  // Tax regimes
  const taxRegimes: TaxRegime[] = useMemo(() => ([
    {
      id: 'simples',
      name: 'Simples Nacional',
      description: 'Regime tributário simplificado para pequenas empresas',
      category: 'simples',
      rates: { irpj: 0, csll: 0, pis: 0, cofins: 0, icms: 0, cpp: 2.75 },
      annexo: 'I',
      faturamentoLimite: 4800000,
      applicableActivities: ['comércio', 'revenda', 'varejo', 'serviços', 'consultoria', 'assistência'],
      simplexPercent: 6.0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      icms: 0,
      applicableToProduct: true,
      applicableToService: true
    },
    {
      id: 'presumido',
      name: 'Lucro Presumido',
      description: 'Regime baseado em presunção de lucro',
      category: 'presumido',
      rates: { irpj: 15, csll: 9, pis: 1.65, cofins: 7.6, icms: 12, inss: 11.0 },
      faturamentoLimite: 78000000,
      applicableActivities: ['comércio', 'revenda', 'varejo'],
      simplexPercent: 0,
      pis: 1.65,
      cofins: 7.6,
      irpj: 1.2,
      csll: 1.08,
      icms: 12,
      applicableToProduct: true,
      applicableToService: false
    },
    {
      id: 'real',
      name: 'Lucro Real',
      description: 'Regime baseado no lucro efetivamente apurado',
      category: 'real',
      rates: { irpj: 15, csll: 9, pis: 1.65, cofins: 7.6, icms: 12, icms_st: 2.0, inss: 11.0 },
      applicableActivities: ['todos'],
      simplexPercent: 0,
      pis: 1.65,
      cofins: 7.6,
      irpj: 2.5,
      csll: 0.9,
      icms: 12,
      applicableToProduct: true,
      applicableToService: true
    }
  ]), []);

  const calculateAdvanced = useCallback(async (params: {
    cost: number;
    taxRegime: TaxRegime;
    marketplaceFee: number;
    paymentFee: number;
    logisticsFee: number;
    advertisingFee: number;
    otherFees: number;
    targetMargin: number;
    shipping: number;
    includeShipping: boolean;
  }) => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      const validation = ValidationService.validateAdvancedInputs(params);
      if (!validation.isValid) {
        toast({
          title: "Erro de validação",
          description: validation.errors.join(", "),
          variant: "destructive"
        });
        return null;
      }

      // Calculate advanced result
      const calculationResult = await CalculationService.calculateAdvanced(params);
      
      setResult(calculationResult);
      
      toast({
        title: "Cálculo realizado",
        description: `Preço de venda: R$ ${calculationResult.sellingPrice.toFixed(2)}`,
      });

      return calculationResult;
    } catch (error) {
      logger.error('Erro no cálculo avançado:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao calcular. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const calculateAdvancedPrice = useCallback(async (params: {
    cost: number;
    targetMargin: number;
    marketplaceId: string;
    taxRegimeId: string;
    shipping: number;
    otherCosts: number;
    enableCompetitorAnalysis?: boolean;
    productCategory?: string;
    businessActivity?: string;
  }) => {
    // Convert to the format expected by calculateAdvanced
    const selectedRegime = taxRegimes.find(r => r.id === params.taxRegimeId);
    if (!selectedRegime) {
      throw new Error('Regime tributário não encontrado');
    }

    return calculateAdvanced({
      cost: params.cost,
      taxRegime: selectedRegime,
      marketplaceFee: 0,
      paymentFee: 0,
      logisticsFee: 0,
      advertisingFee: 0,
      otherFees: 0,
      targetMargin: params.targetMargin,
      shipping: params.shipping,
      includeShipping: true
    });
  }, [calculateAdvanced, taxRegimes]);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    result,
    isLoading,
    taxRegimes,
    calculateAdvanced,
    calculateAdvancedPrice,
    marketplaces,
    reset
  };
};