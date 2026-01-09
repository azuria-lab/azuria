/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CENTRAL NUCLEUS TESTS - Testes do Núcleo Central
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes unitários para:
 * - Inicialização e shutdown do núcleo
 * - Processamento de ações
 * - Estatísticas
 *
 * @module tests/unit/azuria_ai/CentralNucleus.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do eventBus
vi.mock('@/azuria_ai/core/eventBus', () => ({
  emitEvent: vi.fn(),
  onEvent: vi.fn(() => vi.fn()),
  offEvent: vi.fn(),
  EventTypes: {
    INSIGHT_GENERATED: 'insight:generated',
    AI_PREDICTIVE_INSIGHT: 'ai:predictive-insight',
    AI_STATE_CHANGED: 'ai:state-changed',
  },
}));

// Mock do UnifiedStateStore
vi.mock('@/azuria_ai/state/UnifiedStateStore', () => ({
  UnifiedStateStore: {
    getState: vi.fn().mockReturnValue({
      consciousness: { level: 'aware', focus: 'user' },
      engines: {},
    }),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    getSlice: vi.fn(),
  },
  initUnifiedStore: vi.fn(),
  shutdownUnifiedStore: vi.fn(),
  getStore: vi.fn().mockReturnValue({
    getState: vi.fn().mockReturnValue({ consciousness: { level: 'aware' } }),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  }),
}));

// Mock do ConsciousnessLevels
vi.mock('@/azuria_ai/consciousness/ConsciousnessLevels', () => ({
  getConsciousnessLevel: vi.fn().mockReturnValue('aware'),
  setConsciousnessLevel: vi.fn(),
  adjustConsciousness: vi.fn(),
}));

// Mock do EngineGovernance
vi.mock('@/azuria_ai/governance/EngineGovernance', () => ({
  initEngineGovernance: vi.fn().mockResolvedValue(true),
  shutdownEngineGovernance: vi.fn(),
  requestActionPermission: vi.fn().mockResolvedValue({ granted: true, reason: 'approved' }),
  recordAction: vi.fn(),
  getGovernanceStats: vi.fn().mockReturnValue({
    totalEmissions: 0,
    totalActions: 0,
    registeredEngines: 0,
  }),
}));

// Mock do UnifiedMemory
vi.mock('@/azuria_ai/memory/UnifiedMemory', () => ({
  UnifiedMemory: {
    init: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn(),
    getSTM: vi.fn().mockReturnValue({ currentContext: {} }),
    getWM: vi.fn().mockReturnValue({ sessionData: {} }),
    getLTM: vi.fn().mockReturnValue({ preferences: {} }),
  },
  initMemory: vi.fn().mockResolvedValue(undefined),
  shutdownMemory: vi.fn(),
}));

// Importar após os mocks
import {
  type ActionRequest,
  CentralNucleus,
  getState,
  getStats,
  initNucleus,
  requestAction,
  shutdownNucleus,
} from '@/azuria_ai/consciousness/CentralNucleus';

describe('CentralNucleus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Garantir shutdown limpo
    try {
      shutdownNucleus();
    } catch {
      // Ignorar erros de shutdown
    }
  });

  describe('Inicialização', () => {
    it('deve inicializar e retornar resultado', async () => {
      const result = await initNucleus();

      expect(result).toHaveProperty('success');
    });

    it('deve aceitar configuração de debug', async () => {
      const result = await initNucleus({ debug: true });

      expect(result).toHaveProperty('success');
    });
  });

  describe('Shutdown', () => {
    it('deve desligar sem erro', async () => {
      await initNucleus();
      expect(() => shutdownNucleus()).not.toThrow();
    });

    it('não deve dar erro se já desligado', () => {
      expect(() => shutdownNucleus()).not.toThrow();
    });
  });

  describe('Estado do Núcleo', () => {
    it('deve retornar estado válido', async () => {
      await initNucleus();
      const state = getState();

      expect(state).toBeDefined();
    });
  });

  describe('Request Action', () => {
    it('deve processar requisição de ação', async () => {
      await initNucleus();

      const request: ActionRequest = {
        id: 'test-1',
        type: 'insight',
        source: 'test-engine',
        payload: { data: 'test' },
        priority: 'normal',
      };

      const response = await requestAction(request);

      expect(response).toHaveProperty('requestId');
      expect(response).toHaveProperty('approved');
    });
  });

  describe('Estatísticas', () => {
    it('deve retornar estatísticas', async () => {
      await initNucleus();

      const stats = getStats();

      expect(stats).toBeDefined();
    });
  });

  describe('CentralNucleus Object', () => {
    it('deve ter métodos essenciais', () => {
      expect(CentralNucleus).toHaveProperty('init');
      expect(CentralNucleus).toHaveProperty('shutdown');
      expect(CentralNucleus).toHaveProperty('requestAction');
      expect(CentralNucleus).toHaveProperty('getStats');
    });
  });
});
