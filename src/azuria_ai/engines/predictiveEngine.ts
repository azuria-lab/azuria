/**
 * PredictiveEngine - Motor de Predição de Ações
 * Modo Deus - Fase 5: NLP e Predição
 *
 * Responsabilidades:
 * - Prever próxima ação do usuário
 * - Identificar fluxos prováveis
 * - Calcular probabilidade de abandono
 * - Sugerir atalhos inteligentes
 * - Pré-carregar recursos antecipadamente
 *
 * @module azuria_ai/engines/predictiveEngine
 */

import { eventBus } from '../events/eventBus';
import { patternLearning } from './patternLearningEngine';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Ação prevista
 */
export interface PredictedAction {
  action: string;
  probability: number; // 0-1
  confidence: number; // 0-1
  reasoning: string;
  suggestedPreload?: string[]; // Resources to preload
  timeToAction?: number; // Estimated ms until action
}

/**
 * Fluxo previsto
 */
export interface PredictedFlow {
  steps: string[];
  probability: number;
  estimatedDuration: number; // ms
  potentialBlockers: string[];
}

/**
 * Risco de abandono
 */
export interface AbandonmentRisk {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  preventionSuggestions: string[];
}

/**
 * Contexto para predição
 */
export interface PredictionContext {
  currentScreen: string;
  recentActions: string[];
  sessionDuration: number;
  idleTime: number;
  errorCount: number;
  completedTasks: string[];
}

/**
 * Modelo de transição de estados
 */
interface TransitionModel {
  from: string;
  to: string;
  count: number;
  avgTimeMs: number;
}

// =============================================================================
// STATE
// =============================================================================

interface PredictiveState {
  initialized: boolean;
  transitionModel: Map<string, TransitionModel[]>;
  actionHistory: Array<{ action: string; timestamp: number }>;
  currentContext: PredictionContext;
  predictions: PredictedAction[];
}

const state: PredictiveState = {
  initialized: false,
  transitionModel: new Map(),
  actionHistory: [],
  currentContext: {
    currentScreen: '',
    recentActions: [],
    sessionDuration: 0,
    idleTime: 0,
    errorCount: 0,
    completedTasks: [],
  },
  predictions: [],
};

// Configuration
const CONFIG = {
  historySize: 50,
  minTransitionsForPrediction: 2,
  predictionThreshold: 0.3,
  maxPredictions: 5,
  abandonmentThresholds: {
    idleTime: 120000, // 2 min idle = warning
    errorCount: 3, // 3 errors = warning
    noProgressTime: 300000, // 5 min no progress = high risk
  },
};

// =============================================================================
// DEFAULT TRANSITIONS (Initial Model)
// =============================================================================

const DEFAULT_TRANSITIONS: TransitionModel[] = [
  // From home
  { from: 'home', to: 'calculator/markup', count: 30, avgTimeMs: 5000 },
  { from: 'home', to: 'calculator/margin', count: 25, avgTimeMs: 5000 },
  { from: 'home', to: 'calculator/price', count: 20, avgTimeMs: 4000 },
  { from: 'home', to: 'calculator/bdi', count: 10, avgTimeMs: 6000 },

  // Calculator flows
  { from: 'calculator/markup', to: 'calculator/margin', count: 15, avgTimeMs: 30000 },
  { from: 'calculator/margin', to: 'calculator/markup', count: 12, avgTimeMs: 30000 },
  { from: 'calculator/price', to: 'export', count: 10, avgTimeMs: 60000 },
  { from: 'calculator/bdi', to: 'export', count: 8, avgTimeMs: 90000 },

  // Export flows
  { from: 'export', to: 'home', count: 5, avgTimeMs: 10000 },
  { from: 'export', to: 'calculator/price', count: 3, avgTimeMs: 15000 },

  // Help flows
  { from: 'calculator/markup', to: 'help/markup-vs-margin', count: 8, avgTimeMs: 45000 },
  { from: 'calculator/margin', to: 'help/markup-vs-margin', count: 6, avgTimeMs: 40000 },
  { from: 'help/markup-vs-margin', to: 'calculator/markup', count: 10, avgTimeMs: 60000 },
];

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o PredictiveEngine
 */
export function initPredictiveEngine(): void {
  if (state.initialized) {return;}

  // Load default transitions
  loadDefaultTransitions();

  // Try to load learned transitions from pattern engine
  integrateLearnedPatterns();

  state.actionHistory = [];
  state.predictions = [];
  state.initialized = true;

  console.log('[PredictiveEngine] Initialized with', state.transitionModel.size, 'states');
}

function loadDefaultTransitions(): void {
  for (const transition of DEFAULT_TRANSITIONS) {
    const existing = state.transitionModel.get(transition.from) ?? [];
    existing.push(transition);
    state.transitionModel.set(transition.from, existing);
  }
}

