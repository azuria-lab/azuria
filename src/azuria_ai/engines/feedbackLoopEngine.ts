/**
 * FeedbackLoopEngine - Motor de Coleta e Análise de Feedback
 * Modo Deus - Fase 4: Aprendizado e Feedback
 *
 * Responsabilidades:
 * - Coletar feedback explícito (like/dislike, ratings)
 * - Analisar feedback implícito (ações tomadas, dismissals)
 * - Calcular métricas de efetividade das sugestões
 * - Alimentar outros engines com dados de aprendizado
 *
 * @module azuria_ai/engines/feedbackLoopEngine
 */

import { supabase } from '@/lib/supabase';
import type { UserSuggestion } from '../types/operational';
import { eventBus } from '../events/eventBus';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tipos de feedback que podem ser coletados
 */
export type FeedbackType =
  | 'like'
  | 'dislike'
  | 'helpful'
  | 'not_helpful'
  | 'applied'
  | 'dismissed'
  | 'ignored'
  | 'rating';

/**
 * Estrutura de feedback coletado
 */
export interface SuggestionFeedback {
  suggestionId: string;
  suggestionType: UserSuggestion['type'];
  feedbackType: FeedbackType;
  rating?: number; // 1-5 para ratings
  comment?: string;
  context?: {
    screen?: string;
    actionTaken?: string;
    timeToFeedback?: number; // ms desde exibição
    wasProactive?: boolean;
  };
  timestamp: Date;
}

/**
 * Métricas agregadas de feedback
 */
export interface FeedbackMetrics {
  totalFeedback: number;
  positiveRate: number; // % de feedback positivo
  applicationRate: number; // % de sugestões aplicadas
  dismissRate: number; // % de sugestões descartadas
  avgRating: number; // média de ratings (se houver)
  byType: Record<string, TypeMetrics>;
}

interface TypeMetrics {
  total: number;
  positive: number;
  negative: number;
  applied: number;
  dismissed: number;
  avgTimeToAction: number; // ms
}

/**
 * Análise de efetividade
 */
export interface EffectivenessAnalysis {
  overallScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  bestPerformingTypes: string[];
  worstPerformingTypes: string[];
  recommendations: string[];
}

// =============================================================================
// STATE
// =============================================================================

interface FeedbackState {
  initialized: boolean;
  userId: string | null;
  feedbackHistory: SuggestionFeedback[];
  metrics: FeedbackMetrics;
  persistenceEnabled: boolean;
  listeners: Set<(feedback: SuggestionFeedback) => void>;
}

