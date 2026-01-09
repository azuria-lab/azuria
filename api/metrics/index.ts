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

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// In-memory rate limit store (per instance)
// For production, use Redis or Upstash
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 60, // 60 requests per minute (1 per second avg)
  maxRequestsPost: 30, // 30 POST requests per minute
  cleanupIntervalMs: 5 * 60 * 1000, // Clean up every 5 minutes
};

// Cleanup old entries periodically
let lastCleanup = Date.now();

function cleanupRateLimitStore(): void {
  const now = Date.now();
  if (now - lastCleanup < RATE_LIMIT_CONFIG.cleanupIntervalMs) {return;}

  lastCleanup = now;
  const cutoff = now - RATE_LIMIT_CONFIG.windowMs * 2;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.lastRequest < cutoff) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.headers['x-real-ip'] as string || 'unknown';
}

function checkRateLimit(
  clientIP: string,
  method: string
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanupRateLimitStore();

  const now = Date.now();
  const key = `${clientIP}:${method}`;
  const maxRequests = method === 'POST' 
    ? RATE_LIMIT_CONFIG.maxRequestsPost 
    : RATE_LIMIT_CONFIG.maxRequests;

  let entry = rateLimitStore.get(key);

  // First request or window expired
  if (!entry || now - entry.firstRequest > RATE_LIMIT_CONFIG.windowMs) {
    entry = { count: 1, firstRequest: now, lastRequest: now };
    rateLimitStore.set(key, entry);
    return { 
      allowed: true, 
      remaining: maxRequests - 1,
      resetIn: RATE_LIMIT_CONFIG.windowMs,
    };
  }

  // Within window
  entry.count++;
  entry.lastRequest = now;

  const resetIn = RATE_LIMIT_CONFIG.windowMs - (now - entry.firstRequest);

  if (entry.count > maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetIn,
    };
  }

  return { 
    allowed: true, 
    remaining: maxRequests - entry.count,
    resetIn,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

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
  lines.push(
    `# HELP ${prefix}_info Azuria Cognitive System Information`,
    `# TYPE ${prefix}_info gauge`,
    `${prefix}_info{version="1.0.0"} 1`,
    ''
  );

  // Counters
  for (const [key, value] of Object.entries(data.counters)) {
    const safeName = sanitizeMetricName(key);
    lines.push(
      `# TYPE ${prefix}_${safeName}_total counter`,
      `${prefix}_${safeName}_total ${value}`
    );
  }

  // Gauges
  for (const [key, value] of Object.entries(data.gauges)) {
    const safeName = sanitizeMetricName(key);
    lines.push(
      `# TYPE ${prefix}_${safeName} gauge`,
      `${prefix}_${safeName} ${value}`
    );
  }

  // Histograms
  for (const [key, values] of Object.entries(data.histograms)) {
    if (values.length === 0) {continue;}

    const safeName = sanitizeMetricName(key);
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    lines.push(
      `# TYPE ${prefix}_${safeName} histogram`,
      `${prefix}_${safeName}_count ${values.length}`,
      `${prefix}_${safeName}_sum ${sum}`
    );

    // Buckets
    const buckets = [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    for (const le of buckets) {
      const count = sorted.filter((v) => v <= le * 1000).length; // Convert to ms
      lines.push(`${prefix}_${safeName}_bucket{le="${le}"} ${count}`);
    }
    lines.push(`${prefix}_${safeName}_bucket{le="+Inf"} ${values.length}`);
  }

  // Uptime
  lines.push(
    '',
    `# HELP ${prefix}_uptime_seconds System uptime in seconds`,
    `# TYPE ${prefix}_uptime_seconds gauge`,
    `${prefix}_uptime_seconds ${Math.floor(data.uptimeMs / 1000)}`
  );

  return lines.join('\n');
}

/**
 * Sanitize metric name for Prometheus
 */
function sanitizeMetricName(name: string): string {
  return name
    .replaceAll(/[{}]/g, '')
    .replaceAll(/[^a-zA-Z0-9_]/g, '_')
    .replaceAll(/_{2,}/g, '_')
    .replaceAll(/^_|_$/g, '');
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

  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, req.method || 'GET');

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', req.method === 'POST' 
    ? RATE_LIMIT_CONFIG.maxRequestsPost 
    : RATE_LIMIT_CONFIG.maxRequests);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetIn / 1000));

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', Math.ceil(rateLimit.resetIn / 1000));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
      retryAfter: Math.ceil(rateLimit.resetIn / 1000),
    });
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
