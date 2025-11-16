/**
 * Hook: useScenarioSimulator
 * Business logic for scenario simulation and comparison
 */

import { MARKETPLACE_TEMPLATES } from '@/shared/types/marketplaceTemplates';
import type {
  ScenarioComparison,
  ScenarioInput,
  ScenarioResult,
} from '@/types/scenarioSimulator';

export function useScenarioSimulator() {
  /**
   * Calculate results for a single scenario
   */
  const calculateScenario = (input: ScenarioInput): ScenarioResult => {
    // Get marketplace template
    const template = MARKETPLACE_TEMPLATES.find(t => t.id === input.marketplace);
    if (!template) {
      // Fallback to first template if marketplace is undefined or not found
      const fallbackTemplate = MARKETPLACE_TEMPLATES[0];
      return calculateScenarioWithTemplate(input, fallbackTemplate);
    }
    
    return calculateScenarioWithTemplate(input, template);
  };

  const calculateScenarioWithTemplate = (input: ScenarioInput, template: typeof MARKETPLACE_TEMPLATES[0]): ScenarioResult => {

    // Calculate marketplace fee
    const marketplaceFee = template.defaultValues.commission;
    
    // Calculate payment fee (if applicable)
    let paymentFee = 0;
    if (input.includePaymentFee) {
      paymentFee = template.defaultValues.paymentFee || 0;
    }

    // Total operational costs per unit
    const operationalCosts = 
      input.shipping + 
      input.packaging + 
      input.marketing + 
      input.otherCosts;

    // Calculate final price based on desired margin
    // Formula: Price = (Cost + OpCosts) / (1 - Margin% - MarketplaceFee% - PaymentFee%)
    const costBase = input.cost + operationalCosts;
    const totalFeePercentage = (marketplaceFee + paymentFee) / 100;
    const marginDecimal = input.targetMargin / 100;
    
    const finalPrice = costBase / (1 - marginDecimal - totalFeePercentage);

    // Calculate actual fees in currency
    const marketplaceFeeAmount = (finalPrice * marketplaceFee) / 100;
    const paymentFeeAmount = (finalPrice * paymentFee) / 100;
    const totalFeesAmount = marketplaceFeeAmount + paymentFeeAmount;

    // Calculate net profit per unit
    const netProfit = finalPrice - input.cost - operationalCosts - totalFeesAmount;

    // Calculate effective margin (actual margin after all costs)
    const effectiveMargin = (netProfit / finalPrice) * 100;

    // Monthly projections (if volume provided)
    let monthlyRevenue: number | undefined;
    let monthlyProfit: number | undefined;
    let monthlyFees: number | undefined;
    let roi: number | undefined;
    let breakEvenUnits: number | undefined;

    if (input.monthlyVolume && input.monthlyVolume > 0) {
      monthlyRevenue = finalPrice * input.monthlyVolume;
      monthlyProfit = netProfit * input.monthlyVolume;
      monthlyFees = totalFeesAmount * input.monthlyVolume;
      
      // ROI = (Profit / Investment) * 100
      const totalInvestment = (input.cost + operationalCosts) * input.monthlyVolume;
      roi = (monthlyProfit / totalInvestment) * 100;
      
      // Break-even: units needed to cover fixed costs (simplified)
      const fixedCosts = input.marketing + input.otherCosts;
      if (fixedCosts > 0) {
        breakEvenUnits = Math.ceil(fixedCosts / netProfit);
      }
    }

    return {
      id: input.id,
      name: input.name,
      color: input.color,
      finalPrice,
      effectiveMargin,
      netProfit,
      totalFees: totalFeesAmount,
      unitCost: input.cost,
      unitFees: totalFeesAmount,
      unitProfit: netProfit,
      monthlyRevenue,
      monthlyProfit,
      monthlyFees,
      roi,
      breakEvenUnits,
    };
  };

  /**
   * Compare multiple scenarios
   */
  const compareScenarios = (scenarios: ScenarioInput[]): ScenarioComparison => {
    // Calculate all scenarios
    const results = scenarios.map(scenario => calculateScenario(scenario));

    // Find best and worst by net profit
    const sortedByProfit = [...results].sort((a, b) => b.netProfit - a.netProfit);
    const bestScenario = sortedByProfit[0];
    const worstScenario = sortedByProfit.at(-1) ?? sortedByProfit[0];

    // Price analysis
    const prices = results.map(r => r.finalPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Profit analysis
    const profits = results.map(r => r.netProfit);
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    const profitRange = maxProfit - minProfit;

    // Generate insights
    const insights: string[] = [];

    // Price spread insight
    const priceSpreadPercent = ((priceRange / minPrice) * 100).toFixed(1);
    if (priceRange > 0) {
      insights.push(
        `💰 Variação de preço: R$ ${priceRange.toFixed(2)} (${priceSpreadPercent}% de diferença entre cenários)`
      );
    }

    // Profit spread insight
    const profitSpreadPercent = minProfit > 0 
      ? ((profitRange / minProfit) * 100).toFixed(1)
      : '∞';
    if (profitRange > 0) {
      insights.push(
        `📈 Variação de lucro: R$ ${profitRange.toFixed(2)} por unidade (${profitSpreadPercent}% de diferença)`
      );
    }

    // Best scenario insight
    if (bestScenario.monthlyProfit) {
      insights.push(
        `🏆 Melhor cenário: "${bestScenario.name}" pode gerar R$ ${bestScenario.monthlyProfit.toFixed(2)} de lucro mensal`
      );
    } else {
      insights.push(
        `🏆 Melhor cenário: "${bestScenario.name}" oferece R$ ${bestScenario.netProfit.toFixed(2)} de lucro por unidade`
      );
    }

    // Margin comparison
    const margins = results.map(r => r.effectiveMargin);
    const avgMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;
    insights.push(
      `📊 Margem média efetiva: ${avgMargin.toFixed(2)}% entre todos os cenários`
    );

    // ROI insight (if available)
    const roisAvailable = results.filter(r => r.roi !== undefined);
    if (roisAvailable.length > 0) {
      const bestROI = Math.max(...roisAvailable.map(r => r.roi ?? 0));
      const scenarioWithBestROI = results.find(r => r.roi === bestROI);
      if (scenarioWithBestROI) {
        insights.push(
          `💡 Maior ROI: "${scenarioWithBestROI.name}" com ${bestROI.toFixed(2)}% de retorno`
        );
      }
    }

    return {
      scenarios: results,
      bestScenario,
      worstScenario,
      priceDifference: {
        min: minPrice,
        max: maxPrice,
        range: priceRange,
      },
      profitDifference: {
        min: minProfit,
        max: maxProfit,
        range: profitRange,
      },
      insights,
    };
  };

  return {
    calculateScenario,
    compareScenarios,
  };
}
