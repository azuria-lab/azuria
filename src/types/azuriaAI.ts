/**
 * Azuria AI Types
 * 
 * Tipos e interfaces para a assistente inteligente Azuria
 */

// ============================================
// ENUMS
// ============================================

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  PRICING_SUGGESTION = 'pricing_suggestion',
  TAX_ANALYSIS = 'tax_analysis',
  COMPETITOR_ALERT = 'competitor_alert',
  MARGIN_WARNING = 'margin_warning',
  SUCCESS_CELEBRATION = 'success_celebration',
}

export enum AIContext {
  PRICING = 'pricing',
  TAX = 'tax',
  COMPETITOR = 'competitor',
  GENERAL = 'general',
  MARKETPLACE = 'marketplace',
}

// ============================================
// INTERFACES
// ============================================

/**
 * Mensagem do chat
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  context?: AIContext;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Sugestão de precificação da IA
 */
export interface PricingSuggestion {
  suggested_price: number;
  current_price?: number;
  cost_price: number;
  profit_margin: number;
  profit_margin_percentage: number;
  reasoning: string;
  confidence: number; // 0-100
  alternatives: {
    competitive_price: number;
    premium_price: number;
    minimum_price: number;
  };
}

/**
 * Análise tributária
 */
export interface TaxAnalysis {
  regime: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
  effective_rate: number;
  tax_amount: number;
  breakdown: {
    label: string;
    rate: number;
    amount: number;
  }[];
  optimization_tips: string[];
  alternative_regime_comparison?: {
    regime: string;
    rate: number;
    savings: number;
    recommendation: string;
  };
}

/**
 * Dados de concorrente
 */
export interface CompetitorData {
  competitor_name: string;
  product_name: string;
  current_price: number;
  last_checked: Date;
  price_trend: 'rising' | 'falling' | 'stable';
  source_url: string;
  confidence_score: number;
}

/**
 * Alerta de concorrente
 */
export interface CompetitorAlert {
  type: 'price_too_high' | 'price_too_low' | 'market_trend' | 'opportunity';
  message: string;
  competitor: CompetitorData;
  suggested_action: string;
  urgency: 'low' | 'medium' | 'high';
  // Legacy fields for compatibility
  product_name?: string;
  competitor_name?: string;
  competitor_price?: number;
  your_price?: number;
  price_difference?: number;
  price_difference_percentage?: number;
  recommendation?: string;
}

/**
 * Análise de margem
 */
export interface MarginAnalysis {
  product_name: string;
  current_margin: number;
  target_margin: number;
  is_healthy: boolean;
  issues: string[];
  suggestions: string[];
  potential_savings: {
    description: string;
    amount: number;
  }[];
}

/**
 * Contexto da conversa
 */
export interface ConversationContext {
  user_id: string;
  session_id: string;
  recent_products?: Array<{
    id: string;
    name: string;
    price?: number;
    cost?: number;
  }>;
  recent_calculations?: Array<{
    id: string;
    productName: string;
    marketplace: string;
    finalPrice: number;
    margin: number;
    createdAt: Date;
  }>;
  user_preferences?: {
    tax_regime?: string;
    target_margin?: number;
    marketplaces?: string[];
  };
}

/**
 * Request para a IA
 */
export interface AIRequest {
  message: string;
  context: ConversationContext;
  history: ChatMessage[];
  intent?: AIContext;
}

/**
 * Response da IA
 */
export interface AIResponse {
  message: string;
  type: MessageType;
  context: AIContext;
  data?: PricingSuggestion | TaxAnalysis | CompetitorAlert | MarginAnalysis;
  suggestions?: string[];
  quick_actions?: {
    label: string;
    action: string;
    icon?: string;
  }[];
}

/**
 * Configuração da Azuria AI
 */
export interface AzuriaConfig {
  model: 'gemini-1.5-flash' | 'gemini-1.5-pro';
  temperature: number;
  max_tokens: number;
  language: 'pt-BR';
  personality: {
    friendly: boolean;
    professional: boolean;
    emoji_usage: 'none' | 'minimal' | 'moderate' | 'frequent';
  };
}

/**
 * Histórico de conversas
 */
export interface ChatHistory {
  id: string;
  user_id: string;
  session_id: string;
  messages: ChatMessage[];
  started_at: Date;
  last_message_at: Date;
  context: AIContext;
}

