/**
 * ══════════════════════════════════════════════════════════════════════════════
 * FEEDBACK LEARNING - Sistema de Aprendizado com Feedback
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Analisa feedback dos usuários para ajustar:
 * - Relevância de mensagens
 * - Frequência de sugestões
 * - Tópicos preferidos/evitados
 * - Horários de maior receptividade
 */

import type { MessageType } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Padrão de feedback detectado */
export interface FeedbackPattern {
  /** Tópico ou tipo */
  key: string;
  /** Taxa de aceitação (0-1) */
  acceptanceRate: number;
  /** Número de amostras */
  sampleSize: number;
  /** Tendência (subindo, descendo, estável) */
  trend: 'increasing' | 'decreasing' | 'stable';
  /** Última atualização */
  lastUpdated: number;
}

/** Preferências aprendidas */
export interface LearnedPreferences {
  /** Tópicos preferidos (alta aceitação) */
  preferredTopics: string[];
  /** Tópicos evitados (alta rejeição) */
  avoidedTopics: string[];
  /** Tipos de mensagem preferidos */
  preferredTypes: MessageType[];
  /** Horários de maior receptividade (0-23) */
  preferredHours: number[];
  /** Frequência ideal (mensagens por hora) */
  idealFrequency: number;
  /** Nível de detalhe preferido */
  preferredDetailLevel: 'minimal' | 'brief' | 'detailed';
}

