/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EVENT REPLAY SYSTEM - Sistema de Replay de Eventos para Debug
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Permite gravar, salvar e reproduzir sequências de eventos do sistema cognitivo
 * para debugging e análise.
 *
 * @example
 * ```typescript
 * import { EventReplay } from '@/azuria_ai/observability/EventReplay';
 *
 * // Iniciar gravação
 * EventReplay.startRecording('debug-session-1');
 *
 * // ... eventos acontecem ...
 *
 * // Parar e obter gravação
 * const recording = EventReplay.stopRecording();
 *
 * // Reproduzir gravação
 * await EventReplay.replay(recording, { speed: 2 });
 * ```
 *
 * @module azuria_ai/observability/EventReplay
 */

import { emitEvent, type EventType, onEvent } from '../core/eventBus';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Evento gravado */
export interface RecordedEvent {
  id: string;
  timestamp: number;
  relativeTime: number;
  eventType: EventType;
  payload: unknown;
  source?: string;
  metadata?: Record<string, unknown>;
}

/** Gravação completa */
export interface EventRecording {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number;
  duration: number;
  eventCount: number;
  events: RecordedEvent[];
  metadata?: Record<string, unknown>;
}

/** Opções de replay */
export interface ReplayOptions {
  /** Velocidade de reprodução (1 = normal, 2 = 2x, 0.5 = metade) */
  speed: number;
  /** Callback antes de cada evento */
  onBeforeEvent?: (event: RecordedEvent) => boolean | Promise<boolean>;
  /** Callback após cada evento */
  onAfterEvent?: (event: RecordedEvent) => void;
  /** Callback ao finalizar */
  onComplete?: () => void;
  /** Callback em caso de erro */
  onError?: (error: Error, event: RecordedEvent) => void;
  /** Modo silencioso (não emite eventos reais) */
  dryRun: boolean;
  /** Filtrar eventos por tipo */
  filterEventTypes?: EventType[];
  /** Pular para timestamp específico */
  startFromTime?: number;
  /** Parar em timestamp específico */
  stopAtTime?: number;
}

/** Estado do replay */
export interface ReplayState {
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentRecordingId: string | null;
  currentPlaybackIndex: number;
  recordings: Map<string, EventRecording>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

const state: ReplayState = {
  isRecording: false,
  isPlaying: false,
  isPaused: false,
  currentRecordingId: null,
  currentPlaybackIndex: 0,
  recordings: new Map(),
};

let recordingStartTime = 0;
let recordedEvents: RecordedEvent[] = [];
let eventSubscription: (() => void) | null = null;
let playbackAbortController: AbortController | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES INTERNAS
// ═══════════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function handleEvent(eventType: EventType, payload: unknown): void {
  if (!state.isRecording) {return;}

  const now = Date.now();
  const event: RecordedEvent = {
    id: generateId(),
    timestamp: now,
    relativeTime: now - recordingStartTime,
    eventType,
    payload,
    source: (payload as Record<string, unknown>)?.source as string | undefined,
  };

  recordedEvents.push(event);
}

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Replay aborted'));
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS - GRAVAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicia gravação de eventos
 */
export function startRecording(name?: string): string {
  if (state.isRecording) {
    // eslint-disable-next-line no-console
    console.warn('[EventReplay] Already recording, stopping previous recording');
    stopRecording();
  }

  const recordingId = generateId();
  state.isRecording = true;
  state.currentRecordingId = recordingId;
  recordingStartTime = Date.now();
  recordedEvents = [];

  // Inscrever-se em todos os eventos
  // O eventBus não tem um método para ouvir todos os eventos,
  // então vamos criar um wrapper que captura eventos conhecidos
  const eventTypes: EventType[] = [
    'ai:insight:generated',
    'ai:suggestion:created',
    'ai:explanation:generated',
    'ai:feedback:received',
    'ai:pattern:detected',
    'user:action',
    'user:navigation',
    'user:calculation',
    'consciousness:state:changed',
    'consciousness:level:changed',
    'engine:registered',
    'engine:action:requested',
    'engine:action:completed',
    'memory:sync:completed',
    'memory:item:stored',
  ];

  const unsubscribers: (() => void)[] = [];
  for (const eventType of eventTypes) {
    const unsub = onEvent(eventType, (payload) => handleEvent(eventType, payload));
    unsubscribers.push(unsub);
  }

  eventSubscription = () => {
    unsubscribers.forEach((unsub) => unsub());
  };

  // eslint-disable-next-line no-console
  console.log(`[EventReplay] Started recording: ${name ?? recordingId}`);

  return recordingId;
}

/**
 * Para gravação e retorna os eventos gravados
 */
export function stopRecording(): EventRecording | null {
  if (!state.isRecording) {
    return null;
  }

  const endedAt = Date.now();
  const recording: EventRecording = {
    id: state.currentRecordingId ?? 'unknown',
    name: state.currentRecordingId ?? 'unknown',
    startedAt: recordingStartTime,
    endedAt,
    duration: endedAt - recordingStartTime,
    eventCount: recordedEvents.length,
    events: [...recordedEvents],
  };

  // Limpar estado
  state.isRecording = false;
  state.currentRecordingId = null;

  if (eventSubscription) {
    eventSubscription();
    eventSubscription = null;
  }

  // Salvar gravação
  state.recordings.set(recording.id, recording);

  // eslint-disable-next-line no-console
  console.log(
    `[EventReplay] Stopped recording: ${recording.eventCount} events, ${recording.duration}ms`
  );

  return recording;
}

