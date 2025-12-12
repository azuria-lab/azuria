/**
 * ProactiveAssistant - Assistente Proativo Inteligente
 * Modo Deus - Fase 5: NLP e Predição
 *
 * Responsabilidades:
 * - Orquestrar sugestões proativas no momento certo
 * - Combinar insights de múltiplos engines
 * - Priorizar e filtrar sugestões
 * - Gerenciar ciclo de vida de assistência
 * - Adaptar comportamento ao contexto
 *
 * @module azuria_ai/engines/proactiveAssistant
 */

import { eventBus } from '../events/eventBus';
import type { UserSuggestion } from '../types/operational';
import { personalization } from './personalizationEngine';
import { predictiveEngine } from './predictiveEngine';
import { feedbackLoop } from './feedbackLoopEngine';
import { nlpProcessor } from './nlpProcessorEngine';
import { explanationEngine } from './explanationEngine';
import { tutorialEngine } from './tutorialEngine';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tipo de assistência proativa
 */
export type AssistanceType =
  | 'suggestion' // Sugestão contextual
  | 'tip' // Dica rápida
  | 'warning' // Alerta preventivo
  | 'tutorial' // Oferta de tutorial
  | 'shortcut' // Atalho inteligente
  | 'explanation' // Explicação espontânea
  | 'encouragement' // Incentivo/gamificação
  | 'recovery'; // Recuperação de erro/abandono

/**
 * Item de assistência proativa
 */
