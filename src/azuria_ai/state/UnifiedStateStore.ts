/**
 * ══════════════════════════════════════════════════════════════════════════════
 * UNIFIED STATE STORE - Estado Único e Centralizado do Sistema
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo implementa o padrão de estado único para toda a aplicação Azuria.
 * Substitui os múltiplos estados espalhados por engines com um store centralizado.
 *
 * Arquitetura:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                        UNIFIED STATE STORE                                  │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  Core State (GlobalState)                                                   │
 * │  ├── currentMoment   # Contexto temporal                                    │
 * │  ├── identity        # Usuário (role, tier, etc)                            │
 * │  ├── session         # Dados da sessão                                      │
 * │  └── systemHealth    # Saúde do sistema                                     │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  Engine Slices (Registradas dinamicamente)                                  │
 * │  ├── cognitiveEngine: { patterns: [], insights: [] }                        │
 * │  ├── emotionEngine: { currentEmotion: 'neutral', ... }                      │
 * │  ├── adaptiveEngine: { actions: [], feedback: [] }                          │
 * │  └── [engineId]: { ... }                                                    │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  Derived State (Computado)                                                  │
 * │  ├── isAdmin                                                                │
 * │  ├── isSilenced                                                             │
 * │  └── activeEngineCount                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * Regras:
 * 1. LEITURA: Qualquer módulo pode ler o estado
 * 2. ESCRITA: Apenas através de actions governadas
 * 3. SLICES: Engines registram suas seções e podem atualizar apenas elas
 * 4. SINCRONIZAÇÃO: Mudanças são notificadas via listeners
 *
 * @module azuria_ai/state/UnifiedStateStore
 */

import { generateSecureSessionId } from '@/utils/secureRandom';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS CORE
// ═══════════════════════════════════════════════════════════════════════════════

/** Papel cognitivo do usuário */
export type CognitiveRole = 'ADMIN' | 'USER';

/** Nível de assinatura */
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

/** Nível de habilidade */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Estado de atividade */
export type UserActivityState =
  | 'idle'
  | 'browsing'
  | 'calculating'
  | 'analyzing'
  | 'editing'
  | 'reviewing'
  | 'learning';

/** Fase do fluxo */
export type FlowPhase =
  | 'idle'
  | 'input'
  | 'processing'
  | 'result'
  | 'review'
  | 'export';

/** Prioridade de evento */
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DO ESTADO CORE
// ═══════════════════════════════════════════════════════════════════════════════

/** Momento atual do sistema */
export interface CurrentMoment {
  timestamp: number;
  screen: string;
  flowPhase: FlowPhase;
  userActivity: UserActivityState;
  silenceRequested: boolean;
  silenceUntil: number | null;
  lastUserAction: string | null;
  lastActionAt: number;
}

/** Identidade do usuário */
export interface UserIdentity {
  id: string | null;
  role: CognitiveRole;
  tier: SubscriptionTier;
  skillLevel: SkillLevel;
  preferences: {
    suggestionFrequency: 'low' | 'medium' | 'high';
    explanationLevel: 'minimal' | 'normal' | 'detailed';
    proactiveAssistance: boolean;
  };
}

/** Dados da sessão */
export interface SessionData {
  id: string;
  startedAt: number;
  metrics: {
    calculationsCompleted: number;
    errorsEncountered: number;
    suggestionsShown: number;
    suggestionsAccepted: number;
    suggestionsDismissed: number;
  };
  journey: {
    screens: string[];
    currentFlow: string | null;
    flowProgress: number;
  };
}

/** Saúde do sistema */
export interface SystemHealth {
  overallScore: number;
  activeEngines: string[];
  lastErrors: Array<{ engine: string; error: string; at: number }>;
  aiAvailability: {
    gemini: boolean;
  };
}

