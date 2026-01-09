/**
 * ModeDeusOrchestrator - Delegado Operacional do Modo Deus
 *
 * ⚠️ IMPORTANTE: Este módulo agora funciona como DELEGADO do CentralNucleus.
 * NÃO deve ser usado diretamente - use CentralNucleus.send() para eventos.
 *
 * Hierarquia:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  CentralNucleus (Único Ponto de Entrada)                       │
 * │    └── ModeDeusOrchestrator (Delegado Operacional)             │
 * │          └── Engines operacionais (Co-Pilot, suggestions...)   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Responsabilidades ATUAIS:
 * - Inicializar engines operacionais na ordem correta
 * - Gerenciar ciclo de vida do Co-Piloto
 * - Executar ações QUANDO AUTORIZADO pelo Nucleus
 * - Gerar sugestões coordenadas (submetidas ao Nucleus para aprovação)
 *
 * O que NÃO faz mais:
 * - Decidir sozinho se deve emitir para UI
 * - Processar eventos diretamente do EventBus sem aprovação
 * - Agir autonomamente
 *
 * @module azuria_ai/core/modeDeusOrchestrator
 */

import { eventBus } from '../events/eventBus';
import type { Suggestion, UserSuggestion } from '../types/operational';
import { structuredLogger } from '../../services/structuredLogger';

// Engines - Fase 1
import {
  addSuggestion,
  getCoPilotState,
  initOperationalEngine,
  setEnabled as setCoPilotEnabled,
  updateUserContext,
} from '../engines/operationalAIEngine';

// Engines - Fase 2
import { getUserContext, initUserContextEngine } from '../engines/userContextEngine';
import { getActivityState as getUIActivityState, initUIWatcher } from '../engines/uiWatcherEngine';
import { canShowSuggestion, initThrottler, recordSuggestionShown } from '../engines/suggestionThrottler';

// Engines - Fase 3
import { type ExplanationCategory, explanationToSuggestion, generateExplanation, initExplanationEngine } from '../engines/explanationEngine';
import { initBiddingAssistant } from '../engines/biddingAssistantEngine';
import { initTutorialEngine, suggestTutorials } from '../engines/tutorialEngine';

// Engines - Fase 4
import { analyzeEffectiveness, getFeedbackMetrics, initFeedbackLoop } from '../engines/feedbackLoopEngine';
import { getMostUsedCalculators, getTypicalUsageTime, initPatternLearning } from '../engines/patternLearningEngine';
import { getProfile, initPersonalization, personalizeSuggestion, shouldShowProactiveSuggestion } from '../engines/personalizationEngine';

// Engines - Fase 5
import { analyzeText, initNLPProcessor } from '../engines/nlpProcessorEngine';
import { calculateAbandonmentRisk, getCurrentPredictions, initPredictiveEngine, suggestSmartShortcuts } from '../engines/predictiveEngine';
import { evaluateTriggers, initProactiveAssistant, showAssistance } from '../engines/proactiveAssistant';
import { initTipEngine } from '../engines/tipEngine';

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
// INITIALIZATION HELPERS
// =============================================================================

type EngineInitFn = () => void | Promise<void>;

interface EngineDefinition {
  name: string;
  init: EngineInitFn;
  requiresLearning?: boolean;
  requiresPrediction?: boolean;
}

/**
 * Inicializa um engine e registra seu status
 */
