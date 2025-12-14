// Web Vitals Reporter - Monitoramento de Performance (refatorado)
import { AnalyticsEvent } from '@/types/analytics';
import { logger } from '@/services/logger';
import type { ConnectionInfo, DeviceInfo, PerformanceReport, WebVitalMetric } from '@/services/perf/types';
import { startCollecting } from '@/services/perf/collect';
import { computePerformanceScore, getMetricEmoji, metricIsCritical } from '@/services/perf/analyze';
import { flushReportsQueue, sendSingleReport } from '@/services/perf/report';
import { generateSecureSessionId } from './secureRandom';

class WebVitalsReporter {
  private readonly metrics: Map<string, WebVitalMetric> = new Map();
  private readonly sessionId: string;
  private isReporting: boolean = false;
  private reportQueue: PerformanceReport[] = [];
  private reportTimer?: NodeJS.Timeout;
  private initPromise?: Promise<void>;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return generateSecureSessionId();
  }

  async initialize() {
    this.initPromise ??= this.initializeReporting();
    return this.initPromise;
  }

  async initializeReporting() {
    this.isReporting = true;
    await startCollecting(this.handleMetric.bind(this));
    // Agendar envio de relatórios
    this.scheduleReporting();
  }

  private handleMetric(metric: WebVitalMetric) {
    this.metrics.set(metric.name, metric);
    
    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      const emoji = getMetricEmoji(metric.rating);
      logger.debug?.(`Web Vitals ${emoji} [${metric.name}]: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }

    // Reportar métricas críticas imediatamente
  if (metric.rating === 'poor' && metricIsCritical(metric)) {
      this.reportImmediately(metric);
    }
  }

  private async reportImmediately(metric: WebVitalMetric) {
    if (!this.isReporting) {return;}

    try {
      const report = this.createPerformanceReport([metric]);
      await this.sendReport(report);
  logger.warn?.(`Web Vitals: critical metric reported: ${metric.name}`);
    } catch (error) {
  logger.warn?.('Web Vitals: failed to report critical metric', { error });
    }
  }

  private scheduleReporting() {
    // Enviar relatório a cada 30 segundos se houver métricas
    this.reportTimer = setInterval(() => {
  if (this.metrics.size > 0) { this.sendBatchReport(); }
    }, 30000);

    // Enviar relatório quando a página for fechada
    globalThis.addEventListener('beforeunload', () => {
      this.sendFinalReport();
    });

    // Enviar relatório quando a página ficar escondida
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
  this.sendFinalReport();
      }
    });
  }

  private async sendBatchReport() {
    if (!this.isReporting || this.metrics.size === 0) {return;}

    try {
      const metrics = Array.from(this.metrics.values());
      const report = this.createPerformanceReport(metrics);
      
      // Adicionar à fila
      this.reportQueue.push(report);
      
      // Enviar fila se tiver mais de 3 relatórios
      if (this.reportQueue.length >= 3) {
        await this.flushReportQueue();
      }
      
      // Limpar métricas já reportadas
      this.metrics.clear();
    } catch (error) {
  logger.warn?.('Web Vitals: failed to send batch report', { error });
    }
  }

  private async sendFinalReport() {
    if (!this.isReporting) {return;}

    try {
      // Enviar métricas restantes
      if (this.metrics.size > 0) {
        const metrics = Array.from(this.metrics.values());
        const report = this.createPerformanceReport(metrics);
        this.reportQueue.push(report);
      }

      // Enviar toda a fila
      await this.flushReportQueue();
      
  logger.info?.('Web Vitals: final report sent');
    } catch (error) {
  logger.warn?.('Web Vitals: failed to send final report', { error });
    }
  }

  private async flushReportQueue() {
    if (this.reportQueue.length === 0) {return;}

    try {
      flushReportsQueue(this.reportQueue);
    } catch (error) {
      logger.warn?.('Web Vitals: failed to flush report queue', { error });
    }
  }

  private async sendReport(report: PerformanceReport) {
    try {
      await sendSingleReport(report);
    } catch (error) {
      // Adicionar à fila para retry
      this.reportQueue.push(report);
      throw error;
    }
  }

  private createPerformanceReport(metrics: WebVitalMetric[]): PerformanceReport {
    return {
      metrics,
      deviceInfo: this.getDeviceInfo(),
      connectionInfo: this.getConnectionInfo(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.getUserId()
    };
  }

  private getDeviceInfo(): DeviceInfo {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { type?: string } };
    return {
      userAgent: nav.userAgent,
      viewport: { width: globalThis.innerWidth, height: globalThis.innerHeight },
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: nav.hardwareConcurrency,
      connectionType: nav.connection?.type,
    };
  }

  private getConnectionInfo(): ConnectionInfo {
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
    if (!connection) { return {}; }
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  private getUserId(): string | undefined {
    // Tentar recuperar ID do usuário do localStorage ou sessão
    try {
      return localStorage.getItem('azuria-user-id') || undefined;
    } catch {
      return undefined;
    }
  }

  // Métodos públicos para analytics customizada
  public getMetrics(): WebVitalMetric[] {
    return Array.from(this.metrics.values());
  }

  public getPerformanceScore(): number {
  const metrics = this.getMetrics();
  return computePerformanceScore(metrics);
  }

  public destroy() {
    this.isReporting = false;
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
    this.metrics.clear();
    this.reportQueue = [];
  }
}

// Instância global
let webVitalsReporter: WebVitalsReporter | null = null;

export const initWebVitalsReporting = () => {
  if (!webVitalsReporter) {
    webVitalsReporter = new WebVitalsReporter();
  }
  return webVitalsReporter;
};

export const getWebVitalsReporter = () => webVitalsReporter;

export const reportCustomMetric = (name: string, value: number, metadata?: Record<string, unknown>) => {
  if (!webVitalsReporter) {return;}

  // Criar evento de analytics personalizado
  const event: AnalyticsEvent = {
    event: 'custom_performance_metric',
    category: 'Performance',
    action: name,
    value,
    timestamp: Date.now(),
    metadata
  };

  // Enviar para sistema de analytics
  globalThis.gtag?.('event', event.action, {
    event_category: event.category,
    value: event.value,
    custom_parameters: event.metadata
  });
};