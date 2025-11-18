/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * useBiddingCalculator Hook
 * 
 * Hook principal para gerenciar o estado e a lógica da Calculadora de Licitação
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bidding,
  BiddingCalculationResult,
  BiddingData,
  BiddingGuarantee,
  BiddingItem,
  BiddingLifecycleStatus,
  BiddingScenario,
  BiddingStatus,
  BiddingStrategy,
  BiddingTaxConfig,
  BiddingTaxRegime,
  BiddingType,
  GuaranteeType,
  UseBiddingCalculator,
} from '@/types/bidding';
import {
  calculateBidding,
  generateScenarios,
  simulateDiscount,
} from '@/services/bidding/biddingCalculations';
import { logger } from '@/services/logger';

// ============================================
// VALORES PADRÕES
// ============================================

const DEFAULT_TAX_CONFIG: BiddingTaxConfig = {
  regime: BiddingTaxRegime.SIMPLES_NACIONAL,
  pis: 0.65,
  cofins: 3,
  irpj: 0,
  csll: 0,
  icms: 0,
  iss: 0,
  simplesRate: 6,
  socialCharges: 0,
  laborCharges: 0,
};

const DEFAULT_STRATEGY: BiddingStrategy = {
  desiredMargin: 10,
  minimumMargin: 5,
  maximumDiscount: 15,
  competitiveAnalysis: false,
  useAI: false,
};

const DEFAULT_GUARANTEE: BiddingGuarantee = {
  type: GuaranteeType.NENHUMA,
  percentage: 0,
};

// ============================================
// HOOK
// ============================================

