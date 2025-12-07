/**
 * Event Bus
 *
 * Sistema de eventos para IA reativa.
 * Permite que a IA reaja a eventos do sistema em tempo real.
 */

export type EventType =
  | 'calc:started'
  | 'calc:completed'
  | 'calc:updated'
  | 'scenario:updated'
  | 'fees:updated'
  | 'tax:updated'
  | 'icms:updated'
  | 'st:updated'
  | 'bid:updated'
  | 'risk:updated'
  | 'discount:updated'
  | 'screen:changed'
  | 'screen:dataUpdated'
  | 'user:action'
  | 'ui:changed'
  | 'ui:actionClicked'
  | 'ui:displayInsight'
  | 'data:updated'
  | 'error:occurred'
  | 'insight:generated'
  | 'ai:predictive-insight'
  | 'AI:detectedRisk'
  | 'AI:detectedOpportunity'
  | 'AI:recommended-action'
  | 'ai:memory-updated'
  | 'ai:pattern-detected'
  | 'ai:forecast-generated'
  | 'ai:anomaly-detected'
  | 'ai:user-intent-inferred'
  | 'ai:emotion-inferred'
  | 'ai:user-profile-updated'
  | 'ui:adaptive-interface-changed'
  | 'ai:internal-drift'
  | 'ai:state-changed'
  | 'ai:model-confidence'
  | 'ai:signal-quality'
  | 'ai:consistency-warning'
  | 'ai:system-drift'
  | 'ai:dependency-gap'
  | 'ai:stability-restored'
  | 'ai:planner-goal-evaluated'
  | 'ai:planner-plan-generated'
  | 'ai:planner-plan-executed'
  | 'ai:planner-plan-adjusted'
  | 'ai:evolution-scan'
  | 'ai:evolution-weakness-found'
  | 'ai:evolution-patch-proposed'
  | 'ai:evolution-score-updated'
  | 'ai:core-sync'
  | 'ai:temporal-event'
  | 'ai:trend-detected'
  | 'ai:future-state-predicted'
  | 'ai:temporal-anomaly'
  | 'ai:perf-alert'
  | 'ai:fallback-engaged'
  | 'ai:pricing-opportunity'
  | 'ai:churn-risk'
  | 'ai:upgrade-opportunity'
  | 'ai:governance-alert'
  | 'ai:coherence-warning'
  | 'ai:decision-validated'
  | 'ai:action-executed'
  | 'ai:governance-violation'
  | 'agent:feedback'
  | 'agent:performance-shift'
  | 'agent:heuristic-updated'
  | 'agent:auto-tuned'
  | 'agent:anomaly-detected'
  | 'ai:internal-insight'
  | 'ai:contradiction-detected'
  | 'ai:explainable-decision'
  | 'ai:virtual-signal'
  | 'ai:context-reconstructed'
  | 'ai:silent-failure-detected'
  | 'ai:anomaly-behavior-detected'
  | 'ai:strategic-plan-generated'
  | 'ai:structural-risk-detected'
  | 'ai:long-term-goal-defined'
  | 'ai:system-health-updated'
  | 'ai:strategic-conflict-detected'
  | 'ai:engagement-progress'
  | 'ai:engagement-drop-detected'
  | 'ai:achievement-unlocked'
  | 'ai:user-motivation-level'
  | 'ai:next-best-action'
  | 'ai:story-generated'
  | 'ai:story-clarified'
  | 'ai:story-educational'
  | 'ai:story-commercial'
  | 'ai:brand-voice-applied'
  | 'ai:persona-adapted'
  | 'ai:tone-shift'
  | 'ai:communication-optimized'
  | 'ai:emotion-detected'
  | 'ai:affective-response'
  | 'ai:user-frustrated'
  | 'ai:user-confident'
  | 'ai:user-confused'
  | 'ai:user-hesitant'
  | 'ai:user-encouraged'
  | 'ai:decision-valid'
  | 'ai:decision-invalid'
  | 'ai:decision-corrected'
  | 'ai:unsafe-output-blocked'
  | 'ai:audited-decision'
  | 'ai:ethical-warning'
  | 'ai:alignment-corrected'
  | 'ai:safety-break'
  | 'ai:mind-snapshot'
  | 'ai:mind-warning'
  | 'ai:reality-updated'
  | 'ai:truth-alert'
  | 'ai:stability-alert'
  | 'ai:market-insight'
  | 'ai:personality-escalation'
  | 'ai:meta-layer-updated'
  | 'ai:nim-response'
  | 'ai:creator-alert'
  | 'ai.creator-alert'
  | 'ai.creator-insight'
  | 'ai.creator-recommendation'
  | 'ai.creator-roadmap'
  | 'system:tick'
  | 'ai:behavior-pattern-detected'
  | 'ai:ux-friction-detected'
  | 'ai:autofix-suggested'
  | 'ai:autofix-applied'
  | 'ai:positive-pattern-detected'
  | 'ai:flow-abandon-point'
  | 'ai:ux-optimized'
  | 'agent:tax-warning'
  | 'agent:tax-correction-suggested'
  | 'agent:optimal-price'
  | 'agent:margin-risk'
  | 'agent:competitive-price'
  | 'agent:listing-issue'
  | 'agent:risk-detected'
  | 'agent:loss-predicted'
  | 'agent:opportunity-found'
  | 'agent:boost-suggested'
  | 'ui:emotion-updated'
  | 'ui:adaptive-layout'
  | 'agent:called';

/**
 * Formato padronizado de evento
 */
