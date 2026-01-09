/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CENTRAL NUCLEUS - O Único Ponto de Entrada do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo implementa o padrão "Único Cérebro" da arquitetura Azuria.
 * TODOS os eventos, decisões e ações passam por aqui.
 *
 * Hierarquia:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    CENTRAL NUCLEUS                              │
 * │                  (Único Ponto de Entrada)                       │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  ConsciousnessCore  │  Percepção, Decisão, Output              │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  Delegados:                                                     │
 * │  - ModeDeusDelegate  → Engines operacionais (Co-Pilot)         │
 * │  - AIDelegate        → Engines cognitivos (Análise/Predição)   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Regras:
 * 1. Nenhum engine pode agir sem permissão do Nucleus
 * 2. EventBus apenas transporta - não decide
 * 3. Toda decisão passa por ConsciousnessCore.DecisionEngine
 * 4. Delegados executam, não decidem
 *
 * @module azuria_ai/consciousness/CentralNucleus
 */

import { ConsciousnessCore, type InitConfig, type ProcessingResult } from './ConsciousnessCore';
import { type RawEvent } from './PerceptionGate';
import type { CognitiveRole, OutputMessage, SubscriptionTier } from './types';
import { getGlobalState, updateGlobalState } from './GlobalState';

// EventBusProxy para distribuição controlada
let eventBusProxyModule: typeof import('../core/EventBusProxy') | null = null;

// GovernedEmitter para emissão governada de eventos
let governedEmitterModule: typeof import('../core/GovernedEmitter') | null = null;

// EngineGovernance para controle de engines
let engineGovernanceModule: typeof import('../governance/EngineGovernance') | null = null;

// UnifiedStateStore para estado centralizado
let unifiedStateModule: typeof import('../state/UnifiedStateStore') | null = null;

// ConsciousnessLevels para separação ADMIN vs USER
let levelsModule: typeof import('../levels/ConsciousnessLevels') | null = null;

// UnifiedMemory para memória persistente
let memoryModule: typeof import('../memory/UnifiedMemory') | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DO NUCLEUS
// ═══════════════════════════════════════════════════════════════════════════════

/** Solicitação de ação de um delegado/engine */
export interface ActionRequest {
  /** ID único da solicitação */
  requestId: string;
  /** Quem está solicitando */
  source: 'mode-deus-delegate' | 'ai-delegate' | 'engine' | 'agent';
  /** Nome do engine/agente */
  sourceName: string;
  /** Tipo de ação */
  actionType: 'emit' | 'execute' | 'query' | 'update-state';
  /** Payload da ação */
  payload: unknown;
  /** Prioridade */
  priority: 'low' | 'normal' | 'high' | 'critical';
  /** Contexto adicional */
  context?: Record<string, unknown>;
}

/** Resposta do Nucleus para uma solicitação */
export interface ActionResponse {
  requestId: string;
  approved: boolean;
  reason?: string;
  result?: unknown;
  timestamp: number;
}

/** Estado do delegado */
export interface DelegateState {
  name: string;
  initialized: boolean;
  enabled: boolean;
  enginesManaged: string[];
  lastActivity: number;
}

/** Configuração do Nucleus */
export interface NucleusConfig extends InitConfig {
  /** Delegados a inicializar */
  delegates?: {
    modeDeus?: boolean;
    ai?: boolean;
  };
  /** Modo debug */
  debug?: boolean;
}

/** Callback para processar resultados */
type ResultCallback = (result: ProcessingResult) => void;

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO DO NUCLEUS
// ═══════════════════════════════════════════════════════════════════════════════

interface NucleusState {
  initialized: boolean;
  config: NucleusConfig;
  delegates: Map<string, DelegateState>;
  pendingRequests: Map<string, ActionRequest>;
  resultCallbacks: Set<ResultCallback>;
  stats: {
    requestsReceived: number;
    requestsApproved: number;
    requestsDenied: number;
    eventsProcessed: number;
  };
}

