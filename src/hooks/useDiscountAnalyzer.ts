/**
 * Feature #6: Discount Analyzer Hook
 * Calculates safe discount limits and analyzes profit impact
 */

import { useCallback, useState } from 'react';
import {
  COMPETITIVE_DISCOUNTS,
  DISCOUNT_PRESETS,
  type DiscountAlert,
  type DiscountInput,
  type DiscountRange,
  type DiscountRecommendation,
  type DiscountResult,
  type DiscountScenario,
} from '@/types/discountAnalyzer';

export function useDiscountAnalyzer() {
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * Calculate discount analysis
   */
  const analyzeDiscount = useCallback((input: DiscountInput): DiscountResult => {
    setIsCalculating(true);

    try {
      // 1. Calculate unit economics
      const marketplaceFee = input.sellingPrice * (input.marketplaceFeePercent / 100);
      const totalCost = input.costPrice + marketplaceFee + input.shippingCost + (input.additionalCosts || 0);
      const currentProfit = input.sellingPrice - totalCost;
      const currentMargin = (currentProfit / input.sellingPrice) * 100;

      // 2. Calculate maximum safe discount (keeps profit > 0)
      const maxDiscountValue = currentProfit; // Máximo que pode descontar sem prejuízo
      const maxDiscountPercent = (maxDiscountValue / input.sellingPrice) * 100;
      const priceWithMaxDiscount = input.sellingPrice - maxDiscountValue;

      // 3. Break-even discount (profit = 0)
      const breakEvenDiscountPercent = maxDiscountPercent;

      // 4. Define discount ranges
      const safeRange: DiscountRange = {
        label: 'Zona Segura',
        minPercent: 0,
        maxPercent: maxDiscountPercent * 0.3, // Até 30% do lucro
        color: '#10b981',
        description: 'Mantém mais de 70% do lucro',
        profitImpact: 'Lucro reduz menos de 30%',
      };

      const cautionRange: DiscountRange = {
        label: 'Zona de Atenção',
        minPercent: maxDiscountPercent * 0.3,
        maxPercent: maxDiscountPercent * 0.7, // 30-70% do lucro
        color: '#f59e0b',
        description: 'Reduz significativamente o lucro',
        profitImpact: 'Lucro reduz 30-70%',
      };

      const dangerRange: DiscountRange = {
        label: 'Zona de Risco',
        minPercent: maxDiscountPercent * 0.7,
        maxPercent: maxDiscountPercent, // 70-100% do lucro
        color: '#ef4444',
        description: 'Lucro mínimo, quase sem margem',
        profitImpact: 'Lucro reduz mais de 70%',
      };

      const lossRange: DiscountRange = {
        label: 'Zona de Prejuízo',
        minPercent: maxDiscountPercent,
        maxPercent: 100,
        color: '#dc2626',
        description: 'Você terá prejuízo!',
        profitImpact: 'Prejuízo garantido',
      };

      // 5. Generate recommendations
      const recommendations = generateRecommendations({
        input,
        currentProfit,
        currentMargin,
        maxDiscountPercent,
      });

      // 6. Generate alerts
      const alerts = generateAlerts({
        currentMargin,
        maxDiscountPercent,
        input,
      });

      return {
        maxDiscountPercent,
        maxDiscountValue,
        priceWithMaxDiscount,
        breakEvenDiscountPercent,
        currentProfit,
        currentMargin,
        safeRange,
        cautionRange,
        dangerRange,
        lossRange,
        recommendations,
        alerts,
      };
    } finally {
      setIsCalculating(false);
    }
  }, []);

  /**
   * Simulate a specific discount percentage
   */
  const simulateDiscount = useCallback(
    (input: DiscountInput, discountPercent: number): DiscountScenario => {
      const result = analyzeDiscount(input);
      
      // Calculate discount impact
      const discountValue = input.sellingPrice * (discountPercent / 100);
      const finalPrice = input.sellingPrice - discountValue;
      
      // Recalculate profit with discount
      const marketplaceFee = finalPrice * (input.marketplaceFeePercent / 100);
      const totalCost = input.costPrice + marketplaceFee + input.shippingCost + (input.additionalCosts || 0);
      const profitPerUnit = finalPrice - totalCost;
      const profitMargin = (profitPerUnit / finalPrice) * 100;
      
      // Profit loss percentage
      const profitLoss = ((result.currentProfit - profitPerUnit) / result.currentProfit) * 100;
      
      // Revenue impact
      const originalRevenue = input.currentVolume ? input.sellingPrice * input.currentVolume : 0;
      const newRevenue = input.currentVolume ? finalPrice * input.currentVolume : 0;
      const revenueChange = originalRevenue > 0 ? ((newRevenue - originalRevenue) / originalRevenue) * 100 : 0;
      
      // Volume increase needed to compensate profit loss
      const volumeIncreaseNeeded = profitPerUnit > 0
        ? ((result.currentProfit / profitPerUnit) - 1) * 100
        : Infinity;
      
      // Determine status
      let status: DiscountScenario['status'];
      let statusLabel: string;
      
      if (discountPercent <= result.safeRange.maxPercent) {
        status = 'safe';
        statusLabel = '✅ Desconto Seguro';
      } else if (discountPercent <= result.cautionRange.maxPercent) {
        status = 'caution';
        statusLabel = '⚠️ Atenção: Lucro Reduzido';
      } else if (discountPercent <= result.dangerRange.maxPercent) {
        status = 'danger';
        statusLabel = '🔥 Risco: Lucro Mínimo';
      } else {
        status = 'loss';
        statusLabel = '🔴 PREJUÍZO!';
      }
      
      return {
        discountPercent,
        discountValue,
        finalPrice,
        profitPerUnit,
        profitMargin,
        profitLoss,
        originalRevenue,
        newRevenue,
        revenueChange,
        volumeIncreaseNeeded,
        status,
        statusLabel,
      };
    },
    [analyzeDiscount]
  );

  /**
   * Compare multiple discount scenarios
   */
  const compareDiscounts = useCallback(
    (input: DiscountInput, discountPercentages: number[]): DiscountScenario[] => {
      return discountPercentages.map(percent => simulateDiscount(input, percent));
    },
    [simulateDiscount]
  );

  /**
   * Get preset discount scenarios
   */
  const getPresetScenarios = useCallback(
    (input: DiscountInput): DiscountScenario[] => {
      const result = analyzeDiscount(input);
      
      return DISCOUNT_PRESETS.map(preset => {
        const discountPercent = result.maxDiscountPercent * preset.percentage;
        return simulateDiscount(input, discountPercent);
      });
    },
    [analyzeDiscount, simulateDiscount]
  );

  return {
    analyzeDiscount,
    simulateDiscount,
    compareDiscounts,
    getPresetScenarios,
    isCalculating,
  };
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(data: {
  input: DiscountInput;
  currentProfit: number;
  currentMargin: number;
  maxDiscountPercent: number;
}): DiscountRecommendation[] {
  const recommendations: DiscountRecommendation[] = [];

  // Get competitive benchmark for marketplace
  const marketplaceKey = data.input.marketplace as keyof typeof COMPETITIVE_DISCOUNTS;
  const competitive = COMPETITIVE_DISCOUNTS[marketplaceKey] || COMPETITIVE_DISCOUNTS.default;

  // 1. Safe discount (20% of max)
  const safePercent = data.maxDiscountPercent * 0.2;
  const safePrice = data.input.sellingPrice * (1 - safePercent / 100);
  
  recommendations.push({
    type: 'safe',
    discountPercent: safePercent,
    finalPrice: safePrice,
    description: 'Desconto conservador que mantém boa margem',
    icon: '✅',
    pros: ['Mantém 80% do lucro', 'Baixo risco', 'Margem saudável'],
    cons: ['Desconto menor que concorrentes', 'Pode não atrair tanto'],
  });

  // 2. Competitive discount (based on marketplace average)
  const competitivePercent = Math.min(competitive.average, data.maxDiscountPercent * 0.5);
  const competitivePrice = data.input.sellingPrice * (1 - competitivePercent / 100);
  
  recommendations.push({
    type: 'competitive',
    discountPercent: competitivePercent,
    finalPrice: competitivePrice,
    description: `Desconto médio praticado no ${data.input.marketplace}`,
    icon: '⚖️',
    pros: ['Alinhado com mercado', 'Bom equilíbrio preço/lucro', 'Competitivo'],
    cons: ['Reduz 50% do lucro', 'Necessita volume maior'],
  });

  // 3. Aggressive discount (70% of max)
  const aggressivePercent = data.maxDiscountPercent * 0.7;
  const aggressivePrice = data.input.sellingPrice * (1 - aggressivePercent / 100);
  
  recommendations.push({
    type: 'aggressive',
    discountPercent: aggressivePercent,
    finalPrice: aggressivePrice,
    description: 'Desconto agressivo para ganhar volume',
    icon: '🔥',
    pros: ['Alta atratividade', 'Aumenta conversão', 'Destaque no marketplace'],
    cons: ['Reduz 70% do lucro', 'Risco de prejuízo se custos variarem'],
  });

  // 4. Promotional (if margin is good)
  if (data.currentMargin > 30) {
    const promoPercent = Math.min(competitive.max, data.maxDiscountPercent * 0.85);
    const promoPrice = data.input.sellingPrice * (1 - promoPercent / 100);
    
    recommendations.push({
      type: 'promotional',
      discountPercent: promoPercent,
      finalPrice: promoPrice,
      description: 'Promoção relâmpago para liquidar estoque',
      icon: '⚡',
      pros: ['Máximo desconto seguro', 'Vende rápido', 'Giro de estoque'],
      cons: ['Lucro mínimo (15%)', 'Use apenas em promoções especiais'],
    });
  }

  return recommendations;
}

/**
 * Generate alerts based on analysis
 */
function generateAlerts(data: {
  currentMargin: number;
  maxDiscountPercent: number;
  input: DiscountInput;
}): DiscountAlert[] {
  const alerts: DiscountAlert[] = [];

  // Critical: Very low margin
  if (data.currentMargin < 10) {
    alerts.push({
      type: 'danger',
      message: '🔴 MARGEM CRÍTICA: Sua margem atual é muito baixa (<10%). Qualquer desconto pode causar prejuízo!',
      severity: 'high',
    });
  } else if (data.currentMargin < 20) {
    alerts.push({
      type: 'warning',
      message: '⚠️ MARGEM BAIXA: Margem de apenas ' + data.currentMargin.toFixed(1) + '%. Cuidado com descontos!',
      severity: 'high',
    });
  }

  // Info: Good margin for discounts
  if (data.currentMargin >= 30) {
    alerts.push({
      type: 'success',
      message: '✅ MARGEM SAUDÁVEL: Você tem ' + data.currentMargin.toFixed(1) + '% de margem. Espaço para descontos competitivos!',
      severity: 'low',
    });
  }

  // Info: Maximum discount warning
  if (data.maxDiscountPercent < 10) {
    alerts.push({
      type: 'warning',
      message: `⚠️ Desconto máximo seguro é apenas ${data.maxDiscountPercent.toFixed(1)}%. Considere reduzir custos ou aumentar preço.`,
      severity: 'medium',
    });
  } else if (data.maxDiscountPercent > 20) {
    alerts.push({
      type: 'info',
      message: `💡 Você pode dar até ${data.maxDiscountPercent.toFixed(1)}% de desconto sem prejuízo. Use estrategicamente!`,
      severity: 'low',
    });
  }

  // Warning: High fees eating margin
  if (data.input.marketplaceFeePercent > 15) {
    alerts.push({
      type: 'info',
      message: `📊 Taxas do marketplace (${data.input.marketplaceFeePercent}%) limitam sua margem para descontos.`,
      severity: 'medium',
    });
  }

  return alerts;
}
