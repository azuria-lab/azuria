/**
 * Types for Scenario Simulator Feature
 * Allows users to test different pricing scenarios and compare results
 */

export interface ScenarioInput {
  // Scenario identification
  id: string;
  name: string;
  color: string;
  
  // Product costs (from base calculation)
  cost: number;
  
  // Variable parameters (what users can change)
  targetMargin: number;
  shipping: number;
  packaging: number;
  marketing: number;
  otherCosts: number;
  
  // Sales projections
  monthlyVolume?: number;
  
  // Marketplace settings
  marketplace: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
  includePaymentFee: boolean;
}

export interface ScenarioResult {
  id: string;
  name: string;
  color: string;
  
  // Calculated values
  finalPrice: number;
  effectiveMargin: number;
  netProfit: number;
  totalFees: number;
  
  // Per-unit breakdown
  unitCost: number;
  unitFees: number;
  unitProfit: number;
  
  // Monthly projections (if volume provided)
  monthlyRevenue?: number;
  monthlyProfit?: number;
  monthlyFees?: number;
  
  // ROI metrics
  roi?: number;
  breakEvenUnits?: number;
}

export interface ScenarioComparison {
  scenarios: ScenarioResult[];
  bestScenario: ScenarioResult;
  worstScenario: ScenarioResult;
  
  // Comparative insights
  priceDifference: {
    min: number;
    max: number;
    range: number;
  };
  
  profitDifference: {
    min: number;
    max: number;
    range: number;
  };
  
  insights: string[];
}

export interface ScenarioTemplate {
  name: string;
  description: string;
  icon: string;
  adjustments: {
    targetMargin?: number;
    shipping?: number;
    marketing?: number;
  };
}

// Preset scenario templates
export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    name: "Conservador",
    description: "Margem alta, custos controlados",
    icon: "🛡️",
    adjustments: {
      targetMargin: 40,
      marketing: 5,
    },
  },
  {
    name: "Agressivo",
    description: "Margem baixa, alto volume",
    icon: "🚀",
    adjustments: {
      targetMargin: 20,
      marketing: 15,
    },
  },
  {
    name: "Premium",
    description: "Margem alta, investimento em marketing",
    icon: "💎",
    adjustments: {
      targetMargin: 50,
      marketing: 20,
    },
  },
  {
    name: "Competitivo",
    description: "Equilíbrio entre margem e competitividade",
    icon: "⚖️",
    adjustments: {
      targetMargin: 30,
      marketing: 10,
    },
  },
];

export const SCENARIO_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];
