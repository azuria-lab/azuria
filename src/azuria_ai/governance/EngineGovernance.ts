/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ENGINE GOVERNANCE - Sistema de Governança de Engines
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo implementa o sistema de governança que controla quando e como
 * os engines podem agir. NENHUM engine deve emitir eventos ou executar ações
 * sem passar por este sistema.
 *
 * Hierarquia de Autoridade:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  CentralNucleus (Autoridade Máxima)                                     │
 * │       ↓                                                                 │
 * │  EngineGovernance (Controle de Permissões)                             │
 * │       ↓                                                                 │
 * │  GovernedEngine (Engine que pede permissão)                            │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Regras:
 * 1. Cada engine deve se registrar via registerEngine()
 * 2. Antes de emitir, chamar requestEmitPermission()
 * 3. Antes de executar ação, chamar requestActionPermission()
 * 4. O Nucleus pode revogar permissões a qualquer momento
 *
 * @module azuria_ai/governance/EngineGovernance
 */

import { type ActionRequest, requestAction } from '../consciousness/CentralNucleus';
import type { EventType } from '../core/eventBus';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Categoria do engine */
export type EngineCategory =
  | 'cognitive'      // Análise e raciocínio
  | 'operational'    // Co-Pilot e sugestões
  | 'governance'     // Validação e auditoria
  | 'safety'         // Segurança e limites
  | 'learning'       // Aprendizado e adaptação
  | 'prediction'     // Previsão e forecasting
  | 'communication'  // Comunicação e brand voice
  | 'integration'    // Integração externa
  | 'utility';       // Utilitários

/** Nível de privilégio do engine */
export type EnginePrivilege =
  | 'system'    // Pode tudo (apenas engines de sistema)
  | 'elevated'  // Pode emitir sem aprovação para eventos específicos
  | 'standard'  // Precisa de aprovação para emitir
  | 'restricted'; // Precisa de aprovação para qualquer ação

/** Registro de um engine */
export interface EngineRegistration {
  /** ID único do engine */
  id: string;
  /** Nome amigável */
  name: string;
  /** Categoria funcional */
  category: EngineCategory;
  /** Nível de privilégio */
  privilege: EnginePrivilege;
  /** Eventos que pode emitir */
  allowedEvents: EventType[];
  /** Eventos que pode ouvir */
  subscribedEvents: EventType[];
  /** Se está ativo */
  active: boolean;
  /** Timestamp de registro */
  registeredAt: number;
  /** Última atividade */
  lastActivity: number;
  /** Estatísticas */
  stats: {
    permissionsRequested: number;
    permissionsGranted: number;
    permissionsDenied: number;
    actionsExecuted: number;
    eventsEmitted: number;
  };
}

/** Solicitação de permissão para emitir evento */
export interface EmitPermissionRequest {
  engineId: string;
  eventType: EventType;
  payload: unknown;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  reason?: string;
}

/** Resposta de permissão */
export interface PermissionResponse {
  granted: boolean;
  reason?: string;
  /** Se deve modificar o payload antes de emitir */
  modifiedPayload?: unknown;
  /** Se deve atrasar a emissão */
  delayMs?: number;
}

