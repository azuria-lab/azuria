/**
 * Types for Smart Pricing Service
 * Defines all interfaces and types used in smart pricing analysis
 */

import { CompetitorPricing } from '@/shared/types/ai';

/**
 * Entrada para análise de precificação inteligente
 * 
 * Contém todos os dados necessários para calcular o preço ótimo considerando
 * custos, mercado, concorrência e volume.
 * 
 * @example
 * ```typescript
 * const input: SmartPricingInput = {
 *   productName: 'Notebook Gamer RTX 4060',
 *   costPrice: 3500.00,
 *   desiredMargin: 25,
 *   category: 'eletronicos',
 *   targetAudience: 'b2c',
 *   seasonality: 'high',
 *   inventory: 50,
 *   monthlyVolume: 15,
 *   businessInfo: {
 *     taxRegime: 'simples_nacional',
 *     businessType: 'comercio',
 *     averageMargin: 22
 *   }
 * };
 * ```
 */
export interface SmartPricingInput {
  /**
   * Nome do produto para busca de concorrentes
   * @example 'iPhone 15 Pro 256GB', 'Notebook Dell Inspiron'
   */
  productName: string;

  /**
   * Custo de aquisição/produção do produto
   * @example 1500.00
   */
  costPrice: number;

  /**
   * Margem de lucro desejada (%)
   * @default 30
   * @example 25
   */
  desiredMargin?: number;

  /**
   * Categoria do produto para ajustes específicos
   * @example 'eletronicos', 'moda', 'alimentos', 'beleza'
   */
  category?: string;

  /**
   * Público-alvo (B2C = consumidor final, B2B = empresas)
   * @default 'b2c'
   * @example 'b2b'
   */
  targetAudience?: 'b2c' | 'b2b';

  /**
   * Nível de sazonalidade da demanda
   * - high: Alta variação sazonal (ex: presentes, roupas de verão)
   * - medium: Variação moderada
   * - low: Demanda constante o ano todo
   * @default 'low'
   * @example 'high'
   */
  seasonality?: 'high' | 'medium' | 'low';

  /**
   * Quantidade em estoque
   * @example 200
   */
  inventory?: number;

  /**
   * Volume médio de vendas mensais
   * @example 50
   */
  monthlyVolume?: number;

  /**
   * Informações fiscais e contábeis do negócio
   */
  businessInfo?: {
    /**
     * Regime tributário da empresa
     * @example 'simples_nacional', 'lucro_presumido', 'lucro_real'
     */
    taxRegime: string;

    /**
     * Tipo de negócio
     * @example 'comercio', 'industria', 'service'
     */
    businessType: string;

    /**
     * Margem média praticada no negócio (%)
     * @example 28
     */
    averageMargin: number;
  };
}

/**
 * Recomendação inteligente de precificação
 * 
 * Resultado completo da análise com preço recomendado, nível de confiança,
 * explicações detalhadas, cenários alternativos, alertas e otimizações.
 * 
 * @example
 * ```typescript
 * const recommendation: SmartPricingRecommendation = {
 *   recommendedPrice: 4599.99,
 *   confidence: 85,
 *   reasoning: [
 *     '💰 Preço base: R$ 4326.00 (custo + impostos + margem)',
 *     '📊 Ajuste competitivo: +5.2% (mercado permite premium)',
 *     '🎯 Ajuste de mercado: +6.3% (sazonalidade alta + B2C)',
 *     '📦 Ajuste de volume: +1.0% (estoque médio)',
 *     '🎨 Arredondamento psicológico: R$ 4599.99'
 *   ],
 *   alternatives: [
 *     {
 *       scenario: 'Competitivo',
 *       price: 4139.99,
 *       pros: ['Maior volume de vendas', 'Competitivo no mercado'],
 *       cons: ['Margem reduzida', 'Pode gerar guerra de preços']
 *     }
 *   ],
 *   warnings: [
 *     '⚠️ Margem de 22% está abaixo da média do negócio (28%)'
 *   ],
 *   optimizations: [
 *     '🔍 Monitore preços dos concorrentes semanalmente',
 *     '🧪 Teste preço premium (R$ 4999) com público B2B',
 *     '📊 Aumente estoque para 100 unidades antes da alta temporada'
 *   ]
 * };
 * ```
 */
export interface SmartPricingRecommendation {
  /**
   * Preço final recomendado após todas as análises
   * @example 4599.99
   */
  recommendedPrice: number;

  /**
   * Nível de confiança da recomendação (0-100%)
   * 
   * Base: 60%
   * +10% se tem dados de concorrentes
   * +10% se tem histórico de volume
   * +10% se tem dados de estoque
   * +10% se mercado é uniforme/competitivo
   * 
   * @example 85
   */
  confidence: number;

  /**
   * Explicação passo-a-passo de como o preço foi calculado
   * 
   * Inclui:
   * - Preço base (custo + impostos + margem)
   * - Ajustes competitivos
   * - Ajustes de mercado
   * - Ajustes de volume
   * - Arredondamento psicológico
   * 
   * @example ['💰 Preço base: R$ 100.00', '📊 Ajuste competitivo: +5%']
   */
  reasoning: string[];

