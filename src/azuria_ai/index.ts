/**
 * @fileoverview Azuria AI - Barrel Export
 * 
 * Ponto de entrada centralizado para todos os módulos do Modo Deus.
 * Este módulo agrupa e exporta todas as funcionalidades da IA em categorias:
 * 
 * ## Categorias de Export:
 * 
 * ### Core
 * - **EventBus**: Sistema de eventos centralizado para comunicação entre módulos
 * - **Event Payloads**: Tipos TypeScript para payloads de eventos tipados
 * - **Constants**: Constantes padronizadas (BRAND, SEVERITY, CONFIDENCE, etc.)
 * - **Admin**: Autenticação e autorização para painel do criador
 * - **Orchestrator**: Inicialização e shutdown do sistema de IA
 * 
 * ### Hooks
 * - **useEventBus**: Hook React para escutar eventos
 * - **useCalcWatcher**: Hook para monitorar cálculos
 * - **useCreatorStream**: Hook para SSE do painel do criador
 * 
 * ### Engines
 * - **Cognitive**: Processamento cognitivo principal
 * - **User Intent**: Análise de intenção do usuário
 * - **Predictive**: Geração de insights preditivos
 * - **Governance**: Validação e auditoria de decisões
 * - **Safety**: Limites e verificações de segurança
 * - **Brand Voice**: Tom de voz e personalidade
 * - **Emotion**: Detecção e resposta emocional
 * - **Market**: Inteligência de mercado
 * - **Evolution**: Melhoria contínua
 * - **Creator**: Alertas e insights para o criador
 * 
 * ### UI
 * - **InsightToast**: Componentes para exibir insights
 * 
 * ### Profiles
 * - Perfis de tom, persona, história e emoção
 * 
 * @module azuria_ai
 * @version 1.0.0
 * 
 * @example Importação básica
 * ```typescript
 * import { 
 *   emitEvent, 
 *   on, 
 *   useEventBus,
 *   structuredLogger,
 *   CONFIDENCE 
 * } from '@/azuria_ai';
 * ```
 * 
 * @example Uso do EventBus
 * ```typescript
 * import { emitEvent, on } from '@/azuria_ai';
 * 
 * // Escutar evento
 * const unsub = on('ai:pattern-detected', (event) => {
 *   console.log('Pattern:', event.payload);
 * });
 * 
 * // Emitir evento
 * emitEvent('ai:pattern-detected', { pattern: 'user_hesitation' });
 * ```
 * 
 * @example Uso de Hook
 * ```typescript
 * import { useEventBus } from '@/azuria_ai';
 * 
 * function MyComponent() {
 *   useEventBus('ai:insight', (event) => {
 *     showToast(event.payload.message);
 *   });
 * }
 * ```
 */

// ============================================================================
// Core - EventBus
// ============================================================================

export {
  type EventType,
  type AzuriaEvent,
  type EventHandler,
  type EventSubscription,
  emitEvent,
  on,
  once,
  unsubscribeFromEvent,
  removeAllListeners,
  getEventHistory,
  clearEventHistory,
  getEventBusStats,
  registerEvent,
} from './core/eventBus';

// ============================================================================
// Core - Mode Deus Orchestrator (DELEGADO - use CentralNucleus)
// ============================================================================

/**
 * @description Orquestrador do Modo Deus - agora funciona como DELEGADO
 * @deprecated Use CentralNucleus para inicialização. ModeDeusOrchestrator é delegado interno.
 */
export {
  initModeDeus,
  shutdownModeDeus,
  process as processModeDeus,
  handleNavigation,
  handleUserInput,
  generateCombinedSuggestions,
  getOrchestratorState,
  getConsolidatedMetrics,
  getSystemInsights,
  setModeDeusEnabled,
  updateOrchestratorConfig,
  isInitialized,
  getEngineStatuses,
  getModeDeusConfig,
  modeDeusOrchestrator,
  type OrchestratorState,
  type OrchestratorConfig,
  type ProcessingContext,
  type ProcessingResult,
  type EngineStatusValue,
} from './core/modeDeusOrchestrator';

// ============================================================================
// CENTRAL NUCLEUS - ÚNICO PONTO DE ENTRADA (RECOMENDADO)
// ============================================================================

