/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COGNITIVE METRICS - Sistema de Métricas do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Coleta e exporta métricas do sistema cognitivo para observabilidade.
 * Suporta integração com sistemas externos de monitoramento.
 *
 * @example
 * ```typescript
 * import { CognitiveMetrics } from '@/azuria_ai/observability/CognitiveMetrics';
 *
 * // Registrar métrica
 * CognitiveMetrics.record('nucleus.action.processed', 1, { engine: 'insight' });
 *
 * // Obter snapshot
 * const snapshot = CognitiveMetrics.getSnapshot();
 *
 * // Exportar para JSON
 * const json = CognitiveMetrics.exportJSON();
 * ```
 *
 * @module azuria_ai/observability/CognitiveMetrics
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Tipos de métricas suportadas */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timing';

/** Tags para categorização de métricas */
export interface MetricTags {
  engine?: string;
  eventType?: string;
  action?: string;
  result?: 'success' | 'failure' | 'blocked';
  level?: string;
  [key: string]: string | undefined;
}

/** Ponto de dados de métrica */
export interface MetricDataPoint {
  name: string;
  type: MetricType;
  value: number;
  tags: MetricTags;
  timestamp: number;
}

/** Agregação de métrica */
export interface MetricAggregation {
  name: string;
  type: MetricType;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  last: number;
  lastUpdated: number;
  tags: MetricTags;
}

/** Snapshot completo de métricas */
export interface MetricsSnapshot {
  timestamp: number;
  uptimeMs: number;
  metrics: Record<string, MetricAggregation>;
  counters: Record<string, number>;
  gauges: Record<string, number>;
  histograms: Record<string, number[]>;
}

