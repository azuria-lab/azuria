/**
 * @fileoverview Manifesto do Modo Deus - Definição de Níveis de Evolução
 *
 * Este manifesto define os níveis de evolução da IA Azuria, separando:
 * - Níveis 1-40: Inteligência ESTRATÉGICA (Admin/Criador)
 * - Níveis 41-50: Inteligência OPERACIONAL (Usuário/Co-Piloto)
 *
 * @module azuria_ai/manifest
 */

// ============================================================
// TIPOS
// ============================================================

/**
 * Domínio de atuação do nível
 */
export type EvolutionDomain =
  | 'strategic' // Admin/Criador - tomada de decisão
  | 'operational'; // Usuário - assistência contextual

/**
 * Categoria funcional do nível
 */
export type EvolutionCategory =
  | 'perception' // Coleta de dados
  | 'analysis' // Processamento de dados
  | 'suggestion' // Geração de insights
  | 'action' // Execução de ações
  | 'learning' // Aprendizado contínuo
  | 'governance' // Controle e políticas
  | 'ux'; // Experiência do usuário

/**
 * Definição de um nível de evolução
 */
export interface EvolutionLevel {
  /** Número do nível (1-50) */
  level: number;

  /** Nome do nível */
  name: string;

  /** Descrição detalhada */
  description: string;

  /** Domínio: estratégico ou operacional */
  domain: EvolutionDomain;

  /** Categoria funcional */
  category: EvolutionCategory;

  /** Capacidades habilitadas neste nível */
  capabilities: string[];

  /** Dependências (níveis anteriores necessários) */
  dependencies: number[];

  /** Se está implementado */
  implemented: boolean;

  /** Arquivo/módulo principal */
  module?: string;
}

// ============================================================
// NÍVEIS ESTRATÉGICOS (1-40) - ADMIN/CRIADOR
// ============================================================

