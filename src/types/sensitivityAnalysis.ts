/**
 * Types for Sensitivity Analysis Feature
 * Shows how changes in variables affect profitability
 */

export type VariableType = 'cost' | 'margin' | 'volume' | 'shipping' | 'marketing' | 'fees';

export interface VariableImpact {
  variable: VariableType;
  label: string;
  icon: string;
  baseValue: number;
  unit: 'currency' | 'percentage' | 'units';
  
  // Impact analysis for different scenarios
  scenarios: ScenarioPoint[];
  
  // Summary metrics
  elasticity: number; // How sensitive profit is to this variable
  risk: 'low' | 'medium' | 'high';
  riskExplanation: string;
}

export interface ScenarioPoint {
  change: number; // % change from base (-50 to +50)
  value: number; // Actual value after change
  profit: number; // Resulting profit per unit
  profitChange: number; // % change in profit
  priceImpact: number; // How much final price changes
}

export interface SensitivityAnalysisInput {
  // Current pricing
  cost: number;
  targetMargin: number;
  finalPrice: number;
  currentProfit: number;
  
  // Operational costs
  shipping: number;
  packaging: number;
  marketing: number;
  otherCosts: number;
  
  // Marketplace
  marketplace: string;
  marketplaceFee: number;
  paymentFee: number;
  
  // Volume (optional)
  monthlyVolume?: number;
}

export interface SensitivityAnalysisResult {
  variables: VariableImpact[];
  mostSensitive: VariableImpact; // Variable with highest elasticity
  leastSensitive: VariableImpact; // Variable with lowest elasticity
  recommendations: string[];
  breakEvenPoints: BreakEvenPoint[];
}

export interface BreakEvenPoint {
  variable: VariableType;
  maxIncrease: number; // Maximum % increase before profit = 0
  maxDecrease: number; // Maximum % decrease before profit = 0
  criticalValue: number; // The exact value at break-even
}

// Preset scenarios for quick analysis
export const SENSITIVITY_SCENARIOS = [
  { label: 'Pessimista', change: 20, icon: '📉' },
  { label: 'Leve Alta', change: 10, icon: '📈' },
  { label: 'Base', change: 0, icon: '⚖️' },
  { label: 'Leve Queda', change: -10, icon: '📉' },
  { label: 'Otimista', change: -20, icon: '📈' },
];

// Variable metadata
export const VARIABLE_METADATA: Record<VariableType, { label: string; icon: string; color: string }> = {
  cost: {
    label: 'Custo do Produto',
    icon: '💰',
    color: 'red',
  },
  margin: {
    label: 'Margem Desejada',
    icon: '📊',
    color: 'blue',
  },
  volume: {
    label: 'Volume de Vendas',
    icon: '📦',
    color: 'green',
  },
  shipping: {
    label: 'Custo de Frete',
    icon: '🚚',
    color: 'orange',
  },
  marketing: {
    label: 'Investimento em Marketing',
    icon: '📣',
    color: 'purple',
  },
  fees: {
    label: 'Taxas do Marketplace',
    icon: '🏪',
    color: 'amber',
  },
};
