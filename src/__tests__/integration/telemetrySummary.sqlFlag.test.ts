import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { resetFeatureFlags, setFeatureFlag } from '../../../lib/featureFlags';
import { __resetTelemetrySummaryCache, GET } from '../../../app/api/telemetry/summary/route';

// We will mock the supabase client factory indirectly by monkey patching createClient from @supabase/supabase-js
import { createClient as realCreateClient } from '@supabase/supabase-js';
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

// Helper to build a NextRequest-like object
// Minimal NextRequest mock: only fields accessed by our handler (url)
function makeReq(url: string) {
  return { url } as any; // handler only uses new URL(req.url)
}

describe('telemetry summary SQL flag path', () => {
  let mocked: any;
  const originalCreate = realCreateClient;
  let warnSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeAll(async () => {
    mocked = (await import('@supabase/supabase-js')) as any;
    setFeatureFlag('TELEMETRY_SQL_PERCENTILES', true);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Also silence error logs from expected test failures
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    __resetTelemetrySummaryCache();
    mocked.createClient = vi.fn().mockImplementation(originalCreate);
    vi.restoreAllMocks();
    if (warnSpy) {
      warnSpy.mockClear();
    }
  });

  afterAll(() => {
    resetFeatureFlags();
    if (warnSpy) {
      warnSpy.mockRestore();
    }
    vi.restoreAllMocks();
  });

  it('returns sql metrics when rpc succeeds', async () => {
    mocked.createClient = vi.fn(() => ({
      rpc: vi.fn().mockResolvedValue({
        data: [
          { metric: 'lcp', count: 10, min: 100, max: 250, avg: 180, p50: 170, p75: 200, p95: 240, p99: 250 }
        ],
        error: null
      })
    }));

    const res = await GET(makeReq('https://example.test/api/telemetry/summary'));
    const json = await (res as any).json();
    expect(json.ok).toBe(true);
    expect(json.source).toBe('sql');
    expect(json.metrics).toHaveLength(1);
    expect(json.metrics[0].metric).toBe('lcp');
  });

  it('falls back to js when rpc errors', async () => {
    mocked.createClient = vi.fn(() => ({
      rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('boom') }),
      from: () => ({
        select: () => ({ gte: () => ({ data: [ { metric_name: 'cls', value: 0.1 }, { metric_name: 'cls', value: 0.2 } ], error: null }) })
      })
    }));

    const res = await GET(makeReq('https://example.test/api/telemetry/summary'));
    const json = await (res as any).json();
    expect(json.ok).toBe(true);
    expect(json.source).toBe('js');
    expect(json.metrics[0].metric).toBe('cls');
  });
  it('noop to ensure afterAll ran', () => {
    expect(true).toBe(true);
  });
});
