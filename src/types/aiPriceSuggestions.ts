/**
 * Types for AI Price Suggestions Feature
 * Prepares structure for future Azuria AI integration
 */

export type PricingStrategy = 'conservative' | 'competitive' | 'premium' | 'ai-recommended';

export interface PriceSuggestion {
  strategy: PricingStrategy;
  label: string;
  icon: string;
  description: string;
  suggestedPrice: number;
  rationale: SuggestionRationale;
  confidence: number; // 0-100 (will come from AI)
  expectedOutcome: ExpectedOutcome;
  color: string;
}

export interface SuggestionRationale {
  marketPosition: string;
  conversionExpectation: string;
  profitExpectation: string;
  competitiveAnalysis: string;
  risks: string[];
  opportunities: string[];
}

export interface ExpectedOutcome {
  conversionRate: number; // Estimated %
  monthlyRevenue?: number; // If volume provided
  monthlyProfit?: number; // If volume provided
  roi?: number;
  breakEvenDays?: number;
}

export interface PriceSuggestionInput {
  cost: number;
  targetMargin: number;
  shipping: number;
  packaging: number;
  marketing: number;
  otherCosts: number;
  marketplace: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
  includePaymentFee: boolean;
  monthlyVolume?: number;
  
  // Context for future AI (optional now)
  productCategory?: string;
  competitorPrices?: number[];
  seasonality?: 'high' | 'normal' | 'low';
  brandStrength?: 'unknown' | 'emerging' | 'established' | 'premium';
}

export interface AzuriaAIConfig {
  // Future: API endpoints and config for Azuria AI
  enabled: boolean;
  apiEndpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Preset confidence levels (will be replaced by real AI scores)
export const CONFIDENCE_LEVELS = {
  HIGH: { min: 80, label: 'Alta Confiança', color: 'text-green-600' },
  MEDIUM: { min: 60, label: 'Confiança Moderada', color: 'text-yellow-600' },
  LOW: { min: 0, label: 'Baixa Confiança', color: 'text-orange-600' },
};

// Strategy metadata
export const STRATEGY_METADATA: Record<PricingStrategy, { icon: string; color: string; tagline: string }> = {
  conservative: {
    icon: '🛡️',
    color: 'blue',
    tagline: 'Máxima Conversão',
  },
  competitive: {
    icon: '⚖️',
    color: 'purple',
    tagline: 'Equilíbrio Perfeito',
  },
  premium: {
    icon: '💎',
    color: 'amber',
    tagline: 'Máxima Margem',
  },
  'ai-recommended': {
    icon: '🤖',
    color: 'green',
    tagline: 'Recomendação Azuria AI',
  },
};
