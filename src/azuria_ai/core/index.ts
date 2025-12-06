/**
 * Azuria AI Core
 *
 * Export all core AI modules
 */

export { registerAgent, getAgent, listAgents } from './agents';
export type { Agent, AgentCapability } from './agents';

export {
  registerFunction,
  getFunction,
  listFunctions,
  callFunction,
  unregisterFunction,
  clearFunctions,
  getFunctionsSchema,
  getFunctionStats,
} from './functionRegistry';
export type { FunctionDefinition, FunctionParameter } from './functionRegistry';

export {
  initializeFunctions,
  getFunctionsByCategory,
} from './functionDefinitions';

export {
  registerEvent,
  emitEvent,
  on,
  once,
  unsubscribeFromEvent,
  removeAllListeners,
  getEventHistory,
  clearEventHistory,
  getEventBusStats,
} from './eventBus';
export type {
  EventType,
  AzuriaEvent,
  EventHandler,
  EventSubscription,
} from './eventBus';

export {
  processRequest,
  analyzeIntent,
  coordinateAgents,
  getConversationContext,
  updateConversationContext,
  initializeOrchestrator,
  updateInsightConfig,
} from './aiOrchestrator';
export type {
  OrchestratorRequest,
  OrchestratorResponse,
  ConversationContext,
  InsightConfig,
} from './aiOrchestrator';

export {
  setCurrentScreen,
  getCurrentScreen,
  updateContext,
  getContext,
  getCurrentContext,
  clearContext,
  clearAllContexts,
  getContextStats,
} from './contextStore';

export {
  start as startProactiveEngine,
  stop as stopProactiveEngine,
  isActive as isProactiveEngineActive,
  getProactiveStats,
} from './proactiveEngine';

export { evaluateProactiveRules } from './proactiveAnalysis';
