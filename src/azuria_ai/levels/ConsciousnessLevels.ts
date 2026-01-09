/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CONSCIOUSNESS LEVELS - Níveis de Consciência do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo implementa a separação entre os dois níveis de consciência:
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                    INTELIGÊNCIA ESTRATÉGICA (ADMIN)                        │
 * │                                                                             │
 * │  "Modo Deus" - Visão completa do sistema                                   │
 * │  ├── Métricas de uso e comportamento                                       │
 * │  ├── Padrões de erro e fricção                                             │
 * │  ├── Analytics e insights de negócio                                       │
 * │  ├── Decisões de produto e evolução                                        │
 * │  └── Acesso total a todos os engines                                       │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │                    INTELIGÊNCIA OPERACIONAL (USER)                         │
 * │                                                                             │
 * │  "Co-Pilot" - Assistência contextual                                       │
 * │  ├── Sugestões baseadas em contexto                                        │
 * │  ├── Tutoriais e explicações                                               │
 * │  ├── Validações e alertas                                                  │
 * │  ├── Personalização de experiência                                         │
 * │  └── Acesso limitado ao necessário                                         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * @module azuria_ai/levels/ConsciousnessLevels
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Papel cognitivo */
export type CognitiveRole = 'ADMIN' | 'USER' | 'SYSTEM';

/** Categoria de funcionalidade */
export type FeatureCategory =
  | 'analytics'         // Métricas e analytics
  | 'insights'          // Insights de negócio
  | 'suggestions'       // Sugestões ao usuário
  | 'tutorials'         // Tutoriais e onboarding
  | 'validations'       // Validações de dados
  | 'alerts'            // Alertas e notificações
  | 'governance'        // Governança e compliance
  | 'personalization'   // Personalização
  | 'predictions'       // Predições
  | 'memory'            // Memória e histórico
  | 'evolution'         // Auto-evolução do sistema
  | 'debugging'         // Debugging e logs
  | 'system';           // Sistema interno

/** Tier de usuário */
export type UserTier = 'FREE' | 'PRO' | 'ENTERPRISE';

/** Permissão de acesso */
export interface FeaturePermission {
  /** Categoria da funcionalidade */
  category: FeatureCategory;
  /** Se ADMIN pode acessar */
  adminAccess: boolean;
  /** Se USER pode acessar */
  userAccess: boolean;
  /** Se requer tier específico para USER */
  requiredTier?: UserTier;
  /** Descrição */
  description: string;
}

/** Configuração de nível de consciência */
export interface LevelConfig {
  /** Papel */
  role: CognitiveRole;
  /** Nome do nível */
  name: string;
  /** Descrição */
  description: string;
  /** Funcionalidades disponíveis */
  features: FeatureCategory[];
  /** Engines permitidos */
  allowedEngines: string[];
  /** Tipos de eventos que pode receber */
  allowedEventTypes: string[];
  /** Limite de sugestões por sessão */
  suggestionLimit?: number;
  /** Pode ver logs detalhados */
  canViewLogs: boolean;
  /** Pode ver métricas do sistema */
  canViewMetrics: boolean;
  /** Pode modificar configurações */
  canModifyConfig: boolean;
}

