/**
 * Pricing Service - Azuria AI
 *
 * Serviço responsável por análises e sugestões de precificação
 */

import { MarginAnalysis, PricingSuggestion } from '@/types/azuriaAI';

/**
 * Calcula sugestão de preço inteligente
 */
export function calculatePricingSuggestion(params: {
  cost_price: number;
  current_price?: number;
  target_margin?: number;
  tax_rate: number;
  marketplace_fee?: number;
  shipping_cost?: number;
}): PricingSuggestion {
  const {
    cost_price,
    current_price,
    target_margin = 30, // Margem padrão 30%
    tax_rate,
    marketplace_fee = 0,
    shipping_cost = 0,
  } = params;

  // Custo total (custo + frete)
  const total_cost = cost_price + shipping_cost;

  // Taxa total (impostos + marketplace)
  const total_fee_rate = tax_rate + marketplace_fee;

  // Fórmula por divisor (garante margem líquida real)
  const suggested_price =
    total_cost / (1 - target_margin / 100 - total_fee_rate / 100);

  // Cálculos de lucro
  const taxes_and_fees = suggested_price * (total_fee_rate / 100);
  const profit = suggested_price - total_cost - taxes_and_fees;
  const profit_percentage = (profit / suggested_price) * 100;

  // Preços alternativos
  const competitive_price = total_cost / (1 - 0.15 - total_fee_rate / 100); // 15% margem
  const premium_price = total_cost / (1 - 0.4 - total_fee_rate / 100); // 40% margem
  const minimum_price = total_cost / (1 - 0.05 - total_fee_rate / 100); // 5% margem

  // Confiança baseada na margem
  let confidence = 80;
  if (profit_percentage < 10) {
    confidence = 50;
  }
  if (profit_percentage > 20 && profit_percentage < 40) {
    confidence = 95;
  }

  // Reasoning
  let reasoning = `Baseado no custo de R$ ${total_cost.toFixed(
    2
  )}, impostos de ${total_fee_rate.toFixed(
    1
  )}% e margem desejada de ${target_margin}%, `;

  if (current_price) {
    const difference = suggested_price - current_price;
    const diff_percentage = (difference / current_price) * 100;

    if (Math.abs(diff_percentage) < 5) {
      reasoning += `seu preço atual está ótimo! 👍`;
    } else if (difference > 0) {
      reasoning += `sugiro aumentar em R$ ${difference.toFixed(
        2
      )} (${diff_percentage.toFixed(1)}%) para garantir sua margem.`;
    } else {
      reasoning += `você pode reduzir em R$ ${Math.abs(difference).toFixed(
        2
      )} (${Math.abs(diff_percentage).toFixed(1)}%) e manter lucratividade.`;
    }
  } else {
    reasoning += `este preço garante ${profit_percentage.toFixed(
      1
    )}% de margem líquida real.`;
  }

  return {
    suggested_price: Math.round(suggested_price * 100) / 100,
    current_price,
    cost_price: total_cost,
    profit_margin: Math.round(profit * 100) / 100,
    profit_margin_percentage: Math.round(profit_percentage * 10) / 10,
    reasoning,
    confidence,
    alternatives: {
      competitive_price: Math.round(competitive_price * 100) / 100,
      premium_price: Math.round(premium_price * 100) / 100,
      minimum_price: Math.round(minimum_price * 100) / 100,
    },
  };
}

/**
 * Analisa margem de lucro
 */
export function analyzeMargin(params: {
  product_name: string;
  sale_price: number;
  cost_price: number;
  taxes: number;
  other_costs?: number;
  target_margin?: number;
}): MarginAnalysis {
  const {
    product_name,
    sale_price,
    cost_price,
    taxes,
    other_costs = 0,
    target_margin = 20,
  } = params;

  const total_cost = cost_price + other_costs;
  const net_profit = sale_price - total_cost - taxes;
  const current_margin = (net_profit / sale_price) * 100;

  const is_healthy = current_margin >= target_margin;
  const issues: string[] = [];
  const suggestions: string[] = [];
  const potential_savings: { description: string; amount: number }[] = [];

  // Análise de problemas
  if (current_margin < 5) {
    issues.push('⚠️ Margem crítica - prejuízo iminente');
    suggestions.push('Aumente o preço em pelo menos 10% ou reduza custos');
  } else if (current_margin < 10) {
    issues.push('⚠️ Margem baixa - risco elevado');
    suggestions.push(
      'Considere aumentar o preço ou negociar custos com fornecedores'
    );
  } else if (current_margin < target_margin) {
    issues.push(`Margem abaixo do alvo de ${target_margin}%`);
  }

  if (current_margin > 50) {
    issues.push('Margem muito alta - pode estar perdendo vendas');
    suggestions.push(
      'Considere reduzir o preço para aumentar volume de vendas'
    );
  }

  // Sugestões de economia
  if (other_costs > 0) {
    const potential_cost_reduction = other_costs * 0.2; // 20% de redução
    potential_savings.push({
      description: 'Negociação de custos operacionais',
      amount: potential_cost_reduction,
    });
  }

  if (taxes > sale_price * 0.15) {
    potential_savings.push({
      description: 'Otimização tributária',
      amount: taxes * 0.1, // 10% de economia
    });
  }

  // Sugestões gerais
  if (is_healthy) {
    suggestions.push('✅ Margem saudável! Continue monitorando concorrentes');
  }

  return {
    product_name,
    current_margin: Math.round(current_margin * 10) / 10,
    target_margin,
    is_healthy,
    issues,
    suggestions,
    potential_savings,
  };
}