const STRATEGIC_LEVELS: EvolutionLevel[] = [
  // Percepção (1-10)
  {
    level: 1,
    name: 'BasicPerception',
    description: 'Coleta básica de eventos do sistema',
    domain: 'strategic',
    category: 'perception',
    capabilities: ['event_collection', 'basic_logging'],
    dependencies: [],
    implemented: true,
    module: 'core/eventBus.ts',
  },
  {
    level: 2,
    name: 'MetricsCollection',
    description: 'Coleta de métricas de uso e performance',
    domain: 'strategic',
    category: 'perception',
    capabilities: ['metrics_tracking', 'usage_analytics'],
    dependencies: [1],
    implemented: true,
    module: 'engines/PerceptionEngine.ts',
  },
  {
    level: 3,
    name: 'UserBehavior',
    description: 'Rastreamento de comportamento de usuários',
    domain: 'strategic',
    category: 'perception',
    capabilities: ['behavior_tracking', 'session_analysis'],
    dependencies: [2],
    implemented: true,
    module: 'context/ContextEngine.ts',
  },
  {
    level: 4,
    name: 'BusinessMetrics',
    description: 'Métricas de negócio e conversão',
    domain: 'strategic',
    category: 'perception',
    capabilities: ['conversion_tracking', 'revenue_metrics'],
    dependencies: [3],
    implemented: true,
    module: 'engines/PerceptionEngine.ts',
  },
  {
    level: 5,
    name: 'AnomalyDetection',
    description: 'Detecção de anomalias em tempo real',
    domain: 'strategic',
    category: 'perception',
    capabilities: ['anomaly_detection', 'threshold_alerts'],
    dependencies: [4],
    implemented: true,
    module: 'engines/PerceptionEngine.ts',
  },

  // Análise (11-20)
  {
    level: 11,
    name: 'BasicAnalysis',
    description: 'Análise básica de dados coletados',
    domain: 'strategic',
    category: 'analysis',
    capabilities: ['data_aggregation', 'basic_statistics'],
    dependencies: [5],
    implemented: true,
    module: 'engines/AnalysisEngine.ts',
  },
  {
    level: 12,
    name: 'TrendAnalysis',
    description: 'Análise de tendências temporais',
    domain: 'strategic',
    category: 'analysis',
    capabilities: ['trend_detection', 'time_series'],
    dependencies: [11],
    implemented: true,
    module: 'engines/AnalysisEngine.ts',
  },
  {
    level: 13,
    name: 'PredictiveAnalysis',
    description: 'Análise preditiva de métricas',
    domain: 'strategic',
    category: 'analysis',
    capabilities: ['prediction', 'forecasting'],
    dependencies: [12],
    implemented: true,
    module: 'engines/AnalysisEngine.ts',
  },
  {
    level: 14,
    name: 'CorrelationAnalysis',
    description: 'Correlação entre diferentes métricas',
    domain: 'strategic',
    category: 'analysis',
    capabilities: ['correlation', 'causation_hints'],
    dependencies: [13],
    implemented: true,
    module: 'engines/AnalysisEngine.ts',
  },
  {
    level: 15,
    name: 'AdvancedAnalytics',
    description: 'Analytics avançado com ML',
    domain: 'strategic',
    category: 'analysis',
    capabilities: ['ml_analysis', 'pattern_recognition'],
    dependencies: [14],
    implemented: false,
    module: 'engines/AnalysisEngine.ts',
  },

  // Sugestões (21-30)
  {
    level: 21,
    name: 'BasicSuggestions',
    description: 'Geração de sugestões básicas',
    domain: 'strategic',
    category: 'suggestion',
    capabilities: ['basic_suggestions', 'rule_based'],
    dependencies: [15],
    implemented: true,
    module: 'engines/SuggestionEngine.ts',
  },
  {
    level: 22,
    name: 'ContextualSuggestions',
    description: 'Sugestões contextuais baseadas em estado',
    domain: 'strategic',
    category: 'suggestion',
    capabilities: ['contextual_suggestions', 'state_aware'],
    dependencies: [21],
    implemented: true,
    module: 'engines/SuggestionEngine.ts',
  },
  {
    level: 23,
    name: 'PrioritizedSuggestions',
    description: 'Priorização inteligente de sugestões',
    domain: 'strategic',
    category: 'suggestion',
    capabilities: ['priority_ranking', 'impact_scoring'],
    dependencies: [22],
    implemented: true,
    module: 'engines/SuggestionEngine.ts',
  },
  {
    level: 24,
    name: 'ActionableSuggestions',
    description: 'Sugestões com ações executáveis',
    domain: 'strategic',
    category: 'suggestion',
    capabilities: ['actionable_suggestions', 'one_click_action'],
    dependencies: [23],
    implemented: true,
    module: 'engines/SuggestionEngine.ts',
  },

  // Ação (31-35)
  {
    level: 31,
    name: 'SemiAutonomousActions',
    description: 'Ações semi-autônomas com confirmação',
    domain: 'strategic',
    category: 'action',
    capabilities: ['semi_autonomous', 'confirmation_required'],
    dependencies: [24],
    implemented: true,
    module: 'engines/DecisionEngine.ts',
  },
  {
    level: 32,
    name: 'PolicyBasedActions',
    description: 'Ações baseadas em políticas',
    domain: 'strategic',
    category: 'action',
    capabilities: ['policy_enforcement', 'rule_execution'],
    dependencies: [31],
    implemented: true,
    module: 'policies/PolicyEngine.ts',
  },
  {
    level: 33,
    name: 'AdaptiveActions',
    description: 'Ações adaptativas ao contexto',
    domain: 'strategic',
    category: 'action',
    capabilities: ['adaptive_behavior', 'context_adaptation'],
    dependencies: [32],
    implemented: false,
  },

  // Governança (36-40)
  {
    level: 36,
    name: 'AuditLogging',
    description: 'Logging completo para auditoria',
    domain: 'strategic',
    category: 'governance',
    capabilities: ['audit_trail', 'decision_logging'],
    dependencies: [33],
    implemented: true,
    module: 'logs/structuredLogger.ts',
  },
  {
    level: 37,
    name: 'PolicyGovernance',
    description: 'Governança por políticas',
    domain: 'strategic',
    category: 'governance',
    capabilities: ['policy_governance', 'compliance'],
    dependencies: [36],
    implemented: true,
    module: 'policies/policyTypes.ts',
  },
  {
    level: 38,
    name: 'EvolutionControl',
    description: 'Controle de evolução da IA',
    domain: 'strategic',
    category: 'governance',
    capabilities: ['evolution_control', 'capability_management'],
    dependencies: [37],
    implemented: true,
    module: 'engines/EvolutionEngine.ts',
  },
  {
    level: 39,
    name: 'SelfMonitoring',
    description: 'Auto-monitoramento e health checks',
    domain: 'strategic',
    category: 'governance',
    capabilities: ['self_monitoring', 'health_checks'],
    dependencies: [38],
    implemented: true,
    module: 'core/healthMonitor.ts',
  },
  {
    level: 40,
    name: 'CreatorDashboard',
    description: 'Dashboard do Criador completo',
    domain: 'strategic',
    category: 'ux',
    capabilities: ['creator_dashboard', 'full_visibility'],
    dependencies: [39],
    implemented: true,
    module: 'ui/Dashboard.tsx',
  },
];

