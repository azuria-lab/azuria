import { useMemo } from 'react';
import type {
  ComparisonChartData,
  ComparisonDifferences,
  ComparisonInsight,
  ComparisonSummary,
  PricingScenario,
  ScenarioComparison,
  ScenarioMetrics
} from '@/types/comparison';

/**
 * Hook for comparing two pricing scenarios (before vs after)
 * Calculates metrics, differences, insights, and generates recommendations
 */
export const useComparison = () => {
  /**
   * Calculate all metrics for a single scenario
   */
  const calculateMetrics = useMemo(
    () => (scenario: PricingScenario): ScenarioMetrics => {
      const totalCosts =
        scenario.productCost +
        scenario.shippingCost +
        scenario.marketplaceFee +
        scenario.taxes +
        (scenario.packagingCost || 0) +
        (scenario.marketingCost || 0) +
        (scenario.operationalCost || 0) +
        (scenario.otherCosts || 0);

      const profit = scenario.sellingPrice - totalCosts;
      const profitMargin = scenario.sellingPrice > 0 ? (profit / scenario.sellingPrice) * 100 : 0;

      // Calculate cost percentages
      const productCostPercentage = totalCosts > 0 ? (scenario.productCost / totalCosts) * 100 : 0;
      const shippingCostPercentage = totalCosts > 0 ? (scenario.shippingCost / totalCosts) * 100 : 0;
      const marketplaceFeePercentage = totalCosts > 0 ? (scenario.marketplaceFee / totalCosts) * 100 : 0;
      const taxesPercentage = totalCosts > 0 ? (scenario.taxes / totalCosts) * 100 : 0;

      // Determine profit level
      let profitLevel: 'excellent' | 'good' | 'low' | 'negative';
      if (profit < 0) {
        profitLevel = 'negative';
      } else if (profitMargin >= 25) {
        profitLevel = 'excellent';
      } else if (profitMargin >= 15) {
        profitLevel = 'good';
      } else {
        profitLevel = 'low';
      }

      return {
        totalCosts,
        profit,
        profitMargin,
        profitPerUnit: profit,
        revenue: scenario.sellingPrice,
        productCostPercentage,
        shippingCostPercentage,
        marketplaceFeePercentage,
        taxesPercentage,
        isProfit: profit > 0,
        profitLevel,
      };
    },
    []
  );

  /**
   * Calculate differences between two scenario metrics
   */
  const calculateDifferences = useMemo(
    () => (beforeMetrics: ScenarioMetrics, afterMetrics: ScenarioMetrics, beforeScenario: PricingScenario, afterScenario: PricingScenario): ComparisonDifferences => {
      // Price differences
      const sellingPriceDiff = afterScenario.sellingPrice - beforeScenario.sellingPrice;
      const sellingPriceDiffPercent =
        beforeScenario.sellingPrice > 0 ? (sellingPriceDiff / beforeScenario.sellingPrice) * 100 : 0;

      // Cost differences (absolute)
      const productCostDiff = afterScenario.productCost - beforeScenario.productCost;
      const shippingCostDiff = afterScenario.shippingCost - beforeScenario.shippingCost;
      const marketplaceFeeDiff = afterScenario.marketplaceFee - beforeScenario.marketplaceFee;
      const taxesDiff = afterScenario.taxes - beforeScenario.taxes;

      const totalCostsDiff = afterMetrics.totalCosts - beforeMetrics.totalCosts;
      const totalCostsDiffPercent =
        beforeMetrics.totalCosts > 0 ? (totalCostsDiff / beforeMetrics.totalCosts) * 100 : 0;

      // Cost differences (percentage)
      const productCostDiffPercent =
        beforeScenario.productCost > 0 ? (productCostDiff / beforeScenario.productCost) * 100 : 0;
      const shippingCostDiffPercent =
        beforeScenario.shippingCost > 0 ? (shippingCostDiff / beforeScenario.shippingCost) * 100 : 0;
      const marketplaceFeeDiffPercent =
        beforeScenario.marketplaceFee > 0
          ? (marketplaceFeeDiff / beforeScenario.marketplaceFee) * 100
          : 0;
      const taxesDiffPercent =
        beforeScenario.taxes > 0 ? (taxesDiff / beforeScenario.taxes) * 100 : 0;

      // Profit & margin differences
      const profitDiff = afterMetrics.profit - beforeMetrics.profit;
      const profitDiffPercent = beforeMetrics.profit > 0 ? (profitDiff / beforeMetrics.profit) * 100 : 0;

      const profitMarginDiff = afterMetrics.profitMargin - beforeMetrics.profitMargin;

      // Revenue differences
      const revenueDiff = afterMetrics.revenue - beforeMetrics.revenue;
      const revenueDiffPercent = beforeMetrics.revenue > 0 ? (revenueDiff / beforeMetrics.revenue) * 100 : 0;

      return {
        sellingPriceDiff,
        sellingPriceDiffPercent,
        productCostDiff,
        productCostDiffPercent,
        shippingCostDiff,
        shippingCostDiffPercent,
        marketplaceFeeDiff,
        marketplaceFeeDiffPercent,
        taxesDiff,
        taxesDiffPercent,
        totalCostsDiff,
        totalCostsDiffPercent,
        profitDiff,
        profitDiffPercent,
        profitMarginDiff,
        revenueDiff,
        revenueDiffPercent,
      };
    },
    []
  );

  /**
   * Generate comparison summary with verdict and recommendations
   */
  const generateSummary = useMemo(
    () => (differences: ComparisonDifferences, _beforeMetrics: ScenarioMetrics, _afterMetrics: ScenarioMetrics): ComparisonSummary => {
      const improvements: string[] = [];
      const degradations: string[] = [];

      // Analyze profit
      if (differences.profitDiff > 0) {
        improvements.push(
          `Lucro aumentou R$ ${differences.profitDiff.toFixed(2)} (${differences.profitDiffPercent > 0 ? '+' : ''}${differences.profitDiffPercent.toFixed(1)}%)`
        );
      } else if (differences.profitDiff < 0) {
        degradations.push(
          `Lucro diminuiu R$ ${Math.abs(differences.profitDiff).toFixed(2)} (${differences.profitDiffPercent.toFixed(1)}%)`
        );
      }

      // Analyze profit margin
      if (differences.profitMarginDiff > 2) {
        improvements.push(`Margem de lucro melhorou ${differences.profitMarginDiff.toFixed(1)}pp`);
      } else if (differences.profitMarginDiff < -2) {
        degradations.push(`Margem de lucro reduziu ${Math.abs(differences.profitMarginDiff).toFixed(1)}pp`);
      }

      // Analyze costs
      if (differences.totalCostsDiff < 0) {
        improvements.push(
          `Custos totais reduzidos R$ ${Math.abs(differences.totalCostsDiff).toFixed(2)} (${Math.abs(differences.totalCostsDiffPercent).toFixed(1)}%)`
        );
      } else if (differences.totalCostsDiff > 0) {
        degradations.push(
          `Custos totais aumentaram R$ ${differences.totalCostsDiff.toFixed(2)} (+${differences.totalCostsDiffPercent.toFixed(1)}%)`
        );
      }

      // Analyze revenue
      if (differences.revenueDiff > 0) {
        improvements.push(
          `Receita aumentou R$ ${differences.revenueDiff.toFixed(2)} (+${differences.revenueDiffPercent.toFixed(1)}%)`
        );
      } else if (differences.revenueDiff < 0) {
        degradations.push(
          `Receita diminuiu R$ ${Math.abs(differences.revenueDiff).toFixed(2)} (${differences.revenueDiffPercent.toFixed(1)}%)`
        );
      }

      // Determine verdict
      let verdict: 'better' | 'worse' | 'neutral';
      if (differences.profitDiff > 0 && differences.profitMarginDiff >= 0) {
        verdict = 'better';
      } else if (differences.profitDiff < 0 || differences.profitMarginDiff < -5) {
        verdict = 'worse';
      } else {
        verdict = 'neutral';
      }

      // Generate title
      const title =
        verdict === 'better'
          ? '✅ Cenário Melhorado'
          : verdict === 'worse'
            ? '⚠️ Cenário Pior'
            : 'ℹ️ Cenário Neutro';

      // Generate verdict message
      const verdictMessage =
        verdict === 'better'
          ? 'Este cenário apresenta melhorias significativas na lucratividade.'
          : verdict === 'worse'
            ? 'Este cenário pode prejudicar a lucratividade. Revisar estratégia.'
            : 'As mudanças propostas têm impacto neutro nos resultados.';

      // Generate recommendation
      let recommendation = '';
      let recommendationType: 'adopt' | 'reject' | 'test' | 'review';

      if (verdict === 'better') {
        recommendation = 'Recomendado implementar essas mudanças para melhorar a lucratividade.';
        recommendationType = 'adopt';
      } else if (verdict === 'worse') {
        recommendation = 'Não recomendado. Essas mudanças podem prejudicar os resultados.';
        recommendationType = 'reject';
      } else {
        recommendation = 'Considere testar em pequena escala ou ajustar outros fatores.';
        recommendationType = 'test';
      }

      // Calculate confidence (0-100)
      const profitChange = Math.abs(differences.profitDiffPercent);
      const marginChange = Math.abs(differences.profitMarginDiff);
      let confidence = 50;

      if (profitChange > 20 || marginChange > 10) {
        confidence = 90; // High confidence - significant changes
      } else if (profitChange > 10 || marginChange > 5) {
        confidence = 70; // Moderate confidence
      } else if (profitChange > 5 || marginChange > 2) {
        confidence = 60; // Some confidence
      }

      return {
        title,
        verdict,
        verdictMessage,
        improvements,
        degradations,
        recommendation,
        recommendationType,
        confidence,
      };
    },
    []
  );

  /**
   * Generate automated insights based on comparison
   */
  const generateInsights = useMemo(
    () => (
      differences: ComparisonDifferences,
      beforeMetrics: ScenarioMetrics,
      afterMetrics: ScenarioMetrics
    ): ComparisonInsight[] => {
      const insights: ComparisonInsight[] = [];
      let insightId = 1;

      // Profit insight
      if (Math.abs(differences.profitDiffPercent) > 5) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'profit',
          severity: differences.profitDiff > 0 ? 'positive' : 'negative',
          title:
            differences.profitDiff > 0
              ? '📈 Aumento Significativo no Lucro'
              : '📉 Redução Significativa no Lucro',
          message: `O lucro ${differences.profitDiff > 0 ? 'aumentou' : 'diminuiu'} de R$ ${beforeMetrics.profit.toFixed(2)} para R$ ${afterMetrics.profit.toFixed(2)} (${differences.profitDiffPercent > 0 ? '+' : ''}${differences.profitDiffPercent.toFixed(1)}%). ${differences.profitDiff > 0 ? 'Excelente resultado!' : 'Atenção necessária.'}`,
          icon: differences.profitDiff > 0 ? 'TrendingUp' : 'TrendingDown',
          color: differences.profitDiff > 0 ? 'text-green-600' : 'text-red-600',
          metricBefore: beforeMetrics.profit,
          metricAfter: afterMetrics.profit,
          change: differences.profitDiff,
          changePercent: differences.profitDiffPercent,
        });
      }

      // Margin insight
      if (Math.abs(differences.profitMarginDiff) > 3) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'margin',
          severity: differences.profitMarginDiff > 0 ? 'positive' : 'negative',
          title:
            differences.profitMarginDiff > 0
              ? '🎯 Melhoria na Margem de Lucro'
              : '⚠️ Deterioração da Margem',
          message: `A margem de lucro ${differences.profitMarginDiff > 0 ? 'melhorou' : 'piorou'} ${Math.abs(differences.profitMarginDiff).toFixed(1)}pp, passando de ${beforeMetrics.profitMargin.toFixed(1)}% para ${afterMetrics.profitMargin.toFixed(1)}%. ${differences.profitMarginDiff > 0 ? 'Maior eficiência operacional!' : 'Revisar estrutura de custos.'}`,
          icon: differences.profitMarginDiff > 0 ? 'Target' : 'AlertTriangle',
          color: differences.profitMarginDiff > 0 ? 'text-blue-600' : 'text-orange-600',
          metricBefore: beforeMetrics.profitMargin,
          metricAfter: afterMetrics.profitMargin,
          change: differences.profitMarginDiff,
          changePercent: (differences.profitMarginDiff / beforeMetrics.profitMargin) * 100,
        });
      }

      // Cost insight
      if (Math.abs(differences.totalCostsDiffPercent) > 5) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'cost',
          severity: differences.totalCostsDiff < 0 ? 'positive' : 'negative',
          title:
            differences.totalCostsDiff < 0
              ? '💰 Redução de Custos Alcançada'
              : '📊 Aumento nos Custos Totais',
          message: `Os custos totais ${differences.totalCostsDiff < 0 ? 'reduziram' : 'aumentaram'} R$ ${Math.abs(differences.totalCostsDiff).toFixed(2)} (${differences.totalCostsDiff < 0 ? '' : '+'}${differences.totalCostsDiffPercent.toFixed(1)}%). ${differences.totalCostsDiff < 0 ? 'Otimização bem-sucedida!' : 'Avaliar necessidade de ajustes.'}`,
          icon: differences.totalCostsDiff < 0 ? 'DollarSign' : 'AlertCircle',
          color: differences.totalCostsDiff < 0 ? 'text-green-600' : 'text-yellow-600',
          metricBefore: beforeMetrics.totalCosts,
          metricAfter: afterMetrics.totalCosts,
          change: differences.totalCostsDiff,
          changePercent: differences.totalCostsDiffPercent,
        });
      }

      // Risk insight (profit level changes)
      if (beforeMetrics.profitLevel !== afterMetrics.profitLevel) {
        const profitLevelOrder = { negative: 0, low: 1, good: 2, excellent: 3 };
        const isImprovement =
          profitLevelOrder[afterMetrics.profitLevel] > profitLevelOrder[beforeMetrics.profitLevel];

        insights.push({
          id: `insight-${insightId++}`,
          type: 'risk',
          severity: isImprovement ? 'positive' : 'negative',
          title: isImprovement ? '🛡️ Perfil de Risco Melhorado' : '⚠️ Mudança no Perfil de Risco',
          message: `O nível de lucratividade mudou de "${beforeMetrics.profitLevel}" para "${afterMetrics.profitLevel}". ${isImprovement ? 'Menor risco financeiro!' : 'Atenção ao risco aumentado.'}`,
          icon: isImprovement ? 'Shield' : 'AlertTriangle',
          color: isImprovement ? 'text-green-600' : 'text-red-600',
          metricBefore: profitLevelOrder[beforeMetrics.profitLevel],
          metricAfter: profitLevelOrder[afterMetrics.profitLevel],
          change: profitLevelOrder[afterMetrics.profitLevel] - profitLevelOrder[beforeMetrics.profitLevel],
          changePercent: 0,
        });
      }

      return insights;
    },
    []
  );

  /**
   * Generate chart data for visual comparison
   */
  const generateChartData = useMemo(
    () => (
      beforeMetrics: ScenarioMetrics,
      afterMetrics: ScenarioMetrics,
      differences: ComparisonDifferences
    ): ComparisonChartData => {
      // Bar chart data for key metrics
      const barData = [
        {
          category: 'Lucro',
          before: beforeMetrics.profit,
          after: afterMetrics.profit,
          difference: differences.profitDiff,
        },
        {
          category: 'Margem %',
          before: beforeMetrics.profitMargin,
          after: afterMetrics.profitMargin,
          difference: differences.profitMarginDiff,
        },
        {
          category: 'Receita',
          before: beforeMetrics.revenue,
          after: afterMetrics.revenue,
          difference: differences.revenueDiff,
        },
        {
          category: 'Custos',
          before: beforeMetrics.totalCosts,
          after: afterMetrics.totalCosts,
          difference: differences.totalCostsDiff,
        },
      ];

      // Profit comparison
      const profitComparison = {
        label: 'Lucro',
        before: beforeMetrics.profit,
        after: afterMetrics.profit,
      };

      // Margin comparison
      const marginComparison = {
        before: beforeMetrics.profitMargin,
        after: afterMetrics.profitMargin,
        difference: differences.profitMarginDiff,
      };

      return {
        barData,
        profitComparison,
        marginComparison,
      };
    },
    []
  );

  /**
   * Main comparison function - compares two scenarios
   */
  const compareScenarios = useMemo(
    () => (before: PricingScenario, after: PricingScenario): ScenarioComparison => {
      // Calculate metrics for both scenarios
      const beforeMetrics = calculateMetrics(before);
      const afterMetrics = calculateMetrics(after);

      // Calculate differences
      const differences = calculateDifferences(beforeMetrics, afterMetrics, before, after);

      // Generate summary
      const summary = generateSummary(differences, beforeMetrics, afterMetrics);

      // Generate insights
      const insights = generateInsights(differences, beforeMetrics, afterMetrics);

      // Generate chart data
      const chartData = generateChartData(beforeMetrics, afterMetrics, differences);

      return {
        before,
        after,
        beforeMetrics,
        afterMetrics,
        differences,
        summary,
        insights,
        chartData,
      };
    },
    [calculateMetrics, calculateDifferences, generateSummary, generateInsights, generateChartData]
  );

  /**
   * Apply a preset to a scenario (simplified for now)
   */
  const applyPreset = useMemo(
    () => (baseScenario: PricingScenario, presetId: string): PricingScenario => {
      // Simple presets - adjust price only for now
      const newScenario: PricingScenario = {
        ...baseScenario,
        id: `${baseScenario.id}-${presetId}`,
        name: `${baseScenario.name} - ${presetId}`,
      };

      // Apply predefined adjustments based on preset ID
      if (presetId === 'price-increase-10') {
        newScenario.sellingPrice = baseScenario.sellingPrice * 1.1;
      } else if (presetId === 'price-decrease-10') {
        newScenario.sellingPrice = baseScenario.sellingPrice * 0.9;
      } else if (presetId === 'cost-optimization') {
        newScenario.productCost = baseScenario.productCost * 0.95;
        newScenario.shippingCost = baseScenario.shippingCost * 0.9;
      } else if (presetId === 'marketplace-switch') {
        newScenario.marketplaceFee = baseScenario.marketplaceFee * 0.7;
      } else if (presetId === 'premium-pricing') {
        newScenario.sellingPrice = baseScenario.sellingPrice * 1.2;
        if (baseScenario.packagingCost) {
          newScenario.packagingCost = baseScenario.packagingCost * 1.5;
        }
      } else if (presetId === 'bulk-discount') {
        newScenario.sellingPrice = baseScenario.sellingPrice * 0.95;
        newScenario.productCost = baseScenario.productCost * 0.85;
      }

      return newScenario;
    },
    []
  );

  return {
    calculateMetrics,
    compareScenarios,
    applyPreset,
    calculateDifferences,
    generateSummary,
    generateInsights,
    generateChartData,
  };
};
