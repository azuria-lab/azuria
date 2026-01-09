/**
 * ══════════════════════════════════════════════════════════════════════════════
 * GLOBAL STATE ADAPTER - Compatibilidade com GlobalState Legado
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este adapter permite que código existente que usa GlobalState continue
 * funcionando enquanto migramos para o UnifiedStateStore.
 *
 * Estratégia:
 * 1. Interceptar chamadas do GlobalState antigo
 * 2. Redirecionar para UnifiedStateStore
 * 3. Manter compatibilidade com a API existente
 *
 * @deprecated Use UnifiedStateStore diretamente em código novo
 * @module azuria_ai/state/GlobalStateAdapter
 */

import {
  type CognitiveRole,
  type CoreState,
  getCoreSection,
  getCoreState,
  initializeWithUser,
  onStateChange,
  resetState,
  type SubscriptionTier,
  getUserRole as unifiedGetUserRole,
  isAdmin as unifiedIsAdmin,
  isSilenced as unifiedIsSilenced,
  UnifiedStateStore,
  updateCoreSection,
  updateCoreState,
} from './UnifiedStateStore';

// Re-exportar tipos do antigo GlobalState para compatibilidade
export type { CognitiveRole, SubscriptionTier } from './UnifiedStateStore';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════════════════════════

/** Forma do GlobalState legado (mapeada para CoreState) */
export type GlobalStateShape = CoreState;

/** Listener legado */
export type LegacyStateListener = (
  state: GlobalStateShape,
  changedKeys: string[]
) => void;

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém o estado global (compatibilidade)
 * @deprecated Use UnifiedStateStore.getCoreState()
 */
export function getGlobalState(): GlobalStateShape {
  return getCoreState();
}

/**
 * Obtém uma seção do estado (compatibilidade)
 * @deprecated Use UnifiedStateStore.getCoreSection()
 */
export function getStateSection<K extends keyof GlobalStateShape>(
  section: K
): GlobalStateShape[K] {
  return getCoreSection(section);
}

/**
 * Atualiza o estado global (compatibilidade)
 * @deprecated Use UnifiedStateStore.updateCoreState()
 */
export function updateGlobalState(
  updates: Partial<GlobalStateShape>,
  source: string = 'legacy'
): void {
  updateCoreState(updates, { source: `legacy:${source}` });
}

/**
 * Atualiza uma seção do estado (compatibilidade)
 * @deprecated Use UnifiedStateStore.updateCoreSection()
 */
export function updateStateSection<K extends keyof GlobalStateShape>(
  section: K,
  updates: Partial<GlobalStateShape[K]>,
  source: string = 'legacy'
): void {
  updateCoreSection(section, updates, { source: `legacy:${source}` });
}

/**
 * Reseta o estado (compatibilidade)
 * @deprecated Use UnifiedStateStore.resetState()
 */
export function resetGlobalState(): void {
  resetState();
}

/**
 * Inicializa o estado com dados do usuário (compatibilidade)
 * @deprecated Use UnifiedStateStore.initializeWithUser()
 */
export function initializeState(
  userId: string | null,
  role: CognitiveRole,
  tier: SubscriptionTier
): void {
  initializeWithUser(userId, role, tier);
}

/**
 * Verifica se é ADMIN (compatibilidade)
 * @deprecated Use UnifiedStateStore.isAdmin()
 */
export function isAdmin(): boolean {
  return unifiedIsAdmin();
}

/**
 * Verifica se está silenciado (compatibilidade)
 * @deprecated Use UnifiedStateStore.isSilenced()
 */
export function isSilenced(): boolean {
  return unifiedIsSilenced();
}

/**
 * Obtém o papel do usuário (compatibilidade)
 * @deprecated Use UnifiedStateStore.getUserRole()
 */
export function getUserRole(): CognitiveRole {
  return unifiedGetUserRole();
}

/**
 * Obtém métricas da sessão (compatibilidade)
 */
