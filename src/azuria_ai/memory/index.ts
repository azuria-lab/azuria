/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MEMORY - Sistema de Memória Unificado
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo exporta o sistema de memória unificado do Modo Deus.
 *
 * Níveis de memória:
 * - STM (Short-Term Memory): Contexto atual, interações recentes
 * - WM (Working Memory): Sessão atual, padrões detectados
 * - LTM (Long-Term Memory): Preferências, comportamentos, histórico
 *
 * @example
 * ```typescript
 * import { UnifiedMemory } from '@/azuria_ai/memory';
 *
 * // Inicializar com sync Supabase
 * await UnifiedMemory.init({
 *   userId: 'user123',
 *   enableSync: true,
 *   syncInterval: 60000,
 * });
 *
 * // Registrar interação
 * UnifiedMemory.recordInteraction({
 *   type: 'calculation',
 *   description: 'Cálculo BDI completado',
 *   outcome: 'completed',
 * });
 *
 * // Buscar na memória
 * const results = UnifiedMemory.recall({ topic: 'BDI', limit: 5 });
 * ```
 *
 * @module azuria_ai/memory
 */

export {
  UnifiedMemory,
  initMemory,
  shutdownMemory,
  getMemory,
  getSTM,
  getWM,
  getLTM,
  getCurrentContext,
  getRecentInteractions,
  getDetectedPatterns,
  getLearnedPreference,
  isTopicBlocked,
  getSessionCounters,
  updateContext,
  recordInteraction,
  recordInsightShown,
  recordCalculation,
  updateCurrentFlow,
  recordPattern,
  incrementCounter,
  updatePreference,
  recordBehaviorPattern,
  recordFeedback,
  blockTopic,
  unblockTopic,
  forceSync,
  onSync,
  recall,
  type CurrentContext,
  type RecentInteraction,
  type ShortTermMemory,
  type SessionCalculation,
  type SessionFlow,
  type DetectedPattern,
  type WorkingMemory,
  type LearnedPreference,
  type BehaviorPattern,
  type InteractionHistory,
  type AccumulatedFeedback,
  type LongTermMemory,
  type UnifiedMemory as UnifiedMemoryType,
  type MemoryConfig,
  type SyncCallback,
  type RecallResult,
} from './UnifiedMemory';

// ══════════════════════════════════════════════════════════════════════════════
// Memory Sync Service - Sincronização com Supabase
// ══════════════════════════════════════════════════════════════════════════════
export {
  MemorySyncService,
  type MemorySyncConfig,
  type SyncResult,
} from './MemorySyncService';
