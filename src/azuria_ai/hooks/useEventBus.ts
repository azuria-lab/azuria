/**
 * useEventBus Hook
 * 
 * Hook React para uso seguro do EventBus com cleanup automático.
 * Garante que todas as subscrições são removidas quando o componente desmonta.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { subscribe, emit, subscribeMultiple } = useEventBus();
 * 
 *   useEffect(() => {
 *     // Subscrição única - cleanup automático
 *     subscribe('calc:completed', (event) => {
 *       console.log('Calculation completed:', event.payload);
 *     });
 *   }, [subscribe]);
 * 
 *   return <div>...</div>;
 * }
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  emitEvent,
  type EventHandler,
  type EventType,
  getEventBusStats,
  getEventHistory,
  on,
  once,
  unsubscribeFromEvent,
} from '../core/eventBus';

export interface UseEventBusOptions {
  /** Se deve fazer unsubscribe automático ao desmontar (padrão: true) */
  autoCleanup?: boolean;
  /** Prefixo para logs de debug */
  debugPrefix?: string;
  /** Ativar logs de debug */
  debug?: boolean;
}

export interface UseEventBusReturn {
  /**
   * Subscreve a um evento. A subscrição é automaticamente removida
   * quando o componente desmonta.
   */
  subscribe: (
    eventType: EventType,
    handler: EventHandler,
    options?: { once?: boolean }
  ) => string;
  
  /**
   * Subscreve a múltiplos eventos de uma vez.
   * Útil para componentes que precisam ouvir vários tipos de evento.
   */
  subscribeMultiple: (
    subscriptions: Array<{
      eventType: EventType;
      handler: EventHandler;
      once?: boolean;
    }>
  ) => string[];
  
  /**
   * Subscreve a um evento que será executado apenas uma vez.
   */
  subscribeOnce: (eventType: EventType, handler: EventHandler) => string;
  
  /**
   * Emite um evento no sistema.
   */
  emit: typeof emitEvent;
  
  /**
   * Remove uma subscrição específica manualmente.
   */
  unsubscribe: (subscriptionId: string) => boolean;
  
  /**
   * Remove todas as subscrições feitas por este hook.
   */
  unsubscribeAll: () => void;
  
  /**
   * Obtém histórico de eventos.
   */
  getHistory: typeof getEventHistory;
  
  /**
   * Obtém estatísticas do event bus.
   */
  getStats: typeof getEventBusStats;
  
  /**
   * Número de subscrições ativas deste hook.
   */
  activeSubscriptions: number;
}

/**
 * Hook para uso seguro do EventBus em componentes React.
 * 
 * Features:
 * - Cleanup automático ao desmontar componente
 * - API tipada para eventos
 * - Suporte a múltiplas subscrições
 * - Debug mode opcional
 */
export function useEventBus(options: UseEventBusOptions = {}): UseEventBusReturn {
  const {
    autoCleanup = true,
    debugPrefix = 'useEventBus',
    debug = false,
  } = options;

  // Armazena IDs de todas as subscrições para cleanup
  const subscriptionIds = useRef<Set<string>>(new Set());

  // Debug logger - usando função vazia em produção
  const log = useCallback(
    (..._args: unknown[]) => {
      // Debug desabilitado em produção para evitar poluir console
      // Em desenvolvimento, ative debug: true nas options
      if (debug && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug(`[${debugPrefix}]`, ..._args);
      }
    },
    [debug, debugPrefix]
  );

  // Subscribe com tracking
  const subscribe = useCallback(
    (
      eventType: EventType,
      handler: EventHandler,
      opts?: { once?: boolean }
    ): string => {
      const id = on(eventType, handler, opts);
      subscriptionIds.current.add(id);
      log('Subscribed to', eventType, '- ID:', id);
      return id;
    },
    [log]
  );

  // Subscribe once
  const subscribeOnce = useCallback(
    (eventType: EventType, handler: EventHandler): string => {
      const id = once(eventType, handler);
      subscriptionIds.current.add(id);
      log('Subscribed once to', eventType, '- ID:', id);
      return id;
    },
    [log]
  );

  // Subscribe múltiplo
  const subscribeMultiple = useCallback(
    (
      subscriptions: Array<{
        eventType: EventType;
        handler: EventHandler;
        once?: boolean;
      }>
    ): string[] => {
      const ids = subscriptions.map((sub) => {
        if (sub.once) {
          return subscribeOnce(sub.eventType, sub.handler);
        }
        return subscribe(sub.eventType, sub.handler);
      });
      log('Subscribed to multiple events:', ids.length);
      return ids;
    },
    [subscribe, subscribeOnce, log]
  );

  // Unsubscribe com tracking
  const unsubscribe = useCallback(
    (subscriptionId: string): boolean => {
      const result = unsubscribeFromEvent(subscriptionId);
      if (result) {
        subscriptionIds.current.delete(subscriptionId);
        log('Unsubscribed:', subscriptionId);
      }
      return result;
    },
    [log]
  );

  // Unsubscribe all
  const unsubscribeAll = useCallback(() => {
    const count = subscriptionIds.current.size;
    subscriptionIds.current.forEach((id) => {
      unsubscribeFromEvent(id);
    });
    subscriptionIds.current.clear();
    log('Unsubscribed all:', count, 'subscriptions');
  }, [log]);

  // Emit wrapper (sem mudanças, apenas para consistência da API)
  const emit = useCallback(
    (
      tipo: EventType,
      payload: unknown,
      emitOptions?: {
        source?: string;
        priority?: number;
        metadata?: Record<string, unknown>;
      }
    ) => {
      log('Emitting event:', tipo);
      emitEvent(tipo, payload, emitOptions);
    },
    [log]
  );

  // Cleanup automático ao desmontar
  useEffect(() => {
    // Copiar ref para variável local para cleanup seguro
    const currentSubscriptions = subscriptionIds.current;
    
    return () => {
      if (autoCleanup && currentSubscriptions.size > 0) {
        log('Auto-cleanup:', currentSubscriptions.size, 'subscriptions');
        currentSubscriptions.forEach((id) => {
          unsubscribeFromEvent(id);
        });
        currentSubscriptions.clear();
      }
    };
  }, [autoCleanup, log]);

  return {
    subscribe,
    subscribeMultiple,
    subscribeOnce,
    emit,
    unsubscribe,
    unsubscribeAll,
    getHistory: getEventHistory,
    getStats: getEventBusStats,
    get activeSubscriptions() {
      return subscriptionIds.current.size;
    },
  };
}

export default useEventBus;
