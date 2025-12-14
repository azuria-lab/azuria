/**
 * AdaptiveActions Engine - Motor de Ações Adaptativas
 *
 * Este engine é responsável por:
 * - Adaptar ações ao contexto do usuário e sistema
 * - Ajustar comportamento baseado em feedback histórico
 * - Otimizar timing e delivery de ações
 * - Personalizar intensidade de intervenções
 * - Aprender preferências de interação
 *
 * @module azuria_ai/engines/adaptiveActionsEngine
 */

import { eventBus } from '../core/eventBus';
import { structuredLogger } from '../../services/structuredLogger';

// ============================================================================
// Constants
// ============================================================================

/** Tempo mínimo entre ações adaptativas (ms) */
const MIN_ACTION_INTERVAL = 5000;

/** Máximo de ações adaptativas por sessão */
const MAX_ACTIONS_PER_SESSION = 20;

/** Threshold de confiança mínima para executar ação */
const MIN_CONFIDENCE_THRESHOLD = 0.6;

/** Período de aprendizado inicial (ms) */
const LEARNING_PERIOD = 300000; // 5 minutos

/** Decay factor para feedback antigo */
const FEEDBACK_DECAY = 0.95;

// ============================================================================
// Types
// ============================================================================

/** Tipo de ação adaptativa */
export type AdaptiveActionType =
  | 'suggestion' // Sugestão contextual
  | 'automation' // Automação de tarefa
  | 'optimization' // Otimização de processo
  | 'assistance' // Assistência proativa
  | 'notification' // Notificação inteligente
  | 'correction' // Correção preventiva
  | 'enhancement' // Melhoria de UX
  | 'personalization'; // Personalização de interface

/** Intensidade da ação */
export type ActionIntensity = 'subtle' | 'moderate' | 'prominent' | 'urgent';

/** Timing da ação */
export type ActionTiming = 'immediate' | 'opportune' | 'delayed' | 'scheduled';

/** Contexto da ação */
export interface ActionContext {
  /** ID do usuário */
  userId?: string;
  /** Tela/página atual */
  screen: string;
  /** Estado da sessão */
  sessionState: 'active' | 'idle' | 'focused' | 'distracted';
  /** Tempo na tela atual (ms) */
  timeOnScreen: number;
  /** Ações recentes do usuário */
  recentActions: string[];
  /** Nível de habilidade detectado */
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  /** Preferências conhecidas */
  preferences?: Record<string, unknown>;
  /** Timestamp */
  timestamp: number;
}

/** Ação adaptativa */
export interface AdaptiveAction {
  /** ID único */
  id: string;
  /** Tipo de ação */
  type: AdaptiveActionType;
  /** Título/descrição curta */
  title: string;
  /** Descrição detalhada */
  description: string;
  /** Intensidade */
  intensity: ActionIntensity;
  /** Timing */
  timing: ActionTiming;
  /** Confiança (0-1) */
  confidence: number;
  /** Contexto que gerou a ação */
  context: ActionContext;
  /** Payload da ação */
  payload?: Record<string, unknown>;
  /** Callbacks opcionais */
  onExecute?: () => void | Promise<void>;
  onCancel?: () => void;
  /** Timestamp de criação */
  createdAt: number;
  /** Timestamp de execução (se executada) */
  executedAt?: number;
  /** Status */
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
}

/** Feedback sobre ação */
export interface ActionFeedback {
  /** ID da ação */
  actionId: string;
  /** Tipo de feedback */
  type: 'accepted' | 'rejected' | 'ignored' | 'helpful' | 'not_helpful';
  /** Tempo até feedback (ms) */
  responseTime: number;
  /** Comentário opcional */
  comment?: string;
  /** Timestamp */
  timestamp: number;
}

/** Regra de adaptação */
export interface AdaptationRule {
  /** ID da regra */
  id: string;
  /** Condição (função que retorna boolean) */
  condition: (context: ActionContext) => boolean;
  /** Ação a ser tomada */
  action: Partial<AdaptiveAction>;
  /** Prioridade */
  priority: number;
  /** Se está ativa */
  enabled: boolean;
  /** Histórico de sucesso */
  successRate: number;
  /** Número de vezes executada */
  executionCount: number;
}

