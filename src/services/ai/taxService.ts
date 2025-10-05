import { TaxAnalysis, TaxRegime, TaxRegimeType } from '@/shared/types/ai';
import { logger } from './logger';

interface TaxInput {
  currentRegime: string;
  monthlyRevenue: number;
  businessType: string;
  employeeCount?: number;
  hasManufacturing?: boolean;
}

class TaxService {
  private readonly TAX_REGIMES = {
    [TaxRegimeType.SIMPLES_NACIONAL]: {
      type: TaxRegimeType.SIMPLES_NACIONAL,
      rate: 4.5,
      description: 'Simples Nacional',
      benefits: [
        'Alíquotas reduzidas',
        'Unificação de impostos em uma guia',
        'Menos burocracia',
        'Dispensa de alguns livros fiscais'
      ],
      requirements: [
        'Faturamento anual até R$ 4.8 milhões',
        'Não exercer atividades impeditivas',
        'Não ter débitos com a Receita Federal'
      ]
    },
    [TaxRegimeType.LUCRO_PRESUMIDO]: {
      type: TaxRegimeType.LUCRO_PRESUMIDO,
      rate: 11.33,
      description: 'Lucro Presumido',
      benefits: [
        'Apuração trimestral',
        'Simplicidade no cálculo',
        'Menor controle fiscal',
        'Dispensa da escrituração do Livro Razão'
      ],
      requirements: [
        'Faturamento anual até R$ 78 milhões',
        'Não exercer atividades impeditivas',
        'Manter documentação fiscal'
      ]
    },
    [TaxRegimeType.LUCRO_REAL]: {
      type: TaxRegimeType.LUCRO_REAL,
      rate: 15.0,
      description: 'Lucro Real',
      benefits: [
        'Tributação sobre lucro efetivo',
        'Compensação de prejuízos fiscais',
        'Aproveitamento de créditos fiscais',
        'Deduções de despesas operacionais'
      ],
      requirements: [
        'Obrigatório para empresas com faturamento > R$ 78 milhões',
        'Escrituração completa',
        'Controles fiscais rigorosos',
        'Apuração mensal ou anual'
      ]
    }
  };

  /**
   * Analisa otimização tributária
   */
  async analyzeTaxOptimization(input: TaxInput): Promise<TaxAnalysis> {
    try {
      const startTime = Date.now();
      
      const currentRegime = this.getRegimeDetails(input.currentRegime);
      const alternativeRegimes = this.getAlternativeRegimes(input);
      const recommendations = await this.generateRecommendations(input, alternativeRegimes);
      const potentialSavings = this.calculatePotentialSavings(input, alternativeRegimes);

      const effectiveRate = currentRegime.rate;
      const monthlyTax = (input.monthlyRevenue * effectiveRate) / 100;

      const analysis: TaxAnalysis = {
        currentRegime,
        alternativeRegimes,
        recommendations,
        potentialSavings,
        effectiveRate,
        monthlyTax
      };

      const duration = Date.now() - startTime;
      logger.trackAIUsage('tax_analysis', duration, true, {
        currentRegime: input.currentRegime,
        monthlyRevenue: input.monthlyRevenue,
        potentialSavings
      });

      return analysis;

    } catch (error) {
      logger.trackAIError('tax_analysis', error, input);
      throw new Error('Erro ao analisar situação tributária');
    }
  }

  /**
   * Obtém detalhes do regime tributário
   */
  private getRegimeDetails(regime: string): TaxRegime {
    const regimeKey = regime as TaxRegimeType;
    const details = this.TAX_REGIMES[regimeKey];
    
    if (!details) {
      return {
        type: TaxRegimeType.SIMPLES_NACIONAL,
        rate: 4.5,
        description: 'Simples Nacional (padrão)',
        benefits: this.TAX_REGIMES[TaxRegimeType.SIMPLES_NACIONAL].benefits,
        requirements: this.TAX_REGIMES[TaxRegimeType.SIMPLES_NACIONAL].requirements
      };
    }

    return details;
  }

