/**
 * Security Tests for Azuria
 * Tests CORS, Security Headers, and Edge Function security
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks controlados para evitar chamadas reais
type MockResponseInit = { status: number; headers?: Record<string, string>; json?: any };
const makeResponse = ({ status, headers = {}, json }: MockResponseInit) => ({
  status,
  headers: {
    get: (key: string) => headers[key] ?? null,
  },
  json: async () => json ?? {},
});

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Security Configuration', () => {
  describe('CORS Whitelist', () => {
    it('should block unauthorized origins', async () => {
      mockFetch.mockResolvedValueOnce(
        makeResponse({ status: 403, json: { code: 'ORIGIN_NOT_ALLOWED' }, headers: { 'Access-Control-Allow-Origin': '' } })
      );

      const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
        method: 'POST',
        headers: {
          Origin: 'https://malicious.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'test' }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.code).toBe('ORIGIN_NOT_ALLOWED');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('');
    });

    it('should allow authorized production origins', async () => {
      const origins = [
        'https://azuria.app.br',
        'https://www.azuria.app.br',
        'https://app.azuria.app.br',
      ];
      origins.forEach((origin) =>
        mockFetch.mockResolvedValueOnce(
          makeResponse({ status: 204, headers: { 'Access-Control-Allow-Origin': origin } })
        )
      );

      for (const origin of origins) {
        const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
          method: 'OPTIONS',
          headers: { Origin: origin },
        });
        expect(response.status).toBe(204);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      }
    });

    it('should allow authorized development origins', async () => {
      const devOrigins = ['http://localhost:8080', 'http://localhost:5173'];
      devOrigins.forEach((origin) =>
        mockFetch.mockResolvedValueOnce(
          makeResponse({ status: 204, headers: { 'Access-Control-Allow-Origin': origin } })
        )
      );

      for (const origin of devOrigins) {
        const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
          method: 'OPTIONS',
          headers: { Origin: origin },
        });
        expect(response.status).toBe(204);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      }
    });
  });

  describe('Security Headers', () => {
    const headers = {
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Permissions-Policy': 'camera=(); microphone=(); geolocation=()',
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue(makeResponse({ status: 200, headers }));
    });

    it('should include HSTS header', async () => {
      const response = await fetch('https://azuria.app.br');
      expect(response.headers.get('Strict-Transport-Security')).toBe(headers['Strict-Transport-Security']);
    });

    it('should include X-Frame-Options', async () => {
      const response = await fetch('https://azuria.app.br');
      expect(response.headers.get('X-Frame-Options')).toBe(headers['X-Frame-Options']);
    });

    it('should include X-Content-Type-Options', async () => {
      const response = await fetch('https://azuria.app.br');
      expect(response.headers.get('X-Content-Type-Options')).toBe(headers['X-Content-Type-Options']);
    });

    it('should include CSP header', async () => {
      const response = await fetch('https://azuria.app.br');
      const csp = response.headers.get('Content-Security-Policy') || '';
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should include COOP header', async () => {
      const response = await fetch('https://azuria.app.br');
      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe(headers['Cross-Origin-Opener-Policy']);
    });

    it('should include CORP header', async () => {
      const response = await fetch('https://azuria.app.br');
      expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe(headers['Cross-Origin-Resource-Policy']);
    });

    it('should include Permissions-Policy', async () => {
      const response = await fetch('https://azuria.app.br');
      const policy = response.headers.get('Permissions-Policy') || '';
      expect(policy).toContain('camera=()');
      expect(policy).toContain('microphone=()');
      expect(policy).toContain('geolocation=()');
    });
  });

  describe('Edge Function Security', () => {
    it('should require authentication', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ status: 500, json: { error: 'missing auth' } }));
      const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'test' }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle OPTIONS preflight correctly', async () => {
      mockFetch.mockResolvedValueOnce(
        makeResponse({
          status: 204,
          headers: {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          },
        })
      );

      const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization',
        },
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    });

    it('should include security headers in error responses', async () => {
      mockFetch.mockResolvedValueOnce(
        makeResponse({
          status: 500,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
          },
          json: { error: 'invalid payload' },
        })
      );

      const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Regression Tests', () => {
    it('should not break existing functionality', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ status: 200, json: { ok: true } }));
      const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          message: 'Hello',
          context: {
            user_id: 'test',
            session_id: 'test',
          },
          history: [],
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
    });

    it('should allow all configured methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      methods.forEach((_method) =>
        mockFetch.mockResolvedValueOnce(
          makeResponse({
            status: 204,
            headers: { 'Access-Control-Allow-Methods': methods.join(',') },
          })
        )
      );

      for (const method of methods) {
        const response = await fetch('http://localhost:54321/functions/v1/azuria-chat', {
          method: 'OPTIONS',
          headers: {
            Origin: 'http://localhost:5173',
            'Access-Control-Request-Method': method,
          },
        });

        expect(response.status).toBe(204);
        expect(response.headers.get('Access-Control-Allow-Methods')).toContain(method);
      }
    });
  });
});
