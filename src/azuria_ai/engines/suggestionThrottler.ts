/**
 * SuggestionThrottler - Motor de Controle de Frequência de Sugestões
 *
 * Este engine é responsável por:
 * - Controlar a taxa de sugestões mostradas ao usuário
 * - Implementar cooldowns inteligentes baseados em contexto
 * - Prevenir fadiga de sugestões
 * - Priorizar sugestões baseado em urgência e relevância
 *
 * @module azuria_ai/engines/suggestionThrottler
 */

import type {
  Suggestion,
  SuggestionPriority,
  SuggestionType,
  ThrottleRules,
  UserContext,
} from '../types/operational';
import { eventBus } from '../core/eventBus';

// ============================================================================
// Constants
// ============================================================================

/** Janela de tempo para contagem de sugestões (1 minuto) */
const MINUTE_WINDOW_MS = 60000;

/** Janela de tempo para contagem por tipo (1 hora) */
const HOUR_WINDOW_MS = 3600000;

/** Cooldown padrão após dismiss (ms) */
const DEFAULT_DISMISS_COOLDOWN = 30000;

/** Duração do silêncio durante digitação (ms) */
const TYPING_SILENCE_DURATION = 5000;

/** Duração do silêncio após erro (ms) */
const DEFAULT_ERROR_SILENCE_DURATION = 10000;

// ============================================================================
// Types
// ============================================================================

/** Registro de sugestão mostrada */
interface SuggestionRecord {
  /** ID da sugestão */
  id: string;
  /** Tipo da sugestão */
  type: SuggestionType;
  /** Prioridade */
  priority: SuggestionPriority;
  /** Quando foi mostrada */
  shownAt: number;
  /** Se foi dismissed */
  dismissed: boolean;
  /** Se foi aceita */
  accepted: boolean;
  /** Tela onde foi mostrada */
  screen: string;
}

/** Resultado da avaliação de throttle */
export interface ThrottleResult {
  /** Se a sugestão pode ser mostrada */
  allowed: boolean;
  /** Razão se bloqueada */
  reason?: string;
  /** Tempo estimado até poder mostrar (ms) */
  waitTime?: number;
  /** Prioridade ajustada */
  adjustedPriority?: SuggestionPriority;
}

/** Estado do throttler */
interface ThrottlerState {
  initialized: boolean;
  rules: ThrottleRules;
  history: SuggestionRecord[];
  lastDismissAt: number;
  lastErrorAt: number;
  lastTypingAt: number;
  silencedUntil: number;
  userContext: UserContext | null;
  pendingQueue: Suggestion[];
}

/** Configuração adaptativa baseada em comportamento */
interface AdaptiveConfig {
  /** Multiplicador de cooldown baseado em dismisses */
  cooldownMultiplier: number;
  /** Threshold dinâmico de sugestões por minuto */
  dynamicMaxPerMinute: number;
  /** Se deve reduzir sugestões proativas */
  reduceProactive: boolean;
}

// ============================================================================
// Default Rules
// ============================================================================

const DEFAULT_RULES: ThrottleRules = {
  maxPerMinute: 3,
  maxSameTypePerHour: 5,
  dismissCooldown: DEFAULT_DISMISS_COOLDOWN,
  silenceWhileTyping: true,
  silenceAfterError: true,
  errorSilenceDuration: DEFAULT_ERROR_SILENCE_DURATION,
};

// ============================================================================
// Engine State
// ============================================================================

