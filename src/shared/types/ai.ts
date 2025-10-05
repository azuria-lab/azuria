// ============================================
// CHAT & MESSAGING TYPES
// ============================================

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'user' | 'ai';
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
    data?: {
      actions?: AIAction[];
    };
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  startedAt: Date;
  updatedAt?: Date;
  status: 'active' | 'closed';
  context: Record<string, unknown>;
}

// ============================================
// AI CONFIGURATION TYPES
// ============================================

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface AIContext {
  userId: string;
  businessProfile?: BusinessProfile;
  conversationHistory: ChatMessage[];
  preferences: Record<string, unknown>;
}

export interface AIAction {
  id: string;
  label: string;
  type: 'navigation' | 'calculation' | 'analysis' | 'suggestion';
  handler: string;
  params?: Record<string, unknown>;
}

// ============================================
// BUSINESS & TAX TYPES
// ============================================

export interface BusinessProfile {
  id: string;
  name: string;
  cnpj?: string;
  businessType: 'comercio' | 'industria' | 'servicos' | 'misto';
  taxRegime: TaxRegimeType;
  monthlyRevenue: number;
  averageMargin: number;
  employeeCount?: number;
  stateRegistration?: string;
  foundedDate?: Date;
}

export enum TaxRegimeType {
  SIMPLES_NACIONAL = 'simples_nacional',
  LUCRO_PRESUMIDO = 'lucro_presumido',
  LUCRO_REAL = 'lucro_real',
  MEI = 'mei'
}

export interface TaxRegime {
  id: string;
  name: string;
  description: string;
  type: TaxRegimeType;
  applicableToProduct: boolean;
  applicableToService: boolean;
  rates: {
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    issqn?: number;
    icms?: number;
  };
}

export interface TaxAnalysis {
  regime: TaxRegimeType;
  effectiveRate: number;
  monthlyTax: number;
  annualTax: number;
  breakdown: { [key: string]: number };
  recommendations: string[];
  potentialSavings?: number;
  warnings?: string[];
}

export interface AIAlert {
  id: string;
  type: 'price_change' | 'competitor_alert' | 'tax_opportunity' | 'market_trend';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  actionable: boolean;
  suggestedAction?: string;
}

// ============================================
// COMPETITOR & PRICING TYPES
// ============================================

export enum CompetitorPlatform {
  MERCADO_LIVRE = 'mercado_livre',
  SHOPEE = 'shopee',
  AMAZON = 'amazon',
  MAGAZINE_LUIZA = 'magazine_luiza',
  AMERICANAS = 'americanas',
  CARREFOUR = 'carrefour',
  CASAS_BAHIA = 'casas_bahia',
  OUTROS = 'outros'
}

export interface CompetitorPricing {
  id: string;
  platform: CompetitorPlatform;
  productName: string;
  price: number;
  url?: string;
  seller?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  shippingCost?: number;
  estimatedSales?: number;
  lastUpdated: Date;
}

export interface PricingAnalysis {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  profitMargin: number;
  explanation: string;
  confidence: number;
  factors: {
    cost: number;
    taxes: number;
    fees: number;
    margin: number;
  };
  recommendations: string[];
  warnings?: string[];
}

// ============================================
// ML & PREDICTION TYPES
// ============================================

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
