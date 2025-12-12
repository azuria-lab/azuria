/**
 * Operational Types - Tipos para Inteligência Operacional (Co-Piloto)
 * 
 * Define todas as interfaces e tipos necessários para o Co-Piloto
 * que assiste o usuário final em tempo real.
 */

// ============================================================================
// User Context
// ============================================================================

/**
 * Nível de habilidade detectado do usuário
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Estado atual do usuário na sessão
 */
export type UserActivityState = 
  | 'idle'           // Parado, sem atividade
  | 'browsing'       // Navegando entre páginas
  | 'calculating'    // Fazendo cálculos
  | 'filling-form'   // Preenchendo formulário
  | 'reviewing'      // Revisando resultados
  | 'hesitating'     // Parado em um campo/decisão
  | 'error-state';   // Encontrou um erro

/**
 * Contexto completo do usuário para personalização
 */
export interface UserContext {
  /** ID do usuário (se autenticado) */
  userId?: string;
  /** ID da sessão atual */
  sessionId: string;
  /** Nível de habilidade detectado */
  skillLevel: SkillLevel;
  /** Estado atual de atividade */
  activityState: UserActivityState;
  /** Tela/rota atual */
  currentScreen: string;
  /** Timestamp da última ação */
  lastActionAt: number;
  /** Tipo da última ação */
  lastActionType?: string;
  /** Tempo total na sessão (ms) */
  sessionDuration: number;
  /** Tempo na tela atual (ms) */
  screenDuration: number;
  /** Histórico de telas visitadas (últimas 10) */
  screenHistory: string[];
  /** Número de cálculos feitos na sessão */
  calculationsCount: number;
  /** Número de erros encontrados na sessão */
  errorsCount: number;
  /** Preferências detectadas */
  preferences: UserPreferences;
  /** Dados adicionais do contexto atual */
  contextData?: Record<string, unknown>;
}

/**
 * Preferências detectadas do usuário
 */
export interface UserPreferences {
  /** Prefere explicações detalhadas ou resumidas */
  explanationLevel: 'brief' | 'detailed';
  /** Calculadora mais usada */
  preferredCalculator?: 'simple' | 'advanced' | 'bid' | 'tax';
  /** Horário típico de uso */
  typicalUsageTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  /** Aceita sugestões proativas */
  acceptsProactiveSuggestions: boolean;
  /** Frequência ideal de sugestões */
  suggestionFrequency: 'low' | 'medium' | 'high';
}

/**
 * Sessão do usuário
 */
export interface UserSession {
  id: string;
  userId?: string;
  startedAt: number;
  lastActivityAt: number;
  context: UserContext;
  suggestionsShown: number;
  suggestionsAccepted: number;
  suggestionsDismissed: number;
}

// ============================================================================
// Suggestions (Sugestões do Co-Piloto)
// ============================================================================

/**
 * Tipo de sugestão
 */
export type SuggestionType =
  | 'hint'           // Dica rápida
  | 'explanation'    // Explicação de cálculo/conceito
  | 'warning'        // Alerta sobre risco
  | 'opportunity'    // Oportunidade identificada
  | 'correction'     // Correção de erro
  | 'optimization'   // Sugestão de otimização
  | 'tutorial'       // Passo de tutorial
  | 'proactive';     // Assistência proativa

/**
 * Prioridade da sugestão
 */
export type SuggestionPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Categoria da sugestão
 */
export type SuggestionCategory =
  | 'calculation'    // Relacionado a cálculos
  | 'pricing'        // Relacionado a preços
  | 'tax'            // Relacionado a impostos
  | 'bidding'        // Relacionado a licitações
  | 'navigation'     // Ajuda de navegação
  | 'general';       // Geral

/**
 * Ação sugerida ao usuário
 */
export interface SuggestedAction {
  /** Identificador da ação */
  id: string;
  /** Label do botão */
  label: string;
  /** Tipo de ação */
  type: 'primary' | 'secondary' | 'dismiss';
  /** Dados a serem enviados se ação executada */
  data?: Record<string, unknown>;
}

/**
 * Sugestão completa do Co-Piloto
 */
export interface Suggestion {
  /** ID único da sugestão */
  id: string;
  /** Tipo da sugestão */
  type: SuggestionType;
  /** Prioridade */
  priority: SuggestionPriority;
  /** Categoria */
  category: SuggestionCategory;
  /** Título curto */
  title: string;
  /** Mensagem principal */
  message: string;
  /** Explicação detalhada (opcional) */
  details?: string;
  /** Ações sugeridas */
  actions?: SuggestedAction[];
  /** Contexto que gerou a sugestão */
  context?: {
    screen?: string;
    trigger?: string;
    data?: Record<string, unknown>;
  };
  /** Metadados */
  metadata: {
    createdAt: number;
    expiresAt?: number;
    source: string;
    confidence: number;
  };
  /** Estado da sugestão */
  status: 'pending' | 'shown' | 'accepted' | 'dismissed' | 'expired';
}

/**
 * Configuração para criação de sugestão
 */
export interface CreateSuggestionInput {
  type: SuggestionType;
  priority?: SuggestionPriority;
  category: SuggestionCategory;
  title: string;
  message: string;
  details?: string;
  actions?: Omit<SuggestedAction, 'id'>[];
  context?: Suggestion['context'];
  expiresInMs?: number;
  confidence?: number;
}