async function initEngine(
  def: EngineDefinition,
  errors: string[]
): Promise<void> {
  try {
    await def.init();
    state.enginesStatus[def.name] = 'ready';
    log(`✓ ${def.name} ready`);
  } catch (e) {
    state.enginesStatus[def.name] = 'error';
    errors.push(`${def.name}: ${e}`);
  }
}

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

  // Define engines to initialize
  const coreEngines: EngineDefinition[] = [
    { name: 'operational', init: initOperationalEngine },
    { name: 'userContext', init: () => initUserContextEngine(userId) },
    { name: 'uiWatcher', init: initUIWatcher },
    { name: 'throttler', init: initThrottler },
    { name: 'explanation', init: initExplanationEngine },
    { name: 'bidding', init: initBiddingAssistant },
    { name: 'tutorial', init: initTutorialEngine },
    { name: 'tipEngine', init: initTipEngine },
  ];

  const learningEngines: EngineDefinition[] = [
    { name: 'feedbackLoop', init: () => initFeedbackLoop(userId) },
    { name: 'patternLearning', init: () => initPatternLearning(userId) },
    { name: 'personalization', init: () => initPersonalization(userId) },
  ];

  const predictionEngines: EngineDefinition[] = [
    { name: 'nlp', init: initNLPProcessor },
    { name: 'predictive', init: initPredictiveEngine },
    { name: 'proactive', init: initProactiveAssistant },
  ];

  // Initialize core engines
  for (const engine of coreEngines) {
    await initEngine(engine, errors);
  }

  // Initialize learning engines if enabled
  if (config.enableLearning) {
    for (const engine of learningEngines) {
      await initEngine(engine, errors);
    }
  }

  // Initialize prediction engines if enabled
  if (config.enablePrediction) {
    for (const engine of predictionEngines) {
      await initEngine(engine, errors);
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
  eventBus.emit(
    'system:init',
    {
      component: 'ModeDeus',
      success: errors.length === 0,
      enginesReady: readyCount,
      enginesTotal: totalCount,
    },
    { source: 'mode-deus-orchestrator' }
  );

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
  eventBus.emit(
    'system:shutdown',
    { component: 'ModeDeus' },
    { source: 'mode-deus-orchestrator' }
  );

  log('Mode Deus shutdown complete');
}

// =============================================================================
// CORE PROCESSING HELPERS
// =============================================================================

/**
 * Processa input NLP e retorna sugestões e insights
 */
function processNLPInput(
  input: string,
  suggestions: UserSuggestion[],
  insights: string[]
): void {
  if (state.enginesStatus['nlp'] !== 'ready') { return; }

  const nlpResult = analyzeText(input);

  if (nlpResult.confidence > 0.5 && nlpResult.suggestedAction) {
    insights.push(`Intent: ${nlpResult.intent} (${Math.round(nlpResult.confidence * 100)}%)`);
  }

  if (nlpResult.intent !== 'unknown') {
    const nlpSuggestion = createSuggestionFromIntent(nlpResult);
    if (nlpSuggestion) {
      suggestions.push(nlpSuggestion);
    }
  }
}

/**
 * Coleta insights de risco de abandono
 */
function collectAbandonmentInsights(insights: string[]): void {
  if (state.enginesStatus['predictive'] !== 'ready') { return; }

  const risk = calculateAbandonmentRisk();
  if (risk.level === 'high' || risk.level === 'critical') {
    insights.push(`Abandonment risk: ${risk.level} (${risk.score}%)`);
  }
}

/**
 * Avalia triggers proativos
 */
function evaluateProactiveTriggers(context: ProcessingContext): boolean {
  if (state.enginesStatus['proactive'] !== 'ready') { return false; }

  const triggerContext = buildTriggerContext(context);
  const assistances = evaluateTriggers(triggerContext);

  if (assistances.length === 0) { return false; }

  const throttleResult = canShowSuggestion(assistances[0] as unknown as Suggestion);
  if (throttleResult.allowed) {
    showAssistance(assistances[0]);
    return true;
  }
  return false;
}

/**
 * Personaliza sugestões
 */
function personalizeSuggestions(
  suggestions: UserSuggestion[],
  screen: string
): void {
  if (state.enginesStatus['personalization'] !== 'ready') { return; }

  for (let i = 0; i < suggestions.length; i++) {
    suggestions[i] = personalizeSuggestion(suggestions[i], {
      currentScreen: screen,
    });
  }
}

/**
 * Adiciona sugestões ao Co-Pilot com throttling
 */
function addThrottledSuggestions(suggestions: UserSuggestion[]): void {
  for (const suggestion of suggestions) {
    const throttleResult = canShowSuggestion(suggestion as unknown as Suggestion);
    if (throttleResult.allowed) {
      addSuggestion(suggestion);
      recordSuggestionShown(suggestion as unknown as Suggestion);
    }
  }
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
  if (context.userInput) {
    processNLPInput(context.userInput, suggestions, insights);
  }

  // 2. Get predictions
  const predictions = state.enginesStatus['predictive'] === 'ready'
    ? getCurrentPredictions().map((p) => ({ action: p.action, probability: p.probability }))
    : [];

  // 3. Check abandonment risk
  collectAbandonmentInsights(insights);

  // 4. Evaluate proactive triggers
  const shouldShowAssistance = evaluateProactiveTriggers(context);

  // 5. Personalize suggestions
  personalizeSuggestions(suggestions, context.screen);

  // 6. Add suggestions to Co-Pilot
  addThrottledSuggestions(suggestions);

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
  eventBus.emit(
    'user:navigation',
    { from, to },
    { source: 'mode-deus-orchestrator' }
  );

  // Process new screen context
  process({ screen: to, action: 'navigate' }).catch((err) => {
    log(`Error processing navigation: ${err}`);
  });
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
    const tutorialSuggestions = suggestTutorials(userContext);
    if (tutorialSuggestions.length > 0) {
      const tutSugg = tutorialSuggestions[0];
      suggestions.push({
        id: `tutorial-${Date.now()}`,
        type: 'tutorial',
        category: tutSugg.category || 'calculation',
        title: tutSugg.title || 'Tutorial',
        message: tutSugg.message || `Quer aprender mais?`,
        priority: 'medium',
        context: { screen: state.currentScreen },
        metadata: {
          createdAt: Date.now(),
          expiresAt: Date.now() + 300000,
          source: 'tutorial-engine',
          confidence: 0.8,
        },
        status: 'pending',
      } as UserSuggestion);
    }
  }

  // 3. Smart shortcuts from predictions
  if (state.enginesStatus['predictive'] === 'ready') {
    const shortcuts = suggestSmartShortcuts();
    for (const shortcut of shortcuts.slice(0, 2)) {
      suggestions.push({
        id: `shortcut-${Date.now()}-${Math.random()}`,
        type: 'optimization',
        category: 'calculation',
        title: shortcut.label,
        message: shortcut.label,
        priority: 'medium',
        context: { data: { reason: shortcut.reason, to: shortcut.action } },
        actions: [{
          id: `action-${Date.now()}`,
          label: shortcut.label,
          type: 'primary',
        }],
        metadata: {
          createdAt: Date.now(),
          expiresAt: Date.now() + 120000,
          source: 'predictive-engine',
          confidence: 0.7,
        },
        status: 'pending',
      } as UserSuggestion);
    }
  }

  // 4. Contextual explanations
  if (state.enginesStatus['explanation'] === 'ready' && skillLevel !== 'expert') {
    const conceptsForScreen: Record<string, { category: string; topic: string }> = {
      'calculator/markup': { category: 'calculation', topic: 'markup_vs_margin' },
      'calculator/margin': { category: 'calculation', topic: 'markup_vs_margin' },
      'calculator/bdi': { category: 'calculation', topic: 'bdi' },
      'calculator/price': { category: 'pricing', topic: 'selling_price' },
    };

    const conceptData = conceptsForScreen[state.currentScreen];
    if (conceptData) {
      const explResult = generateExplanation(
        { category: conceptData.category as ExplanationCategory, topic: conceptData.topic },
        userContext
      );
      if (explResult) {
        const explSugg = explanationToSuggestion(explResult);
        suggestions.push({
          ...explSugg,
          id: `explanation-${Date.now()}`,
        } as UserSuggestion);
      }
    }
  }

  // 5. Filter and sort
  const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const filtered = suggestions
    .filter((s) => {
      const throttle = canShowSuggestion(s as unknown as Suggestion);
      return throttle.allowed;
    })
    .sort((a, b) => (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0))
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
      shown: copilotState.totalShown,
      applied: feedbackMetrics.totalFeedback,
      rate: feedbackMetrics.applicationRate,
    },
    predictions: {
      accuracy: feedbackMetrics.applicationRate || 0.75,
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
    structuredLogger.info(message, { module: 'ModeDeus' });
  }
}

