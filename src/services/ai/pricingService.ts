import { CompetitorPricing, PricingAnalysis } from '@/shared/types/ai';
import { logger } from './logger';

interface PricingInput {
  costPrice: number;
  desiredMargin: number;
  taxRegime: string;
  businessType: string;
  fees?: number;
  additionalCosts?: number;
}

class PricingService {
  /**
   * Analisa precificação baseada nos parâmetros fornecidos
   */
  async analyzePricing(input: PricingInput): Promise<PricingAnalysis> {
    try {
      const startTime = Date.now();
      
      const {
        costPrice,
        desiredMargin,
        taxRegime,
        businessType,
        fees = 0,
        additionalCosts = 0
      } = input;

      // Calcula impostos baseado no regime tributário
      const taxRate = this.getTaxRate(taxRegime, businessType);
      const taxes = this.calculateTaxes(costPrice, taxRate, desiredMargin);

      // Calcula preço sugerido
      const totalCosts = costPrice + taxes + fees + additionalCosts;
      const marginMultiplier = 1 + (desiredMargin / 100);
      const suggestedPrice = totalCosts * marginMultiplier;

      // Gera explicação didática
      const explanation = this.generatePricingExplanation(
        costPrice,
        taxes,
        fees + additionalCosts,
        desiredMargin,
        suggestedPrice,
        taxRegime
      );

      const analysis: PricingAnalysis = {
        costPrice,
        desiredMargin,
        taxes,
        fees: fees + additionalCosts,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        explanation
      };

      const duration = Date.now() - startTime;
      logger.trackAIUsage('pricing_analysis', duration, true, {
        costPrice,
        suggestedPrice: analysis.suggestedPrice,
        margin: desiredMargin,
        taxRegime
      });

      return analysis;

    } catch (error) {
      logger.trackAIError('pricing_analysis', error, input);
      throw new Error('Erro ao analisar precificação');
    }
  }

  /**
   * Calcula impostos baseado no regime tributário
   */
  private calculateTaxes(costPrice: number, taxRate: number, margin: number): number {
    // Cálculo simplificado baseado no preço de venda estimado
    const estimatedPrice = costPrice * (1 + margin / 100);
    return estimatedPrice * (taxRate / 100);
  }

  /**
   * Obtém alíquota de imposto baseada no regime
   */
  private getTaxRate(regime: string, businessType: string): number {
    const rates = {
      simples_nacional: {
        comercio: 4.0,
        industria: 4.5,
        servicos: 6.0,
        default: 4.5
      },
      lucro_presumido: {
        comercio: 11.33,
        industria: 11.33,
        servicos: 16.33,
        default: 11.33
      },
      lucro_real: {
        comercio: 13.0,
        industria: 13.0,
        servicos: 18.0,
        default: 13.0
      }
    };

    const regimeRates = rates[regime as keyof typeof rates] || rates.simples_nacional;
    return regimeRates[businessType as keyof typeof regimeRates] || regimeRates.default;
  }

  /**
   * Gera explicação didática sobre a formação do preço
   */
  private generatePricingExplanation(
    costPrice: number,
    taxes: number,
    fees: number,
    margin: number,
    finalPrice: number,
    taxRegime: string
  ): string {
    const regimeNames = {
      simples_nacional: 'Simples Nacional',
      lucro_presumido: 'Lucro Presumido',
      lucro_real: 'Lucro Real'
    };

    const netMargin = ((finalPrice - costPrice - taxes - fees) / finalPrice * 100).toFixed(1);
    
    return `Calculei seu preço considerando todos os custos:

💰 **Composição do preço:**
• Custo do produto: R$ ${costPrice.toFixed(2)}
• Impostos (${regimeNames[taxRegime as keyof typeof regimeNames] || taxRegime}): R$ ${taxes.toFixed(2)}
${fees > 0 ? `• Taxas e custos adicionais: R$ ${fees.toFixed(2)}\n` : ''}• Margem desejada: ${margin}%

🎯 **Resultado:**
• Margem líquida real: ${netMargin}%
• Preço final competitivo: R$ ${finalPrice.toFixed(2)}

✅ Este preço garante sua margem desejada e cobre todos os custos!`;
  }

