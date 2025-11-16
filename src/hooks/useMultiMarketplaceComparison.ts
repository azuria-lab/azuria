import { MARKETPLACE_TEMPLATES } from '@/shared/types/marketplaceTemplates';
import type {
  MarketplaceComparisonResult,
  MultiMarketplaceComparisonData,
  MultiMarketplaceInput,
} from '@/types/multiMarketplace';

/**
 * Hook para comparar preços e lucros em todos os marketplaces simultaneamente
 */
export function useMultiMarketplaceComparison() {
  
  /**
   * Calcula o preço sugerido e lucro para um marketplace específico
   */
  const calculateForMarketplace = (
    marketplaceId: string,
    input: MultiMarketplaceInput
  ): MarketplaceComparisonResult | null => {
    const marketplace = MARKETPLACE_TEMPLATES.find(m => m.id === marketplaceId);
    
    if (!marketplace) {
      return null;
    }

    const {
      cost,
      targetMargin,
      shipping,
      packaging,
      marketing,
      otherCosts,
      includePaymentFee,
    } = input;

    // Calcula taxas do marketplace
    const marketplaceFeePercentage = marketplace.defaultValues.commission || 0;
    const paymentFeePercentage = includePaymentFee 
      ? (marketplace.defaultValues.paymentFee || 0) 
      : 0;
    const advertisingFeePercentage = marketplace.defaultValues.advertisingFee || 0;

    // Custos fixos
    const fixedCosts = cost + shipping + packaging + marketing + otherCosts;

    // Cálculo do preço com margem alvo
    // Fórmula: Preço = (Custo Total) / (1 - Margem% - Taxas%)
    const totalFeePercentage = (marketplaceFeePercentage + paymentFeePercentage + advertisingFeePercentage) / 100;
    const marginDecimal = targetMargin / 100;
    
    const suggestedPrice = fixedCosts / (1 - marginDecimal - totalFeePercentage);

    // Cálculo detalhado das taxas
    const marketplaceFee = suggestedPrice * (marketplaceFeePercentage / 100);
    const paymentFee = suggestedPrice * (paymentFeePercentage / 100);
    const advertisingFee = suggestedPrice * (advertisingFeePercentage / 100);
    
    const totalFees = marketplaceFee + paymentFee + advertisingFee;
    const totalCosts = fixedCosts + totalFees;
    const netProfit = suggestedPrice - totalCosts;
    const profitMargin = (netProfit / suggestedPrice) * 100;

    return {
      marketplaceId: marketplace.id,
      marketplaceName: marketplace.name,
      marketplaceIcon: marketplace.logo,
      suggestedPrice,
      netProfit,
      profitMargin,
      totalFees,
      totalCosts,
      ranking: 0, // Será calculado depois
      profitDifference: 0, // Será calculado depois
      profitDifferencePercentage: 0, // Será calculado depois
      isRecommended: false, // Será calculado depois
      breakdown: {
        marketplaceFee,
        marketplaceFeePercentage,
        paymentFee,
        paymentFeePercentage,
        shippingCost: shipping,
        packagingCost: packaging,
        marketingCost: marketing,
        otherCosts,
      },
      insights: generateInsights(marketplace.name, profitMargin, totalFees, suggestedPrice),
    };
  };

  /**
   * Compara todos os marketplaces e retorna análise completa
   */
  const compareAll = (input: MultiMarketplaceInput): MultiMarketplaceComparisonData => {
    // Calcula para todos os marketplaces
    const allResults = MARKETPLACE_TEMPLATES
      .map(mp => calculateForMarketplace(mp.id, input))
      .filter((result): result is MarketplaceComparisonResult => result !== null);

    // Ordena por lucro líquido (maior primeiro)
    const sortedResults = [...allResults].sort((a, b) => b.netProfit - a.netProfit);

    // Atribui ranking
    const rankedResults = sortedResults.map((result, index) => ({
      ...result,
      ranking: index + 1,
      isRecommended: index === 0,
    }));

    // Calcula diferenças em relação ao melhor
    const bestProfit = rankedResults[0]?.netProfit || 0;
    const resultsWithDifferences = rankedResults.map(result => ({
      ...result,
      profitDifference: bestProfit - result.netProfit,
      profitDifferencePercentage: bestProfit > 0 
        ? ((bestProfit - result.netProfit) / bestProfit) * 100 
        : 0,
    }));

    // Análises gerais
    const bestMarketplace = resultsWithDifferences[0];
    const worstMarketplace = resultsWithDifferences.at(-1) ?? bestMarketplace;
    
    const averageProfit = resultsWithDifferences.reduce((sum, r) => sum + r.netProfit, 0) / resultsWithDifferences.length;
    const averageMargin = resultsWithDifferences.reduce((sum, r) => sum + r.profitMargin, 0) / resultsWithDifferences.length;

    // Comparação de taxas
    const feesSorted = [...resultsWithDifferences].sort((a, b) => a.totalFees - b.totalFees);
    const lowestFees = feesSorted[0];
    const highestFees = feesSorted.at(-1) ?? lowestFees;

    const potentialSavings = worstMarketplace ? bestProfit - worstMarketplace.netProfit : 0;

    return {
      results: resultsWithDifferences,
      bestMarketplace,
      worstMarketplace,
      averageProfit,
      averageMargin,
      totalFeesComparison: {
        lowest: {
          marketplaceId: lowestFees.marketplaceId,
          value: lowestFees.totalFees,
        },
        highest: {
          marketplaceId: highestFees.marketplaceId,
          value: highestFees.totalFees,
        },
      },
      summary: generateSummary(bestMarketplace, worstMarketplace, potentialSavings),
    };
  };

  return {
    compareAll,
    calculateForMarketplace,
  };
}