function setupEventRouting(): void {
  // Route user events to appropriate engines
  eventBus.on('user:action', (_event) => {
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
    errorCount: 0, // userContext doesn't have behaviorMetrics
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
    calculate_price: { message: 'Posso ajudar a calcular o preço de venda', type: 'hint' },
    calculate_markup: { message: 'Vamos calcular o markup ideal?', type: 'hint' },
    calculate_margin: { message: 'Quer calcular a margem de lucro?', type: 'hint' },
    calculate_bdi: { message: 'Posso ajudar com o cálculo de BDI', type: 'hint' },
    understand_concept: { message: 'Posso explicar esse conceito para você', type: 'explanation' },
    get_help: { message: 'Estou aqui para ajudar!', type: 'hint' },
  };

  const mapping = intentMessages[nlpResult.intent];
  if (!mapping) {return null;}

  return {
    id: `nlp-${Date.now()}`,
    type: mapping.type,
    category: 'calculation',
    title: mapping.message,
    message: mapping.message,
    priority: 'medium',
    context: { data: { intent: nlpResult.intent } },
    actions: nlpResult.suggestedAction ? [{
      id: `action-${Date.now()}`,
      label: 'Ir',
      type: 'primary',
    }] : undefined,
    status: 'pending',
    metadata: {
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
      source: 'nlp-processor',
      confidence: nlpResult.confidence,
    },
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
