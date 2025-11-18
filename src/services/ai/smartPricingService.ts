/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompetitorPricing, PricingAnalysis } from '@/shared/types/ai';
import { pricingService } from './pricingService';
import { competitorService } from './competitorService';
import { logger } from './logger';

interface SmartPricingInput {
  productName: string;
  costPrice: number;
  desiredMargin?: number;
  category?: string;
  targetAudience?: 'b2c' | 'b2b';
  seasonality?: 'high' | 'medium' | 'low';
  inventory?: number;
  monthlyVolume?: number;
  businessInfo?: {
    taxRegime: string;
    businessType: string;
    averageMargin: number;
  };
}

interface SmartPricingRecommendation {
  recommendedPrice: number;
  confidence: number;
  reasoning: string[];
  alternatives: Array<{
    price: number;
    scenario: string;
    pros: string[];
    cons: string[];
  }>;
  warnings: string[];
  optimizations: string[];
}

class SmartPricingService {
  /**
   * Análise completa e inteligente de precificação
   */
  async analyzeSmartPricing(input: SmartPricingInput): Promise<SmartPricingRecommendation> {
    try {
      const startTime = Date.now();
      
      // 1. Análise básica de precificação
      const basicAnalysis = await this.performBasicAnalysis(input);
      
      // 2. Análise da concorrência
      const competitorAnalysis = await this.analyzeCompetition(input.productName);
      
      // 3. Análise de mercado e sazonalidade
      const marketAnalysis = this.analyzeMarketFactors(input);
      
      // 4. Análise de volume e elasticidade
      const volumeAnalysis = this.analyzeVolumeElasticity(input);
      
      // 5. Combina todas as análises para gerar recomendação
      const recommendation = this.generateSmartRecommendation(
        basicAnalysis,
        competitorAnalysis,
        marketAnalysis,
        volumeAnalysis,
        input
      );

      const duration = Date.now() - startTime;
      logger.trackAIUsage('smart_pricing_analysis', duration, true, {
        productName: input.productName,
        recommendedPrice: recommendation.recommendedPrice,
        confidence: recommendation.confidence
      });

      return recommendation;

    } catch (error) {
      logger.trackAIError('smart_pricing_analysis', error, input);
      throw new Error('Erro ao realizar análise inteligente de precificação');
    }
  }

  /**
   * Análise básica de custos e impostos
   */
  private async performBasicAnalysis(input: SmartPricingInput): Promise<PricingAnalysis> {
    const businessInfo = input.businessInfo || {
      taxRegime: 'simples_nacional',
      businessType: 'comercio',
      averageMargin: 30
    };

    return await pricingService.analyzePricing({
      costPrice: input.costPrice,
      desiredMargin: input.desiredMargin || businessInfo.averageMargin,
      taxRegime: businessInfo.taxRegime,
      businessType: businessInfo.businessType
    });
  }

  /**
   * Análise da concorrência
   */
  private async analyzeCompetition(productName: string): Promise<{
    competitors: CompetitorPricing[];
    averagePrice: number;
    priceRange: { min: number; max: number };
    competitivePosition: string;
  }> {
    const competitors = await competitorService.analyzeCompetitors(productName);
    
    if (competitors.length === 0) {
      return {
        competitors: [],
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        competitivePosition: 'sem_dados'
      };
    }

    const prices = competitors.map(c => c.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      competitors,
      averagePrice,
      priceRange: { min: minPrice, max: maxPrice },
      competitivePosition: this.determineCompetitivePosition(averagePrice, minPrice, maxPrice)
    };
  }

