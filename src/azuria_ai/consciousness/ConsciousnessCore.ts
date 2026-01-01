/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CONSCIOUSNESS CORE - O Núcleo Central do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este é o ÚNICO cérebro pensante do sistema Azuria. Todas as decisões cognitivas
 * passam por aqui. Nenhum engine ou agente pode emitir diretamente para a UI
 * sem passar pelo ConsciousnessCore.
 * 
 * Fluxo:
 * Evento → PerceptionGate → DecisionEngine → OutputGate → UI/Silêncio
 * 
 * Responsabilidades:
 * - Receber TODOS os eventos do sistema
 * - Filtrar ruído e classificar relevância
 * - Consultar estado global para contexto
 * - Convocar engines quando necessário
 * - Arbitrar conflitos
 * - Decidir entre emitir, silenciar, delegar ou escalar
 * - Manter consciência do que foi dito
 */

import type {
  NormalizedEvent,
  ConsciousnessConfig,
  CognitiveRole,
  SubscriptionTier,
  OutputMessage,
  DecisionType,
  DEFAULT_CONSCIOUSNESS_CONFIG,
} from './types';
import { 
  GlobalState, 
  getGlobalState, 
  initializeState, 
  resetGlobalState,
  updateUserActivity,
  updateCurrentScreen,
  requestSilence,
  removeSilence,
  incrementSessionMetric,
  cleanupExpiredData,
  subscribeToState,
} from './GlobalState';
import { PerceptionGate, perceive, quickFilter, type RawEvent } from './PerceptionGate';
import { DecisionEngine, decide, createDecisionContext, type Decision } from './DecisionEngine';
import { OutputGate, processOutput, recordMessageFeedback, type OutputDecision } from './OutputGate';
import { CommunicationMemory } from './CommunicationMemory';
import { initFeedbackLearning } from './learning/FeedbackLearning';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Resultado do processamento de um evento */
export interface ProcessingResult {
  /** Se foi processado */
  processed: boolean;
  /** Tipo de decisão */
  decision?: DecisionType;
  /** Mensagem emitida (se houver) */
  output?: OutputMessage;
  /** Razão (se não processado ou silenciado) */
  reason?: string;
}

/** Listener para outputs */
type OutputListener = (output: OutputMessage) => void;

/** Listener para decisões */
type DecisionListener = (event: NormalizedEvent, decision: Decision) => void;

