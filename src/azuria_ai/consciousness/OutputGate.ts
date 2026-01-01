/**
 * ══════════════════════════════════════════════════════════════════════════════
 * OUTPUT GATE - Controle de Saída
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * O OutputGate é a última camada antes de uma mensagem ser enviada para a UI.
 * Responsabilidades:
 * - Verificar duplicação (via CommunicationMemory)
 * - Aplicar rate limiting
 * - Respeitar silêncio solicitado
 * - Formatar mensagens para UI
 * - Decidir entre emitir ou silenciar
 */

import type {
  MessageType,
  MessageSeverity,
  OutputChannel,
  OutputMessage,
  MessageAction,
  SilenceReason,
  CognitiveRole,
} from './types';
import {
  getGlobalState,
  isSilenced,
  isAdmin,
  getCurrentActivity,
  incrementSessionMetric,
} from './GlobalState';
import {
  CommunicationMemory,
  generateSemanticHash,
  checkDuplication,
  rememberMessage,
} from './CommunicationMemory';
import {
  shouldAvoidTopic,
  getRelevanceAdjustment,
  getIdealFrequency,
  recordFeedback as recordLearningFeedback,
} from './learning/FeedbackLearning';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Requisição de saída */
export interface OutputRequest {
  /** Tipo da mensagem */
  type: MessageType;
  /** Severidade */
  severity: MessageSeverity;
  /** Título */
  title: string;
  /** Mensagem completa */
  message: string;
  /** Canal de destino */
  channel: OutputChannel;
  /** Tópico da mensagem */
  topic: string;
  /** Ações disponíveis */
  actions?: MessageAction[];
  /** Contexto */
  context: {
    screen: string;
    eventId: string;
  };
  /** Se pode ser dispensada */
  dismissable?: boolean;
  /** TTL customizado (ms) */
  ttl?: number;
  /** Forçar emissão (bypass checks) */
  force?: boolean;
}

/** Decisão de saída */
export interface OutputDecision {
  /** Se deve emitir */
  shouldEmit: boolean;
  /** Razão se não deve emitir */
  silenceReason?: SilenceReason;
  /** Mensagem formatada (se deve emitir) */
  formattedMessage?: OutputMessage;
  /** Tempo sugerido de espera (se não deve emitir) */
  suggestedWaitTime?: number;
}

