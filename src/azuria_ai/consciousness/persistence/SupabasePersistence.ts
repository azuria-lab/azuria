/**
 * ══════════════════════════════════════════════════════════════════════════════
 * SUPABASE PERSISTENCE - Persistência do Modo Deus no Supabase
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Gerencia a persistência de:
 * - Histórico de mensagens/insights
 * - Preferências do usuário
 * - Feedback de sugestões
 * - Métricas de uso
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { 
  CognitiveRole,
  ExplanationLevel,
  MessageType,
  SkillLevel,
  SubscriptionTier,
  SuggestionFrequency,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Registro de mensagem para persistir */
export interface PersistedMessage {
  id?: string;
  user_id: string;
  semantic_hash: string;
  message_type: MessageType;
  title: string;
  message: string;
  topic: string;
  severity: string;
  screen: string;
  outcome: 'accepted' | 'dismissed' | 'ignored' | null;
  created_at?: string;
}

/** Preferências do usuário persistidas */
export interface PersistedPreferences {
  id?: string;
  user_id: string;
  skill_level: SkillLevel;
  suggestion_frequency: SuggestionFrequency;
  explanation_level: ExplanationLevel;
  proactive_assistance: boolean;
  blocked_topics: string[];
  updated_at?: string;
}

/** Feedback de sugestão */
export interface PersistedFeedback {
  id?: string;
  user_id: string;
  message_id: string;
  semantic_hash: string;
  feedback_type: 'positive' | 'negative' | 'neutral';
  rating?: number;
  comment?: string;
  created_at?: string;
}

