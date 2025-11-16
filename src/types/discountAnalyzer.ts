/**
 * Feature #6: Discount Analyzer
 * Types for calculating safe discount limits and impact analysis
 */

/**
 * Input data for discount analysis
 */
export interface DiscountInput {
  // Product pricing
  sellingPrice: number; // Preço de venda atual
  costPrice: number; // Custo do produto
  
  // Marketplace fees
  marketplace: string; // ID do marketplace
  marketplaceFeePercent: number; // Taxa do marketplace (%)
  shippingCost: number; // Custo de envio
  
  // Additional costs
  additionalCosts?: number; // Outros custos (embalagem, marketing, etc)
  
  // Volume expectations
  currentVolume?: number; // Volume de vendas atual (mensal)
  expectedVolumeIncrease?: number; // Aumento esperado de volume (%)
}

/**
 * Result of discount analysis
 */
export interface DiscountResult {
  // Maximum safe discount
  maxDiscountPercent: number; // Desconto máximo sem prejuízo
  maxDiscountValue: number; // Valor máximo de desconto (R$)
  priceWithMaxDiscount: number; // Preço com desconto máximo
  
  // Break-even discount
  breakEvenDiscountPercent: number; // Desconto que zera o lucro
  
  // Current margins
  currentProfit: number; // Lucro atual por unidade
  currentMargin: number; // Margem atual (%)
  
  // Discount ranges with labels
  safeRange: DiscountRange; // 0-30% do lucro (verde)
  cautionRange: DiscountRange; // 30-70% do lucro (amarelo)
  dangerRange: DiscountRange; // 70-100% do lucro (laranja)
  lossRange: DiscountRange; // >100% do lucro (vermelho)
  
  // Recommendations
  recommendations: DiscountRecommendation[];
  alerts: DiscountAlert[];
}

/**
 * Discount range with color coding
 */
export interface DiscountRange {
  label: string;
  minPercent: number;
  maxPercent: number;
  color: string;
  description: string;
  profitImpact: string; // "Mantém 70% do lucro", etc
}

/**
 * Discount scenario simulation
 */
export interface DiscountScenario {
  discountPercent: number;
  discountValue: number;
  finalPrice: number;
  profitPerUnit: number;
  profitMargin: number;
  profitLoss: number; // Quanto de lucro foi perdido (%)
  
  // Volume impact
  originalRevenue: number; // Receita sem desconto
  newRevenue: number; // Receita com desconto
  revenueChange: number; // Mudança na receita (%)
  
  // Volume increase needed to compensate
  volumeIncreaseNeeded: number; // % de aumento necessário
  
  // Classification
  status: 'safe' | 'caution' | 'danger' | 'loss';
  statusLabel: string;
}

/**
 * Discount recommendation
 */
export interface DiscountRecommendation {
  type: 'safe' | 'competitive' | 'aggressive' | 'promotional';
  discountPercent: number;
  finalPrice: number;
  description: string;
  icon: string;
  pros: string[];
  cons: string[];
}

/**
 * Alert message for discount
 */
export interface DiscountAlert {
  type: 'success' | 'info' | 'warning' | 'danger';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Preset discount scenarios for quick testing
 */
export const DISCOUNT_PRESETS = [
  {
    id: 'safe',
    label: 'Desconto Seguro',
    icon: '✅',
    description: 'Mantém 80% do lucro',
    percentage: 0.2, // 20% do lucro máximo
    color: '#10b981', // green
  },
  {
    id: 'competitive',
    label: 'Desconto Competitivo',
    icon: '⚖️',
    description: 'Mantém 50% do lucro',
    percentage: 0.5, // 50% do lucro máximo
    color: '#f59e0b', // orange
  },
  {
    id: 'aggressive',
    label: 'Desconto Agressivo',
    icon: '🔥',
    description: 'Mantém 20% do lucro',
    percentage: 0.8, // 80% do lucro máximo
    color: '#ef4444', // red
  },
  {
    id: 'breakeven',
    label: 'Ponto de Equilíbrio',
    icon: '⚠️',
    description: 'Lucro zero',
    percentage: 1.0, // 100% do lucro máximo
    color: '#dc2626', // dark red
  },
] as const;

/**
 * Visual metadata for display
 */
export const DISCOUNT_METADATA = {
  safe: {
    label: 'Zona Segura',
    description: 'Desconto mantém boa margem de lucro',
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
  },
  caution: {
    label: 'Zona de Atenção',
    description: 'Desconto reduz significativamente o lucro',
    icon: '⚠️',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-700',
  },
  danger: {
    label: 'Zona de Risco',
    description: 'Desconto muito alto, lucro mínimo',
    icon: '🔥',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
  },
  loss: {
    label: 'Zona de Prejuízo',
    description: 'Desconto causa prejuízo',
    icon: '🔴',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
  },
} as const;

/**
 * Competitive discount benchmarks by marketplace
 */
export const COMPETITIVE_DISCOUNTS = {
  mercadolivre: { min: 5, max: 15, average: 10 },
  shopee: { min: 10, max: 30, average: 20 },
  amazon: { min: 5, max: 20, average: 12 },
  magazineluiza: { min: 5, max: 15, average: 10 },
  americanas: { min: 10, max: 25, average: 15 },
  default: { min: 5, max: 20, average: 10 },
} as const;
