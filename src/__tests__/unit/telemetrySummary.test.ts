import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock supabase client usage inside summary route
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        gte: () => ({ data: mockData, error: null })
      })
    })
  })
}));

// Mutable test data
let mockData: Array<{ metric_name: string; value: number }> = [];

import { __resetTelemetrySummaryCache, GET } from '../../../app/api/telemetry/summary/route';

function makeReq(path: string) {
  return new Request(`http://localhost${path}`) as any;
}

describe('/api/telemetry/summary GET', () => {
  beforeEach(() => {
    mockData = [
      { metric_name: 'LCP', value: 2000 },
      { metric_name: 'LCP', value: 2500 },
      { metric_name: 'LCP', value: 3000 },
      { metric_name: 'CLS', value: 0.1 },
      { metric_name: 'CLS', value: 0.05 },
      { metric_name: 'CLS', value: 0.2 }
    ];
    __resetTelemetrySummaryCache();
  });

  it('returns aggregated metrics with percentiles', async () => {
    const res = await GET(makeReq('/api/telemetry/summary'));
    const json = await (res as any).json();
    expect(json.ok).toBe(true);
    const lcp = json.metrics.find((m: any) => m.metric === 'LCP');
    expect(lcp.count).toBe(3);
    expect(lcp.p50).toBeDefined();
    expect(lcp.p95).toBeDefined();
  });

  it('returns cached true on second call within TTL', async () => {
    const first = await GET(makeReq('/api/telemetry/summary'));
    await (first as any).json();
    const second = await GET(makeReq('/api/telemetry/summary'));
    const json2 = await (second as any).json();
    expect(json2.cached).toBe(true);
  });

  it('validates invalid days parameter', async () => {
    const res = await GET(makeReq('/api/telemetry/summary?days=0'));
    const json = await (res as any).json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('invalid-days');
  });
});
