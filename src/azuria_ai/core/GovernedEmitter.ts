/**
 * ══════════════════════════════════════════════════════════════════════════════
 * GOVERNED EMITTER - Camada de Compatibilidade para emitEvent
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo fornece uma versão governada do emitEvent que:
 * 1. Roteia eventos através do CentralNucleus
 * 2. Aplica governança e filtros de nível (ADMIN/USER)
 * 3. Mantém compatibilidade com código legado
 *
 * @usage Em vez de usar emitEvent diretamente, importe deste módulo:
 * ```typescript
 * import { governedEmit } from '@/azuria_ai/core/GovernedEmitter';
 *
 * governedEmit('ai:pattern-detected', { patterns: [...] }, { source: 'myEngine' });
 * ```
 *
 * @module azuria_ai/core/GovernedEmitter
 */

import { emitEvent as directEmitEvent, type EventType } from './eventBus';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Opções de emissão governada */
export interface GovernedEmitOptions {
  source?: string;
  priority?: number;
  /** Pular governança (apenas para sistema) */
  bypassGovernance?: boolean;
  /** Razão para bypass */
  bypassReason?: string;
}

/** Resultado da emissão governada */
export interface GovernedEmitResult {
  emitted: boolean;
  blocked: boolean;
  reason?: string;
  modified?: boolean;
}

