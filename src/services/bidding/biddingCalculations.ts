/**
 * Bidding Calculations Service
 * 
 * Serviço responsável por todos os cálculos relacionados a licitações
 * incluindo custos, impostos, margens, viabilidade e simulações
 */

import {
  BiddingCalculationResult,
  BiddingGuarantee,
  BiddingItem,
  BiddingScenario,
  BiddingStrategy,
  BiddingTaxConfig,
  BiddingTaxRegime,
  GuaranteeType,
  ViabilityLevel,
} from '@/types/bidding';

// ============================================
// CÁLCULO DE CUSTOS
// ============================================

/**
 * Calcula o custo total de um item
 */
export function calculateItemTotalCost(item: BiddingItem): number {
  const {
    unitCost = 0,
    manufacturingCost = 0,
    acquisitionCost = 0,
    logisticsCost = 0,
    transportCost = 0,
    storageCost = 0,
    installationCost = 0,
    administrativeCost = 0,
    laborCost = 0,
    otherCosts = 0,
    quantity = 1,
  } = item;

  const unitTotal =
    unitCost +
    manufacturingCost +
    acquisitionCost +
    logisticsCost +
    transportCost +
    storageCost +
    installationCost +
    administrativeCost +
    laborCost +
    otherCosts;

  return unitTotal * quantity;
}

/**
 * Calcula o custo total de todos os itens
 */
export function calculateTotalCost(items: BiddingItem[]): number {
  return items.reduce((total, item) => total + calculateItemTotalCost(item), 0);
}

// ============================================
// CÁLCULO DE IMPOSTOS
// ============================================

/**
 * Calcula os impostos baseado no regime tributário
 */
export function calculateTaxes(
  baseValue: number,
  taxConfig: BiddingTaxConfig
): { totalTaxes: number; breakdown: Record<string, number> } {
  const { regime, pis, cofins, irpj, csll, icms, iss, simplesRate, socialCharges, laborCharges } =
    taxConfig;

  const breakdown: Record<string, number> = {};
  let totalTaxes = 0;

  switch (regime) {
    case BiddingTaxRegime.SIMPLES_NACIONAL: {
      // No Simples Nacional, usa-se apenas a alíquota única
      const simplesValue = (baseValue * (simplesRate || 0)) / 100;
      breakdown['Simples Nacional'] = simplesValue;
      totalTaxes = simplesValue;
      break;
    }

    case BiddingTaxRegime.LUCRO_PRESUMIDO:
    case BiddingTaxRegime.LUCRO_REAL: {
      // Cálculo individual de cada imposto
      breakdown['PIS'] = baseValue * (pis / 100);
      breakdown['COFINS'] = baseValue * (cofins / 100);
      breakdown['IRPJ'] = baseValue * (irpj / 100);
      breakdown['CSLL'] = baseValue * (csll / 100);
      breakdown['ICMS'] = baseValue * (icms / 100);
      
      if (iss && iss > 0) {
        breakdown['ISS'] = baseValue * (iss / 100);
      }

      totalTaxes = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
      break;
    }

    case BiddingTaxRegime.MEI:
      // MEI tem valores fixos mensais, não sobre o produto
      // Pode ser desconsiderado ou incluído como custo fixo
      break;
  }

  // Adiciona encargos se houver
  if (socialCharges && socialCharges > 0) {
    breakdown['Encargos Sociais'] = baseValue * (socialCharges / 100);
    totalTaxes += breakdown['Encargos Sociais'];
  }

  if (laborCharges && laborCharges > 0) {
    breakdown['Encargos Trabalhistas'] = baseValue * (laborCharges / 100);
    totalTaxes += breakdown['Encargos Trabalhistas'];
  }

  return { totalTaxes, breakdown };
}

/**
 * Calcula o valor com impostos incluídos
 */
export function calculateWithTaxes(baseValue: number, taxConfig: BiddingTaxConfig): number {
  const { totalTaxes } = calculateTaxes(baseValue, taxConfig);
  return baseValue + totalTaxes;
}

// ============================================
// CÁLCULO DE GARANTIAS
// ============================================

/**
 * Calcula o valor da garantia
 */
export function calculateGuaranteeValue(
  totalValue: number,
  guarantee?: BiddingGuarantee
): number {
  if (!guarantee || guarantee.type === GuaranteeType.NENHUMA) {
    return 0;
  }

  return totalValue * (guarantee.percentage / 100);
}

// ============================================
// CÁLCULO DE PREÇOS E MARGENS
// ============================================

/**
 * Calcula o preço final baseado no custo e margem
 */
