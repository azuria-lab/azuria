/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COMMUNICATION MEMORY - Memória de Comunicação
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este módulo gerencia a memória do que foi comunicado ao usuário.
 * Responsabilidades:
 * - Rastrear mensagens enviadas
 * - Gerar hashes semânticos para deduplicação
 * - Gerenciar tópicos bloqueados
 * - Prevenir repetição de mensagens
 */

import type { MessageType, SilenceReason } from './types';
import {
  blockTopic,
  getGlobalState,
  isTopicBlocked,
  recordSentMessage,
  type SentMessage,
  wasRecentlySent,
} from './GlobalState';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Registro de mensagem para memória */
export interface MessageRecord {
  /** ID da mensagem */
  id: string;
  /** Hash semântico */
  semanticHash: string;
  /** Tipo da mensagem */
  type: MessageType;
  /** Tópico da mensagem */
  topic: string;
  /** Conteúdo resumido */
  contentSummary: string;
  /** Timestamp */
  timestamp: number;
  /** Contexto (tela) */
  context: string;
  /** Resultado (aceita/rejeitada/ignorada) */
  outcome: 'accepted' | 'dismissed' | 'ignored' | null;
}

/** Resultado de verificação de duplicação */
export interface DuplicationCheck {
  /** Se é duplicada */
  isDuplicate: boolean;
  /** Razão se duplicada */
  reason?: SilenceReason;
  /** Mensagem original (se duplicada) */
  originalMessage?: SentMessage;
  /** Tempo desde a mensagem original (ms) */
  timeSinceOriginal?: number;
}

/** Configuração de deduplicação */
export interface DeduplicationConfig {
  /** Janela de tempo para considerar duplicação (ms) */
  timeWindow: number;
  /** Se deve considerar mesmo tópico como duplicação */
  considerSameTopic: boolean;
  /** Cooldown após dismiss (ms) */
  dismissCooldown: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO PADRÃO
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: DeduplicationConfig = {
  timeWindow: 300000, // 5 minutos
  considerSameTopic: true,
  dismissCooldown: 60000, // 1 minuto após dismiss
};

// ═══════════════════════════════════════════════════════════════════════════════
// GERAÇÃO DE HASH SEMÂNTICO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normaliza texto para comparação semântica
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

/**
 * Extrai palavras-chave de um texto
 */
function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  
  // Stopwords em português
  const stopwords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
    'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
    'por', 'para', 'com', 'sem', 'sob', 'sobre',
    'e', 'ou', 'mas', 'se', 'que', 'quando', 'como',
    'seu', 'sua', 'seus', 'suas', 'esse', 'essa', 'este', 'esta',
    'isso', 'isto', 'aquilo', 'ele', 'ela', 'eles', 'elas',
    'voce', 'nos', 'vos', 'lhe', 'lhes',
    'ser', 'estar', 'ter', 'haver', 'fazer', 'poder', 'dever',
    'muito', 'pouco', 'mais', 'menos', 'bem', 'mal',
    'ja', 'ainda', 'agora', 'sempre', 'nunca', 'hoje',
  ]);
  
  return words
    .filter(word => word.length > 2 && !stopwords.has(word))
    .slice(0, 10); // Máximo 10 keywords
}

/**
 * Gera um hash semântico para uma mensagem
 * O hash é baseado no conteúdo semântico, não no texto exato
 */
export function generateSemanticHash(
  type: MessageType,
  topic: string,
  content: string
): string {
  const keywords = extractKeywords(content);
  const normalizedTopic = normalizeText(topic);
  
  // Combinar tipo + tópico + keywords ordenadas
  const hashInput = [
    type,
    normalizedTopic,
    ...keywords.sort(),
  ].join('|');
  
  // Hash simples (para ambiente browser)
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `sem_${Math.abs(hash).toString(36)}`;
}

/**
 * Gera hash para um tópico
 */