  /**
   * Analisa competitividade do preço
   */
  async analyzeCompetitiveness(
    price: number,
    competitors: CompetitorPricing[]
  ): Promise<{
    position: 'lowest' | 'competitive' | 'premium' | 'highest';
    recommendation: string;
    adjustmentSuggestion?: number;
  }> {
    if (competitors.length === 0) {
      return {
        position: 'competitive',
        recommendation: 'Não encontrei concorrentes para comparar. Monitore o mercado regularmente.'
      };
    }

    const competitorPrices = competitors.map(c => c.price).sort((a, b) => a - b);
    const minPrice = Math.min(...competitorPrices);
    const maxPrice = Math.max(...competitorPrices);
    const avgPrice = competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length;

    let position: 'lowest' | 'competitive' | 'premium' | 'highest';
    let recommendation: string;
    let adjustmentSuggestion: number | undefined;

    if (price <= minPrice) {
      position = 'lowest';
      recommendation = 'Seu preço é o mais baixo do mercado. Considere aumentar para melhorar a margem.';
      adjustmentSuggestion = avgPrice * 0.95; // 5% abaixo da média
    } else if (price >= maxPrice) {
      position = 'highest';
      recommendation = 'Seu preço está acima da concorrência. Pode ser necessário ajustar para competir.';
      adjustmentSuggestion = avgPrice * 1.05; // 5% acima da média
    } else if (price > avgPrice * 1.1) {
      position = 'premium';
      recommendation = 'Preço premium. Certifique-se de que oferece valor diferenciado.';
    } else {
      position = 'competitive';
      recommendation = 'Preço competitivo e bem posicionado no mercado.';
    }

    return {
      position,
      recommendation,
      adjustmentSuggestion
    };
  }

  /**
   * Calcula impacto de desconto na margem
   */
  calculateDiscountImpact(
    originalPrice: number,
    costPrice: number,
    taxes: number,
    discountPercent: number
  ): {
    newPrice: number;
    newMargin: number;
    marginImpact: number;
    recommendation: string;
  } {
    const newPrice = originalPrice * (1 - discountPercent / 100);
    const totalCosts = costPrice + taxes;
    const newMargin = ((newPrice - totalCosts) / newPrice) * 100;
    const originalMargin = ((originalPrice - totalCosts) / originalPrice) * 100;
    const marginImpact = newMargin - originalMargin;

    let recommendation: string;
    if (newMargin < 5) {
      recommendation = '⚠️ Cuidado! Margem muito baixa, pode gerar prejuízo.';
    } else if (newMargin < 15) {
      recommendation = '⚠️ Margem reduzida. Monitore o volume de vendas.';
    } else {
      recommendation = '✅ Desconto viável, margem ainda saudável.';
    }

    return {
      newPrice: Math.round(newPrice * 100) / 100,
      newMargin: Math.round(newMargin * 100) / 100,
      marginImpact: Math.round(marginImpact * 100) / 100,
      recommendation
    };
  }

  /**
   * Sugere estratégias de precificação
   */
  async suggestPricingStrategies(
    currentPrice: number,
    costPrice: number,
    competitors: CompetitorPricing[],
    salesVolume?: number
  ): Promise<string[]> {
    const strategies: string[] = [];

    const competitiveness = competitors.length > 0 ? 
      await this.analyzeCompetitiveness(currentPrice, competitors) : null;

    // Estratégias baseadas na posição competitiva
    if (competitiveness?.position === 'highest') {
      strategies.push('Considere reduzir o preço em 5-10% para melhorar competitividade');
      strategies.push('Adicione valor percebido (frete grátis, garantia estendida)');
    } else if (competitiveness?.position === 'lowest') {
      strategies.push('Aumente gradualmente o preço para melhorar margem');
      strategies.push('Teste preços premium com diferenciação');
    }

    // Estratégias baseadas no volume
    if (salesVolume !== undefined) {
      if (salesVolume < 10) {
        strategies.push('Volume baixo: teste redução de preço para aumentar vendas');
      } else if (salesVolume > 50) {
        strategies.push('Alto volume: pode suportar aumento de preço');
      }
    }

    // Estratégias gerais
    strategies.push('Monitore preços dos concorrentes semanalmente');
    strategies.push('Teste preços sazonais (Black Friday, Natal)');
    strategies.push('Considere pacotes ou combos para aumentar ticket médio');

    return strategies;
  }
}

export const pricingService = new PricingService();