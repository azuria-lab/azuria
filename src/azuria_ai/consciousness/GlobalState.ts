/**
 * ══════════════════════════════════════════════════════════════════════════════
 * GLOBAL STATE - Estado Global Único do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este é o ÚNICO estado global do sistema. Todas as informações de contexto,
 * consciência e memória são armazenadas aqui.
 * 
 * Regras:
 * - Apenas o ConsciousnessCore pode escrever diretamente
 * - Engines internos podem ler através do Núcleo
 * - UI lê através de hooks específicos
 */

import { generateSecureSessionId } from '@/utils/secureRandom';
import type {
  CognitiveRole,
  EventPriority,
  ExplanationLevel,
  FlowPhase,
  MessageType,
  SkillLevel,
  SubscriptionTier,
  SuggestionFrequency,
  UserActivityState,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DO ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

/** Momento atual do sistema */
export interface CurrentMoment {
  /** Timestamp atual */
  timestamp: number;
  /** Tela atual */
  screen: string;
  /** Fase do fluxo */
  flowPhase: FlowPhase;
  /** Estado de atividade do usuário */
  userActivity: UserActivityState;
  /** Se silêncio foi solicitado */
  silenceRequested: boolean;
  /** Até quando silenciar (null = não silenciado) */
  silenceUntil: number | null;
  /** Última ação do usuário */
  lastUserAction: string | null;
  /** Timestamp da última ação */
  lastActionAt: number;
}

/** Identidade do usuário */
export interface UserIdentity {
  /** ID do usuário */
  id: string | null;
  /** Papel cognitivo */
  role: CognitiveRole;
  /** Nível de assinatura */
  tier: SubscriptionTier;
  /** Nível de habilidade */
  skillLevel: SkillLevel;
  /** Preferências do usuário */
  preferences: {
    /** Frequência de sugestões */
    suggestionFrequency: SuggestionFrequency;
    /** Nível de explicação */
    explanationLevel: ExplanationLevel;
    /** Aceita assistência proativa */
    proactiveAssistance: boolean;
  };
}

/** Registro de mensagem enviada */
export interface SentMessage {
  /** Hash semântico da mensagem */
  semanticHash: string;
  /** Tipo da mensagem */
  messageType: MessageType;
  /** Quando foi enviada */
  sentAt: number;
  /** Contexto (tela/situação) */
  context: string;
  /** Se foi aceita/rejeitada/ignorada */
  outcome: 'accepted' | 'dismissed' | 'ignored' | null;
  /** Tópico da mensagem */
  topic: string;
}

/** Tópico bloqueado */
export interface BlockedTopic {
  /** Hash do tópico */
  topicHash: string;
  /** Nome legível do tópico */
  topicName: string;
  /** Bloqueado até */
  blockedUntil: number;
  /** Razão do bloqueio */
  reason: string;
}

/** Memória de comunicação */
export interface CommunicationMemoryData {
  /** Histórico de mensagens enviadas */
  sentMessages: SentMessage[];
  /** Tópicos bloqueados */
  blockedTopics: BlockedTopic[];
  /** Contexto da conversa atual */
  conversationContext: {
    /** Tópico atual */
    currentTopic: string | null;
    /** Mensagens no tópico atual */
    messagesInTopic: number;
    /** Quando o tópico começou */
    topicStartedAt: number | null;
  };
}

/** Dados da sessão */
export interface SessionData {
  /** ID da sessão */
  id: string;
  /** Quando começou */
  startedAt: number;
  /** Métricas da sessão */
  metrics: {
    /** Cálculos completados */
    calculationsCompleted: number;
    /** Erros encontrados */
    errorsEncountered: number;
    /** Sugestões mostradas */
    suggestionsShown: number;
    /** Sugestões aceitas */
    suggestionsAccepted: number;
    /** Sugestões dispensadas */
    suggestionsDismissed: number;
  };
  /** Jornada do usuário */
  journey: {
    /** Histórico de telas */
    screens: string[];
    /** Fluxo atual (ex: 'cálculo-BDI', 'análise-licitação') */
    currentFlow: string | null;
    /** Progresso no fluxo (0-100) */
    flowProgress: number;
  };
}

/** Saúde do sistema */
export interface SystemHealth {
  /** Score geral (0-1) */
  overallScore: number;
  /** Engines ativos */
  activeEngines: string[];
  /** Últimos erros */
  lastErrors: Array<{ engine: string; error: string; at: number }>;
  /** Disponibilidade de IA */
  aiAvailability: {
    gemini: boolean;
  };
}

/** Ação pendente */
export interface PendingAction {
  /** ID da ação */
  id: string;
  /** Tipo da ação */
  type: string;
  /** Prioridade */
  priority: EventPriority;
  /** Agendado para (null = ASAP) */
  scheduledFor: number | null;
  /** Payload */
  payload: unknown;
  /** Tentativas */
  attempts: number;
}

/** Forma completa do Estado Global */
export interface GlobalStateShape {
  /** Momento atual */
  currentMoment: CurrentMoment;
  /** Identidade do usuário */
  identity: UserIdentity;
  /** Memória de comunicação */
  communicationMemory: CommunicationMemoryData;
  /** Dados da sessão */
  session: SessionData;
  /** Saúde do sistema */
  systemHealth: SystemHealth;
  /** Ações pendentes */
  pendingActions: PendingAction[];
  /** Timestamp da última atualização */
  lastUpdatedAt: number;
  /** Se o estado foi inicializado */
  initialized: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════════════════════

function generateSessionId(): string {
  return generateSecureSessionId();
}

function createInitialState(): GlobalStateShape {
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
    
    communicationMemory: {
      sentMessages: [],
      blockedTopics: [],
      conversationContext: {
        currentTopic: null,
        messagesInTopic: 0,
        topicStartedAt: null,
      },
    },
    
    session: {
      id: generateSessionId(),
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
      overallScore: 1.0,
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

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON DO ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

let globalState: GlobalStateShape = createInitialState();

// Listeners para mudanças de estado
type StateListener = (state: GlobalStateShape, changedKeys: string[]) => void;
const stateListeners: Set<StateListener> = new Set();

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém uma cópia do estado global atual
 */
export function getGlobalState(): GlobalStateShape {
  return { ...globalState };
}

/**
 * Obtém uma seção específica do estado
 */
export function getStateSection<K extends keyof GlobalStateShape>(
  section: K
): GlobalStateShape[K] {
  return globalState[section];
}

/**
 * Atualiza o estado global
 * ATENÇÃO: Apenas o ConsciousnessCore deve chamar esta função diretamente
 */
export function updateGlobalState(
  updates: Partial<GlobalStateShape>,
  source: string = 'unknown'
): void {
  const changedKeys: string[] = [];
  
  // Aplicar atualizações com deep merge
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      changedKeys.push(key);
      
      const existingValue = globalState[key as keyof GlobalStateShape];
      
      // Deep merge para objetos
      if (
        typeof value === 'object' && 
        value !== null && 
        !Array.isArray(value) &&
        typeof existingValue === 'object' &&
        existingValue !== null &&
        !Array.isArray(existingValue)
      ) {
        (globalState as unknown as Record<string, unknown>)[key] = {
          ...existingValue,
          ...value,
        };
      } else {
        (globalState as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }
  
  // Atualizar timestamp
  globalState.lastUpdatedAt = Date.now();
  
  // Notificar listeners
  if (changedKeys.length > 0) {
    notifyListeners(changedKeys);
  }
  
  // Log em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[GlobalState] Updated by ${source}:`, changedKeys);
  }
}

/**
 * Atualiza uma seção específica do estado com merge profundo
 */
export function updateStateSection<K extends keyof GlobalStateShape>(
  section: K,
  updates: Partial<GlobalStateShape[K]>,
  source: string = 'unknown'
): void {
  const currentSection = globalState[section];
  
  if (typeof currentSection === 'object' && currentSection !== null) {
    (globalState as unknown as Record<string, unknown>)[section] = {
      ...currentSection,
      ...updates,
    };
  } else {
    (globalState as unknown as Record<string, unknown>)[section] = updates;
  }
  
  globalState.lastUpdatedAt = Date.now();
  notifyListeners([section as string]);
  
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[GlobalState] Section ${String(section)} updated by ${source}`);
  }
}

/**
 * Reseta o estado global para o estado inicial
 */
export function resetGlobalState(): void {
  globalState = createInitialState();
  notifyListeners(['*']);
  
  // eslint-disable-next-line no-console
  console.log('[GlobalState] State reset to initial');
}

/**
 * Inicializa o estado com dados do usuário
 */
export function initializeState(
  userId: string | null,
  role: CognitiveRole,
  tier: SubscriptionTier
): void {
  updateGlobalState({
    identity: {
      ...globalState.identity,
      id: userId,
      role,
      tier,
    },
    initialized: true,
  }, 'init');
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE CONSULTA ESPECÍFICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se o usuário é ADMIN
 */
export function isAdmin(): boolean {
  return globalState.identity.role === 'ADMIN';
}

/**
 * Verifica se o silêncio está ativo
 */
export function isSilenced(): boolean {
  if (globalState.currentMoment.silenceRequested) {
    return true;
  }
  
  const silenceUntil = globalState.currentMoment.silenceUntil;
  if (silenceUntil !== null && Date.now() < silenceUntil) {
    return true;
  }
  
  return false;
}

/**
 * Verifica se um tópico está bloqueado
 */
export function isTopicBlocked(topicHash: string): boolean {
  const blocked = globalState.communicationMemory.blockedTopics.find(
    (t) => t.topicHash === topicHash
  );
  
  if (!blocked) {
    return false;
  }
  
  return Date.now() < blocked.blockedUntil;
}

/**
 * Verifica se uma mensagem (por hash) já foi enviada recentemente
 */
export function wasRecentlySent(
  semanticHash: string,
  windowMs: number = 300000 // 5 min
): boolean {
  const cutoff = Date.now() - windowMs;
  
  return globalState.communicationMemory.sentMessages.some(
    (msg) => msg.semanticHash === semanticHash && msg.sentAt > cutoff
  );
}

/**
 * Obtém o estado de atividade atual
 */
export function getCurrentActivity(): UserActivityState {
  return globalState.currentMoment.userActivity;
}

/**
 * Obtém o papel do usuário
 */
export function getUserRole(): CognitiveRole {
  return globalState.identity.role;
}

/**
 * Obtém métricas da sessão
 */
export function getSessionMetrics(): SessionData['metrics'] {
  return { ...globalState.session.metrics };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE ATUALIZAÇÃO ESPECÍFICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registra uma mensagem enviada
 */
export function recordSentMessage(message: SentMessage): void {
  const memory = globalState.communicationMemory;
  
  // Adicionar mensagem
  memory.sentMessages.unshift(message);
  
  // Limitar tamanho do histórico
  if (memory.sentMessages.length > 100) {
    memory.sentMessages = memory.sentMessages.slice(0, 100);
  }
  
  // Atualizar contexto de conversa
  if (message.topic !== memory.conversationContext.currentTopic) {
    memory.conversationContext = {
      currentTopic: message.topic,
      messagesInTopic: 1,
      topicStartedAt: Date.now(),
    };
  } else {
    memory.conversationContext.messagesInTopic++;
  }
  
  updateStateSection('communicationMemory', memory, 'recordSentMessage');
}

/**
 * Bloqueia um tópico
 */
export function blockTopic(
  topicHash: string,
  topicName: string,
  duration: number,
  reason: string
): void {
  const memory = globalState.communicationMemory;
  
  // Remover bloqueio anterior do mesmo tópico
  memory.blockedTopics = memory.blockedTopics.filter(
    (t) => t.topicHash !== topicHash
  );
  
  // Adicionar novo bloqueio
  memory.blockedTopics.push({
    topicHash,
    topicName,
    blockedUntil: Date.now() + duration,
    reason,
  });
  
  updateStateSection('communicationMemory', memory, 'blockTopic');
}

/**
 * Atualiza o estado de atividade do usuário
 */
export function updateUserActivity(activity: UserActivityState): void {
  updateStateSection('currentMoment', {
    userActivity: activity,
    lastActionAt: Date.now(),
  }, 'updateUserActivity');
}

/**
 * Atualiza a tela atual
 */
export function updateCurrentScreen(screen: string): void {
  const journey = globalState.session.journey;
  
  // Adicionar ao histórico se diferente
  if (journey.screens[journey.screens.length - 1] !== screen) {
    journey.screens.push(screen);
    
    // Limitar tamanho
    if (journey.screens.length > 50) {
      journey.screens = journey.screens.slice(-50);
    }
  }
  
  updateStateSection('currentMoment', { screen }, 'updateCurrentScreen');
  updateStateSection('session', { journey }, 'updateCurrentScreen');
}

/**
 * Solicita silêncio
 */
export function requestSilence(durationMs: number): void {
  updateStateSection('currentMoment', {
    silenceRequested: true,
    silenceUntil: Date.now() + durationMs,
  }, 'requestSilence');
}

/**
 * Remove silêncio
 */
export function removeSilence(): void {
  updateStateSection('currentMoment', {
    silenceRequested: false,
    silenceUntil: null,
  }, 'removeSilence');
}

/**
 * Incrementa uma métrica da sessão
 */
export function incrementSessionMetric(
  metric: keyof SessionData['metrics'],
  amount: number = 1
): void {
  const metrics = globalState.session.metrics;
  metrics[metric] += amount;
  updateStateSection('session', { metrics }, 'incrementSessionMetric');
}

/**
 * Atualiza saúde do sistema
 */
export function updateSystemHealth(updates: Partial<SystemHealth>): void {
  updateStateSection('systemHealth', updates, 'updateSystemHealth');
}

/**
 * Registra um erro do sistema
 */
export function recordSystemError(engine: string, error: string): void {
  const health = globalState.systemHealth;
  
  health.lastErrors.unshift({ engine, error, at: Date.now() });
  
  // Limitar a 10 erros
  if (health.lastErrors.length > 10) {
    health.lastErrors = health.lastErrors.slice(0, 10);
  }
  
  // Reduzir score de saúde
  health.overallScore = Math.max(0, health.overallScore - 0.05);
  
  updateStateSection('systemHealth', health, 'recordSystemError');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SISTEMA DE LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Adiciona um listener para mudanças de estado
 */
export function subscribeToState(listener: StateListener): () => void {
  stateListeners.add(listener);
  
  return () => {
    stateListeners.delete(listener);
  };
}

/**
 * Notifica todos os listeners
 */
function notifyListeners(changedKeys: string[]): void {
  const stateCopy = getGlobalState();
  
  stateListeners.forEach((listener) => {
    try {
      listener(stateCopy, changedKeys);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[GlobalState] Listener error:', error);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIMPEZA PERIÓDICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Limpa dados expirados do estado
 * Deve ser chamado periodicamente
 */
export function cleanupExpiredData(): void {
  const now = Date.now();
  const memory = globalState.communicationMemory;
  
  // Remover tópicos bloqueados expirados
  memory.blockedTopics = memory.blockedTopics.filter(
    (t) => t.blockedUntil > now
  );
  
  // Remover mensagens antigas (mais de 1 hora)
  const oneHourAgo = now - 3600000;
  memory.sentMessages = memory.sentMessages.filter(
    (m) => m.sentAt > oneHourAgo
  );
  
  updateStateSection('communicationMemory', memory, 'cleanup');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DO SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

export const GlobalState = {
  get: getGlobalState,
  getSection: getStateSection,
  update: updateGlobalState,
  updateSection: updateStateSection,
  reset: resetGlobalState,
  initialize: initializeState,
  subscribe: subscribeToState,
  cleanup: cleanupExpiredData,
  
  // Queries
  isAdmin,
  isSilenced,
  isTopicBlocked,
  wasRecentlySent,
  getCurrentActivity,
  getUserRole,
  getSessionMetrics,
  
  // Mutations
  recordSentMessage,
  blockTopic,
  updateUserActivity,
  updateCurrentScreen,
  requestSilence,
  removeSilence,
  incrementSessionMetric,
  updateSystemHealth,
  recordSystemError,
};

export default GlobalState;

