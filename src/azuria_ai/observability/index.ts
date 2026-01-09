/**
 * ══════════════════════════════════════════════════════════════════════════════
 * OBSERVABILITY MODULE - Sistema de Observabilidade do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Exporta ferramentas de métricas, replay e debugging para o sistema cognitivo.
 *
 * @example
 * ```typescript
 * import { CognitiveMetrics, EventReplay } from '@/azuria_ai/observability';
 *
 * // Métricas
 * CognitiveMetrics.init({ debug: true });
 * CognitiveMetrics.Nucleus.actionProcessed('approved', 'insight-engine');
 *
 * // Replay
 * EventReplay.startRecording('debug-session');
 * // ... eventos acontecem ...
 * const recording = EventReplay.stopRecording();
 * ```
 *
 * @module azuria_ai/observability
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MÉTRICAS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  CognitiveMetrics,
  EventMetrics,
  GovernanceMetrics,
  MemoryMetrics,
  NucleusMetrics,
  exportJSON,
  exportPrometheus,
  getCounter,
  getGauge,
  getMetricsByPrefix,
  getPercentile,
  getSnapshot,
  incrementCounter,
  initMetrics,
  record,
  recordHistogram,
  recordTiming,
  resetMetrics,
  setGauge,
  shutdownMetrics,
  startTimer,
  type MetricAggregation,
  type MetricDataPoint,
  type MetricTags,
  type MetricType,
  type MetricsConfig,
  type MetricsSnapshot,
} from './CognitiveMetrics';

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT REPLAY
// ═══════════════════════════════════════════════════════════════════════════════

export {
  EventReplay,
  abortReplay,
  clearRecordings,
  deleteRecording,
  exportRecording,
  getRecording,
  getState as getReplayState,
  importRecording,
  isPaused,
  isPlaying,
  isRecording,
  listRecordings,
  pauseReplay,
  replay,
  resumeReplay,
  startRecording,
  stopRecording,
  getCurrentRecordingEvents,
  type EventRecording,
  type RecordedEvent,
  type ReplayOptions,
  type ReplayState,
} from './EventReplay';