/**
 * @description CentralNucleus é o ÚNICO ponto de entrada do sistema Modo Deus.
 * Use initNucleus() para inicializar e CentralNucleus.send() para eventos.
 * 
 * @example
 * ```typescript
 * import { CentralNucleus, initNucleus } from '@/azuria_ai';
 * 
 * // Inicializar
 * await initNucleus({ userId: 'user123', role: 'USER', tier: 'PRO' });
 * 
 * // Enviar evento
 * CentralNucleus.send({ type: 'user:action', payload: { ... } });
 * ```
 */
export {
  CentralNucleus,
  initNucleus,
  shutdownNucleus,
  send as sendToNucleus,
  process as processWithNucleus,
  requestAction,
  onResult,
  type ActionRequest,
  type ActionResponse,
  type DelegateState,
  type NucleusConfig,
} from './consciousness/CentralNucleus';

// ============================================================================
// Providers - Consciousness Core (Novo Modo Deus)
// ============================================================================

export { 
  ConsciousnessProvider,
  useConsciousnessContext,
  useModeDeus,
  useModeDeusOptional,
  ConsciousnessContext,
  ModeDeusContext, // Alias para compatibilidade
} from './consciousness/ConsciousnessProvider';

export {
  ConsciousnessToast,
  ConsciousnessStatus,
} from './consciousness/components';

// Consciousness Core exports
export {
  ConsciousnessCore,
  initConsciousness,
  shutdownConsciousness,
  sendEvent,
  onOutput,
  onDecision,
  GlobalState,
  getGlobalState,
  PerceptionGate,
  DecisionEngine,
  OutputGate,
  CommunicationMemory,
  AIRouter,
  EventBridge,
  EngineAdapter,
} from './consciousness';

// Legacy Provider (mantido para compatibilidade)
export { ModeDeusProvider } from './providers/ModeDeusProvider';

// ============================================================================
// GOVERNANCE - Sistema de Permissões para Engines
// ============================================================================

/**
 * @description Sistema de governança que controla quando e como os engines
 * podem agir no sistema. Todos os engines devem solicitar permissão ao
 * CentralNucleus antes de emitir eventos ou executar ações.
 * 
 * @example
 * ```typescript
 * import { EngineGovernance, BaseEngine } from '@/azuria_ai';
 * 
 * // Engine governado
 * class MyCognitiveEngine extends BaseEngine {
 *   constructor() {
 *     super({
 *       id: 'myCognitive',
 *       name: 'My Cognitive Engine',
 *       category: 'cognitive',
 *       allowedEvents: ['ai:insight', 'ai:pattern-detected'],
 *     });
 *   }
 *   
 *   async analyze(data: unknown) {
 *     // Emissão governada - pede permissão ao Núcleo
 *     await this.emit('ai:insight', { message: 'Insight descoberto' });
 *   }
 * }
 * ```
 */
export {
  EngineGovernance,
  initEngineGovernance,
  shutdownEngineGovernance,
  registerEngine,
  unregisterEngine,
  getEngine,
  listEngines,
  listEnginesByCategory,
  requestEmitPermission,
  requestActionPermission,
  recordEmission,
  getGovernanceStats,
  BaseEngine,
  type EngineCategory,
  type EnginePrivilege,
  type EngineRegistration,
  type EmitPermissionRequest,
  type PermissionResponse,
  type GovernanceConfig,
  type BaseEngineConfig,
  type EmitResult,
} from './governance';

// ============================================================================
// STATE - Sistema de Estado Unificado
// ============================================================================

/**
 * @description UnifiedStateStore é o único sistema de estado do Azuria.
 * Centraliza completamente o estado da aplicação em um único lugar.
 * 
 * @example
 * ```typescript
 * import { UnifiedStateStore } from '@/azuria_ai';
 * 
 * // Registrar slice de um engine
 * UnifiedStateStore.registerEngineSlice({
 *   engineId: 'myEngine',
 *   engineName: 'My Engine',
 *   initialState: { patterns: [], insights: [] },
 * });
 * 
 * // Ler estado
 * const coreState = UnifiedStateStore.getCoreState();
 * const myData = UnifiedStateStore.getEngineData('myEngine');
 * 
 * // Atualizar estado do engine
 * UnifiedStateStore.updateEngineSlice('myEngine', { patterns: [...] });
 * ```
 */
