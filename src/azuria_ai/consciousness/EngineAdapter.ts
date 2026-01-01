/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ENGINE ADAPTER - Adaptador para Engines Legados
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este módulo fornece adaptadores para integrar os engines existentes
 * ao novo ConsciousnessCore sem quebrar a compatibilidade.
 * 
 * Classificação dos Engines:
 * 
 * INTERNOS (não emitem eventos, apenas são consultados):
 * - cognitiveEngine: análise cognitiva
 * - operationalStateEngine: estado operacional
 * - temporalEngine: análise temporal
 * - holisticStateEngine: saúde do sistema
 * - userContextEngine: contexto do usuário
 * 
 * AGENTES CONVOCÁVEIS (chamados pelo núcleo quando necessário):
 * - priceMonitoringAgent: monitoramento de preços
 * - portalMonitorAgent: monitoramento de editais
 * - suggestionThrottler: controle de sugestões
 * 
 * DESCONTINUADOS (funcionalidade absorvida pelo núcleo):
 * - integratedOrchestrator → substituído por ConsciousnessCore
 * - integratedCoreEngine → substituído por GlobalState
 * - aiOrchestrator → substituído por DecisionEngine
 * - modeDeusOrchestrator → substituído por ConsciousnessCore
 * - proactiveAssistant → substituído por OutputGate
 * - consciousOrchestrator → substituído por DecisionEngine
 */

import { sendEvent, type ProcessingResult } from './ConsciousnessCore';
import { 
  getGlobalState, 
  updateStateSection,
  updateUserActivity,
  updateSystemHealth,
} from './GlobalState';
import { AIRouter, executeAI, generateRequestId, type AIRequest } from './AIRouter';
import type { 
  CognitiveRole, 
  EventPriority, 
  EngineAnalysis,
  UserActivityState,
} from './types';
import type { RawEvent } from './PerceptionGate';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Interface para engine interno */
export interface InternalEngine {
  /** Nome do engine */
  name: string;
  /** Inicializa o engine */
  init?: () => Promise<void> | void;
  /** Analisa dados e retorna resultado */
  analyze: (context: EngineContext) => Promise<EngineAnalysis> | EngineAnalysis;
  /** Para o engine */
  stop?: () => void;
}

/** Contexto passado para engines */
export interface EngineContext {
  /** Dados de entrada */
  data: Record<string, unknown>;
  /** Estado global (somente leitura) */
  globalState: ReturnType<typeof getGlobalState>;
  /** Papel do usuário */
  userRole: CognitiveRole;
  /** Tela atual */
  currentScreen: string;
  /** Atividade atual */
  userActivity: UserActivityState;
}

/** Interface para agente convocável */
export interface CallableAgent {
  /** Nome do agente */
  name: string;
  /** Descrição do que o agente faz */
  description: string;
  /** Inicializa o agente */
  init?: (config?: Record<string, unknown>) => Promise<void> | void;
  /** Executa uma tarefa */
  execute: (task: AgentTask) => Promise<AgentResult>;
  /** Para o agente */
  stop?: () => void;
}

/** Tarefa para um agente */
export interface AgentTask {
  /** ID da tarefa */
  id: string;
  /** Tipo da tarefa */
  type: string;
  /** Dados de entrada */
  input: Record<string, unknown>;
  /** Prioridade */
  priority: EventPriority;
  /** Timeout (ms) */
  timeout: number;
}

