/**
 * Feature #5: Break-Even & ROI Calculator Hook
 * Calculates break-even points, ROI, and payback periods
 */

import { useCallback, useState } from 'react';
import {
  BREAK_EVEN_SCENARIOS,
  type BreakEvenAlert,
  type BreakEvenChartData,
  type BreakEvenInput,
  type BreakEvenResult,
  type MonthlyProjection,
  type ROIScenario,
} from '@/types/breakEvenROI';

export function useBreakEvenROI() {
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * Calculate break-even point and ROI metrics
   */
  const calculateBreakEven = useCallback((input: BreakEvenInput): BreakEvenResult => {
    setIsCalculating(true);

    try {
      // 1. Calculate unit economics
      const marketplaceFee = input.sellingPrice * (input.marketplaceFeePercent / 100);
      const unitCost = input.costPrice + marketplaceFee + input.shippingCost;
      const unitProfit = input.sellingPrice - unitCost;
      const profitMargin = (unitProfit / input.sellingPrice) * 100;

      // 2. Calculate break-even units (fixed costs / profit per unit)
      const breakEvenUnits = unitProfit > 0 
        ? Math.ceil(input.monthlyFixedCosts / unitProfit)
        : Infinity;

      const breakEvenRevenue = breakEvenUnits * input.sellingPrice;

      // 3. Calculate days to break-even (if average daily sales provided)
      const breakEvenDays = input.averageDailySales && input.averageDailySales > 0
        ? Math.ceil(breakEvenUnits / input.averageDailySales)
        : null;

      // 4. Calculate ROI (if initial investment provided)
      let roi = null;
      let paybackPeriod = null;
      let monthlyROI = null;

      if (input.initialInvestment && input.initialInvestment > 0) {
        const monthlyProfit = input.averageDailySales 
          ? (input.averageDailySales * 30 * unitProfit) - input.monthlyFixedCosts
          : null;

        if (monthlyProfit && monthlyProfit > 0) {
          // ROI = (Ganho - Investimento) / Investimento * 100
          const totalReturn = monthlyProfit * 12; // Anual
          roi = ((totalReturn - input.initialInvestment) / input.initialInvestment) * 100;
          
          // Payback period in months
          paybackPeriod = input.initialInvestment / monthlyProfit;
          
          // Monthly ROI
          monthlyROI = (monthlyProfit / input.initialInvestment) * 100;
        }
      }

      // 5. Calculate units needed to reach target profit
      let unitsForTarget = null;
      let daysForTarget = null;

      if (input.targetMonthlyProfit && input.targetMonthlyProfit > 0) {
        const totalUnitsNeeded = (input.monthlyFixedCosts + input.targetMonthlyProfit) / unitProfit;
        unitsForTarget = Math.ceil(totalUnitsNeeded);
        
        if (input.averageDailySales && input.averageDailySales > 0) {
          daysForTarget = Math.ceil(unitsForTarget / input.averageDailySales);
        }
      }

      // 6. Generate recommendations
      const recommendations = generateRecommendations({
        unitProfit,
        profitMargin,
        breakEvenUnits,
        breakEvenDays,
        roi,
        paybackPeriod,
        input,
      });

      // 7. Generate alerts
      const alerts = generateAlerts({
        unitProfit,
        profitMargin,
        breakEvenUnits,
        breakEvenDays,
        roi,
        input,
      });

      return {
        breakEvenUnits,
        breakEvenRevenue,
        breakEvenDays,
        unitProfit,
        unitCost,
        profitMargin,
        roi,
        paybackPeriod,
        monthlyROI,
        unitsForTarget,
        daysForTarget,
        recommendations,
        alerts,
      };
    } finally {
      setIsCalculating(false);
    }
  }, []);

  /**
   * Compare multiple ROI scenarios (different daily sales rates)
   */
  const compareScenarios = useCallback((
    baseInput: BreakEvenInput
  ): ROIScenario[] => {
    return BREAK_EVEN_SCENARIOS.map(scenario => {
      const averageSales = (scenario.dailySalesRange[0] + scenario.dailySalesRange[1]) / 2;
      
      const result = calculateBreakEven({
        ...baseInput,
        averageDailySales: averageSales,
      });

      return {
        id: scenario.id,
        label: scenario.label,
        dailySales: averageSales,
        result,
        color: scenario.color,
      };
    });
  }, [calculateBreakEven]);

  /**
   * Generate monthly projections for visualization
   */
  const generateMonthlyProjections = useCallback((
    input: BreakEvenInput,
    months: number = 12
  ): MonthlyProjection[] => {
    if (!input.averageDailySales || input.averageDailySales <= 0) {
      return [];
    }

    const result = calculateBreakEven(input);
    const projections: MonthlyProjection[] = [];
    let cumulativeProfit = -(input.initialInvestment || 0);
    let reachedBreakEven = false;

    for (let month = 1; month <= months; month++) {
      const units = Math.round(input.averageDailySales * 30);
      const revenue = units * input.sellingPrice;
      const variableCosts = units * result.unitCost;
      const totalCosts = variableCosts + input.monthlyFixedCosts;
      const profit = revenue - totalCosts;
      
      cumulativeProfit += profit;

      if (!reachedBreakEven && cumulativeProfit >= 0) {
        reachedBreakEven = true;
      }

      const currentROI = input.initialInvestment && input.initialInvestment > 0
        ? (cumulativeProfit / input.initialInvestment) * 100
        : 0;

      projections.push({
        month,
        monthLabel: `Mês ${month}`,
        units,
        revenue,
        costs: totalCosts,
        profit,
        cumulativeProfit,
        reachedBreakEven,
        roi: currentROI,
      });
    }

    return projections;
  }, [calculateBreakEven]);

  /**
   * Generate break-even chart data (revenue vs costs)
   */
  const generateChartData = useCallback((
    input: BreakEvenInput,
    maxUnits?: number
  ): BreakEvenChartData[] => {
    const result = calculateBreakEven(input);
    const max = maxUnits || result.breakEvenUnits * 2;
    const dataPoints: BreakEvenChartData[] = [];

    for (let units = 0; units <= max; units += Math.ceil(max / 20)) {
      const revenue = units * input.sellingPrice;
      const variableCosts = units * result.unitCost;
      const totalCosts = variableCosts + input.monthlyFixedCosts;
      const profit = revenue - totalCosts;
      const isBreakEven = Math.abs(units - result.breakEvenUnits) < max / 20;

      dataPoints.push({
        units,
        revenue,
        totalCosts,
        profit,
        isBreakEven,
      });
    }

    return dataPoints;
  }, [calculateBreakEven]);

  return {
    calculateBreakEven,
    compareScenarios,
    generateMonthlyProjections,
    generateChartData,
    isCalculating,
  };
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(data: {
  unitProfit: number;
  profitMargin: number;
  breakEvenUnits: number;
  breakEvenDays: number | null;
  roi: number | null;
  paybackPeriod: number | null;
  input: BreakEvenInput;
}): string[] {
  const recommendations: string[] = [];

  // Profit margin analysis
  if (data.profitMargin < 10) {
    recommendations.push(
      '⚠️ Margem de lucro muito baixa (<10%). Considere reduzir custos ou aumentar preço.'
    );
  } else if (data.profitMargin < 20) {
    recommendations.push(
      '💡 Margem de lucro moderada (10-20%). Busque otimizar custos para aumentar rentabilidade.'
    );
  } else {
    recommendations.push(
      '✅ Excelente margem de lucro (>20%)! Continue otimizando a operação.'
    );
  }

  // Break-even analysis
  if (data.breakEvenDays !== null) {
    if (data.breakEvenDays <= 30) {
      recommendations.push(
        `🚀 Ótimo! Você atinge o break-even em apenas ${data.breakEvenDays} dias.`
      );
    } else if (data.breakEvenDays <= 90) {
      recommendations.push(
        `⏱️ Break-even em ${data.breakEvenDays} dias (~${Math.ceil(data.breakEvenDays / 30)} meses). Meta alcançável.`
      );
    } else {
      recommendations.push(
        `⚠️ Break-even em ${data.breakEvenDays} dias é longo. Considere aumentar vendas ou reduzir custos fixos.`
      );
    }
  }

  // ROI analysis
  if (data.roi !== null) {
    if (data.roi > 100) {
      recommendations.push(
        `📈 ROI anual excelente (${data.roi.toFixed(0)}%)! Investimento muito rentável.`
      );
    } else if (data.roi > 50) {
      recommendations.push(
        `💰 ROI anual bom (${data.roi.toFixed(0)}%). Investimento compensador.`
      );
    } else if (data.roi > 0) {
      recommendations.push(
        `⚖️ ROI anual positivo (${data.roi.toFixed(0)}%), mas há espaço para melhorar.`
      );
    } else {
      recommendations.push(
        `🔴 ROI negativo. Revise estratégia: aumente vendas ou reduza custos significativamente.`
      );
    }
  }

  // Payback period analysis
  if (data.paybackPeriod !== null) {
    if (data.paybackPeriod <= 6) {
      recommendations.push(
        `⚡ Payback rápido: ${data.paybackPeriod.toFixed(1)} meses. Excelente retorno.`
      );
    } else if (data.paybackPeriod <= 12) {
      recommendations.push(
        `✅ Payback em ${data.paybackPeriod.toFixed(1)} meses. Retorno dentro do esperado.`
      );
    } else {
      recommendations.push(
        `⏳ Payback longo (${data.paybackPeriod.toFixed(1)} meses). Avalie possibilidade de acelerar vendas.`
      );
    }
  }

  // Volume analysis
  if (data.breakEvenUnits > 1000) {
    recommendations.push(
      `📊 São necessárias ${data.breakEvenUnits} vendas para break-even. Considere reduzir custos fixos ou aumentar margem.`
    );
  }

  return recommendations.slice(0, 4); // Máximo 4 recomendações
}

/**
 * Generate alerts based on analysis
 */
function generateAlerts(data: {
  unitProfit: number;
  profitMargin: number;
  breakEvenUnits: number;
  breakEvenDays: number | null;
  roi: number | null;
  input: BreakEvenInput;
}): BreakEvenAlert[] {
  const alerts: BreakEvenAlert[] = [];

  // Critical: Negative profit per unit
  if (data.unitProfit <= 0) {
    alerts.push({
      type: 'danger',
      message: '🔴 ATENÇÃO: Lucro por unidade é negativo ou zero. Você está tendo prejuízo em cada venda!',
      severity: 'high',
    });
  }

  // Warning: Very low margin
  if (data.profitMargin > 0 && data.profitMargin < 5) {
    alerts.push({
      type: 'warning',
      message: '⚠️ Margem de lucro muito baixa (<5%). Qualquer imprevisto pode causar prejuízo.',
      severity: 'high',
    });
  }

  // Info: High break-even point
  if (data.breakEvenUnits > 500) {
    alerts.push({
      type: 'info',
      message: `📊 Ponto de equilíbrio alto: ${data.breakEvenUnits} unidades. Considere estratégias para reduzir custos fixos.`,
      severity: 'medium',
    });
  }

  // Warning: Long break-even period
  if (data.breakEvenDays !== null && data.breakEvenDays > 180) {
    alerts.push({
      type: 'warning',
      message: `⏱️ Break-even em ${Math.ceil(data.breakEvenDays / 30)} meses é muito longo. Revise estratégia de vendas.`,
      severity: 'medium',
    });
  }

  // Success: Good metrics
  if (data.profitMargin > 20 && data.breakEvenDays !== null && data.breakEvenDays <= 60) {
    alerts.push({
      type: 'success',
      message: '✅ Excelentes métricas! Margem saudável e break-even rápido.',
      severity: 'low',
    });
  }

  // Info: Negative ROI
  if (data.roi !== null && data.roi < 0) {
    alerts.push({
      type: 'warning',
      message: '📉 ROI negativo no primeiro ano. Considere aumentar volume de vendas ou reduzir investimento inicial.',
      severity: 'high',
    });
  }

  return alerts;
}
