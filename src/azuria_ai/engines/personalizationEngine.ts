/**
 * PersonalizationEngine - Motor de Personalização Inteligente
 * Modo Deus - Fase 4: Aprendizado e Feedback
 *
 * Responsabilidades:
 * - Construir perfil de usuário baseado em padrões
 * - Adaptar experiência baseada no comportamento
 * - Gerenciar preferências explícitas e inferidas
 * - Prever necessidades do usuário
 * - Otimizar frequência e tipo de sugestões
 *
 * @module azuria_ai/engines/personalizationEngine
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck Tipos locais incompatíveis com schema Supabase - refatoração pendente

import { supabase } from '@/lib/supabase';
import { eventBus } from '../events/eventBus';
import { patternLearning } from './patternLearningEngine';
import { feedbackLoop } from './feedbackLoopEngine';
import type { UserSuggestion } from '../types/operational';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Nível de profundidade de explicações
 */
export type ExplanationDepth = 'minimal' | 'standard' | 'detailed' | 'expert';

/**
 * Frequência de sugestões
 */
export type SuggestionFrequency = 'low' | 'medium' | 'high';

/**
 * Perfil de personalização do usuário
 */
export interface UserPersonalizationProfile {
  userId: string | null;

  // Skill e contexto
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skillScore: number; // 0-100

  // Preferências de conteúdo
  preferredCalculator: string | null;
  preferredExplanationDepth: ExplanationDepth;
  preferredLanguage: 'pt-BR' | 'en-US';

  // Comportamento
  typicalUsageTime: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  acceptsProactiveSuggestions: boolean;
  optimalSuggestionFrequency: SuggestionFrequency;

  // Engajamento
  engagementScore: number; // 0-100
  lastActiveAt: Date | null;
  consecutiveDays: number;

  // Derivados
  inferredPreferences: Record<string, unknown>;
  suggestedFeatures: string[];
  avoidedFeatures: string[];
}

/**
 * Configuração de personalização
 */
export interface PersonalizationConfig {
  enableAdaptiveDepth: boolean;
  enableProactiveSuggestions: boolean;
  enableTimingOptimization: boolean;
  maxSuggestionsPerSession: number;
  cooldownBetweenSuggestions: number; // ms
}

/**
 * Contexto para personalização de sugestão
 */
export interface SuggestionPersonalizationContext {
  currentScreen: string;
  timeOfDay: string;
  sessionDuration: number;
  suggestionsSoFar: number;
  lastSuggestionTime: Date | null;
  userActivityState: 'active' | 'idle' | 'focused';
}

// =============================================================================
// STATE
// =============================================================================

interface PersonalizationState {
  initialized: boolean;
  profile: UserPersonalizationProfile;
  config: PersonalizationConfig;
  sessionStats: {
    startTime: Date;
    suggestionsShown: number;
    suggestionsApplied: number;
    lastSuggestionTime: Date | null;
  };
  persistenceEnabled: boolean;
}

const defaultProfile: UserPersonalizationProfile = {
  userId: null,
  skillLevel: 'beginner',
  skillScore: 0,
  preferredCalculator: null,
  preferredExplanationDepth: 'standard',
  preferredLanguage: 'pt-BR',
  typicalUsageTime: null,
  acceptsProactiveSuggestions: true,
  optimalSuggestionFrequency: 'medium',
  engagementScore: 50,
  lastActiveAt: null,
  consecutiveDays: 0,
  inferredPreferences: {},
  suggestedFeatures: [],
  avoidedFeatures: [],
};

const defaultConfig: PersonalizationConfig = {
  enableAdaptiveDepth: true,
  enableProactiveSuggestions: true,
  enableTimingOptimization: true,
  maxSuggestionsPerSession: 20,
  cooldownBetweenSuggestions: 30000, // 30s
};