  /**
   * Obtém regimes alternativos viáveis
   */
  private getAlternativeRegimes(input: TaxInput): TaxRegime[] {
    const alternatives: TaxRegime[] = [];
    const annualRevenue = input.monthlyRevenue * 12;

    // Simples Nacional (até R$ 4,8 milhões)
    if (input.currentRegime !== TaxRegimeType.SIMPLES_NACIONAL && 
        annualRevenue <= 4800000) {
      alternatives.push(this.TAX_REGIMES[TaxRegimeType.SIMPLES_NACIONAL]);
    }

    // Lucro Presumido (até R$ 78 milhões)
    if (input.currentRegime !== TaxRegimeType.LUCRO_PRESUMIDO && 
        annualRevenue <= 78000000) {
      alternatives.push(this.TAX_REGIMES[TaxRegimeType.LUCRO_PRESUMIDO]);
    }

    // Lucro Real (sempre disponível)
    if (input.currentRegime !== TaxRegimeType.LUCRO_REAL) {
      alternatives.push(this.TAX_REGIMES[TaxRegimeType.LUCRO_REAL]);
    }

    return alternatives;
  }

  /**
   * Gera recomendações personalizadas
   */
  private async generateRecommendations(
    input: TaxInput, 
    alternatives: TaxRegime[]
  ): Promise<string[]> {
    const recommendations: string[] = [];
    const annualRevenue = input.monthlyRevenue * 12;

    // Recomendações baseadas no faturamento
    if (annualRevenue <= 4800000 && input.currentRegime !== TaxRegimeType.SIMPLES_NACIONAL) {
      recommendations.push(
        `💡 Com faturamento de R$ ${(annualRevenue / 1000000).toFixed(1)}M, você pode optar pelo Simples Nacional e economizar em impostos.`
      );
    }

    if (annualRevenue > 4800000 && input.currentRegime === TaxRegimeType.SIMPLES_NACIONAL) {
      recommendations.push(
        `⚠️ Seu faturamento ultrapassou R$ 4,8M. É obrigatório sair do Simples Nacional.`
      );
    }

    // Recomendações baseadas no tipo de negócio
    if (input.businessType === 'servicos' && input.currentRegime === TaxRegimeType.LUCRO_PRESUMIDO) {
      recommendations.push(
        `🔍 Para empresas de serviços, verifique se o Simples Nacional não oferece melhor alíquota.`
      );
    }

    if (input.hasManufacturing && input.currentRegime !== TaxRegimeType.LUCRO_REAL) {
      recommendations.push(
        `🏭 Empresas industriais podem se beneficiar do Lucro Real para aproveitar créditos fiscais.`
      );
    }

    // Recomendações de planejamento
    recommendations.push(
      `📊 Faça simulações trimestrais para garantir que está no regime mais vantajoso.`
    );

    if (alternatives.length > 0) {
      recommendations.push(
        `💰 Considere trocar de regime no próximo ano se houver economia significativa.`
      );
    }

    return recommendations;
  }

  /**
   * Calcula economia potencial
   */
  private calculatePotentialSavings(
    input: TaxInput, 
    alternatives: TaxRegime[]
  ): number {
    if (alternatives.length === 0) {return 0;}

    const currentRegime = this.getRegimeDetails(input.currentRegime);
    const currentTax = input.monthlyRevenue * (currentRegime.rate / 100);

    const bestAlternative = alternatives.reduce((best, alternative) => {
      const alternativeTax = input.monthlyRevenue * (alternative.rate / 100);
      const bestTax = input.monthlyRevenue * (best.rate / 100);
      return alternativeTax < bestTax ? alternative : best;
    });

    const bestTax = input.monthlyRevenue * (bestAlternative.rate / 100);
    const monthlySavings = Math.max(0, currentTax - bestTax);

    return Math.round(monthlySavings * 100) / 100;
  }