export interface AzuriaEvent {
  tipo: EventType;
  payload: any;
  timestamp: number;
  source?: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export type EventHandler = (event: AzuriaEvent) => void | Promise<void>;

export interface EventSubscription {
  id: string;
  eventType: EventType;
  handler: EventHandler;
  once?: boolean; // Se deve ser executado apenas uma vez
}

// Armazenamento de subscrições por tipo de evento
const eventSubscriptions: Map<EventType, EventSubscription[]> = new Map();

// Histórico de eventos (limitado aos últimos 100)
const eventHistory: AzuriaEvent[] = [];
const MAX_HISTORY_SIZE = 100;

// Contador para IDs únicos de subscrição
let subscriptionIdCounter = 0;

/**
 * Registra um evento no histórico
 * @param event - Evento a ser registrado
 */
export function registerEvent(event: AzuriaEvent): void {
  eventHistory.push(event);

  // Limitar tamanho do histórico
  if (eventHistory.length > MAX_HISTORY_SIZE) {
    eventHistory.shift(); // Remove o mais antigo
  }
}

/**
 * Emite um evento no sistema
 * Notifica todos os handlers registrados para este tipo de evento
 *
 * @param tipo - Tipo do evento
 * @param payload - Dados do evento
 * @param options - Opções adicionais (source, priority, metadata)
 */
export function emitEvent(
  tipo: EventType,
  payload: any,
  options?: {
    source?: string;
    priority?: number;
    metadata?: Record<string, any>;
  }
): void {
  const event: AzuriaEvent = {
    tipo,
    payload,
    timestamp: Date.now(),
    source: options?.source || 'unknown',
    priority: options?.priority || 0,
    metadata: options?.metadata || {},
  };

  // Registrar no histórico
  registerEvent(event);

  // Obter handlers para este tipo de evento
  const handlers = eventSubscriptions.get(tipo) || [];

  // Executar handlers (ordenados por prioridade se necessário)
  const sortedHandlers = [...handlers].sort((a, b) => {
    const priorityA = event.priority || 0;
    const priorityB = event.priority || 0;
    return priorityB - priorityA; // Maior prioridade primeiro
  });

  sortedHandlers.forEach(subscription => {
    try {
      // Executar handler
      const result = subscription.handler(event);

      // Se retornar Promise, tratar erros
      if (result instanceof Promise) {
        result.catch(error => {
          console.error(`Error in event handler for ${tipo}:`, error);
        });
      }

      // Se for "once", remover subscrição
      if (subscription.once) {
        unsubscribeFromEvent(subscription.id);
      }
    } catch (error) {
      console.error(`Error executing handler for ${tipo}:`, error);
    }
  });
}

/**
 * Subscreve a um tipo de evento
 *
 * @param eventType - Tipo de evento
 * @param handler - Função a ser chamada quando o evento ocorrer
 * @param options - Opções da subscrição
 * @returns ID da subscrição (para cancelar depois)
 */
export function on(
  eventType: EventType,
  handler: EventHandler,
  options?: { once?: boolean }
): string {
  const subscriptionId = `sub_${++subscriptionIdCounter}_${Date.now()}`;

  const subscription: EventSubscription = {
    id: subscriptionId,
    eventType,
    handler,
    once: options?.once || false,
  };

  // Adicionar à lista de subscrições
  const handlers = eventSubscriptions.get(eventType) || [];
  handlers.push(subscription);
  eventSubscriptions.set(eventType, handlers);

  return subscriptionId;
}

/**
 * Subscreve a um evento que será executado apenas uma vez
 *
 * @param eventType - Tipo de evento
 * @param handler - Função a ser chamada
 * @returns ID da subscrição
 */
export function once(eventType: EventType, handler: EventHandler): string {
  return on(eventType, handler, { once: true });
}

/**
 * Cancela uma subscrição de evento
 *
 * @param subscriptionId - ID da subscrição
 * @returns true se removido com sucesso, false caso contrário
 */
export function unsubscribeFromEvent(subscriptionId: string): boolean {
  for (const [eventType, handlers] of eventSubscriptions.entries()) {
    const index = handlers.findIndex(sub => sub.id === subscriptionId);

    if (index !== -1) {
      handlers.splice(index, 1);

      // Se não há mais handlers, remover a entrada do Map
      if (handlers.length === 0) {
        eventSubscriptions.delete(eventType);
      } else {
        eventSubscriptions.set(eventType, handlers);
      }

      return true;
    }
  }

  return false;
}

/**
 * Remove todos os handlers de um tipo de evento
 *
 * @param eventType - Tipo de evento
 */
export function removeAllListeners(eventType: EventType): void {
  eventSubscriptions.delete(eventType);
}

/**
 * Obtém o histórico de eventos
 *
 * @param limit - Número máximo de eventos a retornar
 * @param filter - Filtro opcional por tipo de evento
 * @returns Array de eventos históricos
 */
export function getEventHistory(
  limit?: number,
  filter?: EventType
): AzuriaEvent[] {
  let history = [...eventHistory];

  // Aplicar filtro se fornecido
  if (filter) {
    history = history.filter(event => event.tipo === filter);
  }

  // Aplicar limite se fornecido
  if (limit && limit > 0) {
    history = history.slice(-limit); // Pegar os últimos N eventos
  }

  return history;
}

/**
 * Limpa o histórico de eventos
 */
export function clearEventHistory(): void {
  eventHistory.length = 0;
}

/**
 * Obtém estatísticas do event bus
 */
export function getEventBusStats() {
  const totalSubscriptions = Array.from(eventSubscriptions.values()).reduce(
    (sum, handlers) => sum + handlers.length,
    0
  );

  const subscriptionsByType: Record<string, number> = {};
  eventSubscriptions.forEach((handlers, eventType) => {
    subscriptionsByType[eventType] = handlers.length;
  });

  return {
    totalSubscriptions,
    subscriptionsByType,
    historySize: eventHistory.length,
    maxHistorySize: MAX_HISTORY_SIZE,
  };
}