/** Configuração do sistema de métricas */
export interface MetricsConfig {
  /** Habilitar coleta de métricas */
  enabled: boolean;
  /** Tamanho máximo do buffer de histograma */
  histogramBufferSize: number;
  /** Intervalo de flush automático (ms) */
  flushIntervalMs: number;
  /** Callback para exportação */
  onFlush?: (snapshot: MetricsSnapshot) => void;
  /** Debug mode */
  debug: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: MetricsConfig = {
  enabled: true,
  histogramBufferSize: 1000,
  flushIntervalMs: 60000, // 1 minuto
  debug: false,
};

let config: MetricsConfig = { ...DEFAULT_CONFIG };
let startedAt: number = Date.now();
let flushInterval: ReturnType<typeof setInterval> | null = null;

// Armazenamento de métricas
const counters = new Map<string, number>();
const gauges = new Map<string, number>();
const histograms = new Map<string, number[]>();
const aggregations = new Map<string, MetricAggregation>();
const dataPoints: MetricDataPoint[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES INTERNAS
// ═══════════════════════════════════════════════════════════════════════════════

function generateKey(name: string, tags: MetricTags): string {
  const tagStr = Object.entries(tags)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
  return tagStr ? `${name}{${tagStr}}` : name;
}

function updateAggregation(
  name: string,
  type: MetricType,
  value: number,
  tags: MetricTags
): void {
  const key = generateKey(name, tags);
  const existing = aggregations.get(key);

  if (existing) {
    existing.count++;
    existing.sum += value;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);
    existing.avg = existing.sum / existing.count;
    existing.last = value;
    existing.lastUpdated = Date.now();
  } else {
    aggregations.set(key, {
      name,
      type,
      count: 1,
      sum: value,
      min: value,
      max: value,
      avg: value,
      last: value,
      lastUpdated: Date.now(),
      tags,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema de métricas
 */
export function initMetrics(userConfig?: Partial<MetricsConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
  startedAt = Date.now();

  // Limpar estado anterior
  counters.clear();
  gauges.clear();
  histograms.clear();
  aggregations.clear();
  dataPoints.length = 0;

  // Iniciar flush automático se configurado
  if (config.flushIntervalMs > 0 && config.onFlush) {
    flushInterval = setInterval(() => {
      const snapshot = getSnapshot();
      config.onFlush?.(snapshot);
    }, config.flushIntervalMs);
  }

  if (config.debug) {
    // eslint-disable-next-line no-console
    console.log('[CognitiveMetrics] Initialized', config);
  }
}

/**
 * Desliga o sistema de métricas
 */
export function shutdownMetrics(): void {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }

  if (config.debug) {
    // eslint-disable-next-line no-console
    console.log('[CognitiveMetrics] Shutdown');
  }
}

/**
 * Incrementa um contador
 */
export function incrementCounter(name: string, value = 1, tags: MetricTags = {}): void {
  if (!config.enabled) {return;}

  const key = generateKey(name, tags);
  counters.set(key, (counters.get(key) ?? 0) + value);
  updateAggregation(name, 'counter', value, tags);

  dataPoints.push({
    name,
    type: 'counter',
    value,
    tags,
    timestamp: Date.now(),
  });

  // Limitar tamanho do buffer
  if (dataPoints.length > config.histogramBufferSize * 10) {
    dataPoints.splice(0, dataPoints.length - config.histogramBufferSize * 10);
  }
}

/**
 * Define o valor de um gauge
 */
export function setGauge(name: string, value: number, tags: MetricTags = {}): void {
  if (!config.enabled) {return;}

  const key = generateKey(name, tags);
  gauges.set(key, value);
  updateAggregation(name, 'gauge', value, tags);
}

/**
 * Registra um valor em um histograma
 */
export function recordHistogram(name: string, value: number, tags: MetricTags = {}): void {
  if (!config.enabled) {return;}

  const key = generateKey(name, tags);
  const values = histograms.get(key) ?? [];
  values.push(value);

  // Limitar tamanho do buffer
  if (values.length > config.histogramBufferSize) {
    values.shift();
  }

  histograms.set(key, values);
  updateAggregation(name, 'histogram', value, tags);
}

/**
 * Registra um tempo de execução
 */
export function recordTiming(name: string, durationMs: number, tags: MetricTags = {}): void {
  if (!config.enabled) {return;}

  recordHistogram(name, durationMs, { ...tags, unit: 'ms' });
  updateAggregation(name, 'timing', durationMs, tags);
}

/**
 * Helper para medir tempo de execução
 */
export function startTimer(name: string, tags: MetricTags = {}): () => void {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    recordTiming(name, duration, tags);
  };
}

/**
 * Registra uma métrica genérica
 */
export function record(
  name: string,
  value: number,
  tags: MetricTags = {},
  type: MetricType = 'counter'
): void {
  switch (type) {
    case 'counter':
      incrementCounter(name, value, tags);
      break;
    case 'gauge':
      setGauge(name, value, tags);
      break;
    case 'histogram':
    case 'timing':
      recordHistogram(name, value, tags);
      break;
  }
}

/**
 * Obtém snapshot atual de todas as métricas
 */
export function getSnapshot(): MetricsSnapshot {
  return {
    timestamp: Date.now(),
    uptimeMs: Date.now() - startedAt,
    metrics: Object.fromEntries(aggregations),
    counters: Object.fromEntries(counters),
    gauges: Object.fromEntries(gauges),
    histograms: Object.fromEntries(histograms),
  };
}

/**
 * Obtém métricas específicas por prefixo
 */
export function getMetricsByPrefix(prefix: string): MetricAggregation[] {
  return Array.from(aggregations.values()).filter((m) => m.name.startsWith(prefix));
}

/**
 * Obtém valor de contador específico
 */
export function getCounter(name: string, tags: MetricTags = {}): number {
  const key = generateKey(name, tags);
  return counters.get(key) ?? 0;
}

/**
 * Obtém valor de gauge específico
 */
export function getGauge(name: string, tags: MetricTags = {}): number {
  const key = generateKey(name, tags);
  return gauges.get(key) ?? 0;
}

/**
 * Obtém percentil de histograma
 */
export function getPercentile(name: string, percentile: number, tags: MetricTags = {}): number {
  const key = generateKey(name, tags);
  const values = histograms.get(key);

  if (!values || values.length === 0) {return 0;}

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Exporta métricas em formato JSON
 */
export function exportJSON(): string {
  return JSON.stringify(getSnapshot(), null, 2);
}

/**
 * Exporta métricas em formato Prometheus
 */
export function exportPrometheus(): string {
  const lines: string[] = [];

  for (const [key, value] of counters) {
    lines.push(
      `# TYPE ${key} counter`,
      `${key} ${value}`
    );
  }

  for (const [key, value] of gauges) {
    lines.push(
      `# TYPE ${key} gauge`,
      `${key} ${value}`
    );
  }

  for (const [key, values] of histograms) {
    if (values.length === 0) {continue;}

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    lines.push(
      `# TYPE ${key} histogram`,
      `${key}_count ${values.length}`,
      `${key}_sum ${sum}`,
      `${key}_bucket{le="0.5"} ${sorted.filter((v) => v <= getPercentile(key, 50)).length}`,
      `${key}_bucket{le="0.9"} ${sorted.filter((v) => v <= getPercentile(key, 90)).length}`,
      `${key}_bucket{le="0.99"} ${sorted.filter((v) => v <= getPercentile(key, 99)).length}`,
      `${key}_bucket{le="+Inf"} ${values.length}`
    );
  }

  return lines.join('\n');
}

/**
 * Reseta todas as métricas
 */
export function resetMetrics(): void {
  counters.clear();
  gauges.clear();
  histograms.clear();
  aggregations.clear();
  dataPoints.length = 0;
  startedAt = Date.now();

  if (config.debug) {
    // eslint-disable-next-line no-console
    console.log('[CognitiveMetrics] Reset');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÉTRICAS PRÉ-DEFINIDAS DO MODO DEUS
// ═══════════════════════════════════════════════════════════════════════════════

/** Métricas do Nucleus */
export const NucleusMetrics = {
  actionProcessed: (result: 'success' | 'failure' | 'blocked', engine: string) =>
    incrementCounter('nucleus.action.processed', 1, { result, engine }),

  cycleCompleted: (durationMs: number) =>
    recordTiming('nucleus.cycle.duration', durationMs),

  stateChanged: (fromLevel: string, toLevel: string) =>
    incrementCounter('nucleus.state.changed', 1, { from: fromLevel, to: toLevel }),

  error: (errorType: string) =>
    incrementCounter('nucleus.error', 1, { type: errorType }),
};

/** Métricas de Governança */
export const GovernanceMetrics = {
  permissionRequested: (engineId: string, granted: boolean) =>
    incrementCounter('governance.permission.requested', 1, {
      engine: engineId,
      result: granted ? 'success' : 'blocked',
    }),

  engineRegistered: (category: string) =>
    incrementCounter('governance.engine.registered', 1, { category }),

  engineUnregistered: (category: string) =>
    incrementCounter('governance.engine.unregistered', 1, { category }),

  emissionBlocked: (engineId: string, reason: string) =>
    incrementCounter('governance.emission.blocked', 1, { engine: engineId, reason }),
};

/** Métricas de Eventos */
export const EventMetrics = {
  emitted: (eventType: string, engine: string) =>
    incrementCounter('events.emitted', 1, { eventType, engine }),

  processed: (eventType: string, durationMs: number) =>
    recordTiming('events.processing.duration', durationMs, { eventType }),

  queued: () => incrementCounter('events.queued', 1),

  dropped: (reason: string) => incrementCounter('events.dropped', 1, { reason }),
};

/** Métricas de Memória */
export const MemoryMetrics = {
  syncCompleted: (direction: 'up' | 'down', itemCount: number) =>
    incrementCounter('memory.sync.completed', itemCount, { direction }),

  syncFailed: (reason: string) =>
    incrementCounter('memory.sync.failed', 1, { reason }),

  itemStored: (memoryType: 'stm' | 'wm' | 'ltm') =>
    incrementCounter('memory.item.stored', 1, { type: memoryType }),

  itemRecalled: (memoryType: 'stm' | 'wm' | 'ltm') =>
    incrementCounter('memory.item.recalled', 1, { type: memoryType }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const CognitiveMetrics = {
  init: initMetrics,
  shutdown: shutdownMetrics,
  record,
  incrementCounter,
  setGauge,
  recordHistogram,
  recordTiming,
  startTimer,
  getSnapshot,
  getMetricsByPrefix,
  getCounter,
  getGauge,
  getPercentile,
  exportJSON,
  exportPrometheus,
  reset: resetMetrics,
  // Métricas pré-definidas
  Nucleus: NucleusMetrics,
  Governance: GovernanceMetrics,
  Events: EventMetrics,
  Memory: MemoryMetrics,
};

export default CognitiveMetrics;
