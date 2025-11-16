/**
 * AI Insights Types
 * 
 * Tipos para sistema de inteligência artificial do marketplace
 */

export interface PriceRecommendation {
  productId: string;
  productName: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  confidence: number;
  reasoning: string[];
  marketData: {
    competitorAvg: number;
    marketLow: number;
    marketHigh: number;
    competitorCount: number;
  };
  impact: {
    expectedSalesIncrease: number;
    expectedRevenueChange: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface SalesPrediction {
  productId: string;
  productName: string;
  period: '7d' | '30d' | '90d';
  predictions: {
    date: string;
    predictedSales: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
  }[];
  trend: 'increasing' | 'stable' | 'decreasing';
  seasonality: {
    detected: boolean;
    pattern?: string;
    peakMonths?: number[];
  };
  accuracy: number;
}

export interface CategorySuggestion {
  productId: string;
  productName: string;
  currentCategory?: string;
  suggestedCategories: {
    category: string;
    subcategory?: string;
    confidence: number;
    reasoning: string;
    marketplaceSpecific: Record<string, string>;
  }[];
  keywords: string[];
  attributes: Record<string, string>;
}

export interface SalesOpportunity {
  id: string;
  type: 'price_optimization' | 'stock_alert' | 'trend_detected' | 'competitor_gap' | 'seasonal_boost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  products: string[];
  metrics: {
    potentialRevenue?: number;
    estimatedImpact?: number;
    timeframe?: string;
  };
  action: {
    type: 'adjust_price' | 'restock' | 'promote' | 'expand_listing';
    instructions: string[];
    automatable: boolean;
  };
  detectedAt: string;
  expiresAt?: string;
}

export interface AIInsightsReport {
  generatedAt: string;
  marketplace: string;
  summary: {
    totalOpportunities: number;
    potentialRevenue: number;
    avgConfidence: number;
    topRecommendation: string;
  };
  priceRecommendations: PriceRecommendation[];
  predictions: SalesPrediction[];
  categorySuggestions: CategorySuggestion[];
  opportunities: SalesOpportunity[];
}

export interface AIModelConfig {
  priceOptimization: {
    enabled: boolean;
    minConfidence: number;
    maxPriceChange: number;
    considerCompetitors: boolean;
    considerDemand: boolean;
  };
  salesPrediction: {
    enabled: boolean;
    horizon: number;
    updateFrequency: 'hourly' | 'daily' | 'weekly';
  };
  categoryClassification: {
    enabled: boolean;
    autoApply: boolean;
    minConfidence: number;
  };
  opportunityDetection: {
    enabled: boolean;
    minPriority: 'low' | 'medium' | 'high';
    notifyOnDetection: boolean;
  };
}
