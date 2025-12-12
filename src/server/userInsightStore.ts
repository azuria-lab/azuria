/**
 * User Insight Store - Persistência de sugestões do Co-Piloto
 * 
 * Armazena sugestões enviadas ao usuário e feedback recebido.
 * Permite análise de eficácia e melhoria contínua do Co-Piloto.
 */

import { createClient } from '@supabase/supabase-js';
import { structuredLogger } from '@/services/structuredLogger';
import type { 
  CoPilotMetrics,
  Suggestion, 
  SuggestionFeedback, 
  SuggestionType 
} from '@/azuria_ai/types/operational';

const logger = structuredLogger.withContext({ module: 'userInsightStore' });

// ============================================================================
// Types
// ============================================================================

interface StoredSuggestion {
  id: string;
  user_id: string | null;
  session_id: string;
  type: SuggestionType;
  priority: string;
  category: string;
  title: string;
  message: string;
  details: string | null;
  context: Record<string, unknown> | null;
  status: string;
  confidence: number;
  shown_at: string | null;
  action_at: string | null;
  action_type: string | null;
  created_at: string;
  expires_at: string | null;
}

interface _StoredFeedback {
  id: string;
  suggestion_id: string;
  user_id: string | null;
  type: string;
  comment: string | null;
  context: Record<string, unknown> | null;
  created_at: string;
}

// ============================================================================
// In-Memory Cache (fallback)
// ============================================================================

const memoryCache = {
  suggestions: new Map<string, Suggestion>(),
  feedback: new Map<string, SuggestionFeedback>(),
};

// ============================================================================
// Supabase Client
// ============================================================================

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.warn('[userInsightStore] Supabase não configurado, usando cache em memória');
    return null;
  }
  
  return createClient(url, key);
}

// ============================================================================
// Suggestion Operations
// ============================================================================

/**
 * Salva uma sugestão no store
 */
