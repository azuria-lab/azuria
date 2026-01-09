/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EVENT BUS PROXY - Sistema Nervoso Controlado pelo Nucleus
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo atua como intermediário entre o EventBus e os engines.
 * TODOS os eventos passam pelo CentralNucleus antes de serem distribuídos.
 *
 * Fluxo:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Evento Emitido                                                         │
 * │       ↓                                                                 │
 * │  EventBusProxy.emit()                                                   │
 * │       ↓                                                                 │
 * │  CentralNucleus.send() ← Decisão centralizada                          │
 * │       ↓                                                                 │
 * │  ConsciousnessCore → PerceptionGate → DecisionEngine → OutputGate      │
 * │       ↓                                                                 │
 * │  Distribuição AUTORIZADA para engines registrados                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Regras:
 * 1. Engines NÃO devem usar eventBus.on() diretamente
 * 2. Use registerEngineListener() para registrar listeners controlados
 * 3. O Nucleus decide quais eventos são distribuídos e para quem
 *
 * @module azuria_ai/core/EventBusProxy
 */

import { type AzuriaEvent, eventBus, type EventHandler, type EventType } from './eventBus';
import { CentralNucleus, isInitialized as isNucleusInitialized } from '../consciousness/CentralNucleus';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Registro de listener de engine */
export interface EngineListenerRegistration {
  id: string;
  engineName: string;
  eventType: EventType;
  handler: EventHandler;
  /** Se o engine pode receber o evento sem aprovação do Nucleus */
  bypassNucleus?: boolean;
  /** Prioridade do listener (maior = primeiro) */
  priority?: number;
}

