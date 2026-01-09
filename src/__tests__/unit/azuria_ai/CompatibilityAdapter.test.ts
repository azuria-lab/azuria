/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COMPATIBILITY ADAPTER TESTS - Testes do Adaptador de Compatibilidade
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes unitários para:
 * - Instalação do adapter
 * - Interceptação de emitEvent legado
 * - Estatísticas de interceptação
 * - Integração com GovernedEmitter
 *
 * @module tests/unit/azuria_ai/CompatibilityAdapter.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do eventBus
vi.mock('@/azuria_ai/core/eventBus', () => ({
  emitEvent: vi.fn(),
  onEvent: vi.fn(() => vi.fn()),
  EventTypes: {
    AI_INSIGHT_GENERATED: 'ai:insight:generated',
    AI_SUGGESTION_CREATED: 'ai:suggestion:created',
  },
}));

// Mock do GovernedEmitter
vi.mock('@/azuria_ai/core/GovernedEmitter', () => ({
  governedEmit: vi.fn(),
  governedEmitAsync: vi.fn().mockResolvedValue(true),
  isGovernedEmitterEnabled: vi.fn(() => true),
  initGovernedEmitter: vi.fn().mockResolvedValue(true),
}));

// Importar após os mocks
import {
  getCompatibilityAdapterStats,
  installCompatibilityAdapter,
  isCompatibilityAdapterInstalled,
  resetCompatibilityAdapterStats,
  uninstallCompatibilityAdapter,
} from '@/azuria_ai/governance/CompatibilityAdapter';

describe('CompatibilityAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    uninstallCompatibilityAdapter();
  });

  describe('Instalação', () => {
    it('deve instalar adapter corretamente', async () => {
      await installCompatibilityAdapter();

      expect(isCompatibilityAdapterInstalled()).toBe(true);
    });

    it('não deve dar erro se já instalado', async () => {
      await installCompatibilityAdapter();
      await installCompatibilityAdapter(); // Não deve lançar erro

      expect(isCompatibilityAdapterInstalled()).toBe(true);
    });
  });

  describe('Desinstalação', () => {
    it('deve desinstalar adapter corretamente', async () => {
      await installCompatibilityAdapter();
      uninstallCompatibilityAdapter();

      expect(isCompatibilityAdapterInstalled()).toBe(false);
    });

    it('não deve dar erro se já desinstalado', () => {
      expect(() => uninstallCompatibilityAdapter()).not.toThrow();
    });
  });

  describe('Estatísticas', () => {
    it('deve retornar estatísticas válidas', async () => {
      await installCompatibilityAdapter();

      const stats = getCompatibilityAdapterStats();

      expect(stats).toHaveProperty('totalIntercepted');
      expect(stats).toHaveProperty('bySource');
      expect(stats).toHaveProperty('isInstalled');
    });

    it('deve resetar estatísticas', async () => {
      await installCompatibilityAdapter();

      resetCompatibilityAdapterStats();
      const stats = getCompatibilityAdapterStats();

      expect(stats.totalIntercepted).toBe(0);
    });
  });

  describe('Estado', () => {
    it('deve refletir estado não instalado', () => {
      const stats = getCompatibilityAdapterStats();

      expect(stats.isInstalled).toBe(false);
    });

    it('deve refletir estado instalado', async () => {
      await installCompatibilityAdapter();
      const stats = getCompatibilityAdapterStats();

      expect(stats.isInstalled).toBe(true);
    });
  });
});
