/**
 * Analysis Module
 * Handles all types of analysis: basic, competition, market, and volume
 */

import { CompetitorPricing, PricingAnalysis } from '@/shared/types/ai';
import { competitorService } from '../competitorService';
import { pricingService } from '../pricingService';
import { CompetitorAnalysisResult, MarketAnalysisResult, SmartPricingInput, VolumeAnalysisResult } from './types';

/**
 * Realiza análise básica de precificação considerando custos e impostos
 * 
 * Analisa o preço ideal baseado em custo, margem desejada e regime tributário,
 * fornecendo breakdown completo de impostos e margem real.
 * 
 * @param input - Dados de entrada incluindo custo e informações do negócio
 * @returns Análise completa com preço sugerido, impostos e margem efetiva
 * 
 * @example
 * ```typescript
 * const input: SmartPricingInput = {
 *   costPrice: 50.00,
 *   desiredMargin: 40,
 *   businessInfo: {
 *     taxRegime: 'simples_nacional',
 *     businessType: 'comercio',
 *     averageMargin: 30
 *   }
 * };
 * 
 * const analysis = await performBasicAnalysis(input);
 * console.log(`Preço sugerido: R$ ${analysis.suggestedPrice.toFixed(2)}`);
 * console.log(`Margem efetiva: ${analysis.effectiveMargin}%`);
 * console.log(`Impostos: R$ ${analysis.taxes.toFixed(2)}`);
 * ```
 * 
 * @remarks
 * **Valores padrão aplicados**:
 * - Se `desiredMargin` não fornecida: usa `businessInfo.averageMargin`
 * - Se `businessInfo` não fornecida: 
 *   * taxRegime: 'simples_nacional'
 *   * businessType: 'comercio'
 *   * averageMargin: 30%
 * 
 * **Cálculos realizados**:
 * 1. Aplica regime tributário (Simples, Presumido, Real)
 * 2. Calcula impostos sobre venda
 * 3. Determina preço para atingir margem desejada
 * 4. Calcula margem efetiva real
 * 
 * **Usa pricingService.analyzePricing()** internamente para cálculos tributários
 */
export async function performBasicAnalysis(input: SmartPricingInput): Promise<PricingAnalysis> {
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
 * Analisa concorrência para o produto no mercado
 * 
 * Busca preços de concorrentes e calcula estatísticas competitivas incluindo
 * preço médio, faixa de preços e posicionamento competitivo.
 * 
 * @param productName - Nome do produto para buscar concorrentes
 * @returns Análise competitiva completa ou resultado vazio se sem dados
 * 
 * @example
 * ```typescript
 * const analysis = await analyzeCompetition('iPhone 15 Pro 256GB');
 * 
 * if (analysis.competitivePosition !== 'sem_dados') {
 *   console.log(`Concorrentes encontrados: ${analysis.competitors.length}`);
 *   console.log(`Preço médio: R$ ${analysis.averagePrice.toFixed(2)}`);
 *   console.log(`Faixa: R$ ${analysis.priceRange.min} - R$ ${analysis.priceRange.max}`);
 *   console.log(`Posição: ${analysis.competitivePosition}`);
 *   
 *   // Listar concorrentes
 *   analysis.competitors.forEach(comp => {
 *     console.log(`${comp.competitor}: R$ ${comp.price}`);
 *   });
 * } else {
 *   console.log('Sem dados de concorrência disponíveis');
 * }
 * ```
 * 
 * @remarks
 * **Retorno quando sem dados**:
 * ```typescript
 * {
 *   competitors: [],
 *   averagePrice: 0,
 *   priceRange: { min: 0, max: 0 },
 *   competitivePosition: 'sem_dados'
 * }
 * ```
 * 
 * **Posicionamento competitivo** (determinado por `determineCompetitivePosition`):
 * - **'mercado_uniforme'**: Preços muito próximos (variação < 10% da média)
 * - **'mercado_segmentado'**: Grande dispersão de preços (máx > 150% da média)
 * - **'mercado_competitivo'**: Dispersão moderada de preços
 * - **'sem_dados'**: Nenhum concorrente encontrado
 * 
 * **Cálculos realizados**:
 * 1. Busca concorrentes via `competitorService.analyzeCompetitors()`
 * 2. Extrai preços de todos os concorrentes
 * 3. Calcula média, mínimo e máximo
 * 4. Determina posicionamento baseado em dispersão
 * 
 * **Uso típico**: Comparar seu preço proposto com o mercado
 */
export async function analyzeCompetition(productName: string): Promise<CompetitorAnalysisResult> {
  const competitors = await competitorService.analyzeCompetitors(productName);
  
  if (competitors.length === 0) {
    return {
      competitors: [],
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      competitivePosition: 'sem_dados'
    };
  }

  const prices = competitors.map((c: CompetitorPricing) => c.price);
  const averagePrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    competitors,
    averagePrice,
    priceRange: { min: minPrice, max: maxPrice },
    competitivePosition: determineCompetitivePosition(averagePrice, minPrice, maxPrice)
  };
}

