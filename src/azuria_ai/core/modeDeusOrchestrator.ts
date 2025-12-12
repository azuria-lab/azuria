/**
 * ModeDeusOrchestrator - Orquestrador Central do Modo Deus
 *
 * Este é o "maestro" que conecta e coordena todos os engines do Modo Deus.
 * Responsabilidades:
 * - Inicializar todos os engines na ordem correta
 * - Gerenciar ciclo de vida do Co-Piloto
 * - Processar eventos e rotear para engines apropriados
 * - Gerar sugestões coordenadas de múltiplas fontes
 * - Monitorar e ajustar comportamento em tempo real
 *
 * @module azuria_ai/core/modeDeusOrchestrator
 */

import { eventBus } from '../events/eventBus';
import type { UserSuggestion } from '../types/operational';

// Engines - Fase 1
import {
  addSuggestion,
  getActiveSuggestions,
  getCoPilotState,
  initOperationalEngine,
  resetState as resetCoPilotState,
  setEnabled as setCoPilotEnabled,
  updateUserContext,
} from '../engines/operationalAIEngine';

// Engines - Fase 2
import { detectSkillLevel, getUserContext, initUserContextEngine } from '../engines/userContextEngine';
import { getActivityState as getUIActivityState, initUIWatcher } from '../engines/uiWatcherEngine';
import { canShowSuggestion, initThrottler, recordSuggestionShown } from '../engines/suggestionThrottler';

// Engines - Fase 3
import { explanationToSuggestion, initExplanationEngine } from '../engines/explanationEngine';
import { initBiddingAssistant } from '../engines/biddingAssistantEngine';
import { initTutorialEngine, suggestTutorials } from '../engines/tutorialEngine';

// Engines - Fase 4
import { analyzeEffectiveness, getFeedbackMetrics, initFeedbackLoop } from '../engines/feedbackLoopEngine';
import { getMostUsedCalculators, getTypicalUsageTime, initPatternLearning } from '../engines/patternLearningEngine';
import { getProfile, initPersonalization, personalizeSuggestion, shouldShowProactiveSuggestion } from '../engines/personalizationEngine';

// Engines - Fase 5
import { analyzeText, initNLPProcessor } from '../engines/nlpProcessorEngine';
import { calculateAbandonmentRisk, getCurrentPredictions, initPredictiveEngine, suggestSmartShortcuts } from '../engines/predictiveEngine';
import { evaluateTriggers, getActiveAssistances, initProactiveAssistant, showAssistance } from '../engines/proactiveAssistant';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Estado do orquestrador
 */
export interface OrchestratorState {
  initialized: boolean;
  enabled: boolean;
  userId: string | null;
  currentScreen: string;
  sessionStartTime: Date;
  enginesStatus: Record<string, 'pending' | 'ready' | 'error'>;
}

/**
 * Configuração do orquestrador
 */
export interface OrchestratorConfig {
  enableCoPilot: boolean;
  enableProactiveSuggestions: boolean;
  enableLearning: boolean;
  enablePrediction: boolean;
  debugMode: boolean;
  suggestionInterval: number; // ms
}

/**
 * Contexto para processamento
 */
