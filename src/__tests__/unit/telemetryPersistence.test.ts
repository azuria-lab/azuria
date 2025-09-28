import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.fn(() => ({ insert: insertMock }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: fromMock }))
}));

import { persistPerformanceReports } from '@/services/telemetry/persistPerformance';

// Minimal metric object
const baseMetric = {
  name: 'LCP',
  value: 2500,
  sessionId: 'sess1'
};

describe('persistPerformanceReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
  });

  it('inserts rows mapping expected columns', async () => {
    await persistPerformanceReports([baseMetric]);
    expect(fromMock).toHaveBeenCalledWith('performance_reports');
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it('derives path from url when absent', async () => {
    await persistPerformanceReports([{ ...baseMetric, url: 'https://example.com/x/y?z=1' }]);
    const callArg = insertMock.mock.calls[insertMock.mock.calls.length - 1][0][0];
    expect(callArg.path).toBe('/x/y');
  });

  it('truncates oversize meta', async () => {
    const bigMeta: Record<string, string> = {};
    for (let i = 0; i < 300; i++) { bigMeta['k'+i] = 'v'.repeat(50); }
    await persistPerformanceReports([{ ...baseMetric, meta: bigMeta }]);
    const callArg = insertMock.mock.calls[insertMock.mock.calls.length - 1][0][0];
    if (JSON.stringify(bigMeta).length > 4000) {
      expect(callArg.meta).toEqual({ truncated: true });
    }
  });
});
