/**
 * @fileoverview OperationalAIEngine - Motor de IA Operacional (Co-Piloto)
 *
 * Motor principal que coordena a inteligência operacional
 * voltada para assistência de usuários finais.
 *
 * Diferente do motor estratégico (admin), o operacional:
 * - Foca em ajudar o usuário em tempo real
 * - Gera sugestões não-intrusivas
 * - Aprende preferências individuais
 * - Respeita throttling para não irritar
 *
 * @module azuria_ai/engines/operationalAIEngine
 */

import { emitEvent, on } from '../core/eventBus';
import type {
  CoPilotConfig,
  CreateSuggestionInput,
  Suggestion,
  SuggestionFeedback,
  ThrottleRules,
  UserContext,
} from '../types/operational';
import { structuredLogger } from '../../services/structuredLogger';

// ============================================================================
// Types
// ============================================================================

interface EngineState {
  initialized: boolean;
  userContext: UserContext | null;
  pendingSuggestions: Suggestion[];
  shownSuggestions: Map<string, Suggestion>;
  dismissedSuggestions: Set<string>;
  lastSuggestionAt: number;
  suggestionCount: number;
  config: CoPilotConfig;
  throttle: ThrottleRules;
}

interface SuggestionRule {
  id: string;
  name: string;
  condition: (ctx: UserContext) => boolean;
  generate: (ctx: UserContext) => CreateSuggestionInput;
  cooldown: number;
  lastFired?: number;
}

// ============================================================================
// User Event Types
// ============================================================================

const USER_EVENTS = {
  COPILOT_READY: 'user:copilot-ready',
  CONTEXT_CHANGED: 'user:context-updated',
  SUGGESTION_SHOWN: 'user:suggestion',
  SUGGESTION_ACCEPTED: 'user:suggestion-accepted',
  SUGGESTION_DISMISSED: 'user:suggestion-dismissed',
  SUGGESTION_EXPIRED: 'user:suggestion-expired',
  FEEDBACK_GIVEN: 'user:feedback-given',
  CONFIG_CHANGED: 'user:config-changed',
  COPILOT_ENABLED: 'user:copilot-enabled',
  COPILOT_DISABLED: 'user:copilot-disabled',
} as const;

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: CoPilotConfig = {
  enabled: true,
  maxVisibleSuggestions: 3,
  minSuggestionInterval: 20000,
  showProactiveSuggestions: true,
  explanationLevel: 'brief',
  soundEnabled: false,
  position: 'bottom-right',
};

const DEFAULT_THROTTLE: ThrottleRules = {
  maxPerMinute: 3,
  maxSameTypePerHour: 5,
  dismissCooldown: 60000,
  silenceWhileTyping: true,
  silenceAfterError: true,
  errorSilenceDuration: 5000,
};

// ============================================================================
// Suggestion Rules
// ============================================================================