/**
 * Gera insights específicos para cada marketplace
 */
function generateInsights(
  marketplaceName: string,
  profitMargin: number,
  totalFees: number,
  suggestedPrice: number
): string[] {
  const insights: string[] = [];

  if (profitMargin > 30) {
    insights.push(`✅ Excelente margem de lucro de ${profitMargin.toFixed(1)}%`);
  } else if (profitMargin > 20) {
    insights.push(`✔️ Boa margem de lucro de ${profitMargin.toFixed(1)}%`);
  } else if (profitMargin > 10) {
    insights.push(`⚠️ Margem moderada de ${profitMargin.toFixed(1)}%`);
  } else {
    insights.push(`🚨 Margem baixa de ${profitMargin.toFixed(1)}% - considere ajustar`);
  }

  const feePercentage = (totalFees / suggestedPrice) * 100;
  if (feePercentage > 20) {
    insights.push(`💰 Taxas altas representam ${feePercentage.toFixed(1)}% do preço`);
  } else if (feePercentage > 15) {
    insights.push(`💸 Taxas moderadas de ${feePercentage.toFixed(1)}%`);
  } else {
    insights.push(`✨ Taxas baixas de apenas ${feePercentage.toFixed(1)}%`);
  }

  // Insights específicos por marketplace
  if (marketplaceName === 'Mercado Livre' && feePercentage > 18) {
    insights.push('💡 Considere Mercado Envios para reduzir custos');
  }

  if (marketplaceName === 'Amazon' && totalFees > suggestedPrice * 0.25) {
    insights.push('📦 Taxas de fulfillment altas - avalie FBM');
  }

  if (marketplaceName === 'Shopee' && profitMargin > 25) {
    insights.push('🎯 Ótima opção com cashback para atrair clientes');
  }

  return insights;
}

/**
 * Gera resumo da comparação
 */
function generateSummary(
  best: MarketplaceComparisonResult,
  worst: MarketplaceComparisonResult,
  savings: number
): { message: string; recommendation: string; potentialSavings: number } {
  const message = `${best.marketplaceName} oferece o melhor lucro líquido de R$ ${best.netProfit.toFixed(2)}`;
  
  let recommendation = `Recomendamos vender no ${best.marketplaceName} `;
  
  if (savings > 50) {
    recommendation += `para maximizar seu lucro. Você pode ganhar até R$ ${savings.toFixed(2)} a mais por venda comparado ao ${worst.marketplaceName}.`;
  } else if (savings > 20) {
    recommendation += `pois oferece bom equilíbrio entre taxas e retorno.`;
  } else {
    recommendation += `mas considere testar múltiplos canais, pois as diferenças são pequenas.`;
  }

  return {
    message,
    recommendation,
    potentialSavings: savings,
  };
}
