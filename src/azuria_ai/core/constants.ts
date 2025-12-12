/**
 * AI Constants - Constantes centralizadas para os engines da IA
 * 
 * Centraliza strings, thresholds e configurações para facilitar
 * manutenção e internacionalização futura.
 */

// ============================================================================
// Brand & Product
// ============================================================================

export const BRAND = {
  name: 'Azuria',
  tagline: 'Precificação Inteligente',
  domain: 'azuria.com.br',
} as const;

// ============================================================================
// Severity Levels
// ============================================================================

export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type SeverityLevel = (typeof SEVERITY)[keyof typeof SEVERITY];

// ============================================================================
// Confidence Thresholds
// ============================================================================

export const CONFIDENCE = {
  /** Abaixo disso, resultado não é confiável */
  MIN_ACCEPTABLE: 0.3,
  /** Limiar para considerar "confiável" */
  RELIABLE: 0.6,
  /** Limiar para considerar "alta confiança" */
  HIGH: 0.8,
  /** Confiança máxima */
  MAX: 1.0,
} as const;

// ============================================================================
// Performance Thresholds
// ============================================================================

export const PERFORMANCE = {
  /** Latência máxima aceitável para operações síncronas (ms) */
  MAX_SYNC_LATENCY_MS: 100,
  /** Latência máxima aceitável para operações assíncronas (ms) */
  MAX_ASYNC_LATENCY_MS: 5000,
  /** Taxa mínima de sucesso aceitável */
  MIN_SUCCESS_RATE: 0.95,
  /** Intervalo de tick do sistema (ms) */
  SYSTEM_TICK_MS: 30000,
} as const;

// ============================================================================
// User States
// ============================================================================

export const USER_STATE = {
  FRUSTRATED: 'frustrated',
  CONFUSED: 'confused',
  HESITANT: 'hesitant',
  CONFIDENT: 'confident',
  ENCOURAGED: 'encouraged',
  NEUTRAL: 'neutral',
} as const;

export type UserState = (typeof USER_STATE)[keyof typeof USER_STATE];

// ============================================================================
// Skill Levels
// ============================================================================

export const SKILL_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export type SkillLevel = (typeof SKILL_LEVEL)[keyof typeof SKILL_LEVEL];

// ============================================================================
// Engine Sources
// ============================================================================

export const ENGINE_SOURCE = {
  COGNITIVE: 'cognitiveEngine',
  GOVERNANCE: 'governanceEngine',
  SAFETY: 'safetyEngine',
  BRAND_VOICE: 'brandVoiceEngine',
  STORYTELLING: 'storytellingEngine',
  AFFECTIVE: 'affectiveEngine',
  ENGAGEMENT: 'engagementEngine',
  EVOLUTION: 'evolutionEngine',
  CREATOR: 'creatorEngine',
  ORCHESTRATOR: 'aiOrchestrator',
  TEMPORAL: 'temporalEngine',
  STRATEGIC: 'strategicEngine',
  PERCEPTION: 'perceptionEngine',
  TRUTH: 'truthEngine',
  REALITY: 'realityEngine',
  META: 'metaLayerEngine',
} as const;

export type EngineSource = (typeof ENGINE_SOURCE)[keyof typeof ENGINE_SOURCE];

// ============================================================================
// Alert Types
// ============================================================================

export const ALERT_TYPE = {
  ALERT: 'alert',
  INSIGHT: 'insight',
  RECOMMENDATION: 'recommendation',
  ROADMAP: 'roadmap',
  WARNING: 'warning',
} as const;

export type AlertType = (typeof ALERT_TYPE)[keyof typeof ALERT_TYPE];

// ============================================================================
// Risk Levels
// ============================================================================

export const RISK_LEVEL = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

export type RiskLevel = (typeof RISK_LEVEL)[keyof typeof RISK_LEVEL];

// ============================================================================
// Priority Levels
// ============================================================================

export const PRIORITY = {
  LOWEST: 1,
  LOW: 3,
  NORMAL: 5,
  HIGH: 7,
  HIGHEST: 10,
} as const;

// ============================================================================
// Messages (para i18n futura)
// ============================================================================

export const MESSAGES = {
  // Errors
  ERROR_GENERIC: 'Ocorreu um erro inesperado',
  ERROR_NETWORK: 'Erro de conexão. Verifique sua internet.',
  ERROR_UNAUTHORIZED: 'Acesso não autorizado',
  ERROR_VALIDATION: 'Dados inválidos',
  
  // Insights
  INSIGHT_OPPORTUNITY: 'Oportunidade identificada',
  INSIGHT_RISK: 'Risco detectado',
  INSIGHT_RECOMMENDATION: 'Recomendação',
  
  // Actions
  ACTION_REQUIRED: 'Ação necessária',
  ACTION_SUGGESTED: 'Sugestão de ação',
  ACTION_COMPLETED: 'Ação concluída',
  
  // States
  STATE_LOADING: 'Carregando...',
  STATE_PROCESSING: 'Processando...',
  STATE_READY: 'Pronto',
} as const;

// ============================================================================
// Calculator Defaults
// ============================================================================

export const CALC_DEFAULTS = {
  MIN_MARGIN: 0,
  MAX_MARGIN: 100,
  DEFAULT_MARGIN: 30,
  MIN_TAX: 0,
  MAX_TAX: 50,
  DEFAULT_TAX: 0,
} as const;

// ============================================================================
// Temporal Defaults
// ============================================================================

export const TEMPORAL = {
  /** Tempo máximo para cache de memória (ms) */
  MEMORY_CACHE_TTL_MS: 3600000, // 1 hora
  /** Intervalo de sync (ms) */
  SYNC_INTERVAL_MS: 60000, // 1 minuto
  /** Janela de análise de tendência (ms) */
  TREND_WINDOW_MS: 86400000, // 24 horas
} as const;