function integrateLearnedPatterns(): void {
  try {
    const navPatterns = patternLearning.getPatternsByType('navigation');

    for (const pattern of navPatterns) {
      if (pattern.confidence < 0.5) {continue;}

      const data = pattern.data as { sequence?: string };
      if (!data.sequence) {continue;}

      const [from, to] = data.sequence.split('->').map((s) =>
        s.replace('navigate:', '').replace('view:', '')
      );

      if (from && to) {
        const existing = state.transitionModel.get(from) ?? [];
        const existingTransition = existing.find((t) => t.to === to);

        if (existingTransition) {
          existingTransition.count += pattern.occurrences;
        } else {
          existing.push({
            from,
            to,
            count: pattern.occurrences,
            avgTimeMs: 30000, // Default estimate
          });
        }

        state.transitionModel.set(from, existing);
      }
    }
  } catch {
    // Pattern learning may not be initialized
  }
}

// =============================================================================
// CONTEXT MANAGEMENT
// =============================================================================

/**
 * Atualiza contexto de predição
 */
export function updatePredictionContext(
  context: Partial<PredictionContext>
): void {
  Object.assign(state.currentContext, context);

  // Recalculate predictions when context changes
  if (context.currentScreen) {
    state.predictions = calculatePredictions(context.currentScreen);
  }
}

/**
 * Registra ação do usuário
 */
export function recordUserAction(action: string): void {
  const now = Date.now();

  state.actionHistory.push({ action, timestamp: now });

  // Keep history bounded
  if (state.actionHistory.length > CONFIG.historySize) {
    state.actionHistory = state.actionHistory.slice(-CONFIG.historySize);
  }

  // Update recent actions in context
  state.currentContext.recentActions = state.actionHistory
    .slice(-10)
    .map((a) => a.action);

  // Learn from transition
  if (state.actionHistory.length >= 2) {
    const prev = state.actionHistory[state.actionHistory.length - 2];
    learnTransition(prev.action, action, now - prev.timestamp);
  }

  // Recalculate predictions
  state.predictions = calculatePredictions(action);
}

/**
 * Aprende nova transição
 */
function learnTransition(from: string, to: string, durationMs: number): void {
  const existing = state.transitionModel.get(from) ?? [];
  const transition = existing.find((t) => t.to === to);

  if (transition) {
    // Update existing transition
    const totalTime = transition.avgTimeMs * transition.count + durationMs;
    transition.count++;
    transition.avgTimeMs = totalTime / transition.count;
  } else {
    // Add new transition
    existing.push({ from, to, count: 1, avgTimeMs: durationMs });
    state.transitionModel.set(from, existing);
  }
}

// =============================================================================
// PREDICTION
// =============================================================================

/**
 * Calcula predições a partir do estado atual
 */
function calculatePredictions(currentState: string): PredictedAction[] {
  const transitions = state.transitionModel.get(currentState) ?? [];

  if (transitions.length === 0) {
    return [];
  }

  // Calculate total count for probability
  const totalCount = transitions.reduce((sum, t) => sum + t.count, 0);

  // Generate predictions
  const predictions: PredictedAction[] = transitions
    .map((t) => ({
      action: t.to,
      probability: t.count / totalCount,
      confidence: Math.min(0.95, t.count / 10), // More data = higher confidence
      reasoning: `Baseado em ${t.count} transições anteriores`,
      timeToAction: t.avgTimeMs,
      suggestedPreload: getSuggestedPreloads(t.to),
    }))
    .filter((p) => p.probability >= CONFIG.predictionThreshold)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, CONFIG.maxPredictions);

  return predictions;
}

/**
 * Sugere recursos para pré-carregar
 */
function getSuggestedPreloads(action: string): string[] {
  const preloadMap: Record<string, string[]> = {
    'calculator/markup': ['/api/tax-rates', '/components/Calculator'],
    'calculator/margin': ['/api/tax-rates', '/components/Calculator'],
    'calculator/price': ['/api/tax-rates', '/components/Calculator'],
    'calculator/bdi': ['/api/bdi-components', '/components/BDICalculator'],
    'export': ['/api/export-templates', '/components/ExportDialog'],
    'help': ['/api/help-content'],
  };

  return preloadMap[action] ?? [];
}

/**
 * Retorna predições atuais
 */
export function getCurrentPredictions(): PredictedAction[] {
  return [...state.predictions];
}

/**
 * Retorna próxima ação mais provável
 */
export function getMostLikelyNextAction(): PredictedAction | null {
  if (state.predictions.length === 0) {return null;}
  return state.predictions[0];
}

/**
 * Prevê fluxo completo a partir do estado atual
 */