/** Entrada de feedback para análise */
export interface FeedbackEntry {
  topic: string;
  type: MessageType;
  outcome: 'accepted' | 'dismissed' | 'ignored';
  timestamp: number;
  hour: number;
  dayOfWeek: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

interface LearningState {
  initialized: boolean;
  feedbackHistory: FeedbackEntry[];
  patterns: Map<string, FeedbackPattern>;
  learnedPreferences: LearnedPreferences;
  lastAnalysis: number;
}

const state: LearningState = {
  initialized: false,
  feedbackHistory: [],
  patterns: new Map(),
  learnedPreferences: {
    preferredTopics: [],
    avoidedTopics: [],
    preferredTypes: [],
    preferredHours: [],
    idealFrequency: 3,
    preferredDetailLevel: 'detailed',
  },
  lastAnalysis: 0,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE ANÁLISE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula taxa de aceitação para um filtro
 */
function calculateAcceptanceRate(
  entries: FeedbackEntry[],
  filter?: (entry: FeedbackEntry) => boolean
): { rate: number; total: number } {
  const filtered = filter ? entries.filter(filter) : entries;
  
  if (filtered.length === 0) {
    return { rate: 0.5, total: 0 };
  }
  
  const accepted = filtered.filter(e => e.outcome === 'accepted').length;
  const total = filtered.filter(e => e.outcome !== 'ignored').length;
  
  if (total === 0) {
    return { rate: 0.5, total: 0 };
  }
  
  return { rate: accepted / total, total };
}

/**
 * Detecta tendência comparando períodos
 */
function detectTrend(
  entries: FeedbackEntry[],
  key: string,
  keyExtractor: (e: FeedbackEntry) => string
): 'increasing' | 'decreasing' | 'stable' {
  const filtered = entries.filter(e => keyExtractor(e) === key);
  
  if (filtered.length < 10) {
    return 'stable';
  }
  
  // Dividir em duas metades
  const sorted = filtered.sort((a, b) => a.timestamp - b.timestamp);
  const midpoint = Math.floor(sorted.length / 2);
  
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);
  
  const firstRate = calculateAcceptanceRate(firstHalf).rate;
  const secondRate = calculateAcceptanceRate(secondHalf).rate;
  
  const diff = secondRate - firstRate;
  
  if (diff > 0.1) {
    return 'increasing';
  }
  if (diff < -0.1) {
    return 'decreasing';
  }
  return 'stable';
}

/**
 * Analisa padrões por tópico
 */
function analyzeTopicPatterns(): void {
  const topicStats: Record<string, { accepted: number; rejected: number; ignored: number }> = {};
  
  for (const entry of state.feedbackHistory) {
    if (!topicStats[entry.topic]) {
      topicStats[entry.topic] = { accepted: 0, rejected: 0, ignored: 0 };
    }
    
    if (entry.outcome === 'accepted') {
      topicStats[entry.topic].accepted++;
    } else if (entry.outcome === 'dismissed') {
      topicStats[entry.topic].rejected++;
    } else {
      topicStats[entry.topic].ignored++;
    }
  }
  
  // Atualizar padrões
  for (const [topic, stats] of Object.entries(topicStats)) {
    const total = stats.accepted + stats.rejected;
    if (total < 3) {
      continue; // Mínimo de amostras
    }
    
    const rate = stats.accepted / total;
    const trend = detectTrend(state.feedbackHistory, topic, e => e.topic);
    
    state.patterns.set(`topic:${topic}`, {
      key: topic,
      acceptanceRate: rate,
      sampleSize: total,
      trend,
      lastUpdated: Date.now(),
    });
  }
}

/**
 * Analisa padrões por tipo de mensagem
 */
function analyzeTypePatterns(): void {
  const typeStats: Record<string, { accepted: number; rejected: number }> = {};
  
  for (const entry of state.feedbackHistory) {
    if (!typeStats[entry.type]) {
      typeStats[entry.type] = { accepted: 0, rejected: 0 };
    }
    
    if (entry.outcome === 'accepted') {
      typeStats[entry.type].accepted++;
    } else if (entry.outcome === 'dismissed') {
      typeStats[entry.type].rejected++;
    }
  }
  
  for (const [type, stats] of Object.entries(typeStats)) {
    const total = stats.accepted + stats.rejected;
    if (total < 5) {
      continue;
    }
    
    const rate = stats.accepted / total;
    const trend = detectTrend(state.feedbackHistory, type, e => e.type);
    
    state.patterns.set(`type:${type}`, {
      key: type,
      acceptanceRate: rate,
      sampleSize: total,
      trend,
      lastUpdated: Date.now(),
    });
  }
}

/**
 * Analisa padrões por horário
 */
function analyzeTimePatterns(): void {
  const hourStats: Record<number, { accepted: number; total: number }> = {};
  
  for (const entry of state.feedbackHistory) {
    if (!hourStats[entry.hour]) {
      hourStats[entry.hour] = { accepted: 0, total: 0 };
    }
    
    hourStats[entry.hour].total++;
    if (entry.outcome === 'accepted') {
      hourStats[entry.hour].accepted++;
    }
  }
  
  // Encontrar horários com melhor receptividade
  const preferredHours: number[] = [];
  
  for (const [hour, stats] of Object.entries(hourStats)) {
    if (stats.total < 3) {
      continue;
    }
    
    const rate = stats.accepted / stats.total;
    if (rate >= 0.5) {
      preferredHours.push(parseInt(hour));
    }
  }
  
  state.learnedPreferences.preferredHours = preferredHours.sort((a, b) => a - b);
}

/**
 * Atualiza preferências aprendidas
 */
function updateLearnedPreferences(): void {
  const preferredTopics: string[] = [];
  const avoidedTopics: string[] = [];
  const preferredTypes: MessageType[] = [];
  
  for (const [key, pattern] of state.patterns) {
    if (pattern.sampleSize < 5) {continue;}
    
    if (key.startsWith('topic:')) {
      const topic = key.replace('topic:', '');
      
      if (pattern.acceptanceRate >= 0.6) {
        preferredTopics.push(topic);
      } else if (pattern.acceptanceRate <= 0.3) {
        avoidedTopics.push(topic);
      }
    }
    
    if (key.startsWith('type:')) {
      const type = key.replace('type:', '') as MessageType;
      
      if (pattern.acceptanceRate >= 0.5) {
        preferredTypes.push(type);
      }
    }
  }
  
  state.learnedPreferences = {
    ...state.learnedPreferences,
    preferredTopics,
    avoidedTopics,
    preferredTypes,
  };
  
  // Calcular frequência ideal
  const recentEntries = state.feedbackHistory.filter(
    e => Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000 // Última semana
  );
  
  if (recentEntries.length > 0) {
    const accepted = recentEntries.filter(e => e.outcome === 'accepted').length;
    const total = recentEntries.filter(e => e.outcome !== 'ignored').length;
    
    if (total > 0) {
      const rate = accepted / total;
      
      // Ajustar frequência baseado na taxa de aceitação
      if (rate < 0.3) {
        state.learnedPreferences.idealFrequency = 1; // Reduzir muito
      } else if (rate < 0.5) {
        state.learnedPreferences.idealFrequency = 2; // Reduzir
      } else if (rate > 0.7) {
        state.learnedPreferences.idealFrequency = 5; // Pode aumentar
      } else {
        state.learnedPreferences.idealFrequency = 3; // Manter padrão
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema de aprendizado
 */
export function initFeedbackLearning(): void {
  if (state.initialized) {
    return;
  }
  
  state.initialized = true;
  
  // eslint-disable-next-line no-console
  console.log('[FeedbackLearning] Initialized');
}

/**
 * Registra uma entrada de feedback
 */
export function recordFeedback(
  topic: string,
  type: MessageType,
  outcome: 'accepted' | 'dismissed' | 'ignored'
): void {
  const now = new Date();
  
  const entry: FeedbackEntry = {
    topic,
    type,
    outcome,
    timestamp: now.getTime(),
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
  };
  
  state.feedbackHistory.push(entry);
  
  // Limitar histórico
  if (state.feedbackHistory.length > 1000) {
    state.feedbackHistory = state.feedbackHistory.slice(-1000);
  }
  
  // Re-analisar periodicamente
  if (Date.now() - state.lastAnalysis > 60000) { // A cada minuto
    runAnalysis();
  }
}

/**
 * Executa análise completa
 */
export function runAnalysis(): void {
  analyzeTopicPatterns();
  analyzeTypePatterns();
  analyzeTimePatterns();
  updateLearnedPreferences();
  
  state.lastAnalysis = Date.now();
  
  // eslint-disable-next-line no-console
  console.log('[FeedbackLearning] Analysis complete', {
    patterns: state.patterns.size,
    preferredTopics: state.learnedPreferences.preferredTopics.length,
    avoidedTopics: state.learnedPreferences.avoidedTopics.length,
  });
}

/**
 * Obtém preferências aprendidas
 */
export function getLearnedPreferences(): LearnedPreferences {
  return { ...state.learnedPreferences };
}

/**
 * Verifica se um tópico deve ser evitado
 */
export function shouldAvoidTopic(topic: string): boolean {
  return state.learnedPreferences.avoidedTopics.includes(topic);
}

/**
 * Obtém taxa de aceitação para um tópico
 */
export function getTopicAcceptanceRate(topic: string): number {
  const pattern = state.patterns.get(`topic:${topic}`);
  return pattern?.acceptanceRate ?? 0.5;
}

/**
 * Obtém ajuste de relevância baseado em aprendizado
 */
export function getRelevanceAdjustment(
  topic: string,
  type: MessageType
): number {
  let adjustment = 0;
  
  // Ajuste por tópico
  const topicPattern = state.patterns.get(`topic:${topic}`);
  if (topicPattern) {
    if (topicPattern.acceptanceRate > 0.6) {
      adjustment += 0.1; // Boost
    } else if (topicPattern.acceptanceRate < 0.3) {
      adjustment -= 0.2; // Penalizar
    }
    
    // Considerar tendência
    if (topicPattern.trend === 'increasing') {
      adjustment += 0.05;
    } else if (topicPattern.trend === 'decreasing') {
      adjustment -= 0.1;
    }
  }
  
  // Ajuste por tipo
  const typePattern = state.patterns.get(`type:${type}`);
  if (typePattern) {
    if (typePattern.acceptanceRate > 0.6) {
      adjustment += 0.05;
    } else if (typePattern.acceptanceRate < 0.3) {
      adjustment -= 0.1;
    }
  }
  
  // Ajuste por horário
  const currentHour = new Date().getHours();
  if (state.learnedPreferences.preferredHours.includes(currentHour)) {
    adjustment += 0.05;
  }
  
  return adjustment;
}

/**
 * Obtém frequência ideal de mensagens
 */
export function getIdealFrequency(): number {
  return state.learnedPreferences.idealFrequency;
}

/**
 * Obtém estatísticas do aprendizado
 */
export function getLearningStats(): {
  totalFeedback: number;
  patternsDetected: number;
  overallAcceptanceRate: number;
  preferredTopics: string[];
  avoidedTopics: string[];
} {
  const { rate } = calculateAcceptanceRate(state.feedbackHistory);
  
  return {
    totalFeedback: state.feedbackHistory.length,
    patternsDetected: state.patterns.size,
    overallAcceptanceRate: rate,
    preferredTopics: state.learnedPreferences.preferredTopics,
    avoidedTopics: state.learnedPreferences.avoidedTopics,
  };
}

/**
 * Reseta o aprendizado
 */
export function resetLearning(): void {
  state.feedbackHistory = [];
  state.patterns.clear();
  state.learnedPreferences = {
    preferredTopics: [],
    avoidedTopics: [],
    preferredTypes: [],
    preferredHours: [],
    idealFrequency: 3,
    preferredDetailLevel: 'detailed',
  };
  state.lastAnalysis = 0;
  
  // eslint-disable-next-line no-console
  console.log('[FeedbackLearning] Reset complete');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const FeedbackLearning = {
  init: initFeedbackLearning,
  recordFeedback,
  runAnalysis,
  getPreferences: getLearnedPreferences,
  shouldAvoid: shouldAvoidTopic,
  getTopicRate: getTopicAcceptanceRate,
  getRelevanceAdjustment,
  getIdealFrequency,
  getStats: getLearningStats,
  reset: resetLearning,
};

export default FeedbackLearning;

