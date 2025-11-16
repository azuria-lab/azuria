/**
 * Feature #9: Comparison Mode Types
 * Before/After scenario comparison with split screen visualization
 */

/**
 * Single pricing scenario for comparison
 */
export interface PricingScenario {
  id: string;
  name: string;
  description?: string;
  
  // Core pricing
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  marketplaceFee: number;
  taxes: number;
  
  // Optional costs
  packagingCost?: number;
  marketingCost?: number;
  operationalCost?: number;
  otherCosts?: number;
  
  // Additional metadata
  marketplace?: string;
  volume?: number;
  createdAt?: Date;
}

/**
 * Calculated metrics for a scenario
 */
export interface ScenarioMetrics {
  totalCosts: number;
  profit: number;
  profitMargin: number;
  profitPerUnit: number;
  revenue: number;
  
  // Cost breakdown percentages
  productCostPercentage: number;
  shippingCostPercentage: number;
  marketplaceFeePercentage: number;
  taxesPercentage: number;
  
  // Performance indicators
  isProfit: boolean;
  profitLevel: 'excellent' | 'good' | 'low' | 'negative';
}

/**
 * Comparison between two scenarios
 */
export interface ScenarioComparison {
  before: PricingScenario;
  after: PricingScenario;
  
  beforeMetrics: ScenarioMetrics;
  afterMetrics: ScenarioMetrics;
  
  // Differences
  differences: ComparisonDifferences;
  
  // Summary
  summary: ComparisonSummary;
  
  // Insights
  insights: ComparisonInsight[];
  
  // Visual data
  chartData: ComparisonChartData;
}

/**
 * Detailed differences between scenarios
 */
export interface ComparisonDifferences {
  // Price differences
  sellingPriceDiff: number;
  sellingPriceDiffPercent: number;
  
  // Cost differences
  productCostDiff: number;
  productCostDiffPercent: number;
  shippingCostDiff: number;
  shippingCostDiffPercent: number;
  marketplaceFeeDiff: number;
  marketplaceFeeDiffPercent: number;
  taxesDiff: number;
  taxesDiffPercent: number;
  totalCostsDiff: number;
  totalCostsDiffPercent: number;
  
  // Profit differences
  profitDiff: number;
  profitDiffPercent: number;
  profitMarginDiff: number; // in percentage points
  
  // Revenue differences
  revenueDiff: number;
  revenueDiffPercent: number;
}

/**
 * Summary of comparison results
 */
export interface ComparisonSummary {
  title: string;
  verdict: 'better' | 'worse' | 'neutral';
  verdictMessage: string;
  
  // Key improvements or degradations
  improvements: string[];
  degradations: string[];
  
  // Recommendation
  recommendation: string;
  recommendationType: 'adopt' | 'reject' | 'test' | 'review';
  
  // Confidence level
  confidence: number; // 0-100
}

/**
 * Automated insight about the comparison
 */
export interface ComparisonInsight {
  id: string;
  type: 'profit' | 'cost' | 'margin' | 'efficiency' | 'risk';
  severity: 'positive' | 'negative' | 'neutral';
  title: string;
  message: string;
  icon: string;
  color: string;
  
  // Associated data
  metricBefore: number;
  metricAfter: number;
  change: number;
  changePercent: number;
}

/**
 * Chart data for visual comparison
 */
export interface ComparisonChartData {
  // Bar chart data
  barData: {
    category: string;
    before: number;
    after: number;
    difference: number;
  }[];
  
  // Profit comparison
  profitComparison: {
    label: string;
    before: number;
    after: number;
  };
  
  // Margin comparison
  marginComparison: {
    before: number;
    after: number;
    difference: number;
  };
}

/**
 * Comparison preset templates
 */
export interface ComparisonPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'price' | 'cost' | 'marketplace' | 'optimization';
  
  // What changes in this preset
  changes: {
    field: keyof PricingScenario;
    changeType: 'increase' | 'decrease' | 'custom';
    changeValue: number; // percentage or absolute
    changeMode: 'percent' | 'absolute';
  }[];
}

/**
 * Preset templates for common comparisons
 */
