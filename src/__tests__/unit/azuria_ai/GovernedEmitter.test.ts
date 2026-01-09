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

// Mock do eventBus - mocks inline
vi.mock('@/azuria_ai/core/eventBus', () => ({
  emitEvent: vi.fn(),
  onEvent: vi.fn(() => vi.fn()),
  EventTypes: {
    AI_INSIGHT_GENERATED: 'ai:insight:generated',
    AI_SUGGESTION_CREATED: 'ai:suggestion:created',
    USER_ACTION: 'user:action',
  },
}));

// Mock do CentralNucleus - inline
vi.mock('@/azuria_ai/consciousness/CentralNucleus', () => ({
  requestAction: vi.fn().mockResolvedValue({
    requestId: 'test',
    approved: true,
    processedAt: Date.now(),
  }),
  isNucleusRunning: vi.fn(() => true),
  CentralNucleus: {
    requestAction: vi.fn(),
    isRunning: vi.fn(() => true),
  },
}));

// Mock do EngineGovernance - inline
vi.mock('@/azuria_ai/governance/EngineGovernance', () => ({
  requestEmitPermission: vi.fn().mockResolvedValue({ granted: true }),
  recordEmission: vi.fn(),
}));

// Importar após os mocks
import { emitEvent } from '@/azuria_ai/core/eventBus';
import { isNucleusRunning, requestAction } from '@/azuria_ai/consciousness/CentralNucleus';
import { requestEmitPermission } from '@/azuria_ai/governance/EngineGovernance';
import {
  getGovernedEmitterStats,
  governedEmit,
  governedEmitAsync,
  initGovernedEmitter,
  isGovernedEmitterEnabled,
  resetGovernedEmitterStats,
  shutdownGovernedEmitter,
} from '@/azuria_ai/core/GovernedEmitter';

describe('GovernedEmitter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configurar mocks padrão
    vi.mocked(isNucleusRunning).mockReturnValue(true);
    vi.mocked(requestAction).mockResolvedValue({
      requestId: 'test',
      approved: true,
      processedAt: Date.now(),
    });
    vi.mocked(requestEmitPermission).mockResolvedValue({
      granted: true,
      reason: 'approved',
    });
  });

  afterEach(() => {
    shutdownGovernedEmitter();
  });

  describe('Inicialização', () => {
    it('deve inicializar corretamente', async () => {
      const result = await initGovernedEmitter();

      expect(result).toBe(true);
      expect(isGovernedEmitterEnabled()).toBe(true);
    });

    it('deve retornar true se já inicializado', async () => {
      await initGovernedEmitter();
      const result = await initGovernedEmitter();

      expect(result).toBe(true);
    });

    it('deve inicializar com debug ativo', async () => {
      const result = await initGovernedEmitter({ debug: true });

      expect(result).toBe(true);
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
      governedEmit('test-engine', 'ai:insight:generated', { data: 'test' });

      // Verifica que emitEvent foi chamado
      expect(emitEvent).toHaveBeenCalled();
    });

    it('deve incrementar estatísticas', () => {
      governedEmit('test-engine', 'ai:insight:generated', { data: 'test' });

      const stats = getGovernedEmitterStats();
      expect(stats.totalEmissions).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Emissão Assíncrona', () => {
    beforeEach(async () => {
      await initGovernedEmitter();
    });

    it('deve emitir evento assincronamente', async () => {
      const result = await governedEmitAsync('test-engine', 'ai:insight:generated', {
        data: 'test',
      });

      expect(result).toBe(true);
      expect(emitEvent).toHaveBeenCalled();
    });

    it('deve respeitar permissões negadas', async () => {
      vi.mocked(requestEmitPermission).mockResolvedValueOnce({
        granted: false,
        reason: 'blocked',
      });

      const result = await governedEmitAsync('blocked-engine', 'ai:insight:generated', {});

      expect(result).toBe(false);
    });
  });

  describe('Estatísticas', () => {
    it('deve retornar estatísticas válidas', async () => {
      await initGovernedEmitter();

      const stats = getGovernedEmitterStats();

      expect(stats).toHaveProperty('totalEmissions');
      expect(stats).toHaveProperty('blockedEmissions');
      expect(stats).toHaveProperty('byEngine');
    });

    it('deve resetar estatísticas', async () => {
      await initGovernedEmitter();

      governedEmit('test-engine', 'ai:insight:generated', {});
      let stats = getGovernedEmitterStats();
      expect(stats.totalEmissions).toBeGreaterThanOrEqual(1);

      resetGovernedEmitterStats();
      stats = getGovernedEmitterStats();
      expect(stats.totalEmissions).toBe(0);
    });
  });

  describe('Opções', () => {
    beforeEach(async () => {
      await initGovernedEmitter();
    });

    it('deve respeitar opção skipGovernance', async () => {
      const result = await governedEmitAsync(
        'test-engine',
        'ai:insight:generated',
        {},
        { skipGovernance: true }
      );

      expect(result).toBe(true);
      // Não deve verificar permissões
    });

    it('deve respeitar opção priority', async () => {
      const result = await governedEmitAsync(
        'test-engine',
        'ai:insight:generated',
        {},
        { priority: 'high' }
      );

      expect(result).toBe(true);
    });
  });
});