export {
  UnifiedStateStore,
  initUnifiedStore,
  shutdownUnifiedStore,
  getState as getUnifiedState,
  getCoreState,
  getCoreSection,
  getEngineSlice,
  getEngineData,
  listEngineSlices,
  isAdmin as isAdminState,
  isSilenced as isSilencedState,
  getActiveEngineCount,
  isEngineRegistered,
  getUserRole as getUserRoleState,
  getUserTier,
  registerEngineSlice,
  unregisterEngineSlice,
  updateCoreState,
  updateCoreSection,
  updateEngineSlice,
  markSliceInitialized,
  resetState,
  initializeWithUser,
  onStateChange,
  onSliceChange,
  GlobalStateAdapter,
  migrateToUnifiedStore,
  type CoreState,
  type EngineSlice,
  type SliceRegistration,
  type UnifiedState,
  type UpdateOptions,
  type StateListener,
  type SliceListener,
  type StoreConfig,
} from './state';

// ============================================================================
// LEVELS - Sistema de Níveis de Consciência (ADMIN vs USER)
// ============================================================================

/**
 * @description ConsciousnessLevels implementa a separação entre:
 * - ADMIN (Inteligência Estratégica): Visão completa, métricas, decisões
 * - USER (Co-Pilot Operacional): Assistência contextual, sugestões
 * 
 * @example
 * ```typescript
 * import { ConsciousnessLevels } from '@/azuria_ai';
 * 
 * // Verificar permissão para uma funcionalidade
 * if (ConsciousnessLevels.hasFeatureAccess('USER', 'analytics')) {
 *   // false - analytics é apenas para ADMIN
 * }
 * 
 * // Verificar se engine é permitido
 * if (ConsciousnessLevels.canUseEngine('USER', 'suggestion')) {
 *   // true - suggestion é permitido para USER
 * }
 * ```
 */
export {
  ConsciousnessLevels,
  initLevels,
  shutdownLevels,
  activateLevel,
  deactivateLevel,
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
  recordSuggestionShown as recordLevelSuggestionShown,
  recordInsightGenerated,
  recordActionExecuted,
  recordEventProcessed,
  ADMIN_LEVEL_CONFIG,
  USER_LEVEL_CONFIG,
  SYSTEM_LEVEL_CONFIG,
  FEATURE_PERMISSIONS,
  type FeatureCategory,
  type FeaturePermission,
  type LevelConfig,
  type LevelContext,
  type PermissionCheckResult,
} from './levels';

// ============================================================================
// MEMORY - Sistema de Memória Unificado (STM/WM/LTM)
// ============================================================================

/**
 * @description UnifiedMemory implementa um sistema de memória de 3 camadas:
 * - STM (Short-Term Memory): Contexto atual, interações recentes (~5 min)
 * - WM (Working Memory): Dados da sessão, padrões em processamento
 * - LTM (Long-Term Memory): Preferências, histórico, comportamentos (persistido)
 * 
 * @example
 * ```typescript
 * import { UnifiedMemory } from '@/azuria_ai';
 * 
 * // Inicializar memória
 * await UnifiedMemory.initMemory({ userId: 'user123', enableSync: true });
 * 
 * // Registrar interação
 * await UnifiedMemory.recordInteraction({
 *   type: 'message',
 *   input: 'How do I calculate tax?',
 *   output: 'To calculate tax...',
 *   context: { page: 'calculator' },
 * });
 * 
 * // Recuperar memórias relevantes
 * const memories = UnifiedMemory.recall('tax calculation');
 * ```
 */
export {
  UnifiedMemory,
  initMemory,
  shutdownMemory,
  recordInteraction,
  recall,
  forceSync,
  getSTM,
  getWM,
  getLTM,
  getCurrentContext,
  recordCalculation,
  recordPattern,
  onSync,
  type MemoryConfig,
  type RecentInteraction,
  type RecallResult,
  type ShortTermMemory,
  type WorkingMemory,
  type LongTermMemory,
  type DetectedPattern as MemoryDetectedPattern,
} from './memory';

// ============================================================================
// Core - Event Payloads (Types)
// ============================================================================