// ============================================================================
// Co-Piloto State
// ============================================================================

/**
 * Estado do Co-Piloto
 */
export interface CoPilotState {
  /** Se o painel está aberto */
  isOpen: boolean;
  /** Se está carregando */
  isLoading: boolean;
  /** Sugestões ativas */
  suggestions: Suggestion[];
  /** Sugestão em destaque */
  activeSuggestion: Suggestion | null;
  /** Contexto atual do usuário */
  userContext: UserContext | null;
  /** Configurações */
  config: CoPilotConfig;
  /** Última atualização */
  lastUpdatedAt: number;
}

/**
 * Configuração do Co-Piloto
 */
export interface CoPilotConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Máximo de sugestões visíveis */
  maxVisibleSuggestions: number;
  /** Intervalo mínimo entre sugestões (ms) */
  minSuggestionInterval: number;
  /** Se mostra sugestões proativas */
  showProactiveSuggestions: boolean;
  /** Nível de detalhe das explicações */
  explanationLevel: 'brief' | 'detailed';
  /** Sons habilitados */
  soundEnabled: boolean;
  /** Posição do widget */
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Configuração padrão do Co-Piloto
 */
export const DEFAULT_COPILOT_CONFIG: CoPilotConfig = {
  enabled: true,
  maxVisibleSuggestions: 5,
  minSuggestionInterval: 30000, // 30 segundos
  showProactiveSuggestions: true,
  explanationLevel: 'brief',
  soundEnabled: false,
  position: 'bottom-right',
};

// ============================================================================
// Feedback
// ============================================================================

/**
 * Tipo de feedback do usuário
 */
export type FeedbackType = 'helpful' | 'not-helpful' | 'incorrect' | 'too-frequent' | 'other';

/**
 * Feedback sobre uma sugestão
 */
export interface SuggestionFeedback {
  /** ID da sugestão */
  suggestionId: string;
  /** Tipo de feedback */
  type: FeedbackType;
  /** Comentário opcional */
  comment?: string;
  /** Contexto no momento do feedback */
  context?: {
    screen: string;
    timeSinceShown: number;
    actionTaken?: string;
  };
  /** Timestamp */
  createdAt: number;
}

// ============================================================================
// Throttling
// ============================================================================

/**
 * Regras de throttling para sugestões
 */
export interface ThrottleRules {
  /** Máximo de sugestões por minuto */
  maxPerMinute: number;
  /** Máximo de sugestões do mesmo tipo por hora */
  maxSameTypePerHour: number;
  /** Cooldown após dismiss (ms) */
  dismissCooldown: number;
  /** Silenciar durante digitação */
  silenceWhileTyping: boolean;
  /** Silenciar após erro */
  silenceAfterError: boolean;
  /** Duração do silêncio após erro (ms) */
  errorSilenceDuration: number;
}

/**
 * Regras padrão de throttling
 */
export const DEFAULT_THROTTLE_RULES: ThrottleRules = {
  maxPerMinute: 2,
  maxSameTypePerHour: 5,
  dismissCooldown: 60000, // 1 minuto
  silenceWhileTyping: true,
  silenceAfterError: true,
  errorSilenceDuration: 10000, // 10 segundos
};

// ============================================================================
// Analytics
// ============================================================================

/**
 * Métricas do Co-Piloto
 */
export interface CoPilotMetrics {
  /** Total de sugestões geradas */
  totalSuggestions: number;
  /** Total de sugestões mostradas */
  totalShown: number;
  /** Total de sugestões aceitas */
  totalAccepted: number;
  /** Total de sugestões dispensadas */
  totalDismissed: number;
  /** Total de sugestões expiradas */
  totalExpired: number;
  /** Taxa de aceitação (%) */
  acceptanceRate: number;
  /** Tempo médio até ação (ms) */
  avgTimeToAction: number;
  /** Sugestões por tipo */
  byType: Record<SuggestionType, number>;
  /** Aceitação por tipo */
  acceptanceByType: Record<SuggestionType, number>;
}

// ============================================================================
// Events (Payloads específicos para canal user:*)
// ============================================================================

/**
 * Payload para evento user:suggestion
 */
export interface UserSuggestionPayload {
  suggestion: Suggestion;
  userContext: UserContext;
}

/**
 * Payload para evento user:context-updated
 */
export interface UserContextUpdatedPayload {
  previousContext: Partial<UserContext>;
  currentContext: UserContext;
  changes: string[];
}

/**
 * Payload para evento user:feedback-requested
 */
export interface UserFeedbackRequestedPayload {
  suggestionId: string;
  reason: string;
}

/**
 * Payload para evento user:skill-level-detected
 */
export interface UserSkillLevelPayload {
  previousLevel?: SkillLevel;
  currentLevel: SkillLevel;
  confidence: number;
  indicators: string[];
}

// ============================================================================
// Alias Types
// ============================================================================

/**
 * Alias para Suggestion usado pelo ModeDeusOrchestrator
 * Mantém compatibilidade com o orquestrador
 */
export type UserSuggestion = Suggestion;