// ============================================================
// NÍVEIS OPERACIONAIS (41-50) - USUÁRIO/CO-PILOTO
// ============================================================

const OPERATIONAL_LEVELS: EvolutionLevel[] = [
  // Co-Piloto Base (41-43)
  {
    level: 41,
    name: 'CoPilotBase',
    description: 'Infraestrutura base do Co-Piloto para usuários',
    domain: 'operational',
    category: 'perception',
    capabilities: [
      'user_event_channel',
      'basic_context',
      'suggestion_store',
    ],
    dependencies: [40],
    implemented: false,
    module: 'engines/OperationalAIEngine.ts',
  },
  {
    level: 42,
    name: 'UserContextAwareness',
    description: 'Consciência do contexto do usuário',
    domain: 'operational',
    category: 'perception',
    capabilities: [
      'screen_awareness',
      'activity_tracking',
      'skill_level_detection',
    ],
    dependencies: [41],
    implemented: false,
    module: 'engines/UserContextEngine.ts',
  },
  {
    level: 43,
    name: 'UIWatcher',
    description: 'Observação de interações de UI',
    domain: 'operational',
    category: 'perception',
    capabilities: [
      'click_tracking',
      'form_monitoring',
      'navigation_tracking',
    ],
    dependencies: [42],
    implemented: false,
    module: 'engines/UIWatcherEngine.ts',
  },

  // Assistência Contextual (44-46)
  {
    level: 44,
    name: 'ContextualTips',
    description: 'Dicas contextuais para usuários',
    domain: 'operational',
    category: 'suggestion',
    capabilities: [
      'contextual_tips',
      'timing_optimization',
      'non_intrusive_ui',
    ],
    dependencies: [43],
    implemented: false,
    module: 'engines/TipEngine.ts',
  },
  {
    level: 45,
    name: 'ExplanationEngine',
    description: 'Explicações em linguagem natural',
    domain: 'operational',
    category: 'suggestion',
    capabilities: [
      'natural_language',
      'concept_explanation',
      'why_explanation',
    ],
    dependencies: [44],
    implemented: false,
    module: 'engines/ExplanationEngine.ts',
  },
  {
    level: 46,
    name: 'BiddingAssistant',
    description: 'Assistente para lances em leilões',
    domain: 'operational',
    category: 'suggestion',
    capabilities: [
      'bid_suggestions',
      'competitor_analysis',
      'timing_hints',
    ],
    dependencies: [45],
    implemented: false,
    module: 'engines/BiddingAssistantEngine.ts',
  },

  // Aprendizado e Adaptação (47-48)
  {
    level: 47,
    name: 'FeedbackLoop',
    description: 'Loop de feedback para aprendizado',
    domain: 'operational',
    category: 'learning',
    capabilities: [
      'feedback_collection',
      'preference_learning',
      'suggestion_refinement',
    ],
    dependencies: [46],
    implemented: false,
    module: 'engines/FeedbackLoopEngine.ts',
  },
  {
    level: 48,
    name: 'PatternLearning',
    description: 'Aprendizado de padrões de usuário',
    domain: 'operational',
    category: 'learning',
    capabilities: [
      'behavior_patterns',
      'preference_modeling',
      'personalization',
    ],
    dependencies: [47],
    implemented: false,
    module: 'engines/PatternLearningEngine.ts',
  },

  // Inteligência Avançada (49-50)
  {
    level: 49,
    name: 'PredictiveAssistance',
    description: 'Assistência preditiva proativa',
    domain: 'operational',
    category: 'suggestion',
    capabilities: [
      'predictive_suggestions',
      'proactive_assistance',
      'need_anticipation',
    ],
    dependencies: [48],
    implemented: false,
    module: 'engines/PredictiveEngine.ts',
  },
  {
    level: 50,
    name: 'FullCoPilot',
    description: 'Co-Piloto completo e autônomo',
    domain: 'operational',
    category: 'ux',
    capabilities: [
      'full_assistance',
      'autonomous_learning',
      'adaptive_personality',
    ],
    dependencies: [49],
    implemented: false,
    module: 'ui/CoPilot.tsx',
  },
];

