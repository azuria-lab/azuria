import type { WebVitalMetric } from './types.ts';

export function isCritical(metric: WebVitalMetric): boolean {
  const critical: Partial<Record<WebVitalMetric['name'], number>> = {
    CLS: 0.25,
    FID: 300,
    FCP: 4000,
    LCP: 4000,
    TTFB: 1800,
    INP: 500,
  };
  return metric.value > (critical[metric.name] ?? Infinity);
}

export function getRatingEmoji(rating: WebVitalMetric['rating']): string {
  return rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
}

export function score(metrics: WebVitalMetric[]): number {
  if (metrics.length === 0) { return 100; }
  const scores: number[] = metrics.map((m) => (m.rating === 'good' ? 100 : m.rating === 'needs-improvement' ? 50 : 0));
  const total = scores.reduce((a: number, b: number) => a + b, 0);
  return Math.round(total / scores.length);
}
