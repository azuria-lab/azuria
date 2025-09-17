import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FetchClientError, fetchJson, resilientFetch } from '@/lib/http/fetchClient';

declare const global: any;

describe('resilientFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna resposta bem sucedida', async () => {
    const mockRes = new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockRes));
    const res = await resilientFetch('https://api.example.com/test');
    expect(res.status).toBe(200);
  });

  it('faz retry em 503 e depois sucesso', async () => {
    const first = new Response('', { status: 503 });
    const second = new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second));
    const res = await resilientFetch('https://api.example.com/retry', { retries: 2, retryDelayBaseMs: 1 });
    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('lança FetchClientError em status 400', async () => {
    const bad = new Response(JSON.stringify({ error: 'fail' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(bad));
    await expect(resilientFetch('https://api.example.com/bad')).rejects.toBeInstanceOf(FetchClientError);
  });

  it('fetchJson retorna objeto', async () => {
    const ok = new Response(JSON.stringify({ value: 42 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok));
    const data = await fetchJson<{ value: number }>('https://api.example.com/json');
    expect(data.value).toBe(42);
  });

  it('emite evento de métricas em sucesso', async () => {
    const ok = new Response('', { status: 204 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok));
    const listener = vi.fn();
    window.addEventListener('fetch:metrics', listener as EventListener);
    await resilientFetch('https://api.example.com/metrics');
    // Microtask flush
    expect(listener).toHaveBeenCalledTimes(1);
    const evt = listener.mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toMatchObject({ url: 'https://api.example.com/metrics', status: 204, ok: true });
    expect(typeof evt.detail.durationMs).toBe('number');
  });

  it('emite evento de métricas em erro http', async () => {
    const bad = new Response('', { status: 500 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(bad));
    const listener = vi.fn();
    window.addEventListener('fetch:metrics', listener as EventListener);
    await expect(resilientFetch('https://api.example.com/fail', { retries: 0, retryDelayBaseMs: 1 })).rejects.toBeInstanceOf(FetchClientError);
    expect(listener).toHaveBeenCalledTimes(1);
    const evt = listener.mock.calls[0][0] as CustomEvent;
    expect(evt.detail.ok).toBe(false);
    expect(evt.detail.status).toBe(500);
    expect(evt.detail.errorType).toBe('http');
  });
});