const state: PersonalizationState = {
  initialized: false,
  profile: { ...defaultProfile },
  config: { ...defaultConfig },
  sessionStats: {
    startTime: new Date(),
    suggestionsShown: 0,
    suggestionsApplied: 0,
    lastSuggestionTime: null,
  },
  persistenceEnabled: false,
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o PersonalizationEngine
 */
export async function initPersonalization(userId?: string): Promise<void> {
  if (state.initialized && state.profile.userId === userId) {
    return;
  }

  state.profile = { ...defaultProfile, userId: userId ?? null };
  state.sessionStats = {
    startTime: new Date(),
    suggestionsShown: 0,
    suggestionsApplied: 0,
    lastSuggestionTime: null,
  };

  // Check persistence
  state.persistenceEnabled = await checkPersistenceAvailable();

  // Load profile if available
  if (state.persistenceEnabled && userId) {
    await loadProfile(userId);
  }

  // Integrate with other engines
  integrateWithEngines();

  // Setup listeners
  setupEventListeners();

  state.initialized = true;

  // eslint-disable-next-line no-console
  console.log('[PersonalizationEngine] Initialized', {
    userId,
    persistenceEnabled: state.persistenceEnabled,
    skillLevel: state.profile.skillLevel,
  });
}

// Cache para evitar múltiplas verificações de persistência
let persistenceCheckCache: boolean | null = null;
let persistenceCheckPromise: Promise<boolean> | null = null;

// Habilita persistência (tabelas de IA criadas com RLS configurado)
const AI_TABLES_DISABLED = false;

async function checkPersistenceAvailable(): Promise<boolean> {
  // Só tenta persistir se houver sessão autenticada
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    persistenceCheckCache = false;
    return false;
  }

  const currentUserId = session.data.session.user.id;
  // Garantir que estamos usando sempre o user_id da sessão corrente
  if (state.profile.userId && state.profile.userId !== currentUserId) {
    state.profile.userId = currentUserId;
  }
  if (!state.profile.userId) {
    state.profile.userId = currentUserId;
  }

  // Tabelas de IA ainda não criadas - desabilitar silenciosamente
  if (AI_TABLES_DISABLED) {
    persistenceCheckCache = false;
    return false;
  }

  // Retorna cache se já verificado
  if (persistenceCheckCache !== null) {
    return persistenceCheckCache;
  }

  // Se já existe uma verificação em andamento, aguarda ela
  if (persistenceCheckPromise !== null) {
    return persistenceCheckPromise;
  }

  // Cria Promise compartilhada para evitar múltiplas requisições simultâneas
  persistenceCheckPromise = (async () => {
    try {
      const { error } = await supabase
        .from('user_personalization')
        .select('user_id')
        .limit(1);

      // Tabela não existe (406), sem permissão, ou outro erro - desabilitar persistência silenciosamente
      if (error) {
        persistenceCheckCache = false;
        return false;
      }

      persistenceCheckCache = true;
      return true;
    } catch {
      // Erro de rede ou outro - desabilitar persistência silenciosamente
      persistenceCheckCache = false;
      return false;
    } finally {
      persistenceCheckPromise = null;
    }
  })();

  return persistenceCheckPromise;
}

async function loadProfile(userId: string): Promise<void> {
  // Forçar userId da sessão para evitar mismatch com RLS
  const session = await supabase.auth.getSession();
  const sessionUserId = session.data.session?.user.id;
  const effectiveUserId = sessionUserId ?? userId;
  if (!sessionUserId) {
    // Sem sessão, não tentar persistir
    state.persistenceEnabled = false;
    persistenceCheckCache = false;
    return;
  }
  state.profile.userId = effectiveUserId;

  // Não tentar carregar se persistência não está disponível
  if (!state.persistenceEnabled) {
    return;
  }

  try {
    // Usar maybeSingle() em vez de single() para evitar erro quando não há dados
    const { data, error } = await supabase
      .from('user_personalization')
      .select('*')
      .eq('user_id', effectiveUserId)
      .maybeSingle();

    // Se tabela não existe ou sem permissão, desabilitar persistência e usar perfil padrão
    if (error) {
      // Qualquer erro de tabela/RLS desabilita persistência silenciosamente
      state.persistenceEnabled = false;
      persistenceCheckCache = false;
      return; // Usar perfil padrão em memória
    }

    // Se há dados, mapear para o perfil
    if (data) {
      state.profile = {
        ...state.profile,
        ...mapDbToProfile(data),
      };
    }

    // Carregar métricas de skill (também usando maybeSingle para tolerância)
    const { data: metrics, error: metricsError } = await supabase
      .from('user_skill_metrics')
      .select('*')
      .eq('user_id', effectiveUserId)
      .maybeSingle();

    // Se tabela não existe, apenas ignorar (não desabilitar persistência)
    if (metricsError) {
      return;
    }

    if (metrics) {
      // @ts-expect-error - Supabase types not regenerated
      state.profile.skillLevel = metrics.skill_level;
      // @ts-expect-error - Supabase types not regenerated
      state.profile.skillScore = metrics.skill_score;
    }
  } catch {
    // Silenciosamente usar perfil padrão em memória
    state.persistenceEnabled = false;
    persistenceCheckCache = false;
  }
}

