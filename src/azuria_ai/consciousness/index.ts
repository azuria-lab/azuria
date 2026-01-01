/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CONSCIOUSNESS CORE - MODO DEUS AZURIA
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este módulo contém o Núcleo Central do Modo Deus - a única entidade pensante
 * do sistema. Todas as decisões cognitivas passam por aqui.
 * 
 * Arquitetura:
 * - ConsciousnessCore: O cérebro único do sistema
 * - GlobalState: Estado global centralizado
 * - PerceptionGate: Filtro de entrada de eventos
 * - DecisionEngine: Motor de decisão
 * - OutputGate: Controle de saída (anti-spam, deduplicação)
 * - CommunicationMemory: Memória do que foi dito
 * - AIRouter: Roteador de modelos de IA
 * 
 * @module azuria_ai/consciousness
 */

// Core
export { 
  ConsciousnessCore, 
  initConsciousness, 
  shutdownConsciousness,
  sendEvent,
  processEventSync,
  onOutput,
  onDecision,
  provideFeedback,
  updateContext,
  type ProcessingResult,
  type InitConfig,
} from './ConsciousnessCore';

// State
export { 
  GlobalState, 
  getGlobalState, 
  updateGlobalState,
  resetGlobalState,
  initializeState,
  subscribeToState,
  isAdmin,
  isSilenced,
  isTopicBlocked,
  wasRecentlySent,
  getCurrentActivity,
  getUserRole,
  getSessionMetrics,
  recordSentMessage,
  blockTopic,
  updateUserActivity,
  updateCurrentScreen,
  requestSilence,
  removeSilence,
  incrementSessionMetric,
  updateSystemHealth,
  recordSystemError,
  cleanupExpiredData,
  type GlobalStateShape,
  type UserIdentity,
  type CurrentMoment,
  type SessionData,
  type SystemHealth,
  type SentMessage,
  type BlockedTopic,
  type CommunicationMemoryData,
  type PendingAction,
} from './GlobalState';

// Gates
export { 
  PerceptionGate, 
  perceive,
  quickFilter,
  getEventCategory,
  isAdminEvent,
  type RawEvent,
  type PerceptionResult,
} from './PerceptionGate';

export { 
  OutputGate, 
  processOutput,
  canEmit,
  recordMessageFeedback,
  getOutputStats,
  type OutputRequest,
  type OutputDecision,
  type OutputStats,
} from './OutputGate';

// Decision
export { 
  DecisionEngine, 
  decide,
  createDecisionContext,
  addDecisionRule,
  removeDecisionRule,
  getDecisionHistory,
  getDecisionStats,
  type Decision, 
  type DecisionContext,
} from './DecisionEngine';

// Memory
export { 
  CommunicationMemory, 
  generateSemanticHash,
  generateTopicHash,
  checkDuplication,
  rememberMessage,
  markAsAccepted,
  markAsDismissed,
  markAsIgnored,
  getTopicMentionCount,
  getRecentAcceptanceRate,
  isUserReceptive,
  getSuggestedWaitTime,
  type MessageRecord,
  type DuplicationCheck,
} from './CommunicationMemory';

// AI Router
export {
  AIRouter,
  initAIRouter,
  executeAI,
  generateRequestId,
  getModelStatus,
  isModelAvailable,
  getAIStats,
  type AIModel,
  type AITaskType,
  type AIRequest,
  type AIResponse,
  type ModelStatus,
} from './AIRouter';

// Event Bridge
export {
  EventBridge,
  initEventBridge,
  stopEventBridge,
  sendThroughBridge,
  onUIOutput,
  notifyCoreReady,
  ignoreEventTypes,
  unignoreEventTypes,
  getBridgeStats,
  isBridgeInitialized,
} from './EventBridge';

// React Hook
export {
  useConsciousness,
  type ConsciousnessState,
  type UseConsciousnessOptions,
  type ConsciousnessHookReturn,
} from './useConsciousness';

// React Provider
export {
  ConsciousnessProvider,
  useConsciousnessContext,
} from './ConsciousnessProvider';

// Engine Adapter
export {
  EngineAdapter,
  initEngineAdapters,
  queryEngine,
  invokeAgent,
  queryMultipleEngines,
  getAvailableEngines,
  getAvailableAgents,
  stopAllAgents,
  type InternalEngine,
  type EngineContext,
  type CallableAgent,
  type AgentTask,
  type AgentResult,
} from './EngineAdapter';

// UI Components
export { ConsciousnessToast } from './components/ConsciousnessToast';
export { ConsciousnessStatus } from './components/ConsciousnessStatus';
export { AdminDashboard } from './components/AdminDashboard';

// Rules
export { calculationRules, navigationRules, allContextRules, registerAllContextRules } from './rules';

// Events Mapping
export {
  EVENT_MAPPING,
  getEventMapping,
  shouldProcessEvent,
  enrichEvent,
  getEventPriority,
  getCognitiveCategory,
  getMappedEventTypes,
  getEventsByCategory,
} from './events';

// Templates
export { 
  MessageTemplates, 
  CALC_TEMPLATES, 
  NAV_TEMPLATES,
  ADMIN_TEMPLATES,
  GENERAL_TEMPLATES,
  getTemplate, 
  renderTemplate, 
  createMessageFromTemplate,
  formatCurrency,
  formatPercent,
} from './templates';

// Personality
export {
  SimpleVoice,
  humanizeForUser,
  formatForAdmin,
  humanizeTitle,
  humanizeMessage,
} from './personality';

// Persistence
export {
  SupabasePersistence,
  initPersistence,
  stopPersistence,
  persistMessage,
  persistFeedback,
  updateMessageOutcome,
  loadPreferences,
  savePreferences,
  loadRecentMessages,
  loadUserMetrics,
} from './persistence';

// Learning
export {
  FeedbackLearning,
  initFeedbackLearning,
  recordFeedback as recordLearningFeedback,
  runAnalysis,
  getLearnedPreferences,
  shouldAvoidTopic,
  getTopicAcceptanceRate,
  getRelevanceAdjustment,
  getIdealFrequency,
  getLearningStats,
} from './learning';

// Gemini Integration
export {
  GeminiIntegration,
  initGemini,
  isGeminiAvailable,
  analyzeContext,
  classifyIntent,
  generateResponse,
  analyzeCalculation,
  getGeminiStats,
} from './ai';

// Types
export * from './types';

