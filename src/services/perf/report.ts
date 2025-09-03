import type { PerformanceReport } from './types';
import { logger } from '@/services/logger';

export function sendViaBeaconOrFetch(endpoint: string, payload: unknown, keepalive = true): Promise<void> | void {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const ok = navigator.sendBeacon(endpoint, body);
    if (!ok) {
      logger.warn?.('Web Vitals: sendBeacon failed, falling back to fetch');
      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive,
      }).then(() => undefined);
    }
    return;
  }
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive,
  }).then(() => undefined);
}

export async function sendSingleReport(report: PerformanceReport): Promise<void> {
  try {
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([report]),
    });
  } catch (error) {
    logger.warn?.('Web Vitals: failed to send single report', { error });
    throw error;
  }
}

export function flushReportsQueue(queue: PerformanceReport[]): void {
  if (queue.length === 0) { return; }
  try {
    sendViaBeaconOrFetch('/api/analytics/web-vitals', queue);
    queue.length = 0;
  } catch (error) {
    logger.warn?.('Web Vitals: failed to flush queue', { error });
  }
}
