/**
 * Event Payloads - Tipagem forte para payloads do EventBus
 * 
 * Define interfaces específicas para cada categoria de evento,
 * permitindo type-safety em tempo de desenvolvimento.
 */

// ============================================================================
// Base Types
// ============================================================================

export interface BasePayload {
  /** Origem do evento */
  source?: string;
  /** Timestamp adicional se necessário */
  originTimestamp?: number;
}

// ============================================================================
// Calculation Events
// ============================================================================

export interface CalcPayload extends BasePayload {
  cost?: number;
  margin?: number;
  tax?: number;
  shipping?: number;
  result?: {
    sellPrice?: number;
    profit?: number;
    profitMargin?: number;
  };
  calculatorType?: 'simple' | 'advanced' | 'bid' | 'tax';
}

export interface ScenarioPayload extends BasePayload {
  scenarioId?: string;
  scenarioName?: string;
  parameters?: Record<string, number>;
  results?: Record<string, number>;
}

export interface TaxPayload extends BasePayload {
  regime?: string;
  aliquotaICMS?: number;
  valorICMS?: number;
  baseCalculoST?: number;
  valorST?: number;
  mva?: number;
  ncm?: string;
  ufOrigem?: string;
  ufDestino?: string;
}

export interface BidPayload extends BasePayload {
  bidId?: string;
  baseValue?: number;
  discount?: number;
  finalValue?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

// ============================================================================
// AI Events
// ============================================================================

export interface AIInsightPayload extends BasePayload {
  type?: 'risk' | 'opportunity' | 'recommendation' | 'forecast';
  message: string;
  confidence?: number;
  data?: Record<string, unknown>;
  suggestedAction?: string;
}

export interface AIStatePayload extends BasePayload {
  previousState?: string;
  currentState?: string;
  stateData?: Record<string, unknown>;
}

export interface AIEmotionPayload extends BasePayload {
  emotion: 'frustrated' | 'confident' | 'confused' | 'hesitant' | 'encouraged' | 'neutral';
  intensity?: number;
  triggers?: string[];
}

export interface AIPatternPayload extends BasePayload {
  patternType: string;
  patternId?: string;
  frequency?: number;
  significance?: number;
  description?: string;
}

export interface AIGovernancePayload extends BasePayload {
  decision?: string;
  isValid?: boolean;
  violations?: string[];
  correctionApplied?: boolean;
  auditTrail?: string[];
}

export interface AISafetyPayload extends BasePayload {
  reason: string;
  blocked?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
}

// ============================================================================
// Agent Events
// ============================================================================

export interface AgentPayload extends BasePayload {
  agentId?: string;
  agentType?: string;
  action?: string;
  result?: unknown;
  performance?: {
    latency?: number;
    accuracy?: number;
    confidence?: number;
  };
}

export interface AgentFeedbackPayload extends BasePayload {
  agentId?: string;
  feedbackType?: 'positive' | 'negative' | 'correction';
  context?: Record<string, unknown>;
  adjustment?: Record<string, unknown>;
}

// ============================================================================
// UI Events
// ============================================================================

export interface UIPayload extends BasePayload {
  screen?: string;
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
}

export interface UIAdaptivePayload extends BasePayload {
  layout?: string;
  emotion?: string;
  adaptations?: string[];
  userPreferences?: Record<string, unknown>;
}

// ============================================================================
// User Events
// ============================================================================

export interface UserActionPayload extends BasePayload {
  actionType: string;
  target?: string;
  value?: unknown;
  metadata?: Record<string, unknown>;
}

export interface UserProfilePayload extends BasePayload {
  userId?: string;
  traits?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  behaviorPatterns?: string[];
}

// ============================================================================
// System Events
// ============================================================================

export interface SystemPayload extends BasePayload {
  eventType?: string;
  details?: Record<string, unknown>;
}

export interface ErrorPayload extends BasePayload {
  error: string | Error;
  code?: string;
  stack?: string;
  context?: Record<string, unknown>;
  recoverable?: boolean;
}

// ============================================================================
// Creator Events (Modo Deus)
// ============================================================================

export interface CreatorAlertPayload extends BasePayload {
  area?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  originEngine?: string;
  confidence?: number;
  suggestedAction?: string;
  data?: Record<string, unknown>;
}

export interface CreatorInsightPayload extends BasePayload {
  type: 'insight' | 'recommendation' | 'roadmap';
  title?: string;
  message: string;
  priority?: number;
  actionable?: boolean;
  metrics?: Record<string, number>;
}

// ============================================================================
// Evolution Events
// ============================================================================

export interface EvolutionPayload extends BasePayload {
  evolutionType?: 'learning' | 'pattern' | 'insight' | 'memory';
  score?: number;
  delta?: number;
  patches?: string[];
  weaknesses?: string[];
}

// ============================================================================
// Payload Map - Maps EventType to Payload type
// ============================================================================

import type { EventType } from './eventBus';

/**
 * Mapa de tipos de evento para seus payloads correspondentes.
 * Usar com genéricos para type-safety.
 */
export type EventPayloadMap = {
  // Calculation
  'calc:started': CalcPayload;
  'calc:completed': CalcPayload;
  'calc:updated': CalcPayload;
  'scenario:updated': ScenarioPayload;
  'fees:updated': CalcPayload;
  'tax:updated': TaxPayload;
  'icms:updated': TaxPayload;
  'st:updated': TaxPayload;
  'bid:updated': BidPayload;
  'risk:updated': AIInsightPayload;
  'discount:updated': BidPayload;

  // Screen/UI
  'screen:changed': UIPayload;
  'screen:dataUpdated': UIPayload;
  'ui:changed': UIPayload;
  'ui:actionClicked': UIPayload;
  'ui:displayInsight': AIInsightPayload;
  'ui:emotion-updated': UIAdaptivePayload;
  'ui:adaptive-layout': UIAdaptivePayload;

  // User
  'user:action': UserActionPayload;
  'data:updated': SystemPayload;
  'error:occurred': ErrorPayload;

  // AI Core
  'insight:generated': AIInsightPayload;
  'ai:predictive-insight': AIInsightPayload;
  'ai:detected-risk': AIInsightPayload;
  'ai:detected-opportunity': AIInsightPayload;
  'ai:recommended-action': AIInsightPayload;
  'ai:memory-updated': AIStatePayload;
  'ai:pattern-detected': AIPatternPayload;
  'ai:forecast-generated': AIInsightPayload;
  'ai:anomaly-detected': AIPatternPayload;
  'ai:state-changed': AIStatePayload;

  // AI Emotion
  'ai:user-intent-inferred': UserProfilePayload;
  'ai:emotion-inferred': AIEmotionPayload;
  'ai:user-profile-updated': UserProfilePayload;
  'ai:emotion-detected': AIEmotionPayload;
  'ai:affective-response': AIEmotionPayload;
  'ai:user-frustrated': AIEmotionPayload;
  'ai:user-confident': AIEmotionPayload;
  'ai:user-confused': AIEmotionPayload;
  'ai:user-hesitant': AIEmotionPayload;
  'ai:user-encouraged': AIEmotionPayload;

  // AI Governance
  'ai:governance-alert': AIGovernancePayload;
  'ai:coherence-warning': AIGovernancePayload;
  'ai:decision-validated': AIGovernancePayload;
  'ai:decision-valid': AIGovernancePayload;
  'ai:decision-invalid': AIGovernancePayload;
  'ai:decision-corrected': AIGovernancePayload;
  'ai:action-executed': AIGovernancePayload;
  'ai:governance-violation': AIGovernancePayload;
  'ai:audited-decision': AIGovernancePayload;

  // AI Safety
  'ai:unsafe-output-blocked': AISafetyPayload;
  'ai:ethical-warning': AISafetyPayload;
  'ai:alignment-corrected': AISafetyPayload;
  'ai:safety-break': AISafetyPayload;

  // AI Internal
  'ai:internal-drift': AIStatePayload;
  'ai:model-confidence': AIStatePayload;
  'ai:signal-quality': AIStatePayload;
  'ai:consistency-warning': AIStatePayload;
  'ai:system-drift': AIStatePayload;
  'ai:dependency-gap': AIStatePayload;
  'ai:stability-restored': AIStatePayload;
  'ai:stability-alert': AIStatePayload;
  'ai:internal-insight': AIInsightPayload;
  'ai:contradiction-detected': AIPatternPayload;
  'ai:explainable-decision': AIGovernancePayload;
  'ai:virtual-signal': AIStatePayload;
  'ai:context-reconstructed': AIStatePayload;
  'ai:silent-failure-detected': ErrorPayload;
  'ai:anomaly-behavior-detected': AIPatternPayload;

  // AI Planner
  'ai:planner-goal-evaluated': AIStatePayload;
  'ai:planner-plan-generated': AIStatePayload;
  'ai:planner-plan-executed': AIStatePayload;
  'ai:planner-plan-adjusted': AIStatePayload;
  'ai:strategic-plan-generated': AIStatePayload;
  'ai:structural-risk-detected': AIInsightPayload;
  'ai:long-term-goal-defined': AIStatePayload;
  'ai:system-health-updated': AIStatePayload;
  'ai:strategic-conflict-detected': AIGovernancePayload;

  // Evolution
  'ai:evolution-scan': EvolutionPayload;
  'ai:evolution-weakness-found': EvolutionPayload;
  'ai:evolution-patch-proposed': EvolutionPayload;
  'ai:evolution-score-updated': EvolutionPayload;
  'ai:core-sync': AIStatePayload;

  // Temporal
  'ai:temporal-event': AIStatePayload;
  'ai:trend-detected': AIPatternPayload;
  'ai:future-state-predicted': AIInsightPayload;
  'ai:temporal-anomaly': AIPatternPayload;

  // Performance
  'ai:perf-alert': ErrorPayload;
  'ai:fallback-engaged': AIStatePayload;

  // Business
  'ai:pricing-opportunity': AIInsightPayload;
  'ai:churn-risk': AIInsightPayload;
  'ai:upgrade-opportunity': AIInsightPayload;
  'ai:market-insight': AIInsightPayload;

  // Engagement
  'ai:engagement-progress': AIStatePayload;
  'ai:engagement-drop-detected': AIPatternPayload;
  'ai:achievement-unlocked': AIStatePayload;
  'ai:user-motivation-level': AIEmotionPayload;
  'ai:next-best-action': AIInsightPayload;

  // Storytelling
  'ai:story-generated': AIInsightPayload;
  'ai:story-clarified': AIInsightPayload;
  'ai:story-educational': AIInsightPayload;
  'ai:story-commercial': AIInsightPayload;
  'ai:brand-voice-applied': AIStatePayload;
  'ai:persona-adapted': AIStatePayload;
  'ai:tone-shift': AIStatePayload;
  'ai:communication-optimized': AIStatePayload;

  // Mind
  'ai:mind-snapshot': AIStatePayload;
  'ai:mind-warning': AISafetyPayload;
  'ai:reality-updated': AIStatePayload;
  'ai:truth-alert': AISafetyPayload;
  'ai:personality-escalation': AIStatePayload;
  'ai:meta-layer-updated': AIStatePayload;
  'ai:nim-response': AIStatePayload;
  'ui:adaptive-interface-changed': UIAdaptivePayload;

  // Creator (Modo Deus)
  'ai:creator-alert': CreatorAlertPayload;
  'ai:creator-insight': CreatorInsightPayload;
  'ai:creator-recommendation': CreatorInsightPayload;
  'ai:creator-roadmap': CreatorInsightPayload;

  // UX
  'ai:behavior-pattern-detected': AIPatternPayload;
  'ai:ux-friction-detected': AIPatternPayload;
  'ai:autofix-suggested': AIInsightPayload;
  'ai:autofix-applied': AIStatePayload;
  'ai:positive-pattern-detected': AIPatternPayload;
  'ai:flow-abandon-point': AIPatternPayload;
  'ai:ux-optimized': AIStatePayload;

  // Agent
  'agent:feedback': AgentFeedbackPayload;
  'agent:performance-shift': AgentPayload;
  'agent:heuristic-updated': AgentPayload;
  'agent:auto-tuned': AgentPayload;
  'agent:anomaly-detected': AgentPayload;
  'agent:tax-warning': AgentPayload;
  'agent:tax-correction-suggested': AgentPayload;
  'agent:optimal-price': AgentPayload;
  'agent:margin-risk': AgentPayload;
  'agent:competitive-price': AgentPayload;
  'agent:listing-issue': AgentPayload;
  'agent:risk-detected': AgentPayload;
  'agent:loss-predicted': AgentPayload;
  'agent:opportunity-found': AgentPayload;
  'agent:boost-suggested': AgentPayload;
  'agent:called': AgentPayload;

  // System
  'system:tick': SystemPayload;
};

/**
 * Helper type para obter o payload de um tipo de evento
 */
export type PayloadFor<T extends EventType> = T extends keyof EventPayloadMap
  ? EventPayloadMap[T]
  : Record<string, unknown>;

/**
 * Tipo genérico para evento tipado
 */
export interface TypedAzuriaEvent<T extends EventType = EventType> {
  tipo: T;
  payload: PayloadFor<T>;
  timestamp: number;
  source?: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}