/**
 * Verifica se está gravando
 */
export function isRecording(): boolean {
  return state.isRecording;
}

/**
 * Obtém eventos sendo gravados atualmente
 */
export function getCurrentRecordingEvents(): RecordedEvent[] {
  return [...recordedEvents];
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS - REPRODUÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Reproduz uma gravação
 */
export async function replay(
  recording: EventRecording,
  options: Partial<ReplayOptions> = {}
): Promise<void> {
  const opts: ReplayOptions = {
    speed: 1,
    dryRun: false,
    ...options,
  };

  if (state.isPlaying) {
    // eslint-disable-next-line no-console
    console.warn('[EventReplay] Already playing, aborting previous playback');
    abortReplay();
  }

  state.isPlaying = true;
  state.isPaused = false;
  state.currentPlaybackIndex = 0;

  playbackAbortController = new AbortController();
  const { signal } = playbackAbortController;

  // eslint-disable-next-line no-console
  console.log(`[EventReplay] Starting replay: ${recording.eventCount} events at ${opts.speed}x`);

  try {
    let events = recording.events;

    // Filtrar por tipo de evento
    if (opts.filterEventTypes && opts.filterEventTypes.length > 0) {
      events = events.filter((e) => opts.filterEventTypes.includes(e.eventType));
    }

    // Filtrar por tempo
    if (opts.startFromTime !== undefined) {
      events = events.filter((e) => e.relativeTime >= opts.startFromTime);
    }
    if (opts.stopAtTime !== undefined) {
      events = events.filter((e) => e.relativeTime <= opts.stopAtTime);
    }

    let lastTime = 0;

    for (let i = 0; i < events.length; i++) {
      if (signal.aborted) {break;}

      // Esperar se pausado
      while (state.isPaused && !signal.aborted) {
        await delay(100, signal);
      }

      if (signal.aborted) {break;}

      const event = events[i];
      state.currentPlaybackIndex = i;

      // Calcular delay até próximo evento
      const timeDelta = event.relativeTime - lastTime;
      const adjustedDelay = timeDelta / opts.speed;

      if (adjustedDelay > 0) {
        await delay(adjustedDelay, signal);
      }

      lastTime = event.relativeTime;

      // Callback antes do evento
      if (opts.onBeforeEvent) {
        const shouldContinue = await opts.onBeforeEvent(event);
        if (!shouldContinue) {continue;}
      }

      // Emitir evento (se não for dry run)
      if (!opts.dryRun) {
        try {
          emitEvent(event.eventType, event.payload);
        } catch (error) {
          opts.onError?.(error as Error, event);
        }
      }

      // Callback após evento
      opts.onAfterEvent?.(event);
    }

    opts.onComplete?.();
  } catch (error) {
    if ((error as Error).message !== 'Replay aborted') {
      // eslint-disable-next-line no-console
      console.error('[EventReplay] Error during replay:', error);
    }
  } finally {
    state.isPlaying = false;
    state.isPaused = false;
    playbackAbortController = null;

    // eslint-disable-next-line no-console
    console.log('[EventReplay] Replay finished');
  }
}

/**
 * Pausa reprodução
 */
export function pauseReplay(): void {
  if (state.isPlaying) {
    state.isPaused = true;
    // eslint-disable-next-line no-console
    console.log('[EventReplay] Paused');
  }
}

/**
 * Retoma reprodução
 */
export function resumeReplay(): void {
  if (state.isPlaying && state.isPaused) {
    state.isPaused = false;
    // eslint-disable-next-line no-console
    console.log('[EventReplay] Resumed');
  }
}

/**
 * Aborta reprodução
 */
export function abortReplay(): void {
  if (playbackAbortController) {
    playbackAbortController.abort();
    // eslint-disable-next-line no-console
    console.log('[EventReplay] Aborted');
  }
}

/**
 * Verifica se está reproduzindo
 */
export function isPlaying(): boolean {
  return state.isPlaying;
}

/**
 * Verifica se está pausado
 */
export function isPaused(): boolean {
  return state.isPaused;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS - GERENCIAMENTO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém gravação por ID
 */
export function getRecording(id: string): EventRecording | undefined {
  return state.recordings.get(id);
}

/**
 * Lista todas as gravações
 */
export function listRecordings(): EventRecording[] {
  return Array.from(state.recordings.values());
}

/**
 * Remove gravação
 */
export function deleteRecording(id: string): boolean {
  return state.recordings.delete(id);
}

/**
 * Limpa todas as gravações
 */
export function clearRecordings(): void {
  state.recordings.clear();
}

/**
 * Exporta gravação para JSON
 */
export function exportRecording(recording: EventRecording): string {
  return JSON.stringify(recording, null, 2);
}

/**
 * Importa gravação de JSON
 */
export function importRecording(json: string): EventRecording {
  const recording = JSON.parse(json) as EventRecording;
  state.recordings.set(recording.id, recording);
  return recording;
}

/**
 * Obtém estado atual
 */
export function getState(): ReplayState {
  return {
    ...state,
    recordings: new Map(state.recordings),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const EventReplay = {
  // Gravação
  startRecording,
  stopRecording,
  isRecording,
  getCurrentRecordingEvents,
  // Reprodução
  replay,
  pauseReplay,
  resumeReplay,
  abortReplay,
  isPlaying,
  isPaused,
  // Gerenciamento
  getRecording,
  listRecordings,
  deleteRecording,
  clearRecordings,
  exportRecording,
  importRecording,
  getState,
};

export default EventReplay;