/** Contexto do nível atual */
export interface LevelContext {
  /** Papel atual */
  role: CognitiveRole;
  /** Config do nível */
  config: LevelConfig;
  /** Se está ativo */
  active: boolean;
  /** Quando foi ativado */
  activatedAt: number;
  /** Estatísticas da sessão */
  stats: {
    suggestionsShown: number;
    insightsGenerated: number;
    actionsExecuted: number;
    eventsProcessed: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÕES DOS NÍVEIS
// ═══════════════════════════════════════════════════════════════════════════════

/** Configuração do nível ADMIN (Inteligência Estratégica) */
export const ADMIN_LEVEL_CONFIG: LevelConfig = {
  role: 'ADMIN',
  name: 'Inteligência Estratégica',
  description: 'Visão completa do sistema - Modo Deus para o criador',
  features: [
    'analytics',
    'insights',
    'suggestions',
    'tutorials',
    'validations',
    'alerts',
    'governance',
    'personalization',
    'predictions',
    'memory',
    'evolution',
    'debugging',
    'system',
  ],
  allowedEngines: [
    // Todos os engines
    '*',
  ],
  allowedEventTypes: [
    // Todos os eventos
    '*',
  ],
  suggestionLimit: undefined, // Sem limite
  canViewLogs: true,
  canViewMetrics: true,
  canModifyConfig: true,
};

/** Configuração do nível USER (Inteligência Operacional) */
export const USER_LEVEL_CONFIG: LevelConfig = {
  role: 'USER',
  name: 'Co-Pilot Operacional',
  description: 'Assistência contextual inteligente para o usuário',
  features: [
    'suggestions',
    'tutorials',
    'validations',
    'alerts',
    'personalization',
    'predictions',
    'memory',
  ],
  allowedEngines: [
    // Engines operacionais apenas
    'operationalAI',
    'userIntent',
    'suggestion',
    'tutorial',
    'validation',
    'explanation',
    'bidding',
    'personalization',
    'emotion',
  ],
  allowedEventTypes: [
    // Eventos para o usuário
    'user:*',
    'calc:*',
    'ui:*',
    'ai:suggestion',
    'ai:insight',
    'ai:tutorial',
    'ai:validation',
    'ai:alert',
  ],
  suggestionLimit: 50, // Por sessão
  canViewLogs: false,
  canViewMetrics: false,
  canModifyConfig: false,
};

/** Configuração do nível SYSTEM (interno) */
export const SYSTEM_LEVEL_CONFIG: LevelConfig = {
  role: 'SYSTEM',
  name: 'Sistema Interno',
  description: 'Processamento interno do sistema',
  features: ['system'],
  allowedEngines: ['*'],
  allowedEventTypes: ['*'],
  canViewLogs: true,
  canViewMetrics: true,
  canModifyConfig: true,
};

/** Mapa de permissões por categoria */
export const FEATURE_PERMISSIONS: FeaturePermission[] = [
  {
    category: 'analytics',
    adminAccess: true,
    userAccess: false,
    description: 'Métricas de uso, comportamento e performance',
  },
  {
    category: 'insights',
    adminAccess: true,
    userAccess: false,
    description: 'Insights de negócio e padrões de uso',
  },
  {
    category: 'suggestions',
    adminAccess: true,
    userAccess: true,
    description: 'Sugestões contextuais para o usuário',
  },
  {
    category: 'tutorials',
    adminAccess: true,
    userAccess: true,
    description: 'Tutoriais e guias de uso',
  },
  {
    category: 'validations',
    adminAccess: true,
    userAccess: true,
    description: 'Validação de dados e cálculos',
  },
  {
    category: 'alerts',
    adminAccess: true,
    userAccess: true,
    requiredTier: 'FREE',
    description: 'Alertas e notificações',
  },
  {
    category: 'governance',
    adminAccess: true,
    userAccess: false,
    description: 'Governança, compliance e auditoria',
  },
  {
    category: 'personalization',
    adminAccess: true,
    userAccess: true,
    requiredTier: 'PRO',
    description: 'Personalização de experiência',
  },
  {
    category: 'predictions',
    adminAccess: true,
    userAccess: true,
    requiredTier: 'PRO',
    description: 'Predições e insights preditivos',
  },
  {
    category: 'memory',
    adminAccess: true,
    userAccess: true,
    requiredTier: 'PRO',
    description: 'Memória de contexto e histórico',
  },
  {
    category: 'evolution',
    adminAccess: true,
    userAccess: false,
    description: 'Auto-evolução e melhoria do sistema',
  },
  {
    category: 'debugging',
    adminAccess: true,
    userAccess: false,
    description: 'Logs detalhados e debugging',
  },
  {
    category: 'system',
    adminAccess: true,
    userAccess: false,
    description: 'Operações internas do sistema',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO DO NÍVEL
// ═══════════════════════════════════════════════════════════════════════════════

interface LevelState {
  currentLevel: LevelContext | null;
  initialized: boolean;
  debug: boolean;
}

const state: LevelState = {
  currentLevel: null,
  initialized: false,
  debug: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema de níveis
 */
export function initLevels(config: { debug?: boolean } = {}): void {
  if (state.initialized) {
    return;
  }

  state.debug = config.debug ?? false;
  state.initialized = true;

  log('ConsciousnessLevels initialized');
}

/**
 * Desliga o sistema de níveis
 */
export function shutdownLevels(): void {
  state.currentLevel = null;
  state.initialized = false;
  log('ConsciousnessLevels shutdown');
}

/**
 * Ativa um nível de consciência
 */
export function activateLevel(role: CognitiveRole): LevelContext {
  const config = getLevelConfig(role);

  const context: LevelContext = {
    role,
    config,
    active: true,
    activatedAt: Date.now(),
    stats: {
      suggestionsShown: 0,
      insightsGenerated: 0,
      actionsExecuted: 0,
      eventsProcessed: 0,
    },
  };

  state.currentLevel = context;
  log(`Level activated: ${role} (${config.name})`);

  return context;
}

/**
 * Desativa o nível atual
 */
export function deactivateLevel(): void {
  if (state.currentLevel) {
    log(`Level deactivated: ${state.currentLevel.role}`);
    state.currentLevel = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE CONSULTA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém a configuração de um nível
 */
export function getLevelConfig(role: CognitiveRole): LevelConfig {
  switch (role) {
    case 'ADMIN':
      return ADMIN_LEVEL_CONFIG;
    case 'USER':
      return USER_LEVEL_CONFIG;
    case 'SYSTEM':
      return SYSTEM_LEVEL_CONFIG;
    default:
      return USER_LEVEL_CONFIG;
  }
}

/**
 * Obtém o contexto do nível atual
 */
export function getCurrentLevel(): LevelContext | null {
  return state.currentLevel;
}

/**
 * Verifica se um papel tem acesso a uma funcionalidade
 */
export function hasFeatureAccess(
  role: CognitiveRole,
  category: FeatureCategory,
  tier?: UserTier
): boolean {
  const permission = FEATURE_PERMISSIONS.find((p) => p.category === category);

  if (!permission) {
    return false;
  }

  if (role === 'ADMIN' || role === 'SYSTEM') {
    return permission.adminAccess;
  }

  if (role === 'USER') {
    if (!permission.userAccess) {
      return false;
    }

    // Verificar tier se necessário
    if (permission.requiredTier && tier) {
      const tierOrder: Record<string, number> = {
        FREE: 0,
        PRO: 1,
        ENTERPRISE: 2,
      };
      return tierOrder[tier] >= tierOrder[permission.requiredTier];
    }

    return true;
  }

  return false;
}

/**
 * Verifica se um papel pode usar um engine
 */
export function canUseEngine(role: CognitiveRole, engineId: string): boolean {
  const config = getLevelConfig(role);

  // Wildcard permite todos
  if (config.allowedEngines.includes('*')) {
    return true;
  }

  return config.allowedEngines.includes(engineId);
}

/**
 * Verifica se um papel pode receber um tipo de evento
 */
export function canReceiveEvent(role: CognitiveRole, eventType: string): boolean {
  const config = getLevelConfig(role);

  // Wildcard permite todos
  if (config.allowedEventTypes.includes('*')) {
    return true;
  }

  // Verificar match exato ou com wildcard
  return config.allowedEventTypes.some((pattern) => {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return eventType.startsWith(prefix);
    }
    return pattern === eventType;
  });
}

/**
 * Verifica se atingiu o limite de sugestões
 */
export function hasReachedSuggestionLimit(): boolean {
  if (!state.currentLevel) {
    return false;
  }

  const limit = state.currentLevel.config.suggestionLimit;
  if (limit === undefined) {
    return false;
  }

  return state.currentLevel.stats.suggestionsShown >= limit;
}

/**
 * Filtra engines disponíveis para o papel atual
 */
export function filterEnginesForRole(
  engines: string[],
  role: CognitiveRole
): string[] {
  return engines.filter((engineId) => canUseEngine(role, engineId));
}

/**
 * Filtra eventos disponíveis para o papel atual
 */
export function filterEventsForRole(
  eventTypes: string[],
  role: CognitiveRole
): string[] {
  return eventTypes.filter((eventType) => canReceiveEvent(role, eventType));
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE ATUALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registra uma sugestão mostrada
 */
export function recordSuggestionShown(): void {
  if (state.currentLevel) {
    state.currentLevel.stats.suggestionsShown++;
  }
}

/**
 * Registra um insight gerado
 */
export function recordInsightGenerated(): void {
  if (state.currentLevel) {
    state.currentLevel.stats.insightsGenerated++;
  }
}

/**
 * Registra uma ação executada
 */
export function recordActionExecuted(): void {
  if (state.currentLevel) {
    state.currentLevel.stats.actionsExecuted++;
  }
}

/**
 * Registra um evento processado
 */
export function recordEventProcessed(): void {
  if (state.currentLevel) {
    state.currentLevel.stats.eventsProcessed++;
  }
}

/**
 * Obtém estatísticas do nível atual
 */
export function getLevelStats(): LevelContext['stats'] | null {
  return state.currentLevel?.stats ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE DE DECISÃO
// ═══════════════════════════════════════════════════════════════════════════════

/** Resultado de verificação de permissão */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredTier?: UserTier;
}

/**
 * Verifica se uma ação é permitida para o nível atual
 */
export function checkActionPermission(
  action: {
    type: 'emit' | 'execute' | 'query';
    category?: FeatureCategory;
    engineId?: string;
    eventType?: string;
  },
  userTier?: UserTier
): PermissionCheckResult {
  if (!state.currentLevel) {
    return { allowed: false, reason: 'no_active_level' };
  }

  const { role } = state.currentLevel;

  // Verificar categoria se fornecida
  if (action.category) {
    if (!hasFeatureAccess(role, action.category, userTier)) {
      const permission = FEATURE_PERMISSIONS.find((p) => p.category === action.category);
      return {
        allowed: false,
        reason: 'feature_not_allowed',
        requiredTier: permission?.requiredTier,
      };
    }
  }

  // Verificar engine se fornecido
  if (action.engineId) {
    if (!canUseEngine(role, action.engineId)) {
      return { allowed: false, reason: 'engine_not_allowed' };
    }
  }

  // Verificar evento se fornecido
  if (action.eventType) {
    if (!canReceiveEvent(role, action.eventType)) {
      return { allowed: false, reason: 'event_not_allowed' };
    }
  }

  // Verificar limite de sugestões para emit
  if (action.type === 'emit' && action.category === 'suggestions') {
    if (hasReachedSuggestionLimit()) {
      return { allowed: false, reason: 'suggestion_limit_reached' };
    }
  }

  return { allowed: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function log(...args: unknown[]): void {
  if (state.debug) {
    // eslint-disable-next-line no-console
    console.log('[ConsciousnessLevels]', ...args);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ConsciousnessLevels como namespace
 */
export const ConsciousnessLevels = {
  // Inicialização
  init: initLevels,
  shutdown: shutdownLevels,
  activate: activateLevel,
  deactivate: deactivateLevel,

  // Consulta
  getLevelConfig,
  getCurrentLevel,
  hasFeatureAccess,
  canUseEngine,
  canReceiveEvent,
  hasReachedSuggestionLimit,
  filterEnginesForRole,
  filterEventsForRole,
  checkActionPermission,
  getLevelStats,

  // Atualização
  recordSuggestionShown,
  recordInsightGenerated,
  recordActionExecuted,
  recordEventProcessed,

  // Constantes
  ADMIN_CONFIG: ADMIN_LEVEL_CONFIG,
  USER_CONFIG: USER_LEVEL_CONFIG,
  SYSTEM_CONFIG: SYSTEM_LEVEL_CONFIG,
  PERMISSIONS: FEATURE_PERMISSIONS,
} as const;
