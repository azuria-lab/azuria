/**
 * Security Tests for Azuria
 * Tests CORS, Security Headers, and Edge Function security
 */

import { describe, it, expect } from 'vitest';

describe('Security Configuration', () => {
  describe('CORS Whitelist', () => {
    it('should block unauthorized origins', async () => {
      const response = await fetch(
        'http://localhost:54321/functions/v1/azuria-chat',
        {
          method: 'POST',
          headers: {
            Origin: 'https://malicious.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'test' }),
        }
      );

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.code).toBe('ORIGIN_NOT_ALLOWED');
    });

    it('should allow authorized production origins', async () => {
      const authorizedOrigins = [
        'https://azuria.app.br',
        'https://www.azuria.app.br',
        'https://app.azuria.app.br',
      ];

      for (const origin of authorizedOrigins) {
        const response = await fetch(
          'http://localhost:54321/functions/v1/azuria-chat',
          {
            method: 'OPTIONS',
            headers: {
              Origin: origin,
            },
          }
        );

        expect(response.status).toBe(204);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
          origin
        );
      }
    });

    it('should allow authorized development origins', async () => {
      const devOrigins = ['http://localhost:8080', 'http://localhost:5173'];

      for (const origin of devOrigins) {
        const response = await fetch(
          'http://localhost:54321/functions/v1/azuria-chat',
          {
            method: 'OPTIONS',
            headers: {
              Origin: origin,
            },
          }
        );

        expect(response.status).toBe(204);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
          origin
        );
      }
    });
  });

  describe('Security Headers', () => {
    it('should include HSTS header', async () => {
      const response = await fetch('https://azuria.app.br');

      expect(response.headers.get('Strict-Transport-Security')).toBe(
        'max-age=63072000; includeSubDomains; preload'
      );
    });

    it('should include X-Frame-Options', async () => {
      const response = await fetch('https://azuria.app.br');

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should include X-Content-Type-Options', async () => {
      const response = await fetch('https://azuria.app.br');

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should include CSP header', async () => {
      const response = await fetch('https://azuria.app.br');

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should include COOP header', async () => {
      const response = await fetch('https://azuria.app.br');

      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe(
        'same-origin'
      );
    });

    it('should include CORP header', async () => {
      const response = await fetch('https://azuria.app.br');

      expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe(
        'same-origin'
      );
    });

    it('should include Permissions-Policy', async () => {
      const response = await fetch('https://azuria.app.br');

      const policy = response.headers.get('Permissions-Policy');
      expect(policy).toContain('camera=()');
      expect(policy).toContain('microphone=()');
      expect(policy).toContain('geolocation=()');
    });
  });

  describe('Edge Function Security', () => {
    it('should require authentication', async () => {
      const response = await fetch(
        'http://localhost:54321/functions/v1/azuria-chat',
        {
          method: 'POST',
          headers: {
            Origin: 'http://localhost:5173',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'test' }),
        }
      );

      expect(response.status).toBe(500); // Should fail due to missing auth
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle OPTIONS preflight correctly', async () => {
      const response = await fetch(
        'http://localhost:54321/functions/v1/azuria-chat',
        {
          method: 'OPTIONS',
          headers: {
            Origin: 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization',
          },
        }
      );

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'POST'
      );
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain(
        'Authorization'
      );
    });

    it('should include security headers in error responses', async () => {
      const response = await fetch(
        'http://localhost:54321/functions/v1/azuria-chat',
        {
          method: 'POST',
          headers: {
            Origin: 'http://localhost:5173',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invalid: 'data' }),
        }
      );

      // Even on error, security headers should be present
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Regression Tests', () => {
    it('should not break existing functionality', async () => {
      // Test that legitimate requests still work
      const response = await fetch(
        'http://localhost:54321/functions/v1/azuria-chat',
        {
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
        }
      );

      // Should process (might fail on Gemini API, but shouldn't be blocked by CORS)
      expect(response.status).not.toBe(403);
    });

    it('should allow all configured methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];

      for (const method of methods) {
        const response = await fetch(
          'http://localhost:54321/functions/v1/azuria-chat',
          {
            method: 'OPTIONS',
            headers: {
              Origin: 'http://localhost:5173',
              'Access-Control-Request-Method': method,
            },
          }
        );

        expect(response.status).toBe(204);
        expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
          method
        );
      }
    });
  });
});