export function generateTopicHash(topic: string): string {
  const normalized = normalizeText(topic);
  
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `topic_${Math.abs(hash).toString(36)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se uma mensagem é duplicada
 */
export function checkDuplication(
  semanticHash: string,
  topic: string,
  config: Partial<DeduplicationConfig> = {}
): DuplicationCheck {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const state = getGlobalState();
  
  // 1. Verificar tópico bloqueado
  const topicHash = generateTopicHash(topic);
  if (isTopicBlocked(topicHash)) {
    const blockedTopic = state.communicationMemory.blockedTopics.find(
      t => t.topicHash === topicHash
    );
    
    return {
      isDuplicate: true,
      reason: 'topic_blocked',
      timeSinceOriginal: blockedTopic ? blockedTopic.blockedUntil - Date.now() : 0,
    };
  }
  
  // 2. Verificar hash semântico recente
  if (wasRecentlySent(semanticHash, cfg.timeWindow)) {
    const original = state.communicationMemory.sentMessages.find(
      m => m.semanticHash === semanticHash
    );
    
    return {
      isDuplicate: true,
      reason: 'already_said',
      originalMessage: original,
      timeSinceOriginal: original ? Date.now() - original.sentAt : 0,
    };
  }
  
  // 3. Verificar mesmo tópico recente (se configurado)
  if (cfg.considerSameTopic) {
    const recentSameTopic = state.communicationMemory.sentMessages.find(
      m => m.topic === topic && Date.now() - m.sentAt < cfg.timeWindow / 2
    );
    
    if (recentSameTopic) {
      // Se foi dismissed recentemente, bloquear por mais tempo
      if (recentSameTopic.outcome === 'dismissed') {
        const timeSinceDismiss = Date.now() - recentSameTopic.sentAt;
        if (timeSinceDismiss < cfg.dismissCooldown) {
          return {
            isDuplicate: true,
            reason: 'topic_blocked',
            originalMessage: recentSameTopic,
            timeSinceOriginal: timeSinceDismiss,
          };
        }
      }
    }
  }
  
  // 4. Verificar se conversa atual já tem muitas mensagens do mesmo tópico
  const conversationContext = state.communicationMemory.conversationContext;
  if (
    conversationContext.currentTopic === topic &&
    conversationContext.messagesInTopic >= 3
  ) {
    // Já falou muito sobre esse tópico nesta conversa
    return {
      isDuplicate: true,
      reason: 'already_said',
      timeSinceOriginal: conversationContext.topicStartedAt 
        ? Date.now() - conversationContext.topicStartedAt 
        : 0,
    };
  }
  
  return {
    isDuplicate: false,
  };
}

/**
 * Registra uma mensagem enviada na memória
 */
export function rememberMessage(record: MessageRecord): void {
  const sentMessage: SentMessage = {
    semanticHash: record.semanticHash,
    messageType: record.type,
    sentAt: record.timestamp,
    context: record.context,
    outcome: record.outcome,
    topic: record.topic,
  };
  
  recordSentMessage(sentMessage);
}

/**
 * Marca uma mensagem como aceita
 */
export function markAsAccepted(semanticHash: string): void {
  const state = getGlobalState();
  const message = state.communicationMemory.sentMessages.find(
    m => m.semanticHash === semanticHash
  );
  
  if (message) {
    message.outcome = 'accepted';
  }
}

/**
 * Marca uma mensagem como dispensada e bloqueia o tópico
 */
export function markAsDismissed(
  semanticHash: string,
  topic: string,
  blockDuration: number = 300000 // 5 min
): void {
  const state = getGlobalState();
  const message = state.communicationMemory.sentMessages.find(
    m => m.semanticHash === semanticHash
  );
  
  if (message) {
    message.outcome = 'dismissed';
  }
  
  // Bloquear o tópico
  const topicHash = generateTopicHash(topic);
  blockTopic(topicHash, topic, blockDuration, 'user_dismissed');
}

/**
 * Marca uma mensagem como ignorada
 */
export function markAsIgnored(semanticHash: string): void {
  const state = getGlobalState();
  const message = state.communicationMemory.sentMessages.find(
    m => m.semanticHash === semanticHash
  );
  
  if (message) {
    message.outcome = 'ignored';
  }
}

/**
 * Verifica quantas vezes um tópico foi mencionado recentemente
 */
export function getTopicMentionCount(topic: string, windowMs: number = 600000): number {
  const state = getGlobalState();
  const cutoff = Date.now() - windowMs;
  
  return state.communicationMemory.sentMessages.filter(
    m => m.topic === topic && m.sentAt > cutoff
  ).length;
}

/**
 * Obtém taxa de aceitação recente
 */
export function getRecentAcceptanceRate(count: number = 20): number {
  const state = getGlobalState();
  const recent = state.communicationMemory.sentMessages.slice(0, count);
  
  if (recent.length === 0) {
    return 0.5; // Neutro se não há histórico
  }
  
  const withOutcome = recent.filter(m => m.outcome !== null && m.outcome !== 'ignored');
  if (withOutcome.length === 0) {
    return 0.5;
  }
  
  const accepted = withOutcome.filter(m => m.outcome === 'accepted').length;
  return accepted / withOutcome.length;
}

/**
 * Verifica se usuário está receptivo a mensagens
 * Baseado no histórico recente
 */
export function isUserReceptive(): boolean {
  const acceptanceRate = getRecentAcceptanceRate(10);
  
  // Se taxa de aceitação menor que 20%, usuário não está receptivo
  return acceptanceRate >= 0.2;
}

/**
 * Obtém sugestão de tempo de espera baseado no histórico
 */
export function getSuggestedWaitTime(): number {
  const acceptanceRate = getRecentAcceptanceRate(10);
  
  // Quanto menor a taxa de aceitação, maior o tempo de espera
  if (acceptanceRate < 0.2) {
    return 300000; // 5 min
  }
  if (acceptanceRate < 0.4) {
    return 120000; // 2 min
  }
  if (acceptanceRate < 0.6) {
    return 60000; // 1 min
  }
  
  return 30000; // 30s (padrão)
}

/**
 * Limpa mensagens antigas da memória
 */
export function cleanupOldMessages(maxAgeMs: number = 3600000): void {
  const state = getGlobalState();
  const cutoff = Date.now() - maxAgeMs;
  
  state.communicationMemory.sentMessages = state.communicationMemory.sentMessages.filter(
    m => m.sentAt > cutoff
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommunicationMemory = {
  // Hash generation
  generateSemanticHash,
  generateTopicHash,
  
  // Duplication check
  checkDuplication,
  
  // Memory operations
  remember: rememberMessage,
  markAsAccepted,
  markAsDismissed,
  markAsIgnored,
  
  // Analytics
  getTopicMentionCount,
  getRecentAcceptanceRate,
  isUserReceptive,
  getSuggestedWaitTime,
  
  // Maintenance
  cleanup: cleanupOldMessages,
};

export default CommunicationMemory;