/** Configuração do engine */
export interface AdaptiveActionsConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Intervalo mínimo entre ações (ms) */
  minActionInterval: number;
  /** Máximo de ações por sessão */
  maxActionsPerSession: number;
  /** Confiança mínima para executar */
  minConfidence: number;
  /** Se está em período de aprendizado */
  learningMode: boolean;
  /** Tipos de ação habilitados */
  enabledActionTypes: AdaptiveActionType[];
}

/** Estado do engine */
interface AdaptiveActionsState {
  initialized: boolean;
  config: AdaptiveActionsConfig;
  actions: AdaptiveAction[];
  feedback: ActionFeedback[];
  rules: AdaptationRule[];
  lastActionAt: number;
  sessionActionCount: number;
  context: ActionContext | null;
}

// ============================================================================
// State
// ============================================================================

const state: AdaptiveActionsState = {
  initialized: false,
  config: {
    enabled: true,
    minActionInterval: MIN_ACTION_INTERVAL,
    maxActionsPerSession: MAX_ACTIONS_PER_SESSION,
    minConfidence: MIN_CONFIDENCE_THRESHOLD,
    learningMode: true,
    enabledActionTypes: ['suggestion', 'assistance', 'optimization', 'personalization'],
  },
  actions: [],
  feedback: [],
  rules: [],
  lastActionAt: 0,
  sessionActionCount: 0,
  context: null,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gera ID único para ação
 */
function generateActionId(): string {
  return `action-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calcula score de adaptação baseado em feedback
 */
function calculateAdaptationScore(actionType: AdaptiveActionType): number {
  const relevantFeedback = state.feedback.filter((f) => {
    const action = state.actions.find((a) => a.id === f.actionId);
    return action?.type === actionType;
  });

  if (relevantFeedback.length === 0) {return 0.5;} // Neutro se sem feedback

  let score = 0;
  let totalWeight = 0;

  relevantFeedback.forEach((fb, index) => {
    // Feedback mais recente tem mais peso
    const recency = Math.pow(FEEDBACK_DECAY, relevantFeedback.length - index - 1);

    let feedbackScore: number;
    if (fb.type === 'accepted' || fb.type === 'helpful') {
      feedbackScore = 1;
    } else if (fb.type === 'rejected' || fb.type === 'not_helpful') {
      feedbackScore = 0;
    } else {
      feedbackScore = 0.5;
    }

    score += feedbackScore * recency;
    totalWeight += recency;
  });

  return totalWeight > 0 ? score / totalWeight : 0.5;
}

/**
 * Determina intensidade ideal baseado em contexto
 */
function determineIntensity(
  context: ActionContext,
  baseIntensity: ActionIntensity
): ActionIntensity {
  // Reduzir intensidade se usuário está focado
  if (context.sessionState === 'focused') {
    return 'subtle';
  }

  // Aumentar intensidade se usuário está distraído
  if (context.sessionState === 'distracted') {
    return 'prominent';
  }

  // Usuários iniciantes podem precisar de mais guidance
  if (context.skillLevel === 'beginner' && baseIntensity === 'subtle') {
    return 'moderate';
  }

  // Experts preferem menos intrusão
  if (context.skillLevel === 'expert' && baseIntensity === 'prominent') {
    return 'moderate';
  }

  return baseIntensity;
}

/**
 * Determina timing ideal baseado em contexto
 */
function determineTiming(context: ActionContext, baseTiming: ActionTiming): ActionTiming {
  // Se usuário está idle, é momento oportuno
  if (context.sessionState === 'idle') {
    return 'opportune';
  }

  // Se muito tempo na mesma tela, pode ser momento de sugerir algo
  if (context.timeOnScreen > 60000 && baseTiming === 'delayed') {
    // 1 minuto
    return 'opportune';
  }

  // Se está ativo e focado, adiar para não interromper
  if (context.sessionState === 'focused' && baseTiming === 'immediate') {
    return 'delayed';
  }

  return baseTiming;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Atualiza contexto atual
 */
export function updateContext(context: Partial<ActionContext>): void {
  state.context = {
    ...state.context,
    ...context,
    timestamp: Date.now(),
  } as ActionContext;

  eventBus.emit('data:updated', {
    source: 'adaptiveActionsEngine',
    data: {
      context: state.context,
    },
  });
}

/**
 * Cria uma ação adaptativa
 */
export function createAdaptiveAction(
  input: Omit<AdaptiveAction, 'id' | 'createdAt' | 'status'>
): AdaptiveAction {
  if (!state.initialized || !state.config.enabled) {
    throw new Error('AdaptiveActionsEngine not initialized or disabled');
  }

  // Verificar throttling
  const now = Date.now();
  const timeSinceLastAction = now - state.lastActionAt;

  if (timeSinceLastAction < state.config.minActionInterval) {
    throw new Error('Action throttled - too soon since last action');
  }

  // Verificar limite de sessão
  if (state.sessionActionCount >= state.config.maxActionsPerSession) {
    throw new Error('Session action limit reached');
  }

  // Verificar confiança mínima
  if (input.confidence < state.config.minConfidence) {
    throw new Error(`Confidence too low: ${input.confidence} < ${state.config.minConfidence}`);
  }

  // Adaptar intensidade e timing
  const adaptedIntensity = determineIntensity(input.context, input.intensity);
  const adaptedTiming = determineTiming(input.context, input.timing);

  const action: AdaptiveAction = {
    ...input,
    id: generateActionId(),
    intensity: adaptedIntensity,
    timing: adaptedTiming,
    createdAt: now,
    status: 'pending',
  };

  state.actions.push(action);
  state.lastActionAt = now;
  state.sessionActionCount++;

  eventBus.emit('user:action', {
    action: 'adaptive:action-created',
    data: {
      actionData: action,
    },
  });

  structuredLogger.info('[AdaptiveActions] Action created', {
    action: 'create',
    data: {
      type: action.type,
      intensity: action.intensity,
      timing: action.timing,
      confidence: action.confidence,
    },
  });

  return action;
}

/**
 * Executa uma ação adaptativa
 */
export async function executeAction(actionId: string): Promise<void> {
  const action = state.actions.find((a) => a.id === actionId);

  if (!action) {
    throw new Error(`Action not found: ${actionId}`);
  }

  if (action.status !== 'pending') {
    throw new Error(`Action already ${action.status}: ${actionId}`);
  }

  try {
    // Executar callback se existir
    if (action.onExecute) {
      await action.onExecute();
    }

    action.status = 'executed';
    action.executedAt = Date.now();

    eventBus.emit('user:action', {
      action: 'adaptive:action-executed',
      data: {
        actionData: action,
      },
    });

    structuredLogger.info('[AdaptiveActions] Action executed', {
      action: 'execute',
      data: {
        actionId,
        type: action.type,
      },
    });
  } catch (error) {
    action.status = 'failed';

    eventBus.emit('error:occurred', {
      source: 'adaptiveActionsEngine',
      data: {
        actionId: action.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    structuredLogger.error(
      '[AdaptiveActions] Action execution failed',
      error instanceof Error ? error : new Error(String(error)),
      {
        action: 'execute',
        data: {
          actionId,
        },
      }
    );

    throw error;
  }
}

/**
 * Cancela uma ação
 */
export function cancelAction(actionId: string): void {
  const action = state.actions.find((a) => a.id === actionId);

  if (!action) {
    throw new Error(`Action not found: ${actionId}`);
  }

  if (action.status !== 'pending') {
    throw new Error(`Cannot cancel action with status: ${action.status}`);
  }

  if (action.onCancel) {
    action.onCancel();
  }

  action.status = 'cancelled';

  eventBus.emit('user:action', {
    action: 'adaptive:action-cancelled',
    data: {
      actionData: action,
    },
  });

  structuredLogger.info('[AdaptiveActions] Action cancelled', {
    action: 'cancel',
    data: {
      actionId,
      type: action.type,
    },
  });
}

/**
 * Registra feedback sobre uma ação
 */
export function recordFeedback(feedback: Omit<ActionFeedback, 'timestamp'>): void {
  const action = state.actions.find((a) => a.id === feedback.actionId);

  if (!action) {
    throw new Error(`Action not found: ${feedback.actionId}`);
  }

  const fullFeedback: ActionFeedback = {
    ...feedback,
    timestamp: Date.now(),
  };

  state.feedback.push(fullFeedback);

  // Atualizar regras de adaptação baseado no feedback
  updateAdaptationRules(action, fullFeedback);

  eventBus.emit('agent:feedback', {
    source: 'adaptiveActionsEngine',
    data: {
      feedback: fullFeedback,
    },
  });

  structuredLogger.info('[AdaptiveActions] Feedback recorded', {
    action: 'feedback',
    data: {
      actionId: feedback.actionId,
      type: feedback.type,
      responseTime: feedback.responseTime,
    },
  });
}

/**
 * Atualiza regras de adaptação baseado em feedback
 */
function updateAdaptationRules(action: AdaptiveAction, _feedback: ActionFeedback): void {
  // Calcular novo score de adaptação para este tipo de ação
  const newScore = calculateAdaptationScore(action.type);

  // Ajustar confiança mínima se necessário
  if (state.config.learningMode) {
    if (newScore < 0.3) {
      // Muitos feedbacks negativos, aumentar threshold
      state.config.minConfidence = Math.min(0.9, state.config.minConfidence + 0.05);
      structuredLogger.info('[AdaptiveActions] Increased confidence threshold', {
        action: 'adjust-threshold',
        data: {
          newThreshold: state.config.minConfidence,
        },
      });
    } else if (newScore > 0.8) {
      // Muitos feedbacks positivos, pode relaxar threshold
      state.config.minConfidence = Math.max(0.5, state.config.minConfidence - 0.05);
      structuredLogger.info('[AdaptiveActions] Decreased confidence threshold', {
        action: 'adjust-threshold',
        data: {
          newThreshold: state.config.minConfidence,
        },
      });
    }
  }
}

/**
 * Adiciona regra de adaptação
 */
export function addAdaptationRule(rule: Omit<AdaptationRule, 'executionCount' | 'successRate'>): void {
  const fullRule: AdaptationRule = {
    ...rule,
    executionCount: 0,
    successRate: 0,
  };

  state.rules.push(fullRule);

  structuredLogger.info('[AdaptiveActions] Rule added', {
    action: 'add-rule',
    data: {
      ruleId: rule.id,
      priority: rule.priority,
    },
  });
}

/**
 * Avalia e executa regras aplicáveis
 */
export async function evaluateRules(): Promise<void> {
  if (!state.context) {
    return;
  }

  const applicableRules = state.rules
    .filter((rule) => rule.enabled && rule.condition(state.context))
    .sort((a, b) => b.priority - a.priority);

  for (const rule of applicableRules) {
    try {
      const action = createAdaptiveAction({
        ...rule.action,
        context: state.context,
      } as Omit<AdaptiveAction, 'id' | 'createdAt' | 'status'>);

      await executeAction(action.id);

      rule.executionCount++;
      break; // Executar apenas uma regra por avaliação
    } catch (error) {
      structuredLogger.warn('[AdaptiveActions] Rule evaluation failed', {
        action: 'evaluate-rule',
        data: {
          ruleId: rule.id,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}

/**
 * Obtém ações pendentes
 */
export function getPendingActions(): AdaptiveAction[] {
  return state.actions.filter((a) => a.status === 'pending');
}

/**
 * Obtém histórico de ações
 */
export function getActionHistory(limit: number = 50): AdaptiveAction[] {
  return state.actions
    .filter((a) => a.status !== 'pending')
    .sort((a, b) => (b.executedAt || b.createdAt) - (a.executedAt || a.createdAt))
    .slice(0, limit);
}

/**
 * Obtém estatísticas de adaptação
 */
export function getAdaptationStats(): {
  totalActions: number;
  actionsByType: Record<AdaptiveActionType, number>;
  successRate: number;
  avgResponseTime: number;
  topPerformingTypes: AdaptiveActionType[];
} {
  const actionsByType = state.actions.reduce(
    (acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    },
    {} as Record<AdaptiveActionType, number>
  );

  const feedbackWithActions = state.feedback.filter((f) =>
    state.actions.find((a) => a.id === f.actionId)
  );

  const successCount = feedbackWithActions.filter(
    (f) => f.type === 'accepted' || f.type === 'helpful'
  ).length;
  const successRate = feedbackWithActions.length > 0 ? successCount / feedbackWithActions.length : 0;

  const avgResponseTime =
    feedbackWithActions.length > 0
      ? feedbackWithActions.reduce((sum, f) => sum + f.responseTime, 0) / feedbackWithActions.length
      : 0;

  // Calcular tipos com melhor performance
  const typeScores = Object.keys(actionsByType).map((type) => ({
    type: type as AdaptiveActionType,
    score: calculateAdaptationScore(type as AdaptiveActionType),
  }));

  const sortedTypeScores = [...typeScores].sort((a, b) => b.score - a.score);
  const topPerformingTypes = sortedTypeScores
    .slice(0, 3)
    .map((t) => t.type);

  return {
    totalActions: state.actions.length,
    actionsByType,
    successRate,
    avgResponseTime,
    topPerformingTypes,
  };
}

// ============================================================================
// Engine Management
// ============================================================================

/**
 * Inicializa o AdaptiveActionsEngine
 */
export function initAdaptiveActions(config?: Partial<AdaptiveActionsConfig>): void {
  if (state.initialized) {
    structuredLogger.debug('[AdaptiveActions] Already initialized, skipping');
    return;
  }

  if (config) {
    state.config = { ...state.config, ...config };
  }

  // Após período de aprendizado, desativar learning mode
  if (state.config.learningMode) {
    setTimeout(() => {
      state.config.learningMode = false;
      structuredLogger.info('[AdaptiveActions] Learning period ended');
    }, LEARNING_PERIOD);
  }

  // Resetar contador de sessão
  state.sessionActionCount = 0;

  state.initialized = true;

  eventBus.emit('system:init', {
    source: 'adaptiveActionsEngine',
    data: {
      config: state.config,
    },
  });

  structuredLogger.info('[AdaptiveActions] Initialized', {
    module: 'AdaptiveActionsEngine',
    data: {
      enabled: state.config.enabled,
      learningMode: state.config.learningMode,
    },
  });
}

/**
 * Obtém estado atual do engine
 */
export function getAdaptiveActionsState(): {
  initialized: boolean;
  config: AdaptiveActionsConfig;
  pendingActions: number;
  totalActions: number;
  feedbackCount: number;
  rulesCount: number;
} {
  return {
    initialized: state.initialized,
    config: state.config,
    pendingActions: state.actions.filter((a) => a.status === 'pending').length,
    totalActions: state.actions.length,
    feedbackCount: state.feedback.length,
    rulesCount: state.rules.length,
  };
}

/**
 * Limpa histórico antigo
 */
export function clearOldHistory(olderThanDays: number = 30): void {
  const threshold = Date.now() - olderThanDays * 86400000;

  const beforeActions = state.actions.length;
  state.actions = state.actions.filter((a) => a.createdAt > threshold);

  const beforeFeedback = state.feedback.length;
  state.feedback = state.feedback.filter((f) => f.timestamp > threshold);

  structuredLogger.info('[AdaptiveActions] Old history cleared', {
    action: 'clear-history',
    data: {
      actionsRemoved: beforeActions - state.actions.length,
      feedbackRemoved: beforeFeedback - state.feedback.length,
    },
  });
}

/**
 * Shutdown do engine
 */
export function shutdownAdaptiveActions(): void {
  // Cancelar todas as ações pendentes
  state.actions.filter((a) => a.status === 'pending').forEach((a) => {
    try {
      cancelAction(a.id);
    } catch (e) {
      // Log error during shutdown cleanup but continue with other actions
      structuredLogger.warn('[AdaptiveActions] Failed to cancel action during shutdown', {
        action: 'shutdown-cleanup',
        data: {
          actionId: a.id,
          errorMessage: e instanceof Error ? e.message : String(e),
        },
      });
    }
  });

  state.initialized = false;
  state.actions = [];
  state.feedback = [];
  state.rules = [];
  state.context = null;

  eventBus.emit('system:shutdown', {
    source: 'adaptiveActionsEngine',
  });

  structuredLogger.info('[AdaptiveActions] Shut down', {
    module: 'AdaptiveActionsEngine',
  });
}

// ============================================================================
// Export
// ============================================================================

export default {
  initAdaptiveActions,
  updateContext,
  createAdaptiveAction,
  executeAction,
  cancelAction,
  recordFeedback,
  addAdaptationRule,
  evaluateRules,
  getPendingActions,
  getActionHistory,
  getAdaptationStats,
  getAdaptiveActionsState,
  clearOldHistory,
  shutdownAdaptiveActions,
};
