/**
 * ══════════════════════════════════════════════════════════════════════════════
 * TYPES - Tipos do Consciousness Core
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PAPÉIS E IDENTIDADE
// ═══════════════════════════════════════════════════════════════════════════════

/** Papel cognitivo do usuário no sistema */
export type CognitiveRole = 'ADMIN' | 'USER' | 'SYSTEM';

/** Nível de assinatura */
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

/** Nível de habilidade do usuário */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Frequência de sugestões preferida */
export type SuggestionFrequency = 'high' | 'medium' | 'low' | 'minimal';

/** Nível de explicação preferido */
export type ExplanationLevel = 'detailed' | 'brief' | 'none';

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO E ATIVIDADE
// ═══════════════════════════════════════════════════════════════════════════════

/** Fase do fluxo atual */
export type FlowPhase = 'início' | 'meio' | 'fim' | 'idle';

/** Estado de atividade do usuário */
export type UserActivityState = 
  | 'ativo' 
  | 'hesitando' 
  | 'calculando' 
  | 'preenchendo' 
  | 'revisando' 
  | 'idle'
  | 'erro';

/** Canal de destino para outputs */
export type OutputChannel = 'ADMIN' | 'USER' | 'SYSTEM' | 'SILENT';

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Prioridade de evento */
export type EventPriority = 'critical' | 'high' | 'medium' | 'low' | 'background';

/** Categorias de eventos */
export type EventCategory = 
  | 'calculation'      // Eventos de cálculo
  | 'navigation'       // Navegação do usuário
  | 'interaction'      // Interações de UI
  | 'insight'          // Insights gerados
  | 'alert'            // Alertas
  | 'governance'       // Governança/compliance
  | 'system'           // Sistema interno
  | 'ai'               // Eventos de IA
  | 'error';           // Erros

