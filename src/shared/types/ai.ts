
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  startedAt: Date;
  status: 'active' | 'closed';
  context: Record<string, unknown>;
}

export interface MLPredictionResult {
  suggestedPrice: number;
  confidence: number;
  factors: {
    historical_trend: number;
    seasonality: number;
    competition: number;
    demand_elasticity: number;
    market_conditions: number;
  };
  reasoning: string;
  alternatives: Array<{
    price: number;
    scenario: string;
    probability: number;
  }>;
}

export interface PredictiveAnalysis {
  demandForecast: {
    next7Days: number[];
    next30Days: number[];
    confidence: number;
  };
  competitionTrends: {
    avgPriceChange: number;
    marketShare: number;
    threats: string[];
    opportunities: string[];
  };
  priceOptimization: {
    optimalPrice: number;
    expectedRevenue: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
  };
}

export interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'pricing' | 'strategy' | 'market' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  impact: number;
  implementation: string;
  dataPoints: string[];
}