/** Configuração do proxy */
export interface ProxyConfig {
  /** Se deve logar eventos em modo debug */
  debug?: boolean;
  /** Eventos que sempre passam (não precisam de aprovação) */
  allowedBypassEvents?: EventType[];
  /** Se deve forçar todos os eventos pelo Nucleus */
  strictMode?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO DO PROXY
// ═══════════════════════════════════════════════════════════════════════════════

interface ProxyState {
  initialized: boolean;
  config: ProxyConfig;
  /** Listeners registrados pelos engines */
  engineListeners: Map<string, EngineListenerRegistration>;
  /** Listeners por tipo de evento */
  listenersByEvent: Map<EventType, Set<string>>;
  /** Subscription ID do eventBus original */
  busSubscriptions: Map<EventType, string>;
  /** Estatísticas */
  stats: {
    eventsReceived: number;
    eventsRouted: number;
    eventsBlocked: number;
    eventsBypassed: number;
  };
}

const proxyState: ProxyState = {
  initialized: false,
  config: {
    debug: false,
    allowedBypassEvents: [
      // Eventos de sistema que não precisam de aprovação
      'system:init',
      'system:shutdown',
      'system:tick',
    ],
    strictMode: false,
  },
  engineListeners: new Map(),
  listenersByEvent: new Map(),
  busSubscriptions: new Map(),
  stats: {
    eventsReceived: 0,
    eventsRouted: 0,
    eventsBlocked: 0,
    eventsBypassed: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o EventBusProxy
 */
export function initEventBusProxy(config?: Partial<ProxyConfig>): void {
  if (proxyState.initialized) {
    return;
  }

  if (config) {
    proxyState.config = { ...proxyState.config, ...config };
  }

  proxyState.initialized = true;
  log('EventBusProxy initialized');
}

/**
 * Desliga o EventBusProxy
 */
export function shutdownEventBusProxy(): void {
  if (!proxyState.initialized) {
    return;
  }

  // Remover todas as subscriptions do eventBus
  proxyState.busSubscriptions.forEach((subId) => {
    eventBus.off(subId);
  });
  proxyState.busSubscriptions.clear();

  // Limpar listeners
  proxyState.engineListeners.clear();
  proxyState.listenersByEvent.clear();

  proxyState.initialized = false;
  log('EventBusProxy shutdown');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA - PARA ENGINES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registra um listener de engine (forma CORRETA de escutar eventos)
 *
 * @param engineName - Nome do engine que está registrando
 * @param eventType - Tipo de evento a escutar
 * @param handler - Handler do evento
 * @param options - Opções adicionais
 * @returns ID do registro (para remover depois)
 */
export function registerEngineListener(
  engineName: string,
  eventType: EventType,
  handler: EventHandler,
  options?: {
    bypassNucleus?: boolean;
    priority?: number;
  }
): string {
  const id = `eng_${engineName}_${eventType}_${Date.now()}`;

  const registration: EngineListenerRegistration = {
    id,
    engineName,
    eventType,
    handler,
    bypassNucleus: options?.bypassNucleus ?? false,
    priority: options?.priority ?? 0,
  };

  proxyState.engineListeners.set(id, registration);

  // Adicionar ao índice por evento
  const eventListeners = proxyState.listenersByEvent.get(eventType) ?? new Set();
  eventListeners.add(id);
  proxyState.listenersByEvent.set(eventType, eventListeners);

  // Se ainda não temos subscription para este evento, criar
  if (!proxyState.busSubscriptions.has(eventType)) {
    const subId = eventBus.on(eventType, (event) => {
      handleIncomingEvent(event);
    });
    proxyState.busSubscriptions.set(eventType, subId);
  }

  log(`Engine '${engineName}' registered for '${eventType}'`);
  return id;
}

/**
 * Remove um listener de engine
 */
export function unregisterEngineListener(listenerId: string): boolean {
  const registration = proxyState.engineListeners.get(listenerId);
  if (!registration) {
    return false;
  }

  proxyState.engineListeners.delete(listenerId);

  // Remover do índice
  const eventListeners = proxyState.listenersByEvent.get(registration.eventType);
  if (eventListeners) {
    eventListeners.delete(listenerId);

    // Se não há mais listeners para este evento, remover subscription
    if (eventListeners.size === 0) {
      proxyState.listenersByEvent.delete(registration.eventType);
      const subId = proxyState.busSubscriptions.get(registration.eventType);
      if (subId) {
        eventBus.off(subId);
        proxyState.busSubscriptions.delete(registration.eventType);
      }
    }
  }

  log(`Unregistered listener '${listenerId}'`);
  return true;
}

/**
 * Emite um evento através do proxy (passa pelo Nucleus)
 *
 * @param tipo - Tipo do evento
 * @param payload - Payload do evento
 * @param source - Nome do engine/módulo que está emitindo
 */
export function emitThroughProxy(
  tipo: EventType,
  payload: unknown,
  source: string
): void {
  proxyState.stats.eventsReceived++;

  // Se Nucleus não está inicializado, usar eventBus diretamente (fallback)
  if (!isNucleusInitialized()) {
    warn('Nucleus not initialized, using direct eventBus');
    eventBus.emit(tipo, payload, { source });
    return;
  }

  // Enviar para o Nucleus processar
  CentralNucleus.send({
    type: tipo,
    payload: payload as Record<string, unknown>,
    timestamp: Date.now(),
    source,
    metadata: {
      viaProxy: true,
    },
  });
}

/**
 * Obtém estatísticas do proxy
 */
export function getProxyStats() {
  return {
    ...proxyState.stats,
    registeredListeners: proxyState.engineListeners.size,
    eventTypesListened: proxyState.listenersByEvent.size,
    byEventType: Object.fromEntries(
      Array.from(proxyState.listenersByEvent.entries()).map(([type, listeners]) => [
        type,
        listeners.size,
      ])
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROCESSAMENTO INTERNO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handler central para eventos recebidos
 */
function handleIncomingEvent(event: AzuriaEvent): void {
  proxyState.stats.eventsReceived++;

  const eventType = event.tipo;
  const listeners = proxyState.listenersByEvent.get(eventType);

  if (!listeners || listeners.size === 0) {
    return;
  }

  // Verificar se é um evento que pode bypass
  const canBypass =
    proxyState.config.allowedBypassEvents?.includes(eventType) ||
    event.metadata?.nucleusApproved === true;

  // Coletar handlers a executar
  const handlersToExecute: { registration: EngineListenerRegistration; bypass: boolean }[] = [];

  listeners.forEach((listenerId) => {
    const registration = proxyState.engineListeners.get(listenerId);
    if (!registration) {
      return;
    }

    // Determinar se este handler pode executar
    const shouldBypass = canBypass || registration.bypassNucleus;

    if (shouldBypass || !proxyState.config.strictMode) {
      handlersToExecute.push({ registration, bypass: shouldBypass });
    }
  });

  // Ordenar por prioridade
  handlersToExecute.sort((a, b) => (b.registration.priority ?? 0) - (a.registration.priority ?? 0));

  // Executar handlers
  handlersToExecute.forEach(({ registration, bypass }) => {
    try {
      if (bypass) {
        proxyState.stats.eventsBypassed++;
      } else {
        proxyState.stats.eventsRouted++;
      }

      const result = registration.handler(event);

      if (result instanceof Promise) {
        result.catch((error) => {
          warn(`Handler error in ${registration.engineName}:`, error);
        });
      }
    } catch (error) {
      warn(`Handler error in ${registration.engineName}:`, error);
    }
  });
}

/**
 * Distribui um evento aprovado pelo Nucleus para os listeners
 * Chamado pelo CentralNucleus após aprovar um evento
 */
export function distributeApprovedEvent(event: AzuriaEvent): void {
  // Marcar como aprovado
  const approvedEvent: AzuriaEvent = {
    ...event,
    metadata: {
      ...event.metadata,
      nucleusApproved: true,
    },
  };

  // Emitir no eventBus (os listeners do proxy vão capturar)
  eventBus.emit(approvedEvent.tipo, approvedEvent.payload, {
    source: approvedEvent.source,
    priority: approvedEvent.priority,
    metadata: approvedEvent.metadata,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

function log(message: string, data?: unknown): void {
  if (proxyState.config.debug) {
    // eslint-disable-next-line no-console
    console.log(`[EventBusProxy] ${message}`, data ?? '');
  }
}

function warn(message: string, data?: unknown): void {
  // eslint-disable-next-line no-console
  console.warn(`[EventBusProxy] ${message}`, data ?? '');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const EventBusProxy = {
  init: initEventBusProxy,
  shutdown: shutdownEventBusProxy,
  register: registerEngineListener,
  unregister: unregisterEngineListener,
  emit: emitThroughProxy,
  distribute: distributeApprovedEvent,
  getStats: getProxyStats,
};

export default EventBusProxy;
