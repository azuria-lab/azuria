/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DECISION ENGINE - Motor de Decisão Central
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * O DecisionEngine é o cérebro lógico do Núcleo. Ele:
 * - Recebe eventos normalizados do PerceptionGate
 * - Consulta o estado global
 * - Convoca engines internos quando necessário
 * - Arbitra conflitos entre sugestões
 * - Decide a ação final: emitir, silenciar, delegar, escalar
 */

import type {
  AgentRequest,
  CognitiveRole,
  DecisionType,
  EngineAnalysis,
  EventCategory,
  EventPriority,
  MessageSeverity,
  MessageType,
  NormalizedEvent,
  OutputChannel,
} from './types';
import {
  getCurrentActivity,
  getGlobalState,
  getUserRole,
  isSilenced,
} from './GlobalState';
import { OutputGate, type OutputRequest } from './OutputGate';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Contexto para decisão */
export interface DecisionContext {
  /** Evento normalizado */
  event: NormalizedEvent;
  /** Score de relevância */
  relevanceScore: number;
  /** Estado atual do usuário */
  userState: {
    role: CognitiveRole;
    activity: string;
    silenced: boolean;
    currentScreen: string;
  };
  /** Análises de engines (se houver) */
  engineAnalyses?: EngineAnalysis[];
  /** Contexto adicional */
  additionalContext?: Record<string, unknown>;
}

/** Decisão tomada pelo engine */
export interface Decision {
  /** Tipo da decisão */
  type: DecisionType;
  /** Razão da decisão */
  reason: string;
  /** Confiança na decisão (0-1) */
  confidence: number;
  /** Dados para execução */
  payload?: {
    /** Para 'emit': dados da mensagem */
    output?: OutputRequest;
    /** Para 'delegate': dados do agente */
    agentRequest?: AgentRequest;
    /** Para 'schedule': quando executar */
    scheduleAt?: number;
    /** Para 'escalate': razão da escalação */
    escalationReason?: string;
  };
  /** Se deve registrar no log */
  shouldLog: boolean;
}

