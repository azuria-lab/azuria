/**
 * TipEngine - Motor de Dicas Contextuais
 * Modo Deus - Nível 44: Assistência Contextual
 *
 * Responsabilidades:
 * - Gerar dicas contextuais baseadas na tela atual
 * - Timing otimizado para não interromper o fluxo
 * - Adaptar ao skill level do usuário
 * - Integração com PatternLearning e Predictive
 * - UI não-intrusiva
 *
 * @module azuria_ai/engines/tipEngine
 */

import { eventBus } from '../events/eventBus';
import { patternLearning } from './patternLearningEngine';
import { predictiveEngine } from './predictiveEngine';
import type { UserSuggestion } from '../types/operational';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tipos de dicas
 */
export type TipType =
  | 'quick_action' // Ação rápida sugerida
  | 'shortcut' // Atalho de teclado
  | 'feature_discovery' // Descoberta de recurso
  | 'best_practice' // Boa prática
  | 'time_saver' // Economia de tempo
  | 'pro_tip' // Dica profissional
  | 'warning' // Aviso preventivo
  | 'help'; // Ajuda contextual

/**
 * Categoria de dica
 */
export type TipCategory =
  | 'calculator' // Dicas de calculadora
  | 'navigation' // Navegação
  | 'data_entry' // Entrada de dados
  | 'export' // Exportação
  | 'pricing' // Precificação
  | 'general'; // Geral

/**
 * Skill level do usuário
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Contexto para geração de dica
 */