/** Resultado de um agente */
export interface AgentResult {
  /** ID da tarefa */
  taskId: string;
  /** Se foi bem sucedido */
  success: boolean;
  /** Dados de saída */
  output?: Record<string, unknown>;
  /** Erro se houver */
  error?: string;
  /** Se deve emitir evento */
  shouldEmit: boolean;
  /** Evento a emitir (se shouldEmit) */
  eventToEmit?: RawEvent;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRO DE ENGINES E AGENTES
// ═══════════════════════════════════════════════════════════════════════════════

const internalEngines: Map<string, InternalEngine> = new Map();
const callableAgents: Map<string, CallableAgent> = new Map();

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTADORES PARA ENGINES LEGADOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cria adaptador para cognitiveEngine
 */
export function createCognitiveEngineAdapter(): InternalEngine {
  return {
    name: 'cognitiveEngine',
    
    async analyze(context: EngineContext): Promise<EngineAnalysis> {
      // Importar engine legado
      const cognitiveEngine = await import('../engines/cognitiveEngine');
      
      // Analisar padrões e anomalias
      const patterns = cognitiveEngine.detectPatterns();
      const anomalies = cognitiveEngine.detectAnomalies();
      
      return {
        engine: 'cognitiveEngine',
        confidence: 0.7,
        result: {
          patterns,
          anomalies,
        },
        recommendations: anomalies.length > 0 
          ? ['Revisar anomalias detectadas'] 
          : undefined,
      };
    },
  };
}

/**
 * Cria adaptador para temporalEngine
 */
export function createTemporalEngineAdapter(): InternalEngine {
  return {
    name: 'temporalEngine',
    
    async analyze(context: EngineContext): Promise<EngineAnalysis> {
      const temporalEngine = await import('../engines/temporalEngine');
      
      // Computar tendências
      const trends = temporalEngine.computeTrends('user');
      const prediction = temporalEngine.predictFutureState('user');
      
      return {
        engine: 'temporalEngine',
        confidence: trends ? 0.6 : 0.3,
        result: {
          trends,
          prediction,
        },
      };
    },
  };
}

/**
 * Cria adaptador para operationalStateEngine
 */
export function createOperationalStateAdapter(): InternalEngine {
  return {
    name: 'operationalStateEngine',
    
    async analyze(context: EngineContext): Promise<EngineAnalysis> {
      const operationalEngine = await import('../engines/operationalStateEngine');
      
      const state = operationalEngine.getState();
      
      // Atualizar GlobalState com informações operacionais
      updateSystemHealth({
        overallScore: state.load < 80 ? 1.0 - (state.load / 200) : 0.5,
      });
      
      return {
        engine: 'operationalStateEngine',
        confidence: 0.8,
        result: state,
      };
    },
  };
}

/**
 * Cria adaptador para userContextEngine
 */
export function createUserContextAdapter(): InternalEngine {
  return {
    name: 'userContextEngine',
    
    async analyze(context: EngineContext): Promise<EngineAnalysis> {
      const userContextEngine = await import('../engines/userContextEngine');
      
      const userContext = userContextEngine.getUserContext();
      const skillLevel = userContextEngine.detectSkillLevel();
      const activityState = userContextEngine.detectActivityState();
      const preferences = userContextEngine.inferPreferences();
      
      // Atualizar GlobalState
      updateUserActivity(activityState);
      
      return {
        engine: 'userContextEngine',
        confidence: 0.75,
        result: {
          context: userContext,
          skillLevel,
          activityState,
          preferences,
        },
      };
    },
  };
}

/**
 * Cria adaptador para holisticStateEngine
 */
export function createHolisticStateAdapter(): InternalEngine {
  return {
    name: 'holisticStateEngine',
    
    async analyze(context: EngineContext): Promise<EngineAnalysis> {
      const holisticEngine = await import('../engines/holisticStateEngine');
      
      const health = holisticEngine.computeSystemHealth(context.data);
      const scan = holisticEngine.scanWholeSystem(context.data);
      
      // Atualizar GlobalState
      updateSystemHealth({
        overallScore: health?.score ?? 1.0,
      });
      
      return {
        engine: 'holisticStateEngine',
        confidence: health?.confidence ?? 0.5,
        result: {
          health,
          scan,
        },
      };
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTADORES PARA AGENTES CONVOCÁVEIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cria adaptador para priceMonitoringAgent
 */
export function createPriceMonitoringAdapter(): CallableAgent {
  let agent: Awaited<typeof import('../engines/priceMonitoringAgent')> | null = null;
  
  return {
    name: 'priceMonitoringAgent',
    description: 'Monitora preços de concorrentes e sugere ajustes',
    
    async init(config?: Record<string, unknown>): Promise<void> {
      agent = await import('../engines/priceMonitoringAgent');
      agent.priceMonitoringAgent.initPriceMonitoring(config?.apiKey as string);
    },
    
    async execute(task: AgentTask): Promise<AgentResult> {
      if (!agent) {
        return {
          taskId: task.id,
          success: false,
          error: 'Agent not initialized',
          shouldEmit: false,
        };
      }
      
      try {
        // O agente legado faz seu próprio loop - apenas retornamos status
        const status = agent.priceMonitoringAgent.getMonitoringStatus();
        
        return {
          taskId: task.id,
          success: true,
          output: { status },
          shouldEmit: false, // O agente não deve emitir diretamente
        };
      } catch (error) {
        return {
          taskId: task.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          shouldEmit: false,
        };
      }
    },
    
    stop(): void {
      if (agent) {
        agent.priceMonitoringAgent.stopMonitoring();
      }
    },
  };
}

/**
 * Cria adaptador para portalMonitorAgent
 */
export function createPortalMonitorAdapter(): CallableAgent {
  let agent: Awaited<typeof import('../agents/portalMonitorAgent')> | null = null;
  
  return {
    name: 'portalMonitorAgent',
    description: 'Monitora editais em portais de licitação',
    
    async init(config?: Record<string, unknown>): Promise<void> {
      agent = await import('../agents/portalMonitorAgent');
      // Agent se auto-inicializa no import
    },
    
    async execute(task: AgentTask): Promise<AgentResult> {
      if (!agent) {
        return {
          taskId: task.id,
          success: false,
          error: 'Agent not initialized',
          shouldEmit: false,
        };
      }
      
      // Por enquanto apenas status - agente tem seu próprio loop
      return {
        taskId: task.id,
        success: true,
        output: { message: 'Portal monitor running in background' },
        shouldEmit: false,
      };
    },
    
    stop(): void {
      if (agent) {
        agent.stopPortalMonitor();
      }
    },
  };
}

/**
 * Cria adaptador para suggestionThrottler
 */
export function createSuggestionThrottlerAdapter(): CallableAgent {
  let throttler: Awaited<typeof import('../engines/suggestionThrottler')> | null = null;
  
  return {
    name: 'suggestionThrottler',
    description: 'Controla frequência de sugestões',
    
    async init(): Promise<void> {
      throttler = await import('../engines/suggestionThrottler');
    },
    
    async execute(task: AgentTask): Promise<AgentResult> {
      if (!throttler) {
        return {
          taskId: task.id,
          success: false,
          error: 'Throttler not initialized',
          shouldEmit: false,
        };
      }
      
      // Verificar se pode mostrar sugestão
      if (task.type === 'check') {
        const suggestion = task.input.suggestion as Parameters<typeof throttler.canShowSuggestion>[0];
        const result = throttler.canShowSuggestion(suggestion);
        
        return {
          taskId: task.id,
          success: true,
          output: { result },
          shouldEmit: false,
        };
      }
      
      // Registrar sugestão mostrada
      if (task.type === 'record') {
        const suggestion = task.input.suggestion as Parameters<typeof throttler.recordSuggestionShown>[0];
        throttler.recordSuggestionShown(suggestion);
        
        return {
          taskId: task.id,
          success: true,
          shouldEmit: false,
        };
      }
      
      return {
        taskId: task.id,
        success: false,
        error: `Unknown task type: ${task.type}`,
        shouldEmit: false,
      };
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa todos os adaptadores
 */
export async function initEngineAdapters(): Promise<void> {
  // Registrar engines internos
  internalEngines.set('cognitiveEngine', createCognitiveEngineAdapter());
  internalEngines.set('temporalEngine', createTemporalEngineAdapter());
  internalEngines.set('operationalStateEngine', createOperationalStateAdapter());
  internalEngines.set('userContextEngine', createUserContextAdapter());
  internalEngines.set('holisticStateEngine', createHolisticStateAdapter());
  
  // Registrar agentes convocáveis
  callableAgents.set('priceMonitoringAgent', createPriceMonitoringAdapter());
  callableAgents.set('portalMonitorAgent', createPortalMonitorAdapter());
  callableAgents.set('suggestionThrottler', createSuggestionThrottlerAdapter());
  
  // Inicializar agentes
  for (const [name, agent] of callableAgents) {
    try {
      if (agent.init) {
        await agent.init();
      }
      // eslint-disable-next-line no-console
      console.log(`[EngineAdapter] Agent ${name} initialized`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[EngineAdapter] Failed to init ${name}:`, error);
    }
  }
  
  // eslint-disable-next-line no-console
  console.log('[EngineAdapter] All adapters initialized', {
    internalEngines: internalEngines.size,
    callableAgents: callableAgents.size,
  });
}

/**
 * Consulta um engine interno
 */
export async function queryEngine(
  engineName: string,
  data: Record<string, unknown> = {}
): Promise<EngineAnalysis | null> {
  const engine = internalEngines.get(engineName);
  
  if (!engine) {
    // eslint-disable-next-line no-console
    console.warn(`[EngineAdapter] Engine not found: ${engineName}`);
    return null;
  }
  
  const globalState = getGlobalState();
  const context: EngineContext = {
    data,
    globalState,
    userRole: globalState.identity.role,
    currentScreen: globalState.currentMoment.screen,
    userActivity: globalState.currentMoment.userActivity,
  };
  
  try {
    return await engine.analyze(context);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[EngineAdapter] Engine ${engineName} error:`, error);
    return null;
  }
}

/**
 * Convoca um agente para executar uma tarefa
 */
export async function invokeAgent(
  agentName: string,
  taskType: string,
  input: Record<string, unknown>,
  options: { priority?: EventPriority; timeout?: number } = {}
): Promise<AgentResult> {
  const agent = callableAgents.get(agentName);
  
  if (!agent) {
    return {
      taskId: 'unknown',
      success: false,
      error: `Agent not found: ${agentName}`,
      shouldEmit: false,
    };
  }
  
  const task: AgentTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: taskType,
    input,
    priority: options.priority || 'medium',
    timeout: options.timeout || 30000,
  };
  
  try {
    const result = await Promise.race([
      agent.execute(task),
      new Promise<AgentResult>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), task.timeout)
      ),
    ]);
    
    // Se agente quer emitir evento, fazer através do núcleo
    if (result.shouldEmit && result.eventToEmit) {
      sendEvent(result.eventToEmit);
    }
    
    return result;
  } catch (error) {
    return {
      taskId: task.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      shouldEmit: false,
    };
  }
}

/**
 * Consulta múltiplos engines e combina resultados
 */
export async function queryMultipleEngines(
  engineNames: string[],
  data: Record<string, unknown> = {}
): Promise<Map<string, EngineAnalysis>> {
  const results = new Map<string, EngineAnalysis>();
  
  const promises = engineNames.map(async (name) => {
    const result = await queryEngine(name, data);
    if (result) {
      results.set(name, result);
    }
  });
  
  await Promise.all(promises);
  
  return results;
}

/**
 * Obtém lista de engines internos disponíveis
 */
export function getAvailableEngines(): string[] {
  return Array.from(internalEngines.keys());
}

/**
 * Obtém lista de agentes disponíveis
 */
export function getAvailableAgents(): Array<{ name: string; description: string }> {
  return Array.from(callableAgents.entries()).map(([name, agent]) => ({
    name,
    description: agent.description,
  }));
}

/**
 * Para todos os agentes
 */
export function stopAllAgents(): void {
  for (const [name, agent] of callableAgents) {
    try {
      if (agent.stop) {
        agent.stop();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[EngineAdapter] Failed to stop ${name}:`, error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const EngineAdapter = {
  init: initEngineAdapters,
  queryEngine,
  invokeAgent,
  queryMultiple: queryMultipleEngines,
  getEngines: getAvailableEngines,
  getAgents: getAvailableAgents,
  stopAll: stopAllAgents,
};

export default EngineAdapter;

