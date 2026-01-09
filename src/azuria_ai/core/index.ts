/**
 * Azuria AI Core
 *
 * Export all core AI modules
 * 
 * ⚠️ IMPORTANTE: Para novos desenvolvimentos, use CentralNucleus como ponto de entrada.
 * Os módulos aqui são mantidos para compatibilidade.
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

// ════════════════════════════════════════════════════════════════════════════
// EVENT BUS - Sistema Nervoso
// ════════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Para engines, use EventBusProxy.register() ao invés de eventBus.on()
 * O EventBusProxy garante que eventos passem pelo CentralNucleus.
 */
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

/**
 * EventBusProxy - Forma CORRETA de engines escutarem eventos.
 * Garante que eventos passem pelo CentralNucleus antes de serem distribuídos.
 * 
 * @example
 * ```typescript
 * import { EventBusProxy } from '@/azuria_ai/core';
 * 
 * // Registrar listener controlado
 * const listenerId = EventBusProxy.register(
 *   'myEngine',
 *   'calc:completed',
 *   (event) => { ... }
 * );
 * 
 * // Emitir evento via proxy
 * EventBusProxy.emit('calc:completed', payload, 'myEngine');
 * ```
 */
export {
  EventBusProxy,
  initEventBusProxy,
  shutdownEventBusProxy,
  registerEngineListener,
  unregisterEngineListener,
  emitThroughProxy,
  distributeApprovedEvent,
  getProxyStats,
} from './EventBusProxy';
export type {
  EngineListenerRegistration,
  ProxyConfig,
} from './EventBusProxy';

// ════════════════════════════════════════════════════════════════════════════
// GOVERNED EMITTER - Emissão Governada de Eventos
// ════════════════════════════════════════════════════════════════════════════

/**
 * GovernedEmitter - Wrapper para emitEvent que aplica governança.
 * Use governedEmit() ao invés de emitEvent() para garantir que eventos
 * passem pelo sistema de governança do CentralNucleus.
 * 
 * @example
 * ```typescript
 * import { governedEmit } from '@/azuria_ai/core';
 * 
 * // Emitir evento governado
 * governedEmit('ai:pattern-detected', { patterns: [...] }, { source: 'myEngine' });
 * ```
 */
export {
  governedEmit,
  governedEmitAsync,
  emitEventGoverned,
  initGovernedEmitter,
  shutdownGovernedEmitter,
  getEmissionStats,
  getKnownEngines,
  isGovernedEmitterEnabled,
  getEnginesMigrationStatus,
} from './GovernedEmitter';
export type {
  GovernedEmitOptions,
  GovernedEmitResult,
} from './GovernedEmitter';

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
