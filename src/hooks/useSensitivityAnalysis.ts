/**
 * Hook: useSensitivityAnalysis
 * Calculates how changes in variables affect profitability
 * "E se o custo aumentar 10%?"
 */

import { type BreakEvenPoint, type ScenarioPoint, type SensitivityAnalysisInput, type SensitivityAnalysisResult, VARIABLE_METADATA, type VariableImpact } from '@/types/sensitivityAnalysis';

export function useSensitivityAnalysis() {
  /**
   * Calculate price for given inputs
   */
  const calculatePrice = (
    cost: number,
    operationalCosts: number,
    margin: number,
    totalFeePercentage: number
  ): number => {
    const costBase = cost + operationalCosts;
    const marginDecimal = margin / 100;
    return costBase / (1 - marginDecimal - totalFeePercentage);
  };

  /**
   * Analyze sensitivity for all variables
   */
  const analyzeSensitivity = (input: SensitivityAnalysisInput): SensitivityAnalysisResult => {
    const totalFeePercentage = (input.marketplaceFee + input.paymentFee) / 100;
    const operationalCosts = input.shipping + input.packaging + input.marketing + input.otherCosts;
    
    const variables: VariableImpact[] = [];

    // 1. COST SENSITIVITY
    const costScenarios: ScenarioPoint[] = [];
    for (let change = -50; change <= 50; change += 10) {
      const newCost = input.cost * (1 + change / 100);
      const newPrice = calculatePrice(newCost, operationalCosts, input.targetMargin, totalFeePercentage);
      const fees = newPrice * totalFeePercentage * 100;
      const profit = newPrice - newCost - operationalCosts - fees;
      const profitChange = ((profit - input.currentProfit) / input.currentProfit) * 100;
      const priceImpact = newPrice - input.finalPrice;

      costScenarios.push({
        change,
        value: newCost,
        profit,
        profitChange,
        priceImpact,
      });
    }

    const costElasticity = Math.abs(
      (costScenarios[costScenarios.length - 1].profitChange - costScenarios[0].profitChange) / 100
    );

    variables.push({
      variable: 'cost',
      label: VARIABLE_METADATA.cost.label,
      icon: VARIABLE_METADATA.cost.icon,
      baseValue: input.cost,
      unit: 'currency',
      scenarios: costScenarios,
      elasticity: costElasticity,
      risk: costElasticity > 2 ? 'high' : costElasticity > 1 ? 'medium' : 'low',
      riskExplanation: `Cada 10% de aumento no custo reduz o lucro em ~${(costElasticity * 10).toFixed(1)}%`,
    });

    // 2. MARGIN SENSITIVITY
    const marginScenarios: ScenarioPoint[] = [];
    for (let change = -50; change <= 50; change += 10) {
      const newMargin = input.targetMargin * (1 + change / 100);
      if (newMargin < 5 || newMargin > 80) {
        continue; // Skip unrealistic margins
      }
      
      const newPrice = calculatePrice(input.cost, operationalCosts, newMargin, totalFeePercentage);
      const fees = newPrice * totalFeePercentage * 100;
      const profit = newPrice - input.cost - operationalCosts - fees;
      const profitChange = ((profit - input.currentProfit) / input.currentProfit) * 100;
      const priceImpact = newPrice - input.finalPrice;

      marginScenarios.push({
        change,
        value: newMargin,
        profit,
        profitChange,
        priceImpact,
      });
    }

    const marginElasticity = marginScenarios.length > 1
      ? Math.abs(
          (marginScenarios[marginScenarios.length - 1].profitChange - marginScenarios[0].profitChange) /
            (marginScenarios[marginScenarios.length - 1].change - marginScenarios[0].change)
        )
      : 1;

    variables.push({
      variable: 'margin',
      label: VARIABLE_METADATA.margin.label,
      icon: VARIABLE_METADATA.margin.icon,
      baseValue: input.targetMargin,
      unit: 'percentage',
      scenarios: marginScenarios,
      elasticity: marginElasticity,
      risk: 'low', // Margin is under your control
      riskExplanation: 'Margem está sob seu controle direto - ajuste conforme necessário',
    });

    // 3. VOLUME SENSITIVITY (if provided)
    if (input.monthlyVolume && input.monthlyVolume > 0) {
      const volumeScenarios: ScenarioPoint[] = [];
      for (let change = -50; change <= 50; change += 10) {
        const newVolume = input.monthlyVolume * (1 + change / 100);
        const monthlyProfit = input.currentProfit * newVolume;
        const baseMonthlyProfit = input.currentProfit * input.monthlyVolume;
        const profitChange = ((monthlyProfit - baseMonthlyProfit) / baseMonthlyProfit) * 100;

        volumeScenarios.push({
          change,
          value: newVolume,
          profit: monthlyProfit,
          profitChange,
          priceImpact: 0, // Volume doesn't affect price
        });
      }

      variables.push({
        variable: 'volume',
        label: VARIABLE_METADATA.volume.label,
        icon: VARIABLE_METADATA.volume.icon,
        baseValue: input.monthlyVolume,
        unit: 'units',
        scenarios: volumeScenarios,
        elasticity: 1, // Linear relationship
        risk: 'medium',
        riskExplanation: 'Volume depende de fatores de mercado e marketing',
      });
    }

    // 4. SHIPPING SENSITIVITY
    const shippingScenarios: ScenarioPoint[] = [];
    for (let change = -50; change <= 50; change += 10) {
      const newShipping = input.shipping * (1 + change / 100);
      const newOperationalCosts = newShipping + input.packaging + input.marketing + input.otherCosts;
      const newPrice = calculatePrice(input.cost, newOperationalCosts, input.targetMargin, totalFeePercentage);
      const fees = newPrice * totalFeePercentage * 100;
      const profit = newPrice - input.cost - newOperationalCosts - fees;
      const profitChange = ((profit - input.currentProfit) / input.currentProfit) * 100;
      const priceImpact = newPrice - input.finalPrice;

      shippingScenarios.push({
        change,
        value: newShipping,
        profit,
        profitChange,
        priceImpact,
      });
    }

    const shippingElasticity = Math.abs(
      (shippingScenarios[shippingScenarios.length - 1].profitChange - shippingScenarios[0].profitChange) / 100
    );

    variables.push({
      variable: 'shipping',
      label: VARIABLE_METADATA.shipping.label,
      icon: VARIABLE_METADATA.shipping.icon,
      baseValue: input.shipping,
      unit: 'currency',
      scenarios: shippingScenarios,
      elasticity: shippingElasticity,
      risk: shippingElasticity > 1.5 ? 'high' : shippingElasticity > 0.8 ? 'medium' : 'low',
      riskExplanation: `Cada 10% de aumento no frete reduz o lucro em ~${(shippingElasticity * 10).toFixed(1)}%`,
    });

    // 5. MARKETING SENSITIVITY
    const marketingScenarios: ScenarioPoint[] = [];
    for (let change = -50; change <= 50; change += 10) {
      const newMarketing = input.marketing * (1 + change / 100);
      const newOperationalCosts = input.shipping + input.packaging + newMarketing + input.otherCosts;
      const newPrice = calculatePrice(input.cost, newOperationalCosts, input.targetMargin, totalFeePercentage);
      const fees = newPrice * totalFeePercentage * 100;
      const profit = newPrice - input.cost - newOperationalCosts - fees;
      const profitChange = ((profit - input.currentProfit) / input.currentProfit) * 100;
      const priceImpact = newPrice - input.finalPrice;

      marketingScenarios.push({
        change,
        value: newMarketing,
        profit,
        profitChange,
        priceImpact,
      });
    }

    const marketingElasticity = Math.abs(
      (marketingScenarios[marketingScenarios.length - 1].profitChange - marketingScenarios[0].profitChange) / 100
    );

    variables.push({
      variable: 'marketing',
      label: VARIABLE_METADATA.marketing.label,
      icon: VARIABLE_METADATA.marketing.icon,
      baseValue: input.marketing,
      unit: 'currency',
      scenarios: marketingScenarios,
      elasticity: marketingElasticity,
      risk: 'medium',
      riskExplanation: 'Investimento em marketing pode aumentar volume de vendas',
    });

    // Find most and least sensitive variables
    const sortedByElasticity = [...variables].sort((a, b) => b.elasticity - a.elasticity);
    const mostSensitive = sortedByElasticity[0];
    const leastSensitive = sortedByElasticity[sortedByElasticity.length - 1];

    // Calculate break-even points
    const breakEvenPoints: BreakEvenPoint[] = [];
    
    for (const variable of variables) {
      if (variable.variable === 'volume') {
        continue; // Volume doesn't have break-even in same way
      }
      
      // Find the point where profit becomes 0
      let maxIncrease = 100;
      const maxDecrease = -100;
      let criticalValue = variable.baseValue;

      for (const scenario of variable.scenarios) {
        if (scenario.profit <= 0 && scenario.change > 0 && scenario.change < maxIncrease) {
          maxIncrease = scenario.change;
          criticalValue = scenario.value;
        }
      }

      breakEvenPoints.push({
        variable: variable.variable,
        maxIncrease,
        maxDecrease,
        criticalValue,
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (mostSensitive.risk === 'high') {
      recommendations.push(
        `⚠️ Seu lucro é altamente sensível a mudanças em ${mostSensitive.label}. Priorize negociações e alternativas.`
      );
    }

    const costVar = variables.find(v => v.variable === 'cost');
    if (costVar && costVar.elasticity > 1.5) {
      recommendations.push(
        '💡 Considere buscar fornecedores alternativos ou aumentar volume para reduzir custo unitário.'
      );
    }

    const shippingVar = variables.find(v => v.variable === 'shipping');
    if (shippingVar && shippingVar.elasticity > 1) {
      recommendations.push(
        '🚚 Frete tem impacto significativo. Avalie frete grátis acima de certo valor ou parcerias logísticas.'
      );
    }

    if (leastSensitive.variable === 'marketing') {
      recommendations.push(
        '📣 Marketing tem baixo impacto no custo. Considere aumentar investimento para ganhar volume.'
      );
    }

    recommendations.push(
      `🎯 Foco principal: monitorar ${mostSensitive.label} de perto, pois tem maior impacto no lucro.`
    );

    return {
      variables,
      mostSensitive,
      leastSensitive,
      recommendations,
      breakEvenPoints,
    };
  };

  return {
    analyzeSensitivity,
  };
}