/**
 * Calcula impacto de promoção
 */
export function calculatePromotionImpact(params: {
  original_price: number;
  discount_percentage: number;
  cost_price: number;
  tax_rate: number;
  expected_volume_increase?: number;
}): {
  new_price: number;
  new_margin: number;
  margin_reduction: number;
  break_even_volume_increase: number;
  is_viable: boolean;
  recommendation: string;
} {
  const {
    original_price,
    discount_percentage,
    cost_price,
    tax_rate,
    expected_volume_increase = 0,
  } = params;

  const new_price = original_price * (1 - discount_percentage / 100);
  const taxes_original = original_price * (tax_rate / 100);
  const taxes_new = new_price * (tax_rate / 100);

  const profit_original = original_price - cost_price - taxes_original;
  const profit_new = new_price - cost_price - taxes_new;

  const margin_original = (profit_original / original_price) * 100;
  const margin_new = (profit_new / new_price) * 100;
  const margin_reduction = margin_original - margin_new;

  // Calcular aumento necessário para compensar
  const break_even_volume_increase = (margin_reduction / margin_new) * 100;

  const is_viable =
    expected_volume_increase >= break_even_volume_increase || margin_new > 10;

  let recommendation = '';
  if (!is_viable) {
    recommendation = `⚠️ Desconto arriscado! Você precisaria aumentar as vendas em ${break_even_volume_increase.toFixed(
      0
    )}% para compensar.`;
  } else if (margin_new < 10) {
    recommendation = `⚠️ Margem ficará baixa (${margin_new.toFixed(
      1
    )}%). Considere desconto menor.`;
  } else {
    recommendation = `✅ Promoção viável! Com aumento de ${expected_volume_increase}% nas vendas, vale a pena.`;
  }

  return {
    new_price: Math.round(new_price * 100) / 100,
    new_margin: Math.round(margin_new * 10) / 10,
    margin_reduction: Math.round(margin_reduction * 10) / 10,
    break_even_volume_increase: Math.round(break_even_volume_increase),
    is_viable,
    recommendation,
  };
}

/**
 * Sugere estratégia de precificação por objetivo
 */
export function suggestPricingStrategy(
  objective: 'volume' | 'profit' | 'competitive'
): string {
  const strategies = {
    volume: `📊 **Estratégia de Volume:**
• Reduza a margem para 10-15%
• Foque em produtos populares
• Use promoções relâmpago
• Invista em anúncios`,

    profit: `💰 **Estratégia de Lucro:**
• Aumente margem para 30-40%
• Destaque diferenciais do produto
• Ofereça bundle/kits
• Foque em qualidade`,

    competitive: `🎯 **Estratégia Competitiva:**
• Monitore concorrentes diariamente
• Margem de 15-20%
• Iguale preço + destaque frete grátis
• Use cashback para atrair`,
  };

  return strategies[objective] || strategies.competitive;
}

/**
 * Análise completa de precificação
 */
export async function analyzePricing(params: {
  costPrice: number;
  desiredMargin?: number;
  taxRegime: string;
  businessType: string;
}): Promise<import('@/shared/types/ai').PricingAnalysis> {
  // Usa a função existente calculatePricingSuggestion
  // Estima tax_rate baseado no regime (simplificado)
  const taxRateMap: Record<string, number> = {
    simples_nacional: 8.0,
    lucro_presumido: 16.0,
    lucro_real: 20.0,
  };
  
  const taxRate = taxRateMap[params.taxRegime] || 8.0;
  
  const suggestion = calculatePricingSuggestion({
    cost_price: params.costPrice,
    target_margin: params.desiredMargin || 30,
    tax_rate: taxRate,
  });
  
  // Converte para o tipo esperado
  return {
    suggestedPrice: suggestion.suggested_price,
    minPrice: suggestion.min_price,
    maxPrice: suggestion.max_price,
    profitMargin: suggestion.profit_margin,
    explanation: suggestion.reasoning,
    confidence: 0.8, // Valor padrão
    factors: {
      cost: params.costPrice,
      taxes: suggestion.tax_amount,
      fees: suggestion.marketplace_fee || 0,
      margin: suggestion.profit_margin,
    },
    recommendations: suggestion.recommendations || [],
    warnings: suggestion.warnings || [],
  };
}

/**
 * Objeto de serviço para compatibilidade com imports existentes
 */
export const pricingService = {
  calculateSuggestion: calculatePricingSuggestion,
  analyzeMargin,
  calculatePromotionImpact,
  suggestStrategy: suggestPricingStrategy,
  analyzePricing,
};