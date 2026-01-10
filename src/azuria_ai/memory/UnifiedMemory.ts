/**
 * ══════════════════════════════════════════════════════════════════════════════
 * UNIFIED MEMORY SYSTEM - Sistema de Memória Unificado do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo implementa o sistema de memória central que:
 * - Persiste entre sessões (via Supabase)
 * - Aprende padrões do usuário
 * - Mantém contexto de interações
 * - Suporta recall semântico
 *
 * Arquitetura:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                        UNIFIED MEMORY SYSTEM                                │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  Short-Term Memory (STM)                                                    │
 * │  ├── Contexto atual (tela, ação, inputs)                                   │
 * │  ├── Últimas interações (últimos 5 min)                                    │
 * │  └── Estado emocional atual                                                │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  Working Memory (WM)                                                        │
 * │  ├── Sessão atual (calculações, fluxos)                                    │
 * │  ├── Decisões pendentes                                                     │
 * │  └── Padrões detectados na sessão                                          │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  Long-Term Memory (LTM) - Persistido no Supabase                           │
 * │  ├── Preferências aprendidas                                               │
 * │  ├── Padrões de comportamento                                              │
 * │  ├── Histórico de interações                                               │
 * │  └── Feedback acumulado                                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * @module azuria_ai/memory/UnifiedMemory
 */

import { generateSecureSessionId } from '@/utils/secureRandom';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS - MEMÓRIA DE CURTO PRAZO (STM)
// ═══════════════════════════════════════════════════════════════════════════════

/** Contexto atual do usuário */
export interface CurrentContext {
  /** Tela atual */
  screen: string;
  /** Última ação do usuário */
  lastAction: string | null;
  /** Timestamp da última ação */
  lastActionAt: number;
  /** Inputs do formulário atual */
  currentInputs: Record<string, unknown>;
  /** Estado emocional detectado */
  emotionalState: 'neutral' | 'frustrated' | 'confused' | 'engaged' | 'satisfied';
  /** Se o usuário está ocioso */
  isIdle: boolean;
  /** Tempo ocioso (ms) */
  idleTime: number;
}

/** Interação recente */
export interface RecentInteraction {
  /** ID da interação */
  id: string;
  /** Tipo */
  type: 'action' | 'suggestion' | 'alert' | 'calculation' | 'navigation';
  /** Descrição */
  description: string;
  /** Timestamp */
  timestamp: number;
  /** Resultado (se aplicável) */
  outcome?: 'accepted' | 'dismissed' | 'ignored' | 'completed' | 'error';
  /** Dados extras */
  data?: Record<string, unknown>;
}

