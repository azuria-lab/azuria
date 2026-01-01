/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EVENT BRIDGE - Ponte entre EventBus e ConsciousnessCore
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * O EventBridge conecta o EventBus existente ao ConsciousnessCore.
 * 
 * Responsabilidades:
 * - Interceptar eventos do EventBus
 * - Rotear para o ConsciousnessCore
 * - Distribuir outputs para listeners de UI
 * 
 * Esta é a camada de transição que permite migrar gradualmente
 * do sistema antigo para o novo.
 */

import { ConsciousnessCore, onOutput, sendEvent, type ProcessingResult } from './ConsciousnessCore';
import type { RawEvent } from './PerceptionGate';
import type { OutputMessage } from './types';
import { 
  shouldProcessEvent, 
  enrichEvent, 
  getEventPriority,
  getCognitiveCategory 
} from './events/EventMapping';
import { getGlobalState } from './GlobalState';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Listener para output formatado (UI) */
type UIOutputListener = (message: OutputMessage) => void;

/** Configuração do bridge */
interface EventBridgeConfig {
  /** Se deve interceptar todos os eventos automaticamente */
  autoIntercept: boolean;
  /** Eventos a ignorar (não rotear para o núcleo) */
  ignoreEvents: string[];
  /** Se deve logar eventos */
  logEvents: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

interface BridgeState {
  initialized: boolean;
  config: EventBridgeConfig;
  uiListeners: Set<UIOutputListener>;
  originalEmit: ((type: string, payload: unknown, options?: unknown) => void) | null;
  unsubscribeOutput: (() => void) | null;
  eventBuffer: RawEvent[];
  stats: {
    eventsBridged: number;
    eventsIgnored: number;
    outputsEmitted: number;
  };
}

const state: BridgeState = {
  initialized: false,
  config: {
    autoIntercept: true,
    ignoreEvents: [
      'heartbeat',
      'ping',
      'pong',
      'debug:log',
    ],
    logEvents: process.env.NODE_ENV === 'development',
  },
  uiListeners: new Set(),
  originalEmit: null,
  unsubscribeOutput: null,
  eventBuffer: [],
  stats: {
    eventsBridged: 0,
    eventsIgnored: 0,
    outputsEmitted: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES INTERNAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handler para outputs do ConsciousnessCore
 */
function handleCoreOutput(output: OutputMessage): void {
  state.stats.outputsEmitted++;
  
  if (state.config.logEvents) {
    // eslint-disable-next-line no-console
    console.log('[EventBridge] Output:', {
      type: output.type,
      title: output.title,
      channel: output.channel,
    });
  }
  
  // Notificar listeners de UI
  state.uiListeners.forEach(listener => {
    try {
      listener(output);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[EventBridge] UI listener error:', error);
    }
  });
}

/**
 * Converte evento do EventBus para RawEvent com enriquecimento
 */
function convertToRawEvent(
  type: string,
  payload: unknown,
  options?: { source?: string; priority?: number }
): RawEvent | null {
  // Verificar se deve processar
  if (!shouldProcessEvent(type)) {
    return null; // Não processar
  }
  
  // Converter payload para objeto
  const payloadObj = (payload && typeof payload === 'object' 
    ? payload 
    : { value: payload }) as Record<string, unknown>;
  
  // Enriquecer com contexto cognitivo
  const enrichedPayload = enrichEvent(type, payloadObj);
  
  // Obter prioridade do mapeamento (ou usar a fornecida)
  const mappedPriority = getEventPriority(type);
  const finalPriority = options?.priority ?? mappedPriority;
  
  // Obter categoria cognitiva
  const cognitiveCategory = getCognitiveCategory(type);
  
  return {
    type,
    payload: {
      ...enrichedPayload,
      // Adicionar metadados cognitivos
      _cognitiveCategory: cognitiveCategory,
      _enriched: true,
    },
    timestamp: Date.now(),
    source: options?.source || 'eventBus',
    priority: finalPriority,
    metadata: {
      cognitiveCategory,
      enriched: true,
    },
  };
}

/**
 * Processa evento através do bridge
 */
function bridgeEvent(
  type: string,
  payload: unknown,
  options?: { source?: string; priority?: number }
): void {
  // Verificar se deve ignorar (lista de ignorados tem prioridade)
  if (state.config.ignoreEvents.includes(type)) {
    state.stats.eventsIgnored++;
    return;
  }
  
  // Converter e enriquecer evento
  const rawEvent = convertToRawEvent(type, payload, options);
  
  // Se não deve processar (retornou null), ignorar
  if (!rawEvent) {
    state.stats.eventsIgnored++;
    return;
  }
  
  state.stats.eventsBridged++;
  
  if (state.config.logEvents) {
    const category = rawEvent.metadata?.cognitiveCategory || 'none';
    // eslint-disable-next-line no-console
    console.log(`[EventBridge] Bridging event: ${type} (${category}, priority: ${rawEvent.priority})`);
  }
  
  // Se o núcleo ainda não estiver pronto, bufferar
  if (!ConsciousnessCore.isInitialized()) {
    state.eventBuffer.push(rawEvent);
    return;
  }
  
  sendEvent(rawEvent);
}

/**
 * Processa eventos bufferizados
 */
function flushEventBuffer(): void {
  if (state.eventBuffer.length === 0) {
    return;
  }
  
  if (state.config.logEvents) {
    // eslint-disable-next-line no-console
    console.log(`[EventBridge] Flushing ${state.eventBuffer.length} buffered events`);
  }
  
  const buffer = [...state.eventBuffer];
  state.eventBuffer = [];
  
  buffer.forEach(event => sendEvent(event));
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o EventBridge
 * @param eventBus O módulo eventBus existente
 * @param config Configuração opcional
 */
export function initEventBridge(
  eventBus: {
    emit: (type: string, payload: unknown, options?: unknown) => void;
    on: (type: string, handler: (event: unknown) => void) => () => void;
  },
  config?: Partial<EventBridgeConfig>
): void {
  if (state.initialized) {
    // eslint-disable-next-line no-console
    console.warn('[EventBridge] Already initialized');
    return;
  }
  
  // Mesclar configuração
  if (config) {
    state.config = { ...state.config, ...config };
  }
  
  // Interceptar a função emit do eventBus
  if (state.config.autoIntercept && eventBus.emit) {
    state.originalEmit = eventBus.emit.bind(eventBus);
    
    // Substituir o emit para passar pelo bridge
    eventBus.emit = (type: string, payload: unknown, options?: unknown) => {
      // Primeiro, passar pelo bridge
      bridgeEvent(type, payload, options as { source?: string; priority?: number });
      
      // Depois, chamar o emit original para manter compatibilidade
      if (state.originalEmit) {
        state.originalEmit(type, payload, options);
      }
    };
  }
  
  // Registrar listener para outputs do ConsciousnessCore
  state.unsubscribeOutput = onOutput(handleCoreOutput);
  
  state.initialized = true;
  
  // eslint-disable-next-line no-console
  console.log('[EventBridge] Initialized', {
    autoIntercept: state.config.autoIntercept,
    ignoreEvents: state.config.ignoreEvents.length,
  });
  
  // Verificar se o núcleo está pronto e processar buffer
  if (ConsciousnessCore.isInitialized()) {
    flushEventBuffer();
  }
}

/**
 * Para o EventBridge e restaura o EventBus original
 */
export function stopEventBridge(
  eventBus: { emit: (type: string, payload: unknown, options?: unknown) => void }
): void {
  if (!state.initialized) {
    return;
  }
  
  // Restaurar emit original
  if (state.originalEmit) {
    eventBus.emit = state.originalEmit;
    state.originalEmit = null;
  }
  
  // Desregistrar listener
  if (state.unsubscribeOutput) {
    state.unsubscribeOutput();
    state.unsubscribeOutput = null;
  }
  
  // Limpar listeners de UI
  state.uiListeners.clear();
  
  // Limpar buffer
  state.eventBuffer = [];
  
  state.initialized = false;
  
  // eslint-disable-next-line no-console
  console.log('[EventBridge] Stopped');
}

/**
 * Envia um evento manualmente através do bridge
 * Use quando quiser bypass do eventBus mas passar pelo núcleo
 */
export function sendThroughBridge(
  type: string,
  payload: unknown,
  options?: { source?: string; priority?: number }
): void {
  bridgeEvent(type, payload, options);
}

/**
 * Adiciona um listener para outputs de UI
 * @returns Função para remover o listener
 */
export function onUIOutput(listener: UIOutputListener): () => void {
  state.uiListeners.add(listener);
  return () => state.uiListeners.delete(listener);
}

/**
 * Notifica o bridge que o núcleo está pronto
 * Processa eventos bufferizados
 */
export function notifyCoreReady(): void {
  flushEventBuffer();
}

/**
 * Adiciona eventos à lista de ignorados
 */
export function ignoreEventTypes(types: string[]): void {
  state.config.ignoreEvents.push(...types);
}

/**
 * Remove eventos da lista de ignorados
 */
export function unignoreEventTypes(types: string[]): void {
  state.config.ignoreEvents = state.config.ignoreEvents.filter(
    t => !types.includes(t)
  );
}

/**
 * Obtém estatísticas do bridge
 */
export function getBridgeStats(): typeof state.stats {
  return { ...state.stats };
}

/**
 * Verifica se o bridge está inicializado
 */
export function isBridgeInitialized(): boolean {
  return state.initialized;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const EventBridge = {
  init: initEventBridge,
  stop: stopEventBridge,
  send: sendThroughBridge,
  onOutput: onUIOutput,
  notifyCoreReady,
  ignoreEvents: ignoreEventTypes,
  unignoreEvents: unignoreEventTypes,
  getStats: getBridgeStats,
  isInitialized: isBridgeInitialized,
};

export default EventBridge;