export type {
  BasePayload,
  CalcPayload,
  ScenarioPayload,
  TaxPayload,
  BidPayload,
  AIInsightPayload,
  AIStatePayload,
  AIEmotionPayload,
  AIPatternPayload,
  AIGovernancePayload,
  AISafetyPayload,
  AgentPayload,
  AgentFeedbackPayload,
  UIPayload,
  UIAdaptivePayload,
  UserActionPayload,
  UserProfilePayload,
  SystemPayload,
  ErrorPayload,
  CreatorAlertPayload,
  CreatorInsightPayload,
  EvolutionPayload,
  EventPayloadMap,
  PayloadFor,
  TypedAzuriaEvent,
} from './core/eventPayloads';

// ============================================================================
// Core - Constants
// ============================================================================

export {
  BRAND,
  SEVERITY,
  CONFIDENCE,
  PERFORMANCE,
  USER_STATE,
  SKILL_LEVEL,
  ENGINE_SOURCE,
  ALERT_TYPE,
  RISK_LEVEL,
  PRIORITY,
  MESSAGES,
  CALC_DEFAULTS,
  TEMPORAL,
  type SeverityLevel,
  type UserState,
  type SkillLevel,
  type EngineSource,
  type AlertType,
  type RiskLevel,
} from './core/constants';

// ============================================================================
// Core - Admin
// ============================================================================

export {
  ADMIN_UID,
  ADMIN_UIDS,
  isValidAdminUID,
} from './core/adminConfig';

export {
  requireAdmin,
  isAdminRequest,
  cleanupRateLimitRecords,
} from './core/adminGuard';

// ============================================================================
// Core - Orchestrator
// ============================================================================

/**
 * @description Funções de gerenciamento do orquestrador de IA
 * - `initializeOrchestrator`: Inicializa o sistema de IA com configurações opcionais
 * - `shutdownOrchestrator`: Encerra graciosamente o sistema de IA
 * - `isOrchestratorRunning`: Verifica se o orquestrador está ativo
 */
export {
  initializeOrchestrator,
  shutdownOrchestrator,
  isOrchestratorRunning,
  runMetaPipeline,
  processRequest,
  analyzeIntent as orchestratorAnalyzeIntent,
  coordinateAgents,
  getConversationContext,
  updateConversationContext,
  updateInsightConfig,
} from './core/aiOrchestrator';

// ============================================================================
// Hooks
// ============================================================================

export {
  useEventBus,
  type UseEventBusOptions,
  type UseEventBusReturn,
} from './hooks/useEventBus';

export { useCalcWatcher } from './hooks/useCalcWatcher';
export { useTaxCalcWatcher } from './hooks/useTaxCalcWatcher';
export { useBidCalcWatcher } from './hooks/useBidCalcWatcher';
export { useCreatorStream } from './hooks/useCreatorStream';

// Co-Piloto Hooks
export {
  useCoPilot,
  useCoPilotSuggestions,
  useCoPilotContext,
  useCoPilotConfig,
  type UseCoPilotOptions,
  type UseCoPilotReturn,
} from './hooks/useCoPilot';

// ============================================================================
// Engines - Core Cognitive
// ============================================================================

/**
 * @description Engine cognitivo principal - memória e detecção de padrões
 */
export {
  updateMemory,
  detectPatterns,
  generateForecast,
  detectAnomalies,
  getMemorySnapshot,
} from './engines/cognitiveEngine';

/**
 * @description Engine de intenção do usuário
 */
export {
  type IntentCategory,
  type IntentResult,
  detectIntent,
  predictNextStep,
  intentCategories,
  logConflictSignal,
} from './engines/userIntentEngine';

/**
 * @description Engine de insights preditivos
 */
export { generatePredictiveInsight } from './engines/predictiveInsightEngine';

// ============================================================================
// Engines - Governance & Safety
// ============================================================================

/**
 * @description Engine de governança - auditoria e validação de decisões
 */
export {
  registerDecision,
  auditLastDecisions,
  detectGovernanceViolations,
} from './engines/governanceEngine';

/**
 * @description Engine de limites de segurança
 */
export {
  type SafetyState,
  checkCriticalBoundaries,
  detectRunawayBehavior,
  applySafetyBreak,
  logSafetyEvent,
} from './engines/safetyLimitsEngine';

/**
 * @description Engine de guarda ético
 */
export {
  evaluateEthicalRisk,
  detectUnsafeIntent,
  correctiveIntent,
  scoreAlignment,
  enforceEthics,
} from './engines/ethicalGuardEngine';