// =============================================================================
// PROFILE MANAGEMENT
// =============================================================================

/**
 * Retorna perfil atual
 */
export function getProfile(): UserPersonalizationProfile {
  return { ...state.profile };
}

/**
 * Atualiza preferência explícita
 */
export async function setPreference<K extends keyof UserPersonalizationProfile>(
  key: K,
  value: UserPersonalizationProfile[K]
): Promise<void> {
  state.profile[key] = value;

  // Persist if available
  if (state.persistenceEnabled && state.profile.userId) {
    await persistProfile();
  }

  // Emit event
  // @ts-expect-error - Event signature mismatch
  eventBus.emit({
    type: 'user:preference_changed',
    payload: {
      preference: key,
      value,
    },
  });
}

/**
 * Atualiza múltiplas preferências
 */
export async function setPreferences(
  prefs: Partial<UserPersonalizationProfile>
): Promise<void> {
  Object.assign(state.profile, prefs);

  if (state.persistenceEnabled && state.profile.userId) {
    await persistProfile();
  }
}

/**
 * Atualiza skill level
 */
export function updateSkillLevel(
  level: UserPersonalizationProfile['skillLevel'],
  score: number
): void {
  state.profile.skillLevel = level;
  state.profile.skillScore = score;

  // Persist skill metrics
  if (state.persistenceEnabled && state.profile.userId) {
    // eslint-disable-next-line no-console
    persistSkillMetrics().catch(console.error);
  }
}

// =============================================================================
// SUGGESTION PERSONALIZATION
// =============================================================================

/**
 * Personaliza uma sugestão para o usuário atual
 */
export function personalizeSuggestion(
  suggestion: UserSuggestion,
  _context: Partial<SuggestionPersonalizationContext> = {}
): UserSuggestion {
  const personalized = { ...suggestion };

  // Adapt message length based on skill level
  if (state.config.enableAdaptiveDepth) {
    personalized.message = adaptMessageForSkill(
      suggestion.message,
      state.profile.skillLevel
    );
  }

  // Adjust priority based on user preferences
  // @ts-expect-error - Type mismatch in priority adjustment
  personalized.priority = adjustPriorityForUser(
    suggestion.priority,
    suggestion.type
  );

  // Add personalized metadata
  personalized.metadata = {
    ...personalized.metadata,
  };

  return personalized;
}

/**
 * Decide se deve mostrar sugestão proativa
 */
export function shouldShowProactiveSuggestion(
  context: Partial<SuggestionPersonalizationContext> = {}
): { show: boolean; reason: string } {
  // Check if proactive suggestions are enabled
  if (!state.profile.acceptsProactiveSuggestions) {
    return { show: false, reason: 'proactive_disabled' };
  }

  if (!state.config.enableProactiveSuggestions) {
    return { show: false, reason: 'config_disabled' };
  }

  // Check session limits
  if (
    state.sessionStats.suggestionsShown >= state.config.maxSuggestionsPerSession
  ) {
    return { show: false, reason: 'session_limit_reached' };
  }

  // Check cooldown
  if (state.sessionStats.lastSuggestionTime) {
    const elapsed =
      Date.now() - state.sessionStats.lastSuggestionTime.getTime();
    const cooldown = getCooldownForFrequency(
      state.profile.optimalSuggestionFrequency
    );

    if (elapsed < cooldown) {
      return { show: false, reason: 'cooldown_active' };
    }
  }

  // Check timing optimization
  if (state.config.enableTimingOptimization && context.timeOfDay) {
    const isOptimalTime = isOptimalTimeForSuggestion(context.timeOfDay);
    if (!isOptimalTime) {
      return { show: false, reason: 'suboptimal_timing' };
    }
  }

  // Check user activity state
  if (context.userActivityState === 'focused') {
    return { show: false, reason: 'user_focused' };
  }

  return { show: true, reason: 'all_checks_passed' };
}