export function calculateFinalPrice(
  totalCost: number,
  margin: number,
  taxConfig: BiddingTaxConfig,
  guarantee?: BiddingGuarantee
): {
  price: number;
  profit: number;
  profitMargin: number;
  grossMargin: number;
} {
  // Custo + Margem desejada
  const desiredProfit = totalCost * (margin / 100);
  const priceBeforeTaxes = totalCost + desiredProfit;

  // Calcula impostos sobre o preço
  const { totalTaxes } = calculateTaxes(priceBeforeTaxes, taxConfig);

  // Calcula garantia
  const guaranteeValue = calculateGuaranteeValue(priceBeforeTaxes, guarantee);

  // Preço final = Custo + Lucro Desejado + Impostos + Garantia
  const finalPrice = priceBeforeTaxes + totalTaxes + guaranteeValue;

  // Lucro líquido = Preço Final - Custo Total - Impostos - Garantia
  const netProfit = finalPrice - totalCost - totalTaxes - guaranteeValue;

  // Margem líquida = (Lucro Líquido / Preço Final) * 100
  const profitMargin = (netProfit / finalPrice) * 100;

  // Margem bruta = (Preço - Custo) / Preço * 100
  const grossMargin = ((finalPrice - totalCost) / finalPrice) * 100;

  return {
    price: finalPrice,
    profit: netProfit,
    profitMargin,
    grossMargin,
  };
}

/**
 * Calcula o preço mínimo viável (com margem mínima)
 */
export function calculateMinimumPrice(
  totalCost: number,
  minimumMargin: number,
  taxConfig: BiddingTaxConfig,
  guarantee?: BiddingGuarantee
): number {
  const { price } = calculateFinalPrice(totalCost, minimumMargin, taxConfig, guarantee);
  return price;
}

/**
 * Calcula o preço de equilíbrio (breakeven)
 */
export function calculateBreakEvenPrice(
  totalCost: number,
  taxConfig: BiddingTaxConfig,
  guarantee?: BiddingGuarantee
): number {
  // Breakeven = Custo + Impostos + Garantia (margem = 0)
  const { price } = calculateFinalPrice(totalCost, 0, taxConfig, guarantee);
  return price;
}

// ============================================
// ANÁLISE DE VIABILIDADE
// ============================================

/**
 * Determina o nível de viabilidade baseado na margem
 */
export function determineViability(margin: number): ViabilityLevel {
  if (margin < 0 || margin < 2) {
    return ViabilityLevel.INVIAVEL;
  } else if (margin >= 2 && margin < 5) {
    return ViabilityLevel.CRITICO;
  } else if (margin >= 5 && margin < 10) {
    return ViabilityLevel.MODERADO;
  } else if (margin >= 10 && margin < 20) {
    return ViabilityLevel.BOM;
  } else {
    return ViabilityLevel.EXCELENTE;
  }
}

/**
 * Analisa a viabilidade de um preço baseado no custo e impostos
 * @param price - Preço final
 * @param cost - Custo total
 * @param taxes - Valor total dos impostos
 * @returns Objeto com nível de viabilidade e margem calculada
 */
export function analyzeViability(
  price: number,
  cost: number,
  taxes: number
): { level: ViabilityLevel; margin: number } {
  const netProfit = price - cost - taxes;
  const margin = (netProfit / price) * 100;
  const level = determineViability(margin);
  
  return { level, margin };
}

/**
 * Calcula o preço sugerido baseado no custo, margem desejada e taxa de imposto
 * @param totalCost - Custo total
 * @param targetMargin - Margem líquida desejada (%)
 * @param taxRate - Taxa de imposto (%)
 * @returns Preço sugerido
 */
export function calculateSuggestedPrice(
  totalCost: number,
  targetMargin: number,
  taxRate: number
): number {
  // Validação: margem + imposto não pode ser >= 100%
  if (targetMargin + taxRate >= 100) {
    return 0;
  }

  // Fórmula: Preço = Custo / (1 - MargeLiq% - Imposto%)
  // Isso garante que após descontar impostos, a margem líquida seja exatamente a desejada
  const divisor = 1 - targetMargin / 100 - taxRate / 100;
  
  if (divisor <= 0) {
    return 0;
  }

  return totalCost / divisor;
}

/**
 * Calcula score de viabilidade (0-100)
 */