const state: ThrottlerState = {
  initialized: false,
  rules: { ...DEFAULT_RULES },
  history: [],
  lastDismissAt: 0,
  lastErrorAt: 0,
  lastTypingAt: 0,
  silencedUntil: 0,
  userContext: null,
  pendingQueue: [],
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Inicializa o SuggestionThrottler
 */
export function initThrottler(rules?: Partial<ThrottleRules>): void {
  if (state.initialized) {
    return;
  }

  state.rules = { ...DEFAULT_RULES, ...rules };
  state.history = [];
  state.pendingQueue = [];
  state.lastDismissAt = 0;
  state.lastErrorAt = 0;
  state.lastTypingAt = 0;
  state.silencedUntil = 0;

  // Subscribe to events
  setupEventListeners();

  state.initialized = true;
}

/**
 * Encerra o SuggestionThrottler
 */
export function shutdownThrottler(): void {
  state.initialized = false;
  state.history = [];
  state.pendingQueue = [];
  state.userContext = null;
}

/**
 * Atualiza regras de throttle
 */
export function updateThrottleRules(rules: Partial<ThrottleRules>): void {
  state.rules = { ...state.rules, ...rules };
}

/**
 * Atualiza contexto do usuário (para decisões adaptativas)
 */
export function updateThrottlerContext(context: UserContext): void {
  state.userContext = context;
}

// ============================================================================
// Throttle Evaluation Helpers
// ============================================================================

/**
 * Verifica se o período de silêncio forçado está ativo
 */
function checkForcedSilence(now: number): ThrottleResult | null {
  if (now < state.silencedUntil) {
    return {
      allowed: false,
      reason: 'Silenced period active',
      waitTime: state.silencedUntil - now,
    };
  }
  return null;
}

/**
 * Verifica se o usuário está digitando e se deve silenciar
 */
function checkTypingSilence(now: number): ThrottleResult | null {
  if (state.rules.silenceWhileTyping && isTyping(now)) {
    return {
      allowed: false,
      reason: 'User is typing',
      waitTime: TYPING_SILENCE_DURATION - (now - state.lastTypingAt),
    };
  }
  return null;
}

/**
 * Verifica cooldown após dismiss
 */
function checkDismissCooldown(now: number, suggestion: Suggestion): ThrottleResult | null {
  if (now - state.lastDismissAt < state.rules.dismissCooldown) {
    if (suggestion.priority !== 'critical') {
      return {
        allowed: false,
        reason: 'Dismiss cooldown active',
        waitTime: state.rules.dismissCooldown - (now - state.lastDismissAt),
      };
    }
  }
  return null;
}

/**
 * Verifica silêncio após erro
 */
function checkErrorSilence(now: number, suggestion: Suggestion): ThrottleResult | null {
  if (
    state.rules.silenceAfterError &&
    now - state.lastErrorAt < state.rules.errorSilenceDuration
  ) {
    if (suggestion.type !== 'correction' && suggestion.priority !== 'critical') {
      return {
        allowed: false,
        reason: 'Error silence period',
        waitTime: state.rules.errorSilenceDuration - (now - state.lastErrorAt),
      };
    }
  }
  return null;
}

/**
 * Verifica limite de sugestões por minuto
 */
function checkRateLimit(
  now: number,
  suggestion: Suggestion,
  recentSuggestions: SuggestionRecord[],
  adaptiveConfig: AdaptiveConfig
): ThrottleResult | null {
  if (recentSuggestions.length >= adaptiveConfig.dynamicMaxPerMinute) {
    if (suggestion.priority !== 'critical') {
      const oldestRecent = recentSuggestions[0];
      return {
        allowed: false,
        reason: 'Rate limit reached',
        waitTime: oldestRecent.shownAt + MINUTE_WINDOW_MS - now,
      };
    }
  }
  return null;
}

/**
 * Verifica limite de sugestões do mesmo tipo por hora
 */
function checkSameTypeLimit(
  now: number,
  suggestion: Suggestion,
  sameTypeSuggestions: SuggestionRecord[]
): ThrottleResult | null {
  if (sameTypeSuggestions.length >= state.rules.maxSameTypePerHour) {
    if (suggestion.priority !== 'critical') {
      const oldestSameType = sameTypeSuggestions[0];
      return {
        allowed: false,
        reason: `Too many ${suggestion.type} suggestions`,
        waitTime: oldestSameType.shownAt + HOUR_WINDOW_MS - now,
      };
    }
  }
  return null;
}

/**
 * Verifica se sugestões proativas devem ser reduzidas
 */
function checkProactiveReduction(
  suggestion: Suggestion,
  adaptiveConfig: AdaptiveConfig
): ThrottleResult | null {
  if (
    adaptiveConfig.reduceProactive &&
    suggestion.type === 'proactive' &&
    suggestion.priority !== 'critical'
  ) {
    return {
      allowed: false,
      reason: 'Proactive suggestions reduced based on user behavior',
    };
  }
  return null;
}

// ============================================================================
// Throttle Evaluation
// ============================================================================

/**
 * Verifica se uma sugestão pode ser mostrada
 */
export function canShowSuggestion(suggestion: Suggestion): ThrottleResult {
  const now = Date.now();

  // 1. Verificar silêncio forçado
  const forcedSilenceResult = checkForcedSilence(now);
  if (forcedSilenceResult) {
    return forcedSilenceResult;
  }

  // 2. Verificar silêncio durante digitação
  const typingSilenceResult = checkTypingSilence(now);
  if (typingSilenceResult) {
    return typingSilenceResult;
  }

  // 3. Verificar cooldown após dismiss
  const dismissCooldownResult = checkDismissCooldown(now, suggestion);
  if (dismissCooldownResult) {
    return dismissCooldownResult;
  }

  // 4. Verificar silêncio após erro
  const errorSilenceResult = checkErrorSilence(now, suggestion);
  if (errorSilenceResult) {
    return errorSilenceResult;
  }

  // 5. Verificar limite por minuto
  const recentSuggestions = getSuggestionsInWindow(MINUTE_WINDOW_MS);
  const adaptiveConfig = getAdaptiveConfig();
  const rateLimitResult = checkRateLimit(now, suggestion, recentSuggestions, adaptiveConfig);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // 6. Verificar limite por tipo por hora
  const sameTypeSuggestions = getSuggestionsOfTypeInWindow(suggestion.type, HOUR_WINDOW_MS);
  const sameTypeLimitResult = checkSameTypeLimit(now, suggestion, sameTypeSuggestions);
  if (sameTypeLimitResult) {
    return sameTypeLimitResult;
  }

  // 7. Verificar estado de atividade do usuário
  const activityCheck = checkActivityState(suggestion);
  if (!activityCheck.allowed) {
    return activityCheck;
  }

  // 8. Verificar se usuário não quer sugestões proativas
  const proactiveResult = checkProactiveReduction(suggestion, adaptiveConfig);
  if (proactiveResult) {
    return proactiveResult;
  }

  // Sugestão permitida
  return {
    allowed: true,
    adjustedPriority: adjustPriority(suggestion),
  };
}

/**
 * Registra que uma sugestão foi mostrada
 */
export function recordSuggestionShown(suggestion: Suggestion): void {
  const record: SuggestionRecord = {
    id: suggestion.id,
    type: suggestion.type,
    priority: suggestion.priority,
    shownAt: Date.now(),
    dismissed: false,
    accepted: false,
    screen: suggestion.context?.screen ?? 'unknown',
  };

  state.history.push(record);

  // Manter apenas últimas 100 sugestões
  if (state.history.length > 100) {
    state.history = state.history.slice(-100);
  }
}

/**
 * Registra que uma sugestão foi dismissed
 */
export function recordSuggestionDismissed(suggestionId: string): void {
  const record = state.history.find((r) => r.id === suggestionId);
  if (record) {
    record.dismissed = true;
  }

  state.lastDismissAt = Date.now();

  // Aumentar cooldown se muitos dismisses recentes
  const recentDismisses = state.history
    .filter((r) => r.dismissed && Date.now() - r.shownAt < MINUTE_WINDOW_MS * 5)
    .length;

  if (recentDismisses >= 3) {
    // Aplicar cooldown estendido temporário
    state.silencedUntil = Date.now() + state.rules.dismissCooldown * 2;
  }
}

/**
 * Registra que uma sugestão foi aceita
 */
export function recordSuggestionAccepted(suggestionId: string): void {
  const record = state.history.find((r) => r.id === suggestionId);
  if (record) {
    record.accepted = true;
  }
}

/**
 * Registra atividade de digitação
 */
export function recordTypingActivity(): void {
  state.lastTypingAt = Date.now();
}

/**
 * Registra ocorrência de erro
 */
export function recordErrorOccurrence(): void {
  state.lastErrorAt = Date.now();
}

/**
 * Silencia sugestões por um período
 */
export function silenceSuggestions(durationMs: number): void {
  state.silencedUntil = Date.now() + durationMs;

  eventBus.emit('user:copilot-disabled', { reason: 'manual_silence', duration: durationMs });
}

/**
 * Remove silenciamento
 */
export function unsilenceSuggestions(): void {
  state.silencedUntil = 0;

  eventBus.emit('user:copilot-enabled', { reason: 'manual_unsilence' });
}

// ============================================================================
// Queue Management
// ============================================================================

/**
 * Adiciona sugestão à fila de espera
 */
export function queueSuggestion(suggestion: Suggestion): void {
  // Verificar se já existe na fila
  if (state.pendingQueue.some((s) => s.id === suggestion.id)) {
    return;
  }

  state.pendingQueue.push(suggestion);

  // Ordenar por prioridade
  state.pendingQueue.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Limitar tamanho da fila
  if (state.pendingQueue.length > 10) {
    state.pendingQueue = state.pendingQueue.slice(0, 10);
  }
}

/**
 * Obtém próxima sugestão da fila que pode ser mostrada
 */
export function getNextAllowedSuggestion(): Suggestion | null {
  for (let i = 0; i < state.pendingQueue.length; i++) {
    const suggestion = state.pendingQueue[i];
    const result = canShowSuggestion(suggestion);

    if (result.allowed) {
      // Remover da fila
      state.pendingQueue.splice(i, 1);
      return suggestion;
    }
  }

  return null;
}

/**
 * Limpa a fila de sugestões
 */
export function clearQueue(): void {
  state.pendingQueue = [];
}

/**
 * Obtém tamanho da fila
 */
export function getQueueSize(): number {
  return state.pendingQueue.length;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Obtém estatísticas de throttling
 */
export function getThrottleStats(): {
  suggestionsLastMinute: number;
  suggestionsLastHour: number;
  dismissRate: number;
  acceptRate: number;
  isSilenced: boolean;
  adaptiveConfig: AdaptiveConfig;
} {
  const now = Date.now();
  const lastMinute = getSuggestionsInWindow(MINUTE_WINDOW_MS);
  const lastHour = getSuggestionsInWindow(HOUR_WINDOW_MS);

  const totalRecent = lastHour.length;
  const dismissedRecent = lastHour.filter((r) => r.dismissed).length;
  const acceptedRecent = lastHour.filter((r) => r.accepted).length;

  return {
    suggestionsLastMinute: lastMinute.length,
    suggestionsLastHour: totalRecent,
    dismissRate: totalRecent > 0 ? dismissedRecent / totalRecent : 0,
    acceptRate: totalRecent > 0 ? acceptedRecent / totalRecent : 0,
    isSilenced: now < state.silencedUntil,
    adaptiveConfig: getAdaptiveConfig(),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getSuggestionsInWindow(windowMs: number): SuggestionRecord[] {
  const cutoff = Date.now() - windowMs;
  return state.history.filter((r) => r.shownAt >= cutoff);
}

function getSuggestionsOfTypeInWindow(
  type: SuggestionType,
  windowMs: number
): SuggestionRecord[] {
  const cutoff = Date.now() - windowMs;
  return state.history.filter((r) => r.type === type && r.shownAt >= cutoff);
}

function isTyping(now: number): boolean {
  return now - state.lastTypingAt < TYPING_SILENCE_DURATION;
}

function getAdaptiveConfig(): AdaptiveConfig {
  const recentHistory = getSuggestionsInWindow(HOUR_WINDOW_MS);
  const dismissed = recentHistory.filter((r) => r.dismissed).length;
  const total = recentHistory.length;

  // Taxa de dismiss
  const dismissRate = total > 0 ? dismissed / total : 0;

  // Ajustar baseado em comportamento
  let cooldownMultiplier = 1;
  let dynamicMaxPerMinute = state.rules.maxPerMinute;
  let reduceProactive = false;

  if (dismissRate > 0.7) {
    // Usuário não está gostando das sugestões
    cooldownMultiplier = 2;
    dynamicMaxPerMinute = Math.max(1, state.rules.maxPerMinute - 1);
    reduceProactive = true;
  } else if (dismissRate > 0.5) {
    cooldownMultiplier = 1.5;
    dynamicMaxPerMinute = Math.max(2, state.rules.maxPerMinute - 1);
    reduceProactive = true;
  } else if (dismissRate < 0.2 && total > 5) {
    // Usuário está aceitando bem
    cooldownMultiplier = 0.75;
    dynamicMaxPerMinute = Math.min(5, state.rules.maxPerMinute + 1);
  }

  // Ajustar baseado em skill level do usuário
  if (state.userContext?.skillLevel === 'expert') {
    dynamicMaxPerMinute = Math.max(1, dynamicMaxPerMinute - 1);
    reduceProactive = true;
  } else if (state.userContext?.skillLevel === 'beginner') {
    dynamicMaxPerMinute = Math.min(5, dynamicMaxPerMinute + 1);
  }

  return {
    cooldownMultiplier,
    dynamicMaxPerMinute,
    reduceProactive,
  };
}

function checkActivityState(suggestion: Suggestion): ThrottleResult {
  if (!state.userContext) {
    return { allowed: true };
  }

  const activityState = state.userContext.activityState;

  // Não interromper durante cálculo (exceto para correções/warnings)
  if (activityState === 'calculating') {
    if (suggestion.type !== 'correction' && suggestion.type !== 'warning') {
      return {
        allowed: false,
        reason: 'User is calculating',
      };
    }
  }

  // Não interromper durante preenchimento de formulário (exceto para dicas relacionadas)
  if (activityState === 'filling-form') {
    if (
      suggestion.type !== 'hint' &&
      suggestion.type !== 'correction' &&
      suggestion.priority !== 'critical'
    ) {
      return {
        allowed: false,
        reason: 'User is filling a form',
      };
    }
  }

  // Durante erro, priorizar sugestões de ajuda
  if (activityState === 'error-state') {
    if (suggestion.type !== 'correction' && suggestion.priority !== 'critical') {
      // Reduzir mas não bloquear
      return {
        allowed: true,
        adjustedPriority: 'low',
      };
    }
  }

  return { allowed: true };
}

function adjustPriority(suggestion: Suggestion): SuggestionPriority {
  let priority = suggestion.priority;

  // Aumentar prioridade se usuário está hesitando e sugestão é relevante
  if (
    state.userContext?.activityState === 'hesitating' &&
    (suggestion.type === 'hint' || suggestion.type === 'explanation')
  ) {
    if (priority === 'low') {priority = 'medium';}
    if (priority === 'medium') {priority = 'high';}
  }

  // Aumentar prioridade se usuário está em estado de erro
  if (
    state.userContext?.activityState === 'error-state' &&
    suggestion.type === 'correction'
  ) {
    priority = 'high';
  }

  // Reduzir prioridade de sugestões proativas para experts
  if (
    state.userContext?.skillLevel === 'expert' &&
    suggestion.type === 'proactive'
  ) {
    if (priority === 'high') {priority = 'medium';}
    if (priority === 'medium') {priority = 'low';}
  }

  return priority;
}

function setupEventListeners(): void {
  // Escutar eventos de input para detectar digitação
  eventBus.on('user:input', (event) => {
    const data = event.payload as { interactionType?: string; event?: string };
    if (
      data.interactionType === 'input' ||
      data.event === 'keypress'
    ) {
      recordTypingActivity();
    }
  });

  // Escutar eventos de erro
  eventBus.on('user:error', () => {
    recordErrorOccurrence();
  });

  // Escutar eventos de sugestão
  eventBus.on('user:suggestion-dismissed', (event) => {
    const { suggestionId } = event.payload as { suggestionId: string };
    recordSuggestionDismissed(suggestionId);
  });

  eventBus.on('user:suggestion-accepted', (event) => {
    const { suggestionId } = event.payload as { suggestionId: string };
    recordSuggestionAccepted(suggestionId);
  });

  // Escutar eventos de contexto
  eventBus.on('user:context-updated', (event) => {
    const { context } = event.payload as { context: UserContext };
    if (context) {
      updateThrottlerContext(context);
    }
  });
}

// ============================================================================
// Exports
// ============================================================================

export const suggestionThrottler = {
  init: initThrottler,
  shutdown: shutdownThrottler,
  updateRules: updateThrottleRules,
  updateContext: updateThrottlerContext,
  canShow: canShowSuggestion,
  recordShown: recordSuggestionShown,
  recordDismissed: recordSuggestionDismissed,
  recordAccepted: recordSuggestionAccepted,
  recordTyping: recordTypingActivity,
  recordError: recordErrorOccurrence,
  silence: silenceSuggestions,
  unsilence: unsilenceSuggestions,
  queue: queueSuggestion,
  getNext: getNextAllowedSuggestion,
  clearQueue,
  getQueueSize,
  getStats: getThrottleStats,
};

export default suggestionThrottler;
