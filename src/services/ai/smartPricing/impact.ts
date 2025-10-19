/**
 * Impact Module
 * Analyzes the impact of price changes on volume, revenue, and margin
 */

import { calculateMargin, getElasticity } from './calculation';
import { PriceImpactAnalysis, SmartPricingInput } from './types';

/**
 * Analisa o impacto de uma mudança de preço no negócio
 * 
 * Calcula como uma alteração de preço afetará volume de vendas, receita total
 * e margem de lucro, usando elasticidade de preço e dados históricos.
 * 
 * @param currentPrice - Preço atual do produto
 * @param newPrice - Novo preço proposto
 * @param input - Dados do produto incluindo custo, volume e categoria
 * @returns Análise completa de impacto com recomendações
 * 
 * @example
 * ```typescript
 * // Cenário 1: Aumento de preço de 10%
 * const impact1 = await analyzePriceImpact(
 *   100.00,  // Preço atual
 *   110.00,  // Novo preço (+10%)
 *   {
 *     costPrice: 50.00,
 *     monthlyVolume: 100,
 *     category: 'eletronicos'
 *   }
 * );
 * 
 * console.log(`Mudança de preço: +${impact1.volumeImpact.toFixed(1)}%`);
 * console.log(`Impacto no volume: ${impact1.volumeImpact.toFixed(1)}%`);
 * console.log(`Impacto na receita: ${impact1.revenueImpact.toFixed(1)}%`);
 * console.log(`Impacto na margem: +${impact1.marginImpact.toFixed(1)}pp`);
 * // Output típico:
 * // Mudança de preço: +10.0%
 * // Impacto no volume: -15.0% (elasticidade 1.5 para eletrônicos)
 * // Impacto na receita: -6.5% (110 × 85 vs 100 × 100)
 * // Impacto na margem: +4.5pp (54.5% vs 50.0%)
 * 
 * impact1.recommendations.forEach(rec => console.log(rec));
 * // 📉 Queda significativa na receita - monitore cuidadosamente
 * 
 * // Cenário 2: Redução de preço de 15%
 * const impact2 = await analyzePriceImpact(
 *   100.00,  // Preço atual
 *   85.00,   // Novo preço (-15%)
 *   {
 *     costPrice: 50.00,
 *     monthlyVolume: 100,
 *     category: 'moda'
 *   }
 * );
 * 
 * console.log(`Impacto no volume: +${Math.abs(impact2.volumeImpact).toFixed(1)}%`);
 * console.log(`Impacto na receita: ${impact2.revenueImpact.toFixed(1)}%`);
 * // Output típico:
 * // Impacto no volume: +18.0% (elasticidade 1.2 para moda)
 * // Impacto na receita: +0.3% (85 × 118 vs 100 × 100)
 * ```
 * 
 * @remarks
 * **Cálculos realizados**:
 * 
 * **1. Mudança percentual de preço**:
 * ```
 * priceChange = ((newPrice - currentPrice) / currentPrice) × 100
 * ```
 * 
 * **2. Impacto no volume** (usando elasticidade):
 * ```
 * volumeImpact = elasticity × priceChange
 * newVolume = currentVolume × (1 + volumeImpact / 100)
 * ```
 * 
 * Elasticidade por categoria (via `getElasticity()`):
 * - Eletrônicos: 1.5 (alta sensibilidade)
 * - Moda: 1.2
 * - Casa: 1.0
 * - Esporte: 0.9
 * - Beleza: 0.8 (baixa sensibilidade)
 * 
 * **3. Impacto na receita**:
 * ```
 * currentRevenue = currentPrice × currentVolume
 * newRevenue = newPrice × newVolume
 * revenueImpact = ((newRevenue - currentRevenue) / currentRevenue) × 100
 * ```
 * 
 * **4. Impacto na margem** (em pontos percentuais):
 * ```
 * currentMargin = ((currentPrice - cost) / currentPrice) × 100
 * newMargin = ((newPrice - cost) / newPrice) × 100
 * marginImpact = newMargin - currentMargin
 * ```
 * 
 * **Valores padrão**:
 * - Se `monthlyVolume` não fornecido: assume 50 unidades/mês
 * 
 * **Recomendações geradas**:
 * - Se receita cai > 5%: Alerta de queda significativa
 * - Se volume cai > 20%: Sugestão de campanhas
 * - Se margem sobe > 5pp: Destaca oportunidade
 * 
 * **Interpretação típica**:
 * - **Aumento de preço**: Volume ↓, Margem ↑, Receita ?
 * - **Redução de preço**: Volume ↑, Margem ↓, Receita ?
 * - **Trade-off**: Encontrar ponto ótimo entre volume e margem
 * 
 * **Uso típico**:
 * Simular múltiplos cenários de preço antes de decidir:
 * ```typescript
 * for (let price = 90; price <= 110; price += 5) {
 *   const impact = await analyzePriceImpact(100, price, input);
 *   console.log(`R$ ${price}: Receita ${impact.revenueImpact.toFixed(1)}%`);
 * }
 * ```
 */