const state: FeedbackState = {
  initialized: false,
  userId: null,
  feedbackHistory: [],
  metrics: createEmptyMetrics(),
  persistenceEnabled: false,
  listeners: new Set(),
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o FeedbackLoopEngine
 */
export async function initFeedbackLoop(userId?: string): Promise<void> {
  if (state.initialized && state.userId === userId) {
    return;
  }

  state.userId = userId ?? null;
  state.feedbackHistory = [];
  state.metrics = createEmptyMetrics();

  // Verifica se persistência está disponível
  state.persistenceEnabled = await checkPersistenceAvailable();

  // Carrega histórico se disponível
  if (state.persistenceEnabled && userId) {
    await loadFeedbackHistory(userId);
  }

  // Subscribe to events
  setupEventListeners();

  state.initialized = true;

  // eslint-disable-next-line no-console
  console.log('[FeedbackLoopEngine] Initialized', {
    userId,
    persistenceEnabled: state.persistenceEnabled,
    historyCount: state.feedbackHistory.length,
  });
}

/**
 * Verifica se as tabelas de persistência existem
 */
// Cache para evitar múltiplas verificações de persistência
let persistenceCheckCache: boolean | null = null;
let persistenceCheckPromise: Promise<boolean> | null = null;

// Desabilita persistência completamente (tabelas de IA não criadas ainda)
const AI_TABLES_DISABLED = false;

async function checkPersistenceAvailable(): Promise<boolean> {
  // Só tenta persistir se houver sessão autenticada
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    persistenceCheckCache = false;
    return false;
  }

  const currentUserId = session.data.session.user.id;
  if (state.userId && state.userId !== currentUserId) {
    state.userId = currentUserId;
  }
  if (!state.userId) {
    state.userId = currentUserId;
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
        .from('suggestion_feedback')
        .select('id')
        .limit(1);

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

/**
 * Carrega histórico de feedback do usuário
 */
async function loadFeedbackHistory(userId: string): Promise<void> {
  // Não tentar carregar se persistência não está disponível
  if (!state.persistenceEnabled) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from('suggestion_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Desabilitar persistência silenciosamente
      state.persistenceEnabled = false;
      persistenceCheckCache = false;
      return;
    }

    if (data) {
      state.feedbackHistory = data.map(mapDbToFeedback);
      recalculateMetrics();
    }
  } catch {
    // Silenciosamente usar histórico em memória
    state.persistenceEnabled = false;
    persistenceCheckCache = false;
  }
}

// =============================================================================
// FEEDBACK COLLECTION
// =============================================================================

/**
 * Registra feedback de uma sugestão
 */
export async function recordFeedback(
  feedback: Omit<SuggestionFeedback, 'timestamp'>
): Promise<void> {
  const fullFeedback: SuggestionFeedback = {
    ...feedback,
    timestamp: new Date(),
  };

  // Add to local history
  state.feedbackHistory.unshift(fullFeedback);

  // Keep history bounded
  if (state.feedbackHistory.length > 500) {
    state.feedbackHistory = state.feedbackHistory.slice(0, 500);
  }

  // Recalculate metrics
  updateMetricsWithFeedback(fullFeedback);

  // Notify listeners
  state.listeners.forEach(listener => {
    try {
      listener(fullFeedback);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[FeedbackLoopEngine] Listener error:', e);
    }
  });

  // Emit event (event type not in EventType enum)
  // @ts-expect-error - user:feedback not defined in EventType
  eventBus.emit({
    type: 'user:feedback',
    payload: {
      suggestionId: feedback.suggestionId,
      feedbackType: feedback.feedbackType,
      isPositive: isPositiveFeedback(feedback.feedbackType),
    },
  });

  // Persist if available
  if (state.persistenceEnabled && state.userId) {
    await persistFeedback(fullFeedback);
  }
}

/**
 * Registra que uma sugestão foi aplicada
 */
export async function recordSuggestionApplied(
  suggestionId: string,
  suggestionType: UserSuggestion['type'],
  actionTaken?: string
): Promise<void> {
  await recordFeedback({
    suggestionId,
    suggestionType,
    feedbackType: 'applied',
    context: {
      actionTaken,
    },
  });
}

/**
 * Registra que uma sugestão foi descartada
 */
export async function recordSuggestionDismissed(
  suggestionId: string,
  suggestionType: UserSuggestion['type'],
  timeVisible?: number
): Promise<void> {
  await recordFeedback({
    suggestionId,
    suggestionType,
    feedbackType: 'dismissed',
    context: {
      timeToFeedback: timeVisible,
    },
  });
}

/**
 * Registra rating de uma sugestão
 */
export async function recordSuggestionRating(
  suggestionId: string,
  suggestionType: UserSuggestion['type'],
  rating: number,
  comment?: string
): Promise<void> {
  await recordFeedback({
    suggestionId,
    suggestionType,
    feedbackType: 'rating',
    rating: Math.min(5, Math.max(1, rating)),
    comment,
  });
}

/**
 * Registra like/dislike rápido
 */
export async function recordQuickFeedback(
  suggestionId: string,
  suggestionType: UserSuggestion['type'],
  isPositive: boolean
): Promise<void> {
  await recordFeedback({
    suggestionId,
    suggestionType,
    feedbackType: isPositive ? 'like' : 'dislike',
  });
}

// =============================================================================
// METRICS & ANALYSIS
// =============================================================================

/**
 * Retorna métricas atuais
 */
export function getFeedbackMetrics(): FeedbackMetrics {
  return { ...state.metrics };
}

/**
 * Retorna métricas para um tipo específico de sugestão
 */
export function getMetricsForType(type: string): TypeMetrics | null {
  return state.metrics.byType[type] ?? null;
}

/**
 * Analisa efetividade das sugestões
 */
export function analyzeEffectiveness(): EffectivenessAnalysis {
  const metrics = state.metrics;

  // Calculate overall score (0-100)
  const overallScore = calculateOverallScore(metrics);

  // Analyze trend (last 20 vs previous 20)
  const trend = analyzeTrend();

  // Find best/worst performing types
  const { best, worst } = findPerformanceExtremes(metrics.byType);

  // Generate recommendations
  const recommendations = generateRecommendations(metrics, overallScore);

  return {
    overallScore,
    trend,
    bestPerformingTypes: best,
    worstPerformingTypes: worst,
    recommendations,
  };
}

/**
 * Retorna taxa de feedback positivo recente
 */
export function getRecentPositiveRate(count: number = 20): number {
  const recent = state.feedbackHistory.slice(0, count);

  if (recent.length === 0) {
    return 0.5;
  } // Default neutral

  const positive = recent.filter(f =>
    isPositiveFeedback(f.feedbackType)
  ).length;

  return positive / recent.length;
}

/**
 * Verifica se um tipo de sugestão deve ser evitado
 */
export function shouldAvoidSuggestionType(type: string): boolean {
  const typeMetrics = state.metrics.byType[type];

  if (!typeMetrics || typeMetrics.total < 5) {
    return false;
  }

  // Avoid if dismiss rate > 70% and no positive feedback
  const dismissRate = typeMetrics.dismissed / typeMetrics.total;
  const positiveRate = typeMetrics.positive / typeMetrics.total;

  return dismissRate > 0.7 && positiveRate < 0.1;
}

// =============================================================================
// LISTENERS
// =============================================================================

/**
 * Adiciona listener para novos feedbacks
 */
export function onFeedback(
  callback: (feedback: SuggestionFeedback) => void
): () => void {
  state.listeners.add(callback);
  return () => state.listeners.delete(callback);
}

// =============================================================================
// HELPERS
// =============================================================================

function createEmptyMetrics(): FeedbackMetrics {
  return {
    totalFeedback: 0,
    positiveRate: 0,
    applicationRate: 0,
    dismissRate: 0,
    avgRating: 0,
    byType: {},
  };
}

function isPositiveFeedback(type: FeedbackType): boolean {
  return ['like', 'helpful', 'applied'].includes(type);
}

function updateMetricsWithFeedback(feedback: SuggestionFeedback): void {
  const metrics = state.metrics;
  metrics.totalFeedback++;

  // Update type-specific metrics
  const type = feedback.suggestionType;
  if (!metrics.byType[type]) {
    metrics.byType[type] = {
      total: 0,
      positive: 0,
      negative: 0,
      applied: 0,
      dismissed: 0,
      avgTimeToAction: 0,
    };
  }

  const typeMetrics = metrics.byType[type];
  typeMetrics.total++;

  if (isPositiveFeedback(feedback.feedbackType)) {
    typeMetrics.positive++;
  } else if (['dislike', 'not_helpful'].includes(feedback.feedbackType)) {
    typeMetrics.negative++;
  }

  if (feedback.feedbackType === 'applied') {
    typeMetrics.applied++;
  } else if (feedback.feedbackType === 'dismissed') {
    typeMetrics.dismissed++;
  }

  // Update time to action
  if (feedback.context?.timeToFeedback) {
    const prevTotal = typeMetrics.avgTimeToAction * (typeMetrics.total - 1);
    typeMetrics.avgTimeToAction =
      (prevTotal + feedback.context.timeToFeedback) / typeMetrics.total;
  }

  // Recalculate global rates
  recalculateGlobalRates();
}

function recalculateMetrics(): void {
  state.metrics = createEmptyMetrics();

  for (const feedback of state.feedbackHistory) {
    updateMetricsWithFeedback(feedback);
  }
}

function recalculateGlobalRates(): void {
  const metrics = state.metrics;

  if (metrics.totalFeedback === 0) {
    return;
  }

  let totalPositive = 0;
  let totalApplied = 0;
  let totalDismissed = 0;
  let totalRatings = 0;
  let ratingSum = 0;

  for (const feedback of state.feedbackHistory) {
    if (isPositiveFeedback(feedback.feedbackType)) {
      totalPositive++;
    }
    if (feedback.feedbackType === 'applied') {
      totalApplied++;
    }
    if (feedback.feedbackType === 'dismissed') {
      totalDismissed++;
    }
    if (feedback.feedbackType === 'rating' && feedback.rating) {
      totalRatings++;
      ratingSum += feedback.rating;
    }
  }

  metrics.positiveRate = totalPositive / metrics.totalFeedback;
  metrics.applicationRate = totalApplied / metrics.totalFeedback;
  metrics.dismissRate = totalDismissed / metrics.totalFeedback;
  metrics.avgRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
}

function calculateOverallScore(metrics: FeedbackMetrics): number {
  if (metrics.totalFeedback === 0) {
    return 50;
  }

  // Weighted score
  const weights = {
    positiveRate: 30,
    applicationRate: 40,
    dismissPenalty: -20, // Penalty for high dismiss rate
    rating: 10,
  };

  let score = 50; // Base score

  score += metrics.positiveRate * weights.positiveRate;
  score += metrics.applicationRate * weights.applicationRate;
  score += metrics.dismissRate * weights.dismissPenalty;

  if (metrics.avgRating > 0) {
    score += ((metrics.avgRating - 3) / 2) * weights.rating; // -10 to +10
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function analyzeTrend(): 'improving' | 'stable' | 'declining' {
  if (state.feedbackHistory.length < 20) {
    return 'stable';
  }

  const recent = state.feedbackHistory.slice(0, 10);
  const older = state.feedbackHistory.slice(10, 20);

  const recentPositive = recent.filter(f =>
    isPositiveFeedback(f.feedbackType)
  ).length;
  const olderPositive = older.filter(f =>
    isPositiveFeedback(f.feedbackType)
  ).length;

  const recentRate = recentPositive / recent.length;
  const olderRate = olderPositive / older.length;

  const diff = recentRate - olderRate;

  if (diff > 0.15) {
    return 'improving';
  }
  if (diff < -0.15) {
    return 'declining';
  }
  return 'stable';
}

function findPerformanceExtremes(byType: Record<string, TypeMetrics>): {
  best: string[];
  worst: string[];
} {
  const types = Object.entries(byType)
    .filter(([, m]) => m.total >= 3) // Minimum samples
    .map(([type, m]) => ({
      type,
      score: (m.positive + m.applied) / m.total - m.dismissed / m.total,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    best: types.slice(0, 3).map(t => t.type),
    worst: types.slice(-3).map(t => t.type),
  };
}

function generateRecommendations(
  metrics: FeedbackMetrics,
  score: number
): string[] {
  const recommendations: string[] = [];

  if (score < 40) {
    recommendations.push(
      'Considere reduzir a frequência de sugestões proativas'
    );
  }

  if (metrics.dismissRate > 0.5) {
    recommendations.push(
      'Muitas sugestões estão sendo descartadas - ajuste a relevância'
    );
  }

  if (metrics.applicationRate < 0.2) {
    recommendations.push(
      'Poucas sugestões aplicadas - revise o timing e contexto'
    );
  }

  // Check worst performing types
  const { worst } = findPerformanceExtremes(metrics.byType);
  if (worst.length > 0) {
    recommendations.push(`Tipos com baixa performance: ${worst.join(', ')}`);
  }

  return recommendations;
}

async function persistFeedback(feedback: SuggestionFeedback): Promise<void> {
  if (!state.persistenceEnabled) {
    return;
  }

  try {
    const { error } = await supabase.from('suggestion_feedback').insert({
      suggestion_id: feedback.suggestionId,
      user_id: state.userId,
      feedback_type: feedback.feedbackType,
      rating: feedback.rating,
      comment: feedback.comment,
      metadata: feedback.context,
    });

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

function mapDbToFeedback(row: Record<string, unknown>): SuggestionFeedback {
  return {
    suggestionId: row.suggestion_id
      ? String(row.suggestion_id as string | number)
      : '',
    // @ts-expect-error - 'info' is fallback but not in SuggestionType union
    suggestionType:
      ((row.metadata as Record<string, unknown> | null)
        ?.suggestionType as UserSuggestion['type']) ?? 'info',
    feedbackType: row.feedback_type as FeedbackType,
    rating: row.rating as number | undefined,
    comment: row.comment as string | undefined,
    context: row.metadata as SuggestionFeedback['context'],
    timestamp: new Date(row.created_at as string),
  };
}

function setupEventListeners(): void {
  // Listen to suggestion interactions
  // @ts-expect-error - user:interacted not defined in EventType
  eventBus.on('user:interacted', event => {
    const { elementType, action } = event.payload;

    // Track implicit feedback from interactions
    if (
      elementType === 'suggestion' &&
      (action === 'dismiss' || action === 'click' || action === 'apply')
    ) {
      // Already tracked explicitly
    }
  });
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Limpa estado do engine
 */
export function clearFeedbackState(): void {
  state.feedbackHistory = [];
  state.metrics = createEmptyMetrics();
}

/**
 * Reseta completamente o engine
 */
export function resetFeedbackLoop(): void {
  state.initialized = false;
  state.persistenceEnabled = false;
  persistenceCheckCache = null; // Reset cache de persistência
  persistenceCheckPromise = null; // Reset Promise compartilhada
  state.userId = null;
  state.feedbackHistory = [];
  state.metrics = createEmptyMetrics();
  state.listeners.clear();
}

// =============================================================================
// EXPORTS
// =============================================================================

export const feedbackLoop = {
  init: initFeedbackLoop,
  record: recordFeedback,
  recordApplied: recordSuggestionApplied,
  recordDismissed: recordSuggestionDismissed,
  recordRating: recordSuggestionRating,
  recordQuick: recordQuickFeedback,
  getMetrics: getFeedbackMetrics,
  getMetricsForType,
  analyzeEffectiveness,
  getRecentPositiveRate,
  shouldAvoid: shouldAvoidSuggestionType,
  onFeedback,
  clear: clearFeedbackState,
  reset: resetFeedbackLoop,
};

export default feedbackLoop;