/** Evento normalizado para o Núcleo */
export interface NormalizedEvent {
  /** ID único do evento */
  id: string;
  /** Tipo original do evento */
  type: string;
  /** Categoria do evento */
  category: EventCategory;
  /** Payload do evento */
  payload: Record<string, unknown>;
  /** Timestamp de criação */
  timestamp: number;
  /** Fonte do evento */
  source: string;
  /** Prioridade calculada */
  priority: EventPriority;
  /** Papel alvo (quem deve receber) */
  targetRole: CognitiveRole;
  /** Metadados extras */
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECISÕES
// ═══════════════════════════════════════════════════════════════════════════════

/** Tipos de decisão que o Núcleo pode tomar */
export type DecisionType = 
  | 'emit'        // Emitir insight/alerta para UI
  | 'suggest'     // Sugerir ação ao usuário
  | 'execute'     // Executar ação automaticamente
  | 'schedule'    // Agendar para depois
  | 'escalate'    // Escalar para ADMIN
  | 'silence'     // Silenciar (não fazer nada)
  | 'delegate';   // Delegar para agente

/** Razões para silêncio */
export type SilenceReason = 
  | 'already_said'       // Já disse isso recentemente
  | 'topic_blocked'      // Tópico bloqueado pelo usuário
  | 'user_busy'          // Usuário ocupado (calculando, etc)
  | 'rate_limited'       // Rate limit atingido
  | 'low_relevance'      // Relevância muito baixa
  | 'silence_requested'  // Silêncio foi solicitado
  | 'context_changed';   // Contexto mudou, não faz mais sentido

// ═══════════════════════════════════════════════════════════════════════════════
// MENSAGENS E COMUNICAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/** Tipos de mensagem que o sistema pode enviar */
export type MessageType = 
  | 'insight'       // Insight informativo
  | 'suggestion'    // Sugestão de ação
  | 'warning'       // Alerta de atenção
  | 'error'         // Erro/problema
  | 'tip'           // Dica rápida
  | 'explanation'   // Explicação detalhada
  | 'confirmation'  // Confirmação de ação
  | 'celebration';  // Celebração/gamificação

/** Severidade de mensagem */
export type MessageSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/** Estrutura de uma mensagem de saída */
export interface OutputMessage {
  /** ID único da mensagem */
  id: string;
  /** Tipo da mensagem */
  type: MessageType;
  /** Severidade */
  severity: MessageSeverity;
  /** Título curto */
  title: string;
  /** Mensagem completa */
  message: string;
  /** Canal de destino */
  channel: OutputChannel;
  /** Ações disponíveis */
  actions?: MessageAction[];
  /** Contexto da mensagem */
  context: {
    screen: string;
    eventId: string;
    timestamp: number;
  };
  /** Hash semântico (para deduplicação) */
  semanticHash: string;
  /** TTL em ms (quando expira) */
  ttl: number;
  /** Se pode ser dispensada */
  dismissable: boolean;
}

/** Ação disponível em uma mensagem */
export interface MessageAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  handler: string;
  params?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINES E AGENTES
// ═══════════════════════════════════════════════════════════════════════════════

/** Resultado de análise de um engine interno */
export interface EngineAnalysis {
  /** Engine que realizou a análise */
  engine: string;
  /** Confiança na análise (0-1) */
  confidence: number;
  /** Resultado da análise */
  result: unknown;
  /** Recomendações */
  recommendations?: string[];
  /** Metadados */
  metadata?: Record<string, unknown>;
}

/** Solicitação para um agente */
export interface AgentRequest {
  /** ID da solicitação */
  requestId: string;
  /** Agente alvo */
  agent: string;
  /** Tarefa a executar */
  task: string;
  /** Contexto relevante */
  context: Record<string, unknown>;
  /** Prioridade */
  priority: EventPriority;
  /** Timeout em ms */
  timeout: number;
}

/** Resposta de um agente */
export interface AgentResponse {
  /** ID da solicitação original */
  requestId: string;
  /** Agente que respondeu */
  agent: string;
  /** Se foi bem sucedido */
  success: boolean;
  /** Resultado */
  result?: unknown;
  /** Erro se houver */
  error?: string;
  /** Tempo de execução em ms */
  duration: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/** Configuração do Consciousness Core */
export interface ConsciousnessConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Modo debug */
  debug: boolean;
  /** Configurações de rate limit */
  rateLimit: {
    /** Máximo de insights por minuto para USER */
    maxUserInsightsPerMinute: number;
    /** Máximo de insights por minuto para ADMIN */
    maxAdminInsightsPerMinute: number;
    /** Cooldown após dismiss (ms) */
    dismissCooldown: number;
  };
  /** Configurações de silêncio */
  silence: {
    /** Duração padrão de bloqueio de tópico (ms) */
    defaultTopicBlockDuration: number;
    /** Duração de silêncio durante digitação (ms) */
    typingSilenceDuration: number;
    /** Duração de silêncio após erro (ms) */
    errorSilenceDuration: number;
  };
  /** Configurações de memória */
  memory: {
    /** Máximo de mensagens no histórico */
    maxMessageHistory: number;
    /** Tempo para considerar mensagem como "recente" (ms) */
    recentMessageWindow: number;
    /** Tempo para expirar hash semântico (ms) */
    semanticHashTTL: number;
  };
  /** Configurações de IA */
  ai: {
    /** Se deve usar IA para análises */
    useAI: boolean;
    /** Modelo preferido */
    preferredModel: 'gemini' | 'local';
    /** Timeout para chamadas de IA (ms) */
    aiTimeout: number;
  };
}

/** Configuração padrão */
export const DEFAULT_CONSCIOUSNESS_CONFIG: ConsciousnessConfig = {
  enabled: true,
  debug: false,
  rateLimit: {
    maxUserInsightsPerMinute: 3,
    maxAdminInsightsPerMinute: 10,
    dismissCooldown: 30000, // 30s
  },
  silence: {
    defaultTopicBlockDuration: 300000, // 5 min
    typingSilenceDuration: 5000, // 5s
    errorSilenceDuration: 10000, // 10s
  },
  memory: {
    maxMessageHistory: 100,
    recentMessageWindow: 300000, // 5 min
    semanticHashTTL: 600000, // 10 min
  },
  ai: {
    useAI: true,
    preferredModel: 'gemini',
    aiTimeout: 10000, // 10s
  },
};