// ============================================================
// MANIFESTO COMPLETO
// ============================================================

/**
 * Manifesto completo do Modo Deus
 */
export const MODO_DEUS_MANIFEST = {
  version: '2.0.0',
  name: 'Modo Deus',
  description: 'Sistema de IA dual: Estratégico (Admin) + Operacional (Usuário)',

  domains: {
    strategic: {
      name: 'Inteligência Estratégica',
      target: 'Admin/Criador',
      levelRange: [1, 40],
      description: 'Tomada de decisão, governança e evolução do sistema',
    },
    operational: {
      name: 'Inteligência Operacional',
      target: 'Usuário Final',
      levelRange: [41, 50],
      description: 'Assistência contextual e Co-Piloto para usuários',
    },
  },

  levels: [...STRATEGIC_LEVELS, ...OPERATIONAL_LEVELS],

  /**
   * Obtém um nível específico
   */
  getLevel: (level: number): EvolutionLevel | undefined => {
    return MODO_DEUS_MANIFEST.levels.find((l) => l.level === level);
  },

  /**
   * Obtém níveis por domínio
   */
  getLevelsByDomain: (domain: EvolutionDomain): EvolutionLevel[] => {
    return MODO_DEUS_MANIFEST.levels.filter((l) => l.domain === domain);
  },

  /**
   * Obtém níveis por categoria
   */
  getLevelsByCategory: (category: EvolutionCategory): EvolutionLevel[] => {
    return MODO_DEUS_MANIFEST.levels.filter((l) => l.category === category);
  },

  /**
   * Obtém níveis implementados
   */
  getImplementedLevels: (): EvolutionLevel[] => {
    return MODO_DEUS_MANIFEST.levels.filter((l) => l.implemented);
  },

  /**
   * Obtém níveis pendentes
   */
  getPendingLevels: (): EvolutionLevel[] => {
    return MODO_DEUS_MANIFEST.levels.filter((l) => !l.implemented);
  },

  /**
   * Calcula progresso geral
   */
  getProgress: (): { total: number; implemented: number; percentage: number } => {
    const total = MODO_DEUS_MANIFEST.levels.length;
    const implemented = MODO_DEUS_MANIFEST.levels.filter(
      (l) => l.implemented
    ).length;
    return {
      total,
      implemented,
      percentage: Math.round((implemented / total) * 100),
    };
  },

  /**
   * Calcula progresso por domínio
   */
  getProgressByDomain: (
    domain: EvolutionDomain
  ): { total: number; implemented: number; percentage: number } => {
    const levels = MODO_DEUS_MANIFEST.getLevelsByDomain(domain);
    const total = levels.length;
    const implemented = levels.filter((l) => l.implemented).length;
    return {
      total,
      implemented,
      percentage: total > 0 ? Math.round((implemented / total) * 100) : 0,
    };
  },

  /**
   * Verifica se um nível pode ser ativado (dependências satisfeitas)
   */
  canActivateLevel: (level: number): boolean => {
    const targetLevel = MODO_DEUS_MANIFEST.getLevel(level);
    if (!targetLevel) {
      return false;
    }

    return targetLevel.dependencies.every((depLevel) => {
      const dep = MODO_DEUS_MANIFEST.getLevel(depLevel);
      return dep?.implemented === true;
    });
  },

  /**
   * Obtém próximos níveis que podem ser implementados
   */
  getNextActivatableLevels: (): EvolutionLevel[] => {
    return MODO_DEUS_MANIFEST.levels.filter(
      (l) => !l.implemented && MODO_DEUS_MANIFEST.canActivateLevel(l.level)
    );
  },
};

// ============================================================
// EXPORTS
// ============================================================

export { STRATEGIC_LEVELS, OPERATIONAL_LEVELS };
