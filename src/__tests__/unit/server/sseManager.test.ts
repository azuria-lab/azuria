/**
 * Tests for sseManager - Server-Sent Events management
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSSEClientManager,
  getSSEStats,
  notifySSE,
  registerClient,
  shutdownSSE,
  unregisterClient,
} from '@/server/sseManager';

describe('sseManager', () => {
  // Mock de response SSE
  const createMockResponse = () => {
    const chunks: string[] = [];
    return {
      write: vi.fn((data: string) => {
        chunks.push(data);
        return true;
      }),
      end: vi.fn(),
      chunks,
    };
  };

  beforeEach(() => {
    // Garantir estado limpo antes de cada teste
    shutdownSSE();
  });

  afterEach(() => {
    // Limpar após cada teste
    shutdownSSE();
    vi.clearAllMocks();
  });

  describe('registerClient', () => {
    it('should register a new client and return an ID', () => {
      const res = createMockResponse();
      const id = registerClient(res);

      expect(id).toBeTruthy();
      expect(id).toMatch(/^sse_\d+_[a-f0-9]+$/);
    });

    it('should send connected and heartbeat events on registration', () => {
      const res = createMockResponse();
      registerClient(res);

      expect(res.write).toHaveBeenCalledTimes(2);
      
      // Verificar evento connected
      const connectedCall = res.chunks[0];
      expect(connectedCall).toContain('event: connected');
      expect(connectedCall).toContain('clientId');

      // Verificar evento heartbeat
      const heartbeatCall = res.chunks[1];
      expect(heartbeatCall).toContain('event: heartbeat');
    });

    it('should increment client count on registration', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      registerClient(res1);
      expect(getSSEStats().totalClients).toBe(1);

      registerClient(res2);
      expect(getSSEStats().totalClients).toBe(2);
    });
  });

  describe('unregisterClient', () => {
    it('should remove client from registry', () => {
      const res = createMockResponse();
      const id = registerClient(res);

      expect(getSSEStats().totalClients).toBe(1);

      unregisterClient(id);
      expect(getSSEStats().totalClients).toBe(0);
    });

    it('should handle unregistering non-existent client', () => {
      // Should not throw
      expect(() => unregisterClient('non-existent-id')).not.toThrow();
    });
  });

  describe('notifySSE', () => {
    it('should send message to all connected clients', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      registerClient(res1);
      registerClient(res2);

      // Clear registration messages
      res1.write.mockClear();
      res2.write.mockClear();

      notifySSE({
        channel: 'test',
        event: 'test-event',
        data: { message: 'hello' },
      });

      expect(res1.write).toHaveBeenCalledTimes(1);
      expect(res2.write).toHaveBeenCalledTimes(1);

      const sentData = res1.write.mock.calls[0][0];
      expect(sentData).toContain('event: test-event');
      expect(sentData).toContain('"message":"hello"');
    });

    it('should remove disconnected clients on write error', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      registerClient(res1);
      registerClient(res2);

      // Simular desconexão do cliente 1
      res1.write.mockImplementation(() => {
        throw new Error('Connection closed');
      });

      expect(getSSEStats().totalClients).toBe(2);

      notifySSE({
        channel: 'test',
        event: 'test-event',
        data: {},
      });

      // Cliente 1 deve ser removido
      expect(getSSEStats().totalClients).toBe(1);
    });

    it('should do nothing when no clients connected', () => {
      // Should not throw
      expect(() =>
        notifySSE({
          channel: 'test',
          event: 'test',
          data: {},
        })
      ).not.toThrow();
    });
  });

  describe('getSSEStats', () => {
    it('should return correct stats', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      const id1 = registerClient(res1);
      registerClient(res2);

      const stats = getSSEStats();

      expect(stats.totalClients).toBe(2);
      expect(stats.clients).toHaveLength(2);
      expect(stats.clients[0]).toHaveProperty('id');
      expect(stats.clients[0]).toHaveProperty('connectedAt');
      expect(stats.clients[0]).toHaveProperty('lastHeartbeat');

      // Verificar que o primeiro cliente registrado está na lista
      expect(stats.clients.some((c) => c.id === id1)).toBe(true);
    });

    it('should return empty stats when no clients', () => {
      const stats = getSSEStats();

      expect(stats.totalClients).toBe(0);
      expect(stats.clients).toHaveLength(0);
    });
  });

  describe('shutdownSSE', () => {
    it('should disconnect all clients', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      registerClient(res1);
      registerClient(res2);

      expect(getSSEStats().totalClients).toBe(2);

      shutdownSSE();

      expect(getSSEStats().totalClients).toBe(0);
    });

    it('should send shutdown event to clients', () => {
      const res = createMockResponse();
      registerClient(res);

      res.write.mockClear();
      shutdownSSE();

      // Deve ter enviado evento shutdown
      const shutdownCall = res.write.mock.calls.find((call) =>
        call[0].includes('event: shutdown')
      );
      expect(shutdownCall).toBeTruthy();
    });

    it('should call end() on all responses', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      registerClient(res1);
      registerClient(res2);

      shutdownSSE();

      expect(res1.end).toHaveBeenCalled();
      expect(res2.end).toHaveBeenCalled();
    });
  });

  describe('getSSEClientManager', () => {
    it('should return all manager functions', () => {
      const manager = getSSEClientManager();

      expect(manager).toHaveProperty('registerClient');
      expect(manager).toHaveProperty('unregisterClient');
      expect(manager).toHaveProperty('notifySSE');
      expect(manager).toHaveProperty('getSSEStats');
      expect(manager).toHaveProperty('shutdownSSE');

      expect(typeof manager.registerClient).toBe('function');
      expect(typeof manager.unregisterClient).toBe('function');
      expect(typeof manager.notifySSE).toBe('function');
      expect(typeof manager.getSSEStats).toBe('function');
      expect(typeof manager.shutdownSSE).toBe('function');
    });
  });
});
