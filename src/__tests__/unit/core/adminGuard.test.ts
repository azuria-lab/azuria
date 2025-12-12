/**
 * Tests for adminGuard - Admin authentication middleware
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do adminConfig antes de importar adminGuard
vi.mock('@/azuria_ai/core/adminConfig', () => ({
  ADMIN_UID: 'test-admin-uid-12345678',
  ADMIN_UIDS: new Set(['test-admin-uid-12345678', 'another-admin-uid']),
  isValidAdminUID: (uid: string) => uid && uid.length >= 20,
}));

// Importar após o mock
import { _resetRateLimitForTesting, cleanupRateLimitRecords, isAdminRequest, requireAdmin } from '@/azuria_ai/core/adminGuard';

describe('adminGuard', () => {
  // Mock de request e response
  const createMockReq = (headers: Record<string, string> = {}) => ({
    headers,
    socket: { remoteAddress: '127.0.0.1' },
  });

  const createMockRes = () => {
    const res: any = {
      statusCode: 200,
      headers: {},
      body: null,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
    return res;
  };

  beforeEach(() => {
    // Limpar rate limit completamente entre testes
    _resetRateLimitForTesting();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isAdminRequest', () => {
    it('should return true for valid admin UID in header', () => {
      const req = createMockReq({ 'x-admin-uid': 'test-admin-uid-12345678' });
      expect(isAdminRequest(req as any)).toBe(true);
    });

    it('should return false for missing header', () => {
      const req = createMockReq({});
      expect(isAdminRequest(req as any)).toBe(false);
    });

    it('should return false for invalid UID', () => {
      const req = createMockReq({ 'x-admin-uid': 'invalid' });
      expect(isAdminRequest(req as any)).toBe(false);
    });

    it('should return false for empty header', () => {
      const req = createMockReq({ 'x-admin-uid': '' });
      expect(isAdminRequest(req as any)).toBe(false);
    });
  });

  describe('requireAdmin', () => {
    it('should return true and not send response for valid admin', () => {
      const req = createMockReq({ 'x-admin-uid': 'test-admin-uid-12345678' });
      const res = createMockRes();

      const result = requireAdmin(req as any, res);

      expect(result).toBe(true);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return false and send 401 for missing auth', () => {
      const req = createMockReq({});
      const res = createMockRes();

      const result = requireAdmin(req as any, res);

      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        })
      );
    });

    it('should return false and send 401 for invalid UID', () => {
      const req = createMockReq({ 'x-admin-uid': 'short' });
      const res = createMockRes();

      const result = requireAdmin(req as any, res);

      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('rate limiting', () => {
    it('should allow requests within rate limit', () => {
      const req = createMockReq({ 'x-admin-uid': 'invalid-uid-attempt' });
      const res = createMockRes();

      // First 10 requests should be processed (even if rejected for invalid UID)
      for (let i = 0; i < 10; i++) {
        requireAdmin(req as any, createMockRes());
      }

      // 11th request should hit rate limit
      const result = requireAdmin(req as any, res);
      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('should track rate limit per IP', () => {
      const req1 = createMockReq({ 'x-admin-uid': 'invalid' });
      req1.socket = { remoteAddress: '192.168.1.1' };
      
      const req2 = createMockReq({ 'x-admin-uid': 'invalid' });
      req2.socket = { remoteAddress: '192.168.1.2' };

      // Exhaust rate limit for IP 1
      for (let i = 0; i < 11; i++) {
        requireAdmin(req1 as any, createMockRes());
      }

      // IP 2 should still be able to make requests
      const res = createMockRes();
      requireAdmin(req2 as any, res);
      // Should get 401 (unauthorized) not 429 (rate limited)
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('cleanupRateLimitRecords', () => {
    it('should clear expired rate limit records', () => {
      const req = createMockReq({ 'x-admin-uid': 'invalid' });

      // Exhaust rate limit
      for (let i = 0; i < 11; i++) {
        requireAdmin(req as any, createMockRes());
      }

      // Should be rate limited
      let res = createMockRes();
      requireAdmin(req as any, res);
      expect(res.status).toHaveBeenCalledWith(429);

      // Cleanup apenas limpa registros expirados, não ativos
      cleanupRateLimitRecords();

      // Still rate limited (record not expired yet)
      res = createMockRes();
      requireAdmin(req as any, res);
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('should allow requests after full reset', () => {
      const req = createMockReq({ 'x-admin-uid': 'invalid' });

      // Exhaust rate limit
      for (let i = 0; i < 11; i++) {
        requireAdmin(req as any, createMockRes());
      }

      // Should be rate limited
      let res = createMockRes();
      requireAdmin(req as any, res);
      expect(res.status).toHaveBeenCalledWith(429);

      // Full reset (usado em testes)
      _resetRateLimitForTesting();

      // Should no longer be rate limited (gets 401 instead)
      res = createMockRes();
      requireAdmin(req as any, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
