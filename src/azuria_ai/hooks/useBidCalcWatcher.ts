/**
 * useBidCalcWatcher Hook
 *
 * Hook que monitora a Calculadora de Licitações e envia eventos para a IA.
 * Detecta mudanças em lances, riscos e descontos.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { emitEvent } from '../core/eventBus';

export interface BidCalcWatcherOptions {
  enabled?: boolean;
  debounceMs?: number;
  captureRisk?: boolean;
  captureDiscount?: boolean;
  autoEmitEvents?: boolean;
}

export interface BidCalcData {
  precoReferencia?: number;
  custoTotal?: number;
  margemDesejada?: number;
  lanceCalculado?: number;
  descontoPorLote?: number;
  nivelRisco?: string;
  avaliacaoRisco?: any;
  prazoEntrega?: number;
  quantidadeLotes?: number;
  resultado?: any;
}

export interface BidCalcEvent {
  type:
    | 'bid_changed'
    | 'risk_changed'
    | 'discount_changed'
    | 'calculation_completed'
    | 'error_occurred';
  data: BidCalcData;
  timestamp: number;
  changedField?: string;
}

export interface UseBidCalcWatcherReturn {
  isWatching: boolean;
  lastEvent: BidCalcEvent | null;
  eventCount: number;
  startWatching: () => void;
  stopWatching: () => void;
  getEventHistory: () => BidCalcEvent[];
  emitBidEvent: (data: BidCalcData, type?: BidCalcEvent['type']) => void;
}

export function useBidCalcWatcher(
  options: BidCalcWatcherOptions = {}
): UseBidCalcWatcherReturn {
  const {
    enabled = true,
    debounceMs = 500,
    captureRisk = true,
    captureDiscount = true,
    autoEmitEvents = true,
  } = options;

  const [isWatching, setIsWatching] = useState(enabled);
  const [lastEvent, setLastEvent] = useState<BidCalcEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const eventHistoryRef = useRef<BidCalcEvent[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<BidCalcData>({});

  /**
   * Emite um evento de cálculo de licitação para o event bus
   */
  const emitBidEvent = useCallback(
    (
      data: BidCalcData,
      type: BidCalcEvent['type'] = 'calculation_completed'
    ) => {
      if (!isWatching) {return;}

      const bidEvent: BidCalcEvent = {
        type,
        data,
        timestamp: Date.now(),
      };

      setLastEvent(bidEvent);
      setEventCount(prev => prev + 1);
      eventHistoryRef.current.push(bidEvent);

      if (eventHistoryRef.current.length > 50) {
        eventHistoryRef.current.shift();
      }

      if (autoEmitEvents) {
        // Emitir eventos específicos baseados no tipo
        if (type === 'risk_changed' && captureRisk) {
          emitEvent('risk:updated', data, {
            source: 'useBidCalcWatcher',
            priority: 6,
            metadata: { type },
          });
        } else if (type === 'discount_changed' && captureDiscount) {
          emitEvent('discount:updated', data, {
            source: 'useBidCalcWatcher',
            priority: 4,
            metadata: { type },
          });
        } else {
          emitEvent('bid:updated', data, {
            source: 'useBidCalcWatcher',
            priority: 5,
            metadata: { type },
          });
        }
      }
    },
    [isWatching, autoEmitEvents, captureRisk, captureDiscount]
  );

  /**
   * Detecta mudanças nos dados do cálculo de licitação
   */
  const handleDataChange = useCallback(
    (newData: BidCalcData, changedField?: string) => {
      if (!isWatching) {return;}

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const bidEvent: BidCalcEvent = {
          type: 'calculation_completed',
          data: newData,
          timestamp: Date.now(),
          changedField,
        };

        setLastEvent(bidEvent);
        eventHistoryRef.current.push(bidEvent);

        if (autoEmitEvents) {
          emitEvent('bid:updated', newData, {
            source: 'useBidCalcWatcher',
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
    emitBidEvent,
  };
}

export default useBidCalcWatcher;
