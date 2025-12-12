/**
 * UserContextEngine - Motor de Detecção de Contexto do Usuário
 *
 * Este engine é responsável por:
 * - Detectar o nível de habilidade do usuário (beginner → expert)
 * - Analisar padrões de comportamento em tempo real
 * - Inferir preferências baseadas em histórico
 * - Identificar estados de atividade (idle, calculating, hesitating, etc.)
 *
 * @module azuria_ai/engines/userContextEngine
 */

import type {
  SkillLevel,
  UserActivityState,
  UserContext,
  UserPreferences,
  UserSession,
} from '../types/operational';
import { eventBus } from '../core/eventBus';

// ============================================================================
// Constants
// ============================================================================

/** Tempo em ms considerado "hesitação" em um campo */
const HESITATION_THRESHOLD_MS = 8000;

/** Tempo em ms considerado "idle" */
const IDLE_THRESHOLD_MS = 30000;

/** Número de ações para considerar usuário "intermediate" */
const INTERMEDIATE_THRESHOLD = 10;

/** Número de ações para considerar usuário "advanced" */
const ADVANCED_THRESHOLD = 50;

/** Número de ações para considerar usuário "expert" */
const EXPERT_THRESHOLD = 200;

/** Máximo de telas no histórico */
const MAX_SCREEN_HISTORY = 10;

/** Intervalo de atualização de duração (ms) */
const DURATION_UPDATE_INTERVAL = 1000;

// ============================================================================
// Types
// ============================================================================

/** Métrica de comportamento do usuário */
interface BehaviorMetric {
  /** Número total de ações */
  totalActions: number;
  /** Cálculos completados com sucesso */
  successfulCalculations: number;
  /** Erros encontrados */
  errorsEncountered: number;
  /** Uso de recursos avançados */
  advancedFeaturesUsed: number;
  /** Tempo médio por cálculo (ms) */
  avgCalculationTime: number;
  /** Frequência de uso de atalhos */
  shortcutsUsed: number;
  /** Visitas à documentação/ajuda */
  helpVisits: number;
}

/** Histórico de interação */
interface InteractionHistory {
  /** Timestamp da interação */
  timestamp: number;
  /** Tipo de interação */
  type: string;
  /** Tela onde ocorreu */
  screen: string;
  /** Dados adicionais */
  data?: Record<string, unknown>;
}

/** Estado interno do engine */
interface EngineState {
  initialized: boolean;
  session: UserSession | null;
  metrics: BehaviorMetric;
  interactions: InteractionHistory[];
  lastUpdate: number;
  updateTimer: ReturnType<typeof setInterval> | null;
}

// ============================================================================
// Engine State
// ============================================================================

