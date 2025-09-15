import type { PerformanceReport, WebVitalMetric } from './types.ts';

export function createReport(metrics: WebVitalMetric[], sessionId: string): PerformanceReport {
  return {
    metrics,
    deviceInfo: getDeviceInfo(),
    connectionInfo: getConnectionInfo(),
    timestamp: Date.now(),
    sessionId,
    userId: getUserId(),
  };
}

export async function sendReportsBatch(reports: PerformanceReport[]) {
  try {
    if (navigator.sendBeacon) {
      const data = JSON.stringify(reports);
      navigator.sendBeacon('/api/analytics/web-vitals', data);
    } else {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reports),
        keepalive: true,
      });
    }
  } catch (_e) {
    // swallow; caller can retry later
  }
}

export async function sendReport(report: PerformanceReport) {
  await fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([report]),
  });
}

function getDeviceInfo() {
  const nav = navigator as unknown as { deviceMemory?: number; connection?: { type?: string } };
  return {
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    connectionType: nav.connection?.type,
  };
}

function getConnectionInfo() {
  const connection = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
  if (!connection) { return {} as PerformanceReport['connectionInfo']; }
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

function getUserId(): string | undefined {
  try { return localStorage.getItem('azuria-user-id') || undefined; } catch { return undefined; }
}
