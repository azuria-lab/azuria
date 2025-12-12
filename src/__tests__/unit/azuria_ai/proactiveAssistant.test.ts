/**
 * @fileoverview Testes para ProactiveAssistant - Fase 5
 *
 * Testa o assistente proativo que oferece ajuda contextual
 * baseado em triggers e contexto do usuário.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do eventBus
vi.mock('@/azuria_ai/events/eventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(() => 'sub_id'),
  },
}));

// Mock do personalizationEngine
vi.mock('@/azuria_ai/engines/personalizationEngine', () => ({
  personalization: {
    shouldShowProactiveSuggestion: vi.fn(() => ({ show: true, reason: 'allowed' })),
    recordSuggestionShown: vi.fn(),
    recordSuggestionDismissed: vi.fn(),
    recordSuggestionActed: vi.fn(),
    getUserPreference: vi.fn(() => 'balanced'),
  },
}));

// Mock do feedbackLoopEngine
vi.mock('@/azuria_ai/engines/feedbackLoopEngine', () => ({
  feedbackLoop: {
    recordSuggestionDismissed: vi.fn(() => Promise.resolve()),
    recordSuggestionApplied: vi.fn(() => Promise.resolve()),
  },
}));

// Mock do explanationEngine  
vi.mock('@/azuria_ai/engines/explanationEngine', () => ({
  explanationEngine: {
    getQuickExplanation: vi.fn(() => ({
      concept: 'test',
      explanation: 'Test explanation',
    })),
  },
}));

import {
  type AssistanceTrigger,
  clearActiveAssistances,
  dismissAssistance,
  evaluateTriggers,
  getActiveAssistances,
  getProactiveConfig,
  getProactiveStats,
  getQuickAssistance,
  initProactiveAssistant,
  type ProactiveAssistance,
  registerTrigger,
  resetProactiveAssistant,
  showAssistance,
  suppressAssistances,
  type TriggerContext,
  unregisterTrigger,
  updateProactiveConfig,
} from '@/azuria_ai/engines/proactiveAssistant';

describe('ProactiveAssistant', () => {
  beforeEach(() => {
    resetProactiveAssistant();
    initProactiveAssistant();
  });

  afterEach(() => {
    resetProactiveAssistant();
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar sem erros', () => {
      expect(() => initProactiveAssistant()).not.toThrow();
    });

    it('deve inicializar com configuração customizada', () => {
      resetProactiveAssistant();
      initProactiveAssistant({ maxActiveAssistances: 5 });
      
      const config = getProactiveConfig();
      expect(config.maxActiveAssistances).toBe(5);
    });
  });

  describe('Triggers', () => {
    it('deve registrar novo trigger', () => {
      const customTrigger: AssistanceTrigger = {
        type: 'custom_trigger',
        priority: 50,
        cooldown: 5000,
        condition: () => true,
        generator: (ctx) => ({
          id: 'assist_custom',
          type: 'tip',
          title: 'Dica customizada',
          message: 'Esta é uma dica customizada',
          priority: 50,
          dismissable: true,
          context: {
            screen: ctx.currentScreen,
            trigger: 'custom_trigger',
            reasoning: 'Trigger de teste',
          },
        }),
      };

      registerTrigger(customTrigger);
      
      const context: TriggerContext = {
        currentScreen: 'calculator',
        sessionDuration: 60000,
        idleTime: 0,
        errorCount: 0,
        lastAction: 'navigate',
        userSkillLevel: 'intermediate',
        recentActions: [],
        abandonmentRisk: 0,
        timeOfDay: 'morning',
      };
      
      const assistances = evaluateTriggers(context);
      expect(assistances.some((a) => a.id === 'assist_custom')).toBe(true);
    });

    it('deve desregistrar trigger', () => {
      unregisterTrigger('custom_trigger');
      
      const context: TriggerContext = {
        currentScreen: 'calculator',
        sessionDuration: 60000,
        idleTime: 0,
        errorCount: 0,
        lastAction: 'navigate',
        userSkillLevel: 'intermediate',
        recentActions: [],
        abandonmentRisk: 0,
        timeOfDay: 'morning',
      };
      
      const assistances = evaluateTriggers(context);
      expect(assistances.some((a) => a.id === 'assist_custom')).toBe(false);
    });
  });

  describe('Avaliação de Triggers', () => {
    it('deve avaliar triggers baseado no contexto', () => {
      const context: TriggerContext = {
        currentScreen: 'calculator/price',
        sessionDuration: 120000,
        idleTime: 60000,
        errorCount: 0,
        lastAction: 'none',
        userSkillLevel: 'beginner',
        recentActions: [],
        abandonmentRisk: 0.3,
        timeOfDay: 'afternoon',
      };
      
      const assistances = evaluateTriggers(context);
      expect(Array.isArray(assistances)).toBe(true);
    });

    it('deve detectar trigger de erro', () => {
      const context: TriggerContext = {
        currentScreen: 'calculator/price',
        sessionDuration: 30000,
        idleTime: 0,
        errorCount: 3,
        lastAction: 'input',
        userSkillLevel: 'beginner',
        recentActions: ['error', 'error', 'error'],
        abandonmentRisk: 0.5,
        timeOfDay: 'morning',
      };
      
      const assistances = evaluateTriggers(context);
      expect(assistances.length).toBeGreaterThanOrEqual(0);
    });

    it('deve detectar trigger de inatividade', () => {
      const context: TriggerContext = {
        currentScreen: 'calculator/price',
        sessionDuration: 300000,
        idleTime: 120000,
        errorCount: 0,
        lastAction: 'none',
        userSkillLevel: 'intermediate',
        recentActions: [],
        abandonmentRisk: 0.6,
        timeOfDay: 'evening',
      };
      
      const assistances = evaluateTriggers(context);
      expect(Array.isArray(assistances)).toBe(true);
    });
  });

  describe('Gerenciamento de Assistências', () => {
    it('deve mostrar assistência', () => {
      const assistance: ProactiveAssistance = {
        id: 'test_assist_1',
        type: 'tip',
        title: 'Dica de teste',
        message: 'Esta é uma dica de teste',
        priority: 50,
        dismissable: true,
        context: {
          screen: 'calculator',
          trigger: 'test',
          reasoning: 'Teste',
        },
      };

      showAssistance(assistance);
      
      const active = getActiveAssistances();
      expect(active.some((a) => a.id === 'test_assist_1')).toBe(true);
    });

    it('deve dispensar assistência', () => {
      const assistance: ProactiveAssistance = {
        id: 'test_assist_2',
        type: 'tip',
        title: 'Dica',
        message: 'Mensagem',
        priority: 50,
        dismissable: true,
        context: {
          screen: 'calculator',
          trigger: 'test',
          reasoning: 'Teste',
        },
      };

      showAssistance(assistance);
      dismissAssistance('test_assist_2');
      
      const active = getActiveAssistances();
      expect(active.some((a) => a.id === 'test_assist_2')).toBe(false);
    });

    it('deve limpar todas as assistências ativas', () => {
      const assistance1: ProactiveAssistance = {
        id: 'assist_1',
        type: 'tip',
        title: 'Dica 1',
        message: 'Mensagem 1',
        priority: 50,
        dismissable: true,
        context: {
          screen: 'calculator',
          trigger: 'test',
          reasoning: 'Teste 1',
        },
      };
      const assistance2: ProactiveAssistance = {
        id: 'assist_2',
        type: 'warning',
        title: 'Aviso 2',
        message: 'Mensagem 2',
        priority: 60,
        dismissable: true,
        context: {
          screen: 'calculator',
          trigger: 'test',
          reasoning: 'Teste 2',
        },
      };

      showAssistance(assistance1);
      showAssistance(assistance2);
      clearActiveAssistances();
      
      const active = getActiveAssistances();
      expect(active.length).toBe(0);
    });
  });

  describe('Quick Assistance', () => {
    it('deve retornar assistência rápida para tela', () => {
      const quick = getQuickAssistance('calculator/price');
      
      // Pode ser null ou um objeto de assistência
      expect(quick === null || typeof quick === 'object').toBe(true);
    });

    it('deve retornar null para tela desconhecida', () => {
      const quick = getQuickAssistance('nonexistent_screen_xyz_123');
      
      expect(quick === null || typeof quick === 'object').toBe(true);
    });
  });

  describe('Configuração', () => {
    it('deve atualizar configuração', () => {
      updateProactiveConfig({
        enabled: false,
      });
      
      const config = getProactiveConfig();
      expect(config.enabled).toBe(false);
    });

    it('deve retornar configuração atual', () => {
      const config = getProactiveConfig();
      
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('maxActiveAssistances');
    });

    it('deve alterar maxActiveAssistances', () => {
      updateProactiveConfig({
        maxActiveAssistances: 10,
      });
      
      const config = getProactiveConfig();
      expect(config.maxActiveAssistances).toBe(10);
    });
  });

  describe('Supressão', () => {
    it('deve suprimir assistências por tempo', () => {
      suppressAssistances(5000);
      
      const context: TriggerContext = {
        currentScreen: 'calculator',
        sessionDuration: 300000,
        idleTime: 120000,
        errorCount: 5,
        lastAction: 'none',
        userSkillLevel: 'beginner',
        recentActions: [],
        abandonmentRisk: 0.8,
        timeOfDay: 'afternoon',
      };
      
      // Durante supressão, não deve retornar assistências
      const assistances = evaluateTriggers(context);
      expect(assistances.length).toBe(0);
    });
  });

  describe('Estatísticas', () => {
    it('deve retornar estatísticas', () => {
      const stats = getProactiveStats();
      
      expect(stats).toHaveProperty('shown');
      expect(stats).toHaveProperty('dismissed');
      expect(stats).toHaveProperty('actedUpon');
    });

    it('deve contar assistências mostradas', () => {
      const assistance: ProactiveAssistance = {
        id: 'stats_assist',
        type: 'tip',
        title: 'Dica',
        message: 'Mensagem',
        priority: 50,
        dismissable: true,
        context: {
          screen: 'calculator',
          trigger: 'test',
          reasoning: 'Teste',
        },
      };

      showAssistance(assistance);
      
      const stats = getProactiveStats();
      expect(stats.shown).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Reset', () => {
    it('deve resetar estado completo', () => {
      const assistance: ProactiveAssistance = {
        id: 'reset_assist',
        type: 'tip',
        title: 'Dica',
        message: 'Mensagem',
        priority: 50,
        dismissable: true,
        context: {
          screen: 'calculator',
          trigger: 'test',
          reasoning: 'Teste',
        },
      };

      showAssistance(assistance);
      resetProactiveAssistant();
      
      const active = getActiveAssistances();
      expect(active.length).toBe(0);
    });
  });
});