/** Configuração de inicialização */
export interface InitConfig {
  userId?: string;
  role?: CognitiveRole;
  tier?: SubscriptionTier;
  config?: Partial<ConsciousnessConfig>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO DO CORE
// ═══════════════════════════════════════════════════════════════════════════════

interface CoreState {
  initialized: boolean;
  config: ConsciousnessConfig;
  outputListeners: Set<OutputListener>;
  decisionListeners: Set<DecisionListener>;
  processingQueue: RawEvent[];
  isProcessing: boolean;
  cleanupInterval: ReturnType<typeof setInterval> | null;
  stats: {
    eventsReceived: number;
    eventsProcessed: number;
    eventsFiltered: number;
    decisionsEmit: number;
    decisionsSilence: number;
    decisionsDelegate: number;
    decisionsEscalate: number;
  };
}

const coreState: CoreState = {
  initialized: false,
  config: {
    enabled: true,
    debug: false,
    rateLimit: {
      maxUserInsightsPerMinute: 3,
      maxAdminInsightsPerMinute: 10,
      dismissCooldown: 30000,
    },
    silence: {
      defaultTopicBlockDuration: 300000,
      typingSilenceDuration: 5000,
      errorSilenceDuration: 10000,
    },
    memory: {
      maxMessageHistory: 100,
      recentMessageWindow: 300000,
      semanticHashTTL: 600000,
    },
    ai: {
      useAI: true,
      preferredModel: 'gemini',
      aiTimeout: 10000,
    },
  },
  outputListeners: new Set(),
  decisionListeners: new Set(),
  processingQueue: [],
  isProcessing: false,
  cleanupInterval: null,
  stats: {
    eventsReceived: 0,
    eventsProcessed: 0,
    eventsFiltered: 0,
    decisionsEmit: 0,
    decisionsSilence: 0,
    decisionsDelegate: 0,
    decisionsEscalate: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROCESSAMENTO DE EVENTOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Processa um evento através do pipeline completo
 */
async function processEvent(rawEvent: RawEvent): Promise<ProcessingResult> {
  coreState.stats.eventsReceived++;
  
  // 1. Filtro rápido
  if (!quickFilter(rawEvent.type)) {
    coreState.stats.eventsFiltered++;
    return {
      processed: false,
      reason: 'filtered_by_quick_filter',
    };
  }
  
  // 2. Percepção - normalizar e classificar
  const perception = perceive(rawEvent);
  
  if (!perception.shouldProcess || !perception.normalizedEvent) {
    coreState.stats.eventsFiltered++;
    return {
      processed: false,
      reason: perception.rejectionReason || 'perception_rejected',
    };
  }
  
  coreState.stats.eventsProcessed++;
  
  // 3. Criar contexto de decisão
  const context = createDecisionContext(
    perception.normalizedEvent,
    perception.relevanceScore
  );
  
  // 4. Tomar decisão
  const decision = decide(context);
  
  // 5. Notificar listeners de decisão
  notifyDecisionListeners(perception.normalizedEvent, decision);
  
  // 6. Executar decisão
  return await executeDecision(decision, perception.normalizedEvent);
}

/**
 * Executa uma decisão
 */
async function executeDecision(
  decision: Decision,
  event: NormalizedEvent
): Promise<ProcessingResult> {
  switch (decision.type) {
    case 'emit':
      return executeEmit(decision, event);
    
    case 'silence':
      coreState.stats.decisionsSilence++;
      return {
        processed: true,
        decision: 'silence',
        reason: decision.reason,
      };
    
    case 'schedule':
      return executeSchedule(decision, event);
    
    case 'escalate':
      coreState.stats.decisionsEscalate++;
      // Para escalação, ainda emitimos mas com prioridade alta
      if (decision.payload?.output) {
        decision.payload.output.severity = 'critical';
      }
      return executeEmit(decision, event);
    
    case 'delegate':
      coreState.stats.decisionsDelegate++;
      return executeDelegate(decision, event);
    
    default:
      return {
        processed: true,
        decision: decision.type,
        reason: decision.reason,
      };
  }
}

/**
 * Executa emissão de mensagem
 */
function executeEmit(
  decision: Decision,
  event: NormalizedEvent
): ProcessingResult {
  if (!decision.payload?.output) {
    return {
      processed: true,
      decision: 'emit',
      reason: 'no_output_payload',
    };
  }
  
  // Passar pelo OutputGate
  const outputDecision = processOutput(decision.payload.output);
  
  if (!outputDecision.shouldEmit || !outputDecision.formattedMessage) {
    coreState.stats.decisionsSilence++;
    return {
      processed: true,
      decision: 'silence',
      reason: outputDecision.silenceReason || 'output_gate_blocked',
    };
  }
  
  coreState.stats.decisionsEmit++;
  
  // Notificar listeners de output
  notifyOutputListeners(outputDecision.formattedMessage);
  
  return {
    processed: true,
    decision: 'emit',
    output: outputDecision.formattedMessage,
  };
}

/**
 * Executa agendamento
 */
function executeSchedule(
  decision: Decision,
  event: NormalizedEvent
): ProcessingResult {
  const scheduleAt = decision.payload?.scheduleAt || Date.now() + 30000;
  const delay = scheduleAt - Date.now();
  
  if (delay > 0) {
    setTimeout(() => {
      // Re-processar o evento
      processEvent({
        type: event.type,
        payload: event.payload,
        timestamp: Date.now(),
        source: event.source,
        metadata: { rescheduled: true },
      });
    }, delay);
  }
  
  return {
    processed: true,
    decision: 'schedule',
    reason: `Scheduled for ${delay}ms later`,
  };
}

/**
 * Executa delegação para agente
 */
async function executeDelegate(
  decision: Decision,
  event: NormalizedEvent
): Promise<ProcessingResult> {
  // Por enquanto, apenas log - agentes serão integrados na fase 6
  if (coreState.config.debug) {
    // eslint-disable-next-line no-console
    console.log('[ConsciousnessCore] Delegate to agent:', decision.payload?.agentRequest);
  }
  
  return {
    processed: true,
    decision: 'delegate',
    reason: `Delegated to ${decision.payload?.agentRequest?.agent || 'unknown agent'}`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICAÇÃO DE LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

function notifyOutputListeners(output: OutputMessage): void {
  coreState.outputListeners.forEach(listener => {
    try {
      listener(output);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ConsciousnessCore] Output listener error:', error);
    }
  });
}

function notifyDecisionListeners(event: NormalizedEvent, decision: Decision): void {
  coreState.decisionListeners.forEach(listener => {
    try {
      listener(event, decision);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ConsciousnessCore] Decision listener error:', error);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILA DE PROCESSAMENTO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Processa a fila de eventos
 */
async function processQueue(): Promise<void> {
  if (coreState.isProcessing || coreState.processingQueue.length === 0) {
    return;
  }
  
  coreState.isProcessing = true;
  
  while (coreState.processingQueue.length > 0) {
    const event = coreState.processingQueue.shift();
    if (event) {
      await processEvent(event);
    }
  }
  
  coreState.isProcessing = false;
}

/**
 * Adiciona evento à fila
 */
function enqueueEvent(event: RawEvent): void {
  coreState.processingQueue.push(event);
  
  // Processar assincronamente
  setTimeout(processQueue, 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o ConsciousnessCore
 */
export async function initConsciousness(config?: InitConfig): Promise<void> {
  if (coreState.initialized) {
    // eslint-disable-next-line no-console
    console.warn('[ConsciousnessCore] Already initialized');
    return;
  }
  
  // Inicializar estado global
  initializeState(
    config?.userId || null,
    config?.role || 'USER',
    config?.tier || 'FREE'
  );
  
  // Mesclar configuração
  if (config?.config) {
    coreState.config = {
      ...coreState.config,
      ...config.config,
    };
  }
  
  // Inicializar FeedbackLearning
  initFeedbackLearning();
  
  // Iniciar cleanup periódico
  coreState.cleanupInterval = setInterval(() => {
    cleanupExpiredData();
    CommunicationMemory.cleanup();
  }, 60000); // A cada minuto
  
  coreState.initialized = true;
  
  // eslint-disable-next-line no-console
  console.log('[ConsciousnessCore] Initialized', {
    userId: config?.userId,
    role: config?.role,
  });
}

/**
 * Desliga o ConsciousnessCore
 */
export function shutdownConsciousness(): void {
  if (!coreState.initialized) {
    return;
  }
  
  // Limpar intervalo de cleanup
  if (coreState.cleanupInterval) {
    clearInterval(coreState.cleanupInterval);
    coreState.cleanupInterval = null;
  }
  
  // Limpar listeners
  coreState.outputListeners.clear();
  coreState.decisionListeners.clear();
  
  // Limpar fila
  coreState.processingQueue = [];
  
  // Resetar estado global
  resetGlobalState();
  
  coreState.initialized = false;
  
  // eslint-disable-next-line no-console
  console.log('[ConsciousnessCore] Shutdown complete');
}

/**
 * Envia um evento para o Núcleo processar
 * Esta é a ÚNICA forma de enviar eventos para o sistema
 */
export function sendEvent(event: RawEvent): void {
  if (!coreState.initialized) {
    // eslint-disable-next-line no-console
    console.warn('[ConsciousnessCore] Not initialized, event dropped:', event.type);
    return;
  }
  
  if (!coreState.config.enabled) {
    return;
  }
  
  enqueueEvent(event);
}

/**
 * Processa um evento de forma síncrona e retorna o resultado
 * Use apenas quando precisar do resultado imediatamente
 */
export async function processEventSync(event: RawEvent): Promise<ProcessingResult> {
  if (!coreState.initialized) {
    return {
      processed: false,
      reason: 'core_not_initialized',
    };
  }
  
  return await processEvent(event);
}

/**
 * Adiciona um listener para outputs emitidos
 */
export function onOutput(listener: OutputListener): () => void {
  coreState.outputListeners.add(listener);
  return () => coreState.outputListeners.delete(listener);
}

/**
 * Adiciona um listener para decisões tomadas
 */
export function onDecision(listener: DecisionListener): () => void {
  coreState.decisionListeners.add(listener);
  return () => coreState.decisionListeners.delete(listener);
}

/**
 * Registra feedback sobre uma mensagem
 */
export function provideFeedback(
  semanticHash: string,
  topic: string,
  outcome: 'accepted' | 'dismissed' | 'ignored'
): void {
  recordMessageFeedback(semanticHash, topic, outcome);
}

/**
 * Solicita silêncio por um período
 */
export function requestSilenceMode(durationMs: number = 300000): void {
  requestSilence(durationMs);
}

/**
 * Remove modo silêncio
 */
export function disableSilenceMode(): void {
  removeSilence();
}

/**
 * Atualiza o contexto do usuário
 */
export function updateContext(updates: {
  screen?: string;
  activity?: string;
}): void {
  if (updates.screen) {
    updateCurrentScreen(updates.screen);
  }
  if (updates.activity) {
    updateUserActivity(updates.activity as Parameters<typeof updateUserActivity>[0]);
  }
}

/**
 * Obtém estatísticas do Core
 */
export function getStats(): typeof coreState.stats {
  return { ...coreState.stats };
}

/**
 * Obtém o estado global (somente leitura)
 */
export function getState() {
  return getGlobalState();
}

/**
 * Verifica se o Core está inicializado
 */
export function isInitialized(): boolean {
  return coreState.initialized;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DO SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

export const ConsciousnessCore = {
  // Lifecycle
  init: initConsciousness,
  shutdown: shutdownConsciousness,
  isInitialized,
  
  // Event processing
  send: sendEvent,
  process: processEventSync,
  
  // Listeners
  onOutput,
  onDecision,
  
  // Feedback
  provideFeedback,
  
  // Silence control
  requestSilence: requestSilenceMode,
  disableSilence: disableSilenceMode,
  
  // Context
  updateContext,
  
  // State
  getStats,
  getState,
};

export default ConsciousnessCore;