export function predictFlow(
  startState: string,
  maxSteps: number = 5
): PredictedFlow {
  const steps: string[] = [startState];
  let probability = 1;
  let totalDuration = 0;
  const potentialBlockers: string[] = [];
  let currentState = startState;

  for (let i = 0; i < maxSteps; i++) {
    const transitions = state.transitionModel.get(currentState) ?? [];

    if (transitions.length === 0) {break;}

    // Get most likely next state
    const totalCount = transitions.reduce((sum, t) => sum + t.count, 0);
    const sorted = [...transitions].sort((a, b) => b.count - a.count);
    const next = sorted[0];

    if (!next) {break;}

    const stepProbability = next.count / totalCount;
    probability *= stepProbability;
    totalDuration += next.avgTimeMs;

    // Check for potential blockers
    if (stepProbability < 0.4) {
      potentialBlockers.push(`Incerteza em ${currentState} -> ${next.to}`);
    }

    steps.push(next.to);
    currentState = next.to;

    // Stop if we've reached a likely endpoint
    if (
      ['export', 'home', 'logout'].some((end) => next.to.includes(end))
    ) {
      break;
    }
  }

  return {
    steps,
    probability,
    estimatedDuration: totalDuration,
    potentialBlockers,
  };
}

// =============================================================================
// ABANDONMENT RISK
// =============================================================================

/**
 * Calcula risco de abandono
 */
export function calculateAbandonmentRisk(): AbandonmentRisk {
  const ctx = state.currentContext;
  const triggers: string[] = [];
  let score = 0;

  // Idle time factor
  if (ctx.idleTime > CONFIG.abandonmentThresholds.idleTime) {
    const idleFactor = Math.min(
      30,
      (ctx.idleTime / CONFIG.abandonmentThresholds.idleTime) * 15
    );
    score += idleFactor;
    triggers.push(`Inativo por ${Math.round(ctx.idleTime / 1000)}s`);
  }

  // Error count factor
  if (ctx.errorCount >= CONFIG.abandonmentThresholds.errorCount) {
    score += ctx.errorCount * 10;
    triggers.push(`${ctx.errorCount} erros na sessão`);
  }

  // No progress factor
  if (ctx.completedTasks.length === 0 && ctx.sessionDuration > 60000) {
    const minutesWithoutProgress = ctx.sessionDuration / 60000;
    score += Math.min(25, minutesWithoutProgress * 5);
    triggers.push('Nenhuma tarefa concluída');
  }

  // Recent action pattern
  const recentActions = ctx.recentActions;
  if (recentActions.length >= 3) {
    // Check for repeated back-and-forth (confusion)
    const unique = new Set(recentActions.slice(-5));
    if (unique.size <= 2 && recentActions.length >= 5) {
      score += 15;
      triggers.push('Navegação repetitiva detectada');
    }
  }

  // Normalize score
  score = Math.min(100, Math.max(0, score));

  // Determine level
  let level: AbandonmentRisk['level'];
  if (score >= 70) {level = 'critical';}
  else if (score >= 50) {level = 'high';}
  else if (score >= 25) {level = 'medium';}
  else {level = 'low';}

  // Generate prevention suggestions
  const preventionSuggestions = generatePreventionSuggestions(
    triggers,
    level
  );

  return { score, level, triggers, preventionSuggestions };
}

/**
 * Gera sugestões de prevenção de abandono
 */
function generatePreventionSuggestions(
  triggers: string[],
  level: AbandonmentRisk['level']
): string[] {
  const suggestions: string[] = [];

  if (triggers.some((t) => t.includes('Inativo'))) {
    suggestions.push('Oferecer ajuda proativa');
    suggestions.push('Mostrar dica contextual');
  }

  if (triggers.some((t) => t.includes('erros'))) {
    suggestions.push('Exibir tutorial relevante');
    suggestions.push('Simplificar interface atual');
  }

  if (triggers.some((t) => t.includes('Nenhuma tarefa'))) {
    suggestions.push('Sugerir ação inicial');
    suggestions.push('Mostrar exemplo prático');
  }

  if (triggers.some((t) => t.includes('repetitiva'))) {
    suggestions.push('Oferecer atalho direto');
    suggestions.push('Perguntar o que usuário precisa');
  }

  if (level === 'critical') {
    suggestions.unshift('Intervenção imediata necessária');
  }

  return suggestions;
}

// =============================================================================
// SMART SHORTCUTS
// =============================================================================

/**
 * Sugere atalhos inteligentes
 */