  /**
   * Cenários alternativos de precificação
   * 
   * Geralmente 3 cenários:
   * - Competitivo: -10% (foco em volume)
   * - Premium: +10% (foco em margem)
   * - Penetração: -20% (entrada agressiva)
   * 
   * @example [{ scenario: 'Premium', price: 5059.99, pros: [...], cons: [...] }]
   */
  alternatives: PricingAlternative[];

  /**
   * Alertas sobre riscos ou problemas detectados
   * 
   * Alertas disparados quando:
   * - Margem < 15%
   * - Preço > 115% da média do mercado
   * - Volume mensal < 10 unidades
   * 
   * @example ['⚠️ Margem de 12% está muito baixa']
   */
  warnings: string[];

  /**
   * Sugestões acionáveis para otimizar a estratégia de preço
   * 
   * Incluem:
   * - Monitoramento de concorrentes
   * - Testes A/B
   * - Negociação com fornecedores
   * - Ajustes de estoque
   * - Mudanças de posicionamento
   * 
   * @example ['🔍 Monitore preços dos concorrentes semanalmente']
   */
  optimizations: string[];
}

/**
 * Cenário alternativo de precificação
 * 
 * Representa uma estratégia diferente com preço, prós e contras.
 * Permite ao usuário comparar diferentes abordagens de pricing.
 * 
 * @example
 * ```typescript
 * const alternative: PricingAlternative = {
 *   scenario: 'Penetração de Mercado',
 *   price: 3679.99,  // -20% do recomendado
 *   pros: [
 *     '🚀 Entrada agressiva no mercado',
 *     '📈 Maior volume de vendas esperado',
 *     '👥 Atrai novos clientes rapidamente'
 *   ],
 *   cons: [
 *     '📉 Margem significativamente reduzida (18%)',
 *     '⚠️ Pode ser difícil aumentar preço depois',
 *     '💸 Menor lucro por unidade vendida'
 *   ]
 * };
 * ```
 */
export interface PricingAlternative {
  /**
   * Preço sugerido para este cenário
   * @example 3679.99
   */
  price: number;

  /**
   * Nome do cenário/estratégia
   * @example 'Competitivo', 'Premium', 'Penetração de Mercado'
   */
  scenario: string;

  /**
   * Vantagens desta estratégia
   * @example ['🚀 Entrada agressiva', '📈 Maior volume']
   */
  pros: string[];

  /**
   * Desvantagens/riscos desta estratégia
   * @example ['📉 Margem reduzida', '⚠️ Difícil aumentar depois']
   */
  cons: string[];
}

/**
 * Resultado da análise de concorrência
 * 
 * Contém dados agregados dos preços praticados por concorrentes
 * e o posicionamento relativo do produto no mercado.
 * 
 * @example
 * ```typescript
 * const analysis: CompetitorAnalysisResult = {
 *   competitors: [
 *     { source: 'Amazon', price: 4299.00, url: 'https://...' },
 *     { source: 'Magazine Luiza', price: 4499.00, url: 'https://...' },
 *     { source: 'Mercado Livre', price: 4199.00, url: 'https://...' }
 *   ],
 *   averagePrice: 4332.33,
 *   priceRange: { min: 4199.00, max: 4499.00 },
 *   competitivePosition: 'competitivo'  // uniforme | competitivo | segmentado
 * };
 * ```
 */
export interface CompetitorAnalysisResult {
  /**
   * Lista de preços encontrados em concorrentes
   * @example [{ source: 'Amazon', price: 4299.00, url: '...' }]
   */
  competitors: CompetitorPricing[];

  /**
   * Preço médio do mercado
   * @example 4332.33
   */
  averagePrice: number;

  /**
   * Faixa de preços (mínimo e máximo)
   * @example { min: 4199.00, max: 4499.00 }
   */
  priceRange: { min: number; max: number };

  /**
   * Posicionamento competitivo do mercado
   * 
   * - uniforme: Preços muito próximos (< 10% variação)
   * - competitivo: Preços variados mas razoáveis (10-30% variação)
   * - segmentado: Grande variação de preços (> 30% variação)
   * 
   * @example 'competitivo'
   */
  competitivePosition: string;
}

/**
 * Resultado da análise de fatores de mercado
 * 
 * Contém multiplicadores calculados com base em sazonalidade,
 * público-alvo e categoria do produto.
 * 
 * @example
 * ```typescript
 * const analysis: MarketAnalysisResult = {
 *   seasonalityMultiplier: 1.15,    // +15% (alta temporada)
 *   audienceMultiplier: 1.0,        // B2C padrão
 *   categoryMultiplier: 1.05,       // +5% (eletrônicos premium)
 *   insights: [
 *     '📈 Sazonalidade alta: +15% no preço',
 *     '🎯 Público B2C: sem ajuste',
 *     '💻 Categoria eletrônicos: +5%'
 *   ]
 * };
 * ```
 */
