/**
 * Smart Pricing Service - Main Orchestrator
 * Intelligently analyzes and recommends optimal pricing strategies
 */

import { logger, toErrorContext } from '../logger';
import { analyzeCompetition, analyzeMarketFactors, analyzeVolumeElasticity, performBasicAnalysis } from './analysis';
import { analyzePriceImpact } from './impact';
import { generateSmartRecommendation } from './recommendation';
import { PriceImpactAnalysis, SmartPricingInput, SmartPricingRecommendation } from './types';

/**
 * Serviço de Precificação Inteligente
 * 
 * Orquestra análises completas de precificação considerando custos, impostos,
 * concorrência, mercado, volume e elasticidade para recomendar o preço ótimo.
 * 
 * @remarks
 * **Arquitetura modular**:
 * - `analysis.ts`: Análises básica, competitiva, mercado e volume
 * - `calculation.ts`: Cálculos de preço e multiplicadores
 * - `recommendation.ts`: Geração de recomendações com reasoning
 * - `impact.ts`: Análise de impacto de mudanças de preço
 * 
 * **Capacidades principais**:
 * - ✅ Análise de custos e impostos por regime tributário
 * - ✅ Comparação automática com concorrentes
 * - ✅ Ajustes por sazonalidade, público-alvo e categoria
 * - ✅ Cálculo de elasticidade de preço
 * - ✅ Simulação de impacto de mudanças
 * - ✅ Recomendações com reasoning detalhado
 * - ✅ Cenários alternativos (competitivo, premium, penetração)
 * - ✅ Alertas e otimizações acionáveis
 * 
 * **Uso típico**:
 * ```typescript
 * import { smartPricingService } from '@/services/ai/smartPricing';
 * 
 * // Análise completa
 * const recommendation = await smartPricingService.analyzeSmartPricing({
 *   productName: 'iPhone 15 Pro 256GB',
 *   costPrice: 4500.00,
 *   desiredMargin: 35,
 *   category: 'eletronicos',
 *   seasonality: 'medium',
 *   targetAudience: 'b2c',
 *   monthlyVolume: 50,
 *   inventory: 200
 * });
 * 
 * console.log(`Preço recomendado: R$ ${recommendation.recommendedPrice}`);
 * console.log(`Confiança: ${recommendation.confidence}%`);
 * recommendation.reasoning.forEach(r => console.log(r));
 * ```
 * 
 * **Pipeline de análise** (5 etapas):
 * 1. Análise básica (custos + impostos + margem)
 * 2. Análise competitiva (preços do mercado)
 * 3. Análise de mercado (sazonalidade, público, categoria)
 * 4. Análise de volume (elasticidade, estoque)
 * 5. Recomendação inteligente (combinação de tudo)
 * 
 * **Singleton pattern**: Use a instância exportada `smartPricingService`
 */