/** Estatísticas de emissão */
interface EmissionStats {
  total: number;
  blocked: number;
  bypassedByGovernance: number;
  bypassedByLevel: number;
  bySource: Map<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO INTERNO
// ═══════════════════════════════════════════════════════════════════════════════

let isEnabled = false;
let nucleusModule: typeof import('../consciousness/CentralNucleus') | null = null;
let governanceModule: typeof import('../governance/EngineGovernance') | null = null;
let levelsModule: typeof import('../levels/ConsciousnessLevels') | null = null;

const stats: EmissionStats = {
  total: 0,
  blocked: 0,
  bypassedByGovernance: 0,
  bypassedByLevel: 0,
  bySource: new Map(),
};

// Engines conhecidos (para auto-descoberta)
const knownEngines = new Set<string>();

// Lista de engines de sistema que podem fazer bypass
const SYSTEM_ENGINES = new Set([
  'CentralNucleus',
  'ConsciousnessCore',
  'EventBusProxy',
  'EngineGovernance',
  'UnifiedStateStore',
  'ConsciousnessLevels',
  'UnifiedMemory',
]);

// Eventos de sistema que não precisam de governança
const SYSTEM_EVENTS = new Set<EventType>([
  'system:init' as EventType,
  'system:shutdown' as EventType,
  'system:error' as EventType,
  'system:heartbeat' as EventType,
]);

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o GovernedEmitter
 * Deve ser chamado após o CentralNucleus estar inicializado
 */
export async function initGovernedEmitter(): Promise<void> {
  if (isEnabled) {return;}

  try {
    // Carregar módulos necessários
    nucleusModule = await import('../consciousness/CentralNucleus');
    governanceModule = await import('../governance/EngineGovernance');
    levelsModule = await import('../levels/ConsciousnessLevels');

    isEnabled = true;
    // eslint-disable-next-line no-console
    console.log('[GovernedEmitter] ✓ Initialized');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[GovernedEmitter] Modules not available, running in direct mode:', error);
    isEnabled = false;
  }
}

/**
 * Desliga o GovernedEmitter
 */
export function shutdownGovernedEmitter(): void {
  isEnabled = false;
  nucleusModule = null;
  governanceModule = null;
  levelsModule = null;
  stats.total = 0;
  stats.blocked = 0;
  stats.bypassedByGovernance = 0;
  stats.bypassedByLevel = 0;
  stats.bySource.clear();
  knownEngines.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE VERIFICAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se o engine tem permissão para emitir o evento
 */
function checkGovernancePermission(
  source: string,
  eventType: EventType
): { allowed: boolean; reason?: string } {
  if (!governanceModule) {
    return { allowed: true };
  }

  // Sistema sempre pode emitir
  if (SYSTEM_ENGINES.has(source)) {
    return { allowed: true };
  }

  // Eventos de sistema não precisam de governança
  if (SYSTEM_EVENTS.has(eventType)) {
    return { allowed: true };
  }

  // Verificar se engine está registrado
  const engine = governanceModule.getEngine(source);
  if (!engine) {
    // Auto-registrar engine desconhecido com permissões mínimas
    registerUnknownEngine(source);
    return { allowed: true, reason: 'auto_registered' };
  }

  // Verificar se evento está na lista de permitidos
  if (engine.allowedEvents && !engine.allowedEvents.includes(eventType)) {
    return {
      allowed: false,
      reason: `event_not_allowed_for_${source}`,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se o nível atual permite receber o evento
 */
function checkLevelPermission(eventType: EventType): { allowed: boolean; reason?: string } {
  if (!levelsModule) {
    return { allowed: true };
  }

  const currentLevel = levelsModule.getCurrentLevel();
  if (!currentLevel) {
    return { allowed: true };
  }

  const canReceive = levelsModule.canReceiveEvent(currentLevel.id, eventType);
  if (!canReceive) {
    return {
      allowed: false,
      reason: `event_filtered_for_level_${currentLevel.id}`,
    };
  }

  return { allowed: true };
}

/**
 * Registra um engine desconhecido com permissões básicas
 */
function registerUnknownEngine(engineId: string): void {
  if (knownEngines.has(engineId)) {return;}

  knownEngines.add(engineId);

  if (governanceModule) {
    try {
      governanceModule.registerEngine(engineId, {
        name: engineId,
        category: 'other',
        privilege: 'standard',
        // Permitir eventos comuns
        allowedEvents: [
          'ai:insight',
          'ai:suggestion',
          'ai:pattern-detected',
          'ai:memory-updated',
          'user:action',
          'calc:result',
        ] as EventType[],
      });
    } catch {
      // Engine já registrado
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL DE EMISSÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Emite um evento através do sistema governado
 *
 * @param eventType - Tipo do evento
 * @param payload - Dados do evento
 * @param options - Opções de emissão
 * @returns Resultado da emissão
 */
export function governedEmit(
  eventType: EventType,
  payload: unknown,
  options: GovernedEmitOptions = {}
): GovernedEmitResult {
  const source = options.source ?? 'unknown';

  // Atualizar estatísticas
  stats.total++;
  stats.bySource.set(source, (stats.bySource.get(source) ?? 0) + 1);

  // Se não está habilitado, emitir diretamente
  if (!isEnabled) {
    directEmitEvent(eventType, payload, {
      source,
      priority: options.priority,
    });
    return { emitted: true, blocked: false };
  }

  // Verificar bypass
  if (options.bypassGovernance && SYSTEM_ENGINES.has(source)) {
    stats.bypassedByGovernance++;
    directEmitEvent(eventType, payload, {
      source,
      priority: options.priority,
    });
    return { emitted: true, blocked: false, reason: 'bypassed' };
  }

  // Verificar permissão de governança
  const govCheck = checkGovernancePermission(source, eventType);
  if (!govCheck.allowed) {
    stats.blocked++;
    return {
      emitted: false,
      blocked: true,
      reason: govCheck.reason,
    };
  }

  // Verificar permissão de nível
  const levelCheck = checkLevelPermission(eventType);
  if (!levelCheck.allowed) {
    stats.bypassedByLevel++;
    // Não bloqueia, mas registra que foi filtrado
  }

  // Emitir através do Nucleus se disponível
  if (nucleusModule?.isNucleusInitialized()) {
    nucleusModule.CentralNucleus.send({
      type: eventType,
      payload,
      meta: {
        source,
        priority: options.priority,
        timestamp: Date.now(),
      },
    });
  } else {
    // Fallback para emissão direta
    directEmitEvent(eventType, payload, {
      source,
      priority: options.priority,
    });
  }

  // Registrar emissão na governança
  if (governanceModule && !SYSTEM_ENGINES.has(source)) {
    governanceModule.recordEmission(source);
  }

  return {
    emitted: true,
    blocked: false,
    modified: govCheck.reason === 'auto_registered',
  };
}

/**
 * Versão assíncrona do governedEmit com confirmação
 */
export async function governedEmitAsync(
  eventType: EventType,
  payload: unknown,
  options: GovernedEmitOptions = {}
): Promise<GovernedEmitResult> {
  const source = options.source ?? 'unknown';

  // Se não está habilitado, emitir diretamente
  if (!isEnabled || !governanceModule) {
    directEmitEvent(eventType, payload, {
      source,
      priority: options.priority,
    });
    return { emitted: true, blocked: false };
  }

  // Converter prioridade numérica para string
  const getPriorityString = (p?: number): 'critical' | 'high' | 'low' | 'normal' => {
    if (p === 10) {return 'critical';}
    if (p && p >= 7) {return 'high';}
    if (p && p <= 2) {return 'low';}
    return 'normal';
  };

  // Solicitar permissão assíncrona
  const permission = await governanceModule.requestEmitPermission({
    engineId: source,
    eventType,
    payload,
    priority: getPriorityString(options.priority),
  });

  if (!permission.granted) {
    stats.blocked++;
    return {
      emitted: false,
      blocked: true,
      reason: permission.reason,
    };
  }

  // Emitir com payload possivelmente modificado
  const finalPayload = permission.modifiedPayload ?? payload;

  // Aguardar delay se necessário
  if (permission.delayMs && permission.delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, permission.delayMs));
  }

  return governedEmit(eventType, finalPayload, options);
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRAPPER DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Drop-in replacement para emitEvent que usa governança
 *
 * @example
 * ```typescript
 * // Em vez de:
 * import { emitEvent } from './eventBus';
 *
 * // Use:
 * import { emitEventGoverned as emitEvent } from './GovernedEmitter';
 * ```
 */
export function emitEventGoverned(
  eventType: EventType,
  payload: unknown,
  options?: { source?: string; priority?: number }
): void {
  governedEmit(eventType, payload, options);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTATÍSTICAS E DEBUG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Retorna estatísticas de emissão
 */
export function getEmissionStats(): {
  total: number;
  blocked: number;
  bypassedByGovernance: number;
  bypassedByLevel: number;
  bySource: Record<string, number>;
  isEnabled: boolean;
} {
  return {
    total: stats.total,
    blocked: stats.blocked,
    bypassedByGovernance: stats.bypassedByGovernance,
    bypassedByLevel: stats.bypassedByLevel,
    bySource: Object.fromEntries(stats.bySource),
    isEnabled,
  };
}

/**
 * Retorna lista de engines conhecidos
 */
export function getKnownEngines(): string[] {
  return Array.from(knownEngines);
}

/**
 * Verifica se o emitter está habilitado
 */
export function isGovernedEmitterEnabled(): boolean {
  return isEnabled;
}

/**
 * Lista engines que usam emitEvent diretamente (para migração)
 */
export function getEnginesMigrationStatus(): {
  total: number;
  usingGovernedEmit: number;
  usingDirectEmit: number;
  engines: Array<{ id: string; emissions: number; governed: boolean }>;
} {
  const engines: Array<{ id: string; emissions: number; governed: boolean }> = [];
  let usingGovernedEmit = 0;
  let usingDirectEmit = 0;

  stats.bySource.forEach((emissions, engineId) => {
    const isGoverned = knownEngines.has(engineId);
    engines.push({ id: engineId, emissions, governed: isGoverned });
    if (isGoverned) {
      usingGovernedEmit++;
    } else {
      usingDirectEmit++;
    }
  });

  return {
    total: engines.length,
    usingGovernedEmit,
    usingDirectEmit,
    engines: engines.sort((a, b) => b.emissions - a.emissions),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  init: initGovernedEmitter,
  shutdown: shutdownGovernedEmitter,
  emit: governedEmit,
  emitAsync: governedEmitAsync,
  getStats: getEmissionStats,
  isEnabled: isGovernedEmitterEnabled,
};
