/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EVENT MAPPING - Mapeamento e Enriquecimento de Eventos
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Mapeia eventos existentes do EventBus para o ConsciousnessCore,
 * enriquecendo-os com contexto cognitivo relevante.
 * 
 * FASE A: Conexão - Garantir que eventos relevantes passem pelo Core
 */

import { getGlobalState } from '../GlobalState';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Configuração de mapeamento de evento */
export interface EventMapping {
  /** Se deve processar este evento */
  shouldProcess: boolean;
  /** Prioridade (0-10) */
  priority: number;
  /** Se é apenas para ADMIN */
  adminOnly?: boolean;
  /** Função para enriquecer contexto */
  enrichContext?: (payload: Record<string, unknown>, eventType: string) => Record<string, unknown>;
  /** Categoria cognitiva */
  cognitiveCategory?: 'hesitation' | 'pattern' | 'decision' | 'feedback' | 'system';
}

/** Mapeamento completo de eventos */
export type EventMappingMap = Record<string, EventMapping>;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE DETECÇÃO DE PADRÕES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detecta se margem está em categoria crítica
 */
function getMarginCategory(margin?: number): string | null {
  if (margin === undefined || margin === null) {
    return null;
  }
  
  if (margin < 5) {
    return 'critical';
  }
  if (margin < 10) {
    return 'tight';
  }
  if (margin < 15) {
    return 'low';
  }
  if (margin <= 40) {
    return 'healthy';
  }
  return 'high';
}

/**
 * Detecta se cálculo é de alto valor
 */
function isHighValueCalculation(payload: Record<string, unknown>): boolean {
  const value = (payload.precoVenda as number) || 
                ((payload.resultado as Record<string, unknown>)?.precoFinal as number) || 
                (payload.valor as number) || 0;
  return value > 10000;
}

/**
 * Detecta quick bounce (navegação rápida)
 */
let navigationHistory: Array<{ screen: string; timestamp: number }> = [];

function detectQuickBounce(to: string): boolean {
  const now = Date.now();
  const recent = navigationHistory.filter(n => now - n.timestamp < 30000); // 30s
  
  if (recent.length >= 3) {
    // Múltiplas navegações em pouco tempo
    return true;
  }
  
  navigationHistory.push({ screen: to, timestamp: now });
  
  // Limitar histórico
  if (navigationHistory.length > 10) {
    navigationHistory = navigationHistory.slice(-10);
  }
  
  return false;
}

/**
 * Detecta se é retorno a uma tela
 */
const screenVisitCount: Map<string, number> = new Map();

function isReturningToScreen(screen: string): boolean {
  const count = screenVisitCount.get(screen) || 0;
  screenVisitCount.set(screen, count + 1);
  return count > 0;
}

/**
 * Detecta hesitação em campo
 */
const fieldFocusHistory: Map<string, Array<number>> = new Map();
const fieldIdleTime: Map<string, number> = new Map();

function detectHesitation(fieldId: string, interactionType: string): boolean {
  const now = Date.now();
  
  if (interactionType === 'focus') {
    fieldIdleTime.set(fieldId, now);
    
    const history = fieldFocusHistory.get(fieldId) || [];
    history.push(now);
    fieldFocusHistory.set(fieldId, history.slice(-5)); // Últimas 5 focadas
  }
  
  if (interactionType === 'blur') {
    const focusTime = fieldIdleTime.get(fieldId);
    if (focusTime) {
      const idleDuration = now - focusTime;
      fieldIdleTime.delete(fieldId);
      
      // Se ficou mais de 12s no campo, pode ser hesitação
      return idleDuration > 12000;
    }
  }
  
  return false;
}

/**
 * Conta quantas vezes um campo foi focado
 */
function getFieldFocusCount(fieldId: string): number {
  return fieldFocusHistory.get(fieldId)?.length || 0;
}

/**
 * Detecta se valor foi revertido
 */
const fieldValueHistory: Map<string, Array<unknown>> = new Map();

function detectValueRevert(fieldId: string, newValue: unknown): boolean {
  const history = fieldValueHistory.get(fieldId) || [];
  
  if (history.length >= 2) {
    const previous = history.at(-1);
    const beforePrevious = history.at(-2);
    
    // Se novo valor é igual ao anterior ao anterior, foi revertido
    if (newValue === beforePrevious && newValue !== previous) {
      return true;
    }
  }
  
  history.push(newValue);
  fieldValueHistory.set(fieldId, history.slice(-5));
  
  return false;
}

/**
 * Detecta padrão de cálculo repetido
 */
const calculationPatterns: Map<string, Array<number>> = new Map();

