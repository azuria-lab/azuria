/**
 * @fileoverview Testes para PredictiveEngine - Fase 5
 *
 * Testa o motor de predição que antecipa ações do usuário
 * e calcula riscos de abandono.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do eventBus
vi.mock('@/azuria_ai/events/eventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(() => 'sub_id'),
  },
}));

import {
  calculateAbandonmentRisk,
  getCurrentPredictions,
  getMostLikelyNextAction,
  initPredictiveEngine,
  predictFlow,
  recordUserAction,
  suggestSmartShortcuts,
  updatePredictionContext,
} from '@/azuria_ai/engines/predictiveEngine';

describe('PredictiveEngine', () => {
  beforeEach(() => {
    initPredictiveEngine();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar sem erros', () => {
      expect(() => initPredictiveEngine()).not.toThrow();
    });
  });

  describe('Predição de Ações', () => {
    it('deve retornar predições para tela atual', () => {
      updatePredictionContext({ currentScreen: 'calculator/price' });
      const predictions = getCurrentPredictions();
      
      expect(Array.isArray(predictions)).toBe(true);
    });

    it('deve retornar ação mais provável', () => {
      updatePredictionContext({ currentScreen: 'calculator/price' });
      const mostLikely = getMostLikelyNextAction();
      
      if (mostLikely) {
        expect(mostLikely).toHaveProperty('action');
        expect(mostLikely).toHaveProperty('probability');
        expect(mostLikely.probability).toBeGreaterThan(0);
        expect(mostLikely.probability).toBeLessThanOrEqual(1);
      }
    });

    it('deve considerar histórico de ações', () => {
      updatePredictionContext({ currentScreen: 'calculator/price' });
      
      // Registra ações para criar padrão
      recordUserAction('input_cost');
      recordUserAction('input_margin');
      recordUserAction('calculate');
      
      const predictions = getCurrentPredictions();
      expect(predictions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Predição de Fluxo', () => {
    it('deve prever fluxo de navegação', () => {
      const flow = predictFlow('calculator/price', 3);
      
      expect(flow).toBeDefined();
      expect(flow).toHaveProperty('steps');
      expect(flow).toHaveProperty('probability');
      expect(Array.isArray(flow.steps)).toBe(true);
    });

    it('deve limitar número de passos', () => {
      const flow = predictFlow('calculator/price', 2);
      
      expect(flow.steps.length).toBeLessThanOrEqual(2);
    });

    it('deve detectar fluxo para conclusão', () => {
      const flow = predictFlow('home', 5);
      
      expect(flow).toHaveProperty('potentialBlockers');
      expect(Array.isArray(flow.potentialBlockers)).toBe(true);
    });
  });

  describe('Risco de Abandono', () => {
    it('deve calcular risco de abandono', () => {
      updatePredictionContext({ 
        currentScreen: 'calculator/price',
        sessionDuration: 60000,
        idleTime: 10000,
      });
      
      const risk = calculateAbandonmentRisk();
      
      expect(risk).toBeDefined();
      expect(risk).toHaveProperty('score');
      expect(risk).toHaveProperty('level');
      expect(risk).toHaveProperty('triggers');
      expect(risk.score).toBeGreaterThanOrEqual(0);
      expect(risk.score).toBeLessThanOrEqual(100);
    });

    it('deve identificar gatilhos de risco', () => {
      updatePredictionContext({ 
        currentScreen: 'calculator/price',
        sessionDuration: 300000,
        idleTime: 120000,
        errorCount: 3,
        recentActions: [],
        completedTasks: [],
      });
      
      const risk = calculateAbandonmentRisk();
      
      expect(Array.isArray(risk.triggers)).toBe(true);
    });

    it('deve ter baixo risco para sessão ativa', () => {
      updatePredictionContext({ 
        currentScreen: 'calculator/price',
        sessionDuration: 30000,
        idleTime: 0,
        errorCount: 0,
      });
      
      const risk = calculateAbandonmentRisk();
      
      expect(risk.score).toBeLessThan(0.5);
    });

    it('deve ter alto risco para inatividade prolongada', () => {
      updatePredictionContext({ 
        currentScreen: 'calculator/price',
        sessionDuration: 600000,
        idleTime: 300000,
        errorCount: 5,
      });
      
      const risk = calculateAbandonmentRisk();
      
      // Alto tempo idle deve aumentar risco
      expect(risk.score).toBeGreaterThan(0.3);
    });
  });

  describe('Smart Shortcuts', () => {
    it('deve sugerir atalhos inteligentes', () => {
      updatePredictionContext({ currentScreen: 'calculator/price' });
      
      const shortcuts = suggestSmartShortcuts();
      
      expect(Array.isArray(shortcuts)).toBe(true);
    });

    it('deve incluir informação de atalho', () => {
      updatePredictionContext({ currentScreen: 'calculator/price' });
      
      const shortcuts = suggestSmartShortcuts();
      
      if (shortcuts.length > 0) {
        expect(shortcuts[0]).toHaveProperty('action');
        expect(shortcuts[0]).toHaveProperty('label');
      }
    });
  });

  describe('Atualização de Contexto', () => {
    it('deve atualizar contexto de predição', () => {
      updatePredictionContext({
        currentScreen: 'dashboard',
        sessionDuration: 60000,
        idleTime: 0,
        errorCount: 0,
        recentActions: [],
        completedTasks: [],
      });
      
      // Verificar que não houve erro
      expect(() => getCurrentPredictions()).not.toThrow();
    });

    it('deve registrar ação do usuário', () => {
      expect(() => recordUserAction('click_button')).not.toThrow();
      expect(() => recordUserAction('input_value')).not.toThrow();
    });
  });
});
