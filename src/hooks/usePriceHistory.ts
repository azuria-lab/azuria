/**
 * Feature #7: Price History & Analytics Hook
 * Analyzes price history and generates insights automatically
 */

import { useCallback, useState } from 'react';
import {
  type PriceComparison,
  type PriceEntry,
  type PriceHistoryAnalysis,
  type PriceInsight,
  type PricePeriodPerformance,
  type PriceRecommendation,
  type PriceTrend,
  TREND_STRENGTH_THRESHOLDS,
  VOLATILITY_THRESHOLDS,
} from '@/types/priceHistory';

interface ChartDataPoint {
  date: string;
  price: number;
  profit: number;
  margin: number;
  volume?: number;
  revenue?: number;
}

export function usePriceHistory() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Analyze price history and generate insights
   */
  const analyzePriceHistory = useCallback((entries: PriceEntry[]): PriceHistoryAnalysis => {
    setIsAnalyzing(true);

    try {
      if (entries.length === 0) {
        throw new Error('No price history data available');
      }

      // Sort by date (oldest first)
      const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate summary statistics
      const prices = sortedEntries.map(e => e.price);
      const currentPrice = prices[prices.length - 1];
      const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;

      // Analyze trend
      const trend = analyzeTrend(sortedEntries);

      // Calculate volatility
      const volatility = calculateVolatility(prices);

      // Find best and worst periods
      const bestPeriod = findBestPeriod(sortedEntries);
      const worstPeriod = findWorstPeriod(sortedEntries);

      // Generate insights
      const insights = generateInsights({
        entries: sortedEntries,
        trend,
        volatility,
        averagePrice,
        currentPrice,
        bestPeriod,
        worstPeriod,
      });

      // Generate recommendations
      const recommendations = generateRecommendations({
        entries: sortedEntries,
        trend,
        averagePrice,
        currentPrice,
        bestPeriod,
      });

      // Calculate changes vs previous period
      const halfPoint = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, halfPoint);
      const secondHalf = sortedEntries.slice(halfPoint);

      const avgPriceFirst = firstHalf.reduce((sum, e) => sum + e.price, 0) / firstHalf.length;
      const avgPriceSecond = secondHalf.reduce((sum, e) => sum + e.price, 0) / secondHalf.length;
      const priceChangePercent = ((avgPriceSecond - avgPriceFirst) / avgPriceFirst) * 100;

      const avgProfitFirst = firstHalf.reduce((sum, e) => sum + e.profit, 0) / firstHalf.length;
      const avgProfitSecond = secondHalf.reduce((sum, e) => sum + e.profit, 0) / secondHalf.length;
      const profitChangePercent = ((avgProfitSecond - avgProfitFirst) / avgProfitFirst) * 100;

      const totalVolumeFirst = firstHalf.reduce((sum, e) => sum + (e.volume || 0), 0);
      const totalVolumeSecond = secondHalf.reduce((sum, e) => sum + (e.volume || 0), 0);
      const volumeChangePercent = totalVolumeFirst > 0
        ? ((totalVolumeSecond - totalVolumeFirst) / totalVolumeFirst) * 100
        : 0;

      return {
        entries: sortedEntries,
        currentPrice,
        averagePrice,
        minPrice,
        maxPrice,
        priceRange,
        trend,
        volatility,
        bestPeriod,
        worstPeriod,
        insights,
        recommendations,
        priceChangePercent,
        profitChangePercent,
        volumeChangePercent,
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Generate chart data for visualization
   */
  const generateChartData = useCallback((entries: PriceEntry[]): ChartDataPoint[] => {
    return entries
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(entry => ({
        date: entry.date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        price: entry.price,
        profit: entry.profit,
        margin: entry.margin,
        volume: entry.volume,
        revenue: entry.revenue,
      }));
  }, []);

  /**
   * Compare current metrics with historical averages
   */
  const compareWithHistory = useCallback(
    (entries: PriceEntry[]): PriceComparison[] => {
      const analysis = analyzePriceHistory(entries);
      const current = entries[entries.length - 1];

      return [
        {
          label: 'Preço',
          currentValue: current.price,
          historicalValue: analysis.averagePrice,
          change: current.price - analysis.averagePrice,
          changePercent: ((current.price - analysis.averagePrice) / analysis.averagePrice) * 100,
          trend: current.price > analysis.averagePrice ? 'better' : 'worse',
        },
        {
          label: 'Lucro',
          currentValue: current.profit,
          historicalValue: entries.reduce((sum, e) => sum + e.profit, 0) / entries.length,
          change: current.profit - (entries.reduce((sum, e) => sum + e.profit, 0) / entries.length),
          changePercent: ((current.profit - (entries.reduce((sum, e) => sum + e.profit, 0) / entries.length)) / (entries.reduce((sum, e) => sum + e.profit, 0) / entries.length)) * 100,
          trend: current.profit > (entries.reduce((sum, e) => sum + e.profit, 0) / entries.length) ? 'better' : 'worse',
        },
        {
          label: 'Margem',
          currentValue: current.margin,
          historicalValue: entries.reduce((sum, e) => sum + e.margin, 0) / entries.length,
          change: current.margin - (entries.reduce((sum, e) => sum + e.margin, 0) / entries.length),
          changePercent: ((current.margin - (entries.reduce((sum, e) => sum + e.margin, 0) / entries.length)) / (entries.reduce((sum, e) => sum + e.margin, 0) / entries.length)) * 100,
          trend: current.margin > (entries.reduce((sum, e) => sum + e.margin, 0) / entries.length) ? 'better' : 'worse',
        },
      ];
    },
    [analyzePriceHistory]
  );

  return {
    analyzePriceHistory,
    generateChartData,
    compareWithHistory,
    isAnalyzing,
  };
}

/**
 * Analyze price trend
 */
function analyzeTrend(entries: PriceEntry[]): PriceTrend {
  const firstPrice = entries[0].price;
  const lastPrice = entries[entries.length - 1].price;
  const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;

  // Determine direction
  let direction: PriceTrend['direction'] = 'stable';
  if (Math.abs(percentChange) > 2) {
    direction = percentChange > 0 ? 'up' : 'down';
  }

  // Determine strength
  let strength: PriceTrend['strength'] = 'weak';
  const absChange = Math.abs(percentChange);
  if (absChange > TREND_STRENGTH_THRESHOLDS.strong) {
    strength = 'strong';
  } else if (absChange > TREND_STRENGTH_THRESHOLDS.moderate) {
    strength = 'moderate';
  }

  // Simple linear prediction
  const avgDailyChange = (lastPrice - firstPrice) / entries.length;
  const prediction = lastPrice + (avgDailyChange * 7); // 7 days ahead

  return {
    direction,
    strength,
    percentChange,
    daysInTrend: entries.length,
    startDate: entries[0].date,
    endDate: entries[entries.length - 1].date,
    prediction: Math.max(0, prediction),
  };
}

/**
 * Calculate price volatility
 */
function calculateVolatility(prices: number[]): 'low' | 'medium' | 'high' {
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / avg) * 100;

  if (coefficientOfVariation < VOLATILITY_THRESHOLDS.low) {
    return 'low';
  }
  if (coefficientOfVariation < VOLATILITY_THRESHOLDS.medium) {
    return 'medium';
  }
  return 'high';
}

/**
 * Find best performing period
 */
function findBestPeriod(entries: PriceEntry[]): PricePeriodPerformance {
  // Simple: find period with highest profit
  const sorted = [...entries].sort((a, b) => b.profit - a.profit);
  const best = sorted[0];

  return {
    period: best.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    startDate: best.date,
    endDate: best.date,
    averagePrice: best.price,
    totalRevenue: best.revenue || 0,
    totalProfit: best.profit * (best.volume || 1),
    averageMargin: best.margin,
    totalVolume: best.volume || 0,
    reason: 'Maior lucro por unidade registrado',
  };
}

/**
 * Find worst performing period
 */
function findWorstPeriod(entries: PriceEntry[]): PricePeriodPerformance {
  const sorted = [...entries].sort((a, b) => a.profit - b.profit);
  const worst = sorted[0];

  return {
    period: worst.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    startDate: worst.date,
    endDate: worst.date,
    averagePrice: worst.price,
    totalRevenue: worst.revenue || 0,
    totalProfit: worst.profit * (worst.volume || 1),
    averageMargin: worst.margin,
    totalVolume: worst.volume || 0,
    reason: 'Menor lucro por unidade registrado',
  };
}

/**
 * Generate automated insights
 */
function generateInsights(data: {
  entries: PriceEntry[];
  trend: PriceTrend;
  volatility: 'low' | 'medium' | 'high';
  averagePrice: number;
  currentPrice: number;
  bestPeriod: PricePeriodPerformance;
  worstPeriod: PricePeriodPerformance;
}): PriceInsight[] {
  const insights: PriceInsight[] = [];

  // Trend insight
  if (data.trend.direction !== 'stable') {
    const trendLabel = data.trend.direction === 'up' ? 'alta' : 'baixa';
    insights.push({
      type: 'trend',
      severity: data.trend.strength === 'strong' ? 'high' : 'medium',
      title: `Tendência de ${trendLabel} detectada`,
      message: `Seus preços estão em ${trendLabel} ${data.trend.strength === 'strong' ? 'forte' : 'moderada'} (${data.trend.percentChange > 0 ? '+' : ''}${data.trend.percentChange.toFixed(1)}%) nos últimos ${data.trend.daysInTrend} dias.`,
      icon: data.trend.direction === 'up' ? '📈' : '📉',
      color: data.trend.direction === 'up' ? 'green' : 'orange',
      actionable: true,
      suggestedAction: data.trend.direction === 'up' 
        ? 'Continue monitorando para identificar o ponto ideal de estabilização'
        : 'Analise se a redução está alinhada com sua estratégia',
    });
  }

  // Volatility warning
  if (data.volatility === 'high') {
    insights.push({
      type: 'warning',
      severity: 'high',
      title: 'Alta volatilidade nos preços',
      message: 'Seus preços têm variado muito. Isso pode confundir clientes e dificultar planejamento.',
      icon: '⚠️',
      color: 'orange',
      actionable: true,
      suggestedAction: 'Considere estabelecer uma faixa de preço mais estável',
      impact: 'Redução de até 15% na taxa de conversão',
    });
  }

  // Price comparison
  const priceDiff = ((data.currentPrice - data.averagePrice) / data.averagePrice) * 100;
  if (Math.abs(priceDiff) > 10) {
    insights.push({
      type: 'anomaly',
      severity: 'medium',
      title: priceDiff > 0 ? 'Preço acima da média histórica' : 'Preço abaixo da média histórica',
      message: `Seu preço atual está ${Math.abs(priceDiff).toFixed(0)}% ${priceDiff > 0 ? 'acima' : 'abaixo'} da média histórica (R$ ${data.averagePrice.toFixed(2)}).`,
      icon: '🔍',
      color: 'purple',
      actionable: true,
      suggestedAction: priceDiff > 0
        ? 'Monitore impacto no volume de vendas'
        : 'Verifique se há espaço para aumentar margem',
    });
  }

  // Best period opportunity
  if (data.bestPeriod.averageMargin > 30) {
    insights.push({
      type: 'opportunity',
      severity: 'low',
      title: 'Período de alta performance identificado',
      message: `Em ${data.bestPeriod.period}, você alcançou ${data.bestPeriod.averageMargin.toFixed(0)}% de margem com preço de R$ ${data.bestPeriod.averagePrice.toFixed(2)}.`,
      icon: '💡',
      color: 'green',
      actionable: true,
      suggestedAction: 'Analise fatores que contribuíram para esse sucesso',
      impact: 'Potencial de replicar alta performance',
    });
  }

  // Milestone
  if (data.entries.length >= 30) {
    insights.push({
      type: 'milestone',
      severity: 'low',
      title: '🎉 Histórico consolidado!',
      message: `Você já tem ${data.entries.length} registros de preço. Dados suficientes para análises preditivas.`,
      icon: '🎯',
      color: 'yellow',
      actionable: false,
    });
  }

  return insights.slice(0, 5); // Máximo 5 insights
}

/**
 * Generate price recommendations
 */
function generateRecommendations(data: {
  entries: PriceEntry[];
  trend: PriceTrend;
  averagePrice: number;
  currentPrice: number;
  bestPeriod: PricePeriodPerformance;
}): PriceRecommendation[] {
  const recommendations: PriceRecommendation[] = [];

  // Based on trend
  if (data.trend.direction === 'up' && data.trend.strength === 'strong') {
    const suggestedPrice = data.currentPrice * 1.05;
    recommendations.push({
      type: 'increase',
      suggestedPrice,
      currentPrice: data.currentPrice,
      priceChange: suggestedPrice - data.currentPrice,
      priceChangePercent: 5,
      reasoning: 'Tendência de alta forte indica aceitação do mercado para preços maiores',
      expectedImpact: {
        profitChange: '+5% no lucro por unidade',
        volumeChange: 'Redução estimada de 2-3% no volume',
        revenueChange: '+2-3% na receita total',
      },
      confidence: 75,
      basedOn: ['Tendência de alta forte', 'Histórico de 30+ dias'],
    });
  }

  // Based on best period
  if (data.bestPeriod.averagePrice > data.currentPrice * 1.1) {
    recommendations.push({
      type: 'increase',
      suggestedPrice: data.bestPeriod.averagePrice,
      currentPrice: data.currentPrice,
      priceChange: data.bestPeriod.averagePrice - data.currentPrice,
      priceChangePercent: ((data.bestPeriod.averagePrice - data.currentPrice) / data.currentPrice) * 100,
      reasoning: `Você já praticou preço de R$ ${data.bestPeriod.averagePrice.toFixed(2)} com sucesso em ${data.bestPeriod.period}`,
      expectedImpact: {
        profitChange: '+' + (((data.bestPeriod.averagePrice - data.currentPrice) / data.currentPrice) * 100).toFixed(0) + '%',
        volumeChange: 'Volume similar ao período histórico',
        revenueChange: '+' + (((data.bestPeriod.averagePrice - data.currentPrice) / data.currentPrice) * 100 * 0.8).toFixed(0) + '%',
      },
      confidence: 85,
      basedOn: ['Melhor período histórico', `Margem de ${data.bestPeriod.averageMargin.toFixed(0)}%`],
    });
  }

  // Test recommendation
  const testPrice = data.averagePrice * 1.03;
  recommendations.push({
    type: 'test',
    suggestedPrice: testPrice,
    currentPrice: data.currentPrice,
    priceChange: testPrice - data.currentPrice,
    priceChangePercent: ((testPrice - data.currentPrice) / data.currentPrice) * 100,
    reasoning: 'Teste pequeno aumento para validar elasticidade de demanda',
    expectedImpact: {
      profitChange: '+3% se volume mantiver',
      volumeChange: 'Esperado < 1% de redução',
      revenueChange: '+2% estimado',
    },
    confidence: 60,
    basedOn: ['Média histórica', 'Teste de precificação'],
  });

  return recommendations;
}
