export interface MarketAnalysis {
  competitorAvgPrice: number;
  demandElasticity: number;
  seasonalFactor: number; // 0-1
  priceOpportunity: string;
}

export interface AIRecommendation {
  quantity: number;
  suggestedPrice: number;
  confidence: number; // percentage 0-100
  reasoning: string;
}

export interface AIInsightsData {
  marketAnalysis: MarketAnalysis;
  aiRecommendations: AIRecommendation[];
  optimalQuantities?: number[];
  recommendedDiscounts?: number[];
}

export interface ScenarioResult {
  scenario: string;
  price: number;
  margin: number;
  demandImpact: number;
}

export interface BatchItem {
  id: string;
  quantity: number;
  unitCost: number;
  discountPercent: number;
  targetMargin: number;
  aiSuggestedPrice?: number;
  competitivePrice?: number;
  scenarioResults?: ScenarioResult[];
}