const SUGGESTION_RULES: SuggestionRule[] = [
  {
    id: 'hesitating-price',
    name: 'Hesitação em Preço',
    condition: (ctx) =>
      ctx.activityState === 'hesitating' &&
      ctx.currentScreen.includes('calculadora'),
    generate: (ctx) => ({
      type: 'hint',
      category: 'pricing',
      priority: 'medium',
      title: 'Precisa de ajuda com o preço?',
      message:
        'Posso explicar como cada campo afeta o cálculo final. Clique para ver dicas.',
      actions: [
        { label: 'Ver explicação', type: 'primary' },
        { label: 'Não, obrigado', type: 'dismiss' },
      ],
      context: {
        screen: ctx.currentScreen,
        trigger: 'hesitation',
        data: { hesitationDuration: Date.now() - ctx.lastActionAt },
      },
    }),
    cooldown: 120000,
  },
  {
    id: 'first-calculation',
    name: 'Primeiro Cálculo',
    condition: (ctx) =>
      ctx.calculationsCount === 1 && ctx.skillLevel === 'beginner',
    generate: () => ({
      type: 'hint',
      category: 'general',
      priority: 'low',
      title: '🎉 Primeiro cálculo feito!',
      message:
        'Você pode salvar este cálculo para consultar depois. Use o botão "Salvar" no resultado.',
      actions: [
        { label: 'Como salvar?', type: 'primary' },
        { label: 'Entendi', type: 'dismiss' },
      ],
    }),
    cooldown: 0,
  },
  {
    id: 'error-help',
    name: 'Ajuda com Erro',
    condition: (ctx) =>
      ctx.activityState === 'error-state' && ctx.errorsCount > 0,
    generate: (ctx) => ({
      type: 'warning',
      category: 'general',
      priority: 'high',
      title: 'Algo deu errado?',
      message:
        'Parece que você encontrou um problema. Posso ajudar a resolver.',
      actions: [
        { label: 'Preciso de ajuda', type: 'primary' },
        { label: 'Tentar novamente', type: 'secondary' },
        { label: 'Resolver sozinho', type: 'dismiss' },
      ],
      context: {
        screen: ctx.currentScreen,
        trigger: 'error',
        data: { errorCount: ctx.errorsCount },
      },
    }),
    cooldown: 30000,
  },
  {
    id: 'idle-reminder',
    name: 'Lembrete de Inatividade',
    condition: (ctx) =>
      ctx.activityState === 'idle' && Date.now() - ctx.lastActionAt > 180000,
    generate: (ctx) => ({
      type: 'hint',
      category: 'general',
      priority: 'low',
      title: 'Ainda por aqui?',
      message:
        'Seu progresso foi salvo automaticamente. Pode continuar quando quiser.',
      actions: [
        { label: 'Continuar', type: 'primary' },
        { label: 'Ok', type: 'dismiss' },
      ],
      context: {
        trigger: 'idle',
        data: { idleDuration: Date.now() - ctx.lastActionAt },
      },
    }),
    cooldown: 300000,
  },
  {
    id: 'frequent-visits',
    name: 'Visitas Frequentes',
    condition: (ctx) => {
      const visits = ctx.screenHistory.filter(
        (s) => s === ctx.currentScreen
      ).length;
      return visits >= 3;
    },
    generate: (ctx) => ({
      type: 'opportunity',
      category: 'navigation',
      priority: 'medium',
      title: 'Você voltou aqui várias vezes',
      message:
        'Posso mostrar um atalho ou adicionar esta página aos favoritos?',
      actions: [
        { label: 'Criar atalho', type: 'primary' },
        { label: 'Não precisa', type: 'dismiss' },
      ],
      context: {
        screen: ctx.currentScreen,
        trigger: 'frequent-visits',
        data: {
          visitCount: ctx.screenHistory.filter((s) => s === ctx.currentScreen)
            .length,
        },
      },
    }),
    cooldown: 600000,
  },
];

// ============================================================================
// Engine State
// ============================================================================

