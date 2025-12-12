/**
 * @fileoverview Testes para FeedbackLoopEngine - Fase 4
 *
 * Testa o sistema de feedback loop que coleta e processa
 * feedback dos usuários sobre sugestões do Co-Piloto.
 * 
 * Nota: Estes testes usam mocks para evitar dependência do Supabase.
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
  clearFeedbackState,
  getFeedbackMetrics,
  getMetricsForType,
  getRecentPositiveRate,
  recordQuickFeedback,
  recordSuggestionDismissed,
  shouldAvoidSuggestionType,
} from '@/azuria_ai/engines/feedbackLoopEngine';

describe('FeedbackLoopEngine', () => {
  beforeEach(() => {
    // Limpa estado sem inicializar (evita chamada ao Supabase)
    clearFeedbackState();
  });

  afterEach(() => {
    clearFeedbackState();
    vi.clearAllMocks();
  });

  describe('Estado Inicial', () => {
    it('deve ter métricas zeradas inicialmente', () => {
      const metrics = getFeedbackMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalFeedback).toBe(0);
      expect(metrics.positiveRate).toBe(0);
    });

    it('deve retornar taxa padrão neutra (0.5) sem dados', () => {
      const rate = getRecentPositiveRate();
      expect(rate).toBe(0.5); // Default neutral when no data
    });
  });

  describe('Quick Feedback', () => {
    it('deve registrar quick feedback positivo', () => {
      recordQuickFeedback('sug_001', 'hint', true);
      
      const metrics = getFeedbackMetrics();
      expect(metrics.totalFeedback).toBe(1);
    });

    it('deve registrar quick feedback negativo', () => {
      recordQuickFeedback('sug_002', 'warning', false);
      
      const metrics = getFeedbackMetrics();
      expect(metrics.totalFeedback).toBe(1);
    });

    it('deve registrar múltiplos feedbacks', () => {
      recordQuickFeedback('sug_001', 'hint', true);
      recordQuickFeedback('sug_002', 'warning', false);
      recordQuickFeedback('sug_003', 'explanation', true);

      const metrics = getFeedbackMetrics();
      expect(metrics.totalFeedback).toBe(3);
    });
  });

  describe('Métricas por Tipo', () => {
    it('deve retornar métricas para tipo específico', () => {
      recordQuickFeedback('sug_001', 'hint', true);
      recordQuickFeedback('sug_002', 'hint', true);
      recordQuickFeedback('sug_003', 'warning', false);

      const hintMetrics = getMetricsForType('hint');
      expect(hintMetrics).toBeDefined();
      if (hintMetrics) {
        expect(hintMetrics.total).toBe(2);
        expect(hintMetrics.positive).toBe(2);
      }
    });

    it('deve retornar null para tipo sem dados', () => {
      const metrics = getMetricsForType('optimization');
      expect(metrics).toBeNull();
    });
  });

  describe('Taxa de Feedback Positivo Recente', () => {
    it('deve calcular taxa de positivos recentes', () => {
      recordQuickFeedback('sug_001', 'hint', true);
      recordQuickFeedback('sug_002', 'warning', true);
      recordQuickFeedback('sug_003', 'explanation', false);
      recordQuickFeedback('sug_004', 'hint', true);

      const rate = getRecentPositiveRate();
      // 3 positivos de 4 = 0.75
      expect(rate).toBeCloseTo(0.75, 2);
    });
  });

  describe('Evitar Tipos de Sugestão', () => {
    it('deve indicar se deve evitar tipo com muitos dismissals', async () => {
      // Registra 5 feedbacks dismissed para o tipo 'correction'
      // shouldAvoid requer total >= 5, dismissRate > 0.7, positiveRate < 0.1
      for (let i = 0; i < 5; i++) {
        await recordSuggestionDismissed(`sug_${i}`, 'correction');
      }

      const shouldAvoid = shouldAvoidSuggestionType('correction');
      expect(shouldAvoid).toBe(true);
    });

    it('deve não evitar tipo com feedback positivo', () => {
      recordQuickFeedback('sug_001', 'tutorial', true);
      recordQuickFeedback('sug_002', 'tutorial', true);
      recordQuickFeedback('sug_003', 'tutorial', true);

      const shouldAvoid = shouldAvoidSuggestionType('tutorial');
      expect(shouldAvoid).toBe(false);
    });

    it('deve não evitar tipo sem dados', () => {
      const shouldAvoid = shouldAvoidSuggestionType('proactive');
      expect(shouldAvoid).toBe(false);
    });
  });

  describe('Limpeza de Estado', () => {
    it('deve limpar estado corretamente', () => {
      recordQuickFeedback('sug_001', 'hint', true);
      recordQuickFeedback('sug_002', 'warning', false);

      clearFeedbackState();
      
      const metrics = getFeedbackMetrics();
      expect(metrics.totalFeedback).toBe(0);
    });
  });
});