export interface TipContext {
  currentScreen: string;
  userSkillLevel: SkillLevel;
  sessionDuration: number;
  recentActions: string[];
  idleTime: number;
  isTyping: boolean;
  errorCount: number;
  completedTasks: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Dica gerada
 */
export interface ContextualTip {
  id: string;
  type: TipType;
  category: TipCategory;
  title: string;
  message: string;
  action?: {
    label: string;
    handler: string; // Event to emit or function to call
  };
  triggerConditions: string[];
  displayDuration: number; // ms
  priority: 'low' | 'medium' | 'high';
  targetSkillLevels: SkillLevel[];
}

/**
 * Configuração de throttle
 */
interface ThrottleConfig {
  minTimeBetweenTips: number; // ms
  maxTipsPerHour: number;
  respectTyping: boolean;
  respectErrors: boolean;
}

// =============================================================================
// STATE
// =============================================================================

interface TipEngineState {
  initialized: boolean;
  currentContext: TipContext;
  lastTipShownAt: number;
  tipsShownThisHour: number;
  lastHourReset: number;
  userSkillLevel: SkillLevel;
  suppressedCategories: Set<TipCategory>;
  shownTipIds: Set<string>; // Para não repetir
}

const state: TipEngineState = {
  initialized: false,
  currentContext: {
    currentScreen: '',
    userSkillLevel: 'beginner',
    sessionDuration: 0,
    recentActions: [],
    idleTime: 0,
    isTyping: false,
    errorCount: 0,
    completedTasks: [],
    timeOfDay: 'morning',
  },
  lastTipShownAt: 0,
  tipsShownThisHour: 0,
  lastHourReset: Date.now(),
  userSkillLevel: 'beginner',
  suppressedCategories: new Set(),
  shownTipIds: new Set(),
};

// Configuration
const CONFIG: ThrottleConfig = {
  minTimeBetweenTips: 120000, // 2 minutes
  maxTipsPerHour: 5,
  respectTyping: true,
  respectErrors: true, // Don't show tips if user just had errors
};

// =============================================================================
// TIP LIBRARY
// =============================================================================

/**
 * Biblioteca de dicas pré-definidas
 */
const TIP_LIBRARY: Record<string, ContextualTip[]> = {
  'calculator/markup': [
    {
      id: 'markup-shortcut',
      type: 'shortcut',
      category: 'calculator',
      title: 'Atalho rápido',
      message: 'Pressione Tab para navegar entre os campos rapidamente',
      triggerConditions: ['first_visit', 'beginner'],
      displayDuration: 5000,
      priority: 'low',
      targetSkillLevels: ['beginner', 'intermediate'],
    },
    {
      id: 'markup-vs-margin',
      type: 'feature_discovery',
      category: 'calculator',
      title: 'Diferença importante',
      message: 'Markup e Margem são diferentes! Clique em "?" para entender a diferença',
      action: {
        label: 'Ver explicação',
        handler: 'show-markup-margin-explanation',
      },
      triggerConditions: ['multiple_visits', 'confusion_detected'],
      displayDuration: 8000,
      priority: 'high',
      targetSkillLevels: ['beginner'],
    },
    {
      id: 'markup-quick-calc',
      type: 'time_saver',
      category: 'calculator',
      title: 'Cálculo rápido',
      message: 'Digite o valor e pressione Enter para calcular automaticamente',
      triggerConditions: ['intermediate_user'],
      displayDuration: 4000,
      priority: 'medium',
      targetSkillLevels: ['intermediate'],
    },
  ],
  'calculator/margin': [
    {
      id: 'margin-recommendation',
      type: 'best_practice',
      category: 'pricing',
      title: 'Margem saudável',
      message: 'Para produtos de revenda, recomenda-se margem mínima de 30%',
      triggerConditions: ['low_margin_entered'],
      displayDuration: 6000,
      priority: 'medium',
      targetSkillLevels: ['beginner', 'intermediate'],
    },
    {
      id: 'margin-history',
      type: 'feature_discovery',
      category: 'calculator',
      title: 'Histórico salvo',
      message: 'Seus cálculos ficam salvos no histórico. Acesse pelo menu lateral',
      triggerConditions: ['multiple_calculations'],
      displayDuration: 5000,
      priority: 'low',
      targetSkillLevels: ['beginner'],
    },
  ],
  'calculator/price': [
    {
      id: 'price-taxes',
      type: 'warning',
      category: 'pricing',
      title: 'Atenção aos impostos',
      message: 'Não esqueça de incluir os impostos no cálculo. Verifique a categoria tributária',
      triggerConditions: ['no_tax_selected'],
      displayDuration: 7000,
      priority: 'high',
      targetSkillLevels: ['beginner', 'intermediate'],
    },
    {
      id: 'price-advanced-calc',
      type: 'pro_tip',
      category: 'calculator',
      title: 'Calculadora avançada',
      message: 'Experimente a Calculadora Avançada para múltiplos produtos de uma vez',
      triggerConditions: ['frequent_user', 'multiple_calculations'],
      displayDuration: 6000,
      priority: 'medium',
      targetSkillLevels: ['intermediate', 'advanced'],
    },
  ],
  'calculator/bdi': [
    {
      id: 'bdi-complexity',
      type: 'help',
      category: 'calculator',
      title: 'Cálculo complexo',
      message: 'BDI inclui custos indiretos. Preencha todos os campos para precisão',
      triggerConditions: ['first_visit'],
      displayDuration: 8000,
      priority: 'high',
      targetSkillLevels: ['beginner'],
    },
  ],
  'export': [
    {
      id: 'export-formats',
      type: 'feature_discovery',
      category: 'export',
      title: 'Múltiplos formatos',
      message: 'Você pode exportar em PDF, Excel ou CSV. Escolha o melhor para você',
      triggerConditions: ['first_export'],
      displayDuration: 5000,
      priority: 'medium',
      targetSkillLevels: ['beginner', 'intermediate'],
    },
  ],
  'home': [
    {
      id: 'home-quick-start',
      type: 'quick_action',
      category: 'navigation',
      title: 'Comece rápido',
      message: 'A maioria dos usuários começa pela Calculadora de Markup. Quer tentar?',
      action: {
        label: 'Ir para Markup',
        handler: 'navigate-to-markup',
      },
      triggerConditions: ['new_user', 'idle'],
      displayDuration: 10000,
      priority: 'high',
      targetSkillLevels: ['beginner'],
    },
  ],
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o TipEngine
 */
export function initTipEngine(): void {
  if (state.initialized) {return;}

  // Detectar skill level do usuário
  detectUserSkillLevel();

  // Setup event listeners
  setupEventListeners();

  // Start periodic context updates
  startContextMonitoring();

  state.initialized = true;

  // eslint-disable-next-line no-console
  console.log('[TipEngine] Initialized', {
    skillLevel: state.userSkillLevel,
    throttle: CONFIG,
  });
}

/**
 * Detecta skill level do usuário baseado em padrões
 */
function detectUserSkillLevel(): void {
  try {
    // Tenta obter do PatternLearning
    const patterns = patternLearning.getByType('skill_progression');
    
    if (patterns.length > 0) {
      const sortedPatterns = [...patterns].sort(
        (a, b) => b.lastDetected.getTime() - a.lastDetected.getTime()
      );
      const latest = sortedPatterns[0];
      
      const data = latest.data as { level?: SkillLevel };
      state.userSkillLevel = data.level ?? 'beginner';
      state.currentContext.userSkillLevel = state.userSkillLevel;
      return;
    }

    // Heurística baseada em uso
    const calcPatterns = patternLearning.getByType('calculation');
    const navPatterns = patternLearning.getByType('navigation');

    const totalUsage = calcPatterns.length + navPatterns.length;

    if (totalUsage > 50) {state.userSkillLevel = 'expert';}
    else if (totalUsage > 20) {state.userSkillLevel = 'advanced';}
    else if (totalUsage > 5) {state.userSkillLevel = 'intermediate';}
    else {state.userSkillLevel = 'beginner';}

    state.currentContext.userSkillLevel = state.userSkillLevel;
  } catch {
    // Default to beginner
    state.userSkillLevel = 'beginner';
    state.currentContext.userSkillLevel = 'beginner';
  }
}

// =============================================================================
// CONTEXT MANAGEMENT
// =============================================================================

/**
 * Atualiza contexto da dica
 */
export function updateTipContext(context: Partial<TipContext>): void {
  Object.assign(state.currentContext, context);

  // Auto-detect time of day
  if (!context.timeOfDay) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {state.currentContext.timeOfDay = 'morning';}
    else if (hour >= 12 && hour < 17) {state.currentContext.timeOfDay = 'afternoon';}
    else if (hour >= 17 && hour < 21) {state.currentContext.timeOfDay = 'evening';}
    else {state.currentContext.timeOfDay = 'night';}
  }
}

/**
 * Atualiza tela atual
 */
export function setCurrentScreen(screen: string): void {
  state.currentContext.currentScreen = screen;
  
  // Try to show relevant tip after screen change
  setTimeout(() => {
    tryShowContextualTip();
  }, 2000); // Wait 2s for user to settle
}

// =============================================================================
// TIP GENERATION
// =============================================================================

/**
 * Tenta mostrar dica contextual
 */
export function tryShowContextualTip(): UserSuggestion | null {
  // Check throttle
  if (!canShowTip()) {
    return null;
  }

  // Generate tip
  const tip = generateBestTip();

  if (!tip) {
    return null;
  }

  // Mark as shown
  markTipShown(tip.id);

  // Convert to UserSuggestion
  const suggestion = tipToSuggestion(tip);

  // Emit event
  eventBus.emit('user:suggestion', {
    suggestion,
    userContext: state.currentContext,
  }, { source: 'tip-engine' });

  return suggestion;
}

/**
 * Gera a melhor dica para o contexto atual
 */
function generateBestTip(): ContextualTip | null {
  const { currentScreen, userSkillLevel } = state.currentContext;

  // Get tips for current screen
  const screenTips = TIP_LIBRARY[currentScreen] ?? [];

  if (screenTips.length === 0) {
    return null;
  }

  // Filter by skill level and conditions
  const relevantTips = screenTips.filter((tip) => {
    // Already shown?
    if (state.shownTipIds.has(tip.id)) {
      return false;
    }

    // Right skill level?
    if (!tip.targetSkillLevels.includes(userSkillLevel)) {
      return false;
    }

    // Category suppressed?
    if (state.suppressedCategories.has(tip.category)) {
      return false;
    }

    // Check trigger conditions
    return checkTriggerConditions(tip.triggerConditions);
  });

  if (relevantTips.length === 0) {
    return null;
  }

  // Sort by priority
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  relevantTips.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  return relevantTips[0];
}

/**
 * Verifica condições de trigger
 */
function checkTriggerConditions(conditions: string[]): boolean {
  // Check if ANY condition is satisfied (OR logic)
  for (const condition of conditions) {
    const conditionMet = checkSingleCondition(condition);
    if (conditionMet) {
      return true;
    }
  }
  // If no conditions provided, return true
  return conditions.length === 0;
}

function checkSingleCondition(condition: string): boolean {
  switch (condition) {
    case 'first_visit':
      // Check if this is first time on this screen
      return state.currentContext.sessionDuration < 60000;

    case 'multiple_visits':
      // User has been here before
      return state.currentContext.sessionDuration > 60000;

    case 'beginner':
      return state.userSkillLevel === 'beginner';

    case 'intermediate_user':
      return state.userSkillLevel === 'intermediate';

    case 'frequent_user':
      return ['advanced', 'expert'].includes(state.userSkillLevel);

    case 'idle':
      return state.currentContext.idleTime > 30000; // 30s idle

    case 'new_user':
      return state.userSkillLevel === 'beginner' && 
             state.currentContext.completedTasks.length === 0;

    case 'multiple_calculations':
      return state.currentContext.completedTasks.length >= 3;

    case 'no_tax_selected':
      // Would need to check actual form state
      return false; // Placeholder

    case 'low_margin_entered':
      // Would need to check actual form state
      return false; // Placeholder

    case 'confusion_detected': {
      // Check for back-and-forth navigation
      const recent = state.currentContext.recentActions.slice(-5);
      return new Set(recent).size <= 2 && recent.length >= 4;
    }

    case 'first_export':
      return !state.currentContext.completedTasks.some(t => t.includes('export'));

    case 'high_probability':
      // For predictive tips - always considered met if we got here
      return true;

    default:
      return false;
  }
}

/**
 * Converte ContextualTip para UserSuggestion
 */
function tipToSuggestion(tip: ContextualTip): UserSuggestion {
  return {
    id: tip.id,
    type: 'hint',
    category: 'general',
    priority: tip.priority,
    title: tip.title,
    message: tip.message,
    actions: tip.action ? [{
      id: 'primary',
      label: tip.action.label,
      type: 'primary',
      data: { handler: tip.action.handler },
    }] : undefined,
    metadata: {
      createdAt: Date.now(),
      expiresAt: Date.now() + tip.displayDuration,
      source: 'tip-engine',
      confidence: 0.8,
    },
    context: {
      trigger: 'tip-engine',
      data: {
        tipType: tip.type,
        tipCategory: tip.category,
      },
    },
    status: 'pending',
  };
}

// =============================================================================
// THROTTLING
// =============================================================================

/**
 * Verifica se pode mostrar dica agora
 */
function canShowTip(): boolean {
  const now = Date.now();

  // Reset hourly counter
  if (now - state.lastHourReset > 3600000) {
    state.tipsShownThisHour = 0;
    state.lastHourReset = now;
  }

  // Max per hour
  if (state.tipsShownThisHour >= CONFIG.maxTipsPerHour) {
    return false;
  }

  // Min time between tips
  if (now - state.lastTipShownAt < CONFIG.minTimeBetweenTips) {
    return false;
  }

  // Respect typing
  if (CONFIG.respectTyping && state.currentContext.isTyping) {
    return false;
  }

  // Respect errors
  if (CONFIG.respectErrors && state.currentContext.errorCount > 0) {
    return false;
  }

  return true;
}

/**
 * Marca dica como mostrada
 */
function markTipShown(tipId: string): void {
  state.lastTipShownAt = Date.now();
  state.tipsShownThisHour++;
  state.shownTipIds.add(tipId);
}

// =============================================================================
// PREDICTIVE INTEGRATION
// =============================================================================

/**
 * Gera dica baseada em predição
 */
export function generatePredictiveTip(): ContextualTip | null {
  try {
    const prediction = predictiveEngine.getMostLikely();

    if (!prediction || prediction.probability < 0.7) {
      return null;
    }

    return {
      id: `predictive-${prediction.action}`,
      type: 'quick_action',
      category: 'navigation',
      title: 'Próxima ação sugerida',
      message: `A maioria dos usuários vai para ${formatAction(prediction.action)}. Quer ir direto?`,
      action: {
        label: 'Ir agora',
        handler: `navigate-to-${prediction.action}`,
      },
      triggerConditions: ['high_probability'],
      displayDuration: 8000,
      priority: 'medium',
      targetSkillLevels: ['intermediate', 'advanced', 'expert'],
    };
  } catch {
    return null;
  }
}

function formatAction(action: string): string {
  const labels: Record<string, string> = {
    'calculator/markup': 'Calculadora de Markup',
    'calculator/margin': 'Calculadora de Margem',
    'calculator/price': 'Preço de Venda',
    'export': 'Exportação',
  };
  return labels[action] ?? action;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Suprime categoria de dicas
 */
export function suppressCategory(category: TipCategory): void {
  state.suppressedCategories.add(category);
}

/**
 * Habilita categoria de dicas
 */
export function enableCategory(category: TipCategory): void {
  state.suppressedCategories.delete(category);
}

/**
 * Atualiza configuração de throttle
 */
export function updateThrottleConfig(config: Partial<ThrottleConfig>): void {
  Object.assign(CONFIG, config);
}

/**
 * Define skill level manualmente
 */
export function setUserSkillLevel(level: SkillLevel): void {
  state.userSkillLevel = level;
  state.currentContext.userSkillLevel = level;
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function setupEventListeners(): void {
  // Listen to navigation
  eventBus.on('user:navigation', (event) => {
    setCurrentScreen(event.payload.to ?? event.payload.screen ?? '');
  });

  // Listen to typing
  eventBus.on('user:input', () => {
    state.currentContext.isTyping = true;
    setTimeout(() => {
      state.currentContext.isTyping = false;
    }, 3000);
  });

  // Listen to errors
  eventBus.on('user:error', () => {
    state.currentContext.errorCount++;
    // Reset after 5 minutes
    setTimeout(() => {
      if (state.currentContext.errorCount > 0) {
        state.currentContext.errorCount--;
      }
    }, 300000);
  });

  // Listen to task completion (using calculation as proxy)
  eventBus.on('user:calculation', (event) => {
    const taskType = event.payload.calculationType ?? event.payload.type ?? 'calculation';
    state.currentContext.completedTasks.push(taskType);
  });
}

// =============================================================================
// MONITORING
// =============================================================================

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

function startContextMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }

  monitoringInterval = setInterval(() => {
    // Update session duration
    state.currentContext.sessionDuration += 30000;

    // Try to show tip if idle
    if (state.currentContext.idleTime > 60000) {
      tryShowContextualTip();
    }
  }, 30000); // Every 30s
}

// =============================================================================
// STATS & DEBUG
// =============================================================================

/**
 * Retorna estatísticas do engine
 */
export function getTipStats(): {
  skillLevel: SkillLevel;
  tipsShownThisHour: number;
  totalTipsShown: number;
  suppressedCategories: string[];
  currentContext: TipContext;
} {
  return {
    skillLevel: state.userSkillLevel,
    tipsShownThisHour: state.tipsShownThisHour,
    totalTipsShown: state.shownTipIds.size,
    suppressedCategories: [...state.suppressedCategories],
    currentContext: { ...state.currentContext },
  };
}

/**
 * Reseta dicas mostradas (para testes)
 */
export function resetShownTips(): void {
  state.shownTipIds.clear();
}

/**
 * Reseta completamente o engine
 */
export function resetTipEngine(): void {
  state.initialized = false;
  state.shownTipIds.clear();
  state.suppressedCategories.clear();
  state.tipsShownThisHour = 0;
  state.lastTipShownAt = 0;

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const tipEngine = {
  init: initTipEngine,
  updateContext: updateTipContext,
  setScreen: setCurrentScreen,
  tryShow: tryShowContextualTip,
  generatePredictive: generatePredictiveTip,
  suppressCategory,
  enableCategory,
  updateThrottle: updateThrottleConfig,
  setSkillLevel: setUserSkillLevel,
  getStats: getTipStats,
  resetShown: resetShownTips,
  reset: resetTipEngine,
};

export default tipEngine;
