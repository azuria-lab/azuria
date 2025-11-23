import { describe, expect, it } from 'vitest';
import {
  analyzeViability,
  calculateItemTotalCost,
  calculateSuggestedPrice,
  calculateTaxes,
  formatCurrency,
} from '@/services/bidding/biddingCalculations';
import {
  BiddingItem,
  BiddingTaxConfig,
  BiddingTaxRegime,
  ViabilityLevel,
} from '@/types/bidding';

describe('biddingCalculations', () => {
  describe('calculateItemTotalCost', () => {
    it('deve calcular corretamente o custo total de um item', () => {
      const item: BiddingItem = {
        id: '1',
        itemNumber: '1',
        description: 'Produto Teste',
        unit: 'un',
        unitCost: 100,
        quantity: 10,
        manufacturingCost: 20,
        logisticsCost: 10,
        administrativeCost: 5,
      };

      const total = calculateItemTotalCost(item);
      // (100 + 20 + 10 + 5) * 10 = 1350
      expect(total).toBe(1350);
    });

    it('deve considerar custos opcionais como zero', () => {
      const item: BiddingItem = {
        id: '1',
        itemNumber: '1',
        description: 'Produto Simples',
        unit: 'un',
        unitCost: 50,
        quantity: 2,
      };

      const total = calculateItemTotalCost(item);
      // 50 * 2 = 100
      expect(total).toBe(100);
    });
  });

  describe('calculateTaxes', () => {
    it('deve calcular impostos para Simples Nacional', () => {
      const taxConfig: BiddingTaxConfig = {
        regime: BiddingTaxRegime.SIMPLES_NACIONAL,
        simplesRate: 8.0,
        pis: 0,
        cofins: 0,
        irpj: 0,
        csll: 0,
        iss: 0,
        icms: 0,
      };

      const { totalTaxes } = calculateTaxes(10000, taxConfig);
      // 10000 * 0.08 = 800
      expect(totalTaxes).toBe(800);
    });

    it('deve calcular impostos para Lucro Presumido', () => {
      const taxConfig: BiddingTaxConfig = {
        regime: BiddingTaxRegime.LUCRO_PRESUMIDO,
        simplesRate: 0,
        pis: 0.65,
        cofins: 3.0,
        irpj: 4.8,
        csll: 2.88,
        iss: 5.0,
        icms: 0,
      };

      const { totalTaxes } = calculateTaxes(10000, taxConfig);
      // Total: 16.33%
      const expected = 10000 * 0.1633;
      expect(totalTaxes).toBeCloseTo(expected, 2);
    });
  });

  describe('calculateSuggestedPrice', () => {
    it('deve calcular preço usando fórmula por divisor', () => {
      const totalCost = 1000;
      const targetMargin = 20; // 20%
      const taxRate = 8; // 8%

      const price = calculateSuggestedPrice(totalCost, targetMargin, taxRate);
      
      // Fórmula: Preço = Custo / (1 - MargeLiq% - Imposto%)
      // Preço = 1000 / (1 - 0.20 - 0.08)
      // Preço = 1000 / 0.72 = 1388.89
      expect(price).toBeCloseTo(1388.89, 2);
    });

    it('deve retornar 0 se margem + imposto >= 100%', () => {
      const totalCost = 1000;
      const targetMargin = 60;
      const taxRate = 50;

      const price = calculateSuggestedPrice(totalCost, targetMargin, taxRate);
      expect(price).toBe(0);
    });

    it('deve garantir margem líquida real', () => {
      const totalCost = 1000;
      const targetMargin = 15;
      const taxRate = 10;

      const price = calculateSuggestedPrice(totalCost, targetMargin, taxRate);
      
      // Validar que a margem líquida é realmente 15%
      const taxes = (price * taxRate) / 100;
      const netProfit = price - totalCost - taxes;
      const netMargin = (netProfit / price) * 100;

      expect(netMargin).toBeCloseTo(15, 1);
    });
  });

  describe('analyzeViability', () => {
    it('deve classificar como EXCELENTE para margem > 20%', () => {
      const price = 1500;
      const cost = 1000;
      const taxes = 100;

      const viability = analyzeViability(price, cost, taxes);
      
      // Margem líquida: (1500 - 1000 - 100) / 1500 = 26.67%
      expect(viability.level).toBe(ViabilityLevel.EXCELENTE);
      expect(viability.margin).toBeCloseTo(26.67, 1);
    });

    it('deve classificar como BOM para margem entre 10-20%', () => {
      const price = 1300;
      const cost = 1000;
      const taxes = 100;

      const viability = analyzeViability(price, cost, taxes);
      
      // Margem líquida: (1300 - 1000 - 100) / 1300 = 15.38%
      expect(viability.level).toBe(ViabilityLevel.BOM);
    });

    it('deve classificar como MODERADO para margem entre 5-10%', () => {
      const price = 1150;
      const cost = 1000;
      const taxes = 80;

      const viability = analyzeViability(price, cost, taxes);
      
      // Margem líquida: (1150 - 1000 - 80) / 1150 = 6.09%
      expect(viability.level).toBe(ViabilityLevel.MODERADO);
    });

    it('deve classificar como CRITICO para margem entre 2-5%', () => {
      const price = 1080;
      const cost = 1000;
      const taxes = 50;

      const viability = analyzeViability(price, cost, taxes);
      
      // Margem líquida: (1080 - 1000 - 50) / 1080 = 2.78%
      expect(viability.level).toBe(ViabilityLevel.CRITICO);
    });

    it('deve classificar como INVIAVEL para margem < 2%', () => {
      const price = 1050;
      const cost = 1000;
      const taxes = 40;

      const viability = analyzeViability(price, cost, taxes);
      
      // Margem líquida: (1050 - 1000 - 40) / 1050 = 0.95%
      expect(viability.level).toBe(ViabilityLevel.INVIAVEL);
    });

    it('deve classificar como INVIAVEL para margem negativa', () => {
      const price = 1000;
      const cost = 1000;
      const taxes = 100;

      const viability = analyzeViability(price, cost, taxes);
      
      // Margem líquida: (1000 - 1000 - 100) / 1000 = -10%
      expect(viability.level).toBe(ViabilityLevel.INVIAVEL);
      expect(viability.margin).toBeLessThan(0);
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar valores em reais', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('deve lidar com valores negativos', () => {
      expect(formatCurrency(-500)).toBe('-R$ 500,00');
    });

    it('deve arredondar para 2 casas decimais', () => {
      expect(formatCurrency(10.999)).toBe('R$ 11,00');
      expect(formatCurrency(10.001)).toBe('R$ 10,00');
    });
  });

  describe('Casos de uso reais', () => {
    it('deve calcular corretamente uma licitação típica', () => {
      // Cenário: Licitação de equipamentos de TI
      const item: BiddingItem = {
        id: '1',
        itemNumber: '1',
        description: 'Notebook Dell - i7, 16GB RAM, 512GB SSD',
        unit: 'un',
        unitCost: 3000,
        quantity: 50,
        logisticsCost: 100,
        administrativeCost: 200,
      };

      const totalCost = calculateItemTotalCost(item);
      // (3000 + 100 + 200) * 50 = 165000

      const taxConfig: BiddingTaxConfig = {
        regime: BiddingTaxRegime.SIMPLES_NACIONAL,
        simplesRate: 8.0,
        pis: 0,
        cofins: 0,
        irpj: 0,
        csll: 0,
        iss: 0,
        icms: 0,
      };

      const targetMargin = 15; // 15% margem líquida
      const suggestedPrice = calculateSuggestedPrice(totalCost, targetMargin, taxConfig.simplesRate || 0);
      
      // Validar resultado
      const { totalTaxes } = calculateTaxes(suggestedPrice, taxConfig);
      const viability = analyzeViability(suggestedPrice, totalCost, totalTaxes);

      expect(totalCost).toBe(165000);
      expect(viability.level).toBe(ViabilityLevel.BOM);
      expect(viability.margin).toBeCloseTo(15, 1);
    });
  });
});