/**
 * Analisa fatores de mercado que influenciam o preço
 * 
 * Calcula multiplicadores baseados em sazonalidade, público-alvo e categoria
 * do produto, fornecendo insights estratégicos para precificação.
 * 
 * @param input - Dados de entrada incluindo sazonalidade, público e categoria
 * @returns Multiplicadores calculados e insights de mercado
 * 
 * @example
 * ```typescript
 * const input: SmartPricingInput = {
 *   costPrice: 100,
 *   seasonality: 'high',      // Alta sazonalidade (Natal, Black Friday)
 *   targetAudience: 'b2b',    // Público empresarial
 *   category: 'beleza'        // Categoria beleza
 * };
 * 
 * const market = analyzeMarketFactors(input);
 * 
 * console.log('Multiplicadores:');
 * console.log(`Sazonalidade: ${market.seasonalityMultiplier}x`);  // 1.15
 * console.log(`Público: ${market.audienceMultiplier}x`);          // 1.2
 * console.log(`Categoria: ${market.categoryMultiplier}x`);        // 1.15
 * 
 * const totalMultiplier = 
 *   market.seasonalityMultiplier * 
 *   market.audienceMultiplier * 
 *   market.categoryMultiplier;
 * console.log(`Total: ${totalMultiplier.toFixed(3)}x`);           // ~1.587x
 * 
 * // Insights estratégicos
 * market.insights.forEach(insight => console.log(`💡 ${insight}`));
 * // Output:
 * // 💡 Produto com alta sazonalidade - aproveite os picos de demanda
 * // 💡 Mercado B2B permite margens maiores e foco em valor agregado
 * ```
 * 
 * @remarks
 * **Multiplicadores de sazonalidade**:
 * - **high** (1.15): Produtos com sazonalidade forte (decoração natalina, volta às aulas)
 * - **medium** (1.05): Sazonalidade moderada (roupas de verão/inverno)
 * - **low** (1.0): Produtos de demanda constante (alimentos básicos)
 * 
 * **Multiplicadores de público**:
 * - **B2B** (1.2): Empresas toleram preços maiores, focam em valor e ROI
 * - **B2C** (1.0): Consumidores finais, mais sensíveis a preço
 * 
 * **Multiplicadores por categoria**:
 * - **beleza** (1.15): Alta margem, valor percebido elevado
 * - **moda** (1.1): Margem boa, branding importante
 * - **esporte** (1.08): Margem moderada-alta
 * - **casa** (1.05): Margem moderada
 * - **eletronicos** (0.95): Margem comprimida, alta competição
 * - **default** (1.0): Categoria não especificada
 * 
 * **Insights gerados**:
 * - Alertas sobre alta sazonalidade
 * - Orientações sobre B2B vs B2C
 * - Automaticamente incluídos quando condições são atendidas
 * 
 * **Valores padrão**:
 * - seasonality: 'medium' → multiplier 1.05
 * - targetAudience: 'b2c' → multiplier 1.0
 * - category: 'default' → multiplier 1.0
 */