let state: EngineState = {
  initialized: false,
  userContext: null,
  pendingSuggestions: [],
  shownSuggestions: new Map(),
  dismissedSuggestions: new Set(),
  lastSuggestionAt: 0,
  suggestionCount: 0,
  config: DEFAULT_CONFIG,
  throttle: DEFAULT_THROTTLE,
};

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `sug_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function canShowSuggestion(rule: SuggestionRule): boolean {
  const { config, throttle, lastSuggestionAt } = state;
  const now = Date.now();

  if (now - lastSuggestionAt < 60000 / throttle.maxPerMinute) {
    return false;
  }

  if (rule.lastFired && now - rule.lastFired < rule.cooldown) {
    return false;
  }

  if (
    throttle.silenceWhileTyping &&
    state.userContext?.activityState === 'filling-form'
  ) {
    return false;
  }

  if (state.shownSuggestions.size >= config.maxVisibleSuggestions) {
    return false;
  }

  return true;
}

function createSuggestionFromInput(input: CreateSuggestionInput): Suggestion {
  const id = generateId();
  return {
    id,
    type: input.type,
    priority: input.priority ?? 'medium',
    category: input.category,
    title: input.title,
    message: input.message,
    details: input.details,
    actions: input.actions?.map((a, i) => ({ ...a, id: `${id}_action_${i}` })),
    context: input.context,
    metadata: {
      createdAt: Date.now(),
      expiresAt: input.expiresInMs ? Date.now() + input.expiresInMs : undefined,
      source: 'operationalAIEngine',
      confidence: input.confidence ?? 0.8,
    },
    status: 'pending',
  };
}

function shouldShowImmediately(suggestion: Suggestion): boolean {
  return suggestion.priority === 'high' || suggestion.priority === 'critical';
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Inicializa o motor operacional
 */
export function initOperationalEngine(
  config?: Partial<CoPilotConfig>,
  throttle?: Partial<ThrottleRules>
): void {
  if (state.initialized) {
    structuredLogger.warn('OperationalAIEngine já inicializado');
    return;
  }

  state = {
    ...state,
    initialized: true,
    config: { ...DEFAULT_CONFIG, ...config },
    throttle: { ...DEFAULT_THROTTLE, ...throttle },
  };

  setupEventListeners();

  structuredLogger.info('OperationalAIEngine inicializado', {
    module: 'OperationalAIEngine',
    action: 'init',
  });

  emitEvent(
    USER_EVENTS.COPILOT_READY,
    { config: state.config },
    { source: 'operationalAIEngine', priority: 5 }
  );
}

/**
 * Atualiza o contexto do usuário e avalia regras
 */
export function updateUserContext(context: Partial<UserContext>): void {
  if (!state.initialized) {
    structuredLogger.warn('OperationalAIEngine não inicializado');
    return;
  }

  const previousContext = state.userContext;

  state.userContext = {
    ...state.userContext,
    ...context,
  } as UserContext;

  emitEvent(
    USER_EVENTS.CONTEXT_CHANGED,
    {
      previous: previousContext,
      current: state.userContext,
    },
    { source: 'operationalAIEngine', priority: 4 }
  );

  evaluateSuggestionRules();
}

/**
 * Avalia todas as regras de sugestão
 */
function evaluateSuggestionRules(): void {
  if (!state.userContext || !state.config.enabled) {
    return;
  }

  for (const rule of SUGGESTION_RULES) {
    try {
      if (rule.condition(state.userContext) && canShowSuggestion(rule)) {
        const suggestionInput = rule.generate(state.userContext);
        const suggestion = createSuggestionFromInput(suggestionInput);

        rule.lastFired = Date.now();

        if (shouldShowImmediately(suggestion)) {
          showSuggestion(suggestion);
        } else {
          state.pendingSuggestions.push(suggestion);
        }

        structuredLogger.debug(`Sugestão gerada: ${rule.name}`, {
          module: 'OperationalAIEngine',
          action: 'suggestion-generated',
          data: { ruleId: rule.id, suggestionId: suggestion.id },
        });
      }
    } catch (err) {
      structuredLogger.error(
        `Erro ao avaliar regra ${rule.id}`,
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }
}

/**
 * Mostra uma sugestão ao usuário
 */
function showSuggestion(suggestion: Suggestion): void {
  suggestion.status = 'shown';

  state.shownSuggestions.set(suggestion.id, suggestion);
  state.lastSuggestionAt = Date.now();
  state.suggestionCount++;

  emitEvent(
    USER_EVENTS.SUGGESTION_SHOWN,
    { suggestion },
    { source: 'operationalAIEngine', priority: 6 }
  );

  const expiresIn = suggestion.metadata.expiresAt
    ? suggestion.metadata.expiresAt - Date.now()
    : 15000;

  if (suggestion.priority !== 'critical') {
    setTimeout(() => {
      expireSuggestion(suggestion.id);
    }, Math.max(expiresIn, 5000));
  }
}

/**
 * Marca sugestão como aceita
 */
export function acceptSuggestion(
  suggestionId: string,
  actionId?: string
): void {
  const suggestion = state.shownSuggestions.get(suggestionId);
  if (!suggestion) {
    return;
  }

  suggestion.status = 'accepted';
  state.shownSuggestions.delete(suggestionId);

  emitEvent(
    USER_EVENTS.SUGGESTION_ACCEPTED,
    { suggestion, actionId },
    { source: 'operationalAIEngine', priority: 6 }
  );

  structuredLogger.info('Sugestão aceita', {
    module: 'OperationalAIEngine',
    action: 'suggestion-accepted',
    data: { suggestionId, actionId },
  });

  processNextPendingSuggestion();
}

/**
 * Marca sugestão como dispensada
 */
export function dismissSuggestion(suggestionId: string): void {
  const suggestion = state.shownSuggestions.get(suggestionId);
  if (!suggestion) {
    return;
  }

  suggestion.status = 'dismissed';
  state.shownSuggestions.delete(suggestionId);
  state.dismissedSuggestions.add(suggestionId);

  emitEvent(
    USER_EVENTS.SUGGESTION_DISMISSED,
    { suggestion },
    { source: 'operationalAIEngine', priority: 5 }
  );

  structuredLogger.debug('Sugestão dispensada', {
    module: 'OperationalAIEngine',
    action: 'suggestion-dismissed',
    data: { suggestionId },
  });

  processNextPendingSuggestion();
}

/**
 * Expira sugestão automaticamente
 */
function expireSuggestion(suggestionId: string): void {
  const suggestion = state.shownSuggestions.get(suggestionId);
  if (suggestion?.status !== 'shown') {
    return;
  }

  suggestion.status = 'expired';
  state.shownSuggestions.delete(suggestionId);

  emitEvent(
    USER_EVENTS.SUGGESTION_EXPIRED,
    { suggestion },
    { source: 'operationalAIEngine', priority: 4 }
  );

  processNextPendingSuggestion();
}

/**
 * Processa próxima sugestão da fila
 */
function processNextPendingSuggestion(): void {
  if (
    state.pendingSuggestions.length === 0 ||
    state.shownSuggestions.size >= state.config.maxVisibleSuggestions
  ) {
    return;
  }

  const nextSuggestion = state.pendingSuggestions.shift();
  if (nextSuggestion) {
    showSuggestion(nextSuggestion);
  }
}

/**
 * Registra feedback do usuário
 */
export function recordFeedback(
  suggestionId: string,
  feedback: Omit<SuggestionFeedback, 'suggestionId' | 'createdAt'>
): void {
  const fullFeedback: SuggestionFeedback = {
    suggestionId,
    ...feedback,
    createdAt: Date.now(),
  };

  emitEvent(
    USER_EVENTS.FEEDBACK_GIVEN,
    { feedback: fullFeedback },
    { source: 'operationalAIEngine', priority: 6 }
  );

  structuredLogger.info('Feedback registrado', {
    module: 'OperationalAIEngine',
    action: 'feedback-recorded',
    data: { suggestionId, feedbackType: feedback.type },
  });
}

/**
 * Adiciona sugestão manualmente
 */
export function addSuggestion(input: CreateSuggestionInput): string {
  const suggestion = createSuggestionFromInput(input);

  if (shouldShowImmediately(suggestion)) {
    showSuggestion(suggestion);
  } else {
    state.pendingSuggestions.push(suggestion);
  }

  return suggestion.id;
}

/**
 * Obtém sugestões ativas
 */
export function getActiveSuggestions(): Suggestion[] {
  return Array.from(state.shownSuggestions.values());
}

/**
 * Obtém estado atual do Co-Piloto
 */
export function getCoPilotState() {
  return {
    initialized: state.initialized,
    enabled: state.config.enabled,
    userContext: state.userContext,
    activeSuggestions: getActiveSuggestions(),
    pendingCount: state.pendingSuggestions.length,
    totalShown: state.suggestionCount,
    config: state.config,
  };
}

/**
 * Atualiza configuração
 */
export function updateConfig(config: Partial<CoPilotConfig>): void {
  state.config = { ...state.config, ...config };

  emitEvent(
    USER_EVENTS.CONFIG_CHANGED,
    { config: state.config },
    { source: 'operationalAIEngine', priority: 4 }
  );
}

/**
 * Atualiza regras de throttle
 */
export function updateThrottle(throttle: Partial<ThrottleRules>): void {
  state.throttle = { ...state.throttle, ...throttle };
}

/**
 * Habilita/desabilita o Co-Piloto
 */
export function setEnabled(enabled: boolean): void {
  state.config.enabled = enabled;

  if (!enabled) {
    state.shownSuggestions.clear();
    state.pendingSuggestions = [];
  }

  emitEvent(
    enabled ? USER_EVENTS.COPILOT_ENABLED : USER_EVENTS.COPILOT_DISABLED,
    { enabled },
    { source: 'operationalAIEngine', priority: 5 }
  );
}

/**
 * Reseta o estado
 */
export function resetState(): void {
  state = {
    initialized: state.initialized,
    userContext: null,
    pendingSuggestions: [],
    shownSuggestions: new Map(),
    dismissedSuggestions: new Set(),
    lastSuggestionAt: 0,
    suggestionCount: 0,
    config: state.config,
    throttle: state.throttle,
  };

  for (const rule of SUGGESTION_RULES) {
    rule.lastFired = undefined;
  }
}

/**
 * Configura listeners de eventos
 */
function setupEventListeners(): void {
  on('user:navigation', (event) => {
    if (state.userContext) {
      const screenHistory = [...(state.userContext.screenHistory || [])];
      screenHistory.push(event.payload?.screen || 'unknown');
      if (screenHistory.length > 10) {
        screenHistory.shift();
      }

      updateUserContext({
        currentScreen: event.payload?.screen || state.userContext.currentScreen,
        screenHistory,
        screenDuration: 0,
        lastActionAt: Date.now(),
        activityState: 'browsing',
      });
    }
  });

  on('user:calculation', (_event) => {
    if (state.userContext) {
      updateUserContext({
        calculationsCount: (state.userContext.calculationsCount || 0) + 1,
        lastActionAt: Date.now(),
        activityState: 'calculating',
        lastActionType: 'calculation',
      });
    }
  });

  on('user:error', (_event) => {
    if (state.userContext) {
      updateUserContext({
        errorsCount: (state.userContext.errorsCount || 0) + 1,
        lastActionAt: Date.now(),
        activityState: 'error-state',
      });
    }
  });

  on('user:input', (_event) => {
    if (state.userContext) {
      updateUserContext({
        lastActionAt: Date.now(),
        activityState: 'filling-form',
        lastActionType: 'input',
      });
    }
  });
}

// ============================================================================
// Exports
// ============================================================================

export {
  DEFAULT_CONFIG,
  DEFAULT_THROTTLE,
  SUGGESTION_RULES,
  USER_EVENTS,
  type EngineState,
  type SuggestionRule,
};
