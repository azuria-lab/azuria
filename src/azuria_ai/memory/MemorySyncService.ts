/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MEMORY SYNC SERVICE - Sincronização de Memória com Supabase
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este serviço sincroniza a UnifiedMemory com as tabelas do Supabase:
 * - ai_memory_ltm: Long-Term Memory
 * - ai_memory_interactions: Histórico de interações
 * - ai_memory_patterns: Padrões detectados
 * - ai_memory_insights: Insights aprendidos
 *
 * @module azuria_ai/memory/MemorySyncService
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  AccumulatedFeedback,
  BehaviorPattern,
  DetectedPattern,
  LearnedPreference,
  LongTermMemory,
  RecentInteraction,
} from './UnifiedMemory';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Resultado de sincronização */
export interface SyncResult {
  success: boolean;
  operation: 'save' | 'load';
  table: string;
  rowsAffected?: number;
  error?: string;
}

/** Configuração do serviço */
export interface MemorySyncConfig {
  /** Se deve sincronizar automaticamente */
  autoSync: boolean;
  /** Intervalo de auto-sync em ms */
  autoSyncInterval: number;
  /** Se deve fazer log de debug */
  debug: boolean;
}

/** Estado do serviço */
interface SyncState {
  initialized: boolean;
  syncing: boolean;
  lastSyncAt: number | null;
  lastError: string | null;
  config: MemorySyncConfig;
  syncTimer: ReturnType<typeof setInterval> | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

const state: SyncState = {
  initialized: false,
  syncing: false,
  lastSyncAt: null,
  lastError: null,
  config: {
    autoSync: true,
    autoSyncInterval: 60000, // 1 minuto
    debug: false,
  },
  syncTimer: null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o serviço de sincronização
 */
export function initMemorySyncService(config: Partial<MemorySyncConfig> = {}): void {
  if (state.initialized) {
    return;
  }

  state.config = { ...state.config, ...config };
  state.initialized = true;

  // Configurar auto-sync
  if (state.config.autoSync) {
    state.syncTimer = setInterval(() => {
      // Trigger sync via callback
    }, state.config.autoSyncInterval);
  }

  log('MemorySyncService initialized');
}

/**
 * Desliga o serviço
 */
export function shutdownMemorySyncService(): void {
  if (!state.initialized) {
    return;
  }

  if (state.syncTimer) {
    clearInterval(state.syncTimer);
    state.syncTimer = null;
  }

  state.initialized = false;
  log('MemorySyncService shutdown');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAVE - Salvar no Supabase
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Salva Long-Term Memory no Supabase
 */
export async function saveLTM(userId: string, ltm: LongTermMemory): Promise<SyncResult> {
  try {
    // Usar upsert direto na tabela (RPC pode não estar disponível ou ter tipos incompatíveis)
    const { error } = await supabase
      .from('ai_memory_ltm')
      .upsert({
        user_id: userId,
        preferences: ltm.preferences as unknown,
        behavior_patterns: ltm.behaviorPatterns as unknown,
        history_summary: ltm.history as unknown,
        usage_context: {
          blockedTopics: ltm.blockedTopics,
          lastSyncAt: ltm.lastSyncAt,
        } as unknown,
        learned_insights: ltm.feedback as unknown,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      throw error;
    }

    state.lastSyncAt = Date.now();
    state.lastError = null;

    return {
      success: true,
      operation: 'save',
      table: 'ai_memory_ltm',
      rowsAffected: 1,
    };
  } catch (error) {
    const errorMsg = `Failed to save LTM: ${error}`;
    state.lastError = errorMsg;
    warn(errorMsg);

    return {
      success: false,
      operation: 'save',
      table: 'ai_memory_ltm',
      error: errorMsg,
    };
  }
}

/**
 * Salva uma interação no Supabase
 */
export async function saveInteraction(
  userId: string,
  interaction: RecentInteraction
): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('ai_memory_interactions').insert({
      user_id: userId,
      interaction_type: interaction.type === 'action' ? 'action' :
                        interaction.type === 'suggestion' ? 'suggestion' :
                        interaction.type === 'calculation' ? 'calculation' :
                        interaction.type === 'navigation' ? 'navigation' : 'other',
      user_input: interaction.description,
      ai_output: null,
      context: interaction.data || {},
      metadata: {
        outcome: interaction.outcome,
        timestamp: interaction.timestamp,
      },
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      operation: 'save',
      table: 'ai_memory_interactions',
      rowsAffected: 1,
    };
  } catch (error) {
    const errorMsg = `Failed to save interaction: ${error}`;
    warn(errorMsg);

    return {
      success: false,
      operation: 'save',
      table: 'ai_memory_interactions',
      error: errorMsg,
    };
  }
}

/**
 * Salva ou atualiza um padrão no Supabase
 */
export async function savePattern(
  userId: string,
  pattern: DetectedPattern
): Promise<SyncResult> {
  try {
    const patternId = `${pattern.type}_${pattern.description.slice(0, 50).replace(/\s+/g, '_')}`;

    const { error } = await supabase.from('ai_memory_patterns').upsert(
      {
        user_id: userId,
        pattern_id: patternId,
        pattern_name: pattern.description.slice(0, 100),
        category: pattern.type === 'repetition' ? 'behavior' :
                  pattern.type === 'hesitation' ? 'behavior' :
                  pattern.type === 'error' ? 'risk' :
                  pattern.type === 'preference' ? 'preference' :
                  pattern.type === 'workflow' ? 'usage' : 'other',
        confidence: pattern.confidence,
        data: pattern.data || {},
        occurrence_count: pattern.occurrences,
        last_detected_at: new Date(pattern.lastDetectedAt).toISOString(),
      },
      {
        onConflict: 'user_id,pattern_id',
      }
    );

    if (error) {
      throw error;
    }

    return {
      success: true,
      operation: 'save',
      table: 'ai_memory_patterns',
      rowsAffected: 1,
    };
  } catch (error) {
    const errorMsg = `Failed to save pattern: ${error}`;
    warn(errorMsg);

    return {
      success: false,
      operation: 'save',
      table: 'ai_memory_patterns',
      error: errorMsg,
    };
  }
}

/**
 * Salva um insight no Supabase
 */
export async function saveInsight(
  userId: string,
  insight: {
    type: string;
    title: string;
    description?: string;
    data?: Record<string, unknown>;
    confidence?: number;
  }
): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('ai_memory_insights').insert({
      user_id: userId,
      insight_type: insight.type === 'user_preference' ? 'user_preference' :
                    insight.type === 'optimization' ? 'optimization' :
                    insight.type === 'risk' ? 'risk' :
                    insight.type === 'opportunity' ? 'opportunity' :
                    insight.type === 'behavior' ? 'behavior' : 'other',
      title: insight.title,
      description: insight.description,
      data: insight.data || {},
      confidence: insight.confidence ?? 0.5,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      operation: 'save',
      table: 'ai_memory_insights',
      rowsAffected: 1,
    };
  } catch (error) {
    const errorMsg = `Failed to save insight: ${error}`;
    warn(errorMsg);

    return {
      success: false,
      operation: 'save',
      table: 'ai_memory_insights',
      error: errorMsg,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD - Carregar do Supabase
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Carrega toda a memória do usuário do Supabase
 */
export async function loadUserMemory(userId: string): Promise<{
  ltm: Partial<LongTermMemory> | null;
  recentInteractions: RecentInteraction[];
  patterns: DetectedPattern[];
  error?: string;
}> {
  try {
    // Carregar memórias separadamente (RPC não disponível ou tipos incompatíveis)
    // Buscar LTM diretamente da tabela
    const { data: ltmData } = await supabase
      .from('ai_memory_ltm')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Buscar interações recentes
    const { data: interactionsData } = await supabase
      .from('ai_memory_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(20);

    // Buscar padrões ativos
    const { data: patternsData } = await supabase
      .from('ai_memory_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('last_detected_at', { ascending: false })
      .limit(10);

    // Converter dados do Supabase para formato UnifiedMemory
    const ltm = ltmData ? convertLTMFromSupabase(ltmData as unknown as Record<string, unknown>) : null;
    const recentInteractions = interactionsData
      ? convertInteractionsFromSupabase(interactionsData as unknown as Record<string, unknown>[])
      : [];
    const patterns = patternsData
      ? convertPatternsFromSupabase(patternsData as unknown as Record<string, unknown>[])
      : [];

    state.lastSyncAt = Date.now();
    state.lastError = null;

    return {
      ltm,
      recentInteractions,
      patterns,
    };
  } catch (error) {
    const errorMsg = `Failed to load user memory: ${error}`;
    state.lastError = errorMsg;
    warn(errorMsg);

    return {
      ltm: null,
      recentInteractions: [],
      patterns: [],
      error: errorMsg,
    };
  }
}

/**
 * Carrega apenas LTM do Supabase
 */
export async function loadLTM(userId: string): Promise<Partial<LongTermMemory> | null> {
  try {
    const { data, error } = await supabase
      .from('ai_memory_ltm')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado - ok, usuário novo
        return null;
      }
      throw error;
    }

    return convertLTMFromSupabase(data);
  } catch (error) {
    warn(`Failed to load LTM: ${error}`);
    return null;
  }
}

/**
 * Carrega interações recentes do Supabase
 */
export async function loadRecentInteractions(
  userId: string,
  limit: number = 20
): Promise<RecentInteraction[]> {
  try {
    const { data, error } = await supabase
      .from('ai_memory_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return convertInteractionsFromSupabase(data || []);
  } catch (error) {
    warn(`Failed to load interactions: ${error}`);
    return [];
  }
}

/**
 * Carrega padrões ativos do Supabase
 */
export async function loadActivePatterns(
  userId: string,
  minConfidence: number = 0.5
): Promise<DetectedPattern[]> {
  try {
    const { data, error } = await supabase
      .from('ai_memory_patterns')
      .select('*')
      .eq('user_id', userId)
      .gte('confidence', minConfidence)
      .order('confidence', { ascending: false });

    if (error) {
      throw error;
    }

    return convertPatternsFromSupabase(data || []);
  } catch (error) {
    warn(`Failed to load patterns: ${error}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSORES
// ═══════════════════════════════════════════════════════════════════════════════

function convertLTMFromSupabase(data: Record<string, unknown>): Partial<LongTermMemory> {
  const preferences: LearnedPreference[] = [];
  const rawPrefs = data.preferences as Record<string, unknown> | undefined;
  
  if (rawPrefs) {
    Object.entries(rawPrefs).forEach(([key, value]) => {
      preferences.push({
        key,
        value,
        confidence: 1,
        observations: 1,
        updatedAt: Date.now(),
      });
    });
  }

  const behaviorPatterns: BehaviorPattern[] = [];
  const rawPatterns = data.behavior_patterns as unknown[] | undefined;
  
  if (Array.isArray(rawPatterns)) {
    rawPatterns.forEach((p: unknown) => {
      const pattern = p as Record<string, unknown>;
      behaviorPatterns.push({
        id: String(pattern.id || ''),
        type: String(pattern.type || 'unknown'),
        description: String(pattern.description || ''),
        frequency: Number(pattern.frequency) || 0,
        context: (pattern.context as string[]) || [],
        confidence: Number(pattern.confidence) || 0.5,
        totalOccurrences: Number(pattern.totalOccurrences) || 1,
        firstDetectedAt: Number(pattern.firstDetectedAt) || Date.now(),
        lastDetectedAt: Number(pattern.lastDetectedAt) || Date.now(),
      });
    });
  }

  const feedback: AccumulatedFeedback[] = [];
  const rawFeedback = data.learned_insights as unknown[] | undefined;
  
  if (Array.isArray(rawFeedback)) {
    rawFeedback.forEach((f: unknown) => {
      const fb = f as Record<string, unknown>;
      feedback.push({
        topic: String(fb.topic || ''),
        totalFeedback: Number(fb.totalFeedback) || 0,
        positive: Number(fb.positive) || 0,
        negative: Number(fb.negative) || 0,
        averageScore: Number(fb.averageScore) || 3,
        lastFeedbackAt: Number(fb.lastFeedbackAt) || Date.now(),
      });
    });
  }

  const usageContext = data.usage_context as Record<string, unknown> | undefined;
  const blockedTopics = (usageContext?.blockedTopics as Array<{ topic: string; blockedAt: number; reason: string }>) || [];

  return {
    userId: String(data.user_id || ''),
    preferences,
    behaviorPatterns,
    history: [],
    feedback,
    blockedTopics,
    lastSyncAt: Date.now(),
  };
}

function convertInteractionsFromSupabase(data: unknown[]): RecentInteraction[] {
  return data.map((item: unknown) => {
    const i = item as Record<string, unknown>;
    return {
      id: String(i.id || ''),
      type: i.interaction_type === 'action' ? 'action' as const :
            i.interaction_type === 'suggestion' ? 'suggestion' as const :
            i.interaction_type === 'calculation' ? 'calculation' as const :
            i.interaction_type === 'navigation' ? 'navigation' as const : 'action' as const,
      description: String(i.user_input || i.ai_output || ''),
      timestamp: new Date(String(i.created_at)).getTime(),
      outcome: (i.metadata as Record<string, unknown>)?.outcome as RecentInteraction['outcome'],
      data: i.context as Record<string, unknown>,
    };
  });
}

function convertPatternsFromSupabase(data: unknown[]): DetectedPattern[] {
  return data.map((item: unknown) => {
    const p = item as Record<string, unknown>;
    return {
      type: p.category === 'behavior' ? 'repetition' as const :
            p.category === 'preference' ? 'preference' as const :
            p.category === 'risk' ? 'error' as const :
            p.category === 'usage' ? 'workflow' as const : 'repetition' as const,
      description: String(p.pattern_name || ''),
      confidence: Number(p.confidence) || 0.5,
      occurrences: Number(p.occurrence_count) || 1,
      lastDetectedAt: new Date(String(p.last_detected_at)).getTime(),
      data: p.data as Record<string, unknown>,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sincroniza toda a memória (bi-direcional)
 */
export async function syncAllMemory(
  userId: string,
  localMemory: {
    ltm: LongTermMemory;
    recentInteractions: RecentInteraction[];
    patterns: DetectedPattern[];
  }
): Promise<{
  results: SyncResult[];
  success: boolean;
}> {
  if (state.syncing) {
    return {
      results: [],
      success: false,
    };
  }

  state.syncing = true;
  const results: SyncResult[] = [];

  try {
    // Salvar LTM
    results.push(await saveLTM(userId, localMemory.ltm));

    // Salvar interações recentes (últimas 10)
    const recentToSync = localMemory.recentInteractions.slice(0, 10);
    for (const interaction of recentToSync) {
      results.push(await saveInteraction(userId, interaction));
    }

    // Salvar padrões com confiança alta
    const patternsToSync = localMemory.patterns.filter(p => p.confidence > 0.6);
    for (const pattern of patternsToSync) {
      results.push(await savePattern(userId, pattern));
    }

    const allSuccess = results.every(r => r.success);
    state.lastSyncAt = Date.now();

    return {
      results,
      success: allSuccess,
    };
  } finally {
    state.syncing = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se o serviço está sincronizando
 */
export function isSyncing(): boolean {
  return state.syncing;
}

/**
 * Obtém timestamp do último sync
 */
export function getLastSyncAt(): number | null {
  return state.lastSyncAt;
}

/**
 * Obtém último erro
 */
export function getLastSyncError(): string | null {
  return state.lastError;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function log(...args: unknown[]): void {
  if (state.config.debug) {
    // eslint-disable-next-line no-console
    console.log('[MemorySyncService]', ...args);
  }
}

function warn(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  console.warn('[MemorySyncService]', ...args);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const MemorySyncService = {
  init: initMemorySyncService,
  shutdown: shutdownMemorySyncService,
  
  // Save
  saveLTM,
  saveInteraction,
  savePattern,
  saveInsight,
  
  // Load
  loadUserMemory,
  loadLTM,
  loadRecentInteractions,
  loadActivePatterns,
  
  // Sync
  syncAllMemory,
  isSyncing,
  getLastSyncAt,
  getLastSyncError,
} as const;

export default MemorySyncService;
