/**
 * ══════════════════════════════════════════════════════════════════════════════
 * STATE - Sistema de Estado Unificado
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo exporta o sistema de estado unificado do Azuria.
 *
 * Componentes:
 * - UnifiedStateStore: Store centralizado
 * - GlobalStateAdapter: Adapter de compatibilidade com GlobalState antigo
 *
 * @example
 * ```typescript
 * import { UnifiedStateStore } from '@/azuria_ai/state';
 *
 * // Inicializar
 * UnifiedStateStore.init({ debug: true });
 *
 * // Registrar slice de engine
 * UnifiedStateStore.registerEngineSlice({
 *   engineId: 'myEngine',
 *   engineName: 'My Engine',
 *   initialState: { patterns: [], insights: [] },
 * });
 *
 * // Ler estado
 * const coreState = UnifiedStateStore.getCoreState();
 * const engineData = UnifiedStateStore.getEngineData('myEngine');
 *
 * // Atualizar estado
 * UnifiedStateStore.updateEngineSlice('myEngine', {
 *   patterns: [...newPatterns],
 * }, { source: 'myEngine' });
 * ```
 *
 * @module azuria_ai/state
 */

// ════════════════════════════════════════════════════════════════════════════
// UNIFIED STATE STORE
// ════════════════════════════════════════════════════════════════════════════

export {
  UnifiedStateStore,
  initUnifiedStore,
  shutdownUnifiedStore,
  getState,
  getCoreState,
  getCoreSection,
  getEngineSlice,
  getEngineData,
  listEngineSlices,
  isAdmin,
  isSilenced,
  getActiveEngineCount,
  isEngineRegistered,
  getUserRole,
  getUserTier,
  registerEngineSlice,
  unregisterEngineSlice,
  updateCoreState,
  updateCoreSection,
  updateEngineSlice,
  markSliceInitialized,
  resetState,
  initializeWithUser,
  onStateChange,
  onSliceChange,
  type CognitiveRole,
  type SubscriptionTier,
  type SkillLevel,
  type UserActivityState,
  type FlowPhase,
  type EventPriority,
  type CurrentMoment,
  type UserIdentity,
  type SessionData,
  type SystemHealth,
  type PendingAction,
  type CoreState,
  type EngineSlice,
  type SliceRegistration,
  type UnifiedState,
  type UpdateOptions,
  type StateListener,
  type SliceListener,
  type StoreConfig,
} from './UnifiedStateStore';

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE ADAPTER (COMPATIBILIDADE)
// ════════════════════════════════════════════════════════════════════════════

export {
  GlobalStateAdapter,
  migrateToUnifiedStore,
} from './GlobalStateAdapter';