/** Métricas diárias */
export interface PersistedDailyMetrics {
  id?: string;
  user_id: string;
  date: string;
  messages_shown: number;
  messages_accepted: number;
  messages_dismissed: number;
  messages_ignored: number;
  calculations_completed: number;
  screens_visited: number;
  session_duration_ms: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

interface PersistenceConfig {
  enabled: boolean;
  batchSize: number;
  flushIntervalMs: number;
  retryAttempts: number;
}

const DEFAULT_CONFIG: PersistenceConfig = {
  enabled: true,
  batchSize: 10,
  flushIntervalMs: 30000, // 30 segundos
  retryAttempts: 3,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

interface PersistenceState {
  initialized: boolean;
  config: PersistenceConfig;
  supabase: SupabaseClient | null;
  messageQueue: PersistedMessage[];
  feedbackQueue: PersistedFeedback[];
  flushInterval: ReturnType<typeof setInterval> | null;
  userId: string | null;
}

const state: PersistenceState = {
  initialized: false,
  config: { ...DEFAULT_CONFIG },
  supabase: null,
  messageQueue: [],
  feedbackQueue: [],
  flushInterval: null,
  userId: null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES INTERNAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Flush das filas para o banco
 */
async function flushQueues(): Promise<void> {
  if (!state.supabase || !state.userId) {
    return;
  }
  
  // Flush mensagens
  if (state.messageQueue.length > 0) {
    const messages = state.messageQueue.splice(0, state.config.batchSize);
    
    try {
      const { error } = await state.supabase
        .from('consciousness_messages')
        .insert(messages);
      
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[SupabasePersistence] Error inserting messages:', error);
        // Re-adicionar à fila para retry
        state.messageQueue.unshift(...messages);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[SupabasePersistence] Error:', err);
      state.messageQueue.unshift(...messages);
    }
  }
  
  // Flush feedback
  if (state.feedbackQueue.length > 0) {
    const feedback = state.feedbackQueue.splice(0, state.config.batchSize);
    
    try {
      const { error } = await state.supabase
        .from('consciousness_feedback')
        .insert(feedback);
      
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[SupabasePersistence] Error inserting feedback:', error);
        state.feedbackQueue.unshift(...feedback);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[SupabasePersistence] Error:', err);
      state.feedbackQueue.unshift(...feedback);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa a persistência
 */
export function initPersistence(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  config?: Partial<PersistenceConfig>
): void {
  if (state.initialized) {
    return;
  }
  
  state.supabase = createClient(supabaseUrl, supabaseKey);
  state.userId = userId;
  
  if (config) {
    state.config = { ...state.config, ...config };
  }
  
  // Iniciar flush periódico
  if (state.config.enabled) {
    state.flushInterval = setInterval(flushQueues, state.config.flushIntervalMs);
  }
  
  state.initialized = true;
  
  // eslint-disable-next-line no-console
  console.log('[SupabasePersistence] Initialized for user:', userId);
}

/**
 * Para a persistência
 */
export async function stopPersistence(): Promise<void> {
  if (!state.initialized) {
    return;
  }
  
  // Parar flush periódico
  if (state.flushInterval) {
    clearInterval(state.flushInterval);
    state.flushInterval = null;
  }
  
  // Flush final
  await flushQueues();
  
  state.initialized = false;
  state.supabase = null;
  state.userId = null;
  
  // eslint-disable-next-line no-console
  console.log('[SupabasePersistence] Stopped');
}

/**
 * Persiste uma mensagem
 */
export function persistMessage(message: Omit<PersistedMessage, 'user_id'>): void {
  if (!state.initialized || !state.userId || !state.config.enabled) {
    return;
  }
  
  state.messageQueue.push({
    ...message,
    user_id: state.userId,
  });
  
  // Flush imediato se atingir batch size
  if (state.messageQueue.length >= state.config.batchSize) {
    flushQueues();
  }
}

/**
 * Persiste feedback
 */
export function persistFeedback(feedback: Omit<PersistedFeedback, 'user_id'>): void {
  if (!state.initialized || !state.userId || !state.config.enabled) {
    return;
  }
  
  state.feedbackQueue.push({
    ...feedback,
    user_id: state.userId,
  });
  
  if (state.feedbackQueue.length >= state.config.batchSize) {
    flushQueues();
  }
}

/**
 * Atualiza o outcome de uma mensagem
 */
export async function updateMessageOutcome(
  semanticHash: string,
  outcome: 'accepted' | 'dismissed' | 'ignored'
): Promise<void> {
  if (!state.supabase || !state.userId) {
    return;
  }
  
  try {
    await state.supabase
      .from('consciousness_messages')
      .update({ outcome })
      .eq('user_id', state.userId)
      .eq('semantic_hash', semanticHash)
      .is('outcome', null);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SupabasePersistence] Error updating outcome:', err);
  }
}

/**
 * Carrega preferências do usuário
 */
export async function loadPreferences(): Promise<PersistedPreferences | null> {
  if (!state.supabase || !state.userId) {
    return null;
  }
  
  try {
    const { data, error } = await state.supabase
      .from('consciousness_preferences')
      .select('*')
      .eq('user_id', state.userId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Not found
        // eslint-disable-next-line no-console
        console.error('[SupabasePersistence] Error loading preferences:', error);
      }
      return null;
    }
    
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SupabasePersistence] Error:', err);
    return null;
  }
}

/**
 * Salva preferências do usuário
 */
export async function savePreferences(
  preferences: Omit<PersistedPreferences, 'id' | 'user_id' | 'updated_at'>
): Promise<void> {
  if (!state.supabase || !state.userId) {
    return;
  }
  
  try {
    await state.supabase
      .from('consciousness_preferences')
      .upsert({
        user_id: state.userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SupabasePersistence] Error saving preferences:', err);
  }
}

/**
 * Carrega histórico de mensagens recentes
 */
export async function loadRecentMessages(
  limit: number = 50
): Promise<PersistedMessage[]> {
  if (!state.supabase || !state.userId) {
    return [];
  }
  
  try {
    const { data, error } = await state.supabase
      .from('consciousness_messages')
      .select('*')
      .eq('user_id', state.userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[SupabasePersistence] Error loading messages:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SupabasePersistence] Error:', err);
    return [];
  }
}

/**
 * Carrega métricas do usuário
 */
export async function loadUserMetrics(): Promise<{
  totalMessages: number;
  acceptanceRate: number;
  topTopics: string[];
} | null> {
  if (!state.supabase || !state.userId) {
    return null;
  }
  
  try {
    // Buscar contagens
    const { data: messages, error } = await state.supabase
      .from('consciousness_messages')
      .select('outcome, topic')
      .eq('user_id', state.userId);
    
    if (error) {
      return null;
    }
    
    const total = messages?.length || 0;
    const accepted = messages?.filter(m => m.outcome === 'accepted').length || 0;
    
    // Contar tópicos
    const topicCounts: Record<string, number> = {};
    messages?.forEach(m => {
      topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1;
    });
    
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
    
    return {
      totalMessages: total,
      acceptanceRate: total > 0 ? accepted / total : 0,
      topTopics,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SupabasePersistence] Error:', err);
    return null;
  }
}

/**
 * Salva métricas diárias
 */
export async function saveDailyMetrics(
  metrics: Omit<PersistedDailyMetrics, 'id' | 'user_id'>
): Promise<void> {
  if (!state.supabase || !state.userId) {
    return;
  }
  
  try {
    await state.supabase
      .from('consciousness_daily_metrics')
      .upsert({
        user_id: state.userId,
        ...metrics,
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SupabasePersistence] Error saving metrics:', err);
  }
}

/**
 * Força flush imediato
 */
export async function flush(): Promise<void> {
  await flushQueues();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const SupabasePersistence = {
  init: initPersistence,
  stop: stopPersistence,
  persistMessage,
  persistFeedback,
  updateOutcome: updateMessageOutcome,
  loadPreferences,
  savePreferences,
  loadRecentMessages,
  loadUserMetrics,
  saveDailyMetrics,
  flush,
};

export default SupabasePersistence;