function detectCalculationPattern(calcType: string, margin: number): {
  isPattern: boolean;
  count: number;
  values: number[];
} {
  const patternKey = `${calcType}:margin`;
  const history = calculationPatterns.get(patternKey) || [];
  
  // Verificar se valores são similares (±2%)
  const similarValues = history.filter(v => Math.abs(v - margin) < 2);
  
  history.push(margin);
  calculationPatterns.set(patternKey, history.slice(-10));
  
  return {
    isPattern: similarValues.length >= 2,
    count: similarValues.length + 1,
    values: history.slice(-5),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEAMENTO DE EVENTOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mapeamento completo de eventos existentes → Core
 */
export const EVENT_MAPPING: EventMappingMap = {
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE CÁLCULO (Alto Valor Cognitivo)
  // ═══════════════════════════════════════════════════════════════════════════
  
  'calc:completed': {
    shouldProcess: true,
    priority: 8,
    cognitiveCategory: 'decision',
    enrichContext: (payload: Record<string, unknown>) => {
      const margin = (payload.margemLucro as number | undefined) ?? 
                     ((payload.resultado as Record<string, unknown>)?.margemReal as number | undefined);
      const calcType = (payload.calcType as string) || 'standard';
      
      return {
        ...payload,
        calculationType: calcType,
        isHighValue: isHighValueCalculation(payload),
        marginCategory: getMarginCategory(margin),
        marginValue: margin,
        // Detectar padrões
        calculationPattern: detectCalculationPattern(calcType, margin || 0),
      };
    },
  },
  
  'calc:updated': {
    shouldProcess: true,
    priority: 4,
    cognitiveCategory: 'hesitation',
    enrichContext: (payload: Record<string, unknown>) => ({
      ...payload,
      isHighValue: isHighValueCalculation(payload),
      marginCategory: getMarginCategory(payload.margemLucro as number | undefined),
    }),
  },
  
  'calc:started': {
    shouldProcess: true,
    priority: 3,
    cognitiveCategory: 'decision',
    enrichContext: (payload: Record<string, unknown>) => ({
      ...payload,
      calculationType: (payload.calcType as string) || 'standard',
    }),
  },
  
  'calc:error': {
    shouldProcess: true,
    priority: 7,
    cognitiveCategory: 'feedback',
    enrichContext: (payload: Record<string, unknown>) => {
      const error = payload.error as Record<string, unknown> | undefined;
      return {
        ...payload,
        errorType: (error?.type as string) || 'unknown',
        isRecoverable: (error?.recoverable as boolean) !== false,
      };
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE NAVEGAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  
  'user:navigation': {
    shouldProcess: true,
    priority: 5,
    cognitiveCategory: 'pattern',
    enrichContext: (payload: Record<string, unknown>) => {
      const to = (payload.to as string) || (payload.screen as string) || 'unknown';
      return {
        ...payload,
        to,
        isQuickBounce: detectQuickBounce(to),
        isReturnVisit: isReturningToScreen(to),
        from: (payload.from as string) || 'unknown',
      };
    },
  },
  
  'screen:changed': {
    shouldProcess: true,
    priority: 5,
    cognitiveCategory: 'pattern',
    enrichContext: (payload: Record<string, unknown>) => {
      const screen = (payload.screen as string) || (payload.path as string) || 'unknown';
      return {
        ...payload,
        screen,
        isQuickBounce: detectQuickBounce(screen),
        isReturnVisit: isReturningToScreen(screen),
      };
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE INTERAÇÃO DO USUÁRIO
  // ═══════════════════════════════════════════════════════════════════════════
  
  'user:input': {
    shouldProcess: true,
    priority: 4,
    cognitiveCategory: 'hesitation',
    enrichContext: (payload: Record<string, unknown>) => {
      const fieldId = (payload.targetId as string) || (payload.inputId as string) || 'unknown';
      const interactionType = (payload.interactionType as string) || 'change';
      
      return {
        ...payload,
        fieldId,
        interactionType,
        hesitationDetected: detectHesitation(fieldId, interactionType),
        fieldFocusCount: getFieldFocusCount(fieldId),
        valueReverted: detectValueRevert(fieldId, payload.value),
      };
    },
  },
  
  'user:action': {
    shouldProcess: true,
    priority: 6,
    cognitiveCategory: 'decision',
    enrichContext: (payload: Record<string, unknown>) => {
      const action = (payload.action as string) || (payload.type as string) || '';
      return {
        ...payload,
        actionType: action,
        isCriticalAction: ['submit', 'export', 'save', 'delete'].includes(action),
      };
    },
  },
  
  'user:calculation': {
    shouldProcess: true,
    priority: 7,
    cognitiveCategory: 'decision',
    enrichContext: (payload) => ({
      ...payload,
      calculatorType: payload.calculatorType || 'standard',
      success: payload.success !== false,
      duration: payload.durationMs || 0,
    }),
  },
  
  'user:error': {
    shouldProcess: true,
    priority: 8,
    cognitiveCategory: 'feedback',
    enrichContext: (payload) => ({
      ...payload,
      errorType: payload.errorType || 'unknown',
      screen: payload.screen || 'unknown',
      isRecoverable: payload.recoverable !== false,
    }),
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE FEEDBACK IMPLÍCITO
  // ═══════════════════════════════════════════════════════════════════════════
  
  'user:suggestion-accepted': {
    shouldProcess: true,
    priority: 6,
    cognitiveCategory: 'feedback',
    enrichContext: (payload) => ({
      ...payload,
      feedbackType: 'positive',
      suggestionId: payload.id || payload.suggestionId,
    }),
  },
  
  'user:suggestion-dismissed': {
    shouldProcess: true,
    priority: 5,
    cognitiveCategory: 'feedback',
    enrichContext: (payload) => ({
      ...payload,
      feedbackType: 'negative',
      suggestionId: payload.id || payload.suggestionId,
      reason: payload.reason || 'user_dismissed',
    }),
  },
  
  'user:suggestion-expired': {
    shouldProcess: true,
    priority: 3,
    cognitiveCategory: 'feedback',
    enrichContext: (payload) => ({
      ...payload,
      feedbackType: 'neutral',
      suggestionId: payload.id || payload.suggestionId,
    }),
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE CONTEXTO
  // ═══════════════════════════════════════════════════════════════════════════
  
  'user:context-updated': {
    shouldProcess: true,
    priority: 3,
    cognitiveCategory: 'pattern',
    enrichContext: (payload) => ({
      ...payload,
      context: payload.context || {},
    }),
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE SISTEMA (ADMIN ONLY)
  // ═══════════════════════════════════════════════════════════════════════════
  
  'ai:anomaly-detected': {
    shouldProcess: true,
    priority: 9,
    adminOnly: true,
    cognitiveCategory: 'system',
    enrichContext: (payload) => ({
      ...payload,
      anomalyType: payload.type || 'unknown',
      severity: payload.severity || 'medium',
    }),
  },
  
  'system:error': {
    shouldProcess: true,
    priority: 10,
    adminOnly: true,
    cognitiveCategory: 'system',
    enrichContext: (payload) => ({
      ...payload,
      errorCode: payload.code || 'unknown',
      isCritical: payload.critical !== false,
    }),
  },
  
  'ai:governance-alert': {
    shouldProcess: true,
    priority: 9,
    adminOnly: true,
    cognitiveCategory: 'system',
    enrichContext: (payload) => ({
      ...payload,
      violationType: payload.type || 'unknown',
      rule: payload.rule || 'unknown',
    }),
  },
  
  'system:health-check': {
    shouldProcess: true,
    priority: 7,
    adminOnly: true,
    cognitiveCategory: 'system',
    enrichContext: (payload) => ({
      ...payload,
      healthScore: ((payload.status as Record<string, unknown>)?.score as number) || 100,
      enginesStatus: payload.engines || {},
    }),
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE INSIGHT (Já processados, mas podem ser enriquecidos)
  // ═══════════════════════════════════════════════════════════════════════════
  
  'insight:generated': {
    shouldProcess: false, // Já processado pelo sistema antigo
    priority: 5,
  },
  
  'ai:recommended-action': {
    shouldProcess: false, // Já processado
    priority: 5,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém mapeamento para um tipo de evento
 */
export function getEventMapping(eventType: string): EventMapping | null {
  return EVENT_MAPPING[eventType] ?? null;
}

/**
 * Verifica se evento deve ser processado
 */
export function shouldProcessEvent(eventType: string): boolean {
  const mapping = getEventMapping(eventType);
  if (!mapping) {
    return false; // Evento não mapeado = não processar
  }
  
  // Verificar se é admin-only
  if (mapping.adminOnly) {
    const state = getGlobalState();
    return state.identity.role === 'ADMIN';
  }
  
  return mapping.shouldProcess;
}

/**
 * Enriquece evento com contexto cognitivo
 */
export function enrichEvent(
  eventType: string,
  payload: Record<string, unknown>
): Record<string, unknown> {
  const mapping = getEventMapping(eventType);
  
  if (!mapping?.enrichContext) {
    return payload; // Sem enriquecimento
  }
  
  try {
    return mapping.enrichContext(payload, eventType);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[EventMapping] Error enriching ${eventType}:`, error);
    return payload; // Retornar original em caso de erro
  }
}

/**
 * Obtém prioridade do evento
 */
export function getEventPriority(eventType: string): number {
  const mapping = getEventMapping(eventType);
  return mapping?.priority ?? 5; // Default: média
}

/**
 * Obtém categoria cognitiva do evento
 */
export function getCognitiveCategory(eventType: string): string | undefined {
  const mapping = getEventMapping(eventType);
  return mapping?.cognitiveCategory;
}

/**
 * Lista todos os eventos mapeados
 */
export function getMappedEventTypes(): string[] {
  return Object.keys(EVENT_MAPPING);
}

/**
 * Lista eventos por categoria cognitiva
 */
export function getEventsByCategory(category: string): string[] {
  return Object.entries(EVENT_MAPPING)
    .filter(([_, mapping]) => mapping.cognitiveCategory === category)
    .map(([type]) => type);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  getMapping: getEventMapping,
  shouldProcess: shouldProcessEvent,
  enrich: enrichEvent,
  getPriority: getEventPriority,
  getCategory: getCognitiveCategory,
  getMappedTypes: getMappedEventTypes,
  getByCategory: getEventsByCategory,
};