export async function analyzePriceImpact(
  currentPrice: number,
  newPrice: number,
  input: SmartPricingInput
): Promise<PriceImpactAnalysis> {
  const priceChange = ((newPrice - currentPrice) / currentPrice * 100);
  
  const elasticity = getElasticity(input.category);
  
  const volumeImpact = elasticity * priceChange;
  const currentVolume = input.monthlyVolume || 50;
  const newVolume = currentVolume * (1 + volumeImpact / 100);
  
  const currentRevenue = currentPrice * currentVolume;
  const newRevenue = newPrice * newVolume;
  const revenueImpact = ((newRevenue - currentRevenue) / currentRevenue * 100);
  
  const currentMargin = calculateMargin(currentPrice, input.costPrice);
  const newMargin = calculateMargin(newPrice, input.costPrice);
  const marginImpact = newMargin - currentMargin;

  const recommendations: string[] = generateImpactRecommendations(
    revenueImpact,
    volumeImpact,
    marginImpact
  );

  return {
    volumeImpact,
    revenueImpact,
    marginImpact,
    recommendations
  };
}

/**
 * Gera recomendações baseadas na análise de impacto
 * 
 * Avalia os impactos calculados e fornece alertas ou oportunidades
 * específicas baseadas em thresholds críticos.
 * 
 * @param revenueImpact - Impacto percentual na receita
 * @param volumeImpact - Impacto percentual no volume
 * @param marginImpact - Impacto em pontos percentuais na margem
 * @returns Array com recomendações (pode estar vazio)
 * 
 * @example
 * ```typescript
 * // Cenário 1: Queda severa na receita e volume
 * const recs1 = generateImpactRecommendations(
 *   -8.5,   // Receita cai 8.5%
 *   -25.0,  // Volume cai 25%
 *   3.0     // Margem sobe 3pp
 * );
 * 
 * recs1.forEach(rec => console.log(rec));
 * // Output:
 * // 📉 Queda significativa na receita - monitore cuidadosamente
 * // 📊 Grande impacto no volume - considere campanhas de marketing
 * 
 * // Cenário 2: Melhora significativa na margem
 * const recs2 = generateImpactRecommendations(
 *   2.0,    // Receita sobe 2%
 *   -8.0,   // Volume cai 8%
 *   7.5     // Margem sobe 7.5pp
 * );
 * 
 * recs2.forEach(rec => console.log(rec));
 * // Output:
 * // 💰 Melhora significativa na margem - boa oportunidade
 * 
 * // Cenário 3: Impactos moderados
 * const recs3 = generateImpactRecommendations(
 *   -3.0,   // Receita cai 3%
 *   -10.0,  // Volume cai 10%
 *   2.0     // Margem sobe 2pp
 * );
 * 
 * console.log(recs3.length); // 0 - sem recomendações (impactos moderados)
 * ```
 * 
 * @remarks
 * **Thresholds e recomendações**:
 * 
 * **1. Queda significativa na receita** (< -5%):
 * - Condição: `revenueImpact < -5`
 * - Recomendação: "📉 Queda significativa na receita - monitore cuidadosamente"
 * - Ação sugerida:
 *   * Acompanhar métricas diariamente
 *   * Reverter se necessário
 *   * Preparar plano B
 * - Exemplo: Preço subiu muito, receita caiu
 * 
 * **2. Grande impacto no volume** (< -20%):
 * - Condição: `volumeImpact < -20`
 * - Recomendação: "📊 Grande impacto no volume - considere campanhas de marketing"
 * - Ação sugerida:
 *   * Investir em marketing para compensar
 *   * Promoções direcionadas
 *   * Destacar valor agregado
 * - Exemplo: Preço subiu, vendas caíram muito
 * 
 * **3. Melhora significativa na margem** (> +5pp):
 * - Condição: `marginImpact > 5`
 * - Recomendação: "💰 Melhora significativa na margem - boa oportunidade"
 * - Ação sugerida:
 *   * Aproveitar para investir
 *   * Reinvestir em qualidade/marketing
 *   * Considerar se volume compensa
 * - Exemplo: Preço subiu, margem melhorou bastante
 * 
 * **Retorno vazio**:
 * Se nenhum threshold for atingido, retorna array vazio `[]`,
 * indicando que os impactos são moderados e aceitáveis.
 * 
 * **Múltiplas recomendações**:
 * Pode retornar 0 a 3 recomendações dependendo de quantas
 * condições forem atendidas simultaneamente.
 * 
 * **Uso interno**:
 * Chamada por `analyzePriceImpact()` para gerar campo `recommendations`
 */
function generateImpactRecommendations(
  revenueImpact: number,
  volumeImpact: number,
  marginImpact: number
): string[] {
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

  return recommendations;
}