/**
 * Determina profundidade de explicação ideal
 */
export function getOptimalExplanationDepth(): ExplanationDepth {
  if (!state.config.enableAdaptiveDepth) {
    return state.profile.preferredExplanationDepth;
  }

  // Map skill level to depth
  switch (state.profile.skillLevel) {
    case 'beginner':
      return 'detailed';
    case 'intermediate':
      return 'standard';
    case 'advanced':
      return 'standard';
    case 'expert':
      return 'minimal';
    default:
      return state.profile.preferredExplanationDepth;
  }
}

/**
 * Sugere próximos recursos para o usuário
 */
export function getSuggestedFeatures(): string[] {
  const suggested: string[] = [];

  // Based on skill level
  if (state.profile.skillLevel === 'beginner') {
    suggested.push('tutorial_getting_started', 'basic_calculator');
  } else if (state.profile.skillLevel === 'intermediate') {
    suggested.push('advanced_markup', 'bdi_calculator');
  } else {
    suggested.push('batch_calculations', 'export_reports');
  }

  // Based on usage patterns
  const mostUsed = patternLearning.getMostUsedCalculators();
  if (mostUsed.length > 0 && !mostUsed.includes('bdi')) {
    suggested.push('bdi_calculator');
  }

  // Filter out avoided features
  return suggested.filter(f => !state.profile.avoidedFeatures.includes(f));
}

/**
 * Retorna recursos a evitar para este usuário
 */
export function getAvoidedSuggestionTypes(): string[] {
  const avoided: string[] = [];

  // Check feedback history
  const metrics = feedbackLoop.getMetrics();

  for (const [type, typeMetrics] of Object.entries(metrics.byType)) {
    if (typeMetrics.total >= 5) {
      const dismissRate = typeMetrics.dismissed / typeMetrics.total;
      if (dismissRate > 0.7) {
        avoided.push(type);
      }
    }
  }

  return avoided;
}

// =============================================================================
// ENGAGEMENT TRACKING
// =============================================================================

/**
 * Registra atividade do usuário
 */
export function recordActivity(): void {
  const now = new Date();
  const lastActive = state.profile.lastActiveAt;

  state.profile.lastActiveAt = now;

  // Check consecutive days
  if (lastActive) {
    const daysDiff = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      state.profile.consecutiveDays++;
    } else if (daysDiff > 1) {
      state.profile.consecutiveDays = 1;
    }
  } else {
    state.profile.consecutiveDays = 1;
  }

  // Update engagement score
  updateEngagementScore();

  // Persist periodically
  if (state.persistenceEnabled && state.profile.userId) {
    // eslint-disable-next-line no-console
    persistProfile().catch(console.error);
  }
}

/**
 * Registra sugestão mostrada
 */
export function recordSuggestionShown(): void {
  state.sessionStats.suggestionsShown++;
  state.sessionStats.lastSuggestionTime = new Date();
}

/**
 * Registra sugestão aplicada
 */