/** Regra de decisão */
interface DecisionRule {
  name: string;
  condition: (ctx: DecisionContext) => boolean;
  decide: (ctx: DecisionContext) => Decision;
  priority: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

interface DecisionEngineConfig {
  /** Se deve logar decisões */
  logDecisions: boolean;
  /** Confiança mínima para emitir */
  minConfidenceToEmit: number;
  /** Se deve usar engines para análise */
  useEnginesForAnalysis: boolean;
}

const DEFAULT_CONFIG: DecisionEngineConfig = {
  logDecisions: process.env.NODE_ENV === 'development',
  minConfidenceToEmit: 0.5,
  useEnginesForAnalysis: true,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO INTERNO
// ═══════════════════════════════════════════════════════════════════════════════

interface DecisionEngineState {
  config: DecisionEngineConfig;
  rules: DecisionRule[];
  decisionHistory: Array<{
    eventId: string;
    decision: DecisionType;
    timestamp: number;
  }>;
}

const state: DecisionEngineState = {
  config: { ...DEFAULT_CONFIG },
  rules: [],
  decisionHistory: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEAMENTOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Mapeia categoria de evento para tipo de mensagem */
function categoryToMessageType(category: EventCategory): MessageType {
  switch (category) {
    case 'calculation':
      return 'insight';
    case 'insight':
      return 'insight';
    case 'alert':
      return 'warning';
    case 'error':
      return 'error';
    case 'governance':
      return 'warning';
    default:
      return 'tip';
  }
}

/** Mapeia prioridade para severidade */
function priorityToSeverity(priority: EventPriority): MessageSeverity {
  switch (priority) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    case 'background':
      return 'info';
  }
}

/** Mapeia papel para canal */
function roleToChannel(role: CognitiveRole): OutputChannel {
  switch (role) {
    case 'ADMIN':
      return 'ADMIN';
    case 'USER':
      return 'USER';
    case 'SYSTEM':
      return 'SYSTEM';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGRAS DE DECISÃO PADRÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Regra: Eventos críticos sempre são emitidos
 */
const criticalEventRule: DecisionRule = {
  name: 'critical_always_emit',
  priority: 100,
  condition: (ctx) => ctx.event.priority === 'critical',
  decide: (ctx) => ({
    type: 'emit',
    reason: 'Evento crítico - sempre emitir',
    confidence: 1.0,
    payload: {
      output: createOutputFromEvent(ctx.event, ctx),
    },
    shouldLog: true,
  }),
};

/**
 * Regra: Silêncio solicitado - não emitir (exceto críticos)
 */
const silenceRule: DecisionRule = {
  name: 'respect_silence',
  priority: 90,
  condition: (ctx) => ctx.userState.silenced,
  decide: () => ({
    type: 'silence',
    reason: 'Silêncio solicitado pelo usuário',
    confidence: 1.0,
    shouldLog: false,
  }),
};

/**
 * Regra: Usuário ocupado - aguardar ou silenciar
 */
const userBusyRule: DecisionRule = {
  name: 'user_busy',
  priority: 80,
  condition: (ctx) => 
    ctx.userState.activity === 'calculando' || 
    ctx.userState.activity === 'preenchendo',
  decide: (ctx) => {
    // Alta prioridade: agendar para depois
    if (ctx.event.priority === 'high') {
      return {
        type: 'schedule',
        reason: 'Usuário ocupado, agendado para depois',
        confidence: 0.8,
        payload: {
          scheduleAt: Date.now() + 30000, // 30 segundos
        },
        shouldLog: true,
      };
    }
    // Baixa prioridade: silenciar
    return {
      type: 'silence',
      reason: 'Usuário ocupado, baixa prioridade',
      confidence: 0.9,
      shouldLog: false,
    };
  },
};

/**
 * Regra: Eventos de ADMIN para usuários normais - escalar ou ignorar
 */
const adminOnlyRule: DecisionRule = {
  name: 'admin_only',
  priority: 70,
  condition: (ctx) => 
    ctx.event.targetRole === 'ADMIN' && ctx.userState.role !== 'ADMIN',
  decide: () => ({
    type: 'silence',
    reason: 'Evento para ADMIN, usuário não é ADMIN',
    confidence: 1.0,
    shouldLog: false,
  }),
};

/**
 * Regra: Eventos de governança para ADMIN - escalar
 */
const governanceEscalationRule: DecisionRule = {
  name: 'governance_escalation',
  priority: 65,
  condition: (ctx) => 
    ctx.event.category === 'governance' && ctx.userState.role === 'ADMIN',
  decide: (ctx) => ({
    type: 'escalate',
    reason: 'Evento de governança requer atenção do ADMIN',
    confidence: 0.9,
    payload: {
      output: createOutputFromEvent(ctx.event, ctx),
      escalationReason: 'Violação de governança detectada',
    },
    shouldLog: true,
  }),
};

/**
 * Regra: Insights com baixa relevância - silenciar
 */
const lowRelevanceRule: DecisionRule = {
  name: 'low_relevance',
  priority: 50,
  condition: (ctx) => ctx.relevanceScore < 0.3,
  decide: () => ({
    type: 'silence',
    reason: 'Relevância muito baixa',
    confidence: 0.7,
    shouldLog: false,
  }),
};

/**
 * Regra: Eventos de cálculo durante cálculo - emitir
 */
const calculationContextRule: DecisionRule = {
  name: 'calculation_context',
  priority: 60,
  condition: (ctx) => 
    ctx.event.category === 'calculation' && 
    ctx.userState.activity === 'calculando',
  decide: (ctx) => ({
    type: 'emit',
    reason: 'Evento de cálculo relevante ao contexto atual',
    confidence: 0.85,
    payload: {
      output: createOutputFromEvent(ctx.event, ctx),
    },
    shouldLog: true,
  }),
};

/**
 * Regra padrão: emitir se relevância adequada
 */
const defaultEmitRule: DecisionRule = {
  name: 'default_emit',
  priority: 10,
  condition: (ctx) => ctx.relevanceScore >= 0.3,
  decide: (ctx) => ({
    type: 'emit',
    reason: 'Relevância adequada para emissão',
    confidence: Math.min(0.9, ctx.relevanceScore + 0.3),
    payload: {
      output: createOutputFromEvent(ctx.event, ctx),
    },
    shouldLog: true,
  }),
};

/**
 * Regra final: silenciar se nada mais aplicar
 */
const fallbackSilenceRule: DecisionRule = {
  name: 'fallback_silence',
  priority: 0,
  condition: () => true,
  decide: () => ({
    type: 'silence',
    reason: 'Nenhuma regra aplicável, silenciando por padrão',
    confidence: 0.5,
    shouldLog: false,
  }),
};

// Registrar regras padrão
state.rules = [
  criticalEventRule,
  silenceRule,
  userBusyRule,
  adminOnlyRule,
  governanceEscalationRule,
  lowRelevanceRule,
  calculationContextRule,
  defaultEmitRule,
  fallbackSilenceRule,
].sort((a, b) => b.priority - a.priority);

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cria uma requisição de output a partir de um evento
 */
function createOutputFromEvent(
  event: NormalizedEvent,
  ctx: DecisionContext
): OutputRequest {
  const payload = event.payload;
  
  // Extrair título e mensagem do payload
  const title = (payload.title as string) || 
                (payload.message as string)?.substring(0, 50) || 
                `${event.category}: ${event.type}`;
  
  const message = (payload.message as string) || 
                  (payload.suggestion as string) ||
                  (payload.description as string) ||
                  JSON.stringify(payload);
  
  const topic = (payload.topic as string) || 
                (payload.category as string) || 
                event.category;
  
  // Extrair ações se existirem
  const actions = payload.actions as OutputRequest['actions'] | undefined;
  
  return {
    type: categoryToMessageType(event.category),
    severity: priorityToSeverity(event.priority),
    title,
    message,
    channel: roleToChannel(event.targetRole),
    topic,
    actions,
    context: {
      screen: ctx.userState.currentScreen,
      eventId: event.id,
    },
    dismissable: event.priority !== 'critical',
  };
}

/**
 * Registra uma decisão no histórico
 */
function recordDecision(eventId: string, decision: DecisionType): void {
  state.decisionHistory.unshift({
    eventId,
    decision,
    timestamp: Date.now(),
  });
  
  // Manter últimas 100 decisões
  if (state.decisionHistory.length > 100) {
    state.decisionHistory = state.decisionHistory.slice(0, 100);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Toma uma decisão sobre um evento
 */
export function decide(context: DecisionContext): Decision {
  // Avaliar regras em ordem de prioridade
  for (const rule of state.rules) {
    if (rule.condition(context)) {
      const decision = rule.decide(context);
      
      // Log se configurado
      if (state.config.logDecisions && decision.shouldLog) {
        // eslint-disable-next-line no-console
        console.log(
          `[DecisionEngine] ${rule.name}: ${decision.type} - ${decision.reason}`,
          { eventId: context.event.id, confidence: decision.confidence }
        );
      }
      
      // Registrar no histórico
      recordDecision(context.event.id, decision.type);
      
      return decision;
    }
  }
  
  // Não deveria chegar aqui (fallback rule sempre aplica)
  return {
    type: 'silence',
    reason: 'Nenhuma regra encontrada',
    confidence: 0,
    shouldLog: true,
  };
}

/**
 * Cria contexto de decisão a partir de um evento normalizado
 */
export function createDecisionContext(
  event: NormalizedEvent,
  relevanceScore: number,
  additionalContext?: Record<string, unknown>
): DecisionContext {
  const globalState = getGlobalState();
  
  return {
    event,
    relevanceScore,
    userState: {
      role: getUserRole(),
      activity: getCurrentActivity(),
      silenced: isSilenced(),
      currentScreen: globalState.currentMoment.screen,
    },
    additionalContext,
  };
}

/**
 * Adiciona uma regra de decisão customizada
 */
export function addDecisionRule(rule: DecisionRule): void {
  state.rules.push(rule);
  // Reordenar por prioridade
  state.rules.sort((a, b) => b.priority - a.priority);
}

/**
 * Remove uma regra por nome
 */
export function removeDecisionRule(ruleName: string): boolean {
  const index = state.rules.findIndex(r => r.name === ruleName);
  if (index >= 0) {
    state.rules.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Obtém histórico de decisões recentes
 */
export function getDecisionHistory(): Array<{
  eventId: string;
  decision: DecisionType;
  timestamp: number;
}> {
  return [...state.decisionHistory];
}

/**
 * Obtém estatísticas de decisões
 */
export function getDecisionStats(): Record<DecisionType, number> {
  const stats: Record<DecisionType, number> = {
    emit: 0,
    suggest: 0,
    execute: 0,
    schedule: 0,
    escalate: 0,
    silence: 0,
    delegate: 0,
  };
  
  for (const entry of state.decisionHistory) {
    stats[entry.decision]++;
  }
  
  return stats;
}

/**
 * Atualiza configuração
 */
export function updateConfig(config: Partial<DecisionEngineConfig>): void {
  state.config = { ...state.config, ...config };
}

/**
 * Reseta o engine
 */
export function reset(): void {
  state.decisionHistory = [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const DecisionEngine = {
  decide,
  createContext: createDecisionContext,
  addRule: addDecisionRule,
  removeRule: removeDecisionRule,
  getHistory: getDecisionHistory,
  getStats: getDecisionStats,
  updateConfig,
  reset,
};

export default DecisionEngine;

