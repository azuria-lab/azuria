/**
 * useAdvancedCalcWatcher Hook
 *
 * Hook que monitora a Calculadora Avançada e envia eventos para a IA.
 * Detecta mudanças em cenários, taxas e cálculos avançados.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { emitEvent } from '../core/eventBus';

export interface AdvancedCalcWatcherOptions {
  enabled?: boolean;
  debounceMs?: number;
  captureScenarios?: boolean;
  captureFees?: boolean;
  autoEmitEvents?: boolean;
}

export interface AdvancedCalcData {
  custoProduto?: number;
  margemLucro?: number;
  custoOperacional?: number;
  impostos?: number;
  taxasMarketplace?: number;
  precoVenda?: number;
   
  cenarios?: Array<Record<string, unknown>>;
   
  taxasDetalhadas?: Record<string, unknown>;
   
  resultado?: Record<string, unknown>;
}

export interface AdvancedCalcEvent {
  type:
    | 'scenario_changed'
    | 'fees_changed'
    | 'calculation_completed'
    | 'error_occurred';
  data: AdvancedCalcData;
  timestamp: number;
  changedField?: string;
}

export interface UseAdvancedCalcWatcherReturn {
  isWatching: boolean;
  lastEvent: AdvancedCalcEvent | null;
  eventCount: number;
  startWatching: () => void;
  stopWatching: () => void;
  getEventHistory: () => AdvancedCalcEvent[];
  emitCalculationEvent: (
    data: AdvancedCalcData,
    type?: AdvancedCalcEvent['type']
  ) => void;
}

export function useAdvancedCalcWatcher(
  options: AdvancedCalcWatcherOptions = {}
): UseAdvancedCalcWatcherReturn {
  const {
    enabled = true,
    debounceMs = 500,
    captureScenarios = true,
    captureFees = true,
    autoEmitEvents = true,
  } = options;

  const [isWatching, setIsWatching] = useState(enabled);
  const [lastEvent, setLastEvent] = useState<AdvancedCalcEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const eventHistoryRef = useRef<AdvancedCalcEvent[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<AdvancedCalcData>({});

  /**
   * Emite um evento de cálculo avançado para o event bus
   */
  const emitCalculationEvent = useCallback(
    (
      data: AdvancedCalcData,
      type: AdvancedCalcEvent['type'] = 'calculation_completed'
    ) => {
      if (!isWatching) {return;}

      const calcEvent: AdvancedCalcEvent = {
        type,
        data,
        timestamp: Date.now(),
      };

      setLastEvent(calcEvent);
      setEventCount(prev => prev + 1);
      eventHistoryRef.current.push(calcEvent);

      if (eventHistoryRef.current.length > 50) {
        eventHistoryRef.current.shift();
      }

      if (autoEmitEvents) {
        // Emitir eventos específicos baseados no tipo
        if (type === 'scenario_changed' && captureScenarios) {
          emitEvent('scenario:updated', data, {
            source: 'useAdvancedCalcWatcher',
            priority: 5,
            metadata: { type },
          });
        } else if (type === 'fees_changed' && captureFees) {
          emitEvent('fees:updated', data, {
            source: 'useAdvancedCalcWatcher',
            priority: 4,
            metadata: { type },
          });
        } else {
          emitEvent('calc:updated', data, {
            source: 'useAdvancedCalcWatcher',
            priority: 5,
            metadata: { type },
          });
        }
      }
    },
    [isWatching, autoEmitEvents, captureScenarios, captureFees]
  );

  /**
   * Detecta mudanças nos dados do cálculo avançado
   * @internal - Função interna não exportada
   */
   
  const _handleDataChange = useCallback(
    (newData: AdvancedCalcData, changedField?: string) => {
      if (!isWatching) {return;}

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const calcEvent: AdvancedCalcEvent = {
          type: 'calculation_completed',
          data: newData,
          timestamp: Date.now(),
          changedField,
        };

        setLastEvent(calcEvent);
        eventHistoryRef.current.push(calcEvent);

        if (autoEmitEvents) {
          emitEvent('calc:updated', newData, {
            source: 'useAdvancedCalcWatcher',
            priority: 5,
            metadata: { changedField },
          });
        }

        previousDataRef.current = newData;
      }, debounceMs);
    },
    [isWatching, debounceMs, autoEmitEvents]
  );

  const startWatching = useCallback(() => {
    setIsWatching(true);
  }, []);

  const stopWatching = useCallback(() => {
    setIsWatching(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const getEventHistory = useCallback(() => {
    return [...eventHistoryRef.current];
  }, []);

  useEffect(() => {
    if (enabled) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [enabled, startWatching, stopWatching]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isWatching,
    lastEvent,
    eventCount,
    startWatching,
    stopWatching,
    getEventHistory,
    emitCalculationEvent,
  };
}

export default useAdvancedCalcWatcher;
