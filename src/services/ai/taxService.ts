import { TaxAnalysis, TaxRegime, TaxRegimeType } from '@/shared/types/ai';
import { logger, LogMetadata } from './logger';

interface TaxInput {
  currentRegime: string;
  monthlyRevenue: number;
  businessType: string;
  employeeCount?: number;
  hasManufacturing?: boolean;
}

class TaxService {
  private readonly TAX_REGIMES: Record<TaxRegimeType, TaxRegime> = {
    [TaxRegimeType.SIMPLES_NACIONAL]: {
      id: 'simples_nacional',
      name: 'Simples Nacional',
      description: 'Regime simplificado para micro e pequenas empresas',
      type: TaxRegimeType.SIMPLES_NACIONAL,
      applicableToProduct: true,
      applicableToService: true,
      rates: {
        irpj: 0.0,
        csll: 0.0,
        pis: 0.0,
        cofins: 0.0,
        icms: 1.25
      }
    },
    [TaxRegimeType.LUCRO_PRESUMIDO]: {
      id: 'lucro_presumido',
      name: 'Lucro Presumido',
      description: 'Regime intermediário com tributação sobre lucro presumido',
      type: TaxRegimeType.LUCRO_PRESUMIDO,
      applicableToProduct: true,
      applicableToService: true,
      rates: {
        irpj: 1.20,
        csll: 1.08,
        pis: 1.65,
        cofins: 7.60,
        icms: 0.0
      }
    },
    [TaxRegimeType.LUCRO_REAL]: {
      id: 'lucro_real',
      name: 'Lucro Real',
      description: 'Regime com tributação sobre lucro efetivo',
      type: TaxRegimeType.LUCRO_REAL,
      applicableToProduct: true,
      applicableToService: true,
      rates: {
        irpj: 2.5,
        csll: 2.0,
        pis: 1.65,
        cofins: 7.6,
        icms: 0.0
      }
    },
    [TaxRegimeType.MEI]: {
      id: 'mei',
      name: 'MEI - Microempreendedor Individual',
      description: 'Regime simplificado para microempreendedores',
      type: TaxRegimeType.MEI,
      applicableToProduct: true,
      applicableToService: true,
      rates: {
        irpj: 0.0,
        csll: 0.0,
        pis: 0.0,
        cofins: 0.0
      }
    }
  };

  /**
   * Calcula taxa efetiva de um regime
   */
  private getEffectiveRate(regime: TaxRegime): number {
    // Soma simplificada das alíquotas (aproximação)
    return regime.rates.irpj + regime.rates.csll + regime.rates.pis + regime.rates.cofins;
  }

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

      const effectiveRate = this.getEffectiveRate(currentRegime);
      const monthlyTax = (input.monthlyRevenue * effectiveRate) / 100;
      const annualTax = monthlyTax * 12;

      const analysis: TaxAnalysis = {
        regime: currentRegime.type,
        effectiveRate,
        monthlyTax,
        annualTax,
        breakdown: {
          IRPJ: currentRegime.rates.irpj,
          CSLL: currentRegime.rates.csll,
          PIS: currentRegime.rates.pis,
          COFINS: currentRegime.rates.cofins
        },
        recommendations,
        potentialSavings
      };

      const duration = Date.now() - startTime;
      logger.trackAIUsage('tax_analysis', duration, true, {
        currentRegime: input.currentRegime,
        monthlyRevenue: input.monthlyRevenue,
        potentialSavings
      });

      return analysis;

    } catch (error) {
      logger.trackAIError('tax_analysis', error, input as unknown as LogMetadata);
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
      return this.TAX_REGIMES[TaxRegimeType.SIMPLES_NACIONAL];
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
    const currentEffectiveRate = this.getEffectiveRate(currentRegime);
    const currentTax = input.monthlyRevenue * (currentEffectiveRate / 100);

    const bestAlternative = alternatives.reduce((best, alternative) => {
      const alternativeRate = this.getEffectiveRate(alternative);
      const bestRate = this.getEffectiveRate(best);
      const alternativeTax = input.monthlyRevenue * (alternativeRate / 100);
      const bestTax = input.monthlyRevenue * (bestRate / 100);
      return alternativeTax < bestTax ? alternative : best;
    }, alternatives[0]);

    const bestRate = this.getEffectiveRate(bestAlternative);
    const bestTax = input.monthlyRevenue * (bestRate / 100);
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
    const rates: Record<TaxRegimeType, {
      produto: { total: number; breakdown: Record<string, number> };
      servico: { total: number; breakdown: Record<string, number> };
    }> = {
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
      },
      [TaxRegimeType.MEI]: {
        produto: {
          total: 0.0,
          breakdown: {
            'DAS': 0.0 // Valor fixo mensal
          }
        },
        servico: {
          total: 0.0,
          breakdown: {
            'DAS': 0.0 // Valor fixo mensal
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
    _businessType: string
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

    const currentEffectiveRate = this.getEffectiveRate(current);
    const targetEffectiveRate = this.getEffectiveRate(target);
    const currentTax = monthlyRevenue * (currentEffectiveRate / 100);
    const newTax = monthlyRevenue * (targetEffectiveRate / 100);
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