export async function saveSuggestion(
  suggestion: Suggestion,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  // Salvar em memória primeiro
  memoryCache.suggestions.set(suggestion.id, suggestion);
  
  if (!supabase) {
    return true; // Apenas memória
  }
  
  try {
    const { error } = await supabase
      .from('user_suggestions')
      .upsert({
        id: suggestion.id,
        user_id: userId || null,
        session_id: sessionId || 'anonymous',
        type: suggestion.type,
        priority: suggestion.priority,
        category: suggestion.category,
        title: suggestion.title,
        message: suggestion.message,
        details: suggestion.details || null,
        context: suggestion.context || null,
        status: suggestion.status,
        confidence: suggestion.metadata.confidence,
        created_at: new Date(suggestion.metadata.createdAt).toISOString(),
        expires_at: suggestion.metadata.expiresAt 
          ? new Date(suggestion.metadata.expiresAt).toISOString() 
          : null,
      });
    
    if (error) {
      logger.error('Erro ao salvar sugestão: ' + error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    logger.error('Exceção ao salvar sugestão', err instanceof Error ? err : new Error(String(err)));
    return false;
  }
}

/**
 * Atualiza o status de uma sugestão
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: Suggestion['status'],
  actionType?: string
): Promise<boolean> {
  // Atualizar em memória
  const cached = memoryCache.suggestions.get(suggestionId);
  if (cached) {
    cached.status = status;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    return true;
  }
  
  try {
    const updateData: Record<string, unknown> = {
      status,
      ...(status === 'shown' && { shown_at: new Date().toISOString() }),
      ...((['accepted', 'dismissed'] as const).includes(status as 'accepted' | 'dismissed') && {
        action_at: new Date().toISOString(),
        action_type: actionType || status,
      }),
    };
    
    const { error } = await supabase
      .from('user_suggestions')
      .update(updateData)
      .eq('id', suggestionId);
    
    if (error) {
      logger.error('Erro ao atualizar status: ' + error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    logger.error('Exceção ao atualizar status', err instanceof Error ? err : new Error(String(err)));
    return false;
  }
}

/**
 * Busca sugestões de um usuário/sessão
 */
export async function getSuggestions(
  sessionId: string,
  options?: {
    status?: Suggestion['status'];
    limit?: number;
    userId?: string;
  }
): Promise<Suggestion[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    // Retornar do cache em memória
    return Array.from(memoryCache.suggestions.values())
      .filter(s => !options?.status || s.status === options.status)
      .slice(0, options?.limit || 50);
  }
  
  try {
    let query = supabase
      .from('user_suggestions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('Erro ao buscar sugestões: ' + error.message);
      return [];
    }
    
    return (data || []).map(mapStoredToSuggestion);
  } catch (err) {
    logger.error('Exceção ao buscar sugestões', err instanceof Error ? err : new Error(String(err)));
    return [];
  }
}

// ============================================================================
// Feedback Operations
// ============================================================================

/**
 * Salva feedback de uma sugestão
 */
export async function saveFeedback(
  feedback: SuggestionFeedback,
  userId?: string
): Promise<boolean> {
  const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  // Salvar em memória
  memoryCache.feedback.set(feedbackId, feedback);
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    return true;
  }
  
  try {
    const { error } = await supabase
      .from('user_suggestion_feedback')
      .insert({
        id: feedbackId,
        suggestion_id: feedback.suggestionId,
        user_id: userId || null,
        type: feedback.type,
        comment: feedback.comment || null,
        context: feedback.context || null,
        created_at: new Date(feedback.createdAt).toISOString(),
      });
    
    if (error) {
      logger.error('Erro ao salvar feedback: ' + error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    logger.error('Exceção ao salvar feedback', err instanceof Error ? err : new Error(String(err)));
    return false;
  }
}

// ============================================================================
// Analytics
// ============================================================================

/**
 * Calcula métricas do Co-Piloto para um período
 */
export async function getMetrics(
  options?: {
    userId?: string;
    sessionId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<CoPilotMetrics> {
  const supabase = getSupabaseClient();
  
  // Métricas padrão (vazio)
  const emptyMetrics: CoPilotMetrics = {
    totalSuggestions: 0,
    totalShown: 0,
    totalAccepted: 0,
    totalDismissed: 0,
    totalExpired: 0,
    acceptanceRate: 0,
    avgTimeToAction: 0,
    byType: {} as Record<SuggestionType, number>,
    acceptanceByType: {} as Record<SuggestionType, number>,
  };
  
  if (!supabase) {
    // Calcular do cache em memória
    const suggestions = Array.from(memoryCache.suggestions.values());
    return calculateMetricsFromSuggestions(suggestions);
  }
  
  try {
    let query = supabase
      .from('user_suggestions')
      .select('*');
    
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options?.sessionId) {
      query = query.eq('session_id', options.sessionId);
    }
    
    if (options?.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }
    
    if (options?.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('Erro ao buscar métricas: ' + error.message);
      return emptyMetrics;
    }
    
    const suggestions = (data || []).map(mapStoredToSuggestion);
    return calculateMetricsFromSuggestions(suggestions);
  } catch (err) {
    logger.error('Exceção ao calcular métricas', err instanceof Error ? err : new Error(String(err)));
    return emptyMetrics;
  }
}

/**
 * Busca taxa de aceitação por tipo de sugestão
 */
export async function getAcceptanceRateByType(): Promise<Record<SuggestionType, number>> {
  const metrics = await getMetrics();
  return metrics.acceptanceByType;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Remove sugestões antigas
 */
export async function cleanupOldSuggestions(
  olderThanDays: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Limpar cache em memória
    let removed = 0;
    for (const [id, suggestion] of memoryCache.suggestions) {
      if (suggestion.metadata.createdAt < cutoffDate.getTime()) {
        memoryCache.suggestions.delete(id);
        removed++;
      }
    }
    return removed;
  }
  
  try {
    const { data, error } = await supabase
      .from('user_suggestions')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');
    
    if (error) {
      logger.error('Erro ao limpar sugestões antigas: ' + error.message);
      return 0;
    }
    
    return data?.length || 0;
  } catch (err) {
    logger.error('Exceção ao limpar sugestões', err instanceof Error ? err : new Error(String(err)));
    return 0;
  }
}

/**
 * Limpa cache em memória (para testes)
 * @internal
 */
export function _clearMemoryCache(): void {
  memoryCache.suggestions.clear();
  memoryCache.feedback.clear();
}

// ============================================================================
// Helpers
// ============================================================================

function mapStoredToSuggestion(stored: StoredSuggestion): Suggestion {
  return {
    id: stored.id,
    type: stored.type,
    priority: stored.priority as Suggestion['priority'],
    category: stored.category as Suggestion['category'],
    title: stored.title,
    message: stored.message,
    details: stored.details || undefined,
    context: stored.context as Suggestion['context'],
    metadata: {
      createdAt: new Date(stored.created_at).getTime(),
      expiresAt: stored.expires_at ? new Date(stored.expires_at).getTime() : undefined,
      source: 'operational-ai',
      confidence: stored.confidence,
    },
    status: stored.status as Suggestion['status'],
  };
}

function calculateMetricsFromSuggestions(suggestions: Suggestion[]): CoPilotMetrics {
  const byType: Record<string, number> = {};
  const acceptedByType: Record<string, number> = {};
  const shownByType: Record<string, number> = {};
  
  let totalShown = 0;
  let totalAccepted = 0;
  let totalDismissed = 0;
  let totalExpired = 0;
  const totalTimeToAction = 0;
  const actionsWithTime = 0;
  
  for (const s of suggestions) {
    byType[s.type] = (byType[s.type] || 0) + 1;
    
    if (s.status === 'shown' || s.status === 'accepted' || s.status === 'dismissed') {
      totalShown++;
      shownByType[s.type] = (shownByType[s.type] || 0) + 1;
    }
    
    if (s.status === 'accepted') {
      totalAccepted++;
      acceptedByType[s.type] = (acceptedByType[s.type] || 0) + 1;
    }
    
    if (s.status === 'dismissed') {
      totalDismissed++;
    }
    
    if (s.status === 'expired') {
      totalExpired++;
    }
  }
  
  // Calcular taxa de aceitação por tipo
  const acceptanceByType: Record<SuggestionType, number> = {} as Record<SuggestionType, number>;
  for (const type of Object.keys(shownByType)) {
    const shown = shownByType[type] || 0;
    const accepted = acceptedByType[type] || 0;
    acceptanceByType[type as SuggestionType] = shown > 0 ? (accepted / shown) * 100 : 0;
  }
  
  return {
    totalSuggestions: suggestions.length,
    totalShown,
    totalAccepted,
    totalDismissed,
    totalExpired,
    acceptanceRate: totalShown > 0 ? (totalAccepted / totalShown) * 100 : 0,
    avgTimeToAction: actionsWithTime > 0 ? totalTimeToAction / actionsWithTime : 0,
    byType: byType as Record<SuggestionType, number>,
    acceptanceByType,
  };
}

// ============================================================================
// Export Manager
// ============================================================================

export function getUserInsightStoreManager() {
  return {
    saveSuggestion,
    updateSuggestionStatus,
    getSuggestions,
    saveFeedback,
    getMetrics,
    getAcceptanceRateByType,
    cleanupOldSuggestions,
  };
}