const state: EngineState = {
  initialized: false,
  session: null,
  metrics: {
    totalActions: 0,
    successfulCalculations: 0,
    errorsEncountered: 0,
    advancedFeaturesUsed: 0,
    avgCalculationTime: 0,
    shortcutsUsed: 0,
    helpVisits: 0,
  },
  interactions: [],
  lastUpdate: 0,
  updateTimer: null,
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Inicializa o UserContextEngine
 */
export function initUserContextEngine(userId?: string): void {
  if (state.initialized) {
    return;
  }

  const sessionId = generateSessionId();
  const now = Date.now();

  state.session = {
    id: sessionId,
    userId,
    startedAt: now,
    lastActivityAt: now,
    context: createInitialContext(sessionId),
    suggestionsShown: 0,
    suggestionsAccepted: 0,
    suggestionsDismissed: 0,
  };

  // Iniciar timer de atualização
  state.updateTimer = setInterval(updateDurations, DURATION_UPDATE_INTERVAL);

  // Registrar listeners de eventos
  setupEventListeners();

  state.initialized = true;
  state.lastUpdate = now;

  eventBus.emit({
    type: 'user:copilot-ready',
    payload: { sessionId },
    timestamp: now,
    source: 'user-context-engine',
  });
}

/**
 * Encerra o UserContextEngine
 */
export function shutdownUserContextEngine(): void {
  if (!state.initialized) {
    return;
  }

  if (state.updateTimer) {
    clearInterval(state.updateTimer);
    state.updateTimer = null;
  }

  state.session = null;
  state.initialized = false;
  state.interactions = [];
  resetMetrics();
}

/**
 * Obtém o contexto atual do usuário
 */
export function getUserContext(): UserContext | null {
  return state.session?.context ?? null;
}

/**
 * Obtém a sessão atual
 */
export function getUserSession(): UserSession | null {
  return state.session;
}

/**
 * Obtém métricas de comportamento
 */
export function getBehaviorMetrics(): BehaviorMetric {
  return { ...state.metrics };
}

// ============================================================================
// Context Updates
// ============================================================================

/**
 * Registra uma ação do usuário
 */
export function recordUserAction(
  actionType: string,
  screen: string,
  data?: Record<string, unknown>
): void {
  if (!state.session) {return;}

  const now = Date.now();

  // Atualizar histórico
  state.interactions.push({
    timestamp: now,
    type: actionType,
    screen,
    data,
  });

  // Manter apenas últimas 100 interações
  if (state.interactions.length > 100) {
    state.interactions = state.interactions.slice(-100);
  }

  // Atualizar métricas
  state.metrics.totalActions++;

  if (actionType.includes('calculation')) {
    state.metrics.successfulCalculations++;
  }

  if (actionType.includes('error')) {
    state.metrics.errorsEncountered++;
  }

  if (actionType.includes('shortcut') || actionType.includes('keyboard')) {
    state.metrics.shortcutsUsed++;
  }

  if (actionType.includes('help') || actionType.includes('docs')) {
    state.metrics.helpVisits++;
  }

  if (isAdvancedFeature(actionType)) {
    state.metrics.advancedFeaturesUsed++;
  }

  // Atualizar contexto
  updateContextFromAction(actionType, screen, now, data);

  // Emitir evento
  eventBus.emit({
    type: 'user:context-updated',
    payload: { context: state.session.context },
    timestamp: now,
    source: 'user-context-engine',
  });
}

/**
 * Registra navegação do usuário
 */
export function recordNavigation(toScreen: string): void {
  if (!state.session) {return;}

  const now = Date.now();
  const context = state.session.context;

  // Atualizar histórico de telas
  if (context.currentScreen !== toScreen) {
    context.screenHistory.push(context.currentScreen);
    if (context.screenHistory.length > MAX_SCREEN_HISTORY) {
      context.screenHistory.shift();
    }

    context.currentScreen = toScreen;
    context.screenDuration = 0;
  }

  context.lastActionAt = now;
  context.lastActionType = 'navigation';
  state.session.lastActivityAt = now;

  // Detectar estado de atividade
  context.activityState = 'browsing';

  recordUserAction('navigation', toScreen, { to: toScreen });
}

/**
 * Registra um erro encontrado pelo usuário
 */
export function recordError(errorType: string, screen: string): void {
  if (!state.session) {return;}

  state.session.context.errorsCount++;
  state.session.context.activityState = 'error-state';

  recordUserAction(`error:${errorType}`, screen, { errorType });
}

/**
 * Registra cálculo realizado
 */
export function recordCalculation(
  calculatorType: string,
  success: boolean,
  durationMs: number
): void {
  if (!state.session) {return;}

  if (success) {
    state.session.context.calculationsCount++;

    // Atualizar média de tempo
    const prevAvg = state.metrics.avgCalculationTime;
    const count = state.metrics.successfulCalculations;
    state.metrics.avgCalculationTime =
      (prevAvg * (count - 1) + durationMs) / count;

    // Atualizar preferência de calculadora
    updatePreferredCalculator(calculatorType);
  }

  recordUserAction(`calculation:${calculatorType}`, state.session.context.currentScreen, {
    calculatorType,
    success,
    durationMs,
  });
}

/**
 * Registra interação com input (para detectar hesitação)
 */
export function recordInputInteraction(
  inputId: string,
  interactionType: 'focus' | 'blur' | 'change' | 'hover',
  value?: unknown
): void {
  if (!state.session) {return;}

  const now = Date.now();
  const context = state.session.context;

  if (interactionType === 'focus') {
    // Marcar como preenchendo formulário
    context.activityState = 'filling-form';
  } else if (interactionType === 'blur' && !value) {
    // Verificar se está hesitando (campo focado sem valor por muito tempo)
    const lastFocus = state.interactions
      .filter((i) => i.type === `input:focus:${inputId}`)
      .at(-1);

    if (lastFocus && now - lastFocus.timestamp > HESITATION_THRESHOLD_MS) {
      context.activityState = 'hesitating';

      eventBus.emit({
        type: 'user:input',
        payload: {
          inputId,
          event: 'hesitation',
          duration: now - lastFocus.timestamp,
        },
        timestamp: now,
        source: 'user-context-engine',
      });
    }
  }

  recordUserAction(`input:${interactionType}:${inputId}`, context.currentScreen, {
    inputId,
    interactionType,
    value: value !== undefined ? String(value).substring(0, 50) : undefined,
  });
}

// ============================================================================
// Skill Level Detection
// ============================================================================

/**
 * Detecta o nível de habilidade do usuário baseado em métricas
 */
export function detectSkillLevel(): SkillLevel {
  const { metrics } = state;

  // Pontuação baseada em múltiplos fatores
  let score = 0;

  // Ações totais
  if (metrics.totalActions >= EXPERT_THRESHOLD) {
    score += 4;
  } else if (metrics.totalActions >= ADVANCED_THRESHOLD) {
    score += 3;
  } else if (metrics.totalActions >= INTERMEDIATE_THRESHOLD) {
    score += 2;
  } else {
    score += 1;
  }

  // Uso de recursos avançados
  if (metrics.advancedFeaturesUsed >= 20) {
    score += 2;
  } else if (metrics.advancedFeaturesUsed >= 5) {
    score += 1;
  }

  // Uso de atalhos (indica familiaridade)
  if (metrics.shortcutsUsed >= 10) {
    score += 2;
  } else if (metrics.shortcutsUsed >= 3) {
    score += 1;
  }

  // Visitas à ajuda (muitas podem indicar iniciante)
  if (metrics.helpVisits === 0 && metrics.totalActions > 20) {
    score += 1; // Não precisa de ajuda
  } else if (metrics.helpVisits > 5) {
    score -= 1; // Precisa de muita ajuda
  }

  // Taxa de erro (muitos erros indicam iniciante)
  const errorRate =
    metrics.totalActions > 0
      ? metrics.errorsEncountered / metrics.totalActions
      : 0;

  if (errorRate < 0.05 && metrics.totalActions > 20) {
    score += 1;
  } else if (errorRate > 0.2) {
    score -= 1;
  }

  // Velocidade de cálculos
  if (metrics.avgCalculationTime > 0 && metrics.avgCalculationTime < 30000) {
    score += 1; // Rápido
  }

  // Mapear pontuação para nível
  if (score >= 8) {return 'expert';}
  if (score >= 5) {return 'advanced';}
  if (score >= 2) {return 'intermediate';}
  return 'beginner';
}

/**
 * Atualiza o nível de skill no contexto
 */
export function updateSkillLevel(): void {
  if (!state.session) {return;}

  const newLevel = detectSkillLevel();
  const currentLevel = state.session.context.skillLevel;

  if (newLevel !== currentLevel) {
    state.session.context.skillLevel = newLevel;

    eventBus.emit({
      type: 'user:context-updated',
      payload: {
        context: state.session.context,
        change: { field: 'skillLevel', from: currentLevel, to: newLevel },
      },
      timestamp: Date.now(),
      source: 'user-context-engine',
    });
  }
}

// ============================================================================
// Activity State Detection
// ============================================================================

/**
 * Detecta o estado de atividade atual
 */
export function detectActivityState(): UserActivityState {
  if (!state.session) {return 'idle';}

  const now = Date.now();
  const context = state.session.context;
  const timeSinceLastAction = now - context.lastActionAt;

  // Verificar idle
  if (timeSinceLastAction > IDLE_THRESHOLD_MS) {
    return 'idle';
  }

  // Verificar hesitação (baseado em interações recentes)
  const recentInteractions = state.interactions.filter(
    (i) => now - i.timestamp < HESITATION_THRESHOLD_MS
  );

  if (recentInteractions.length === 0 && timeSinceLastAction > HESITATION_THRESHOLD_MS / 2) {
    return 'hesitating';
  }

  // Verificar atividade recente
  const lastAction = context.lastActionType;

  if (lastAction?.includes('calculation')) {
    return 'calculating';
  }

  if (lastAction?.includes('input') || lastAction?.includes('form')) {
    return 'filling-form';
  }

  if (lastAction?.includes('navigation')) {
    return 'browsing';
  }

  if (lastAction?.includes('review') || lastAction?.includes('result')) {
    return 'reviewing';
  }

  if (lastAction?.includes('error')) {
    return 'error-state';
  }

  return 'browsing';
}

/**
 * Atualiza o estado de atividade no contexto
 */
export function updateActivityState(): void {
  if (!state.session) {return;}

  const newState = detectActivityState();
  const currentState = state.session.context.activityState;

  if (newState !== currentState) {
    state.session.context.activityState = newState;

    eventBus.emit({
      type: 'user:context-updated',
      payload: {
        context: state.session.context,
        change: { field: 'activityState', from: currentState, to: newState },
      },
      timestamp: Date.now(),
      source: 'user-context-engine',
    });
  }
}

// ============================================================================
// Preferences Detection
// ============================================================================

/**
 * Infere preferências do usuário baseado em comportamento
 */
export function inferPreferences(): UserPreferences {
  const prefs: UserPreferences = {
    explanationLevel: 'brief',
    acceptsProactiveSuggestions: true,
    suggestionFrequency: 'medium',
  };

  // Nível de explicação baseado em skill
  const skillLevel = state.session?.context.skillLevel ?? 'beginner';
  if (skillLevel === 'beginner') {
    prefs.explanationLevel = 'detailed';
    prefs.suggestionFrequency = 'high';
  } else if (skillLevel === 'expert') {
    prefs.explanationLevel = 'brief';
    prefs.suggestionFrequency = 'low';
  }

  // Calculadora preferida
  const calcInteractions = state.interactions.filter((i) =>
    i.type.includes('calculation')
  );
  const calcCounts: Record<string, number> = {};

  for (const interaction of calcInteractions) {
    const calcType = interaction.data?.calculatorType as string;
    if (calcType) {
      calcCounts[calcType] = (calcCounts[calcType] || 0) + 1;
    }
  }

  const preferredCalc = Object.entries(calcCounts).sort((a, b) => b[1] - a[1])[0];
  if (preferredCalc) {
    prefs.preferredCalculator = preferredCalc[0] as UserPreferences['preferredCalculator'];
  }

  // Horário típico de uso
  const hours = state.interactions.map((i) => new Date(i.timestamp).getHours());
  if (hours.length > 0) {
    const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
    if (avgHour >= 5 && avgHour < 12) {
      prefs.typicalUsageTime = 'morning';
    } else if (avgHour >= 12 && avgHour < 18) {
      prefs.typicalUsageTime = 'afternoon';
    } else if (avgHour >= 18 && avgHour < 22) {
      prefs.typicalUsageTime = 'evening';
    } else {
      prefs.typicalUsageTime = 'night';
    }
  }

  // Aceita sugestões baseado em histórico
  if (state.session) {
    const { suggestionsShown, suggestionsDismissed } = state.session;
    if (suggestionsShown > 5 && suggestionsDismissed / suggestionsShown > 0.7) {
      prefs.acceptsProactiveSuggestions = false;
    }
  }

  return prefs;
}

/**
 * Atualiza preferências no contexto
 */
export function updatePreferences(): void {
  if (!state.session) {return;}

  const newPrefs = inferPreferences();
  state.session.context.preferences = newPrefs;

  eventBus.emit({
    type: 'user:context-updated',
    payload: {
      context: state.session.context,
      change: { field: 'preferences', to: newPrefs },
    },
    timestamp: Date.now(),
    source: 'user-context-engine',
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function createInitialContext(sessionId: string): UserContext {
  return {
    sessionId,
    skillLevel: 'beginner',
    activityState: 'idle',
    currentScreen: '/',
    lastActionAt: Date.now(),
    sessionDuration: 0,
    screenDuration: 0,
    screenHistory: [],
    calculationsCount: 0,
    errorsCount: 0,
    preferences: {
      explanationLevel: 'detailed',
      acceptsProactiveSuggestions: true,
      suggestionFrequency: 'medium',
    },
  };
}

function resetMetrics(): void {
  state.metrics = {
    totalActions: 0,
    successfulCalculations: 0,
    errorsEncountered: 0,
    advancedFeaturesUsed: 0,
    avgCalculationTime: 0,
    shortcutsUsed: 0,
    helpVisits: 0,
  };
}

function updateDurations(): void {
  if (!state.session) {return;}

  const now = Date.now();
  state.session.context.sessionDuration = now - state.session.startedAt;
  state.session.context.screenDuration += DURATION_UPDATE_INTERVAL;
}

function updateContextFromAction(
  actionType: string,
  screen: string,
  timestamp: number,
  _data?: Record<string, unknown>
): void {
  if (!state.session) {return;}

  const context = state.session.context;

  context.lastActionAt = timestamp;
  context.lastActionType = actionType;
  state.session.lastActivityAt = timestamp;

  if (context.currentScreen !== screen) {
    context.screenHistory.push(context.currentScreen);
    if (context.screenHistory.length > MAX_SCREEN_HISTORY) {
      context.screenHistory.shift();
    }
    context.currentScreen = screen;
    context.screenDuration = 0;
  }

  // Atualizar skill periodicamente (a cada 10 ações)
  if (state.metrics.totalActions % 10 === 0) {
    updateSkillLevel();
  }

  // Atualizar preferências periodicamente (a cada 25 ações)
  if (state.metrics.totalActions % 25 === 0) {
    updatePreferences();
  }
}

function isAdvancedFeature(actionType: string): boolean {
  const advancedKeywords = [
    'advanced',
    'custom',
    'export',
    'batch',
    'compare',
    'analysis',
    'report',
    'api',
    'integration',
  ];
  return advancedKeywords.some((kw) => actionType.toLowerCase().includes(kw));
}

function updatePreferredCalculator(calculatorType: string): void {
  if (!state.session) {return;}

  const prefs = state.session.context.preferences;
  const validTypes = ['simple', 'advanced', 'bid', 'tax'];

  if (validTypes.includes(calculatorType)) {
    prefs.preferredCalculator = calculatorType as UserPreferences['preferredCalculator'];
  }
}

function setupEventListeners(): void {
  // Ouvir eventos de navegação
  eventBus.subscribe('user:navigation', (event) => {
    const { to } = event.payload as { to: string };
    if (to) {
      recordNavigation(to);
    }
  });

  // Ouvir eventos de cálculo
  eventBus.subscribe('user:calculation', (event) => {
    const { calculatorType, success, durationMs } = event.payload as {
      calculatorType: string;
      success: boolean;
      durationMs: number;
    };
    recordCalculation(calculatorType, success, durationMs);
  });

  // Ouvir eventos de erro
  eventBus.subscribe('user:error', (event) => {
    const { errorType, screen } = event.payload as {
      errorType: string;
      screen: string;
    };
    recordError(errorType, screen);
  });

  // Ouvir eventos de input
  eventBus.subscribe('user:input', (event) => {
    const { inputId, interactionType, value } = event.payload as {
      inputId: string;
      interactionType: 'focus' | 'blur' | 'change' | 'hover';
      value?: unknown;
    };
    recordInputInteraction(inputId, interactionType, value);
  });
}

// ============================================================================
// Exports
// ============================================================================

export const userContextEngine = {
  init: initUserContextEngine,
  shutdown: shutdownUserContextEngine,
  getContext: getUserContext,
  getSession: getUserSession,
  getMetrics: getBehaviorMetrics,
  recordAction: recordUserAction,
  recordNavigation,
  recordError,
  recordCalculation,
  recordInputInteraction,
  detectSkillLevel,
  updateSkillLevel,
  detectActivityState,
  updateActivityState,
  inferPreferences,
  updatePreferences,
};

export default userContextEngine;