  /**
   * Análise de fatores de mercado
   */
  private analyzeMarketFactors(input: SmartPricingInput): {
    seasonalityMultiplier: number;
    audienceMultiplier: number;
    categoryMultiplier: number;
    insights: string[];
  } {
    const insights: string[] = [];
    
    // Multiplicador de sazonalidade
    const seasonalityMultipliers = {
      high: 1.15, // +15% para alta sazonalidade
      medium: 1.05, // +5% para média sazonalidade
      low: 1.0 // Sem alteração
    };
    const seasonalityMultiplier = seasonalityMultipliers[input.seasonality || 'medium'];
    
    if (input.seasonality === 'high') {
      insights.push('Produto com alta sazonalidade - aproveite os picos de demanda');
    }

    // Multiplicador de público-alvo
    const audienceMultipliers = {
      b2b: 1.2, // B2B geralmente aceita preços maiores
      b2c: 1.0
    };
    const audienceMultiplier = audienceMultipliers[input.targetAudience || 'b2c'];
    
    if (input.targetAudience === 'b2b') {
      insights.push('Mercado B2B permite margens maiores e foco em valor agregado');
    }

    // Multiplicador de categoria (simulado baseado em categorias típicas)
    const categoryMultipliers: Record<string, number> = {
      eletronicos: 0.95, // Categoria competitiva
      moda: 1.1, // Maior margem por diferenciação
      casa: 1.05, // Categoria estável
      esporte: 1.08, // Boa margem
      beleza: 1.15, // Alta margem
      default: 1.0
    };
    const categoryMultiplier = categoryMultipliers[input.category || 'default'];

    return {
      seasonalityMultiplier,
      audienceMultiplier,
      categoryMultiplier,
      insights
    };
  }

  /**
   * Análise de volume e elasticidade de preço
   */
  private analyzeVolumeElasticity(input: SmartPricingInput): {
    volumeScore: number;
    elasticityFactor: number;
    volumeInsights: string[];
  } {
    const insights: string[] = [];
    
    // Score baseado no volume mensal
    let volumeScore = 1.0;
    if (input.monthlyVolume) {
      if (input.monthlyVolume > 100) {
        volumeScore = 1.05; // Alto volume permite preços ligeiramente maiores
        insights.push('Alto volume de vendas sustenta preços premium');
      } else if (input.monthlyVolume < 20) {
        volumeScore = 0.95; // Baixo volume pode necessitar preços mais competitivos
        insights.push('Volume baixo - considere preços mais agressivos para aumentar vendas');
      }
    }

    // Fator de elasticidade baseado no estoque
    let elasticityFactor = 1.0;
    if (input.inventory) {
      if (input.inventory > 500) {
        elasticityFactor = 0.98; // Muito estoque - pode reduzir preço
        insights.push('Alto estoque - considere estratégias para acelerar vendas');
      } else if (input.inventory < 50) {
        elasticityFactor = 1.02; // Baixo estoque - pode aumentar preço
        insights.push('Estoque baixo - oportunidade para preços premium');
      }
    }

    return {
      volumeScore,
      elasticityFactor,
      volumeInsights: insights
    };
  }

  /**
   * Gera recomendação inteligente final
   */
  private generateSmartRecommendation(
    basicAnalysis: PricingAnalysis,
    competitorAnalysis: any,
    marketAnalysis: any,
    volumeAnalysis: any,
    input: SmartPricingInput
  ): SmartPricingRecommendation {
    
    // Preço base da análise básica
    let basePrice = basicAnalysis.suggestedPrice;
    
    // Aplica multiplicadores de mercado
    basePrice *= marketAnalysis.seasonalityMultiplier;
    basePrice *= marketAnalysis.audienceMultiplier;
    basePrice *= marketAnalysis.categoryMultiplier;
    basePrice *= volumeAnalysis.volumeScore;
    basePrice *= volumeAnalysis.elasticityFactor;

    // Ajusta baseado na concorrência
    let finalPrice = basePrice;
    let confidence = 0.7; // Base de confiança

    if (competitorAnalysis.competitors.length > 0) {
      const competitorAvg = competitorAnalysis.averagePrice;
      
      // Se o preço calculado está muito acima da concorrência
      if (basePrice > competitorAvg * 1.2) {
        finalPrice = competitorAvg * 1.1; // Ajusta para 10% acima da média
        confidence = 0.6; // Reduz confiança devido ao ajuste
      }
      // Se muito abaixo, pode aumentar
      else if (basePrice < competitorAvg * 0.8) {
        finalPrice = competitorAvg * 0.9; // Ajusta para 10% abaixo da média
        confidence = 0.8; // Boa confiança em preço competitivo
      } else {
        confidence = 0.9; // Alta confiança quando alinhado com mercado
      }
    }

    // Arredonda para valores mais práticos
    finalPrice = this.roundToNicePrice(finalPrice);

    // Gera explicações
    const reasoning = this.generateReasoning(
      basicAnalysis,
      competitorAnalysis,
      marketAnalysis,
      volumeAnalysis,
      finalPrice,
      input
    );

    // Gera cenários alternativos
    const alternatives = this.generateAlternatives(finalPrice, input);

    // Gera avisos e otimizações
    const warnings = this.generateWarnings(finalPrice, input, competitorAnalysis);
    const optimizations = this.generateOptimizations(input, competitorAnalysis);

    return {
      recommendedPrice: finalPrice,
      confidence,
      reasoning,
      alternatives,
      warnings,
      optimizations
    };
  }

