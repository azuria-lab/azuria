/**
 * ══════════════════════════════════════════════════════════════════════════════
 * METRICS API - Exportação de Métricas para Prometheus/Grafana
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Endpoint Vercel Edge Function para exportar métricas do sistema cognitivo
 * em formato compatível com Prometheus para integração com Grafana.
 *
 * @endpoint GET /api/metrics
 * @endpoint GET /api/metrics?format=prometheus
 * @endpoint GET /api/metrics?format=json
 *
 * @module api/metrics
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simulated metrics storage (in production, this would come from a real source)
// This is a placeholder since the actual metrics are client-side
interface MetricData {
  counters: Record<string, number>;
  gauges: Record<string, number>;
  histograms: Record<string, number[]>;
  timestamp: number;
  uptimeMs: number;
}

// In a real implementation, you would:
// 1. Store metrics in Redis/Supabase from the client
// 2. Retrieve them here for the Prometheus scraper

const metricsCache: MetricData = {
  counters: {},
  gauges: {},
  histograms: {},
  timestamp: Date.now(),
  uptimeMs: 0,
};

/**
 * Generate Prometheus-compatible output
 */
function formatPrometheus(data: MetricData): string {
  const lines: string[] = [];
  const prefix = 'azuria_cognitive';

  // Add metadata
  lines.push(`# HELP ${prefix}_info Azuria Cognitive System Information`);
  lines.push(`# TYPE ${prefix}_info gauge`);
  lines.push(`${prefix}_info{version="1.0.0"} 1`);
  lines.push('');

  // Counters
  for (const [key, value] of Object.entries(data.counters)) {
    const safeName = sanitizeMetricName(key);
    lines.push(`# TYPE ${prefix}_${safeName}_total counter`);
    lines.push(`${prefix}_${safeName}_total ${value}`);
  }

  // Gauges
  for (const [key, value] of Object.entries(data.gauges)) {
    const safeName = sanitizeMetricName(key);
    lines.push(`# TYPE ${prefix}_${safeName} gauge`);
    lines.push(`${prefix}_${safeName} ${value}`);
  }

  // Histograms
  for (const [key, values] of Object.entries(data.histograms)) {
    if (values.length === 0) {continue;}

    const safeName = sanitizeMetricName(key);
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    lines.push(`# TYPE ${prefix}_${safeName} histogram`);
    lines.push(`${prefix}_${safeName}_count ${values.length}`);
    lines.push(`${prefix}_${safeName}_sum ${sum}`);

    // Buckets
    const buckets = [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    for (const le of buckets) {
      const count = sorted.filter((v) => v <= le * 1000).length; // Convert to ms
      lines.push(`${prefix}_${safeName}_bucket{le="${le}"} ${count}`);
    }
    lines.push(`${prefix}_${safeName}_bucket{le="+Inf"} ${values.length}`);
  }

  // Uptime
  lines.push('');
  lines.push(`# HELP ${prefix}_uptime_seconds System uptime in seconds`);
  lines.push(`# TYPE ${prefix}_uptime_seconds gauge`);
  lines.push(`${prefix}_uptime_seconds ${Math.floor(data.uptimeMs / 1000)}`);

  return lines.join('\n');
}

/**
 * Sanitize metric name for Prometheus
 */
function sanitizeMetricName(name: string): string {
  return name
    .replace(/[{}]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * API Handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST (update metrics from client)
  if (req.method === 'POST') {
    try {
      const data = req.body as Partial<MetricData>;
      
      if (data.counters) {metricsCache.counters = { ...metricsCache.counters, ...data.counters };}
      if (data.gauges) {metricsCache.gauges = { ...metricsCache.gauges, ...data.gauges };}
      if (data.histograms) {metricsCache.histograms = { ...metricsCache.histograms, ...data.histograms };}
      metricsCache.timestamp = Date.now();
      metricsCache.uptimeMs = data.uptimeMs ?? metricsCache.uptimeMs;

      res.status(200).json({ success: true, timestamp: metricsCache.timestamp });
    } catch {
      res.status(400).json({ error: 'Invalid metrics data' });
    }
    return;
  }

  // Handle GET (export metrics)
  if (req.method === 'GET') {
    const format = (req.query.format as string) ?? 'prometheus';

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        ...metricsCache,
        exportedAt: Date.now(),
      });
      return;
    }

    // Default: Prometheus format
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(formatPrometheus(metricsCache));
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