export function analyzeMarketFactors(input: SmartPricingInput): MarketAnalysisResult {
  const insights: string[] = [];
  
  // Seasonality multiplier
  const seasonalityMultipliers = {
    high: 1.15,
    medium: 1.05,
    low: 1.0
  };
  const seasonalityMultiplier = seasonalityMultipliers[input.seasonality || 'medium'];
  
  if (input.seasonality === 'high') {
    insights.push('Produto com alta sazonalidade - aproveite os picos de demanda');
  }

  // Target audience multiplier
  const audienceMultipliers = {
    b2b: 1.2,
    b2c: 1.0
  };
  const audienceMultiplier = audienceMultipliers[input.targetAudience || 'b2c'];
  
  if (input.targetAudience === 'b2b') {
    insights.push('Mercado B2B permite margens maiores e foco em valor agregado');
  }

  // Category multiplier
  const categoryMultipliers: Record<string, number> = {
    eletronicos: 0.95,
    moda: 1.1,
    casa: 1.05,
    esporte: 1.08,
    beleza: 1.15,
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
 * Analisa volume de vendas e elasticidade de preço
 * 
 * Calcula scores baseados no volume mensal de vendas e nível de estoque,
 * determinando o impacto na estratégia de precificação.
 * 
 * @param input - Dados incluindo volume mensal e estoque disponível
 * @returns Scores de volume/elasticidade e insights acionáveis
 * 
 * @example
 * ```typescript
 * // Cenário 1: Alto volume, estoque alto
 * const highVolumeInput: SmartPricingInput = {
 *   costPrice: 50,
 *   monthlyVolume: 150,  // Alto volume
 *   inventory: 600       // Alto estoque
 * };
 * 
 * const analysis1 = analyzeVolumeElasticity(highVolumeInput);
 * console.log(`Volume score: ${analysis1.volumeScore}`);           // 1.05
 * console.log(`Elasticity: ${analysis1.elasticityFactor}`);        // 0.98
 * analysis1.volumeInsights.forEach(i => console.log(`💡 ${i}`));
 * // Output:
 * // 💡 Alto volume de vendas sustenta preços premium
 * // 💡 Alto estoque - considere estratégias para acelerar vendas
 * 
 * // Cenário 2: Baixo volume, estoque baixo
 * const lowVolumeInput: SmartPricingInput = {
 *   costPrice: 50,
 *   monthlyVolume: 10,   // Baixo volume
 *   inventory: 30        // Baixo estoque
 * };
 * 
 * const analysis2 = analyzeVolumeElasticity(lowVolumeInput);
 * console.log(`Volume score: ${analysis2.volumeScore}`);           // 0.95
 * console.log(`Elasticity: ${analysis2.elasticityFactor}`);        // 1.02
 * analysis2.volumeInsights.forEach(i => console.log(`💡 ${i}`));
 * // Output:
 * // 💡 Volume baixo - considere preços mais agressivos para aumentar vendas
 * // 💡 Estoque baixo - oportunidade para preços premium
 * ```
 * 
 * @remarks
 * **Volume Score** (baseado em `monthlyVolume`):
 * - **Alto volume** (> 100 unidades/mês): 
 *   * Score: 1.05
 *   * Insight: "Alto volume sustenta preços premium"
 *   * Estratégia: Manter ou aumentar preço, volume compensa
 * 
 * - **Volume moderado** (20-100 unidades/mês):
 *   * Score: 1.0 (neutro)
 *   * Sem insight específico
 *   * Estratégia: Balanceada
 * 
 * - **Baixo volume** (< 20 unidades/mês):
 *   * Score: 0.95
 *   * Insight: "Considere preços mais agressivos"
 *   * Estratégia: Reduzir preço para estimular demanda
 * 
 * **Elasticity Factor** (baseado em `inventory`):
 * - **Alto estoque** (> 500 unidades):
 *   * Factor: 0.98 (pressão para reduzir preço)
 *   * Insight: "Considere estratégias para acelerar vendas"
 *   * Estratégia: Promoções, descontos, liquidação
 * 
 * - **Estoque moderado** (50-500 unidades):
 *   * Factor: 1.0 (neutro)
 *   * Sem insight específico
 *   * Estratégia: Normal
 * 
 * - **Baixo estoque** (< 50 unidades):
 *   * Factor: 1.02 (permite aumentar preço)
 *   * Insight: "Oportunidade para preços premium"
 *   * Estratégia: Aumentar preço, estoque limitado cria urgência
 * 
 * **Se não fornecido**:
 * - Sem `monthlyVolume`: volumeScore = 1.0
 * - Sem `inventory`: elasticityFactor = 1.0
 * 
 * **Uso no cálculo final**:
 * ```typescript
 * finalPrice = basePrice * volumeScore * elasticityFactor;
 * ```
 */
export function analyzeVolumeElasticity(input: SmartPricingInput): VolumeAnalysisResult {
  const insights: string[] = [];
  
  // Volume score
  let volumeScore = 1.0;
  if (input.monthlyVolume) {
    if (input.monthlyVolume > 100) {
      volumeScore = 1.05;
      insights.push('Alto volume de vendas sustenta preços premium');
    } else if (input.monthlyVolume < 20) {
      volumeScore = 0.95;
      insights.push('Volume baixo - considere preços mais agressivos para aumentar vendas');
    }
  }

  // Elasticity factor based on inventory
  let elasticityFactor = 1.0;
  if (input.inventory) {
    if (input.inventory > 500) {
      elasticityFactor = 0.98;
      insights.push('Alto estoque - considere estratégias para acelerar vendas');
    } else if (input.inventory < 50) {
      elasticityFactor = 1.02;
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
 * Determina o posicionamento competitivo no mercado
 * 
 * Analisa a dispersão de preços entre concorrentes para classificar
 * o tipo de mercado e orientar estratégia de precificação.
 * 
 * @param avg - Preço médio dos concorrentes
 * @param min - Preço mínimo encontrado
 * @param max - Preço máximo encontrado
 * @returns Classificação do mercado como string
 * 
 * @example
 * ```typescript
 * // Mercado uniforme - preços muito próximos
 * const pos1 = determineCompetitivePosition(100, 95, 105);
 * console.log(pos1); // 'mercado_uniforme'
 * // Estratégia: Pouca margem para diferenciação por preço
 * 
 * // Mercado competitivo - dispersão moderada
 * const pos2 = determineCompetitivePosition(100, 80, 130);
 * console.log(pos2); // 'mercado_competitivo'
 * // Estratégia: Espaço para posicionamento intermediário
 * 
 * // Mercado segmentado - grande dispersão
 * const pos3 = determineCompetitivePosition(100, 50, 200);
 * console.log(pos3); // 'mercado_segmentado'
 * // Estratégia: Múltiplos segmentos (economia, intermediário, premium)
 * ```
 * 
 * @remarks
 * **Classificações possíveis**:
 * 
 * **1. 'mercado_uniforme'**:
 * - Condição: `(max - min) < avg * 0.1`
 * - Significa: Variação de preços < 10% da média
 * - Exemplo: Média R$ 100, variação R$ 95-105 (R$ 10 = 10%)
 * - Características:
 *   * Commodities ou produtos padronizados
 *   * Competição principalmente por serviço/entrega
 *   * Pouca margem para diferenciação por preço
 *   * Guerra de preços destrutiva
 * - Estratégia sugerida:
 *   * Diferenciar por serviço, marca, conveniência
 *   * Manter preço próximo à média
 *   * Focar em eficiência operacional
 * 
 * **2. 'mercado_segmentado'**:
 * - Condição: `max > avg * 1.5`
 * - Significa: Preço máximo > 150% da média
 * - Exemplo: Média R$ 100, máximo R$ 160+ (60%+ acima)
 * - Características:
 *   * Múltiplos segmentos de mercado (baixo/médio/alto)
 *   * Diferenciação clara de qualidade/marca
 *   * Público com diferentes disposições a pagar
 *   * Espaço para posicionamento premium
 * - Estratégia sugerida:
 *   * Escolher segmento alvo claramente
 *   * Construir proposta de valor específica
 *   * Premium: foco em qualidade/exclusividade
 *   * Economia: foco em custo/volume
 * 
 * **3. 'mercado_competitivo'** (default):
 * - Condição: Não é uniforme nem segmentado
 * - Significa: Dispersão moderada de preços
 * - Exemplo: Média R$ 100, variação R$ 80-130
 * - Características:
 *   * Competição saudável
 *   * Espaço para diferenciação
 *   * Múltiplas estratégias viáveis
 *   * Equilíbrio entre preço e valor
 * - Estratégia sugerida:
 *   * Posicionamento intermediário flexível
 *   * Ajustar conforme proposta de valor
 *   * Monitorar concorrentes ativamente
 * 
 * **Uso típico**:
 * Chamada internamente por `analyzeCompetition()` para classificar
 * o mercado e orientar recomendações de preço.
 */
function determineCompetitivePosition(avg: number, min: number, max: number): string {
  const range = max - min;
  if (range < avg * 0.1) {
    return 'mercado_uniforme';
  }
  if (max > avg * 1.5) {
    return 'mercado_segmentado';
  }
  return 'mercado_competitivo';
}
