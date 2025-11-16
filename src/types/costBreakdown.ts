/**
 * Feature #8: Cost Breakdown Analysis Types
 * Comprehensive cost analysis with visual pie chart breakdown
 */

/**
 * Categories of costs in e-commerce operations
 */
export type CostCategory =
  | 'product'          // Cost of goods (produto)
  | 'shipping'         // Shipping/freight costs
  | 'marketplace_fee'  // Marketplace commissions
  | 'taxes'            // Taxes (impostos)
  | 'packaging'        // Packaging materials
  | 'marketing'        // Marketing/advertising
  | 'operational'      // Operational costs
  | 'other';          // Other miscellaneous costs

/**
 * Single cost item in the breakdown
 */
export interface CostItem {
  id: string;
  category: CostCategory;
  label: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
  description?: string;
  isEditable: boolean;
  isRequired: boolean;
}

/**
 * Input data for cost breakdown analysis
 */
export interface CostBreakdownInput {
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  marketplaceFee: number;
  taxes: number;
  packagingCost?: number;
  marketingCost?: number;
  operationalCost?: number;
  otherCosts?: number;
}

/**
 * Complete cost breakdown analysis result
 */
export interface CostBreakdownAnalysis {
  items: CostItem[];
  totalCosts: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
  profitPercentage: number;
  
  // Category summaries
  fixedCosts: number;
  variableCosts: number;
  
  // Insights
  largestCost: CostItem;
  smallestCost: CostItem;
  optimizationOpportunities: CostOptimization[];
  
  // Comparisons
  costToRevenueRatio: number;
  industryBenchmark?: IndustryBenchmark;
  
  // Visual data
  chartData: ChartDataPoint[];
}

/**
 * Cost optimization suggestion
 */
export interface CostOptimization {
  id: string;
  category: CostCategory;
  type: 'reduce' | 'negotiate' | 'eliminate' | 'optimize';
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  potentialSaving: number;
  savingPercentage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  actionSteps: string[];
  estimatedTimeframe: string;
  priority: number;
}

/**
 * Industry benchmark comparison
 */
export interface IndustryBenchmark {
  category: string;
  averageProductCostPercentage: number;
  averageShippingPercentage: number;
  averageMarketplaceFeePercentage: number;
  averageTaxPercentage: number;
  averageProfitMargin: number;
  yourProfitMargin: number;
  comparison: 'above' | 'below' | 'average';
  message: string;
}

/**
 * Data point for pie chart visualization
 */
export interface ChartDataPoint {
  id: string;
  category: CostCategory;
  label: string;
  value: number;
  percentage: number;
  color: string;
  formattedValue: string;
}

/**
 * Cost comparison scenario
 */
export interface CostScenario {
  id: string;
  name: string;
  description: string;
  costs: CostBreakdownInput;
  analysis: CostBreakdownAnalysis;
}

/**
 * Cost alert/warning
 */
export interface CostAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  category: CostCategory;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
  actionable: boolean;
  suggestedAction?: string;
}

/**
 * Category metadata for consistent styling
 */
export const COST_CATEGORY_METADATA: Record<CostCategory, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}> = {
  product: {
    label: 'Custo do Produto',
    icon: '📦',
    color: '#3b82f6', // blue-500
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    description: 'Custo de aquisição ou produção do produto',
  },
  shipping: {
    label: 'Frete',
    icon: '🚚',
    color: '#10b981', // green-500
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    description: 'Custos de envio e logística',
  },
  marketplace_fee: {
    label: 'Taxa do Marketplace',
    icon: '🏪',
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    description: 'Comissões da plataforma de vendas',
  },
  taxes: {
    label: 'Impostos',
    icon: '📄',
    color: '#ef4444', // red-500
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    description: 'Tributos e impostos obrigatórios',
  },
  packaging: {
    label: 'Embalagem',
    icon: '📮',
    color: '#8b5cf6', // violet-500
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    description: 'Materiais de embalagem e proteção',
  },
  marketing: {
    label: 'Marketing',
    icon: '📢',
    color: '#ec4899', // pink-500
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    description: 'Investimento em anúncios e divulgação',
  },
  operational: {
    label: 'Operacional',
    icon: '⚙️',
    color: '#6366f1', // indigo-500
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    description: 'Custos operacionais diversos',
  },
  other: {
    label: 'Outros',
    icon: '📊',
    color: '#64748b', // slate-500
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    description: 'Outros custos não categorizados',
  },
};

/**
 * Industry benchmarks by business type
 */
export const INDUSTRY_BENCHMARKS: Record<string, {
  productCost: number;
  shipping: number;
  marketplaceFee: number;
  taxes: number;
  targetProfitMargin: number;
}> = {
  default: {
    productCost: 40,      // 40% do preço de venda
    shipping: 10,         // 10% do preço de venda
    marketplaceFee: 15,   // 15% do preço de venda
    taxes: 10,            // 10% do preço de venda
    targetProfitMargin: 25, // 25% lucro líquido
  },
  electronics: {
    productCost: 50,
    shipping: 8,
    marketplaceFee: 12,
    taxes: 10,
    targetProfitMargin: 20,
  },
  fashion: {
    productCost: 35,
    shipping: 12,
    marketplaceFee: 15,
    taxes: 10,
    targetProfitMargin: 28,
  },
  food: {
    productCost: 30,
    shipping: 15,
    marketplaceFee: 15,
    taxes: 12,
    targetProfitMargin: 28,
  },
  books: {
    productCost: 45,
    shipping: 10,
    marketplaceFee: 15,
    taxes: 8,
    targetProfitMargin: 22,
  },
};

/**
 * Cost reduction difficulty indicators
 */
export const DIFFICULTY_METADATA = {
  easy: {
    label: 'Fácil',
    icon: '✅',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Pode ser feito rapidamente',
  },
  medium: {
    label: 'Médio',
    icon: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Requer algum esforço',
  },
  hard: {
    label: 'Difícil',
    icon: '🎯',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Requer planejamento e tempo',
  },
};

/**
 * Impact level indicators
 */
export const IMPACT_METADATA = {
  low: {
    label: 'Baixo',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  medium: {
    label: 'Médio',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  high: {
    label: 'Alto',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
};

/**
 * Generate sample cost breakdown for testing
 */
export function generateSampleCostBreakdown(): CostBreakdownInput {
  return {
    sellingPrice: 150.0,
    productCost: 60.0,
    shippingCost: 15.0,
    marketplaceFee: 22.5,
    taxes: 15.0,
    packagingCost: 5.0,
    marketingCost: 10.0,
    operationalCost: 7.5,
    otherCosts: 2.0,
  };
}
