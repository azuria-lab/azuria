/**
 * Feature #5: Break-Even & ROI Calculator
 * Types for calculating break-even points and ROI projections
 */

/**
 * Input data for break-even and ROI calculations
 */
export interface BreakEvenInput {
  // Product pricing
  sellingPrice: number; // Preço de venda
  costPrice: number; // Custo do produto
  
  // Marketplace fees
  marketplace: string; // ID do marketplace
  marketplaceFeePercent: number; // Taxa do marketplace (%)
  shippingCost: number; // Custo de envio por unidade
  
  // Fixed costs
  monthlyFixedCosts: number; // Custos fixos mensais (aluguel, salários, etc)
  initialInvestment?: number; // Investimento inicial (opcional)
  
  // Sales projections
  averageDailySales?: number; // Vendas médias por dia (opcional)
  targetMonthlyProfit?: number; // Meta de lucro mensal (opcional)
}

/**
 * Break-even calculation result
 */
export interface BreakEvenResult {
  // Break-even point
  breakEvenUnits: number; // Unidades necessárias para break-even
  breakEvenRevenue: number; // Receita necessária para break-even
  breakEvenDays: number | null; // Dias até break-even (baseado em vendas médias)
  
  // Unit economics
  unitProfit: number; // Lucro por unidade (após todas as taxas)
  unitCost: number; // Custo total por unidade (produto + taxas + envio)
  profitMargin: number; // Margem de lucro (%)
  
  // ROI calculations
  roi: number | null; // ROI % (se investimento inicial fornecido)
  paybackPeriod: number | null; // Período de payback em meses
  monthlyROI: number | null; // ROI mensal %
  
  // Target achievement
  unitsForTarget: number | null; // Unidades para atingir meta de lucro
  daysForTarget: number | null; // Dias para atingir meta de lucro
  
  // Insights
  recommendations: string[];
  alerts: BreakEvenAlert[];
}

/**
 * Alert/warning messages
 */
export interface BreakEvenAlert {
  type: 'warning' | 'info' | 'success' | 'danger';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * ROI scenario comparison
 */
export interface ROIScenario {
  id: string;
  label: string;
  dailySales: number;
  result: BreakEvenResult;
  color: string;
}

/**
 * Time-based projection
 */
export interface TimeToBreakEven {
  days: number;
  units: number;
  revenue: number;
  profit: number;
  cumulativeProfit: number;
}

/**
 * Monthly projection with break-even tracking
 */
export interface MonthlyProjection {
  month: number;
  monthLabel: string;
  units: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeProfit: number;
  reachedBreakEven: boolean;
  roi: number;
}

/**
 * Break-even chart data point
 */
export interface BreakEvenChartData {
  units: number;
  revenue: number;
  totalCosts: number;
  profit: number;
  isBreakEven: boolean;
}

/**
 * Preset scenarios for quick analysis
 */
export const BREAK_EVEN_SCENARIOS = [
  {
    id: 'conservative',
    label: 'Conservador',
    icon: '🐢',
    description: '1-2 vendas/dia',
    dailySalesRange: [1, 2],
    color: '#3b82f6', // blue
  },
  {
    id: 'moderate',
    label: 'Moderado',
    icon: '🚶',
    description: '3-5 vendas/dia',
    dailySalesRange: [3, 5],
    color: '#8b5cf6', // purple
  },
  {
    id: 'optimistic',
    label: 'Otimista',
    icon: '🚀',
    description: '6-10 vendas/dia',
    dailySalesRange: [6, 10],
    color: '#10b981', // green
  },
  {
    id: 'aggressive',
    label: 'Agressivo',
    icon: '⚡',
    description: '10+ vendas/dia',
    dailySalesRange: [10, 20],
    color: '#f59e0b', // orange
  },
] as const;

/**
 * Visual metadata for display
 */
export const BREAK_EVEN_METADATA = {
  breakEvenUnits: {
    label: 'Ponto de Equilíbrio',
    description: 'Vendas necessárias para cobrir custos',
    icon: '🎯',
    color: 'blue',
  },
  unitProfit: {
    label: 'Lucro por Unidade',
    description: 'Quanto você ganha em cada venda',
    icon: '💰',
    color: 'green',
  },
  roi: {
    label: 'Retorno sobre Investimento',
    description: 'Percentual de retorno do capital investido',
    icon: '📈',
    color: 'purple',
  },
  paybackPeriod: {
    label: 'Período de Payback',
    description: 'Tempo para recuperar investimento',
    icon: '⏱️',
    color: 'orange',
  },
} as const;
