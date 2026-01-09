/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ENGINE GOVERNANCE TESTS - Testes do Sistema de Governança de Engines
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes unitários para:
 * - Registro de engines
 * - Permissões de ações
 * - Permissões de emissão
 * - Estatísticas de governança
 *
 * @module tests/unit/azuria_ai/EngineGovernance.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do CentralNucleus
vi.mock('@/azuria_ai/consciousness/CentralNucleus', () => ({
  requestAction: vi.fn().mockResolvedValue({
    requestId: 'test',
    approved: true,
    processedAt: Date.now(),
  }),
  isInitialized: vi.fn(() => true),
  getState: vi.fn(() => ({ initialized: true, silenceMode: false })),
  CentralNucleus: {
    requestAction: vi.fn().mockResolvedValue({
      requestId: 'test',
      approved: true,
      processedAt: Date.now(),
    }),
    isRunning: vi.fn(() => true),
  },
}));

// Importar após os mocks
import {
  EngineGovernance,
  getEngine,
  getGovernanceStats,
  initEngineGovernance,
  listEngines,
  recordEmission,
  registerEngine,
  requestActionPermission,
  requestEmitPermission,
  shutdownEngineGovernance,
  unregisterEngine,
} from '@/azuria_ai/governance/EngineGovernance';

describe('EngineGovernance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    shutdownEngineGovernance();
  });

  describe('Inicialização', () => {
    it('deve inicializar sem erro', () => {
      expect(() => initEngineGovernance()).not.toThrow();
    });

    it('deve inicializar com configuração', () => {
      expect(() => initEngineGovernance({ maxEngines: 100 })).not.toThrow();
    });
  });

  describe('Registro de Engines', () => {
    beforeEach(() => {
      initEngineGovernance();
    });

    it('deve registrar engine corretamente', () => {
      const result = registerEngine({
        id: 'test-engine',
        name: 'Test Engine',
        category: 'insight',
        privileges: ['emit_events'],
      });

      expect(result).toBe(true);
      expect(getEngine('test-engine')).toBeDefined();
    });

    it('deve listar engines registrados', () => {
      registerEngine({
        id: 'engine-1',
        name: 'Engine 1',
        category: 'insight',
        privileges: ['emit_events'],
      });

      registerEngine({
        id: 'engine-2',
        name: 'Engine 2',
        category: 'action',
        privileges: ['execute_actions'],
      });

      const engines = listEngines();

      expect(engines.length).toBeGreaterThanOrEqual(2);
    });

    it('deve desregistrar engine corretamente', () => {
      registerEngine({
        id: 'to-remove',
        name: 'To Remove',
        category: 'insight',
        privileges: [],
      });

      expect(getEngine('to-remove')).toBeDefined();

      unregisterEngine('to-remove');

      expect(getEngine('to-remove')).toBeUndefined();
    });
  });

  describe('Permissões de Emissão', () => {
    beforeEach(() => {
      initEngineGovernance();
      registerEngine({
        id: 'emit-engine',
        name: 'Emit Engine',
        category: 'insight',
        privileges: ['emit_events'],
      });
    });

    it('deve verificar permissão de emissão', async () => {
      const result = await requestEmitPermission({
        engineId: 'emit-engine',
        eventType: 'ai:insight:generated',
      });

      expect(result).toHaveProperty('granted');
    });

    it('deve registrar emissão', () => {
      expect(() => recordEmission('emit-engine')).not.toThrow();
    });
  });

  describe('Permissões de Ação', () => {
    beforeEach(() => {
      initEngineGovernance();
      registerEngine({
        id: 'action-engine',
        name: 'Action Engine',
        category: 'action',
        privileges: ['execute_actions'],
      });
    });

    it('deve verificar permissão de ação', async () => {
      const result = await requestActionPermission({
        engineId: 'action-engine',
        actionType: 'update',
        payload: {},
      });

      expect(result).toHaveProperty('granted');
    });
  });

  describe('Estatísticas', () => {
    it('deve retornar estatísticas válidas', () => {
      initEngineGovernance();

      const stats = getGovernanceStats();

      expect(stats).toHaveProperty('totalEmissions');
      expect(stats).toHaveProperty('totalActions');
      expect(stats).toHaveProperty('engineCount');
    });
  });

  describe('EngineGovernance Object', () => {
    it('deve ter métodos essenciais', () => {
      expect(EngineGovernance).toHaveProperty('init');
      expect(EngineGovernance).toHaveProperty('shutdown');
      expect(EngineGovernance).toHaveProperty('registerEngine');
      expect(EngineGovernance).toHaveProperty('requestEmitPermission');
    });
  });
});
