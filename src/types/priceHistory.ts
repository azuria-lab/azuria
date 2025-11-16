/**
 * Feature #7: Price History & Analytics
 * Types for tracking price changes and generating insights
 */

/**
 * Single price entry in history
 */
export interface PriceEntry {
  id: string;
  date: Date;
  price: number;
  cost: number;
  marketplace: string;
  marketplaceFee: number;
  profit: number;
  margin: number;
  volume?: number; // Quantidade vendida naquele período
  revenue?: number; // Receita total do período
  notes?: string; // Notas do usuário sobre mudanças
}

/**
 * Price history analysis result
 */
export interface PriceHistoryAnalysis {
  entries: PriceEntry[];
  
  // Summary statistics
  currentPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  
  // Trends
  trend: PriceTrend;
  volatility: 'low' | 'medium' | 'high';
  
  // Performance
  bestPeriod: PricePeriodPerformance;
  worstPeriod: PricePeriodPerformance;
  
  // Insights
  insights: PriceInsight[];
  recommendations: PriceRecommendation[];
  
  // Comparisons
  priceChangePercent: number; // vs período anterior
  profitChangePercent: number;
  volumeChangePercent: number;
}

/**
 * Price trend analysis
 */
export interface PriceTrend {
  direction: 'up' | 'down' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  percentChange: number;
  daysInTrend: number;
  startDate: Date;
  endDate: Date;
  prediction?: number; // Preço previsto baseado em tendência
}

/**
 * Period performance metrics
 */
export interface PricePeriodPerformance {
  period: string; // "Janeiro 2024", "Última semana", etc
  startDate: Date;
  endDate: Date;
  averagePrice: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
  totalVolume: number;
  reason?: string; // Por que foi o melhor/pior
}

/**
 * Automated insight
 */
export interface PriceInsight {
  type: 'trend' | 'opportunity' | 'warning' | 'anomaly' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  icon: string;
  color: string;
  actionable: boolean;
  suggestedAction?: string;
  impact?: string; // Impacto estimado da ação
}

/**
 * Price recommendation based on history
 */
export interface PriceRecommendation {
  type: 'increase' | 'decrease' | 'maintain' | 'test';
  suggestedPrice: number;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  reasoning: string;
  expectedImpact: {
    profitChange: string;
    volumeChange: string;
    revenueChange: string;
  };
  confidence: number; // 0-100
  basedOn: string[]; // ["Tendência de alta", "Margem acima da média", etc]
}

/**
 * Price comparison with historical data
 */
export interface PriceComparison {
  label: string;
  currentValue: number;
  historicalValue: number;
  change: number;
  changePercent: number;
  trend: 'better' | 'worse' | 'neutral';
}

/**
 * Time period for analysis
 */
export interface TimePeriod {
  id: string;
  label: string;
  days: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  date: string;
  price: number;
  profit: number;
  margin: number;
  volume?: number;
  revenue?: number;
}

/**
 * Preset time periods
 */
export const TIME_PERIODS = [
  { id: 'week', label: 'Última Semana', days: 7 },
  { id: 'month', label: 'Último Mês', days: 30 },
  { id: 'quarter', label: 'Último Trimestre', days: 90 },
  { id: 'year', label: 'Último Ano', days: 365 },
  { id: 'all', label: 'Todo Período', days: -1 },
] as const;

/**
 * Volatility thresholds
 */
export const VOLATILITY_THRESHOLDS = {
  low: 5, // Variação < 5%
  medium: 15, // Variação 5-15%
  high: 15, // Variação > 15%
} as const;

/**
 * Trend strength thresholds
 */
export const TREND_STRENGTH_THRESHOLDS = {
  weak: 3, // Mudança < 3%
  moderate: 10, // Mudança 3-10%
  strong: 10, // Mudança > 10%
} as const;

/**
 * Visual metadata for insights
 */
export const INSIGHT_METADATA = {
  trend: {
    icon: '📈',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
  },
  opportunity: {
    icon: '💡',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
  },
  warning: {
    icon: '⚠️',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
  },
  anomaly: {
    icon: '🔍',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
  },
  milestone: {
    icon: '🎯',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-700',
  },
} as const;

/**
 * Sample data generator for demo/testing
 */
export function generateSamplePriceHistory(days: number = 30): PriceEntry[] {
  const entries: PriceEntry[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let basePrice = 100;
  let baseCost = 50;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add some realistic variation
    const priceVariation = (Math.random() - 0.5) * 10;
    const costVariation = (Math.random() - 0.5) * 3;
    
    const price = basePrice + priceVariation;
    const cost = baseCost + costVariation;
    const marketplaceFee = price * 0.16;
    const profit = price - cost - marketplaceFee;
    const margin = (profit / price) * 100;
    const volume = Math.floor(50 + Math.random() * 100);
    const revenue = price * volume;
    
    entries.push({
      id: `entry-${i}`,
      date,
      price,
      cost,
      marketplace: 'mercadolivre',
      marketplaceFee,
      profit,
      margin,
      volume,
      revenue,
    });
    
    // Gradual trend
    basePrice += (Math.random() - 0.45) * 2;
    baseCost += (Math.random() - 0.5) * 0.5;
  }
  
  return entries;
}
