import type { WebVitalMetric } from './types.ts';
import { logger } from '@/services/logger';

export type MetricHandler = (metric: WebVitalMetric) => void;

export interface CollectOptions {
  enabled?: boolean;
}

export async function startCollecting(
  handler: MetricHandler,
  opts: CollectOptions = {}
): Promise<void> {
  const shouldReport =
    opts.enabled ??
    (import.meta.env?.PROD ||
      localStorage.getItem('azuria-enable-vitals-reporting') === 'true');
  if (!shouldReport) {
    logger.debug?.('Web Vitals: reporting disabled');
    return;
  }

  try {
    const webVitals = await import('web-vitals');
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = webVitals;

    onCLS(handler, { reportAllChanges: true });
    onFCP(handler);
    onLCP(handler, { reportAllChanges: true });
    onTTFB(handler);
    if (onINP) {
      onINP(handler, { reportAllChanges: true });
    }

    logger.info?.('Web Vitals: collection initialized');
  } catch (error) {
    logger.warn?.('Web Vitals: failed to initialize collection', { error });
  }
}
