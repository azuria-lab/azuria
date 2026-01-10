/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EVENT REPLAY TESTS - Testes do Sistema de Replay
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes unitários para:
 * - Gravação de eventos
 * - Reprodução de gravações
 * - Gerenciamento de gravações
 *
 * @module tests/unit/azuria_ai/observability/EventReplay.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do eventBus
vi.mock('@/azuria_ai/core/eventBus', () => ({
  emitEvent: vi.fn(),
  on: vi.fn(() => vi.fn()), // on retorna uma função unsubscribe
  unsubscribeFromEvent: vi.fn(() => true),
}));

import { emitEvent } from '@/azuria_ai/core/eventBus';
import {
  clearRecordings,
  deleteRecording,
  type EventRecording,
  exportRecording,
  getCurrentRecordingEvents,
  getRecording,
  getState,
  importRecording,
  isRecording,
  listRecordings,
  replay,
  startRecording,
  stopRecording,
} from '@/azuria_ai/observability/EventReplay';

describe('EventReplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRecordings();
  });

  afterEach(() => {
    // Garantir que parou gravação
    if (isRecording()) {
      stopRecording();
    }
    clearRecordings();
  });

  describe('Recording', () => {
    it('should start recording', () => {
      const id = startRecording('test-session');

      expect(id).toBeDefined();
      expect(isRecording()).toBe(true);
    });

    it('should stop recording and return recording', () => {
      startRecording('test-session');
      const recording = stopRecording();

      expect(recording).toBeDefined();
      expect(recording?.name).toBeDefined();
      expect(isRecording()).toBe(false);
    });

    it('should return null if not recording when stopping', () => {
      const recording = stopRecording();
      expect(recording).toBeNull();
    });

    it('should track recording state', () => {
      expect(isRecording()).toBe(false);

      startRecording();
      expect(isRecording()).toBe(true);

      stopRecording();
      expect(isRecording()).toBe(false);
    });

    it('should get current recording events', () => {
      startRecording();
      
      // Simular eventos (normalmente vem do eventBus)
      const events = getCurrentRecordingEvents();
      expect(Array.isArray(events)).toBe(true);

      stopRecording();
    });

    it('should subscribe to event types when recording', () => {
      startRecording('subscription-test');
      
      // Verificar que o recording foi iniciado
      expect(isRecording()).toBe(true);

      stopRecording();
    });
  });

  describe('Storage', () => {
    it('should save recording after stopping', () => {
      startRecording('save-test');
      const recording = stopRecording();
      expect(recording).not.toBeNull();

      const stored = getRecording(recording?.id ?? '');
      expect(stored).toBeDefined();
      expect(stored?.name).toBe(recording?.name);
    });

    it('should list all recordings', () => {
      startRecording('recording-1');
      stopRecording();

      startRecording('recording-2');
      stopRecording();

      const recordings = listRecordings();
      expect(recordings.length).toBeGreaterThanOrEqual(2);
    });

    it('should delete recording', () => {
      startRecording('to-delete');
      const recording = stopRecording();
      expect(recording).not.toBeNull();

      const deleted = deleteRecording(recording?.id ?? '');
      expect(deleted).toBe(true);

      const notFound = getRecording(recording?.id ?? '');
      expect(notFound).toBeUndefined();
    });

    it('should clear all recordings', () => {
      startRecording('clear-1');
      stopRecording();
      startRecording('clear-2');
      stopRecording();

      clearRecordings();
      expect(listRecordings()).toHaveLength(0);
    });
  });

  describe('Export/Import', () => {
    it('should export recording to JSON', () => {
      startRecording('export-test');
      const recording = stopRecording();
      expect(recording).not.toBeNull();

      const json = exportRecording(recording);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(recording?.id);
      expect(parsed.name).toBe(recording?.name);
      expect(parsed.events).toBeDefined();
    });

    it('should import recording from JSON', () => {
      const mockRecording: EventRecording = {
        id: 'imported-id',
        name: 'imported-recording',
        startedAt: Date.now() - 1000,
        endedAt: Date.now(),
        duration: 1000,
        eventCount: 0,
        events: [],
      };

      const json = JSON.stringify(mockRecording);
      const imported = importRecording(json);

      expect(imported.id).toBe('imported-id');
      expect(imported.name).toBe('imported-recording');

      const stored = getRecording('imported-id');
      expect(stored).toBeDefined();
    });
  });

  describe('Replay', () => {
    it('should replay recording in dry run mode', async () => {
      const mockRecording: EventRecording = {
        id: 'replay-test',
        name: 'Replay Test',
        startedAt: Date.now() - 100,
        endedAt: Date.now(),
        duration: 100,
        eventCount: 2,
        events: [
          {
            id: 'event-1',
            timestamp: Date.now() - 50,
            relativeTime: 0,
            eventType: 'insight:generated',
            payload: { test: true },
          },
          {
            id: 'event-2',
            timestamp: Date.now(),
            relativeTime: 50,
            eventType: 'ai:predictive-insight',
            payload: { test: true },
          },
        ],
      };

      const onComplete = vi.fn();

      await replay(mockRecording, {
        speed: 10, // Speed up for testing
        dryRun: true,
        onComplete,
      });

      expect(onComplete).toHaveBeenCalled();
      // Em dry run, não deve emitir eventos
      expect(emitEvent).not.toHaveBeenCalled();
    });

    it('should emit events when not in dry run', async () => {
      const mockRecording: EventRecording = {
        id: 'emit-test',
        name: 'Emit Test',
        startedAt: Date.now(),
        endedAt: Date.now(),
        duration: 0,
        eventCount: 1,
        events: [
          {
            id: 'event-1',
            timestamp: Date.now(),
            relativeTime: 0,
            eventType: 'insight:generated',
            payload: { data: 'test' },
          },
        ],
      };

      await replay(mockRecording, {
        speed: 100,
        dryRun: false,
      });

      expect(emitEvent).toHaveBeenCalledWith('insight:generated', { data: 'test' });
    });

    it('should call onBeforeEvent callback', async () => {
      const mockRecording: EventRecording = {
        id: 'callback-test',
        name: 'Callback Test',
        startedAt: Date.now(),
        endedAt: Date.now(),
        duration: 0,
        eventCount: 1,
        events: [
          {
            id: 'event-1',
            timestamp: Date.now(),
            relativeTime: 0,
            eventType: 'insight:generated',
            payload: {},
          },
        ],
      };

      const onBeforeEvent = vi.fn().mockReturnValue(true);

      await replay(mockRecording, {
        speed: 100,
        dryRun: true,
        onBeforeEvent,
      });

      expect(onBeforeEvent).toHaveBeenCalled();
    });

    it('should respect filter event types', async () => {
      const mockRecording: EventRecording = {
        id: 'filter-test',
        name: 'Filter Test',
        startedAt: Date.now(),
        endedAt: Date.now(),
        duration: 0,
        eventCount: 2,
        events: [
          {
            id: 'event-1',
            timestamp: Date.now(),
            relativeTime: 0,
            eventType: 'insight:generated',
            payload: {},
          },
          {
            id: 'event-2',
            timestamp: Date.now(),
            relativeTime: 0,
            eventType: 'ai:predictive-insight',
            payload: {},
          },
        ],
      };

      const onAfterEvent = vi.fn();

      await replay(mockRecording, {
        speed: 100,
        dryRun: true,
        filterEventTypes: ['insight:generated'],
        onAfterEvent,
      });

      // Deve processar apenas o evento filtrado
      expect(onAfterEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('State', () => {
    it('should return current state', () => {
      const state = getState();

      expect(state.isRecording).toBe(false);
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.recordings).toBeDefined();
    });

    it('should update state during recording', () => {
      startRecording();
      const state = getState();

      expect(state.isRecording).toBe(true);

      stopRecording();
    });
  });
});