/** Ação pendente */
export interface PendingAction {
  id: string;
  type: string;
  priority: EventPriority;
  scheduledFor: number | null;
  payload: unknown;
  attempts: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DO STORE UNIFICADO
// ═══════════════════════════════════════════════════════════════════════════════

/** Estado core (sempre presente) */
export interface CoreState {
  currentMoment: CurrentMoment;
  identity: UserIdentity;
  session: SessionData;
  systemHealth: SystemHealth;
  pendingActions: PendingAction[];
  lastUpdatedAt: number;
  initialized: boolean;
}

/** Slice de estado de um engine */
export interface EngineSlice<T = unknown> {
  /** ID do engine dono desta slice */
  engineId: string;
  /** Nome legível */
  engineName: string;
  /** Versão do schema */
  version: number;
  /** Se está inicializado */
  initialized: boolean;
  /** Dados do engine */
  data: T;
  /** Última atualização */
  updatedAt: number;
}

/** Registro de slice */
export interface SliceRegistration<T = unknown> {
  engineId: string;
  engineName: string;
  initialState: T;
  version?: number;
  /** Permite escrita direta (durante migração) */
  allowDirectWrite?: boolean;
}

/** Estado completo do store */
export interface UnifiedState {
  /** Estado core */
  core: CoreState;
  /** Slices dos engines */
  engines: Record<string, EngineSlice>;
  /** Metadados do store */
  meta: {
    version: number;
    createdAt: number;
    lastSyncAt: number;
  };
}

/** Opções de atualização */
export interface UpdateOptions {
  /** Fonte da atualização */
  source: string;
  /** Se deve notificar listeners */
  notify?: boolean;
  /** Se é atualização silenciosa (sem log) */
  silent?: boolean;
}

/** Opções padrão de atualização */
const defaultUpdateOptions: UpdateOptions = {
  source: 'system',
  notify: true,
  silent: false,
};

/** Listener de mudanças */
export type StateListener = (
  state: UnifiedState,
  changedPaths: string[]
) => void;

/** Listener de slice específica */
export type SliceListener<T> = (
  slice: EngineSlice<T>,
  changedKeys: (keyof T)[]
) => void;

/** Configuração do store */
export interface StoreConfig {
  /** Modo debug */
  debug?: boolean;
  /** Persistir no localStorage */
  persist?: boolean;
  /** Chave do localStorage */
  persistKey?: string;
  /** Intervalo de auto-save (ms) */
  autoSaveInterval?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialCoreState(): CoreState {
  const now = Date.now();

  return {
    currentMoment: {
      timestamp: now,
      screen: '/',
      flowPhase: 'idle',
      userActivity: 'idle',
      silenceRequested: false,
      silenceUntil: null,
      lastUserAction: null,
      lastActionAt: now,
    },

    identity: {
      id: null,
      role: 'USER',
      tier: 'FREE',
      skillLevel: 'beginner',
      preferences: {
        suggestionFrequency: 'medium',
        explanationLevel: 'detailed',
        proactiveAssistance: true,
      },
    },

    session: {
      id: generateSecureSessionId(),
      startedAt: now,
      metrics: {
        calculationsCompleted: 0,
        errorsEncountered: 0,
        suggestionsShown: 0,
        suggestionsAccepted: 0,
        suggestionsDismissed: 0,
      },
      journey: {
        screens: [],
        currentFlow: null,
        flowProgress: 0,
      },
    },

    systemHealth: {
      overallScore: 1,
      activeEngines: [],
      lastErrors: [],
      aiAvailability: {
        gemini: false,
      },
    },

    pendingActions: [],
    lastUpdatedAt: now,
    initialized: false,
  };
}

function createInitialStore(): UnifiedState {
  const now = Date.now();

  return {
    core: createInitialCoreState(),
    engines: {},
    meta: {
      version: 1,
      createdAt: now,
      lastSyncAt: now,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON DO STORE
// ═══════════════════════════════════════════════════════════════════════════════

let store: UnifiedState = createInitialStore();
let config: StoreConfig = {};
let initialized = false;

// Listeners
const globalListeners: Set<StateListener> = new Set();
const sliceListeners: Map<string, Set<SliceListener<unknown>>> = new Map();

// Auto-save timer
let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o UnifiedStateStore
 */
export function initUnifiedStore(storeConfig: StoreConfig = {}): void {
  if (initialized) {
    log('Store already initialized');
    return;
  }

  config = storeConfig;

  // Tentar restaurar do localStorage se persistência está habilitada
  if (config.persist && config.persistKey) {
    try {
      const saved = localStorage.getItem(config.persistKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<UnifiedState>;
        // Merge com estado inicial para garantir campos novos
        store = {
          ...createInitialStore(),
          ...parsed,
          core: {
            ...createInitialCoreState(),
            ...(parsed.core || createInitialCoreState()),
          },
        };
        log('Restored state from localStorage');
      }
    } catch (error) {
      warn('Failed to restore state:', error);
    }
  }

  // Configurar auto-save
  if (config.persist && config.autoSaveInterval) {
    autoSaveTimer = setInterval(() => {
      saveToStorage();
    }, config.autoSaveInterval);
  }

  initialized = true;
  log('UnifiedStateStore initialized');
}

/**
 * Desliga o store
 */
export function shutdownUnifiedStore(): void {
  if (!initialized) {
    return;
  }

  // Limpar auto-save
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }

  // Salvar antes de desligar
  if (config.persist) {
    saveToStorage();
  }

  // Limpar listeners
  globalListeners.clear();
  sliceListeners.clear();

  initialized = false;
  log('UnifiedStateStore shutdown');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DE LEITURA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém o estado completo (cópia)
 */
export function getState(): UnifiedState {
  return structuredClone(store);
}

/**
 * Obtém o estado core
 */
export function getCoreState(): CoreState {
  return structuredClone(store.core);
}

/**
 * Obtém uma seção do estado core
 */
export function getCoreSection<K extends keyof CoreState>(section: K): CoreState[K] {
  return structuredClone(store.core[section]);
}

/**
 * Obtém uma slice de engine
 */
export function getEngineSlice<T = unknown>(engineId: string): EngineSlice<T> | null {
  const slice = store.engines[engineId];
  if (!slice) {
    return null;
  }
  return structuredClone(slice) as EngineSlice<T>;
}

/**
 * Obtém apenas os dados de uma slice
 */
export function getEngineData<T = unknown>(engineId: string): T | null {
  const slice = store.engines[engineId];
  if (!slice) {
    return null;
  }
  return structuredClone(slice.data) as T;
}

/**
 * Lista todas as slices registradas
 */
export function listEngineSlices(): string[] {
  return Object.keys(store.engines);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALORES DERIVADOS (COMPUTADOS)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se é ADMIN
 */
export function isAdmin(): boolean {
  return store.core.identity.role === 'ADMIN';
}

/**
 * Verifica se está silenciado
 */
export function isSilenced(): boolean {
  if (store.core.currentMoment.silenceRequested) {
    return true;
  }
  const silenceUntil = store.core.currentMoment.silenceUntil;
  return silenceUntil !== null && Date.now() < silenceUntil;
}

/**
 * Obtém contagem de engines ativos
 */
export function getActiveEngineCount(): number {
  return Object.values(store.engines).filter((s) => s.initialized).length;
}

/**
 * Verifica se um engine está registrado
 */
export function isEngineRegistered(engineId: string): boolean {
  return engineId in store.engines;
}

/**
 * Obtém o papel do usuário
 */
export function getUserRole(): CognitiveRole {
  return store.core.identity.role;
}

/**
 * Obtém o tier do usuário
 */
export function getUserTier(): SubscriptionTier {
  return store.core.identity.tier;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DE ESCRITA (GOVERNADA)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registra uma nova slice de engine
 */
export function registerEngineSlice<T>(registration: SliceRegistration<T>): void {
  const { engineId, engineName, initialState, version = 1 } = registration;

  if (store.engines[engineId]) {
    log(`Slice already registered: ${engineId}`);
    return;
  }

  const slice: EngineSlice<T> = {
    engineId,
    engineName,
    version,
    initialized: false,
    data: structuredClone(initialState),
    updatedAt: Date.now(),
  };

  store.engines[engineId] = slice as EngineSlice<unknown>;

  // Adicionar ao systemHealth.activeEngines
  if (!store.core.systemHealth.activeEngines.includes(engineId)) {
    store.core.systemHealth.activeEngines.push(engineId);
  }

  notifyGlobal([`engines.${engineId}`]);
  log(`Registered slice: ${engineId}`);
}

/**
 * Remove uma slice de engine
 */
export function unregisterEngineSlice(engineId: string): void {
  if (!store.engines[engineId]) {
    return;
  }

  delete store.engines[engineId];

  // Remover do systemHealth.activeEngines
  const idx = store.core.systemHealth.activeEngines.indexOf(engineId);
  if (idx >= 0) {
    store.core.systemHealth.activeEngines.splice(idx, 1);
  }

  // Limpar listeners da slice
  sliceListeners.delete(engineId);

  notifyGlobal([`engines.${engineId}`]);
  log(`Unregistered slice: ${engineId}`);
}

/**
 * Atualiza o estado core
 * ATENÇÃO: Deve ser chamado apenas pelo CentralNucleus ou ConsciousnessCore
 */
export function updateCoreState(
  updates: Partial<CoreState>,
  options: UpdateOptions = defaultUpdateOptions
): void {
  const changedPaths: string[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      const typedKey = key as keyof CoreState;
      changedPaths.push(`core.${key}`);

      const existing = store.core[typedKey];

      // Deep merge para objetos
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof existing === 'object' &&
        existing !== null &&
        !Array.isArray(existing)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingRecord = existing as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valueRecord = value as any;
        (store.core as unknown as Record<string, unknown>)[key] = {
          ...existingRecord,
          ...valueRecord,
        };
      } else {
        (store.core as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }

  store.core.lastUpdatedAt = Date.now();

  if (!options.silent && changedPaths.length > 0) {
    notifyGlobal(changedPaths);
  }

  if (config.debug && !options.silent) {
    log(`Core updated by ${options.source}:`, changedPaths);
  }
}

/**
 * Atualiza uma seção específica do core
 */
export function updateCoreSection<K extends keyof CoreState>(
  section: K,
  updates: Partial<CoreState[K]>,
  options: UpdateOptions = defaultUpdateOptions
): void {
  const current = store.core[section];

  if (typeof current === 'object' && current !== null) {
    (store.core as unknown as Record<string, unknown>)[section] = {
      ...current,
      ...updates,
    };
  } else {
    (store.core as unknown as Record<string, unknown>)[section] = updates;
  }

  store.core.lastUpdatedAt = Date.now();

  if (options.notify !== false) {
    notifyGlobal([`core.${String(section)}`]);
  }

  if (config.debug && !options.silent) {
    log(`Core section ${String(section)} updated by ${options.source}`);
  }
}

/**
 * Atualiza dados de uma slice de engine
 * Engines devem usar esta função para atualizar seu estado
 */
export function updateEngineSlice<T>(
  engineId: string,
  updates: Partial<T>,
  options: UpdateOptions = defaultUpdateOptions
): boolean {
  const slice = store.engines[engineId];

  if (!slice) {
    warn(`Slice not found: ${engineId}`);
    return false;
  }

  // Verificar se a fonte tem permissão
  if (options.source !== engineId && options.source !== 'nucleus' && options.source !== 'core') {
    // Durante migração, permitir escrita de qualquer fonte
    // FUTURE: Remover após migração completa
    if (config.debug) {
      warn(`Cross-slice write from ${options.source} to ${engineId} (allowed during migration)`);
    }
  }

  const changedKeys: string[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      changedKeys.push(key);
      (slice.data as Record<string, unknown>)[key] = value;
    }
  }

  slice.updatedAt = Date.now();

  if (options.notify !== false) {
    notifyGlobal([`engines.${engineId}`]);
    notifySlice(engineId, changedKeys);
  }

  if (config.debug && !options.silent) {
    log(`Slice ${engineId} updated:`, changedKeys);
  }

  return true;
}

/**
 * Marca uma slice como inicializada
 */
export function markSliceInitialized(engineId: string): void {
  const slice = store.engines[engineId];
  if (slice) {
    slice.initialized = true;
    slice.updatedAt = Date.now();
    notifyGlobal([`engines.${engineId}.initialized`]);
  }
}

/**
 * Reseta o estado completo
 */
export function resetState(): void {
  store = createInitialStore();
  notifyGlobal(['*']);
  log('State reset');
}

/**
 * Inicializa o estado com dados do usuário
 */
export function initializeWithUser(
  userId: string | null,
  role: CognitiveRole,
  tier: SubscriptionTier
): void {
  updateCoreSection(
    'identity',
    {
      id: userId,
      role,
      tier,
    },
    { source: 'init' }
  );
  store.core.initialized = true;
  notifyGlobal(['core.identity', 'core.initialized']);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registra listener para mudanças globais
 */
export function onStateChange(listener: StateListener): () => void {
  globalListeners.add(listener);
  return () => globalListeners.delete(listener);
}

/**
 * Registra listener para uma slice específica
 */
export function onSliceChange<T>(
  engineId: string,
  listener: SliceListener<T>
): () => void {
  if (!sliceListeners.has(engineId)) {
    sliceListeners.set(engineId, new Set());
  }
  const listeners = sliceListeners.get(engineId);
  if (listeners) {
    listeners.add(listener as SliceListener<unknown>);
  }
  return () => sliceListeners.get(engineId)?.delete(listener as SliceListener<unknown>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES INTERNAS
// ═══════════════════════════════════════════════════════════════════════════════

function notifyGlobal(changedPaths: string[]): void {
  const stateCopy = getState();
  globalListeners.forEach((listener) => {
    try {
      listener(stateCopy, changedPaths);
    } catch (error) {
      warn('Global listener error:', error);
    }
  });
}

function notifySlice(engineId: string, changedKeys: string[]): void {
  const listeners = sliceListeners.get(engineId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  const slice = store.engines[engineId];
  if (!slice) {
    return;
  }

  const sliceCopy = structuredClone(slice);
  listeners.forEach((listener) => {
    try {
      listener(sliceCopy, changedKeys as never[]);
    } catch (error) {
      warn('Slice listener error:', error);
    }
  });
}

function saveToStorage(): void {
  if (!config.persist || !config.persistKey) {
    return;
  }

  try {
    localStorage.setItem(config.persistKey, JSON.stringify(store));
    store.meta.lastSyncAt = Date.now();
  } catch (error) {
    warn('Failed to save state:', error);
  }
}

function log(...args: unknown[]): void {
  if (config.debug) {
    // eslint-disable-next-line no-console
    console.log('[UnifiedStore]', ...args);
  }
}

function warn(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  console.warn('[UnifiedStore]', ...args);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DO NAMESPACE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * UnifiedStateStore como namespace para uso direto
 */
export const UnifiedStateStore = {
  // Inicialização
  init: initUnifiedStore,
  shutdown: shutdownUnifiedStore,

  // Leitura
  getState,
  getCoreState,
  getCoreSection,
  getEngineSlice,
  getEngineData,
  listEngineSlices,

  // Valores derivados
  isAdmin,
  isSilenced,
  getActiveEngineCount,
  isEngineRegistered,
  getUserRole,
  getUserTier,

  // Escrita
  registerEngineSlice,
  unregisterEngineSlice,
  updateCoreState,
  updateCoreSection,
  updateEngineSlice,
  markSliceInitialized,
  resetState,
  initializeWithUser,

  // Listeners
  onStateChange,
  onSliceChange,
} as const;