// ============================================================================
// Engines - Brand & Communication
// ============================================================================

export {
  applyTone,
  rewriteWithBrandVoice,
  speak,
  getToneProfileForUser,
  adaptPersona,
  type ToneProfileKey,
  type PersonaKey,
} from './engines/brandVoiceEngine';

// ============================================================================
// Engines - Emotion & Engagement
// ============================================================================

/**
 * @description Engine afetivo - detecção de emoções do usuário
 */
export {
  inferUserEmotion,
  detectFrustration,
  detectConfidence,
  detectConfusion,
  detectAchievement,
  detectHesitation,
  respondWithEmpathy,
  respondWithConfidenceBoost,
  respondWithReassurance,
  respondWithEncouragement,
  getEmotionState,
  type EmotionType,
} from './engines/affectiveEngine';

/**
 * @description Engine de engajamento
 */
export {
  type EngagementState,
  detectMotivation,
  detectUsageDrop,
  analyzeStreak,
  computeRecommendedNextAction,
  getEngagementSnapshot,
} from './engines/engagementEngine';

// ============================================================================
// Engines - Strategic & Business
// ============================================================================

/**
 * @description Engine de inteligência de mercado
 */
export {
  type MarketInsight,
  scanMarketSignals,
  analyzeCompetitors,
  compareFeatureSets,
  detectExternalRisks,
  identifyMarketOpportunities,
  suggestStrategicPositioning,
  emitMarketInsight,
  detectExternalRisksAndOpportunities,
} from './engines/marketIntelligenceEngine';

/**
 * @description Engine de inteligência de receita
 */
export {
  evaluateRevenueSignals,
  analyzeRevenueOpportunity,
  getUpgradeMessage,
} from './engines/revenueIntelligenceEngine';

// ============================================================================
// Engines - Evolution & Learning
// ============================================================================

/**
 * @description Engine de melhoria contínua
 */
export {
  analyzeAndAdjust,
  proposeImprovements,
  getCurrentParams,
  runEvolutionCycle,
} from './engines/continuousImprovementEngine';

// ============================================================================
// Engines - Creator (Modo Deus)
// ============================================================================

export { CreatorEngine } from './engines/creatorEngine';

// ============================================================================
// UI Components
// ============================================================================

export {
  type InsightType,
  type InsightToastProps,
  InsightToast,
  useInsightToasts,
  InsightToastContainer,
} from './ui/InsightToast';

// Co-Piloto UI
export {
  CoPilot,
  CoPilotInline,
  type CoPilotProps,
} from './ui/CoPilot';

// ============================================================================
// Engines - Operational (Co-Piloto)
// ============================================================================

export {
  initOperationalEngine,
  updateUserContext,
  acceptSuggestion,
  dismissSuggestion,
  recordFeedback,
  addSuggestion,
  getActiveSuggestions,
  getCoPilotState,
  updateConfig as updateCoPilotConfig,
  setEnabled as setCoPilotEnabled,
  resetState as resetCoPilotState,
  DEFAULT_CONFIG as COPILOT_DEFAULT_CONFIG,
  USER_EVENTS as COPILOT_USER_EVENTS,
} from './engines/operationalAIEngine';

// ============================================================================
// Engines - User Context & Behavior
// ============================================================================

/**
 * @description Engine de contexto do usuário - detecção de skill level e comportamento
 */
export {
  initUserContextEngine,
  shutdownUserContextEngine,
  getUserContext,
  getUserSession,
  getBehaviorMetrics,
  recordUserAction,
  recordNavigation,
  recordError as recordContextError,
  recordCalculation as recordContextCalculation,
  recordInputInteraction,
  detectSkillLevel,
  updateSkillLevel,
  detectActivityState,
  updateActivityState,
  inferPreferences,
  updatePreferences,
  userContextEngine,
} from './engines/userContextEngine';

// ============================================================================
// Engines - UI Watcher
// ============================================================================

/**
 * @description Engine de monitoramento de interações da UI
 */
export {
  initUIWatcher,
  shutdownUIWatcher,
  updateUIWatcherConfig,
  getRecentEvents,
  getEventsByType,
  getEventsForElement,
  getActivityState as getUIActivityState,
  clearEventHistory as clearUIEventHistory,
  uiWatcher,
  type InteractionType,
  type UIInteractionEvent,
  type UIWatcherConfig,
} from './engines/uiWatcherEngine';