/** Configuração de governança */
export interface GovernanceConfig {
  /** Se deve exigir aprovação para todos os engines */
  strictMode: boolean;
  /** Eventos que sempre passam sem aprovação */
  bypassEvents: EventType[];
  /** Engines com bypass automático */
  trustedEngines: string[];
  /** Modo debug */
  debug: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

interface GovernanceState {
  initialized: boolean;
  config: GovernanceConfig;
  engines: Map<string, EngineRegistration>;
  /** Cache de permissões recentes (para evitar consultas repetidas) */
  permissionCache: Map<string, { granted: boolean; expiresAt: number }>;
  stats: {
    totalRequests: number;
    granted: number;
    denied: number;
    cached: number;
  };
}

const state: GovernanceState = {
  initialized: false,
  config: {
    strictMode: false,
    bypassEvents: [
      'system:init',
      'system:shutdown',
      'system:tick',
    ],
    trustedEngines: [
      'consciousnessCore',
      'centralNucleus',
    ],
    debug: false,
  },
  engines: new Map(),
  permissionCache: new Map(),
  stats: {
    totalRequests: 0,
    granted: 0,
    denied: 0,
    cached: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema de governança
 */
export function initEngineGovernance(config?: Partial<GovernanceConfig>): void {
  if (state.initialized) {
    return;
  }

  if (config) {
    state.config = { ...state.config, ...config };
  }

  state.initialized = true;
  log('Engine Governance initialized');
}

/**
 * Desliga o sistema de governança
 */
export function shutdownEngineGovernance(): void {
  if (!state.initialized) {
    return;
  }

  state.engines.clear();
  state.permissionCache.clear();
  state.initialized = false;
  log('Engine Governance shutdown');
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRO DE ENGINES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registra um engine no sistema de governança
 */
export function registerEngine(
  id: string,
  config: {
    name: string;
    category: EngineCategory;
    privilege?: EnginePrivilege;
    allowedEvents?: EventType[];
    subscribedEvents?: EventType[];
  }
): boolean {
  if (state.engines.has(id)) {
    warn(`Engine '${id}' already registered`);
    return false;
  }

  const registration: EngineRegistration = {
    id,
    name: config.name,
    category: config.category,
    privilege: config.privilege ?? 'standard',
    allowedEvents: config.allowedEvents ?? [],
    subscribedEvents: config.subscribedEvents ?? [],
    active: true,
    registeredAt: Date.now(),
    lastActivity: Date.now(),
    stats: {
      permissionsRequested: 0,
      permissionsGranted: 0,
      permissionsDenied: 0,
      actionsExecuted: 0,
      eventsEmitted: 0,
    },
  };

  state.engines.set(id, registration);
  log(`Engine '${id}' registered (${config.category}, ${registration.privilege})`);
  return true;
}

/**
 * Remove um engine do sistema
 */
export function unregisterEngine(id: string): boolean {
  const removed = state.engines.delete(id);
  if (removed) {
    log(`Engine '${id}' unregistered`);
  }
  return removed;
}

/**
 * Obtém informações de um engine
 */
export function getEngine(id: string): EngineRegistration | undefined {
  return state.engines.get(id);
}

/**
 * Lista todos os engines registrados
 */
export function listEngines(): EngineRegistration[] {
  return Array.from(state.engines.values());
}

/**
 * Lista engines por categoria
 */
export function listEnginesByCategory(category: EngineCategory): EngineRegistration[] {
  return Array.from(state.engines.values()).filter(e => e.category === category);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SISTEMA DE PERMISSÕES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Solicita permissão para emitir um evento
 * Esta é a forma CORRETA de um engine emitir eventos
 */
export async function requestEmitPermission(
  request: EmitPermissionRequest
): Promise<PermissionResponse> {
  state.stats.totalRequests++;

  const engine = state.engines.get(request.engineId);
  if (!engine) {
    state.stats.denied++;
    return {
      granted: false,
      reason: 'engine_not_registered',
    };
  }

  engine.stats.permissionsRequested++;
  engine.lastActivity = Date.now();

  // Verificar cache
  const cacheKey = `${request.engineId}:${request.eventType}`;
  const cached = state.permissionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    state.stats.cached++;
    return { granted: cached.granted };
  }

  // Verificar bypass
  if (canBypass(engine, request.eventType)) {
    state.stats.granted++;
    engine.stats.permissionsGranted++;
    cachePermission(cacheKey, true);
    return { granted: true };
  }

  // Verificar se o engine tem permissão para este evento
  if (!engine.allowedEvents.includes(request.eventType) && engine.privilege !== 'system') {
    state.stats.denied++;
    engine.stats.permissionsDenied++;
    return {
      granted: false,
      reason: 'event_not_in_allowed_list',
    };
  }

  // Solicitar ao CentralNucleus
  const nucleusRequest: ActionRequest = {
    requestId: `emit_${request.engineId}_${Date.now()}`,
    source: 'engine',
    sourceName: engine.name,
    actionType: 'emit',
    payload: {
      eventType: request.eventType,
      eventPayload: request.payload,
    },
    priority: request.priority ?? 'normal',
    context: {
      engineId: request.engineId,
      category: engine.category,
      reason: request.reason,
    },
  };

  try {
    const response = await requestAction(nucleusRequest);

    if (response.approved) {
      state.stats.granted++;
      engine.stats.permissionsGranted++;
      cachePermission(cacheKey, true);
      return {
        granted: true,
        modifiedPayload: response.result,
      };
    } else {
      state.stats.denied++;
      engine.stats.permissionsDenied++;
      cachePermission(cacheKey, false);
      return {
        granted: false,
        reason: response.reason,
      };
    }
  } catch (error) {
    warn(`Error requesting permission for ${request.engineId}:`, error);
    state.stats.denied++;
    engine.stats.permissionsDenied++;
    return {
      granted: false,
      reason: 'nucleus_error',
    };
  }
}

/**
 * Solicita permissão para executar uma ação
 */
export async function requestActionPermission(
  engineId: string,
  action: string,
  payload?: unknown
): Promise<PermissionResponse> {
  state.stats.totalRequests++;

  const engine = state.engines.get(engineId);
  if (!engine) {
    state.stats.denied++;
    return {
      granted: false,
      reason: 'engine_not_registered',
    };
  }

  engine.stats.permissionsRequested++;
  engine.lastActivity = Date.now();

  // Engines de sistema podem executar ações livremente
  if (engine.privilege === 'system') {
    state.stats.granted++;
    engine.stats.permissionsGranted++;
    return { granted: true };
  }

  // Solicitar ao Nucleus
  const nucleusRequest: ActionRequest = {
    requestId: `action_${engineId}_${Date.now()}`,
    source: 'engine',
    sourceName: engine.name,
    actionType: 'execute',
    payload: {
      action,
      actionPayload: payload,
    },
    priority: 'normal',
    context: {
      engineId,
      category: engine.category,
    },
  };

  try {
    const response = await requestAction(nucleusRequest);

    if (response.approved) {
      state.stats.granted++;
      engine.stats.permissionsGranted++;
      engine.stats.actionsExecuted++;
      return { granted: true };
    } else {
      state.stats.denied++;
      engine.stats.permissionsDenied++;
      return {
        granted: false,
        reason: response.reason,
      };
    }
  } catch (error) {
    warn(`Error requesting action permission for ${engineId}:`, error);
    state.stats.denied++;
    engine.stats.permissionsDenied++;
    return {
      granted: false,
      reason: 'nucleus_error',
    };
  }
}

/**
 * Notifica que um engine emitiu um evento (após aprovação)
 */
export function recordEmission(engineId: string): void {
  const engine = state.engines.get(engineId);
  if (engine) {
    engine.stats.eventsEmitted++;
    engine.lastActivity = Date.now();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function canBypass(engine: EngineRegistration, eventType: EventType): boolean {
  // Eventos de sistema sempre passam
  if (state.config.bypassEvents.includes(eventType)) {
    return true;
  }

  // Engines confiáveis passam
  if (state.config.trustedEngines.includes(engine.id)) {
    return true;
  }

  // Engines de sistema passam
  if (engine.privilege === 'system') {
    return true;
  }

  // Engines com privilégio elevado passam para eventos permitidos
  if (engine.privilege === 'elevated' && engine.allowedEvents.includes(eventType)) {
    return true;
  }

  // Modo não-estrito permite mais liberdade
  if (!state.config.strictMode && engine.privilege !== 'restricted') {
    return true;
  }

  return false;
}

function cachePermission(key: string, granted: boolean): void {
  state.permissionCache.set(key, {
    granted,
    expiresAt: Date.now() + 30000, // 30 segundos de cache
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém estatísticas do sistema de governança
 */
export function getGovernanceStats() {
  const engineStats = Array.from(state.engines.values()).map(e => ({
    id: e.id,
    name: e.name,
    category: e.category,
    privilege: e.privilege,
    active: e.active,
    stats: e.stats,
  }));

  return {
    ...state.stats,
    enginesRegistered: state.engines.size,
    cacheSize: state.permissionCache.size,
    engines: engineStats,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

function log(message: string, data?: unknown): void {
  if (state.config.debug) {
    // eslint-disable-next-line no-console
    console.log(`[EngineGovernance] ${message}`, data ?? '');
  }
}

function warn(message: string, data?: unknown): void {
  // eslint-disable-next-line no-console
  console.warn(`[EngineGovernance] ${message}`, data ?? '');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const EngineGovernance = {
  init: initEngineGovernance,
  shutdown: shutdownEngineGovernance,

  // Registro
  register: registerEngine,
  unregister: unregisterEngine,
  get: getEngine,
  list: listEngines,
  listByCategory: listEnginesByCategory,

  // Permissões
  requestEmit: requestEmitPermission,
  requestAction: requestActionPermission,
  recordEmission,

  // Stats
  getStats: getGovernanceStats,
};

export default EngineGovernance;