export function useBiddingCalculator(initialData?: Partial<Bidding>): UseBiddingCalculator {
  // Estado principal
  const [bidding, setBidding] = useState<Partial<Bidding>>(() => ({
    data: {
      id: initialData?.data?.id || crypto.randomUUID(),
      editalNumber: initialData?.data?.editalNumber || '',
      organ: initialData?.data?.organ || '',
      type: initialData?.data?.type || BiddingType.PREGAO_ELETRONICO,
      mode: initialData?.data?.mode || undefined!,
      openingDate: initialData?.data?.openingDate || new Date(),
      status: initialData?.data?.status || BiddingStatus.RASCUNHO,
      lifecycleStatus: initialData?.data?.lifecycleStatus || BiddingLifecycleStatus.OPEN,
      createdAt: initialData?.data?.createdAt || new Date(),
      updatedAt: new Date(),
    },
    items: initialData?.items || [],
    taxConfig: initialData?.taxConfig || DEFAULT_TAX_CONFIG,
    guarantee: initialData?.guarantee || DEFAULT_GUARANTEE,
    strategy: initialData?.strategy || DEFAULT_STRATEGY,
  }));

  const [result, setResult] = useState<BiddingCalculationResult | null>(null);
  const [scenarios, setScenarios] = useState<BiddingScenario[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================
  // VALIDAÇÕES
  // ============================================

  const _validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Valida dados básicos
    if (!bidding.data?.editalNumber) {
      newErrors.editalNumber = 'Número do edital é obrigatório';
    }
    if (!bidding.data?.organ) {
      newErrors.organ = 'Órgão é obrigatório';
    }

    // Valida itens
    if (!bidding.items || bidding.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item';
    } else {
      for (const [index, item] of bidding.items.entries()) {
        if (!item.description) {
          newErrors[`item-${index}-description`] = 'Descrição é obrigatória';
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item-${index}-quantity`] = 'Quantidade deve ser maior que zero';
        }
        if (!item.unitCost || item.unitCost <= 0) {
          newErrors[`item-${index}-unitCost`] = 'Custo unitário deve ser maior que zero';
        }
      }
    }

    // Valida configuração tributária
    if (!bidding.taxConfig) {
      newErrors.taxConfig = 'Configuração tributária é obrigatória';
    }

    // Valida estratégia
    if (!bidding.strategy) {
      newErrors.strategy = 'Estratégia de lance é obrigatória';
    } else if (
      bidding.strategy.minimumMargin &&
      bidding.strategy.desiredMargin &&
      bidding.strategy.minimumMargin > bidding.strategy.desiredMargin
    ) {
      newErrors.strategy = 'Margem mínima não pode ser maior que a margem desejada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [bidding]);

  const isValid = useMemo(() => {
    return (
      !!bidding.data?.editalNumber &&
      !!bidding.data?.organ &&
      !!bidding.items &&
      bidding.items.length > 0 &&
      bidding.items.every((item) => item.quantity > 0 && item.unitCost > 0)
    );
  }, [bidding]);

  const canCalculate = useMemo(() => {
    return isValid && !!bidding.taxConfig && !!bidding.strategy;
  }, [isValid, bidding.taxConfig, bidding.strategy]);

  // ============================================
  // AÇÕES - DADOS
  // ============================================

  const updateData = useCallback((data: Partial<BiddingData>) => {
    setBidding((prev) => ({
      ...prev,
      data: {
        ...prev.data!,
        ...data,
        updatedAt: new Date(),
      },
    }));
  }, []);

  // ============================================
  // AÇÕES - ITENS
  // ============================================

  const addItem = useCallback((item: BiddingItem) => {
    setBidding((prev) => ({
      ...prev,
      items: [...(prev.items || []), { ...item, id: crypto.randomUUID() }],
    }));
  }, []);

  const updateItem = useCallback((index: number, item: Partial<BiddingItem>) => {
    setBidding((prev) => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], ...item };
      return { ...prev, items: newItems };
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setBidding((prev) => {
      const newItems = [...(prev.items || [])];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  }, []);

  // ============================================
  // AÇÕES - CONFIGURAÇÕES
  // ============================================

  const updateTaxConfig = useCallback((config: Partial<BiddingTaxConfig>) => {
    setBidding((prev) => ({
      ...prev,
      taxConfig: { ...prev.taxConfig!, ...config },
    }));
  }, []);

  const updateGuarantee = useCallback((guarantee: Partial<BiddingGuarantee>) => {
    setBidding((prev) => ({
      ...prev,
      guarantee: { ...prev.guarantee!, ...guarantee },
    }));
  }, []);

  const updateStrategy = useCallback((strategy: Partial<BiddingStrategy>) => {
    setBidding((prev) => ({
      ...prev,
      strategy: { ...prev.strategy!, ...strategy },
    }));
  }, []);

  // ============================================
  // CÁLCULOS
  // ============================================

  const calculate = useCallback(() => {
    if (!canCalculate) {return;}

    try {
      const calculationResult = calculateBidding(
        bidding.items!,
        bidding.taxConfig!,
        bidding.strategy!,
        bidding.guarantee
      );

      setResult(calculationResult);

      // Atualiza bidding com resultado
      setBidding((prev) => ({
        ...prev,
        result: calculationResult,
      }));
    } catch (error) {
      logger.error('Erro ao calcular licitação', { error });
      setErrors({ calculation: 'Erro ao calcular. Verifique os dados.' });
    }
  }, [bidding, canCalculate]);

  const recalculate = useCallback(() => {
    calculate();
  }, [calculate]);

  const simulateScenarios = useCallback(
    (margins: number[]) => {
      if (!bidding.items || !bidding.taxConfig) {return;}

      try {
        const newScenarios = generateScenarios(
          bidding.items.reduce((total, item) => {
            return (
              total +
              (item.unitCost + (item.otherCosts || 0)) * (item.quantity || 1)
            );
          }, 0),
          margins,
          bidding.taxConfig,
          bidding.guarantee
        );

        setScenarios(newScenarios);

        // Atualiza bidding com cenários
        setBidding((prev) => ({
          ...prev,
          scenarios: newScenarios,
        }));
      } catch (error) {
        logger.error('Erro ao simular cenários', { error });
      }
    },
    [bidding.items, bidding.taxConfig, bidding.guarantee]
  );

  const simulateDiscountCallback = useCallback(
    (discountPercentage: number): BiddingScenario => {
      if (!result || !bidding.taxConfig) {
        return {
          id: 'error',
          name: 'Erro',
          margin: 0,
          discount: 0,
          price: 0,
          profit: 0,
          viability: 'inviavel' as BiddingScenario['viability'],
        };
      }

      const totalCost =
        bidding.items?.reduce((total, item) => {
          return total + (item.unitCost + (item.otherCosts || 0)) * (item.quantity || 1);
        }, 0) || 0;

      return simulateDiscount(
        result.suggestedPrice,
        discountPercentage,
        totalCost,
        bidding.taxConfig
      );
    },
    [result, bidding.taxConfig, bidding.items]
  );

  // ============================================
  // PERSISTÊNCIA (MOCK - implementar com Supabase)
  // ============================================

  const save = useCallback(async () => {
    try {
      // FUTURE: Implementar salvamento no Supabase quando disponível
      const biddingToSave = {
        ...bidding,
        data: {
          ...bidding.data!,
          updatedAt: new Date(),
        },
      };

      // Salvar no localStorage por enquanto
      const saved = localStorage.getItem('biddings') || '[]';
      const biddings = JSON.parse(saved) as Bidding[];
      
      const index = biddings.findIndex((stored) => stored.data?.id === biddingToSave.data?.id);
      if (index >= 0) {
        // @ts-expect-error - Complex bidding type inference
        biddings[index] = biddingToSave;
      } else {
        // @ts-expect-error - Complex bidding type inference
        biddings.push(biddingToSave);
      }
      
      localStorage.setItem('biddings', JSON.stringify(biddings));

      logger.info('Licitação salva com sucesso', {
        biddingId: biddingToSave.data?.id,
      });
    } catch (error) {
      logger.error('Erro ao salvar licitação', { error });
      throw error;
    }
  }, [bidding]);

  const load = useCallback(async (id: string) => {
    try {
      // FUTURE: Implementar carregamento do Supabase quando disponível
      
      // Carregar do localStorage por enquanto
      const saved = localStorage.getItem('biddings') || '[]';
      const biddings = JSON.parse(saved) as Bidding[];
      const found = biddings.find((stored) => stored.data?.id === id);

      if (found) {
        setBidding(found);
        if (found.result) {
          setResult(found.result);
        }
        if (found.scenarios) {
          setScenarios(found.scenarios);
        }
      }
    } catch (error) {
      logger.error('Erro ao carregar licitação', { error });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setBidding({
      data: {
        id: crypto.randomUUID(),
        editalNumber: '',
        organ: '',
        type: BiddingType.PREGAO_ELETRONICO,
        mode: undefined!,
        openingDate: new Date(),
        status: BiddingStatus.RASCUNHO,
        lifecycleStatus: BiddingLifecycleStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      items: [],
      taxConfig: DEFAULT_TAX_CONFIG,
      guarantee: DEFAULT_GUARANTEE,
      strategy: DEFAULT_STRATEGY,
    });
    setResult(null);
    setScenarios([]);
    setErrors({});
  }, []);

  // ============================================
  // EFEITOS
  // ============================================

  // Recalcula automaticamente quando dados relevantes mudam
  useEffect(() => {
    if (canCalculate && bidding.items && bidding.items.length > 0) {
      calculate();
    }
  }, [calculate, canCalculate, bidding.items, bidding.taxConfig, bidding.strategy, bidding.guarantee]);

  // Gera cenários automaticamente
  useEffect(() => {
    if (result) {
      simulateScenarios([5, 8, 10, 12, 15, 20]);
    }
  }, [result, simulateScenarios]);

  // ============================================
  // RETORNO
  // ============================================

  return {
    bidding,
    result,
    scenarios,
    updateData,
    addItem,
    updateItem,
    removeItem,
    updateTaxConfig,
    updateGuarantee,
    updateStrategy,
    calculate,
    recalculate,
    simulateScenarios,
    simulateDiscount: simulateDiscountCallback,
    isValid,
    canCalculate,
    errors,
    save,
    load,
    reset,
  };
}
