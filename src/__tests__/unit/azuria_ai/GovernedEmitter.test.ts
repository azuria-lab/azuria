/**
 * ══════════════════════════════════════════════════════════════════════════════
 * GOVERNED EMITTER TESTS - Testes do Sistema de Emissão Governada
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes unitários para:
 * - Emissão governada de eventos
 * - Verificação de permissões
 * - Estatísticas de emissão
 * - Integração com CentralNucleus
 *
 * @module tests/unit/azuria_ai/GovernedEmitter.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do eventBus
vi.mock('@/azuria_ai/core/eventBus', () => ({
  emitEvent: vi.fn(),
  onEvent: vi.fn(() => vi.fn()),
  EventTypes: {
    AI_INSIGHT_GENERATED: 'ai:insight:generated',
    AI_SUGGESTION_CREATED: 'ai:suggestion:created',
    USER_ACTION: 'user:action',
  },
}));

// Mock do CentralNucleus
vi.mock('@/azuria_ai/consciousness/CentralNucleus', () => ({
  requestAction: vi.fn().mockResolvedValue({
    requestId: 'test',
    approved: true,
    processedAt: Date.now(),
  }),
  isNucleusRunning: vi.fn(() => true),
  isNucleusInitialized: vi.fn(() => false), // Retorna false para evitar usar CentralNucleus.send
  CentralNucleus: {
    requestAction: vi.fn(),
    isRunning: vi.fn(() => true),
    send: vi.fn(),
  },
}));

// Mock do EngineGovernance
vi.mock('@/azuria_ai/governance/EngineGovernance', () => ({
  requestEmitPermission: vi.fn(() => Promise.resolve({ granted: true })),
  recordEmission: vi.fn(),
  getEngine: vi.fn(() => ({
    id: 'test-engine',
    name: 'Test Engine',
    category: 'cognitive',
    privilege: 'standard',
    allowedEvents: ['ai:insight:generated'],
    active: true,
  })),
  registerEngine: vi.fn(() => true),
  initEngineGovernance: vi.fn(),
}));

// Mock do ConsciousnessLevels
vi.mock('@/azuria_ai/levels/ConsciousnessLevels', () => ({
  getCurrentLevel: vi.fn().mockReturnValue({ id: 'USER', name: 'User Level' }),
  canReceiveEvent: vi.fn().mockReturnValue(true),
}));

// Importar após os mocks
import { emitEvent } from '@/azuria_ai/core/eventBus';
import {
  getEmissionStats,
  governedEmit,
  governedEmitAsync,
  initGovernedEmitter,
  isGovernedEmitterEnabled,
  shutdownGovernedEmitter,
} from '@/azuria_ai/core/GovernedEmitter';

describe('GovernedEmitter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    shutdownGovernedEmitter();
  });

  describe('Inicialização', () => {
    it('deve inicializar corretamente', async () => {
      await initGovernedEmitter();

      expect(isGovernedEmitterEnabled()).toBe(true);
    });

    it('não deve dar erro se já inicializado', async () => {
      await initGovernedEmitter();
      await expect(initGovernedEmitter()).resolves.not.toThrow();
    });
  });

  describe('Shutdown', () => {
    it('deve desligar corretamente', async () => {
      await initGovernedEmitter();
      shutdownGovernedEmitter();

      expect(isGovernedEmitterEnabled()).toBe(false);
    });

    it('não deve dar erro se já desligado', () => {
      expect(() => shutdownGovernedEmitter()).not.toThrow();
    });
  });

  describe('Emissão Síncrona', () => {
    beforeEach(async () => {
      await initGovernedEmitter();
    });

    it('deve emitir evento sincronamente', () => {
      governedEmit('ai:insight:generated', { data: 'test' }, { source: 'test-engine' });

      expect(emitEvent).toHaveBeenCalled();
    });

    it('deve incrementar estatísticas', () => {
      governedEmit('ai:insight:generated', { data: 'test' }, { source: 'test-engine' });

      const stats = getEmissionStats();
      expect(stats.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Emissão Assíncrona', () => {
    beforeEach(async () => {
      await initGovernedEmitter();
    });

    it('deve emitir evento assincronamente', async () => {
      const result = await governedEmitAsync(
        'ai:insight:generated',
        { data: 'test' },
        { source: 'test-engine' }
      );

      expect(result.emitted).toBe(true);
      expect(emitEvent).toHaveBeenCalled();
    });
  });

  describe('Estatísticas', () => {
    it('deve retornar estatísticas válidas', async () => {
      await initGovernedEmitter();

      const stats = getEmissionStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('blocked');
      expect(stats).toHaveProperty('bySource');
      expect(stats).toHaveProperty('isEnabled');
    });
  });

  describe('Opções', () => {
    beforeEach(async () => {
      await initGovernedEmitter();
    });

    it('deve respeitar opção bypassGovernance', async () => {
      const result = await governedEmitAsync(
        'ai:insight:generated',
        {},
        { source: 'test-engine', bypassGovernance: true }
      );

      expect(result.emitted).toBe(true);
    });

    it('deve respeitar opção priority', async () => {
      const result = await governedEmitAsync(
        'ai:insight:generated',
        {},
        { source: 'test-engine', priority: 10 }
      );

      expect(result.emitted).toBe(true);
    });
  });
});