export function getSessionMetrics(): CoreState['session']['metrics'] {
  return { ...getCoreSection('session').metrics };
}

/**
 * Obtém atividade atual (compatibilidade)
 */
export function getCurrentActivity(): CoreState['currentMoment']['userActivity'] {
  return getCoreSection('currentMoment').userActivity;
}

/**
 * Registra listener para mudanças (compatibilidade)
 * @deprecated Use UnifiedStateStore.onStateChange()
 */
export function subscribeToState(listener: LegacyStateListener): () => void {
  return onStateChange((state, changedPaths) => {
    // Converter changedPaths para changedKeys (formato legado)
    const changedKeys = changedPaths
      .filter((p) => p.startsWith('core.'))
      .map((p) => p.replace('core.', ''));
    
    if (changedKeys.length > 0) {
      listener(state.core, changedKeys);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIGRAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Migra dados do GlobalState antigo para o UnifiedStateStore
 */
export async function migrateToUnifiedStore(): Promise<{
  success: boolean;
  migratedKeys: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  const migratedKeys: string[] = [];

  try {
    // Importar o GlobalState antigo dinamicamente
    const oldGlobalState = await import('../consciousness/GlobalState');

    // Obter estado atual do antigo
    const oldState = oldGlobalState.getGlobalState();

    // Mapear para o novo formato
    const coreUpdates: Partial<CoreState> = {
      currentMoment: {
        timestamp: oldState.currentMoment?.timestamp ?? Date.now(),
        screen: oldState.currentMoment?.screen ?? '/',
        flowPhase: oldState.currentMoment?.flowPhase ?? 'idle',
        userActivity: oldState.currentMoment?.userActivity ?? 'idle',
        silenceRequested: oldState.currentMoment?.silenceRequested ?? false,
        silenceUntil: oldState.currentMoment?.silenceUntil ?? null,
        lastUserAction: oldState.currentMoment?.lastUserAction ?? null,
        lastActionAt: oldState.currentMoment?.lastActionAt ?? Date.now(),
      },
      identity: {
        id: oldState.identity?.id ?? null,
        role: oldState.identity?.role ?? 'USER',
        tier: oldState.identity?.tier ?? 'FREE',
        skillLevel: oldState.identity?.skillLevel ?? 'beginner',
        preferences: {
          suggestionFrequency: oldState.identity?.preferences?.suggestionFrequency ?? 'medium',
          explanationLevel: oldState.identity?.preferences?.explanationLevel ?? 'detailed',
          proactiveAssistance: oldState.identity?.preferences?.proactiveAssistance ?? true,
        },
      },
      session: oldState.session ?? getCoreSection('session'),
      systemHealth: oldState.systemHealth ?? getCoreSection('systemHealth'),
      pendingActions: oldState.pendingActions ?? [],
      initialized: oldState.initialized ?? false,
    };

    // Aplicar migração
    updateCoreState(coreUpdates, { source: 'migration' });
    migratedKeys.push('currentMoment', 'identity', 'session', 'systemHealth', 'pendingActions');

    // eslint-disable-next-line no-console
    console.log('[GlobalStateAdapter] Migration completed:', migratedKeys);

  } catch (error) {
    errors.push(`Migration failed: ${error}`);
    // eslint-disable-next-line no-console
    console.error('[GlobalStateAdapter] Migration error:', error);
  }

  return {
    success: errors.length === 0,
    migratedKeys,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAMESPACE DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Adapter para GlobalState legado
 * @deprecated Use UnifiedStateStore diretamente
 */
export const GlobalStateAdapter = {
  // Leitura
  getGlobalState,
  getStateSection,
  isAdmin,
  isSilenced,
  getUserRole,
  getSessionMetrics,
  getCurrentActivity,

  // Escrita
  updateGlobalState,
  updateStateSection,
  resetGlobalState,
  initializeState,

  // Listeners
  subscribeToState,

  // Migração
  migrateToUnifiedStore,

  // Referência ao novo store
  UnifiedStore: UnifiedStateStore,
} as const;