class SmartPricingService {
  /**
   * Realiza análise completa e inteligente de precificação
   * 
   * Executa pipeline completo de análise combinando dados de custos, impostos,
   * concorrência, mercado e volume para recomendar o preço ótimo com alta confiança.
   * 
   * @param input - Dados completos do produto e contexto de negócio
   * @returns Recomendação inteligente com preço, confiança, reasoning e alternativas
   * 
   * @throws Error - Se houver falha crítica na análise
   * 
   * @example
   * ```typescript
   * // Caso 1: E-commerce B2C - Eletrônicos
   * const recommendation1 = await smartPricingService.analyzeSmartPricing({
   *   productName: 'Smart TV 55" 4K Samsung',
   *   costPrice: 1800.00,
   *   desiredMargin: 30,
   *   category: 'eletronicos',
   *   seasonality: 'high',        // Black Friday, Natal
   *   targetAudience: 'b2c',
   *   monthlyVolume: 80,
   *   inventory: 150,
   *   businessInfo: {
   *     taxRegime: 'simples_nacional',
   *     businessType: 'comercio',
   *     averageMargin: 28
   *   }
   * });
   * 
   * console.log('📺 Smart TV 55"');
   * console.log(`💰 Preço recomendado: R$ ${recommendation1.recommendedPrice.toFixed(2)}`);
   * console.log(`🎯 Confiança: ${recommendation1.confidence}%`);
   * console.log('\n📋 Como chegamos nesse preço:');
   * recommendation1.reasoning.forEach(r => console.log(`  ${r}`));
   * 
   * console.log('\n🔀 Alternativas:');
   * recommendation1.alternatives.forEach(alt => {
   *   console.log(`\n  ${alt.scenario}: R$ ${alt.price.toFixed(2)}`);
   *   console.log(`    ✅ ${alt.pros[0]}`);
   *   console.log(`    ❌ ${alt.cons[0]}`);
   * });
   * 
   * if (recommendation1.warnings.length > 0) {
   *   console.log('\n⚠️ Atenção:');
   *   recommendation1.warnings.forEach(w => console.log(`  ${w}`));
   * }
   * 
   * console.log('\n🚀 Otimizações:');
   * recommendation1.optimizations.slice(0, 3).forEach(o => console.log(`  ${o}`));
   * 
   * // Caso 2: B2B - Serviços de beleza
   * const recommendation2 = await smartPricingService.analyzeSmartPricing({
   *   productName: 'Pacote de tratamento facial premium',
   *   costPrice: 120.00,
   *   desiredMargin: 60,
   *   category: 'beleza',
   *   seasonality: 'low',          // Demanda constante
   *   targetAudience: 'b2b',       // Clínicas/salões
   *   monthlyVolume: 15,
   *   businessInfo: {
   *     taxRegime: 'lucro_presumido',
   *     businessType: 'service',
   *     averageMargin: 55
   *   }
   * });
   * 
   * console.log(`\n💆 Tratamento Facial`);
   * console.log(`Preço B2B: R$ ${recommendation2.recommendedPrice.toFixed(2)}`);
   * // Preço será ajustado com multiplier B2B (1.2x)
   * ```
   * 
   * @remarks
   * **Pipeline de execução** (5 etapas sequenciais):
   * 
   * **1. Análise Básica** (`performBasicAnalysis`):
   * - Calcula preço base: custo + impostos + margem
   * - Aplica regime tributário correto
   * - Retorna: preço sugerido, impostos, margem efetiva
   * 
   * **2. Análise Competitiva** (`analyzeCompetition`):
   * - Busca preços de concorrentes (web scraping/APIs)
   * - Calcula preço médio, mínimo, máximo
   * - Determina posicionamento: uniforme/competitivo/segmentado
   * - Se sem dados: retorna estrutura vazia
   * 
   * **3. Análise de Mercado** (`analyzeMarketFactors`):
   * - Calcula multiplicadores:
   *   * Sazonalidade: 1.0 - 1.15x
   *   * Público-alvo: 1.0 (B2C) / 1.2x (B2B)
   *   * Categoria: 0.95 - 1.15x
   * - Gera insights estratégicos
   * 
   * **4. Análise de Volume** (`analyzeVolumeElasticity`):
   * - Volume score baseado em vendas mensais
   * - Elasticity factor baseado em estoque
   * - Identifica oportunidades (estoque baixo) ou riscos (estoque alto)
   * 
   * **5. Recomendação Inteligente** (`generateSmartRecommendation`):
   * - Combina todas as análises
   * - Aplica todos os multiplicadores
   * - Ajusta por competição
   * - Arredonda para preço psicológico
   * - Gera reasoning, alternativas, warnings, otimizações
   * 
   * **Logging e tracking**:
   * - ✅ Registra tempo de execução
   * - ✅ Tracking de uso de AI com `logger.trackAIUsage()`
   * - ✅ Tracking de erros com `logger.trackAIError()`
   * - ✅ Dados anonimizados: productName, recommendedPrice, confidence
   * 
   * **Tratamento de erros**:
   * - Captura qualquer erro no pipeline
   * - Registra erro com contexto completo
   * - Lança erro genérico para cliente
   * - Mensagem: "Erro ao realizar análise inteligente de precificação"
   * 
   * **Performance**:
   * - Tempo típico: 500-2000ms
   * - Gargalo: busca de concorrentes (web scraping)
   * - Otimização: cache de dados de concorrentes
   * 
   * **Dados mínimos requeridos**:
   * - `productName`: Para busca de concorrentes
   * - `costPrice`: Para cálculos de margem
   * - Outros campos têm defaults sensatos
   * 
   * **Confiança da recomendação**:
   * - Base: 60%
   * - +10% se tem dados de concorrentes
   * - +10% se tem histórico de volume
   * - +10% se tem dados de inventory
   * - +10% se mercado é uniforme/competitivo
   * - Máximo: 100%
   */
  async analyzeSmartPricing(input: SmartPricingInput): Promise<SmartPricingRecommendation> {
    try {
      const startTime = Date.now();
      
      // 1. Basic pricing analysis
      const basicAnalysis = await performBasicAnalysis(input);
      
      // 2. Competition analysis
      const competitorAnalysis = await analyzeCompetition(input.productName);
      
      // 3. Market and seasonality analysis
      const marketAnalysis = analyzeMarketFactors(input);
      
      // 4. Volume and elasticity analysis
      const volumeAnalysis = analyzeVolumeElasticity(input);
      
      // 5. Generate smart recommendation
      const recommendation = generateSmartRecommendation(
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
      logger.trackAIError('smart_pricing_analysis', toErrorContext(error), {
        productName: input.productName,
        costPrice: input.costPrice
      });
      throw new Error('Erro ao realizar análise inteligente de precificação');
    }
  }

  /**
   * Analisa o impacto de uma mudança de preço
   * 
   * Wrapper conveniente para `analyzePriceImpact()` permitindo simular
   * o efeito de alterar o preço atual para um novo valor.
   * 
   * @param currentPrice - Preço atual do produto
   * @param newPrice - Novo preço proposto
   * @param input - Dados do produto (custo, volume, categoria)
   * @returns Análise de impacto no volume, receita e margem
   * 
   * @example
   * ```typescript
   * // Simular aumento de 15%
   * const impact = await smartPricingService.analyzePriceImpact(
   *   100.00,  // Preço atual
   *   115.00,  // Novo preço (+15%)
   *   {
   *     costPrice: 50.00,
   *     monthlyVolume: 100,
   *     category: 'eletronicos'
   *   }
   * );
   * 
   * console.log(`📊 Simulação: R$ 100 → R$ 115 (+15%)`);
   * console.log(`Volume: ${impact.volumeImpact > 0 ? '+' : ''}${impact.volumeImpact.toFixed(1)}%`);
   * console.log(`Receita: ${impact.revenueImpact > 0 ? '+' : ''}${impact.revenueImpact.toFixed(1)}%`);
   * console.log(`Margem: ${impact.marginImpact > 0 ? '+' : ''}${impact.marginImpact.toFixed(1)}pp`);
   * 
   * if (impact.recommendations.length > 0) {
   *   console.log('\n💡 Recomendações:');
   *   impact.recommendations.forEach(r => console.log(`  ${r}`));
   * }
   * 
   * // Simular múltiplos cenários
   * console.log('\n📈 Simulação de cenários:');
   * for (let newPrice = 95; newPrice <= 120; newPrice += 5) {
   *   const sim = await smartPricingService.analyzePriceImpact(100, newPrice, input);
   *   const change = ((newPrice - 100) / 100 * 100).toFixed(0);
   *   console.log(
   *     `R$ ${newPrice} (${change > 0 ? '+' : ''}${change}%): ` +
   *     `Receita ${sim.revenueImpact.toFixed(1)}%`
   *   );
   * }
   * // Output:
   * // R$ 95 (-5%): Receita +2.3%
   * // R$ 100 (0%): Receita 0.0%
   * // R$ 105 (+5%): Receita +1.2%
   * // R$ 110 (+10%): Receita -0.5%
   * // R$ 115 (+15%): Receita -3.8%
   * // R$ 120 (+20%): Receita -8.0%
   * ```
   * 
   * @remarks
   * **Delegação**:
   * Este método é um wrapper simples que delega para a função
   * `analyzePriceImpact()` do módulo `impact.ts`.
   * 
   * **Uso recomendado**:
   * - Simular antes de mudar preços
   * - Testar múltiplos cenários (loop)
   * - Validar se mudança vale a pena
   * - Comparar trade-offs (volume vs margem)
   * 
   * **Veja também**:
   * - `analyzePriceImpact()` em `impact.ts` para detalhes da implementação
   */
  async analyzePriceImpact(
    currentPrice: number,
    newPrice: number,
    input: SmartPricingInput
  ): Promise<PriceImpactAnalysis> {
    return analyzePriceImpact(currentPrice, newPrice, input);
  }
}

// Export singleton instance
export const smartPricingService = new SmartPricingService();

// Re-export types for convenience
export type {
  CompetitorAnalysisResult,
  MarketAnalysisResult,
  PriceImpactAnalysis,
  PricingAlternative,
  SmartPricingInput,
  SmartPricingRecommendation,
  VolumeAnalysisResult,
} from './types';
