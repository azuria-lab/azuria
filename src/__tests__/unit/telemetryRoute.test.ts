import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock persistence service
vi.mock('@/services/telemetry/persistPerformance', () => ({
  persistPerformanceReports: vi.fn().mockResolvedValue(undefined),
}));

import { persistPerformanceReports } from '@/services/telemetry/persistPerformance';
// Import da rota via path relativo para evitar problemas de alias com app/ no vitest
import { POST } from '../../../app/api/telemetry/route';

function makeReq(body: unknown) {
  return new Request('http://localhost/api/telemetry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  }) as any; // NextRequest compatible enough for test
}

describe('/api/telemetry POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENABLE_TELEMETRY_PERSIST = 'true';
    process.env.NODE_ENV = 'production';
  });

  it('accepts single metric (new schema)', async () => {
    const res = await POST(makeReq({ name: 'LCP', value: 1234 }));
    const json = await (res as any).json();
    expect(json.accepted).toBe(1);
    expect(persistPerformanceReports).toHaveBeenCalledTimes(1);
  });

  it('accepts array metrics (new schema)', async () => {
    const res = await POST(makeReq([{ name: 'CLS', value: 0.1 }, { name: 'FCP', value: 1500 }]));
    const json = await (res as any).json();
    expect(json.accepted).toBe(2);
  });

  it('accepts legacy batch format', async () => {
    const res = await POST(makeReq({ reports: [{ sessionId: 's1', timestamp: Date.now(), metrics: [{ name: 'FID', value: 15 }] }] }));
    const json = await (res as any).json();
    expect(json.accepted).toBe(1);
  });

  it('returns 400 on invalid payload', async () => {
    const res = await POST(makeReq({}));
    const json = await (res as any).json();
    expect(json.ok).toBe(false);
    expect(json.error).toBeDefined();
  });

  it('skips persistence when flag disabled', async () => {
    process.env.ENABLE_TELEMETRY_PERSIST = 'false';
    const res = await POST(makeReq({ name: 'LCP', value: 500 }));
    const json = await (res as any).json();
    expect(json.persisted).toBe(false);
    expect(persistPerformanceReports).not.toHaveBeenCalled();
  });
});