export interface MarketAnalysisResult {
  /**
   * Multiplicador de sazonalidade (1.0 - 1.15)
   * 
   * - high: 1.15 (Black Friday, Natal, etc.)
   * - medium: 1.07
   * - low: 1.0 (demanda constante)
   * 
   * @example 1.15
   */
  seasonalityMultiplier: number;

  /**
   * Multiplicador de público-alvo (1.0 - 1.2)
   * 
   * - B2C: 1.0 (consumidor final)
   * - B2B: 1.2 (empresas pagam mais)
   * 
   * @example 1.2
   */
  audienceMultiplier: number;

  /**
   * Multiplicador de categoria (0.95 - 1.15)
   * 
   * Ajustes específicos por tipo de produto:
   * - Alimentos: 0.95 (margem apertada)
   * - Eletrônicos: 1.05 (margem média)
   * - Moda: 1.1 (margem alta)
   * - Beleza: 1.15 (margem muito alta)
   * 
   * @example 1.05
   */
  categoryMultiplier: number;

  /**
   * Insights e explicações dos ajustes
   * @example ['📈 Sazonalidade alta: +15% no preço']
   */
  insights: string[];
}

/**
 * Resultado da análise de volume e elasticidade
 * 
 * Avalia o histórico de vendas e estoque para determinar
 * ajustes de preço baseados em volume.
 * 
 * @example
 * ```typescript
 * const analysis: VolumeAnalysisResult = {
 *   volumeScore: 7,           // Escala 0-10
 *   elasticityFactor: 1.02,   // +2% ajuste
 *   volumeInsights: [
 *     '📊 Volume mensal de 50 unidades indica demanda saudável',
 *     '📦 Estoque de 200 unidades está adequado',
 *     '💡 Elasticidade baixa permite ajuste +2% no preço'
 *   ]
 * };
 * ```
 */
export interface VolumeAnalysisResult {
  /**
   * Score de volume (0-10)
   * 
   * Baseado em vendas mensais:
   * - < 10: Score baixo (1-3)
   * - 10-50: Score médio (4-7)
   * - > 50: Score alto (8-10)
   * 
   * @example 7
   */
  volumeScore: number;

  /**
   * Fator de elasticidade (0.95 - 1.05)
   * 
   * Baseado em estoque vs volume:
   * - Estoque baixo (< 2x volume): 1.05 (+5% preço)
   * - Estoque médio: 1.0 (sem ajuste)
   * - Estoque alto (> 5x volume): 0.95 (-5% preço)
   * 
   * @example 1.02
   */
  elasticityFactor: number;

  /**
   * Insights sobre volume e elasticidade
   * @example ['📊 Volume mensal de 50 unidades indica demanda saudável']
   */
  volumeInsights: string[];
}

/**
 * Análise de impacto de mudança de preço
 * 
 * Simula o efeito de alterar o preço atual para um novo valor,
 * considerando elasticidade de demanda e impacto em volume, receita e margem.
 * 
 * @example
 * ```typescript
 * // Simulação: R$ 100 → R$ 115 (+15%)
 * const impact: PriceImpactAnalysis = {
 *   volumeImpact: -12.0,      // -12% nas vendas
 *   revenueImpact: +1.2,      // +1.2% na receita total
 *   marginImpact: +3.5,       // +3.5 pontos percentuais
 *   recommendations: [
 *     '✅ Aumento de preço viável: receita cresce apesar da queda de volume',
 *     '⚠️ Monitore volume nas próximas 2 semanas',
 *     '💡 Considere aumentar gradualmente (+5% por mês)'
 *   ]
 * };
 * 
 * console.log('📊 Simulação: Preço +15%');
 * console.log(`Volume: ${impact.volumeImpact}%`);
 * console.log(`Receita: +${impact.revenueImpact}%`);
 * console.log(`Margem: +${impact.marginImpact}pp`);
 * ```
 */
export interface PriceImpactAnalysis {
  /**
   * Impacto percentual no volume de vendas
   * 
   * Calculado usando elasticidade de demanda:
   * volumeImpact = elasticidade × mudança_de_preço
   * 
   * Valores negativos = redução de vendas
   * Valores positivos = aumento de vendas
   * 
   * @example -12.0  // -12% nas vendas
   */
  volumeImpact: number;

  /**
   * Impacto percentual na receita total
   * 
   * Calculado como:
   * revenueImpact = (1 + priceChange) × (1 + volumeImpact) - 1
   * 
   * Considera tanto mudança de preço quanto mudança de volume.
   * 
   * @example 1.2  // +1.2% na receita
   */
  revenueImpact: number;

  /**
   * Impacto na margem de lucro (pontos percentuais)
   * 
   * Diferença absoluta na margem:
   * marginImpact = margem_nova - margem_atual
   * 
   * @example 3.5  // Margem aumenta 3.5pp (ex: 25% → 28.5%)
   */
  marginImpact: number;

  /**
   * Recomendações baseadas no impacto simulado
   * 
   * Alertas disparados quando:
   * - Receita cai mais de 5%
   * - Volume cai mais de 20%
   * - Margem sobe mais de 5pp (pode estar muito alto)
   * 
   * @example ['✅ Aumento viável', '⚠️ Monitore volume']
   */
  recommendations: string[];
}