export function recordSuggestionApplied(): void {
  state.sessionStats.suggestionsApplied++;

  // Boost engagement
  state.profile.engagementScore = Math.min(
    100,
    state.profile.engagementScore + 2
  );
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Retorna configuração atual
 */
export function getConfig(): PersonalizationConfig {
  return { ...state.config };
}

/**
 * Atualiza configuração
 */
export function setConfig(config: Partial<PersonalizationConfig>): void {
  Object.assign(state.config, config);
}

// =============================================================================
// INTEGRATION
// =============================================================================

function integrateWithEngines(): void {
  // Integrate with pattern learning
  try {
    const inferredPrefs = patternLearning.getInferredPreferences();
    state.profile.inferredPreferences = inferredPrefs;

    const typicalTime = patternLearning.getTypicalUsageTime();
    if (typicalTime) {
      state.profile.typicalUsageTime =
        typicalTime as UserPersonalizationProfile['typicalUsageTime'];
    }

    const mostUsed = patternLearning.getMostUsedCalculators();
    if (mostUsed.length > 0) {
      state.profile.preferredCalculator = mostUsed[0];
    }
  } catch {
    // Pattern learning may not be initialized
  }

  // Integrate with feedback loop
  try {
    const metrics = feedbackLoop.getMetrics();

    // Adjust suggestion frequency based on feedback
    if (metrics.dismissRate > 0.6) {
      state.profile.optimalSuggestionFrequency = 'low';
    } else if (metrics.applicationRate > 0.5) {
      state.profile.optimalSuggestionFrequency = 'high';
    }
  } catch {
    // Feedback loop may not be initialized
  }
}

function setupEventListeners(): void {
  // Listen to feedback events
  // @ts-expect-error - Event type mismatch
  eventBus.on('user:feedback', event => {
    const { isPositive } = event.payload;

    // Adjust engagement score
    if (isPositive) {
      state.profile.engagementScore = Math.min(
        100,
        state.profile.engagementScore + 1
      );
    } else {
      state.profile.engagementScore = Math.max(
        0,
        state.profile.engagementScore - 1
      );
    }
  });

  // Listen to skill detection
  // @ts-expect-error - Event type mismatch
  eventBus.on('user:skill_detected', event => {
    const { skillLevel, confidence } = event.payload;
    if (confidence > 0.7) {
      state.profile.skillLevel =
        skillLevel as UserPersonalizationProfile['skillLevel'];
    }
  });
}

// =============================================================================
// HELPERS
// =============================================================================

function adaptMessageForSkill(
  message: string,
  skillLevel: UserPersonalizationProfile['skillLevel']
): string {
  // For experts, keep it brief
  if (skillLevel === 'expert' && message.length > 100) {
    // Truncate to first sentence
    const firstSentence = message.split(/[.!?]/)[0];
    return firstSentence.trim() + '.';
  }

  // For beginners, add context if too short
  if (skillLevel === 'beginner' && message.length < 50) {
    return message + ' Precisa de ajuda? Clique para saber mais.';
  }

  return message;
}

function adjustPriorityForUser(
  basePriority: number,
  type: UserSuggestion['type']
): number {
  let priority = basePriority;

  // Boost priority for suggestion types user has liked
  const typeMetrics = feedbackLoop.getMetricsForType(type);
  if (typeMetrics && typeMetrics.total >= 3) {
    const positiveRate = typeMetrics.positive / typeMetrics.total;
    if (positiveRate > 0.7) {
      priority += 10;
    } else if (positiveRate < 0.3) {
      priority -= 10;
    }
  }

  // Adjust for skill level
  // @ts-expect-error - Type comparison needed for logic
  if (type === 'tip' && state.profile.skillLevel === 'expert') {
    priority -= 5; // Experts need fewer tips
  }

  return Math.max(0, Math.min(100, priority));
}

function getCooldownForFrequency(frequency: SuggestionFrequency): number {
  switch (frequency) {
    case 'low':
      return 120000; // 2 minutes
    case 'medium':
      return 60000; // 1 minute
    case 'high':
      return 30000; // 30 seconds
    default:
      return 60000;
  }
}

function isOptimalTimeForSuggestion(currentTimeOfDay: string): boolean {
  const typical = state.profile.typicalUsageTime;

  // If no typical time known, always optimal
  if (!typical) {
    return true;
  }

  // If current time matches typical time, it's optimal
  return currentTimeOfDay === typical;
}

function updateEngagementScore(): void {
  // Base score from consecutive days
  const dayBonus = Math.min(20, state.profile.consecutiveDays * 2);

  // Activity in current session
  const sessionDuration = Date.now() - state.sessionStats.startTime.getTime();
  const sessionMinutes = sessionDuration / 60000;
  const sessionBonus = Math.min(15, sessionMinutes / 2);

  // Application rate
  const appRate =
    state.sessionStats.suggestionsShown > 0
      ? state.sessionStats.suggestionsApplied /
        state.sessionStats.suggestionsShown
      : 0.5;
  const appBonus = appRate * 15;

  // Calculate final score
  const baseScore = 50;
  state.profile.engagementScore = Math.round(
    Math.min(100, baseScore + dayBonus + sessionBonus + appBonus)
  );
}

async function persistProfile(): Promise<void> {
  if (!state.profile.userId || !state.persistenceEnabled) {
    return;
  }

  try {
    // @ts-expect-error - Supabase types not regenerated after table creation
    const { error } = await supabase.from('user_personalization').upsert(
      {
        user_id: state.profile.userId,
        preferred_calculator: state.profile.preferredCalculator,
        preferred_explanation_depth: state.profile.preferredExplanationDepth,
        typical_usage_time: state.profile.typicalUsageTime,
        accepts_proactive_suggestions:
          state.profile.acceptsProactiveSuggestions,
        optimal_suggestion_frequency: state.profile.optimalSuggestionFrequency,
        engagement_score: state.profile.engagementScore,
        last_active_at: state.profile.lastActiveAt?.toISOString(),
        consecutive_days: state.profile.consecutiveDays,
        inferred_preferences: state.profile.inferredPreferences,
      },
      {
        onConflict: 'user_id',
      }
    );

    // Se tabela não existe, desabilitar persistência silenciosamente
    if (error) {
      state.persistenceEnabled = false;
      persistenceCheckCache = false;
    }
  } catch {
    // Silenciosamente desabilitar persistência
    state.persistenceEnabled = false;
    persistenceCheckCache = false;
  }
}

async function persistSkillMetrics(): Promise<void> {
  if (!state.profile.userId || !state.persistenceEnabled) {
    return;
  }

  try {
    // @ts-expect-error - Supabase types not regenerated after table creation
    const { error } = await supabase.from('user_skill_metrics').upsert(
      {
        user_id: state.profile.userId,
        skill_level: state.profile.skillLevel,
        skill_score: state.profile.skillScore,
      },
      {
        onConflict: 'user_id',
      }
    );

    // Se tabela não existe, desabilitar persistência silenciosamente
    if (error) {
      state.persistenceEnabled = false;
      persistenceCheckCache = false;
    }
  } catch {
    // Silenciosamente desabilitar persistência
    state.persistenceEnabled = false;
    persistenceCheckCache = false;
  }
}

function mapDbToProfile(
  row: Record<string, unknown>
): Partial<UserPersonalizationProfile> {
  return {
    preferredCalculator: row.preferred_calculator as string | null,
    preferredExplanationDepth:
      (row.preferred_explanation_depth as ExplanationDepth) ?? 'standard',
    typicalUsageTime:
      row.typical_usage_time as UserPersonalizationProfile['typicalUsageTime'],
    acceptsProactiveSuggestions:
      (row.accepts_proactive_suggestions as boolean) ?? true,
    optimalSuggestionFrequency:
      (row.optimal_suggestion_frequency as SuggestionFrequency) ?? 'medium',
    engagementScore: (row.engagement_score as number) ?? 50,
    lastActiveAt: row.last_active_at
      ? new Date(row.last_active_at as string)
      : null,
    consecutiveDays: (row.consecutive_days as number) ?? 0,
    inferredPreferences:
      (row.inferred_preferences as Record<string, unknown>) ?? {},
  };
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Reseta estatísticas da sessão
 */
export function resetSessionStats(): void {
  state.sessionStats = {
    startTime: new Date(),
    suggestionsShown: 0,
    suggestionsApplied: 0,
    lastSuggestionTime: null,
  };
}

/**
 * Reseta completamente o engine
 */
export function resetPersonalization(): void {
  state.initialized = false;
  state.persistenceEnabled = false;
  persistenceCheckCache = null; // Reset cache de persistência
  persistenceCheckPromise = null; // Reset Promise compartilhada
  state.profile = { ...defaultProfile };
  state.config = { ...defaultConfig };
  state.sessionStats = {
    startTime: new Date(),
    suggestionsShown: 0,
    suggestionsApplied: 0,
    lastSuggestionTime: null,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const personalization = {
  init: initPersonalization,
  getProfile,
  setPreference,
  setPreferences,
  updateSkillLevel,
  personalize: personalizeSuggestion,
  shouldShowProactive: shouldShowProactiveSuggestion,
  getOptimalDepth: getOptimalExplanationDepth,
  getSuggestedFeatures,
  getAvoidedTypes: getAvoidedSuggestionTypes,
  recordActivity,
  recordShown: recordSuggestionShown,
  recordApplied: recordSuggestionApplied,
  getConfig,
  setConfig,
  resetSession: resetSessionStats,
  reset: resetPersonalization,
};

export default personalization;