export function suggestSmartShortcuts(): Array<{
  label: string;
  action: string;
  reason: string;
}> {
  const shortcuts: Array<{ label: string; action: string; reason: string }> = [];

  // Based on predictions
  const topPrediction = getMostLikelyNextAction();
  if (topPrediction && topPrediction.probability > 0.5) {
    shortcuts.push({
      label: `Ir para ${formatActionLabel(topPrediction.action)}`,
      action: topPrediction.action,
      reason: `${Math.round(topPrediction.probability * 100)}% dos usuários fazem isso`,
    });
  }

  // Based on patterns
  try {
    const mostUsed = patternLearning.getMostUsedCalculators();
    for (const calc of mostUsed.slice(0, 2)) {
      if (!shortcuts.some((s) => s.action.includes(calc))) {
        shortcuts.push({
          label: `Calculadora ${calc}`,
          action: `calculator/${calc}`,
          reason: 'Você usa frequentemente',
        });
      }
    }
  } catch {
    // Pattern learning not available
  }

  // Based on time of day
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 10) {
    shortcuts.push({
      label: 'Cálculos do dia',
      action: 'daily-summary',
      reason: 'Início do expediente',
    });
  }

  return shortcuts.slice(0, 4);
}

/**
 * Formata label de ação para exibição
 */
function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'calculator/markup': 'Calculadora de Markup',
    'calculator/margin': 'Calculadora de Margem',
    'calculator/price': 'Preço de Venda',
    'calculator/bdi': 'Calculadora BDI',
    'export': 'Exportar',
    'help': 'Ajuda',
    'home': 'Início',
  };

  return labels[action] ?? action;
}

// =============================================================================
// PRELOADING
// =============================================================================

/**
 * Retorna recursos que devem ser pré-carregados
 */
export function getPreloadSuggestions(): string[] {
  const suggestions = new Set<string>();

  // From top predictions
  for (const prediction of state.predictions.slice(0, 3)) {
    if (prediction.suggestedPreload) {
      prediction.suggestedPreload.forEach((p) => suggestions.add(p));
    }
  }

  return [...suggestions];
}

/**
 * Verifica se ação é prevista
 */
export function isActionPredicted(action: string): boolean {
  return state.predictions.some(
    (p) => p.action === action && p.probability >= CONFIG.predictionThreshold
  );
}

// =============================================================================
// EVENTS
// =============================================================================

/**
 * Emite evento de predição
 */
export function emitPredictionEvent(): void {
  const topPrediction = getMostLikelyNextAction();

  if (topPrediction && topPrediction.probability >= 0.6) {
    eventBus.emit({
      type: 'ai:pattern-detected',
      payload: {
        pattern: 'high_probability_next_action',
        action: topPrediction.action,
        probability: topPrediction.probability,
      },
    });
  }

  const abandonmentRisk = calculateAbandonmentRisk();
  if (abandonmentRisk.level === 'high' || abandonmentRisk.level === 'critical') {
    eventBus.emit({
      type: 'ai:pattern-detected',
      payload: {
        pattern: 'abandonment_risk',
        level: abandonmentRisk.level,
        score: abandonmentRisk.score,
      },
    });
  }
}

// =============================================================================
// STATS
// =============================================================================

/**
 * Retorna estatísticas do engine
 */
export function getPredictiveStats(): {
  totalStates: number;
  totalTransitions: number;
  historySize: number;
  currentPredictions: number;
  avgPredictionConfidence: number;
} {
  let totalTransitions = 0;
  for (const transitions of state.transitionModel.values()) {
    totalTransitions += transitions.length;
  }

  const avgConfidence =
    state.predictions.length > 0
      ? state.predictions.reduce((sum, p) => sum + p.confidence, 0) /
        state.predictions.length
      : 0;

  return {
    totalStates: state.transitionModel.size,
    totalTransitions,
    historySize: state.actionHistory.length,
    currentPredictions: state.predictions.length,
    avgPredictionConfidence: avgConfidence,
  };
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Limpa histórico de ações
 */
export function clearActionHistory(): void {
  state.actionHistory = [];
  state.predictions = [];
}

/**
 * Reseta o engine
 */
export function resetPredictiveEngine(): void {
  state.initialized = false;
  state.transitionModel.clear();
  state.actionHistory = [];
  state.predictions = [];
  state.currentContext = {
    currentScreen: '',
    recentActions: [],
    sessionDuration: 0,
    idleTime: 0,
    errorCount: 0,
    completedTasks: [],
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const predictiveEngine = {
  init: initPredictiveEngine,
  updateContext: updatePredictionContext,
  recordAction: recordUserAction,
  getPredictions: getCurrentPredictions,
  getMostLikely: getMostLikelyNextAction,
  predictFlow,
  getAbandonmentRisk: calculateAbandonmentRisk,
  suggestShortcuts: suggestSmartShortcuts,
  getPreloads: getPreloadSuggestions,
  isPredicted: isActionPredicted,
  emitPrediction: emitPredictionEvent,
  getStats: getPredictiveStats,
  clearHistory: clearActionHistory,
  reset: resetPredictiveEngine,
};

export default predictiveEngine;