/** Memória de curto prazo */
export interface ShortTermMemory {
  /** Contexto atual */
  context: CurrentContext;
  /** Últimas interações (máx 20) */
  recentInteractions: RecentInteraction[];
  /** Último insight mostrado */
  lastInsight: {
    id: string;
    topic: string;
    timestamp: number;
  } | null;
  /** Tópicos mencionados recentemente */
  recentTopics: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS - MEMÓRIA DE TRABALHO (WM)
// ═══════════════════════════════════════════════════════════════════════════════

/** Cálculo da sessão */
export interface SessionCalculation {
  /** ID do cálculo */
  id: string;
  /** Tipo (BDI, Taxa, Cenário, etc) */
  type: string;
  /** Inputs */
  inputs: Record<string, unknown>;
  /** Resultado */
  result: Record<string, unknown>;
  /** Timestamp */
  timestamp: number;
  /** Se foi exportado */
  exported: boolean;
}

/** Fluxo da sessão */
export interface SessionFlow {
  /** Nome do fluxo */
  name: string;
  /** Etapas completadas */
  completedSteps: string[];
  /** Etapa atual */
  currentStep: string;
  /** Progresso (0-100) */
  progress: number;
  /** Timestamp início */
  startedAt: number;
}

/** Padrão detectado */
export interface DetectedPattern {
  /** Tipo do padrão */
  type: 'repetition' | 'hesitation' | 'error' | 'preference' | 'workflow';
  /** Descrição */
  description: string;
  /** Confiança (0-1) */
  confidence: number;
  /** Vezes detectado */
  occurrences: number;
  /** Último detectado */
  lastDetectedAt: number;
  /** Dados do padrão */
  data?: Record<string, unknown>;
}

/** Memória de trabalho */
export interface WorkingMemory {
  /** ID da sessão */
  sessionId: string;
  /** Início da sessão */
  sessionStartedAt: number;
  /** Cálculos da sessão */
  calculations: SessionCalculation[];
  /** Fluxo atual */
  currentFlow: SessionFlow | null;
  /** Padrões detectados */
  patterns: DetectedPattern[];
  /** Sugestões pendentes */
  pendingSuggestions: string[];
  /** Contadores */
  counters: {
    suggestionsShown: number;
    suggestionsAccepted: number;
    suggestionsDismissed: number;
    calculationsCompleted: number;
    errorsEncountered: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS - MEMÓRIA DE LONGO PRAZO (LTM)
// ═══════════════════════════════════════════════════════════════════════════════

/** Preferência aprendida */
export interface LearnedPreference {
  /** Chave da preferência */
  key: string;
  /** Valor */
  value: unknown;
  /** Confiança (0-1) */
  confidence: number;
  /** Vezes observado */
  observations: number;
  /** Última atualização */
  updatedAt: number;
}

/** Padrão de comportamento */
export interface BehaviorPattern {
  /** ID do padrão */
  id: string;
  /** Tipo */
  type: string;
  /** Descrição */
  description: string;
  /** Frequência (vezes por sessão) */
  frequency: number;
  /** Contexto onde ocorre */
  context: string[];
  /** Confiança (0-1) */
  confidence: number;
  /** Total de ocorrências */
  totalOccurrences: number;
  /** Primeira vez detectado */
  firstDetectedAt: number;
  /** Última vez detectado */
  lastDetectedAt: number;
}

/** Histórico de interação resumido */
export interface InteractionHistory {
  /** Data */
  date: string;
  /** Total de sessões */
  sessions: number;
  /** Tempo total (ms) */
  totalTime: number;
  /** Cálculos completados */
  calculations: number;
  /** Taxa de aceitação de sugestões */
  suggestionAcceptanceRate: number;
  /** Tópicos mais acessados */
  topTopics: string[];
  /** Telas mais visitadas */
  topScreens: string[];
}

/** Feedback acumulado por tópico */
export interface AccumulatedFeedback {
  /** Tópico */
  topic: string;
  /** Total de feedbacks */
  totalFeedback: number;
  /** Feedback positivo */
  positive: number;
  /** Feedback negativo */
  negative: number;
  /** Score médio (0-5) */
  averageScore: number;
  /** Última atualização */
  lastFeedbackAt: number;
}

/** Memória de longo prazo */
export interface LongTermMemory {
  /** ID do usuário */
  userId: string;
  /** Preferências aprendidas */
  preferences: LearnedPreference[];
  /** Padrões de comportamento */
  behaviorPatterns: BehaviorPattern[];
  /** Histórico (últimos 30 dias) */
  history: InteractionHistory[];
  /** Feedback acumulado */
  feedback: AccumulatedFeedback[];
  /** Tópicos bloqueados */
  blockedTopics: Array<{
    topic: string;
    blockedAt: number;
    reason: string;
  }>;
  /** Última sincronização */
  lastSyncAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS - SISTEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════

/** Memória unificada completa */
export interface UnifiedMemory {
  /** Memória de curto prazo */
  stm: ShortTermMemory;
  /** Memória de trabalho */
  wm: WorkingMemory;
  /** Memória de longo prazo */
  ltm: LongTermMemory;
  /** Metadados */
  meta: {
    version: number;
    createdAt: number;
    lastUpdatedAt: number;
  };
}

/** Configuração do sistema de memória */
export interface MemoryConfig {
  /** ID do usuário */
  userId: string;
  /** Se deve sincronizar com Supabase */
  enableSync: boolean;
  /** Intervalo de sync (ms) */
  syncInterval: number;
  /** Máximo de interações recentes */
  maxRecentInteractions: number;
  /** Máximo de padrões na sessão */
  maxSessionPatterns: number;
  /** Modo debug */
  debug: boolean;
}

/** Callback de sincronização */
export type SyncCallback = (success: boolean, error?: string) => void;

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO DO SISTEMA
// ═══════════════════════════════════════════════════════════════════════════════

interface MemoryState {
  memory: UnifiedMemory | null;
  config: MemoryConfig;
  initialized: boolean;
  syncing: boolean;
  lastError: string | null;
  syncTimer: ReturnType<typeof setInterval> | null;
  syncCallbacks: Set<SyncCallback>;
}

const state: MemoryState = {
  memory: null,
  config: {
    userId: '',
    enableSync: false,
    syncInterval: 60000, // 1 minuto
    maxRecentInteractions: 20,
    maxSessionPatterns: 50,
    debug: false,
  },
  initialized: false,
  syncing: false,
  lastError: null,
  syncTimer: null,
  syncCallbacks: new Set(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE CRIAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialSTM(): ShortTermMemory {
  return {
    context: {
      screen: '/',
      lastAction: null,
      lastActionAt: Date.now(),
      currentInputs: {},
      emotionalState: 'neutral',
      isIdle: false,
      idleTime: 0,
    },
    recentInteractions: [],
    lastInsight: null,
    recentTopics: [],
  };
}

function createInitialWM(): WorkingMemory {
  return {
    sessionId: generateSecureSessionId(),
    sessionStartedAt: Date.now(),
    calculations: [],
    currentFlow: null,
    patterns: [],
    pendingSuggestions: [],
    counters: {
      suggestionsShown: 0,
      suggestionsAccepted: 0,
      suggestionsDismissed: 0,
      calculationsCompleted: 0,
      errorsEncountered: 0,
    },
  };
}

function createInitialLTM(userId: string): LongTermMemory {
  return {
    userId,
    preferences: [],
    behaviorPatterns: [],
    history: [],
    feedback: [],
    blockedTopics: [],
    lastSyncAt: Date.now(),
  };
}

function createInitialMemory(userId: string): UnifiedMemory {
  const now = Date.now();
  return {
    stm: createInitialSTM(),
    wm: createInitialWM(),
    ltm: createInitialLTM(userId),
    meta: {
      version: 1,
      createdAt: now,
      lastUpdatedAt: now,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema de memória
 */
export async function initMemory(config: Partial<MemoryConfig> = {}): Promise<{
  success: boolean;
  error?: string;
}> {
  if (state.initialized) {
    return { success: true };
  }

  // Mesclar config
  state.config = { ...state.config, ...config };

  if (!state.config.userId) {
    return { success: false, error: 'userId is required' };
  }

  // Criar memória inicial
  state.memory = createInitialMemory(state.config.userId);

  // Tentar carregar do Supabase se sync está habilitado
  if (state.config.enableSync) {
    try {
      const loaded = await loadFromSupabase();
      if (loaded) {
        // Mesclar LTM carregado com memória inicial
        state.memory.ltm = loaded;
        log('Loaded LTM from Supabase');
      }
    } catch (error) {
      warn('Failed to load from Supabase:', error);
    }

    // Iniciar sync periódico
    state.syncTimer = setInterval(() => {
      syncToSupabase();
    }, state.config.syncInterval);
  }

  state.initialized = true;
  log('UnifiedMemory initialized');

  return { success: true };
}

/**
 * Desliga o sistema de memória
 */
export async function shutdownMemory(): Promise<void> {
  if (!state.initialized) {
    return;
  }

  // Parar sync
  if (state.syncTimer) {
    clearInterval(state.syncTimer);
    state.syncTimer = null;
  }

  // Sync final
  if (state.config.enableSync) {
    await syncToSupabase();
  }

  state.memory = null;
  state.initialized = false;
  log('UnifiedMemory shutdown');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DE LEITURA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém a memória completa
 */
export function getMemory(): UnifiedMemory | null {
  return state.memory ? structuredClone(state.memory) : null;
}

/**
 * Obtém memória de curto prazo
 */
export function getSTM(): ShortTermMemory | null {
  return state.memory ? structuredClone(state.memory.stm) : null;
}

/**
 * Obtém memória de trabalho
 */
export function getWM(): WorkingMemory | null {
  return state.memory ? structuredClone(state.memory.wm) : null;
}

/**
 * Obtém memória de longo prazo
 */
export function getLTM(): LongTermMemory | null {
  return state.memory ? structuredClone(state.memory.ltm) : null;
}

/**
 * Obtém contexto atual
 */
export function getCurrentContext(): CurrentContext | null {
  return state.memory ? structuredClone(state.memory.stm.context) : null;
}

/**
 * Obtém interações recentes
 */
export function getRecentInteractions(limit?: number): RecentInteraction[] {
  if (!state.memory) {return [];}
  const interactions = state.memory.stm.recentInteractions;
  return limit ? interactions.slice(0, limit) : [...interactions];
}

/**
 * Obtém padrões detectados
 */
export function getDetectedPatterns(): DetectedPattern[] {
  if (!state.memory) {return [];}
  return [...state.memory.wm.patterns];
}

/**
 * Obtém preferência aprendida
 */
export function getLearnedPreference(key: string): LearnedPreference | null {
  if (!state.memory) {return null;}
  return state.memory.ltm.preferences.find((p) => p.key === key) ?? null;
}

/**
 * Verifica se tópico está bloqueado
 */
export function isTopicBlocked(topic: string): boolean {
  if (!state.memory) {return false;}
  return state.memory.ltm.blockedTopics.some((t) => t.topic === topic);
}

/**
 * Obtém contadores da sessão
 */
export function getSessionCounters(): WorkingMemory['counters'] | null {
  return state.memory ? { ...state.memory.wm.counters } : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DE ESCRITA - CURTO PRAZO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Atualiza contexto atual
 */
export function updateContext(updates: Partial<CurrentContext>): void {
  if (!state.memory) {return;}

  state.memory.stm.context = {
    ...state.memory.stm.context,
    ...updates,
  };
  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Registra interação recente
 */
export function recordInteraction(interaction: Omit<RecentInteraction, 'id' | 'timestamp'>): void {
  if (!state.memory) {return;}

  const newInteraction: RecentInteraction = {
    ...interaction,
    id: generateSecureSessionId(),
    timestamp: Date.now(),
  };

  state.memory.stm.recentInteractions.unshift(newInteraction);

  // Limitar tamanho
  if (state.memory.stm.recentInteractions.length > state.config.maxRecentInteractions) {
    state.memory.stm.recentInteractions = state.memory.stm.recentInteractions.slice(
      0,
      state.config.maxRecentInteractions
    );
  }

  // Atualizar tópicos recentes se tiver
  if (interaction.data?.topic && typeof interaction.data.topic === 'string') {
    if (!state.memory.stm.recentTopics.includes(interaction.data.topic)) {
      state.memory.stm.recentTopics.unshift(interaction.data.topic);
      if (state.memory.stm.recentTopics.length > 10) {
        state.memory.stm.recentTopics.pop();
      }
    }
  }

  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Registra último insight mostrado
 */
export function recordInsightShown(id: string, topic: string): void {
  if (!state.memory) {return;}

  state.memory.stm.lastInsight = {
    id,
    topic,
    timestamp: Date.now(),
  };

  state.memory.wm.counters.suggestionsShown++;
  state.memory.meta.lastUpdatedAt = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DE ESCRITA - MEMÓRIA DE TRABALHO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registra cálculo completado
 */
export function recordCalculation(calculation: Omit<SessionCalculation, 'id' | 'timestamp'>): void {
  if (!state.memory) {return;}

  const newCalc: SessionCalculation = {
    ...calculation,
    id: generateSecureSessionId(),
    timestamp: Date.now(),
  };

  state.memory.wm.calculations.push(newCalc);
  state.memory.wm.counters.calculationsCompleted++;
  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Atualiza fluxo atual
 */
export function updateCurrentFlow(flow: SessionFlow | null): void {
  if (!state.memory) {return;}
  state.memory.wm.currentFlow = flow;
  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Registra padrão detectado
 */
export function recordPattern(pattern: Omit<DetectedPattern, 'occurrences' | 'lastDetectedAt'>): void {
  if (!state.memory) {return;}

  // Verificar se padrão já existe
  const existing = state.memory.wm.patterns.find(
    (p) => p.type === pattern.type && p.description === pattern.description
  );

  if (existing) {
    existing.occurrences++;
    existing.lastDetectedAt = Date.now();
    existing.confidence = Math.min(1, existing.confidence + 0.1);
  } else {
    state.memory.wm.patterns.push({
      ...pattern,
      occurrences: 1,
      lastDetectedAt: Date.now(),
    });
  }

  // Limitar tamanho
  if (state.memory.wm.patterns.length > state.config.maxSessionPatterns) {
    // Remover padrões mais antigos com menor confiança
    state.memory.wm.patterns.sort((a, b) => b.confidence - a.confidence);
    state.memory.wm.patterns = state.memory.wm.patterns.slice(0, state.config.maxSessionPatterns);
  }

  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Incrementa contador
 */
export function incrementCounter(counter: keyof WorkingMemory['counters']): void {
  if (!state.memory) {return;}
  state.memory.wm.counters[counter]++;
  state.memory.meta.lastUpdatedAt = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DE ESCRITA - MEMÓRIA DE LONGO PRAZO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Atualiza preferência aprendida
 */
export function updatePreference(key: string, value: unknown, confidence: number = 0.5): void {
  if (!state.memory) {return;}

  const existing = state.memory.ltm.preferences.find((p) => p.key === key);

  if (existing) {
    existing.value = value;
    existing.confidence = Math.min(1, (existing.confidence + confidence) / 2);
    existing.observations++;
    existing.updatedAt = Date.now();
  } else {
    state.memory.ltm.preferences.push({
      key,
      value,
      confidence,
      observations: 1,
      updatedAt: Date.now(),
    });
  }

  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Registra padrão de comportamento (longo prazo)
 */
export function recordBehaviorPattern(
  pattern: Omit<BehaviorPattern, 'id' | 'totalOccurrences' | 'firstDetectedAt' | 'lastDetectedAt'>
): void {
  if (!state.memory) {return;}

  const existing = state.memory.ltm.behaviorPatterns.find(
    (p) => p.type === pattern.type && p.description === pattern.description
  );

  const now = Date.now();

  if (existing) {
    existing.totalOccurrences++;
    existing.lastDetectedAt = now;
    existing.confidence = Math.min(1, existing.confidence + 0.05);
    // Recalcular frequência
    const daysSinceFirst = (now - existing.firstDetectedAt) / (24 * 60 * 60 * 1000);
    existing.frequency = existing.totalOccurrences / Math.max(1, daysSinceFirst);
  } else {
    state.memory.ltm.behaviorPatterns.push({
      ...pattern,
      id: generateSecureSessionId(),
      totalOccurrences: 1,
      firstDetectedAt: now,
      lastDetectedAt: now,
    });
  }

  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Registra feedback
 */
export function recordFeedback(topic: string, isPositive: boolean, score?: number): void {
  if (!state.memory) {return;}

  const existing = state.memory.ltm.feedback.find((f) => f.topic === topic);

  if (existing) {
    existing.totalFeedback++;
    if (isPositive) {
      existing.positive++;
    } else {
      existing.negative++;
    }
    if (score !== undefined) {
      existing.averageScore =
        (existing.averageScore * (existing.totalFeedback - 1) + score) / existing.totalFeedback;
    }
    existing.lastFeedbackAt = Date.now();
  } else {
    state.memory.ltm.feedback.push({
      topic,
      totalFeedback: 1,
      positive: isPositive ? 1 : 0,
      negative: isPositive ? 0 : 1,
      averageScore: score ?? (isPositive ? 4 : 2),
      lastFeedbackAt: Date.now(),
    });
  }

  state.memory.meta.lastUpdatedAt = Date.now();
}

/**
 * Bloqueia um tópico
 */
export function blockTopic(topic: string, reason: string): void {
  if (!state.memory) {return;}

  if (!isTopicBlocked(topic)) {
    state.memory.ltm.blockedTopics.push({
      topic,
      blockedAt: Date.now(),
      reason,
    });
    state.memory.meta.lastUpdatedAt = Date.now();
  }
}

/**
 * Desbloqueia um tópico
 */
export function unblockTopic(topic: string): void {
  if (!state.memory) {return;}

  state.memory.ltm.blockedTopics = state.memory.ltm.blockedTopics.filter((t) => t.topic !== topic);
  state.memory.meta.lastUpdatedAt = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINCRONIZAÇÃO COM SUPABASE
// ═══════════════════════════════════════════════════════════════════════════════

// Helpers para loadFromSupabase

/** Converte preferências do Supabase para formato LTM */
function convertPreferencesToLTM(
  preferences: Record<string, unknown>, 
  ltm: LongTermMemory
): void {
  ltm.preferences = [
    { key: 'skillLevel', value: preferences.skill_level as string, confidence: 1, observations: 1, updatedAt: Date.now() },
    { key: 'suggestionFrequency', value: preferences.suggestion_frequency as string, confidence: 1, observations: 1, updatedAt: Date.now() },
    { key: 'explanationLevel', value: preferences.explanation_level as string, confidence: 1, observations: 1, updatedAt: Date.now() },
    { key: 'proactiveAssistance', value: preferences.proactive_assistance as boolean, confidence: 1, observations: 1, updatedAt: Date.now() },
  ];

  ltm.blockedTopics = ((preferences.blocked_topics || []) as string[]).map((topic: string) => ({
    topic,
    blockedAt: Date.now(),
    reason: 'restored_from_preferences',
  }));
}

/** Tipo para mensagem do Supabase */
interface SupabaseMessage {
  topic?: string;
  outcome?: string;
}

/** Analisa mensagens e extrai feedback para LTM */
function analyzeMessagesForFeedback(
  messages: SupabaseMessage[], 
  ltm: LongTermMemory
): void {
  const feedbackMap: Record<string, { positive: number; negative: number }> = {};

  for (const msg of messages) {
    if (!msg.topic || !msg.outcome) {continue;}
    
    if (!feedbackMap[msg.topic]) {
      feedbackMap[msg.topic] = { positive: 0, negative: 0 };
    }
    if (msg.outcome === 'accepted') {
      feedbackMap[msg.topic].positive++;
    } else if (msg.outcome === 'dismissed') {
      feedbackMap[msg.topic].negative++;
    }
  }

  for (const [topic, counts] of Object.entries(feedbackMap)) {
    ltm.feedback.push({
      topic,
      totalFeedback: counts.positive + counts.negative,
      positive: counts.positive,
      negative: counts.negative,
      averageScore: counts.positive / (counts.positive + counts.negative) * 5,
      lastFeedbackAt: Date.now(),
    });
  }
}
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Carrega LTM do Supabase
 */
async function loadFromSupabase(): Promise<LongTermMemory | null> {
  try {
    const { loadPreferences, loadRecentMessages, loadUserMetrics } = await import(
      '../consciousness/persistence/SupabasePersistence'
    );

    const [preferences, messages, metrics] = await Promise.all([
      loadPreferences(),
      loadRecentMessages(100),
      loadUserMetrics(),
    ]);

    if (!preferences && !messages.length && !metrics) {
      return null;
    }

    const ltm = createInitialLTM(state.config.userId);

    if (preferences) {
      convertPreferencesToLTM(preferences, ltm);
    }

    if (messages.length > 0) {
      analyzeMessagesForFeedback(messages as SupabaseMessage[], ltm);
    }

    ltm.lastSyncAt = Date.now();
    return ltm;
  } catch (error) {
    warn('Error loading from Supabase:', error);
    return null;
  }
}

/**
 * Sincroniza memória com Supabase
 */
async function syncToSupabase(): Promise<void> {
  if (!state.memory || !state.config.enableSync || state.syncing) {
    return;
  }

  state.syncing = true;

  try {
    const { savePreferences } = await import('../consciousness/persistence/SupabasePersistence');

    // Converter preferências para formato de persistência
    const prefs: Record<string, unknown> = {};
    for (const pref of state.memory.ltm.preferences) {
      prefs[pref.key] = pref.value;
    }

    const { savePreferences } = await import('../consciousness/persistence/SupabasePersistence');
    // Importar tipos necessários para o cast
    type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
    type SuggestionFrequency = 'high' | 'medium' | 'low' | 'minimal';
    type ExplanationLevel = 'detailed' | 'brief' | 'none';

    await savePreferences({
      skill_level: (prefs.skillLevel as SkillLevel) ?? ('beginner' as SkillLevel),
      suggestion_frequency: (prefs.suggestionFrequency as SuggestionFrequency) ?? ('medium' as SuggestionFrequency),
      explanation_level: (prefs.explanationLevel as ExplanationLevel) ?? ('detailed' as ExplanationLevel),
      proactive_assistance: (prefs.proactiveAssistance as boolean) ?? true,
      blocked_topics: state.memory.ltm.blockedTopics.map((t) => t.topic),
    });

    state.memory.ltm.lastSyncAt = Date.now();
    log('Synced to Supabase');

    // Notificar callbacks
    state.syncCallbacks.forEach((cb) => cb(true));
  } catch (error) {
    warn('Error syncing to Supabase:', error);
    state.lastError = String(error);

    // Notificar callbacks
    state.syncCallbacks.forEach((cb) => cb(false, String(error)));
  } finally {
    state.syncing = false;
  }
}

/**
 * Força sincronização imediata
 */
export async function forceSync(): Promise<boolean> {
  await syncToSupabase();
  return !state.lastError;
}

/**
 * Registra callback de sincronização
 */
export function onSync(callback: SyncCallback): () => void {
  state.syncCallbacks.add(callback);
  return () => state.syncCallbacks.delete(callback);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECALL SEMÂNTICO
// ═══════════════════════════════════════════════════════════════════════════════

/** Resultado de recall */
export interface RecallResult {
  /** Tipo do item */
  type: 'interaction' | 'pattern' | 'preference' | 'feedback';
  /** Relevância (0-1) */
  relevance: number;
  /** Dados do item */
  data: unknown;
}

/** Verifica se texto contém topic (case-insensitive) */
function matchesTopic(text: string, topic?: string): boolean {
  if (!topic) {return true;}
  return text.toLowerCase().includes(topic.toLowerCase());
}

/** Busca interações recentes */
function recallInteractions(
  memory: UnifiedMemory, 
  topic: string | undefined, 
  cutoff: number
): RecallResult[] {
  return memory.stm.recentInteractions
    .filter(i => i.timestamp >= cutoff && matchesTopic(i.description, topic))
    .map(i => ({ type: 'interaction' as const, relevance: 0.8, data: i }));
}

/** Busca padrões */
function recallPatterns(memory: UnifiedMemory, topic: string | undefined): RecallResult[] {
  return memory.wm.patterns
    .filter(p => matchesTopic(p.description, topic))
    .map(p => ({ type: 'pattern' as const, relevance: p.confidence, data: p }));
}

/** Busca preferências */
function recallPreferences(memory: UnifiedMemory, topic: string | undefined): RecallResult[] {
  return memory.ltm.preferences
    .filter(p => matchesTopic(p.key, topic))
    .map(p => ({ type: 'preference' as const, relevance: p.confidence, data: p }));
}

/** Busca feedback */
function recallFeedback(memory: UnifiedMemory, topic: string | undefined): RecallResult[] {
  return memory.ltm.feedback
    .filter(f => matchesTopic(f.topic, topic))
    .map(f => ({ type: 'feedback' as const, relevance: f.averageScore / 5, data: f }));
}

/**
 * Busca na memória por contexto semântico
 */
export function recall(query: {
  topic?: string;
  type?: string;
  timeWindow?: number;
  limit?: number;
}): RecallResult[] {
  if (!state.memory) {return [];}

  const { topic, type, timeWindow, limit = 10 } = query;
  const cutoff = timeWindow ? Date.now() - timeWindow : 0;
  const results: RecallResult[] = [];

  // Usar helpers para cada tipo de busca
  if (!type || type === 'interaction') {
    results.push(...recallInteractions(state.memory, topic, cutoff));
  }
  if (!type || type === 'pattern') {
    results.push(...recallPatterns(state.memory, topic));
  }
  if (!type || type === 'preference') {
    results.push(...recallPreferences(state.memory, topic));
  }
  if (!type || type === 'feedback') {
    results.push(...recallFeedback(state.memory, topic));
  }

  return results.toSorted((a, b) => b.relevance - a.relevance).slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function log(...args: unknown[]): void {
  if (state.config.debug) {
    // eslint-disable-next-line no-console
    console.log('[UnifiedMemory]', ...args);
  }
}

function warn(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  console.warn('[UnifiedMemory]', ...args);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * UnifiedMemory como namespace
 */
export const UnifiedMemory = {
  // Inicialização
  init: initMemory,
  shutdown: shutdownMemory,

  // Leitura
  getMemory,
  getSTM,
  getWM,
  getLTM,
  getCurrentContext,
  getRecentInteractions,
  getDetectedPatterns,
  getLearnedPreference,
  isTopicBlocked,
  getSessionCounters,

  // Escrita - STM
  updateContext,
  recordInteraction,
  recordInsightShown,

  // Escrita - WM
  recordCalculation,
  updateCurrentFlow,
  recordPattern,
  incrementCounter,

  // Escrita - LTM
  updatePreference,
  recordBehaviorPattern,
  recordFeedback,
  blockTopic,
  unblockTopic,

  // Sync
  forceSync,
  onSync,

  // Recall
  recall,
} as const;
