import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/runtimeEnv';
import { createClient } from '@supabase/supabase-js';
import { isFeatureEnabled } from '../../../../lib/featureFlags';

// Simple in-process cache (per serverless instance) to avoid hammering DB if spammed.
// Since this is observational and low criticality, a short TTL is fine.
const CACHE_TTL_MS = 15_000; // 15s
let _lastFetch = 0;
let _cached: unknown = null;
// Test helper to reset in-memory cache between test cases
export function __resetTelemetrySummaryCache() {
  _lastFetch = 0;
  _cached = null;
}

function getClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase env not configured for telemetry summary');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

// Percentile helper using Postgres ordered-set aggregate syntax.
// We compute per metric_name over last N days.
// Returned shape: [{ metric_name, count, p50, p75, p95, p99, min, max, avg }]

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const daysParam = url.searchParams.get('days');
  let days = 7;
  if (daysParam) {
    const n = Number(daysParam);
    if (!Number.isFinite(n) || n <= 0 || n > 90) {
      return NextResponse.json({ ok: false, error: 'invalid-days' }, { status: 400 });
    }
    days = Math.floor(n);
  }

  // Basic cache layer
  const now = Date.now();
  if (_cached && (now - _lastFetch) < CACHE_TTL_MS) {
    return NextResponse.json({ ok: true, cached: true, days, metrics: _cached });
  }

  const client = getClient();
  let source: 'sql' | 'js' = 'js';
  let metrics: Array<{
    metric: string;
    count: number;
    min: number | null;
    max: number | null;
    avg: number | null;
    p50: number | null;
    p75: number | null;
    p95: number | null;
    p99: number | null;
  }> = [];

  const wantSql = isFeatureEnabled('TELEMETRY_SQL_PERCENTILES');
  if (wantSql) {
    try {
       
      interface SqlRow { metric: string; count: number; min: number | null; max: number | null; avg: number | null; p50: number | null; p75: number | null; p95: number | null; p99: number | null }
      const { data: sqlData, error: sqlError }: { data: SqlRow[] | null; error: unknown } = await (client as any)
        .rpc('telemetry_percentiles', { days_window: days });
      if (sqlError) {
        // eslint-disable-next-line no-console
        console.warn('[telemetry-summary] sql path error, falling back to js', sqlError);
      } else if (Array.isArray(sqlData)) {
        metrics = sqlData.map(r => ({
          metric: r.metric,
          count: Number(r.count) || 0,
          min: r.min === null ? null : Number(Number(r.min).toFixed(3)),
          max: r.max === null ? null : Number(Number(r.max).toFixed(3)),
          avg: r.avg === null ? null : Number(Number(r.avg).toFixed(3)),
          p50: r.p50 === null ? null : Number(Number(r.p50).toFixed(3)),
          p75: r.p75 === null ? null : Number(Number(r.p75).toFixed(3)),
          p95: r.p95 === null ? null : Number(Number(r.p95).toFixed(3)),
          p99: r.p99 === null ? null : Number(Number(r.p99).toFixed(3)),
        })).sort((a, b) => b.count - a.count);
        source = 'sql';
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[telemetry-summary] rpc exception fallback to js', e);
    }
  }

  if (metrics.length === 0) {
    // JS fallback path (original implementation)
    type Row = { metric_name: string; value: number };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any).from('performance_reports')
      .select('metric_name,value')
      .gte('received_at', new Date(Date.now() - days * 86400_000).toISOString());
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[telemetry-summary] fetch error', error);
      return NextResponse.json({ ok: false, error: 'db-error' }, { status: 500 });
    }
    const rows = (data || []) as Row[];
    const grouped: Record<string, number[]> = {};
    for (const r of rows) {
      if (!grouped[r.metric_name]) {
        grouped[r.metric_name] = [];
      }
      grouped[r.metric_name].push(r.value);
    }
    metrics = Object.entries(grouped).map(([name, values]) => {
      values.sort((a, b) => a - b);
      const count = values.length;
      if (!count) {
        return {
          metric: name,
          count: 0,
          min: null,
          max: null,
          avg: null,
          p50: null,
          p75: null,
          p95: null,
          p99: null,
        };
      }
      const pick = (p: number) => {
        const idx = Math.min(count - 1, Math.floor(p * (count - 1)));
        return Number(values[idx].toFixed(3));
      };
      const sum = values.reduce((s, v) => s + v, 0);
      return {
        metric: name,
        count,
        min: Number(values[0].toFixed(3)),
        max: Number(values[count - 1].toFixed(3)),
        avg: Number((sum / count).toFixed(3)),
        p50: pick(0.50),
        p75: pick(0.75),
        p95: pick(0.95),
        p99: pick(0.99),
      };
    }).sort((a, b) => b.count - a.count);
  }

  _cached = metrics;
  _lastFetch = now;
  return NextResponse.json({ ok: true, cached: false, days, metrics, source });
}

export const runtime = 'nodejs';