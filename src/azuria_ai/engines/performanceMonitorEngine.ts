import { emitEvent } from '../core/eventBus';

interface PerfEntry {
  label: string;
  start: number;
}

interface PerfStats {
  count: number;
  totalMs: number;
  maxMs: number;
}

const stats: Record<string, PerfStats> = {};

export function perfStart(label: string): PerfEntry {
  return { label, start: performance.now() };
}

export function perfEnd(entry: PerfEntry) {
  const duration = performance.now() - entry.start;
  const s = stats[entry.label] || { count: 0, totalMs: 0, maxMs: 0 };
  s.count += 1;
  s.totalMs += duration;
  s.maxMs = Math.max(s.maxMs, duration);
  stats[entry.label] = s;

  if (duration > 120) {
    emitEvent(
      'ai:perf-alert',
      { label: entry.label, duration },
      { source: 'performanceMonitorEngine', priority: 7 }
    );
  }
}

export function getPerfStats() {
  return { ...stats };
}