const nucleusState: NucleusState = {
  initialized: false,
  config: {},
  delegates: new Map(),
  pendingRequests: new Map(),
  resultCallbacks: new Set(),
  stats: {
    requestsReceived: 0,
    requestsApproved: 0,
    requestsDenied: 0,
    eventsProcessed: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

// Helper para inicializar módulo com tratamento de erro
async function tryInitModule<T>(
  name: string,
  initFn: () => Promise<T>,
  onSuccess?: (module: T) => void
): Promise<T | null> {
  try {
    const module = await initFn();
    onSuccess?.(module);
    log(`✓ ${name} initialized`);
    return module;
  } catch (error) {
    warn(`${name} not available:`, error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o Central Nucleus
 * Este é o ÚNICO ponto de inicialização do sistema Azuria AI
 */
export async function initNucleus(config: NucleusConfig = {}): Promise<{
  success: boolean;
  errors: string[];
}> {
  if (nucleusState.initialized) {
    return { success: true, errors: [] };
  }

  const errors: string[] = [];
  nucleusState.config = config;

  // 0. Inicializar UnifiedStateStore (estado centralizado)
  try {
    unifiedStateModule = await import('../state/UnifiedStateStore');
    unifiedStateModule.initUnifiedStore({
      debug: config.debug,
      persist: false, // Por agora, não persistir
    });
    
    // Inicializar com dados do usuário
    if (config.userId || config.role || config.tier) {
      unifiedStateModule.initializeWithUser(
        config.userId ?? null,
        config.role ?? 'USER',
        config.tier ?? 'FREE'
      );
    }
    log('✓ UnifiedStateStore initialized');
  } catch (error) {
    warn('UnifiedStateStore not available:', error);
  }

  // 0.5. Inicializar ConsciousnessLevels (separação ADMIN/USER)
  try {
    levelsModule = await import('../levels/ConsciousnessLevels');
    levelsModule.initLevels({ debug: config.debug });
    
    // Ativar nível baseado no role do usuário
    const role = config.role ?? 'USER';
    levelsModule.activateLevel(role);
    
    log(`✓ ConsciousnessLevels initialized (${role})`);
  } catch (error) {
    warn('ConsciousnessLevels not available:', error);
  }

  // 0.6. Inicializar UnifiedMemory (sistema de memória)
  try {
    memoryModule = await import('../memory/UnifiedMemory');
    await memoryModule.initMemory({
      userId: config.userId ?? 'anonymous',
      enableSync: !!config.userId, // Só sincroniza se tiver userId
      syncInterval: 60000, // 1 minuto
      debug: config.debug ?? false,
    });
    log('✓ UnifiedMemory initialized');
  } catch (error) {
    warn('UnifiedMemory not available:', error);
  }

  // 0.7. Inicializar GovernedEmitter (emissão governada)
  try {
    governedEmitterModule = await import('../core/GovernedEmitter');
    await governedEmitterModule.initGovernedEmitter();
    log('✓ GovernedEmitter initialized');
  } catch (error) {
    warn('GovernedEmitter not available:', error);
  }

  // 0.8. Instalar CompatibilityAdapter (cobertura imediata para engines legado)
  try {
    const compatAdapter = await import('../governance/CompatibilityAdapter');
    await compatAdapter.installCompatibilityAdapter();
    log('✓ CompatibilityAdapter installed - all emitEvent() now governed');
  } catch (error) {
    warn('CompatibilityAdapter not available:', error);
  }

  // 1. Inicializar ConsciousnessCore (o cérebro)
  try {
    await ConsciousnessCore.init({
      userId: config.userId,
      role: config.role,
      tier: config.tier,
      config: config.config,
    });
    log('✓ ConsciousnessCore initialized');
  } catch (error) {
    errors.push(`ConsciousnessCore: ${error}`);
    return { success: false, errors };
  }

  // 3. Registrar listener para outputs do ConsciousnessCore
  ConsciousnessCore.onOutput((output) => {
    handleCoreOutput(output);
  });

  // 4. Registrar listener para decisões (para distribuição de eventos)
  ConsciousnessCore.onDecision((event, decision) => {
    // Se a decisão foi 'emit' ou 'delegate', distribuir para engines
    if (decision.type === 'emit' || decision.type === 'delegate') {
      distributeEventToEngines(event);
    }

    if (nucleusState.config.debug) {
      log(`Decision: ${decision.type} for ${event.type}`, decision);
    }
  });

  // 5. Inicializar EventBusProxy
  try {
    eventBusProxyModule = await import('../core/EventBusProxy');
    eventBusProxyModule.initEventBusProxy({
      debug: config.debug,
      strictMode: false, // Por enquanto, permitir bypass durante migração
    });
    log('✓ EventBusProxy initialized');
  } catch (error) {
    warn('EventBusProxy not available:', error);
  }

  // 5.5. Inicializar EngineGovernance
  try {
    engineGovernanceModule = await import('../governance/EngineGovernance');
    engineGovernanceModule.initEngineGovernance({
      debug: config.debug,
      defaultPolicy: 'ask', // Por padrão, engines pedem permissão
      bypassDuringMigration: true, // Durante migração, permitir bypass
    });
    log('✓ EngineGovernance initialized');
  } catch (error) {
    warn('EngineGovernance not available:', error);
  }

  // 6. Inicializar delegados conforme configuração
  const delegateConfig = config.delegates ?? { modeDeus: true, ai: true };

  if (delegateConfig.modeDeus) {
    try {
      await initModeDeusDelegate(config.userId);
      log('✓ ModeDeusDelegate initialized');
    } catch (error) {
      errors.push(`ModeDeusDelegate: ${error}`);
    }
  }

  if (delegateConfig.ai) {
    try {
      await initAIDelegate();
      log('✓ AIDelegate initialized');
    } catch (error) {
      errors.push(`AIDelegate: ${error}`);
    }
  }

  nucleusState.initialized = true;
  log(`Central Nucleus initialized with ${nucleusState.delegates.size} delegates`);

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Desliga o Central Nucleus
 */
export function shutdownNucleus(): void {
  if (!nucleusState.initialized) {
    return;
  }

  log('Shutting down Central Nucleus...');

  // 1. Desligar EventBusProxy
  if (eventBusProxyModule) {
    eventBusProxyModule.shutdownEventBusProxy();
  }

  // 1.5. Desligar EngineGovernance
  if (engineGovernanceModule) {
    engineGovernanceModule.shutdownEngineGovernance();
  }

  // 2. Desligar delegados
  shutdownModeDeusDelegate();
  shutdownAIDelegate();

  // 3. Desligar ConsciousnessCore
  ConsciousnessCore.shutdown();

  // 3.5. Desligar UnifiedStateStore
  if (unifiedStateModule) {
    unifiedStateModule.shutdownUnifiedStore();
  }

  // 3.6. Desligar ConsciousnessLevels
  if (levelsModule) {
    levelsModule.shutdownLevels();
  }

  // 3.7. Desligar UnifiedMemory (sync final antes de encerrar)
  if (memoryModule) {
    try {
      memoryModule.shutdownMemory();
      log('✓ UnifiedMemory shutdown complete');
    } catch (error) {
      warn('Error shutting down UnifiedMemory:', error);
    }
  }

  // 3.8. Desligar GovernedEmitter
  if (governedEmitterModule) {
    governedEmitterModule.shutdownGovernedEmitter();
  }

  // 4. Limpar estado
  nucleusState.delegates.clear();
  nucleusState.pendingRequests.clear();
  nucleusState.resultCallbacks.clear();
  nucleusState.initialized = false;

  log('Central Nucleus shutdown complete');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA - ÚNICO PONTO DE ENTRADA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Envia um evento para o Nucleus processar
 * Esta é a ÚNICA forma de enviar eventos para o sistema
 */
export function send(event: RawEvent): void {
  if (!nucleusState.initialized) {
    warn('Nucleus not initialized, event dropped:', event.type);
    return;
  }

  nucleusState.stats.eventsProcessed++;
  ConsciousnessCore.send(event);
}

/**
 * Processa um evento de forma síncrona
 */
export async function process(event: RawEvent): Promise<ProcessingResult> {
  if (!nucleusState.initialized) {
    return { processed: false, reason: 'nucleus_not_initialized' };
  }

  nucleusState.stats.eventsProcessed++;
  return await ConsciousnessCore.process(event);
}

/**
 * Solicita permissão para executar uma ação
 * Engines e delegados DEVEM chamar isso antes de agir
 */
export async function requestAction(request: ActionRequest): Promise<ActionResponse> {
  nucleusState.stats.requestsReceived++;

  if (!nucleusState.initialized) {
    return {
      requestId: request.requestId,
      approved: false,
      reason: 'nucleus_not_initialized',
      timestamp: Date.now(),
    };
  }

  // Validar a solicitação
  const validation = validateRequest(request);
  if (!validation.valid) {
    nucleusState.stats.requestsDenied++;
    return {
      requestId: request.requestId,
      approved: false,
      reason: validation.reason,
      timestamp: Date.now(),
    };
  }

  // Processar conforme tipo de ação
  const result = await processActionRequest(request);

  if (result.approved) {
    nucleusState.stats.requestsApproved++;
  } else {
    nucleusState.stats.requestsDenied++;
  }

  return result;
}

/**
 * Registra callback para receber resultados de processamento
 */
export function onResult(callback: ResultCallback): () => void {
  nucleusState.resultCallbacks.add(callback);
  return () => nucleusState.resultCallbacks.delete(callback);
}

/**
 * Atualiza contexto global
 */
export function updateContext(updates: {
  screen?: string;
  activity?: string;
  role?: CognitiveRole;
  tier?: SubscriptionTier;
}): void {
  if (!nucleusState.initialized) {
    return;
  }

  ConsciousnessCore.updateContext({
    screen: updates.screen,
    activity: updates.activity,
  });

  // Atualizar estado global se role/tier mudaram
  if (updates.role || updates.tier) {
    const currentState = getGlobalState();
    updateGlobalState({
      identity: {
        ...currentState.identity,
        ...(updates.role && { role: updates.role }),
        ...(updates.tier && { tier: updates.tier }),
      },
    });
  }
}

/**
 * Solicita modo silêncio
 */
export function requestSilence(durationMs?: number): void {
  if (!nucleusState.initialized) {
    return;
  }
  ConsciousnessCore.requestSilence(durationMs);
}

/**
 * Remove modo silêncio
 */
export function disableSilence(): void {
  if (!nucleusState.initialized) {
    return;
  }
  ConsciousnessCore.disableSilence();
}

/**
 * Obtém estatísticas do Nucleus
 */
export function getStats() {
  return {
    nucleus: { ...nucleusState.stats },
    core: ConsciousnessCore.getStats(),
    delegates: Array.from(nucleusState.delegates.values()),
    governance: engineGovernanceModule?.getGovernanceStats() ?? null,
  };
}

/**
 * Obtém estado global
 */
export function getState() {
  return ConsciousnessCore.getState();
}

/**
 * Verifica se está inicializado
 */
export function isInitialized(): boolean {
  return nucleusState.initialized;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELEGADOS
// ═══════════════════════════════════════════════════════════════════════════════

// --- ModeDeusDelegate ---
// Gerencia engines operacionais (Co-Pilot, suggestions, tutorials, etc.)

let modeDeusInitialized = false;
let modeDeusSubscriptions: (() => void)[] = [];

async function initModeDeusDelegate(userId?: string): Promise<void> {
  if (modeDeusInitialized) {
    return;
  }

  // Importar dinamicamente para evitar dependências circulares
  const { initModeDeus, shutdownModeDeus } = await import('../core/modeDeusOrchestrator');

  // Inicializar com configuração que respeita o Nucleus
  const result = await initModeDeus(userId, {
    enableCoPilot: true,
    enableProactiveSuggestions: false, // Nucleus controla
    enableLearning: true,
    enablePrediction: true,
    debugMode: nucleusState.config.debug ?? false,
    suggestionInterval: 0, // Desabilitado - Nucleus controla
  });

  if (!result.success) {
    throw new Error(`ModeDeusDelegate init failed: ${result.errors.join(', ')}`);
  }

  // Registrar estado do delegado
  nucleusState.delegates.set('mode-deus', {
    name: 'ModeDeusDelegate',
    initialized: true,
    enabled: true,
    enginesManaged: [
      'operational',
      'userContext',
      'uiWatcher',
      'throttler',
      'explanation',
      'bidding',
      'tutorial',
      'feedbackLoop',
      'patternLearning',
      'personalization',
      'nlp',
      'predictive',
      'proactive',
    ],
    lastActivity: Date.now(),
  });

  // Guardar referência para cleanup
  modeDeusSubscriptions.push(() => shutdownModeDeus());
  modeDeusInitialized = true;
}

function shutdownModeDeusDelegate(): void {
  if (!modeDeusInitialized) {
    return;
  }

  modeDeusSubscriptions.forEach((cleanup) => cleanup());
  modeDeusSubscriptions = [];
  nucleusState.delegates.delete('mode-deus');
  modeDeusInitialized = false;
}

// --- AIDelegate ---
// Gerencia engines cognitivos (análise, predição, governança, etc.)

let aiDelegateInitialized = false;
let aiDelegateSubscriptions: (() => void)[] = [];

async function initAIDelegate(): Promise<void> {
  if (aiDelegateInitialized) {
    return;
  }

  // Importar dinamicamente
  const { initializeOrchestrator, shutdownOrchestrator } = await import('../core/aiOrchestrator');

  // Inicializar
  initializeOrchestrator({
    enableAutoInsights: false, // Nucleus controla
  });

  // Registrar estado
  nucleusState.delegates.set('ai', {
    name: 'AIDelegate',
    initialized: true,
    enabled: true,
    enginesManaged: [
      'cognitive',
      'social',
      'metaPlanner',
      'temporal',
      'behavioral',
      'governance',
      'ethics',
      'safety',
      'truth',
      'stability',
      'revenue',
      'paywall',
      'brand',
      'affective',
    ],
    lastActivity: Date.now(),
  });

  aiDelegateSubscriptions.push(() => shutdownOrchestrator());
  aiDelegateInitialized = true;
}

function shutdownAIDelegate(): void {
  if (!aiDelegateInitialized) {
    return;
  }

  aiDelegateSubscriptions.forEach((cleanup) => cleanup());
  aiDelegateSubscriptions = [];
  nucleusState.delegates.delete('ai');
  aiDelegateInitialized = false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROCESSAMENTO INTERNO
// ═══════════════════════════════════════════════════════════════════════════════

function validateRequest(request: ActionRequest): { valid: boolean; reason?: string } {
  // Verificar se source é conhecido
  const knownSources = ['mode-deus-delegate', 'ai-delegate', 'engine', 'agent'];
  if (!knownSources.includes(request.source)) {
    return { valid: false, reason: 'unknown_source' };
  }

  // Verificar se o delegado está ativo (se for de um delegado)
  if (request.source.includes('delegate')) {
    const delegateName = request.source.replace('-delegate', '');
    const delegate = nucleusState.delegates.get(delegateName);
    if (!delegate?.enabled) {
      return { valid: false, reason: 'delegate_not_active' };
    }
  }

  // Verificar payload
  if (request.actionType === 'emit' && !request.payload) {
    return { valid: false, reason: 'emit_requires_payload' };
  }

  return { valid: true };
}

async function processActionRequest(request: ActionRequest): Promise<ActionResponse> {
  nucleusState.pendingRequests.set(request.requestId, request);

  try {
    switch (request.actionType) {
      case 'emit':
        return await processEmitRequest(request);

      case 'execute':
        return await processExecuteRequest(request);

      case 'query':
        return processQueryRequest(request);

      case 'update-state':
        return processStateUpdateRequest(request);

      default:
        return {
          requestId: request.requestId,
          approved: false,
          reason: 'unknown_action_type',
          timestamp: Date.now(),
        };
    }
  } finally {
    nucleusState.pendingRequests.delete(request.requestId);
  }
}

async function processEmitRequest(request: ActionRequest): Promise<ActionResponse> {
  // Converter para evento e passar pelo pipeline
  const event: RawEvent = {
    type: `${request.source}:${request.sourceName}:emit`,
    payload: (request.payload ?? {}) as Record<string, unknown>,
    timestamp: Date.now(),
    source: request.sourceName,
    metadata: {
      requestId: request.requestId,
      priority: request.priority,
      ...request.context,
    },
  };

  const result = await ConsciousnessCore.process(event);

  return {
    requestId: request.requestId,
    approved: result.processed && result.decision === 'emit',
    reason: result.reason,
    result: result.output,
    timestamp: Date.now(),
  };
}

async function processExecuteRequest(request: ActionRequest): Promise<ActionResponse> {
  // Para ações de execução, verificar governança primeiro
  const isAllowed = await checkGovernance(request);

  if (!isAllowed) {
    return {
      requestId: request.requestId,
      approved: false,
      reason: 'governance_blocked',
      timestamp: Date.now(),
    };
  }

  // Atualizar lastActivity do delegado
  const delegate = nucleusState.delegates.get(request.source.replace('-delegate', ''));
  if (delegate) {
    delegate.lastActivity = Date.now();
  }

  return {
    requestId: request.requestId,
    approved: true,
    timestamp: Date.now(),
  };
}

function processQueryRequest(request: ActionRequest): ActionResponse {
  // Queries são sempre permitidas (somente leitura)
  const state = getGlobalState();

  return {
    requestId: request.requestId,
    approved: true,
    result: state,
    timestamp: Date.now(),
  };
}

function processStateUpdateRequest(request: ActionRequest): ActionResponse {
  // Verificar se o source tem permissão para atualizar estado
  const allowedSources = ['mode-deus-delegate', 'ai-delegate'];

  if (!allowedSources.includes(request.source)) {
    return {
      requestId: request.requestId,
      approved: false,
      reason: 'insufficient_permissions',
      timestamp: Date.now(),
    };
  }

  // Aplicar update
  if (request.payload && typeof request.payload === 'object') {
    updateGlobalState(request.payload as Parameters<typeof updateGlobalState>[0]);
  }

  return {
    requestId: request.requestId,
    approved: true,
    timestamp: Date.now(),
  };
}

// Helper para verificar níveis de consciência
function checkLevelsGovernance(request: ActionRequest): boolean | null {
  if (!levelsModule) {return null;}
  
  const currentLevel = levelsModule.getCurrentLevel();
  if (!currentLevel) {return null;}
  
  // Se a fonte é um engine, verificar se o nível atual pode usá-lo
  if (request.source === 'engine' && !levelsModule.canUseEngine(currentLevel.role, request.sourceName)) {
    if (nucleusState.config.debug) {
      warn(`Engine ${request.sourceName} não permitido para nível ${currentLevel.role}`);
    }
    return false;
  }
  
  // Verificar limite de sugestões
  if (request.actionType === 'emit' && levelsModule.hasReachedSuggestionLimit()) {
    if (nucleusState.config.debug) {
      warn('Limite de sugestões atingido');
    }
    return false;
  }
  
  return null; // Continuar verificação
}

// Helper para verificar permissão de engine
async function checkEnginePermission(request: ActionRequest): Promise<boolean> {
  if (!engineGovernanceModule) {return true;}
  
  const engineId = request.sourceName;
  const engine = engineGovernanceModule.getEngine(engineId);
  
  // Se engine não registrado, permitir durante migração
  if (!engine) {
    if (nucleusState.config.debug) {
      warn(`Engine não registrado: ${engineId}`);
    }
    return true;
  }
  
  // Verificar se engine está habilitado
  if (!engine.enabled) {return false;}
  
  // Solicitar permissão para a ação
  const permission = await engineGovernanceModule.requestActionPermission({
    engineId,
    actionType: 'execute',
    payload: request.payload,
    priority: request.priority,
  });
  
  return permission.approved;
}

async function checkGovernance(request: ActionRequest): Promise<boolean> {
  // 1. Verificar níveis de consciência (ADMIN vs USER)
  const levelsResult = checkLevelsGovernance(request);
  if (levelsResult === false) {return false;}

  // 2. Se EngineGovernance não está disponível, permitir por padrão
  if (!engineGovernanceModule) {return true;}

  // 3. Se a fonte é um engine, verificar permissão via EngineGovernance
  if (request.source === 'engine') {
    return checkEnginePermission(request);
  }

  // 4. Para delegados, sempre permitir (eles já passaram pelo Nucleus)
  if (request.source.includes('delegate')) {return true;}

  // 5. Agentes precisam de permissão (por agora, sempre permitir)
  if (request.source === 'agent') {return true;}

  return true;
}

function handleCoreOutput(output: OutputMessage): void {
  // Notificar callbacks registrados
  nucleusState.resultCallbacks.forEach((callback) => {
    try {
      callback({
        processed: true,
        decision: 'emit',
        output,
      });
    } catch (error) {
      warn('Result callback error:', error);
    }
  });
}

/**
 * Distribui um evento aprovado para os engines via EventBusProxy
 */
function distributeEventToEngines(event: import('./PerceptionGate').NormalizedEvent): void {
  if (!eventBusProxyModule) {
    return;
  }

  // Helper para converter prioridade
  const getPriorityValue = (p: string): number => {
    if (p === 'critical') { return 3; }
    if (p === 'high') { return 2; }
    return 1;
  };

  // Converter NormalizedEvent para AzuriaEvent
  const eventPriority = getPriorityValue(event.priority);
  const azuriaEvent = {
    tipo: event.type as import('../core/eventBus').EventType,
    payload: event.payload,
    timestamp: event.timestamp,
    source: event.source,
    priority: eventPriority,
    metadata: {
      ...event.metadata,
      nucleusApproved: true,
    },
  };

  // Distribuir via proxy
  eventBusProxyModule.distributeApprovedEvent(azuriaEvent);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

function log(message: string, data?: unknown): void {
  if (nucleusState.config.debug) {
    // eslint-disable-next-line no-console
    console.log(`[CentralNucleus] ${message}`, data ?? '');
  }
}

function warn(message: string, data?: unknown): void {
  // eslint-disable-next-line no-console
  console.warn(`[CentralNucleus] ${message}`, data ?? '');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DO SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

export const CentralNucleus = {
  // Lifecycle
  init: initNucleus,
  shutdown: shutdownNucleus,
  isInitialized,

  // Event processing (único ponto de entrada)
  send,
  process,

  // Action requests (para engines/delegados)
  requestAction,

  // Results
  onResult,

  // Context
  updateContext,

  // Silence
  requestSilence,
  disableSilence,

  // State
  getStats,
  getState,
};

export default CentralNucleus;