export interface ProactiveAssistance {
  id: string;
  type: AssistanceType;
  priority: number; // 0-100
  title: string;
  message: string;
  action?: {
    label: string;
    handler: string; // Action identifier
    params?: Record<string, unknown>;
  };
  dismissable: boolean;
  expiresAt?: Date;
  context: {
    screen: string;
    trigger: string;
    reasoning: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Configuração do assistente
 */
export interface ProactiveConfig {
  enabled: boolean;
  maxActiveAssistances: number;
  minTimeBetweenAssistances: number; // ms
  enabledTypes: AssistanceType[];
  quietHours?: { start: number; end: number }; // 24h format
  aggressiveness: 'passive' | 'balanced' | 'proactive';
}

/**
 * Trigger para assistência
 */
export interface AssistanceTrigger {
  type: string;
  condition: (context: TriggerContext) => boolean;
  generator: (context: TriggerContext) => ProactiveAssistance | null;
  cooldown: number; // ms
  priority: number;
}

/**
 * Contexto para avaliação de triggers
 */
export interface TriggerContext {
  currentScreen: string;
  sessionDuration: number;
  idleTime: number;
  errorCount: number;
  lastAction: string;
  userSkillLevel: string;
  recentActions: string[];
  abandonmentRisk: number;
  timeOfDay: string;
}

// =============================================================================
// STATE
// =============================================================================

interface ProactiveState {
  initialized: boolean;
  config: ProactiveConfig;
  activeAssistances: Map<string, ProactiveAssistance>;
  triggers: AssistanceTrigger[];
  triggerCooldowns: Map<string, number>; // trigger type -> last fired timestamp
  lastAssistanceTime: number;
  suppressedUntil: number;
  stats: {
    generated: number;
    shown: number;
    dismissed: number;
    actedUpon: number;
  };
}

const defaultConfig: ProactiveConfig = {
  enabled: true,
  maxActiveAssistances: 3,
  minTimeBetweenAssistances: 30000, // 30s
  enabledTypes: [
    'suggestion',
    'tip',
    'warning',
    'tutorial',
    'shortcut',
    'explanation',
    'encouragement',
    'recovery',
  ],
  aggressiveness: 'balanced',
};

const state: ProactiveState = {
  initialized: false,
  config: { ...defaultConfig },
  activeAssistances: new Map(),
  triggers: [],
  triggerCooldowns: new Map(),
  lastAssistanceTime: 0,
  suppressedUntil: 0,
  stats: { generated: 0, shown: 0, dismissed: 0, actedUpon: 0 },
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o ProactiveAssistant
 */
export function initProactiveAssistant(
  config?: Partial<ProactiveConfig>
): void {
  if (state.initialized) {return;}

  if (config) {
    Object.assign(state.config, config);
  }

  // Register default triggers
  registerDefaultTriggers();

  // Setup event listeners
  setupEventListeners();

  state.initialized = true;

  console.log('[ProactiveAssistant] Initialized', {
    aggressiveness: state.config.aggressiveness,
    enabledTypes: state.config.enabledTypes.length,
  });
}

/**
 * Registra triggers padrão
 */
function registerDefaultTriggers(): void {
  // Idle user trigger
  registerTrigger({
    type: 'idle_user',
    condition: (ctx) => ctx.idleTime > 60000 && ctx.sessionDuration > 30000,
    generator: (ctx) => generateIdleAssistance(ctx),
    cooldown: 120000, // 2 min
    priority: 60,
  });

  // Error recovery trigger
  registerTrigger({
    type: 'error_recovery',
    condition: (ctx) => ctx.errorCount >= 2,
    generator: (ctx) => generateErrorRecoveryAssistance(ctx),
    cooldown: 60000, // 1 min
    priority: 80,
  });

  // Abandonment prevention trigger
  registerTrigger({
    type: 'abandonment_prevention',
    condition: (ctx) => ctx.abandonmentRisk >= 50,
    generator: (ctx) => generateAbandonmentPreventionAssistance(ctx),
    cooldown: 180000, // 3 min
    priority: 90,
  });

  // New user tutorial trigger
  registerTrigger({
    type: 'new_user_tutorial',
    condition: (ctx) =>
      ctx.userSkillLevel === 'beginner' &&
      ctx.sessionDuration < 60000 &&
      ctx.recentActions.length < 3,
    generator: () => generateTutorialOffer(),
    cooldown: 300000, // 5 min
    priority: 70,
  });

  // Shortcut suggestion trigger
  registerTrigger({
    type: 'shortcut_suggestion',
    condition: (ctx) => ctx.recentActions.length >= 5,
    generator: () => generateShortcutSuggestion(),
    cooldown: 180000, // 3 min
    priority: 40,
  });

  // Concept explanation trigger
  registerTrigger({
    type: 'concept_explanation',
    condition: (ctx) =>
      ctx.userSkillLevel !== 'expert' &&
      (ctx.currentScreen.includes('calculator') || ctx.currentScreen.includes('bdi')),
    generator: (ctx) => generateConceptExplanation(ctx),
    cooldown: 300000, // 5 min
    priority: 30,
  });

  // Encouragement trigger
  registerTrigger({
    type: 'encouragement',
    condition: (ctx) =>
      ctx.sessionDuration > 300000 && // 5 min session
      ctx.errorCount === 0,
    generator: () => generateEncouragement(),
    cooldown: 600000, // 10 min
    priority: 20,
  });
}

// =============================================================================
// TRIGGER MANAGEMENT
// =============================================================================

/**
 * Registra novo trigger
 */
export function registerTrigger(trigger: AssistanceTrigger): void {
  // Remove existing trigger of same type
  state.triggers = state.triggers.filter((t) => t.type !== trigger.type);
  state.triggers.push(trigger);

  // Sort by priority
  state.triggers.sort((a, b) => b.priority - a.priority);
}

/**
 * Remove trigger
 */
export function unregisterTrigger(type: string): void {
  state.triggers = state.triggers.filter((t) => t.type !== type);
}

/**
 * Avalia todos os triggers
 */
export function evaluateTriggers(context: TriggerContext): ProactiveAssistance[] {
  if (!state.config.enabled) {return [];}
  if (Date.now() < state.suppressedUntil) {return [];}

  const now = Date.now();
  const assistances: ProactiveAssistance[] = [];

  // Check quiet hours
  if (isQuietHours()) {return [];}

  // Check minimum time between assistances
  if (now - state.lastAssistanceTime < state.config.minTimeBetweenAssistances) {
    return [];
  }

  // Evaluate triggers in priority order
  for (const trigger of state.triggers) {
    // Check cooldown
    const lastFired = state.triggerCooldowns.get(trigger.type) ?? 0;
    if (now - lastFired < trigger.cooldown) {continue;}

    // Check condition
    try {
      if (!trigger.condition(context)) {continue;}

      // Generate assistance
      const assistance = trigger.generator(context);
      if (assistance) {
        // Check if type is enabled
        if (!state.config.enabledTypes.includes(assistance.type)) {continue;}

        // Check personalization
        const { show } = personalization.shouldShowProactiveSuggestion({
          currentScreen: context.currentScreen,
          timeOfDay: context.timeOfDay,
          userActivityState: context.idleTime > 30000 ? 'idle' : 'active',
        });

        if (!show && state.config.aggressiveness !== 'proactive') {continue;}

        assistances.push(assistance);
        state.triggerCooldowns.set(trigger.type, now);
        state.stats.generated++;

        // Stop if we have enough
        if (assistances.length >= state.config.maxActiveAssistances) {break;}
      }
    } catch (error) {
      console.warn(`[ProactiveAssistant] Trigger ${trigger.type} error:`, error);
    }
  }

  return assistances;
}

// =============================================================================
// ASSISTANCE GENERATORS
// =============================================================================

function generateIdleAssistance(ctx: TriggerContext): ProactiveAssistance {
  const messages = [
    'Precisa de ajuda? Estou aqui para auxiliar.',
    'Notei que você parou. Posso ajudar com algo?',
    'Quer uma dica sobre o que fazer a seguir?',
  ];

  return {
    id: `idle-${Date.now()}`,
    type: 'tip',
    priority: 60,
    title: 'Precisa de ajuda?',
    message: messages[Math.floor(Math.random() * messages.length)],
    action: {
      label: 'Ver sugestões',
      handler: 'show_suggestions',
    },
    dismissable: true,
    context: {
      screen: ctx.currentScreen,
      trigger: 'idle_user',
      reasoning: `Usuário inativo por ${Math.round(ctx.idleTime / 1000)}s`,
    },
  };
}

function generateErrorRecoveryAssistance(
  ctx: TriggerContext
): ProactiveAssistance {
  return {
    id: `error-recovery-${Date.now()}`,
    type: 'recovery',
    priority: 80,
    title: 'Encontrou dificuldades?',
    message: `Notei ${ctx.errorCount} erros. Posso ajudar a resolver ou mostrar um exemplo prático.`,
    action: {
      label: 'Ver exemplo',
      handler: 'show_example',
      params: { screen: ctx.currentScreen },
    },
    dismissable: true,
    context: {
      screen: ctx.currentScreen,
      trigger: 'error_recovery',
      reasoning: `${ctx.errorCount} erros detectados na sessão`,
    },
  };
}

function generateAbandonmentPreventionAssistance(
  ctx: TriggerContext
): ProactiveAssistance {
  const risk = ctx.abandonmentRisk;

  let message: string;
  let actionLabel: string;
  let handler: string;

  if (risk >= 70) {
    message = 'Parece que algo não está funcionando. Posso ajudar?';
    actionLabel = 'Sim, preciso de ajuda';
    handler = 'open_help';
  } else {
    message = 'Quer um atalho para completar sua tarefa mais rápido?';
    actionLabel = 'Ver atalhos';
    handler = 'show_shortcuts';
  }

  return {
    id: `abandonment-${Date.now()}`,
    type: 'recovery',
    priority: 90,
    title: 'Posso ajudar?',
    message,
    action: {
      label: actionLabel,
      handler,
    },
    dismissable: true,
    context: {
      screen: ctx.currentScreen,
      trigger: 'abandonment_prevention',
      reasoning: `Risco de abandono: ${risk}%`,
    },
  };
}

function generateTutorialOffer(): ProactiveAssistance {
  const suggestions = tutorialEngine.suggestTutorials(
    'beginner',
    'home'
  );

  const tutorial = suggestions[0]?.id ?? 'getting_started';

  return {
    id: `tutorial-offer-${Date.now()}`,
    type: 'tutorial',
    priority: 70,
    title: 'Bem-vindo! 👋',
    message: 'Quer fazer um tour rápido para conhecer as principais funcionalidades?',
    action: {
      label: 'Iniciar tour',
      handler: 'start_tutorial',
      params: { tutorialId: tutorial },
    },
    dismissable: true,
    expiresAt: new Date(Date.now() + 300000), // 5 min
    context: {
      screen: 'home',
      trigger: 'new_user_tutorial',
      reasoning: 'Usuário iniciante sem ações recentes',
    },
  };
}

function generateShortcutSuggestion(): ProactiveAssistance | null {
  const shortcuts = predictiveEngine.suggestShortcuts();

  if (shortcuts.length === 0) {return null;}

  const shortcut = shortcuts[0];

  return {
    id: `shortcut-${Date.now()}`,
    type: 'shortcut',
    priority: 40,
    title: 'Atalho sugerido ⚡',
    message: shortcut.reason,
    action: {
      label: shortcut.label,
      handler: 'navigate',
      params: { to: shortcut.action },
    },
    dismissable: true,
    context: {
      screen: '',
      trigger: 'shortcut_suggestion',
      reasoning: shortcut.reason,
    },
  };
}

function generateConceptExplanation(
  ctx: TriggerContext
): ProactiveAssistance | null {
  // Determine relevant concept from screen
  let concept: string | null = null;

  if (ctx.currentScreen.includes('markup')) {
    concept = 'markup_vs_margin';
  } else if (ctx.currentScreen.includes('margin')) {
    concept = 'markup_vs_margin';
  } else if (ctx.currentScreen.includes('bdi')) {
    concept = 'bdi';
  } else if (ctx.currentScreen.includes('price')) {
    concept = 'selling_price';
  }

  if (!concept) {return null;}

  const explanation = explanationEngine.getQuickExplanation(concept);
  if (!explanation) {return null;}

  return {
    id: `explanation-${Date.now()}`,
    type: 'explanation',
    priority: 30,
    title: `💡 ${explanation.title}`,
    message: explanation.content,
    action: {
      label: 'Saber mais',
      handler: 'show_full_explanation',
      params: { topic: concept },
    },
    dismissable: true,
    context: {
      screen: ctx.currentScreen,
      trigger: 'concept_explanation',
      reasoning: `Usuário ${ctx.userSkillLevel} na tela de ${concept}`,
    },
  };
}

function generateEncouragement(): ProactiveAssistance {
  const messages = [
    { title: 'Ótimo trabalho! 🌟', message: 'Você está usando a ferramenta sem erros. Continue assim!' },
    { title: 'Você está indo bem! 💪', message: 'Já dominou o básico. Que tal explorar recursos avançados?' },
    { title: 'Profissional! 👏', message: 'Sua sessão está fluindo perfeitamente.' },
  ];

  const selected = messages[Math.floor(Math.random() * messages.length)];

  return {
    id: `encouragement-${Date.now()}`,
    type: 'encouragement',
    priority: 20,
    title: selected.title,
    message: selected.message,
    dismissable: true,
    expiresAt: new Date(Date.now() + 10000), // 10s
    context: {
      screen: '',
      trigger: 'encouragement',
      reasoning: 'Sessão longa sem erros',
    },
  };
}

// =============================================================================
// ASSISTANCE MANAGEMENT
// =============================================================================

/**
 * Mostra assistência
 */
export function showAssistance(assistance: ProactiveAssistance): void {
  // Check max active
  if (state.activeAssistances.size >= state.config.maxActiveAssistances) {
    // Remove lowest priority
    const sorted = [...state.activeAssistances.values()].sort(
      (a, b) => a.priority - b.priority
    );
    if (sorted[0] && sorted[0].priority < assistance.priority) {
      state.activeAssistances.delete(sorted[0].id);
    } else {
      return; // Don't show if all active are higher priority
    }
  }

  state.activeAssistances.set(assistance.id, assistance);
  state.lastAssistanceTime = Date.now();
  state.stats.shown++;

  // Emit event
  eventBus.emit({
    type: 'user:suggestion_shown',
    payload: {
      suggestionId: assistance.id,
      type: assistance.type,
      priority: assistance.priority,
    },
  });

  // Track in personalization
  personalization.recordSuggestionShown();
}

/**
 * Descarta assistência
 */
export function dismissAssistance(assistanceId: string): void {
  const assistance = state.activeAssistances.get(assistanceId);

  if (assistance) {
    state.activeAssistances.delete(assistanceId);
    state.stats.dismissed++;

    // Record feedback
    feedbackLoop.recordSuggestionDismissed(
      assistanceId,
      assistance.type as UserSuggestion['type']
    ).catch(console.error);

    // Emit event
    eventBus.emit({
      type: 'user:suggestion_dismissed',
      payload: { suggestionId: assistanceId },
    });
  }
}

/**
 * Executa ação da assistência
 */
export function actOnAssistance(
  assistanceId: string
): { handler: string; params?: Record<string, unknown> } | null {
  const assistance = state.activeAssistances.get(assistanceId);

  if (!assistance || !assistance.action) {return null;}

  state.activeAssistances.delete(assistanceId);
  state.stats.actedUpon++;

  // Record feedback
  feedbackLoop.recordSuggestionApplied(
    assistanceId,
    assistance.type as UserSuggestion['type'],
    assistance.action.handler
  ).catch(console.error);

  personalization.recordSuggestionApplied();

  // Emit event
  eventBus.emit({
    type: 'user:suggestion_applied',
    payload: {
      suggestionId: assistanceId,
      action: assistance.action.handler,
    },
  });

  return {
    handler: assistance.action.handler,
    params: assistance.action.params,
  };
}

/**
 * Retorna assistências ativas
 */
export function getActiveAssistances(): ProactiveAssistance[] {
  // Clean expired
  const now = Date.now();
  for (const [id, assistance] of state.activeAssistances) {
    if (assistance.expiresAt && assistance.expiresAt.getTime() < now) {
      state.activeAssistances.delete(id);
    }
  }

  return [...state.activeAssistances.values()].sort(
    (a, b) => b.priority - a.priority
  );
}

// =============================================================================
// QUICK ASSISTANCE
// =============================================================================

/**
 * Gera sugestão rápida baseada em texto
 */
export function getQuickAssistance(
  userInput: string
): ProactiveAssistance | null {
  // Use NLP to understand intent
  const analysis = nlpProcessor.analyze(userInput);

  if (analysis.intent === 'unknown' || analysis.confidence < 0.4) {
    return null;
  }

  // Generate assistance based on intent
  let assistance: ProactiveAssistance | null = null;

  switch (analysis.intent) {
    case 'get_help':
      assistance = {
        id: `quick-help-${Date.now()}`,
        type: 'suggestion',
        priority: 70,
        title: 'Posso ajudar!',
        message: 'O que você precisa saber?',
        action: {
          label: 'Abrir ajuda',
          handler: 'open_help',
        },
        dismissable: true,
        context: {
          screen: '',
          trigger: 'user_input',
          reasoning: `Usuário pediu ajuda: "${userInput}"`,
        },
      };
      break;

    case 'understand_concept': {
      const concept = analysis.entities.find((e) => e.type === 'concept');
      if (concept) {
        assistance = {
          id: `quick-explain-${Date.now()}`,
          type: 'explanation',
          priority: 60,
          title: `Sobre ${concept.value}`,
          message: 'Posso explicar esse conceito para você.',
          action: {
            label: 'Ver explicação',
            handler: 'show_explanation',
            params: { topic: concept.normalizedValue },
          },
          dismissable: true,
          context: {
            screen: '',
            trigger: 'user_input',
            reasoning: `Usuário quer entender: ${concept.value}`,
          },
        };
      }
      break;
    }

    case 'calculate_price':
    case 'calculate_markup':
    case 'calculate_margin':
    case 'calculate_bdi': {
      const calcType = analysis.intent.replace('calculate_', '');
      assistance = {
        id: `quick-calc-${Date.now()}`,
        type: 'shortcut',
        priority: 80,
        title: `Calculadora de ${calcType}`,
        message: analysis.suggestedAction ?? `Ir para calculadora de ${calcType}`,
        action: {
          label: 'Abrir calculadora',
          handler: 'navigate',
          params: { to: `/calculadoras/${calcType}` },
        },
        dismissable: true,
        context: {
          screen: '',
          trigger: 'user_input',
          reasoning: `Usuário quer calcular ${calcType}`,
        },
      };
      break;
    }
  }

  return assistance;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Atualiza configuração
 */
export function updateProactiveConfig(
  config: Partial<ProactiveConfig>
): void {
  Object.assign(state.config, config);
}

/**
 * Retorna configuração atual
 */
export function getProactiveConfig(): ProactiveConfig {
  return { ...state.config };
}

/**
 * Suprime assistências por um período
 */
export function suppressAssistances(durationMs: number): void {
  state.suppressedUntil = Date.now() + durationMs;
}

/**
 * Verifica se está em horário silencioso
 */
function isQuietHours(): boolean {
  if (!state.config.quietHours) {return false;}

  const hour = new Date().getHours();
  const { start, end } = state.config.quietHours;

  if (start < end) {
    return hour >= start && hour < end;
  } else {
    // Spans midnight
    return hour >= start || hour < end;
  }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function setupEventListeners(): void {
  // Listen to user errors
  eventBus.on('user:error', () => {
    // Could trigger immediate evaluation
  });

  // Listen to navigation
  eventBus.on('user:navigated', (event) => {
    const { to } = event.payload;

    // Update predictive engine
    predictiveEngine.recordAction(`navigate:${to}`);
  });
}

// =============================================================================
// STATS
// =============================================================================

/**
 * Retorna estatísticas
 */
export function getProactiveStats(): {
  generated: number;
  shown: number;
  dismissed: number;
  actedUpon: number;
  conversionRate: number;
  activeCount: number;
  registeredTriggers: number;
} {
  const conversionRate =
    state.stats.shown > 0 ? state.stats.actedUpon / state.stats.shown : 0;

  return {
    ...state.stats,
    conversionRate,
    activeCount: state.activeAssistances.size,
    registeredTriggers: state.triggers.length,
  };
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Limpa assistências ativas
 */
export function clearActiveAssistances(): void {
  state.activeAssistances.clear();
}

/**
 * Reseta o engine
 */
export function resetProactiveAssistant(): void {
  state.initialized = false;
  state.config = { ...defaultConfig };
  state.activeAssistances.clear();
  state.triggers = [];
  state.triggerCooldowns.clear();
  state.lastAssistanceTime = 0;
  state.suppressedUntil = 0;
  state.stats = { generated: 0, shown: 0, dismissed: 0, actedUpon: 0 };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const proactiveAssistant = {
  init: initProactiveAssistant,
  registerTrigger,
  unregisterTrigger,
  evaluate: evaluateTriggers,
  show: showAssistance,
  dismiss: dismissAssistance,
  act: actOnAssistance,
  getActive: getActiveAssistances,
  getQuick: getQuickAssistance,
  updateConfig: updateProactiveConfig,
  getConfig: getProactiveConfig,
  suppress: suppressAssistances,
  getStats: getProactiveStats,
  clearActive: clearActiveAssistances,
  reset: resetProactiveAssistant,
};

export default proactiveAssistant;
