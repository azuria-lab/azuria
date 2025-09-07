import { loadWebVitals, subscribeToVitals } from './collect';
import { getRatingEmoji, isCritical, score } from './analyze';
import { createReport, sendReport, sendReportsBatch } from './report';
import { logger } from '@/services/logger';
import type { PerformanceReport, WebVitalMetric } from './types';

class Reporter {
  private metrics = new Map<string, WebVitalMetric>();
  private sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  private isReporting = false;
  private queue: PerformanceReport[] = [];
  private timer?: number;

  async init() {
  const meta = import.meta as unknown as { env: { PROD: boolean; DEV: boolean } };
  const shouldReport = meta.env.PROD || localStorage.getItem('azuria-enable-vitals-reporting') === 'true';
    if (!shouldReport) { return; }
    const webVitals = await loadWebVitals();
    if (!webVitals) { return; }
    this.isReporting = true;
    subscribeToVitals(webVitals, this.onMetric);
    this.timer = window.setInterval(() => this.sendBatch(), 30000);
    window.addEventListener('beforeunload', () => this.flushFinal());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { this.flushFinal(); } });
  }

  onMetric = (metric: WebVitalMetric) => {
    this.metrics.set(metric.name, metric);
  const meta = import.meta as unknown as { env: { DEV: boolean } };
  if (meta.env.DEV) {
      const emoji = getRatingEmoji(metric.rating);
      logger.debug(`📊 ${emoji} [${metric.name}]:`, `${metric.value.toFixed(2)}ms`, `(${metric.rating})`);
    }
    if (isCritical(metric)) { this.reportNow(metric); }
  };

  private async reportNow(metric: WebVitalMetric) {
    if (!this.isReporting) { return; }
    const report = createReport([metric], this.sessionId);
    try { await sendReport(report); } catch { /* ignore */ }
  }

  private async sendBatch() {
    if (!this.isReporting || this.metrics.size === 0) { return; }
    const report = createReport(Array.from(this.metrics.values()), this.sessionId);
    this.queue.push(report);
    this.metrics.clear();
    if (this.queue.length >= 3) { await this.flushQueue(); }
  }

  private async flushQueue() {
    const toSend = [...this.queue];
    this.queue = [];
    await sendReportsBatch(toSend);
  }

  private async flushFinal() {
    if (this.metrics.size > 0) {
      const report = createReport(Array.from(this.metrics.values()), this.sessionId);
      this.queue.push(report);
      this.metrics.clear();
    }
    await this.flushQueue();
  }

  getScore() { return score(Array.from(this.metrics.values())); }
}

let reporter: Reporter | null = null;
export function initWebVitals() {
  if (!reporter) { reporter = new Reporter(); }
  reporter.init();
  return reporter;
}

export function getReporter() { return reporter; }