  /**
   * Arredonda preço para valores mais práticos
   */
  private roundToNicePrice(price: number): number {
    if (price < 10) {
      return Math.round(price * 100) / 100; // Centavos
    } else if (price < 100) {
      return Math.round(price * 10) / 10; // Décimos
    } else if (price < 1000) {
      return Math.round(price); // Inteiros
    } else {
      return Math.round(price / 10) * 10; // Dezenas
    }
  }

  /**
   * Gera explicações do preço recomendado
   */
  private generateReasoning(
    basicAnalysis: PricingAnalysis,
    competitorAnalysis: any,
    marketAnalysis: any,
    volumeAnalysis: any,
    finalPrice: number,
    input: SmartPricingInput
  ): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`💰 Preço base calculado: R$ ${basicAnalysis.suggestedPrice.toFixed(2)} (custo + impostos + margem)`);
    
    if (competitorAnalysis.competitors.length > 0) {
      reasoning.push(`🔍 Preço médio dos concorrentes: R$ ${competitorAnalysis.averagePrice.toFixed(2)}`);
      reasoning.push(`📊 Posicionamento: ${this.getPositionDescription(finalPrice, competitorAnalysis.averagePrice)}`);
    }

    if (marketAnalysis.insights.length > 0) {
      reasoning.push(...marketAnalysis.insights.map((insight: string) => `📈 ${insight}`));
    }

    if (volumeAnalysis.volumeInsights.length > 0) {
      reasoning.push(...volumeAnalysis.volumeInsights.map((insight: string) => `📊 ${insight}`));
    }

    const margin = ((finalPrice - input.costPrice) / finalPrice * 100).toFixed(1);
    reasoning.push(`💡 Margem líquida estimada: ${margin}%`);

    return reasoning;
  }

  /**
   * Gera cenários alternativos
   */
  private generateAlternatives(basePrice: number, _input: SmartPricingInput): Array<{
    price: number;
    scenario: string;
    pros: string[];
    cons: string[];
  }> {
    return [
      {
        price: this.roundToNicePrice(basePrice * 0.9),
        scenario: 'Preço Competitivo (-10%)',
        pros: ['Maior volume de vendas', 'Melhor posicionamento vs concorrentes', 'Entrada rápida no mercado'],
        cons: ['Menor margem de lucro', 'Pode criar guerra de preços', 'Menos recursos para marketing']
      },
      {
        price: this.roundToNicePrice(basePrice * 1.1),
        scenario: 'Preço Premium (+10%)',
        pros: ['Maior margem de lucro', 'Posicionamento de qualidade', 'Mais recursos para investimento'],
        cons: ['Menor volume potencial', 'Exige melhor diferenciação', 'Competição com marcas estabelecidas']
      },
      {
        price: this.roundToNicePrice(basePrice * 0.8),
        scenario: 'Estratégia Penetração (-20%)',
        pros: ['Conquista rápida de mercado', 'Alto volume', 'Barreira à entrada de concorrentes'],
        cons: ['Margem muito baixa', 'Difícil aumentar preço depois', 'Risco de prejuízo']
      }
    ];
  }

  /**
   * Gera avisos importantes
   */
  private generateWarnings(
    price: number,
    input: SmartPricingInput,
    competitorAnalysis: any
  ): string[] {
    const warnings: string[] = [];
    
    const margin = ((price - input.costPrice) / price * 100);
    
    if (margin < 15) {
      warnings.push('⚠️ Margem baixa - monitore custos variáveis e volume mínimo');
    }
    
    if (competitorAnalysis.competitors.length > 0) {
      const avgCompetitor = competitorAnalysis.averagePrice;
      if (price > avgCompetitor * 1.15) {
        warnings.push('⚠️ Preço 15% acima da média - garanta diferenciação clara');
      }
    }
    
    if (input.monthlyVolume && input.monthlyVolume < 10) {
      warnings.push('⚠️ Volume baixo - considere investir em marketing para aumentar demanda');
    }

    return warnings;
  }

  /**
   * Gera sugestões de otimização
   */
  private generateOptimizations(
    input: SmartPricingInput,
    competitorAnalysis: any
  ): string[] {
    const optimizations: string[] = [];
    
    optimizations.push('🔄 Monitore preços dos concorrentes semanalmente');
    optimizations.push('📊 Teste diferentes preços com A/B testing');
    optimizations.push('💰 Negocie melhores condições com fornecedores');
    
    if (competitorAnalysis.competitors.length > 0) {
      optimizations.push('🎯 Identifique diferenciais únicos para justificar preço premium');
    }
    
    if (input.targetAudience === 'b2b') {
      optimizations.push('📝 Considere pacotes ou contratos para aumentar ticket médio');
    }
    
    optimizations.push('📈 Implemente precificação dinâmica para sazonalidade');

    return optimizations;
  }

  /**
   * Determina posição competitiva
   */
  private determineCompetitivePosition(avg: number, min: number, max: number): string {
    const range = max - min;
    if (range < avg * 0.1) {return 'mercado_uniforme';}
    if (max > avg * 1.5) {return 'mercado_segmentado';}
    return 'mercado_competitivo';
  }

  /**
   * Descrição da posição vs concorrentes
   */
  private getPositionDescription(price: number, avgCompetitor: number): string {
    const diff = ((price - avgCompetitor) / avgCompetitor * 100);
    
    if (diff > 10) {return `${diff.toFixed(0)}% acima da média (posição premium)`;}
    if (diff < -10) {return `${Math.abs(diff).toFixed(0)}% abaixo da média (posição competitiva)`;}
    return 'Alinhado com a média do mercado';
  }

  /**
   * Análise de impacto de mudança de preço
   */
  async analyzePriceImpact(
    currentPrice: number,
    newPrice: number,
    input: SmartPricingInput
  ): Promise<{
    volumeImpact: number;
    revenueImpact: number;
    marginImpact: number;
    recommendations: string[];
  }> {
    const priceChange = ((newPrice - currentPrice) / currentPrice * 100);
    
    // Estimativa de elasticidade (simplificada)
    let elasticity = -1.2; // Default
    if (input.category === 'eletronicos') {
      elasticity = -1.5;
    } else if (input.category === 'moda') {
      elasticity = -0.8;
    }
    
    const volumeImpact = elasticity * priceChange;
    const currentVolume = input.monthlyVolume || 50;
    const newVolume = currentVolume * (1 + volumeImpact / 100);
    
    const currentRevenue = currentPrice * currentVolume;
    const newRevenue = newPrice * newVolume;
    const revenueImpact = ((newRevenue - currentRevenue) / currentRevenue * 100);
    
    const currentMargin = ((currentPrice - input.costPrice) / currentPrice * 100);
    const newMargin = ((newPrice - input.costPrice) / newPrice * 100);
    const marginImpact = newMargin - currentMargin;

    const recommendations: string[] = [];
    
    if (revenueImpact < -5) {
      recommendations.push('📉 Queda significativa na receita - monitore cuidadosamente');
    }
    
    if (volumeImpact < -20) {
      recommendations.push('📊 Grande impacto no volume - considere campanhas de marketing');
    }
    
    if (marginImpact > 5) {
      recommendations.push('💰 Melhora significativa na margem - boa oportunidade');
    }

    return {
      volumeImpact,
      revenueImpact,
      marginImpact,
      recommendations
    };
  }
}

export const smartPricingService = new SmartPricingService();