export function calculateViabilityScore(
  margin: number,
  totalCost: number,
  finalPrice: number
): number {
  let score = 0;

  // 40 pontos pela margem
  if (margin >= 20) {
    score += 40;
  } else if (margin >= 10) {
    score += 30;
  } else if (margin >= 5) {
    score += 20;
  } else if (margin >= 2) {
    score += 10;
  }

  // 30 pontos pela proporção custo/preço
  const costRatio = totalCost / finalPrice;
  if (costRatio < 0.6) {
    score += 30;
  } else if (costRatio < 0.7) {
    score += 25;
  } else if (costRatio < 0.8) {
    score += 20;
  } else if (costRatio < 0.9) {
    score += 10;
  }

  // 30 pontos pela margem absoluta
  if (margin >= 15) {
    score += 30;
  } else if (margin >= 8) {
    score += 20;
  } else if (margin >= 3) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Gera avisos baseado na análise
 */
export function generateWarnings(
  margin: number,
  profit: number,
  totalCost: number,
  viability: ViabilityLevel
): string[] {
  const warnings: string[] = [];

  if (viability === ViabilityLevel.INVIAVEL) {
    warnings.push(
      '⛔ INVIÁVEL: Margem abaixo do mínimo aceitável (< 2%)',
      'Risco extremamente alto de prejuízo'
    );
  }

  if (viability === ViabilityLevel.CRITICO) {
    warnings.push(
      '⚠️ CRÍTICO: Margem muito baixa (2-5%)',
      'Qualquer variação nos custos pode resultar em prejuízo'
    );
  }

  if (profit < 0) {
    warnings.push('❌ Lance resultará em PREJUÍZO');
  }

  if (margin < 5) {
    warnings.push('Margem insuficiente para cobrir imprevistos');
  }

  if (totalCost > 100000 && margin < 10) {
    warnings.push('Valor alto com margem baixa - risco financeiro significativo');
  }

  return warnings;
}

/**
 * Gera sugestões de melhoria
 */
export function generateSuggestions(
  margin: number,
  viability: ViabilityLevel,
  totalCost: number
): string[] {
  const suggestions: string[] = [];

  if (viability === ViabilityLevel.INVIAVEL || viability === ViabilityLevel.CRITICO) {
    suggestions.push(
      '💡 Considere aumentar a margem para pelo menos 8-10%',
      'Revise todos os custos para identificar possíveis reduções',
      'Avalie se há custos desnecessários ou superestimados'
    );
  }

  if (margin < 10) {
    suggestions.push(
      'Analise a possibilidade de otimizar custos logísticos',
      'Negocie melhores condições com fornecedores'
    );
  }

  if (viability === ViabilityLevel.MODERADO) {
    suggestions.push(
      '✅ Margem aceitável, mas pode ser otimizada',
      'Considere criar cenários alternativos com margens diferentes'
    );
  }

  if (viability === ViabilityLevel.BOM || viability === ViabilityLevel.EXCELENTE) {
    suggestions.push(
      '✅ Lance competitivo com margem saudável',
      'Você tem espaço para dar descontos se necessário'
    );
  }

  if (totalCost > 50000) {
    suggestions.push('⚡ Licitação de alto valor - considere análise detalhada de riscos');
  }

  return suggestions;
}

/**
 * Identifica riscos potenciais
 */
export function identifyRisks(
  margin: number,
  totalCost: number,
  profit: number,
  viability: ViabilityLevel
): string[] {
  const risks: string[] = [];

  if (margin < 3) {
    risks.push('🔴 ALTO: Margem insuficiente para absorver imprevistos');
  }

  if (profit < 1000 && totalCost > 20000) {
    risks.push('🟡 MÉDIO: Lucro muito baixo em relação ao valor da licitação');
  }

  if (totalCost > 100000) {
    risks.push('🟡 MÉDIO: Licitação de alto valor - requer análise financeira cuidadosa');
  }

  if (viability === ViabilityLevel.INVIAVEL) {
    risks.push('🔴 ALTO: Proposta inviável - não participar é recomendado');
  }

  if (margin >= 5 && margin < 8) {
    risks.push('🟢 BAIXO: Margem controlada, mas monitorar variações de custos');
  }

  return risks;
}

// ============================================
// CÁLCULO COMPLETO
// ============================================

/**
 * Executa todos os cálculos e retorna o resultado completo
 */
export function calculateBidding(
  items: BiddingItem[],
  taxConfig: BiddingTaxConfig,
  strategy: BiddingStrategy,
  guarantee?: BiddingGuarantee
): BiddingCalculationResult {
  // 1. Calcula custo total
  const totalCost = calculateTotalCost(items);

  // 2. Calcula preço com margem desejada
  const { price, profit, profitMargin, grossMargin } = calculateFinalPrice(
    totalCost,
    strategy.desiredMargin,
    taxConfig,
    guarantee
  );

  // 3. Calcula impostos
  const { totalTaxes } = calculateTaxes(price, taxConfig);

  // 4. Calcula garantia
  const totalGuarantee = calculateGuaranteeValue(price, guarantee);

  // 5. Calcula preço mínimo e breakeven
  const minimumPrice = calculateMinimumPrice(
    totalCost,
    strategy.minimumMargin,
    taxConfig,
    guarantee
  );

  const breakEvenPrice = calculateBreakEvenPrice(totalCost, taxConfig, guarantee);

  // 6. Analisa viabilidade
  const viability = determineViability(profitMargin);
  const viabilityScore = calculateViabilityScore(profitMargin, totalCost, price);

  // 7. Gera insights
  const warnings = generateWarnings(profitMargin, profit, totalCost, viability);
  const suggestions = generateSuggestions(profitMargin, viability, totalCost);
  const risks = identifyRisks(profitMargin, totalCost, profit, viability);

  return {
    totalCost,
    totalTaxes,
    totalGuarantee,
    costWithTaxes: totalCost + totalTaxes,
    suggestedPrice: price,
    minimumPrice,
    breakEvenPrice,
    netProfit: profit,
    profitMargin,
    grossMargin,
    viability,
    viabilityScore,
    warnings,
    suggestions,
    risks,
  };
}

// ============================================
// SIMULAÇÕES E CENÁRIOS
// ============================================

/**
 * Simula um desconto sobre o preço calculado
 */
export function simulateDiscount(
  basePrice: number,
  discountPercentage: number,
  totalCost: number,
  taxConfig: BiddingTaxConfig
): BiddingScenario {
  const discountedPrice = basePrice * (1 - discountPercentage / 100);
  
  // Recalcula impostos sobre o novo preço
  const { totalTaxes } = calculateTaxes(discountedPrice, taxConfig);
  
  // Lucro = Preço com desconto - Custo - Impostos
  const profit = discountedPrice - totalCost - totalTaxes;
  
  // Margem = (Lucro / Preço) * 100
  const margin = (profit / discountedPrice) * 100;
  
  const viability = determineViability(margin);

  return {
    id: `discount-${discountPercentage}`,
    name: `Desconto ${discountPercentage}%`,
    margin,
    discount: discountPercentage,
    price: discountedPrice,
    profit,
    viability,
  };
}

/**
 * Gera múltiplos cenários com diferentes margens
 */
export function generateScenarios(
  totalCost: number,
  margins: number[],
  taxConfig: BiddingTaxConfig,
  guarantee?: BiddingGuarantee
): BiddingScenario[] {
  return margins.map((margin) => {
    const { price, profit, profitMargin } = calculateFinalPrice(
      totalCost,
      margin,
      taxConfig,
      guarantee
    );

    const viability = determineViability(profitMargin);

    return {
      id: `margin-${margin}`,
      name: `Margem ${margin}%`,
      margin: profitMargin,
      discount: 0,
      price,
      profit,
      viability,
    };
  });
}

/**
 * Calcula o desconto máximo possível mantendo margem mínima
 */
export function calculateMaxDiscount(
  currentPrice: number,
  totalCost: number,
  minimumMargin: number,
  taxConfig: BiddingTaxConfig
): number {
  const minimumPrice = calculateMinimumPrice(totalCost, minimumMargin, taxConfig);
  const maxDiscount = ((currentPrice - minimumPrice) / currentPrice) * 100;
  return Math.max(0, maxDiscount);
}

// ============================================
// FORMATAÇÃO E UTILIDADES
// ============================================

/**
 * Formata valor em Real brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Obtém cor baseada na viabilidade
 */
export function getViabilityColor(viability: ViabilityLevel): string {
  const colors = {
    [ViabilityLevel.INVIAVEL]: 'red',
    [ViabilityLevel.CRITICO]: 'orange',
    [ViabilityLevel.MODERADO]: 'yellow',
    [ViabilityLevel.BOM]: 'green',
    [ViabilityLevel.EXCELENTE]: 'emerald',
  };
  return colors[viability] || 'gray';
}

/**
 * Obtém label amigável da viabilidade
 */
export function getViabilityLabel(viability: ViabilityLevel): string {
  const labels = {
    [ViabilityLevel.INVIAVEL]: 'Inviável',
    [ViabilityLevel.CRITICO]: 'Crítico',
    [ViabilityLevel.MODERADO]: 'Moderado',
    [ViabilityLevel.BOM]: 'Bom',
    [ViabilityLevel.EXCELENTE]: 'Excelente',
  };
  return labels[viability] || 'Desconhecido';
}