// ============================================================================
// Engines - Suggestion Throttler
// ============================================================================

/**
 * @description Engine de controle de frequência de sugestões
 */
export {
  initThrottler,
  shutdownThrottler,
  updateThrottleRules,
  updateThrottlerContext,
  canShowSuggestion,
  recordSuggestionShown,
  recordSuggestionDismissed,
  recordSuggestionAccepted,
  recordTypingActivity,
  recordErrorOccurrence,
  silenceSuggestions,
  unsilenceSuggestions,
  queueSuggestion,
  getNextAllowedSuggestion,
  clearQueue,
  getQueueSize,
  getThrottleStats,
  suggestionThrottler,
  type ThrottleResult,
} from './engines/suggestionThrottler';

// ============================================================================
// Engines - Explanation Engine
// ============================================================================

/**
 * @description Engine de explicações contextuais adaptativas
 */
export {
  initExplanationEngine,
  shutdownExplanationEngine,
  generateExplanation,
  getQuickExplanation,
  explainError,
  explanationToSuggestion,
  getAvailableTopics,
  getAvailableCategories,
  getRelatedConcepts,
  getDepthForSkillLevel,
  getExplanationStats,
  explanationEngine,
  type ExplanationDepth,
  type ExplanationCategory,
  type ExplanationStep,
  type Explanation,
  type ExplanationRequest,
} from './engines/explanationEngine';

// ============================================================================
// Engines - Bidding Assistant
// ============================================================================

/**
 * @description Engine de assistência para licitações e cálculo de BDI
 */
export {
  initBiddingAssistant,
  shutdownBiddingAssistant,
  updateBiddingConfig,
  calcularBDI,
  calcularBDIReverso,
  calcularPrecoFinal,
  calcularCustoMaximo,
  analisarProposta,
  gerarSugestoesBidding,
  analysisToSuggestions,
  getFaixasBDI,
  getComponentesPadrao,
  getTributosPadrao,
  getBiddingStats,
  biddingAssistant,
  type BiddingType,
  type BiddingModality,
  type BDIComponents,
  type BDIResult,
  type BiddingProposal,
  type ProposalAnalysis,
  type BiddingAlert,
  type BiddingConfig,
} from './engines/biddingAssistantEngine';

// ============================================================================
// Engines - Tutorial Engine
// ============================================================================

/**
 * @description Engine de tutoriais interativos passo-a-passo
 */
export {
  initTutorialEngine,
  shutdownTutorialEngine,
  onTutorialEvent,
  getAvailableTutorials,
  getTutorial,
  getTutorialsByCategory,
  searchTutorials,
  startTutorial,
  nextStep,
  skipStep,
  getCurrentStep,
  completeTutorial,
  abandonTutorial,
  getTutorialProgress,
  getAllProgress,
  isTutorialCompleted,
  hasAchievement,
  getAchievements,
  getAvailableAchievements,
  suggestTutorials,
  getTutorialStats,
  tutorialEngine,
  type TutorialStepStatus,
  type TutorialStatus,
  type StepActionType,
  type TutorialStep,
  type Tutorial,
  type TutorialProgress,
  type TutorialAchievement,
  type TutorialEventCallback,
} from './engines/tutorialEngine';

// ============================================================================
// Engines - Feedback Loop (Fase 4)
// ============================================================================

/**
 * @description Engine de coleta e análise de feedback
 */
export {
  initFeedbackLoop,
  recordFeedback as recordSuggestionFeedback,
  recordSuggestionApplied,
  recordSuggestionDismissed as recordFeedbackDismissed,
  recordSuggestionRating,
  recordQuickFeedback,
  getFeedbackMetrics,
  getMetricsForType as getFeedbackMetricsForType,
  analyzeEffectiveness,
  getRecentPositiveRate,
  shouldAvoidSuggestionType,
  onFeedback,
  clearFeedbackState,
  resetFeedbackLoop,
  feedbackLoop,
  type FeedbackType,
  type SuggestionFeedback,
  type FeedbackMetrics,
  type EffectivenessAnalysis,
} from './engines/feedbackLoopEngine';

// ============================================================================
// Engines - Pattern Learning (Fase 4)
// ============================================================================

/**
 * @description Engine de aprendizado de padrões de uso
 */