/** Estatísticas do OutputGate */
export interface OutputStats {
  /** Total de requisições */
  totalRequests: number;
  /** Total de emissões */
  totalEmitted: number;
  /** Total de silenciados */
  totalSilenced: number;
  /** Por razão de silêncio */
  silenceReasons: Record<SilenceReason, number>;
  /** Por canal */
  byChannel: Record<OutputChannel, number>;
  /** Taxa de emissão */
  emissionRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

interface OutputGateConfig {
  /** Máximo de mensagens por minuto para USER */
  maxUserMessagesPerMinute: number;
  /** Máximo de mensagens por minuto para ADMIN */
  maxAdminMessagesPerMinute: number;
  /** TTL padrão para mensagens (ms) */
  defaultTTL: number;
  /** Se deve respeitar silêncio durante atividades */
  respectActivitySilence: boolean;
  /** Atividades que devem silenciar mensagens não-críticas */
  silentActivities: string[];
}

const DEFAULT_CONFIG: OutputGateConfig = {
  maxUserMessagesPerMinute: 3,
  maxAdminMessagesPerMinute: 10,
  defaultTTL: 30000, // 30 segundos
  respectActivitySilence: true,
  silentActivities: ['calculando', 'preenchendo'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO INTERNO
// ═══════════════════════════════════════════════════════════════════════════════

interface OutputGateState {
  config: OutputGateConfig;
  stats: OutputStats;
  recentEmissions: Array<{ timestamp: number; channel: OutputChannel }>;
}

const state: OutputGateState = {
  config: { ...DEFAULT_CONFIG },
  stats: {
    totalRequests: 0,
    totalEmitted: 0,
    totalSilenced: 0,
    silenceReasons: {
      already_said: 0,
      topic_blocked: 0,
      user_busy: 0,
      rate_limited: 0,
      low_relevance: 0,
      silence_requested: 0,
      context_changed: 0,
    },
    byChannel: {
      ADMIN: 0,
      USER: 0,
      SYSTEM: 0,
      SILENT: 0,
    },
    emissionRate: 1.0,
  },
  recentEmissions: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gera ID único para mensagem
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Limpa emissões antigas
 */
function cleanupOldEmissions(): void {
  const oneMinuteAgo = Date.now() - 60000;
  state.recentEmissions = state.recentEmissions.filter(
    e => e.timestamp > oneMinuteAgo
  );
}

/**
 * Conta emissões recentes por canal
 */
function countRecentEmissions(channel: OutputChannel): number {
  cleanupOldEmissions();
  return state.recentEmissions.filter(e => e.channel === channel).length;
}

/**
 * Verifica rate limit
 */
function checkRateLimit(channel: OutputChannel): { allowed: boolean; waitTime?: number } {
  const config = state.config;
  const maxPerMinute = channel === 'ADMIN' 
    ? config.maxAdminMessagesPerMinute 
    : config.maxUserMessagesPerMinute;
  
  const recentCount = countRecentEmissions(channel);
  
  if (recentCount >= maxPerMinute) {
    // Calcular tempo de espera
    const oldestRecent = state.recentEmissions
      .filter(e => e.channel === channel)
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    
    const waitTime = oldestRecent 
      ? 60000 - (Date.now() - oldestRecent.timestamp) 
      : 30000;
    
    return { allowed: false, waitTime: Math.max(0, waitTime) };
  }
  
  return { allowed: true };
}

/**
 * Verifica se atividade atual deve silenciar mensagens
 */
function shouldSilenceForActivity(severity: MessageSeverity): boolean {
  if (!state.config.respectActivitySilence) {
    return false;
  }
  
  // Mensagens críticas nunca são silenciadas
  if (severity === 'critical') {
    return false;
  }
  
  const activity = getCurrentActivity();
  return state.config.silentActivities.includes(activity);
}

/**
 * Registra uma emissão
 */
function recordEmission(channel: OutputChannel): void {
  state.recentEmissions.push({
    timestamp: Date.now(),
    channel,
  });
  
  state.stats.totalEmitted++;
  state.stats.byChannel[channel]++;
  
  // Atualizar taxa de emissão
  state.stats.emissionRate = state.stats.totalEmitted / state.stats.totalRequests;
  
  // Incrementar métrica de sessão
  incrementSessionMetric('suggestionsShown');
}

/**
 * Registra um silenciamento
 */
function recordSilence(reason: SilenceReason): void {
  state.stats.totalSilenced++;
  state.stats.silenceReasons[reason]++;
  
  // Atualizar taxa de emissão
  state.stats.emissionRate = state.stats.totalEmitted / state.stats.totalRequests;
}

/**
 * Formata a mensagem para saída
 */
function formatMessage(request: OutputRequest, semanticHash: string): OutputMessage {
  return {
    id: generateMessageId(),
    type: request.type,
    severity: request.severity,
    title: request.title,
    message: request.message,
    channel: request.channel,
    actions: request.actions,
    context: {
      screen: request.context.screen,
      eventId: request.context.eventId,
      timestamp: Date.now(),
    },
    semanticHash,
    ttl: request.ttl ?? state.config.defaultTTL,
    dismissable: request.dismissable ?? true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Processa uma requisição de saída e decide se deve emitir
 */
export function processOutput(request: OutputRequest): OutputDecision {
  state.stats.totalRequests++;
  
  // 1. Se forçado, emitir sem verificações
  if (request.force) {
    const semanticHash = generateSemanticHash(request.type, request.topic, request.message);
    const formattedMessage = formatMessage(request, semanticHash);
    recordEmission(request.channel);
    
    // Registrar na memória
    rememberMessage({
      id: formattedMessage.id,
      semanticHash,
      type: request.type,
      topic: request.topic,
      contentSummary: request.title,
      timestamp: Date.now(),
      context: request.context.screen,
      outcome: null,
    });
    
    return {
      shouldEmit: true,
      formattedMessage,
    };
  }
  
  // 2. Verificar silêncio global
  if (isSilenced() && request.severity !== 'critical') {
    recordSilence('silence_requested');
    return {
      shouldEmit: false,
      silenceReason: 'silence_requested',
      suggestedWaitTime: CommunicationMemory.getSuggestedWaitTime(),
    };
  }
  
  // 3. Verificar silêncio por atividade
  if (shouldSilenceForActivity(request.severity)) {
    recordSilence('user_busy');
    return {
      shouldEmit: false,
      silenceReason: 'user_busy',
      suggestedWaitTime: 10000, // 10 segundos
    };
  }
  
  // 3.5. INTEGRAÇÃO COM FEEDBACK LEARNING
  // Verificar se tópico deve ser evitado (aprendizado)
  if (shouldAvoidTopic(request.topic) && request.severity !== 'critical') {
    recordSilence('low_relevance');
    return {
      shouldEmit: false,
      silenceReason: 'low_relevance',
      suggestedWaitTime: 300000, // 5 minutos
    };
  }
  
  // Ajustar relevância baseado em aprendizado
  const relevanceAdjustment = getRelevanceAdjustment(request.topic, request.type);
  
  // Se ajuste negativo grande, reduzir severidade ou silenciar
  if (relevanceAdjustment < -0.2 && request.severity !== 'critical') {
    // Reduzir severidade
    if (request.severity === 'high') {
      request.severity = 'medium';
    } else if (request.severity === 'medium') {
      request.severity = 'low';
    } else if (request.severity === 'low' || request.severity === 'info') {
      // Se já é baixa e ajuste muito negativo, silenciar
      recordSilence('low_relevance');
      return {
        shouldEmit: false,
        silenceReason: 'low_relevance',
        suggestedWaitTime: 300000,
      };
    }
  }
  
  // Ajustar frequência baseado em aprendizado
  const idealFreq = getIdealFrequency();
  const currentFreq = countRecentEmissions(request.channel);
  
  // Se frequência atual > ideal * 1.5, reduzir probabilidade de emitir
  if (currentFreq > idealFreq * 1.5 && request.severity !== 'critical') {
    // Probabilidade de silenciar aumenta com frequência excessiva
    const silenceProbability = Math.min(0.7, (currentFreq - idealFreq) / idealFreq);
    if (Math.random() < silenceProbability) {
      recordSilence('rate_limited');
      return {
        shouldEmit: false,
        silenceReason: 'rate_limited',
        suggestedWaitTime: 60000, // 1 minuto
      };
    }
  }
  
  // 4. Gerar hash semântico
  const semanticHash = generateSemanticHash(request.type, request.topic, request.message);
  
  // 5. Verificar duplicação
  const duplicationCheck = checkDuplication(semanticHash, request.topic);
  if (duplicationCheck.isDuplicate && request.severity !== 'critical') {
    recordSilence(duplicationCheck.reason ?? 'already_said');
    return {
      shouldEmit: false,
      silenceReason: duplicationCheck.reason,
      suggestedWaitTime: duplicationCheck.timeSinceOriginal 
        ? Math.max(0, 300000 - duplicationCheck.timeSinceOriginal) 
        : 60000,
    };
  }
  
  // 6. Verificar rate limit
  const rateLimitCheck = checkRateLimit(request.channel);
  if (!rateLimitCheck.allowed && request.severity !== 'critical') {
    recordSilence('rate_limited');
    return {
      shouldEmit: false,
      silenceReason: 'rate_limited',
      suggestedWaitTime: rateLimitCheck.waitTime,
    };
  }
  
  // 7. Verificar receptividade do usuário (para não-críticos)
  if (
    request.severity === 'low' || 
    request.severity === 'info'
  ) {
    if (!CommunicationMemory.isUserReceptive()) {
      recordSilence('low_relevance');
      return {
        shouldEmit: false,
        silenceReason: 'low_relevance',
        suggestedWaitTime: CommunicationMemory.getSuggestedWaitTime(),
      };
    }
  }
  
  // 8. Tudo OK - formatar e emitir
  const formattedMessage = formatMessage(request, semanticHash);
  recordEmission(request.channel);
  
  // 9. Registrar na memória
  rememberMessage({
    id: formattedMessage.id,
    semanticHash,
    type: request.type,
    topic: request.topic,
    contentSummary: request.title,
    timestamp: Date.now(),
    context: request.context.screen,
    outcome: null,
  });
  
  return {
    shouldEmit: true,
    formattedMessage,
  };
}

/**
 * Verifica rapidamente se uma mensagem pode ser emitida
 * (versão leve para pré-filtragem)
 */
export function canEmit(
  channel: OutputChannel,
  severity: MessageSeverity
): { can: boolean; reason?: string } {
  // Críticos sempre podem
  if (severity === 'critical') {
    return { can: true };
  }
  
  // Silêncio global
  if (isSilenced()) {
    return { can: false, reason: 'silenced' };
  }
  
  // Atividade silenciosa
  if (shouldSilenceForActivity(severity)) {
    return { can: false, reason: 'user_busy' };
  }
  
  // Rate limit
  if (!checkRateLimit(channel).allowed) {
    return { can: false, reason: 'rate_limited' };
  }
  
  return { can: true };
}

/**
 * Registra feedback de uma mensagem
 */
export function recordMessageFeedback(
  semanticHash: string,
  topic: string,
  outcome: 'accepted' | 'dismissed' | 'ignored'
): void {
  switch (outcome) {
    case 'accepted':
      CommunicationMemory.markAsAccepted(semanticHash);
      incrementSessionMetric('suggestionsAccepted');
      break;
    case 'dismissed':
      CommunicationMemory.markAsDismissed(semanticHash, topic);
      incrementSessionMetric('suggestionsDismissed');
      break;
    case 'ignored':
      CommunicationMemory.markAsIgnored(semanticHash);
      break;
  }
  
  // INTEGRAÇÃO COM FEEDBACK LEARNING
  // Obter tipo da mensagem da memória para aprendizado
  const messageHistory = CommunicationMemory.getHistory();
  const message = messageHistory.find(m => m.semanticHash === semanticHash);
  
  if (message) {
    recordLearningFeedback(
      topic,
      message.type,
      outcome
    );
  }
}

/**
 * Obtém estatísticas do OutputGate
 */
export function getOutputStats(): OutputStats {
  return { ...state.stats };
}

/**
 * Atualiza configuração
 */
export function updateConfig(config: Partial<OutputGateConfig>): void {
  state.config = { ...state.config, ...config };
}

/**
 * Reseta estatísticas
 */
export function resetStats(): void {
  state.stats = {
    totalRequests: 0,
    totalEmitted: 0,
    totalSilenced: 0,
    silenceReasons: {
      already_said: 0,
      topic_blocked: 0,
      user_busy: 0,
      rate_limited: 0,
      low_relevance: 0,
      silence_requested: 0,
      context_changed: 0,
    },
    byChannel: {
      ADMIN: 0,
      USER: 0,
      SYSTEM: 0,
      SILENT: 0,
    },
    emissionRate: 1.0,
  };
  state.recentEmissions = [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const OutputGate = {
  process: processOutput,
  canEmit,
  recordFeedback: recordMessageFeedback,
  getStats: getOutputStats,
  updateConfig,
  resetStats,
};

export default OutputGate;

