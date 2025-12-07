import { emitEvent } from '../core/eventBus';

type Scope = 'user' | 'calculation' | 'session' | 'global';
type TemporalEntry = { event: string; payload: any; timestamp: number };

const MAX_ENTRIES = 300;

const temporalMemory: Record<Scope, TemporalEntry[]> = {
  user: [],
  calculation: [],
  session: [],
  global: [],
};

function push(scope: Scope, entry: TemporalEntry) {
  const list = temporalMemory[scope];
  list.push(entry);
  if (list.length > MAX_ENTRIES) list.shift();
}

export function recordTemporalEvent(scope: Scope, eventName: string, payload: any) {
  const entry: TemporalEntry = { event: eventName, payload, timestamp: Date.now() };
  push(scope, entry);
  emitEvent('ai:temporal-event', { scope, entry }, { source: 'temporalEngine', priority: 6 });
}

export function getTimeline(scope: Scope): TemporalEntry[] {
  return [...temporalMemory[scope]];
}

export function computeTrends(scope: Scope) {
  const data = temporalMemory[scope];
  if (data.length < 5) return null;
  const last = data.slice(-10);
  const growth = last.filter(e => e.payload?.status === 'success').length / last.length;
  const decline = last.filter(e => e.payload?.status === 'error').length / last.length;
  const trend = growth >= decline ? 'growth' : 'decline';
  const repetitions = findRepetitions(last.map(e => e.event));
  const result = { scope, trend, repetitions };
  emitEvent('ai:trend-detected', result, { source: 'temporalEngine', priority: 6 });
  return result;
}

export function predictFutureState(scope: Scope) {
  const trend = computeTrends(scope);
  if (!trend) return null;
  const prediction = {
    scope,
    expected: trend.trend === 'growth' ? 'increasing_activity' : 'potential_drop',
    repetitions: trend.repetitions,
  };
  emitEvent('ai:future-state-predicted', prediction, { source: 'temporalEngine', priority: 6 });
  return prediction;
}

export function detectTemporalAnomaly(scope: Scope) {
  const data = temporalMemory[scope];
  if (data.length < 4) return null;
  const last = data.slice(-4);
  const times = last.map(e => e.timestamp);
  const diffs = times.slice(1).map((t, i) => t - times[i]);
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const hasSpike = diffs.some(d => d > avg * 3);
  if (hasSpike) {
    const anomaly = { scope, message: 'Ruptura temporal detectada', diffs };
    emitEvent('ai:temporal-anomaly', anomaly, { source: 'temporalEngine', priority: 7 });
    return anomaly;
  }
  return null;
}

function findRepetitions(items: string[]) {
  const counts: Record<string, number> = {};
  items.forEach(i => (counts[i] = (counts[i] || 0) + 1));
  return Object.entries(counts)
    .filter(([, c]) => c >= 2)
    .map(([k]) => k);
}

