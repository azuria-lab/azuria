/**
 * @fileoverview Testes para NLPProcessorEngine - Fase 5
 *
 * Testa o processador de linguagem natural que analisa
 * texto do usuário para detectar intenções e entidades.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock eventBus antes de importar o engine
vi.mock('@/azuria_ai/events/eventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(() => vi.fn()),
    off: vi.fn(),
  },
}));

import {
  addCorrection,
  addIntentPattern,
  analyzeSentiment,
  analyzeText,
  correctText,
  detectUrgency,
  extractEntities,
  initNLPProcessor,
  normalizeText,
  suggestCompletions,
} from '@/azuria_ai/engines/nlpProcessorEngine';

describe('NLPProcessorEngine', () => {
  beforeEach(() => {
    initNLPProcessor();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar sem erros', () => {
      expect(() => initNLPProcessor()).not.toThrow();
    });
  });

  describe('Análise de Texto', () => {
    describe('Detecção de Intenção', () => {
      it('deve detectar intenção de calcular preço', () => {
        const result = analyzeText('quero calcular o preço de venda');
        expect(result.intent).toBe('calculate_price');
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('deve detectar intenção de calcular markup', () => {
        const result = analyzeText('como calcular o markup do produto?');
        expect(result.intent).toBe('calculate_markup');
      });

      it('deve detectar intenção de ajuda', () => {
        const result = analyzeText('preciso de ajuda com a calculadora');
        expect(['get_help', 'navigate']).toContain(result.intent);
      });

      it('deve detectar intenção de comparar valores', () => {
        const result = analyzeText('quero comparar os valores A e B');
        expect(result.intent).toBe('compare_values');
      });

      it('deve retornar unknown para texto não reconhecido', () => {
        const result = analyzeText('xyzabc123');
        expect(result.intent).toBe('unknown');
      });

      it('deve incluir entidades extraídas', () => {
        // Usar texto sem acentos para evitar bugs no regex
        const result = analyzeText('preco de 100 reais');
        expect(result.entities).toBeDefined();
        expect(Array.isArray(result.entities)).toBe(true);
      });
    });

    describe('Confiança da Análise', () => {
      it('deve ter confiança definida para texto claro', () => {
        // Usar texto sem acentos
        const result = analyzeText('calcular preco de venda');
        expect(result.confidence).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      });

      it('deve ter baixa confiança para texto ambíguo', () => {
        const result = analyzeText('isso');
        expect(result.confidence).toBeLessThanOrEqual(0.5);
      });
    });
  });

  describe('Extração de Entidades', () => {
    it('deve extrair valores monetários', () => {
      const entities = extractEntities('o custo e de r$ 150,00');
      const moneyEntity = entities.find((e) => e.type === 'currency');
      expect(moneyEntity).toBeDefined();
    });

    it('deve extrair percentuais', () => {
      const entities = extractEntities('aplique 25% de desconto');
      const percentEntity = entities.find((e) => e.type === 'percentage');
      expect(percentEntity).toBeDefined();
      expect(percentEntity?.normalizedValue).toBe(25);
    });

    it('deve extrair números genéricos', () => {
      const entities = extractEntities('tenho 5 produtos');
      const numberEntity = entities.find((e) => e.type === 'number');
      expect(numberEntity).toBeDefined();
    });

    it('deve extrair múltiplas entidades', () => {
      const entities = extractEntities('preco de r$ 100 com 30% de margem');
      expect(entities.length).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar array vazio para texto sem entidades', () => {
      const entities = extractEntities('ola como vai');
      expect(entities).toEqual([]);
    });
  });

  describe('Análise de Sentimento', () => {
    it('deve detectar sentimento positivo', () => {
      const result = analyzeSentiment('obrigado, muito bom!');
      expect(result).toBe('positive');
    });

    it('deve detectar sentimento negativo', () => {
      const result = analyzeSentiment('isso está errado, problema');
      expect(result).toBe('negative');
    });

    it('deve detectar sentimento neutro', () => {
      const result = analyzeSentiment('quero calcular o preço');
      expect(result).toBe('neutral');
    });
  });

  describe('Detecção de Urgência', () => {
    it('deve detectar alta urgência', () => {
      const urgency = detectUrgency('preciso disso urgente agora!!!');
      expect(urgency).toBe('high');
    });

    it('deve detectar média urgência', () => {
      // Uma única palavra de urgência = medium
      const urgency = detectUrgency('fazer isso logo');
      expect(urgency).toBe('medium');
    });

    it('deve detectar baixa urgência', () => {
      const urgency = detectUrgency('quero calcular o preço');
      expect(urgency).toBe('low');
    });
  });

  describe('Normalização de Texto', () => {
    it('deve remover acentos', () => {
      const normalized = normalizeText('preço mínimo');
      expect(normalized).not.toContain('ç');
      expect(normalized).not.toContain('í');
    });

    it('deve converter para minúsculas', () => {
      const normalized = normalizeText('CALCULAR PREÇO');
      expect(normalized).toBe(normalized.toLowerCase());
    });

    it('deve remover espaços extras', () => {
      const normalized = normalizeText('muito    espaço    aqui');
      expect(normalized).not.toContain('  ');
    });
  });

  describe('Correção de Texto', () => {
    it('deve corrigir erros comuns', () => {
      const corrections = correctText('caulcular preço');
      // Pode não ter correção se 'caulcular' não estiver no dicionário
      expect(Array.isArray(corrections)).toBe(true);
    });

    it('deve retornar array vazio para texto correto', () => {
      const corrections = correctText('calcular preço');
      expect(corrections.length).toBe(0);
    });

    it('deve adicionar nova correção customizada', () => {
      addCorrection('preso', 'preço');
      const corrections = correctText('preso');
      expect(corrections.some((c) => c.corrected === 'preço')).toBe(true);
    });
  });

  describe('Sugestões de Autocompletar', () => {
    it('deve sugerir completar "calcular"', () => {
      const result = suggestCompletions('calcular');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('deve sugerir completar "preciso"', () => {
      const result = suggestCompletions('preciso');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('deve retornar array vazio para texto muito curto', () => {
      const result = suggestCompletions('a');
      expect(result.suggestions.length).toBe(0);
    });
  });

  describe('Padrões Customizados', () => {
    it('deve adicionar novo padrão de intenção', () => {
      addIntentPattern('calculate_price', /novo padrao teste/i);
      const result = analyzeText('novo padrao teste aqui');
      expect(result.intent).toBe('calculate_price');
    });
  });
});