export interface ProcessingContext {
  screen: string;
  userInput?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Resultado de processamento
 */
export interface ProcessingResult {
  suggestions: UserSuggestion[];
  predictions: Array<{ action: string; probability: number }>;
  insights: string[];
  shouldShowAssistance: boolean;
}

// =============================================================================
// STATE
// =============================================================================

const state: OrchestratorState = {
  initialized: false,
  enabled: false,
  userId: null,
  currentScreen: '',
  sessionStartTime: new Date(),
  enginesStatus: {},
};

const defaultConfig: OrchestratorConfig = {
  enableCoPilot: true,
  enableProactiveSuggestions: true,
  enableLearning: true,
  enablePrediction: true,
  debugMode: false,
  suggestionInterval: 30000, // 30s
};

let config: OrchestratorConfig = { ...defaultConfig };
let suggestionIntervalId: ReturnType<typeof setInterval> | null = null;

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o Modo Deus completo
 */
export async function initModeDeus(
  userId?: string,
  customConfig?: Partial<OrchestratorConfig>
): Promise<{ success: boolean; errors: string[] }> {
  if (state.initialized) {
    return { success: true, errors: [] };
  }

  const errors: string[] = [];

  // Merge config
  if (customConfig) {
    config = { ...config, ...customConfig };
  }

  state.userId = userId ?? null;
  state.sessionStartTime = new Date();

  log('Initializing Mode Deus...');

  // Initialize engines in dependency order
  // Phase 1: Core
  try {
    await initOperationalEngine(userId);
    state.enginesStatus['operational'] = 'ready';
    log('✓ OperationalEngine ready');
  } catch (e) {
    state.enginesStatus['operational'] = 'error';
    errors.push(`OperationalEngine: ${e}`);
  }

  // Phase 2: Context & Monitoring
  try {
    await initUserContextEngine(userId);
    state.enginesStatus['userContext'] = 'ready';
    log('✓ UserContextEngine ready');
  } catch (e) {
    state.enginesStatus['userContext'] = 'error';
    errors.push(`UserContextEngine: ${e}`);
  }

  try {
    initUIWatcher();
    state.enginesStatus['uiWatcher'] = 'ready';
    log('✓ UIWatcher ready');
  } catch (e) {
    state.enginesStatus['uiWatcher'] = 'error';
    errors.push(`UIWatcher: ${e}`);
  }

  try {
    initThrottler();
    state.enginesStatus['throttler'] = 'ready';
    log('✓ SuggestionThrottler ready');
  } catch (e) {
    state.enginesStatus['throttler'] = 'error';
    errors.push(`SuggestionThrottler: ${e}`);
  }

  // Phase 3: Assistance
  try {
    initExplanationEngine();
    state.enginesStatus['explanation'] = 'ready';
    log('✓ ExplanationEngine ready');
  } catch (e) {
    state.enginesStatus['explanation'] = 'error';
    errors.push(`ExplanationEngine: ${e}`);
  }

  try {
    initBiddingAssistant();
    state.enginesStatus['bidding'] = 'ready';
    log('✓ BiddingAssistant ready');
  } catch (e) {
    state.enginesStatus['bidding'] = 'error';
    errors.push(`BiddingAssistant: ${e}`);
  }

  try {
    initTutorialEngine();
    state.enginesStatus['tutorial'] = 'ready';
    log('✓ TutorialEngine ready');
  } catch (e) {
    state.enginesStatus['tutorial'] = 'error';
    errors.push(`TutorialEngine: ${e}`);
  }

  // Phase 4: Learning
  if (config.enableLearning) {
    try {
      await initFeedbackLoop(userId);
      state.enginesStatus['feedbackLoop'] = 'ready';
      log('✓ FeedbackLoop ready');
    } catch (e) {
      state.enginesStatus['feedbackLoop'] = 'error';
      errors.push(`FeedbackLoop: ${e}`);
    }

    try {
      await initPatternLearning(userId);
      state.enginesStatus['patternLearning'] = 'ready';
      log('✓ PatternLearning ready');
    } catch (e) {
      state.enginesStatus['patternLearning'] = 'error';
      errors.push(`PatternLearning: ${e}`);
    }

    try {
      await initPersonalization(userId);
      state.enginesStatus['personalization'] = 'ready';
      log('✓ Personalization ready');
    } catch (e) {
      state.enginesStatus['personalization'] = 'error';
      errors.push(`Personalization: ${e}`);
    }
  }

  // Phase 5: Intelligence
  if (config.enablePrediction) {
    try {
      initNLPProcessor();
      state.enginesStatus['nlp'] = 'ready';
      log('✓ NLPProcessor ready');
    } catch (e) {
      state.enginesStatus['nlp'] = 'error';
      errors.push(`NLPProcessor: ${e}`);
    }

    try {
      initPredictiveEngine();
      state.enginesStatus['predictive'] = 'ready';
      log('✓ PredictiveEngine ready');
    } catch (e) {
      state.enginesStatus['predictive'] = 'error';
      errors.push(`PredictiveEngine: ${e}`);
    }

    try {
      initProactiveAssistant();
      state.enginesStatus['proactive'] = 'ready';
      log('✓ ProactiveAssistant ready');
    } catch (e) {
      state.enginesStatus['proactive'] = 'error';
      errors.push(`ProactiveAssistant: ${e}`);
    }
  }

  // Setup event routing
  setupEventRouting();

  // Start suggestion loop
  if (config.enableProactiveSuggestions) {
    startSuggestionLoop();
  }

  state.initialized = true;
  state.enabled = config.enableCoPilot;

  const readyCount = Object.values(state.enginesStatus).filter((s) => s === 'ready').length;
  const totalCount = Object.keys(state.enginesStatus).length;

  log(`Mode Deus initialized: ${readyCount}/${totalCount} engines ready`);

  // Emit initialization event
  eventBus.emit({
    type: 'system:init',
    payload: {
      component: 'ModeDeus',
      success: errors.length === 0,
      enginesReady: readyCount,
      enginesTotal: totalCount,
    },
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Desliga o Modo Deus
 */
export function shutdownModeDeus(): void {
  if (!state.initialized) {return;}

  log('Shutting down Mode Deus...');

  // Stop suggestion loop
  if (suggestionIntervalId) {
    clearInterval(suggestionIntervalId);
    suggestionIntervalId = null;
  }

  // Reset state
  state.initialized = false;
  state.enabled = false;
  state.enginesStatus = {};

  // Emit shutdown event
  eventBus.emit({
    type: 'system:shutdown',
    payload: { component: 'ModeDeus' },
  });

  log('Mode Deus shutdown complete');
}

// =============================================================================
// CORE PROCESSING
// =============================================================================

/**
 * Processa contexto e gera sugestões coordenadas
 */
export async function process(context: ProcessingContext): Promise<ProcessingResult> {
  if (!state.initialized || !state.enabled) {
    return { suggestions: [], predictions: [], insights: [], shouldShowAssistance: false };
  }

  const suggestions: UserSuggestion[] = [];
  const insights: string[] = [];

  // Update current screen
  state.currentScreen = context.screen;
  updateUserContext({ currentScreen: context.screen });

  // 1. Process user input with NLP (if provided)
  if (context.userInput && state.enginesStatus['nlp'] === 'ready') {
    const nlpResult = analyzeText(context.userInput);

    if (nlpResult.confidence > 0.5 && nlpResult.suggestedAction) {
      insights.push(`Intent: ${nlpResult.intent} (${Math.round(nlpResult.confidence * 100)}%)`);
    }

    // Generate suggestion from NLP
    if (nlpResult.intent !== 'unknown') {
      const nlpSuggestion = createSuggestionFromIntent(nlpResult);
      if (nlpSuggestion) {
        suggestions.push(nlpSuggestion);
      }
    }
  }

  // 2. Get predictions
  const predictions = state.enginesStatus['predictive'] === 'ready'
    ? getCurrentPredictions().map((p) => ({ action: p.action, probability: p.probability }))
    : [];

  // 3. Check abandonment risk
  if (state.enginesStatus['predictive'] === 'ready') {
    const risk = calculateAbandonmentRisk();
    if (risk.level === 'high' || risk.level === 'critical') {
      insights.push(`Abandonment risk: ${risk.level} (${risk.score}%)`);
    }
  }

  // 4. Evaluate proactive triggers
  let shouldShowAssistance = false;
  if (state.enginesStatus['proactive'] === 'ready') {
    const triggerContext = buildTriggerContext(context);
    const assistances = evaluateTriggers(triggerContext);

    if (assistances.length > 0) {
      // Check throttling
      const throttleResult = canShowSuggestion(assistances[0].type);
      if (throttleResult.allowed) {
        showAssistance(assistances[0]);
        shouldShowAssistance = true;
      }
    }
  }

  // 5. Personalize suggestions
  if (state.enginesStatus['personalization'] === 'ready') {
    for (let i = 0; i < suggestions.length; i++) {
      suggestions[i] = personalizeSuggestion(suggestions[i], {
        currentScreen: context.screen,
      });
    }
  }

  // 6. Add suggestions to Co-Pilot
  for (const suggestion of suggestions) {
    const throttleResult = canShowSuggestion(suggestion.type);
    if (throttleResult.allowed) {
      addSuggestion(suggestion);
      recordSuggestionShown(suggestion.type, suggestion.priority);
    }
  }

  return {
    suggestions,
    predictions,
    insights,
    shouldShowAssistance,
  };
}

/**
 * Processa navegação
 */
export function handleNavigation(from: string, to: string): void {
  if (!state.initialized) {return;}

  state.currentScreen = to;

  // Emit navigation event
  eventBus.emit({
    type: 'user:navigated',
    payload: { from, to },
  });

  // Process new screen context
  process({ screen: to, action: 'navigate' }).catch(console.error);
}

/**
 * Processa input do usuário (ex: barra de busca, chat)
 */
export async function handleUserInput(input: string): Promise<UserSuggestion[]> {
  if (!state.initialized || !input.trim()) {return [];}

  const result = await process({
    screen: state.currentScreen,
    userInput: input,
  });

  return result.suggestions;
}

// =============================================================================
// SUGGESTION GENERATION
// =============================================================================

/**
 * Gera sugestões combinadas de todas as fontes
 */
export function generateCombinedSuggestions(): UserSuggestion[] {
  if (!state.initialized || !state.enabled) {return [];}

  const suggestions: UserSuggestion[] = [];

  // 1. Get user context
  const userContext = getUserContext();
  const skillLevel = userContext.skillLevel;

  // 2. Tutorial suggestions for beginners
  if (skillLevel === 'beginner' && state.enginesStatus['tutorial'] === 'ready') {
    const tutorialSuggestions = suggestTutorials(skillLevel, state.currentScreen);
    if (tutorialSuggestions.length > 0) {
      suggestions.push({
        id: `tutorial-${Date.now()}`,
        type: 'tutorial',
        message: `Quer aprender sobre "${tutorialSuggestions[0].title}"?`,
        priority: 60,
        trigger: 'context',
        context: { screen: state.currentScreen },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 300000),
        metadata: { tutorialId: tutorialSuggestions[0].id },
      });
    }
  }

  // 3. Smart shortcuts from predictions
  if (state.enginesStatus['predictive'] === 'ready') {
    const shortcuts = suggestSmartShortcuts();
    for (const shortcut of shortcuts.slice(0, 2)) {
      suggestions.push({
        id: `shortcut-${Date.now()}-${Math.random()}`,
        type: 'action',
        message: shortcut.label,
        priority: 40,
        trigger: 'prediction',
        context: { reason: shortcut.reason },
        actions: [{
          label: shortcut.label,
          action: 'navigate',
          params: { to: shortcut.action },
        }],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 120000),
      });
    }
  }

  // 4. Contextual explanations
  if (state.enginesStatus['explanation'] === 'ready' && skillLevel !== 'expert') {
    const conceptsForScreen: Record<string, string> = {
      'calculator/markup': 'markup_vs_margin',
      'calculator/margin': 'markup_vs_margin',
      'calculator/bdi': 'bdi',
      'calculator/price': 'selling_price',
    };

    const concept = conceptsForScreen[state.currentScreen];
    if (concept) {
      const explanation = explanationToSuggestion(concept, skillLevel);
      if (explanation) {
        suggestions.push(explanation);
      }
    }
  }

  // 5. Filter and sort
  const filtered = suggestions
    .filter((s) => {
      const throttle = canShowSuggestion(s.type);
      return throttle.allowed;
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  return filtered;
}

// =============================================================================
// STATUS & METRICS
// =============================================================================

/**
 * Retorna estado do orquestrador
 */
export function getOrchestratorState(): OrchestratorState {
  return { ...state };
}

/**
 * Retorna métricas consolidadas
 */
export function getConsolidatedMetrics(): {
  session: { duration: number; screen: string };
  user: { skillLevel: string; engagementScore: number };
  suggestions: { shown: number; applied: number; rate: number };
  predictions: { accuracy: number; count: number };
  health: { enginesReady: number; enginesTotal: number };
} {
  const sessionDuration = Date.now() - state.sessionStartTime.getTime();

  // User metrics
  const profile = state.enginesStatus['personalization'] === 'ready'
    ? getProfile()
    : { skillLevel: 'unknown', engagementScore: 0 };

  // Suggestion metrics
  const feedbackMetrics = state.enginesStatus['feedbackLoop'] === 'ready'
    ? getFeedbackMetrics()
    : { totalFeedback: 0, applicationRate: 0 };

  // CoPilot state
  const copilotState = getCoPilotState();

  // Engine health
  const readyCount = Object.values(state.enginesStatus).filter((s) => s === 'ready').length;
  const totalCount = Object.keys(state.enginesStatus).length;

  return {
    session: {
      duration: sessionDuration,
      screen: state.currentScreen,
    },
    user: {
      skillLevel: profile.skillLevel,
      engagementScore: profile.engagementScore,
    },
    suggestions: {
      shown: copilotState.suggestionHistory.length,
      applied: feedbackMetrics.totalFeedback,
      rate: feedbackMetrics.applicationRate,
    },
    predictions: {
      accuracy: 0.75, // TODO: Calculate from actual predictions
      count: getCurrentPredictions().length,
    },
    health: {
      enginesReady: readyCount,
      enginesTotal: totalCount,
    },
  };
}

/**
 * Retorna insights do sistema
 */
export function getSystemInsights(): string[] {
  const insights: string[] = [];

  // Feedback effectiveness
  if (state.enginesStatus['feedbackLoop'] === 'ready') {
    const effectiveness = analyzeEffectiveness();
    if (effectiveness.trend === 'declining') {
      insights.push('📉 Efetividade das sugestões em declínio');
    } else if (effectiveness.trend === 'improving') {
      insights.push('📈 Sugestões estão mais efetivas');
    }
  }

  // Pattern insights
  if (state.enginesStatus['patternLearning'] === 'ready') {
    const typicalTime = getTypicalUsageTime();
    if (typicalTime) {
      insights.push(`⏰ Horário típico de uso: ${typicalTime}`);
    }

    const mostUsed = getMostUsedCalculators();
    if (mostUsed.length > 0) {
      insights.push(`📊 Calculadora mais usada: ${mostUsed[0]}`);
    }
  }

  // Abandonment risk
  if (state.enginesStatus['predictive'] === 'ready') {
    const risk = calculateAbandonmentRisk();
    if (risk.level === 'high' || risk.level === 'critical') {
      insights.push(`⚠️ Risco de abandono: ${risk.level}`);
    }
  }

  return insights;
}

// =============================================================================
// CONTROL
// =============================================================================

/**
 * Verifica se o Modo Deus está inicializado
 */
export function isInitialized(): boolean {
  return state.initialized;
}

/**
 * Tipo para status de engine (simplificado)
 */
export type EngineStatusValue = 'pending' | 'ready' | 'error';

/**
 * Retorna status de todos os engines
 */
export function getEngineStatuses(): Record<string, EngineStatusValue> {
  return { ...state.enginesStatus };
}

/**
 * Retorna configuração atual
 */
export function getModeDeusConfig(): OrchestratorConfig {
  return { ...config };
}

/**
 * Habilita/desabilita Modo Deus
 */
export function setModeDeusEnabled(enabled: boolean): void {
  state.enabled = enabled;
  setCoPilotEnabled(enabled);

  if (enabled && !suggestionIntervalId && config.enableProactiveSuggestions) {
    startSuggestionLoop();
  } else if (!enabled && suggestionIntervalId) {
    clearInterval(suggestionIntervalId);
    suggestionIntervalId = null;
  }
}

/**
 * Atualiza configuração
 */
export function updateOrchestratorConfig(newConfig: Partial<OrchestratorConfig>): void {
  config = { ...config, ...newConfig };
}

// =============================================================================
// HELPERS
// =============================================================================

function log(message: string): void {
  if (config.debugMode) {
    console.log(`[ModeDeus] ${message}`);
  }
}

function setupEventRouting(): void {
  // Route user events to appropriate engines
  eventBus.on('user:interacted', (event) => {
    if (state.enginesStatus['patternLearning'] === 'ready') {
      // Pattern learning handles this via its own listener
    }
  });

  eventBus.on('user:error', () => {
    // Could trigger recovery assistance
    if (state.enginesStatus['proactive'] === 'ready') {
      const triggerContext = buildTriggerContext({ screen: state.currentScreen });
      triggerContext.errorCount++;
      evaluateTriggers(triggerContext);
    }
  });
}

function startSuggestionLoop(): void {
  if (suggestionIntervalId) {return;}

  suggestionIntervalId = setInterval(() => {
    if (!state.enabled) {return;}

    // Check if we should show proactive suggestions
    const { show } = shouldShowProactiveSuggestion({
      currentScreen: state.currentScreen,
    });

    if (show) {
      const suggestions = generateCombinedSuggestions();
      for (const suggestion of suggestions) {
        addSuggestion(suggestion);
      }
    }
  }, config.suggestionInterval);
}

function buildTriggerContext(context: ProcessingContext): {
  currentScreen: string;
  sessionDuration: number;
  idleTime: number;
  errorCount: number;
  lastAction: string;
  userSkillLevel: string;
  recentActions: string[];
  abandonmentRisk: number;
  timeOfDay: string;
} {
  const sessionDuration = Date.now() - state.sessionStartTime.getTime();
  const userContext = getUserContext();
  const uiState = getUIActivityState();
  const risk = state.enginesStatus['predictive'] === 'ready'
    ? calculateAbandonmentRisk().score
    : 0;

  const hour = new Date().getHours();
  let timeOfDay: string;
  if (hour >= 5 && hour < 12) {timeOfDay = 'morning';}
  else if (hour >= 12 && hour < 17) {timeOfDay = 'afternoon';}
  else if (hour >= 17 && hour < 21) {timeOfDay = 'evening';}
  else {timeOfDay = 'night';}

  return {
    currentScreen: context.screen,
    sessionDuration,
    idleTime: uiState === 'idle' ? 60000 : 0,
    errorCount: userContext.behaviorMetrics.totalErrors,
    lastAction: context.action ?? '',
    userSkillLevel: userContext.skillLevel,
    recentActions: [],
    abandonmentRisk: risk,
    timeOfDay,
  };
}

function createSuggestionFromIntent(nlpResult: {
  intent: string;
  confidence: number;
  suggestedAction?: string;
}): UserSuggestion | null {
  const intentMessages: Record<string, { message: string; type: UserSuggestion['type'] }> = {
    calculate_price: { message: 'Posso ajudar a calcular o preço de venda', type: 'action' },
    calculate_markup: { message: 'Vamos calcular o markup ideal?', type: 'action' },
    calculate_margin: { message: 'Quer calcular a margem de lucro?', type: 'action' },
    calculate_bdi: { message: 'Posso ajudar com o cálculo de BDI', type: 'action' },
    understand_concept: { message: 'Posso explicar esse conceito para você', type: 'info' },
    get_help: { message: 'Estou aqui para ajudar!', type: 'tip' },
  };

  const mapping = intentMessages[nlpResult.intent];
  if (!mapping) {return null;}

  return {
    id: `nlp-${Date.now()}`,
    type: mapping.type,
    message: mapping.message,
    priority: Math.round(nlpResult.confidence * 80),
    trigger: 'user_input',
    context: { intent: nlpResult.intent },
    actions: nlpResult.suggestedAction ? [{
      label: 'Ir',
      action: 'navigate',
      params: { to: nlpResult.suggestedAction },
    }] : undefined,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 60000),
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const modeDeusOrchestrator = {
  init: initModeDeus,
  shutdown: shutdownModeDeus,
  process,
  handleNavigation,
  handleUserInput,
  generateSuggestions: generateCombinedSuggestions,
  getState: getOrchestratorState,
  getMetrics: getConsolidatedMetrics,
  getInsights: getSystemInsights,
  setEnabled: setModeDeusEnabled,
  updateConfig: updateOrchestratorConfig,
};

export default modeDeusOrchestrator;
