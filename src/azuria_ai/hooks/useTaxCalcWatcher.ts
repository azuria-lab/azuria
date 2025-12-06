/**
 * useTaxCalcWatcher Hook
 *
 * Hook que monitora a Calculadora de Regime Tributário e envia eventos para a IA.
 * Detecta mudanças em ICMS, ST, MVA e outros cálculos fiscais.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { emitEvent } from '../core/eventBus';

export interface TaxCalcWatcherOptions {
  enabled?: boolean;
  debounceMs?: number;
  captureICMS?: boolean;
  captureST?: boolean;
  autoEmitEvents?: boolean;
}

export interface TaxCalcData {
  regime?: string;
  aliquotaICMS?: number;
  valorICMS?: number;
  baseCalculoST?: number;
  valorST?: number;
  mva?: number;
  precoFinal?: number;
  ufOrigem?: string;
  ufDestino?: string;
  ncm?: string;
  resultado?: any;
}

export interface TaxCalcEvent {
  type:
    | 'tax_changed'
    | 'icms_changed'
    | 'st_changed'
    | 'calculation_completed'
    | 'error_occurred';
  data: TaxCalcData;
  timestamp: number;
  changedField?: string;
}

export interface UseTaxCalcWatcherReturn {
  isWatching: boolean;
  lastEvent: TaxCalcEvent | null;
  eventCount: number;
  startWatching: () => void;
  stopWatching: () => void;
  getEventHistory: () => TaxCalcEvent[];
  emitTaxEvent: (data: TaxCalcData, type?: TaxCalcEvent['type']) => void;
}

export function useTaxCalcWatcher(
  options: TaxCalcWatcherOptions = {}
): UseTaxCalcWatcherReturn {
  const {
    enabled = true,
    debounceMs = 500,
    captureICMS = true,
    captureST = true,
    autoEmitEvents = true,
  } = options;

  const [isWatching, setIsWatching] = useState(enabled);
  const [lastEvent, setLastEvent] = useState<TaxCalcEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const eventHistoryRef = useRef<TaxCalcEvent[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<TaxCalcData>({});

  /**
   * Emite um evento de cálculo tributário para o event bus
   */
  const emitTaxEvent = useCallback(
    (
      data: TaxCalcData,
      type: TaxCalcEvent['type'] = 'calculation_completed'
    ) => {
      if (!isWatching) return;

      const taxEvent: TaxCalcEvent = {
        type,
        data,
        timestamp: Date.now(),
      };

      setLastEvent(taxEvent);
      setEventCount(prev => prev + 1);
      eventHistoryRef.current.push(taxEvent);

      if (eventHistoryRef.current.length > 50) {
        eventHistoryRef.current.shift();
      }

      if (autoEmitEvents) {
        // Emitir eventos específicos baseados no tipo
        if (type === 'icms_changed' && captureICMS) {
          emitEvent('icms:updated', data, {
            source: 'useTaxCalcWatcher',
            priority: 5,
            metadata: { type },
          });
        } else if (type === 'st_changed' && captureST) {
          emitEvent('st:updated', data, {
            source: 'useTaxCalcWatcher',
            priority: 5,
            metadata: { type },
          });
        } else {
          emitEvent('tax:updated', data, {
            source: 'useTaxCalcWatcher',
            priority: 5,
            metadata: { type },
          });
        }
      }
    },
    [isWatching, autoEmitEvents, captureICMS, captureST]
  );

  /**
   * Detecta mudanças nos dados do cálculo tributário
   */
  const handleDataChange = useCallback(
    (newData: TaxCalcData, changedField?: string) => {
      if (!isWatching) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const taxEvent: TaxCalcEvent = {
          type: 'calculation_completed',
          data: newData,
          timestamp: Date.now(),
          changedField,
        };

        setLastEvent(taxEvent);
        eventHistoryRef.current.push(taxEvent);

        if (autoEmitEvents) {
          emitEvent('tax:updated', newData, {
            source: 'useTaxCalcWatcher',
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
    emitTaxEvent,
  };
}

export default useTaxCalcWatcher;