export {
  initPatternLearning,
  recordAction,
  recordActionSequence,
  analyzePatterns,
  getAllPatterns,
  getPatternsByType,
  getHighConfidencePatterns,
  hasPattern,
  getPattern,
  getPatternStats,
  getTypicalUsageTime,
  getMostUsedCalculators,
  getFrequentErrors,
  getInferredPreferences,
  setLearningEnabled,
  isLearningEnabled,
  clearActionBuffer,
  clearPatterns,
  resetPatternLearning,
  patternLearning,
  type PatternType,
  type DetectedPattern,
  type PatternStats,
} from './engines/patternLearningEngine';

// ============================================================================
// Engines - Personalization (Fase 4)
// ============================================================================

/**
 * @description Engine de personalização inteligente
 */
export {
  initPersonalization,
  getProfile as getPersonalizationProfile,
  setPreference,
  setPreferences,
  updateSkillLevel as updatePersonalizationSkillLevel,
  personalizeSuggestion,
  shouldShowProactiveSuggestion,
  getOptimalExplanationDepth,
  getSuggestedFeatures,
  getAvoidedSuggestionTypes,
  recordActivity,
  recordSuggestionShown as recordPersonalizationShown,
  recordSuggestionApplied as recordPersonalizationApplied,
  getConfig as getPersonalizationConfig,
  setConfig as setPersonalizationConfig,
  resetSessionStats,
  resetPersonalization,
  personalization,
  type ExplanationDepth as PersonalizationExplanationDepth,
  type SuggestionFrequency,
  type UserPersonalizationProfile,
  type PersonalizationConfig,
  type SuggestionPersonalizationContext,
} from './engines/personalizationEngine';

// ============================================================================
// Engines - NLP Processor (Fase 5)
// ============================================================================

/**
 * @description Engine de processamento de linguagem natural
 */
export {
  initNLPProcessor,
  analyzeText,
  extractEntities,
  analyzeSentiment,
  detectUrgency,
  normalizeText,
  correctText,
  suggestCompletions,
  normalizeValueInput,
  getSynonyms,
  areSynonyms,
  addIntentPattern,
  addCorrection,
  getAnalysisHistory,
  getNLPStats,
  clearAnalysisHistory,
  resetNLPProcessor,
  nlpProcessor,
  type UserIntent,
  type EntityType,
  type ExtractedEntity,
  type IntentAnalysis,
  type TextCorrection,
  type TextCompletion,
} from './engines/nlpProcessorEngine';

// ============================================================================
// Engines - Predictive Engine (Fase 5)
// ============================================================================

/**
 * @description Engine de predição de ações do usuário
 */
export {
  initPredictiveEngine,
  updatePredictionContext,
  recordUserAction as recordPredictiveAction,
  getCurrentPredictions,
  getMostLikelyNextAction,
  predictFlow,
  calculateAbandonmentRisk,
  suggestSmartShortcuts,
  getPreloadSuggestions,
  isActionPredicted,
  emitPredictionEvent,
  getPredictiveStats,
  clearActionHistory as clearPredictiveHistory,
  resetPredictiveEngine,
  predictiveEngine,
  type PredictedAction,
  type PredictedFlow,
  type AbandonmentRisk,
  type PredictionContext,
} from './engines/predictiveEngine';

// ============================================================================
// Engines - Proactive Assistant (Fase 5)
// ============================================================================

/**
 * @description Assistente proativo inteligente
 */
export {
  initProactiveAssistant,
  registerTrigger,
  unregisterTrigger,
  evaluateTriggers,
  showAssistance,
  dismissAssistance,
  actOnAssistance,
  getActiveAssistances,
  getQuickAssistance,
  updateProactiveConfig,
  getProactiveConfig,
  suppressAssistances,
  getProactiveStats,
  clearActiveAssistances,
  resetProactiveAssistant,
  proactiveAssistant,
  type AssistanceType,
  type ProactiveAssistance,
  type ProactiveConfig,
  type AssistanceTrigger,
  type TriggerContext,
} from './engines/proactiveAssistant';

// ============================================================================
// Profiles
// ============================================================================

export { brandToneProfiles } from './engines/brandToneProfiles';
export { personaProfiles } from './engines/personaProfiles';
export { storyProfiles } from './engines/storyProfiles';
export { emotionProfiles } from './engines/emotionProfiles';