export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'price-increase-10',
    name: 'Aumentar Preço 10%',
    description: 'Simula aumento de 10% no preço de venda',
    icon: '📈',
    category: 'price',
    changes: [
      {
        field: 'sellingPrice',
        changeType: 'increase',
        changeValue: 10,
        changeMode: 'percent',
      },
    ],
  },
  {
    id: 'price-decrease-10',
    name: 'Reduzir Preço 10%',
    description: 'Simula redução de 10% no preço de venda',
    icon: '📉',
    category: 'price',
    changes: [
      {
        field: 'sellingPrice',
        changeType: 'decrease',
        changeValue: 10,
        changeMode: 'percent',
      },
    ],
  },
  {
    id: 'cost-optimization',
    name: 'Otimizar Custos',
    description: 'Reduz produto em 5%, frete em 10%',
    icon: '⚡',
    category: 'optimization',
    changes: [
      {
        field: 'productCost',
        changeType: 'decrease',
        changeValue: 5,
        changeMode: 'percent',
      },
      {
        field: 'shippingCost',
        changeType: 'decrease',
        changeValue: 10,
        changeMode: 'percent',
      },
    ],
  },
  {
    id: 'marketplace-switch',
    name: 'Trocar de Marketplace',
    description: 'Simula mudança para marketplace com taxa 30% menor',
    icon: '🏪',
    category: 'marketplace',
    changes: [
      {
        field: 'marketplaceFee',
        changeType: 'decrease',
        changeValue: 30,
        changeMode: 'percent',
      },
    ],
  },
  {
    id: 'premium-pricing',
    name: 'Precificação Premium',
    description: 'Aumenta preço 20% e adiciona embalagem especial',
    icon: '⭐',
    category: 'price',
    changes: [
      {
        field: 'sellingPrice',
        changeType: 'increase',
        changeValue: 20,
        changeMode: 'percent',
      },
      {
        field: 'packagingCost',
        changeType: 'increase',
        changeValue: 50,
        changeMode: 'percent',
      },
    ],
  },
  {
    id: 'bulk-discount',
    name: 'Desconto por Volume',
    description: 'Reduz preço 5% mas economiza 15% em custos',
    icon: '📦',
    category: 'optimization',
    changes: [
      {
        field: 'sellingPrice',
        changeType: 'decrease',
        changeValue: 5,
        changeMode: 'percent',
      },
      {
        field: 'productCost',
        changeType: 'decrease',
        changeValue: 15,
        changeMode: 'percent',
      },
    ],
  },
];

/**
 * Metadata for comparison metrics
 */
export const COMPARISON_METRIC_METADATA = {
  profit: {
    label: 'Lucro',
    icon: '💰',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    format: (value: number) => `R$ ${value.toFixed(2)}`,
  },
  profitMargin: {
    label: 'Margem de Lucro',
    icon: '📊',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    format: (value: number) => `${value.toFixed(1)}%`,
  },
  revenue: {
    label: 'Receita',
    icon: '💵',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    format: (value: number) => `R$ ${value.toFixed(2)}`,
  },
  totalCosts: {
    label: 'Custos Totais',
    icon: '📉',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    format: (value: number) => `R$ ${value.toFixed(2)}`,
  },
};

/**
 * Helper to generate sample scenarios
 */
export function generateSampleScenario(
  type: 'current' | 'optimized' = 'current'
): PricingScenario {
  if (type === 'current') {
    return {
      id: 'scenario-before',
      name: 'Cenário Atual',
      description: 'Sua precificação atual',
      sellingPrice: 150.0,
      productCost: 65.0,
      shippingCost: 18.0,
      marketplaceFee: 22.5,
      taxes: 15.0,
      packagingCost: 5.0,
      marketingCost: 8.0,
      operationalCost: 4.0,
      otherCosts: 1.5,
      marketplace: 'Mercado Livre',
      volume: 100,
    };
  } else {
    return {
      id: 'scenario-after',
      name: 'Cenário Otimizado',
      description: 'Com melhorias sugeridas',
      sellingPrice: 155.0,
      productCost: 58.0, // -10.8% negotiation
      shippingCost: 15.0, // -16.7% better carrier
      marketplaceFee: 23.25, // slight increase due to price
      taxes: 15.5,
      packagingCost: 4.0, // -20% bulk purchase
      marketingCost: 8.0,
      operationalCost: 4.0,
      otherCosts: 1.5,
      marketplace: 'Mercado Livre',
      volume: 100,
    };
  }
}
