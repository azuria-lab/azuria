import type { WebVitalMetric } from './types';

export function metricIsCritical(metric: WebVitalMetric): boolean {
  const criticalThresholds: Partial<Record<WebVitalMetric['name'], number>> = {
    CLS: 0.25,
    FID: 300,
    FCP: 4000,
    LCP: 4000,
    TTFB: 1800,
    INP: 500,
  };
  const threshold = criticalThresholds[metric.name];
  return typeof threshold === 'number' ? metric.value > threshold : false;
}

export function getMetricEmoji(rating: WebVitalMetric['rating']): string {
  switch (rating) {
    case 'good': return '✅';
    case 'needs-improvement': return '⚠️';
    case 'poor': return '❌';
    default: return '📊';
  }
}

export function computePerformanceScore(metrics: WebVitalMetric[]): number {
  if (metrics.length === 0) { return 100; }
  const scores: number[] = metrics.map((m) => {
    switch (m.rating) {
      case 'good': return 100;
      case 'needs-improvement': return 50;
      case 'poor': return 0;
      default: return 50;
    }
  });
  const total = scores.reduce((a, b) => a + b, 0);
  return Math.round(total / scores.length);
}
