/**
 * useCalcWatcher Hook
 *
 * Hook que monitora a Calculadora Rápida e envia eventos para a IA.
 * Detecta mudanças nos inputs e resultados, emitindo eventos reativos.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { emitEvent } from '../core/eventBus';

export interface CalcWatcherOptions {
  enabled?: boolean;
  debounceMs?: number;
  captureInputs?: boolean;
  captureResults?: boolean;
  autoEmitEvents?: boolean;
}

export interface CalcData {
  custoProduto?: number;
  margemLucro?: number;
  custoOperacional?: number;
  impostos?: number;
  taxasMarketplace?: number;
  precoVenda?: number;
  resultado?: Record<string, unknown>;
}

export interface CalcEvent {
  type:
    | 'input_changed'
    | 'calculation_started'
    | 'calculation_completed'
    | 'error_occurred';
  data: CalcData;
  timestamp: number;
  changedField?: string;
}

export interface UseCalcWatcherReturn {
  isWatching: boolean;
  lastEvent: CalcEvent | null;
  eventCount: number;
  startWatching: () => void;
  stopWatching: () => void;
  getEventHistory: () => CalcEvent[];
  emitCalculationEvent: (data: CalcData, type?: CalcEvent['type']) => void;
  handleDataChange: (newData: CalcData, changedField?: string) => void;
}

export function useCalcWatcher(
  options: CalcWatcherOptions = {}
): UseCalcWatcherReturn {
  const {
    enabled = true,
    debounceMs = 500,
    captureInputs = true,
    captureResults: _captureResults = true,
    autoEmitEvents = true,
  } = options;

  const [isWatching, setIsWatching] = useState(enabled);
  const [lastEvent, setLastEvent] = useState<CalcEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const eventHistoryRef = useRef<CalcEvent[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<CalcData>({});

  /**
   * Emite um evento de cálculo para o event bus
   */
  const emitCalculationEvent = useCallback(
    (data: CalcData, type: CalcEvent['type'] = 'calculation_completed') => {
      if (!isWatching) {
        return;
      }

      const calcEvent: CalcEvent = {
        type,
        data,
        timestamp: Date.now(),
      };

      // Atualizar estado local
      setLastEvent(calcEvent);
      setEventCount(prev => prev + 1);
      eventHistoryRef.current.push(calcEvent);

      // Limitar histórico a 50 eventos
      if (eventHistoryRef.current.length > 50) {
        eventHistoryRef.current.shift();
      }

      // Emitir para o event bus global se habilitado
      if (autoEmitEvents) {
        emitEvent('calc:completed', data, {
          source: 'useCalcWatcher',
          priority: 5,
          metadata: {
            type,
            changedField: calcEvent.changedField,
          },
        });
      }
    },
    [isWatching, autoEmitEvents]
  );

  /**
   * Detecta mudanças nos dados do cálculo
   */
  const handleDataChange = useCallback(
    (newData: CalcData, changedField?: string) => {
      if (!isWatching || !captureInputs) {
        return;
      }

      // Limpar timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce para evitar muitos eventos
      debounceTimerRef.current = setTimeout(() => {
        const calcEvent: CalcEvent = {
          type: 'input_changed',
          data: newData,
          timestamp: Date.now(),
          changedField,
        };

        setLastEvent(calcEvent);
        eventHistoryRef.current.push(calcEvent);

        // Emitir evento de atualização
        if (autoEmitEvents) {
          emitEvent('calc:updated', newData, {
            source: 'useCalcWatcher',
            priority: 3,
            metadata: {
              changedField,
            },
          });
        }

        previousDataRef.current = newData;
      }, debounceMs);
    },
    [isWatching, captureInputs, debounceMs, autoEmitEvents]
  );

  /**
   * Inicia o monitoramento
   */
  const startWatching = useCallback(() => {
    setIsWatching(true);

    emitEvent(
      'calc:started',
      {},
      {
        source: 'useCalcWatcher',
        priority: 2,
      }
    );
  }, []);

  /**
   * Para o monitoramento
   */
  const stopWatching = useCallback(() => {
    setIsWatching(false);

    // Limpar timer de debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Retorna o histórico de eventos
   */
  const getEventHistory = useCallback(() => {
    return [...eventHistoryRef.current];
  }, []);

  // Iniciar/parar monitoramento baseado na opção enabled
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

  // Cleanup ao desmontar
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
    handleDataChange,
  };
}

export default useCalcWatcher;