  /**
   * Calcula impostos para um produto específico
   */
  calculateProductTax(
    price: number, 
    regime: string, 
    productType: 'produto' | 'servico' = 'produto'
  ): {
    tax: number;
    rate: number;
    breakdown: { [key: string]: number };
  } {
    const rates = this.getProductTaxRates(regime, productType);
    const tax = price * (rates.total / 100);

    return {
      tax: Math.round(tax * 100) / 100,
      rate: rates.total,
      breakdown: rates.breakdown
    };
  }

  /**
   * Obtém alíquotas por tipo de produto
   */
  private getProductTaxRates(regime: string, productType: 'produto' | 'servico') {
    const rates = {
      [TaxRegimeType.SIMPLES_NACIONAL]: {
        produto: {
          total: 4.0,
          breakdown: {
            'IRPJ': 0.0,
            'CSLL': 0.0,
            'PIS/COFINS': 0.0,
            'ICMS': 1.25,
            'Simples Nacional': 2.75
          }
        },
        servico: {
          total: 6.0,
          breakdown: {
            'IRPJ': 0.0,
            'CSLL': 0.0,
            'PIS/COFINS': 0.0,
            'ISS': 2.0,
            'Simples Nacional': 4.0
          }
        }
      },
      [TaxRegimeType.LUCRO_PRESUMIDO]: {
        produto: {
          total: 11.33,
          breakdown: {
            'IRPJ': 1.20,
            'CSLL': 1.08,
            'PIS': 1.65,
            'COFINS': 7.60,
            'ICMS': 0.0 // Varia por estado
          }
        },
        servico: {
          total: 16.33,
          breakdown: {
            'IRPJ': 2.40,
            'CSLL': 2.88,
            'PIS': 1.65,
            'COFINS': 7.60,
            'ISS': 2.0 // Varia por município
          }
        }
      },
      [TaxRegimeType.LUCRO_REAL]: {
        produto: {
          total: 13.0,
          breakdown: {
            'IRPJ': 2.5,
            'CSLL': 2.0,
            'PIS': 1.65,
            'COFINS': 7.6,
            'ICMS': 0.0 // Varia por estado
          }
        },
        servico: {
          total: 18.0,
          breakdown: {
            'IRPJ': 2.5,
            'CSLL': 2.0,
            'PIS': 1.65,
            'COFINS': 7.6,
            'ISS': 5.0 // Varia por município
          }
        }
      }
    };

    const regimeRates = rates[regime as TaxRegimeType] || rates[TaxRegimeType.SIMPLES_NACIONAL];
    return regimeRates[productType];
  }

  /**
   * Simula mudança de regime tributário
   */
  async simulateRegimeChange(
    currentRegime: string,
    targetRegime: string,
    monthlyRevenue: number,
    businessType: string
  ): Promise<{
    currentTax: number;
    newTax: number;
    monthlySavings: number;
    annualSavings: number;
    recommendation: string;
    considerations: string[];
  }> {
    const current = this.getRegimeDetails(currentRegime);
    const target = this.getRegimeDetails(targetRegime);

    const currentTax = monthlyRevenue * (current.rate / 100);
    const newTax = monthlyRevenue * (target.rate / 100);
    const monthlySavings = currentTax - newTax;
    const annualSavings = monthlySavings * 12;

    let recommendation: string;
    if (monthlySavings > 0) {
      recommendation = `✅ Mudança vantajosa! Economia de R$ ${monthlySavings.toFixed(2)}/mês`;
    } else if (monthlySavings < 0) {
      recommendation = `❌ Mudança não vantajosa. Aumento de R$ ${Math.abs(monthlySavings).toFixed(2)}/mês`;
    } else {
      recommendation = `➖ Impacto neutro nos impostos.`;
    }

    const considerations = [
      'Mudança só pode ser feita no início do ano calendário',
      'Analise outros fatores além dos impostos (burocracia, controles)',
      'Consulte um contador para validar a simulação',
      'Considere projeções de crescimento do negócio'
    ];

    return {
      currentTax: Math.round(currentTax * 100) / 100,
      newTax: Math.round(newTax * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(annualSavings * 100) / 100,
      recommendation,
      considerations
    };
  }
}

export const taxService = new TaxService();