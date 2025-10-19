/**
 * Recommendation Module
 * Generates smart pricing recommendations with reasoning
 */

import { PricingAnalysis } from '@/shared/types/ai';
import { adjustPriceForCompetition, calculateFinalPrice, calculateMargin, getPositionDescription, roundToNicePrice } from './calculation';
import { CompetitorAnalysisResult, MarketAnalysisResult, SmartPricingInput, SmartPricingRecommendation, VolumeAnalysisResult } from './types';

/**
 * Gera recomendação inteligente de precificação completa
 * 
 * Combina análises de custos, concorrência, mercado e volume para produzir
 * uma recomendação final de preço com reasoning detalhado, alternativas,
 * avisos e otimizações.
 * 
 * @param basicAnalysis - Análise básica de custos e impostos
 * @param competitorAnalysis - Análise de concorrentes e posicionamento
 * @param marketAnalysis - Análise de fatores de mercado (sazonalidade, etc.)
 * @param volumeAnalysis - Análise de volume e elasticidade
 * @param input - Dados originais de entrada
 * @returns Recomendação completa com preço, confiança, reasoning e alternativas
 * 
 * @example
 * ```typescript
 * // Combinar todas as análises
 * const basicAnalysis = await performBasicAnalysis(input);
 * const competitorAnalysis = await analyzeCompetition(input.productName);
 * const marketAnalysis = analyzeMarketFactors(input);
 * const volumeAnalysis = analyzeVolumeElasticity(input);
 * 
 * const recommendation = generateSmartRecommendation(
 *   basicAnalysis,
 *   competitorAnalysis,
 *   marketAnalysis,
 *   volumeAnalysis,
 *   input
 * );
 * 
 * console.log(`💰 Preço recomendado: R$ ${recommendation.recommendedPrice.toFixed(2)}`);
 * console.log(`🎯 Confiança: ${recommendation.confidence}%`);
 * 
 * // Reasoning detalhado
 * console.log('\n📋 Reasoning:');
 * recommendation.reasoning.forEach(r => console.log(r));
 * // Output:
 * // 💰 Preço base calculado: R$ 85.50
 * // 🔍 Preço médio dos concorrentes: R$ 89.00
 * // 📊 Posicionamento: Competitivo
 * // 💡 Margem líquida estimada: 42.0%
 * 
 * // Alternativas
 * console.log('\n🔀 Alternativas:');
 * recommendation.alternatives.forEach(alt => {
 *   console.log(`${alt.scenario}: R$ ${alt.price.toFixed(2)}`);
 *   console.log(`  Prós: ${alt.pros.join(', ')}`);
 * });
 * 
 * // Avisos
 * if (recommendation.warnings.length > 0) {
 *   console.log('\n⚠️ Avisos:');
 *   recommendation.warnings.forEach(w => console.log(w));
 * }
 * 
 * // Otimizações
 * console.log('\n🚀 Otimizações sugeridas:');
 * recommendation.optimizations.forEach(o => console.log(o));
 * ```
 * 
 * @remarks
 * **Pipeline de cálculo**:
 * 1. **Base**: Pega preço do basicAnalysis (custo + impostos + margem)
 * 2. **Ajustes de mercado**: Aplica multiplicadores de marketAnalysis
 * 3. **Ajustes de volume**: Aplica scores de volumeAnalysis
 * 4. **Ajuste competitivo**: Compara com competitorAnalysis e ajusta
 * 5. **Arredondamento**: Aplica roundToNicePrice() para preço psicológico
 * 
 * **Componentes da recomendação**:
 * - **recommendedPrice**: Preço final calculado (arredondado)
 * - **confidence**: 0-100% baseado em dados disponíveis
 * - **reasoning**: 5-8 pontos explicando o preço
 * - **alternatives**: 3 cenários (competitivo -10%, premium +10%, penetração -20%)
 * - **warnings**: Alertas sobre margem baixa, preço alto, volume baixo
 * - **optimizations**: 5-7 sugestões acionáveis
 * 
 * **Confiança calculada**:
 * - Base: 60%
 * - +10% se tem dados de concorrentes
 * - +10% se tem volume histórico
 * - +10% se tem inventory data
 * - +10% se mercado é uniforme/competitivo
 * - Máximo: 100%
 * 
 * **Uso típico**:
 * Esta é a função principal do SmartPricingService - consolida todas
 * as análises anteriores em uma recomendação final executável.
 */
export function generateSmartRecommendation(
  basicAnalysis: PricingAnalysis,
  competitorAnalysis: CompetitorAnalysisResult,
  marketAnalysis: MarketAnalysisResult,
  volumeAnalysis: VolumeAnalysisResult,
  input: SmartPricingInput
): SmartPricingRecommendation {
  
  const basePrice = basicAnalysis.suggestedPrice;
  
  const calculatedPrice = calculateFinalPrice(basePrice, marketAnalysis, volumeAnalysis);
  
  const { price: adjustedPrice, confidence } = adjustPriceForCompetition(
    calculatedPrice,
    competitorAnalysis
  );

  const finalPrice = roundToNicePrice(adjustedPrice);

  const reasoning = generateReasoning(
    basicAnalysis,
    competitorAnalysis,
    marketAnalysis,
    volumeAnalysis,
    finalPrice,
    input
  );

  const alternatives = generateAlternatives(finalPrice, input);

  const warnings = generateWarnings(finalPrice, input, competitorAnalysis);
  const optimizations = generateOptimizations(input, competitorAnalysis);

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
 * Gera reasoning (raciocínio) detalhado para o preço recomendado
 * 
 * Explica passo a passo como o preço foi calculado, incluindo base de custo,
 * comparação com concorrentes, fatores de mercado e margem final.
 * 
 * @param basicAnalysis - Análise básica com preço base
 * @param competitorAnalysis - Dados de concorrentes
 * @param marketAnalysis - Insights de mercado
 * @param volumeAnalysis - Insights de volume
 * @param finalPrice - Preço final calculado
 * @param input - Dados originais de entrada
 * @returns Array de strings explicando o preço
 * 
 * @example
 * ```typescript
 * const reasoning = generateReasoning(
 *   basicAnalysis,
 *   competitorAnalysis,
 *   marketAnalysis,
 *   volumeAnalysis,
 *   89.90,
 *   input
 * );
 * 
 * reasoning.forEach(line => console.log(line));
 * // Output típico:
 * // 💰 Preço base calculado: R$ 85.50 (custo + impostos + margem)
 * // 🔍 Preço médio dos concorrentes: R$ 89.00
 * // 📊 Posicionamento: Competitivo
 * // 📈 Produto com alta sazonalidade - aproveite os picos de demanda
 * // 📊 Alto volume de vendas sustenta preços premium
 * // 💡 Margem líquida estimada: 42.0%
 * ```
 * 
 * @remarks
 * **Estrutura do reasoning** (5-8 pontos):
 * 
 * 1. **Preço base** (sempre):
 *    - "💰 Preço base calculado: R$ X.XX (custo + impostos + margem)"
 * 
 * 2. **Comparação competitiva** (se houver concorrentes):
 *    - "🔍 Preço médio dos concorrentes: R$ X.XX"
 *    - "📊 Posicionamento: [Abaixo/Competitivo/Premium]"
 * 
 * 3. **Insights de mercado** (se houver):
 *    - Cada insight do marketAnalysis com emoji 📈
 *    - Exemplos: sazonalidade, público B2B, categoria
 * 
 * 4. **Insights de volume** (se houver):
 *    - Cada insight do volumeAnalysis com emoji 📊
 *    - Exemplos: alto/baixo volume, estoque
 * 
 * 5. **Margem final** (sempre):
 *    - "💡 Margem líquida estimada: X.X%"
 *    - Calculada: ((finalPrice - costPrice) / finalPrice) * 100
 * 
 * **Uso de emojis**:
 * - 💰 Preço/dinheiro
 * - 🔍 Análise/pesquisa
 * - 📊 Dados/estatísticas
 * - 📈 Crescimento/mercado
 * - 💡 Insight/conclusão
 * 
 * **Chamada interna**:
 * Usado por `generateSmartRecommendation()` para criar campo `reasoning`
 */
function generateReasoning(
  basicAnalysis: PricingAnalysis,
  competitorAnalysis: CompetitorAnalysisResult,
  marketAnalysis: MarketAnalysisResult,
  volumeAnalysis: VolumeAnalysisResult,
  finalPrice: number,
  input: SmartPricingInput
): string[] {
  const reasoning: string[] = [];
  
  reasoning.push(`💰 Preço base calculado: R$ ${basicAnalysis.suggestedPrice.toFixed(2)} (custo + impostos + margem)`);
  
  if (competitorAnalysis.competitors.length > 0) {
    reasoning.push(`🔍 Preço médio dos concorrentes: R$ ${competitorAnalysis.averagePrice.toFixed(2)}`);
    reasoning.push(`📊 Posicionamento: ${getPositionDescription(finalPrice, competitorAnalysis.averagePrice)}`);
  }

  if (marketAnalysis.insights.length > 0) {
    reasoning.push(...marketAnalysis.insights.map((insight: string) => `📈 ${insight}`));
  }

  if (volumeAnalysis.volumeInsights.length > 0) {
    reasoning.push(...volumeAnalysis.volumeInsights.map((insight: string) => `📊 ${insight}`));
  }

  const margin = calculateMargin(finalPrice, input.costPrice);
  reasoning.push(`💡 Margem líquida estimada: ${margin.toFixed(1)}%`);

  return reasoning;
}

/**
 * Gera cenários alternativos de precificação
 * 
 * Cria 3 estratégias alternativas ao preço base: competitivo (-10%),
 * premium (+10%) e penetração (-20%), cada um com prós e contras.
 * 
 * @param basePrice - Preço base calculado
 * @param _input - Dados de entrada (reservado para uso futuro)
 * @returns Array com 3 cenários alternativos
 * 
 * @example
 * ```typescript
 * const alternatives = generateAlternatives(100.00, input);
 * 
 * alternatives.forEach(alt => {
 *   console.log(`\n${alt.scenario}`);
 *   console.log(`Preço: R$ ${alt.price.toFixed(2)}`);
 *   console.log('Prós:', alt.pros.join(' | '));
 *   console.log('Contras:', alt.cons.join(' | '));
 * });
 * 
 * // Output:
 * // Preço Competitivo (-10%)
 * // Preço: R$ 90.00
 * // Prós: Maior volume de vendas | Melhor posicionamento vs concorrentes | ...
 * // Contras: Menor margem de lucro | Pode criar guerra de preços | ...
 * 
 * // Preço Premium (+10%)
 * // Preço: R$ 110.00
 * // Prós: Maior margem de lucro | Posicionamento de qualidade | ...
 * // Contras: Menor volume potencial | Exige melhor diferenciação | ...
 * 
 * // Estratégia Penetração (-20%)
 * // Preço: R$ 80.00
 * // Prós: Conquista rápida de mercado | Alto volume | ...
 * // Contras: Margem muito baixa | Difícil aumentar preço depois | ...
 * ```
 * 
 * @remarks
 * **Cenário 1: Competitivo (-10%)**:
 * - Preço: basePrice * 0.9
 * - Estratégia: Ganhar market share rapidamente
 * - **Prós**:
 *   * Maior volume de vendas
 *   * Melhor posicionamento vs concorrentes
 *   * Entrada rápida no mercado
 * - **Contras**:
 *   * Menor margem de lucro
 *   * Pode criar guerra de preços
 *   * Menos recursos para marketing
 * - **Quando usar**: Entrada em mercado novo, alta competição
 * 
 * **Cenário 2: Premium (+10%)**:
 * - Preço: basePrice * 1.1
 * - Estratégia: Posicionamento de qualidade/exclusividade
 * - **Prós**:
 *   * Maior margem de lucro
 *   * Posicionamento de qualidade
 *   * Mais recursos para investimento
 * - **Contras**:
 *   * Menor volume potencial
 *   * Exige melhor diferenciação
 *   * Competição com marcas estabelecidas
 * - **Quando usar**: Produto diferenciado, marca forte, público B2B
 * 
 * **Cenário 3: Penetração (-20%)**:
 * - Preço: basePrice * 0.8
 * - Estratégia: Conquistar mercado agressivamente
 * - **Prós**:
 *   * Conquista rápida de mercado
 *   * Alto volume
 *   * Barreira à entrada de concorrentes
 * - **Contras**:
 *   * Margem muito baixa
 *   * Difícil aumentar preço depois
 *   * Risco de prejuízo
 * - **Quando usar**: Lançamento de produto, liquidação, alta sazonalidade
 * 
 * **Arredondamento**:
 * Todos os preços são arredondados com `roundToNicePrice()` para
 * valores psicologicamente atrativos (ex: R$ 89.90 em vez de R$ 89.73)
 * 
 * **Parâmetro _input**:
 * Prefixado com `_` porque não é usado atualmente, mas está na assinatura
 * para futuras personalizações (ex: ajustar % baseado em categoria)
 */
function generateAlternatives(basePrice: number, _input: SmartPricingInput) {
  return [
    {
      price: roundToNicePrice(basePrice * 0.9),
      scenario: 'Preço Competitivo (-10%)',
      pros: ['Maior volume de vendas', 'Melhor posicionamento vs concorrentes', 'Entrada rápida no mercado'],
      cons: ['Menor margem de lucro', 'Pode criar guerra de preços', 'Menos recursos para marketing']
    },
    {
      price: roundToNicePrice(basePrice * 1.1),
      scenario: 'Preço Premium (+10%)',
      pros: ['Maior margem de lucro', 'Posicionamento de qualidade', 'Mais recursos para investimento'],
      cons: ['Menor volume potencial', 'Exige melhor diferenciação', 'Competição com marcas estabelecidas']
    },
    {
      price: roundToNicePrice(basePrice * 0.8),
      scenario: 'Estratégia Penetração (-20%)',
      pros: ['Conquista rápida de mercado', 'Alto volume', 'Barreira à entrada de concorrentes'],
      cons: ['Margem muito baixa', 'Difícil aumentar preço depois', 'Risco de prejuízo']
    }
  ];
}

/**
 * Gera avisos sobre possíveis problemas no preço recomendado
 * 
 * Identifica riscos como margem muito baixa, preço muito acima da concorrência
 * ou volume insuficiente, alertando o usuário para cuidados especiais.
 * 
 * @param price - Preço final recomendado
 * @param input - Dados originais de entrada
 * @param competitorAnalysis - Análise de concorrentes
 * @returns Array com avisos (pode estar vazio se sem problemas)
 * 
 * @example
 * ```typescript
 * // Cenário 1: Margem baixa + preço alto
 * const warnings1 = generateWarnings(120.00, {
 *   costPrice: 110.00,  // Margem de apenas ~8%
 *   monthlyVolume: 50
 * }, {
 *   averagePrice: 100.00,
 *   // ... outros campos
 * });
 * 
 * warnings1.forEach(w => console.log(w));
 * // Output:
 * // ⚠️ Margem baixa - monitore custos variáveis e volume mínimo
 * // ⚠️ Preço 15% acima da média - garanta diferenciação clara
 * 
 * // Cenário 2: Volume muito baixo
 * const warnings2 = generateWarnings(100.00, {
 *   costPrice: 50.00,   // Margem boa (50%)
 *   monthlyVolume: 5    // Apenas 5 vendas/mês
 * }, { averagePrice: 95 });
 * 
 * warnings2.forEach(w => console.log(w));
 * // Output:
 * // ⚠️ Volume baixo - considere investir em marketing para aumentar demanda
 * 
 * // Cenário 3: Sem problemas
 * const warnings3 = generateWarnings(100.00, {
 *   costPrice: 50.00,   // Margem boa (50%)
 *   monthlyVolume: 100  // Volume saudável
 * }, { averagePrice: 105 });
 * 
 * console.log(warnings3.length); // 0 - sem avisos
 * ```
 * 
 * @remarks
 * **Avisos gerados**:
 * 
 * **1. Margem baixa** (< 15%):
 * - Condição: `((price - costPrice) / price) * 100 < 15`
 * - Aviso: "⚠️ Margem baixa - monitore custos variáveis e volume mínimo"
 * - Risco:
 *   * Vulnerável a variações de custo
 *   * Pouca margem para promoções
 *   * Precisa volume alto para viabilidade
 * - Ação recomendada:
 *   * Revisar estrutura de custos
 *   * Negociar com fornecedores
 *   * Garantir volume mínimo de vendas
 * 
 * **2. Preço muito alto** (> 15% acima da média):
 * - Condição: `price > averageCompetitor * 1.15`
 * - Aviso: "⚠️ Preço 15% acima da média - garanta diferenciação clara"
 * - Risco:
 *   * Perda de vendas para concorrentes
 *   * Cliente pode não perceber valor
 *   * Exige forte proposta de valor
 * - Ação recomendada:
 *   * Destacar diferenciais únicos
 *   * Investir em branding
 *   * Considerar serviços agregados
 * 
 * **3. Volume muito baixo** (< 10 unidades/mês):
 * - Condição: `monthlyVolume < 10`
 * - Aviso: "⚠️ Volume baixo - considere investir em marketing para aumentar demanda"
 * - Risco:
 *   * Receita insuficiente
 *   * Alto custo por venda
 *   * Difícil sustentar operação
 * - Ação recomendada:
 *   * Investir em marketing
 *   * Melhorar SEO/visibilidade
 *   * Considerar marketplaces
 * 
 * **Retorno vazio**:
 * Se nenhuma condição for atendida, retorna array vazio `[]`
 * 
 * **Priorização**:
 * Avisos são independentes - pode retornar 0, 1, 2 ou 3 avisos
 * dependendo das condições atendidas
 */
function generateWarnings(
  price: number,
  input: SmartPricingInput,
  competitorAnalysis: CompetitorAnalysisResult
): string[] {
  const warnings: string[] = [];
  
  const margin = calculateMargin(price, input.costPrice);
  
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
 * Gera sugestões de otimização para melhorar a estratégia de precificação
 * 
 * Fornece ações práticas para maximizar receita, reduzir custos e melhorar
 * competitividade, adaptadas ao contexto do negócio.
 * 
 * @param input - Dados originais de entrada
 * @param competitorAnalysis - Análise de concorrentes
 * @returns Array com 5-7 sugestões de otimização
 * 
 * @example
 * ```typescript
 * // Cenário B2B com concorrentes
 * const optimizations = generateOptimizations({
 *   targetAudience: 'b2b',
 *   // ... outros campos
 * }, {
 *   competitors: [/* ... 5 concorrentes ... *\/],
 *   // ...
 * });
 * 
 * console.log('🚀 Sugestões de otimização:');
 * optimizations.forEach((opt, i) => {
 *   console.log(`${i + 1}. ${opt}`);
 * });
 * 
 * // Output típico:
 * // 1. 🔄 Monitore preços dos concorrentes semanalmente
 * // 2. 📊 Teste diferentes preços com A/B testing
 * // 3. 💰 Negocie melhores condições com fornecedores
 * // 4. 🎯 Identifique diferenciais únicos para justificar preço premium
 * // 5. 📝 Considere pacotes ou contratos para aumentar ticket médio
 * // 6. 📈 Implemente precificação dinâmica para sazonalidade
 * ```
 * 
 * @remarks
 * **Sugestões padrão** (sempre incluídas - 6 itens):
 * 
 * 1. **"🔄 Monitore preços dos concorrentes semanalmente"**
 *    - Importância: Manter competitividade
 *    - Ação: Configurar alerts de mudança de preço
 *    - Ferramenta: Web scraping, price tracking tools
 * 
 * 2. **"📊 Teste diferentes preços com A/B testing"**
 *    - Importância: Descobrir preço ótimo empiricamente
 *    - Ação: Dividir tráfego entre 2-3 preços
 *    - Métrica: Conversão × Revenue por variação
 * 
 * 3. **"💰 Negocie melhores condições com fornecedores"**
 *    - Importância: Reduzir custo, aumentar margem
 *    - Ação: Negociar volume, prazo, desconto
 *    - Impacto: 5-15% redução de custo típica
 * 
 * 4. **"🎯 Identifique diferenciais únicos..."** (se houver concorrentes)
 *    - Condição: `competitors.length > 0`
 *    - Importância: Justificar preço premium
 *    - Ação: Destacar qualidade, serviço, garantia
 *    - Exemplos: Entrega rápida, suporte 24/7, exclusividade
 * 
 * 5. **"📝 Considere pacotes ou contratos..."** (se B2B)
 *    - Condição: `targetAudience === 'b2b'`
 *    - Importância: Aumentar ticket médio e retenção
 *    - Ação: Criar bundles, contratos anuais, volume discount
 *    - Benefício: LTV maior, receita previsível
 * 
 * 6. **"📈 Implemente precificação dinâmica para sazonalidade"**
 *    - Importância: Maximizar receita em alta demanda
 *    - Ação: Regras de preço por período/evento
 *    - Exemplos: Black Friday, Natal, férias
 * 
 * **Otimizações condicionais**:
 * - **Com concorrentes**: Adiciona sugestão de diferenciação
 * - **B2B**: Adiciona sugestão de pacotes/contratos
 * 
 * **Total de sugestões**:
 * - Mínimo: 5 (sem concorrentes, B2C)
 * - Máximo: 7 (com concorrentes, B2B)
 * 
 * **Ordem de prioridade**:
 * As sugestões são ordenadas por impacto esperado:
 * 1. Monitoramento (base)
 * 2. Testes (descoberta)
 * 3. Negociação (custo)
 * 4. Diferenciação (valor)
 * 5. Pacotes (B2B)
 * 6. Dinamicidade (avançado)
 * 
 * **Implementação típica**:
 * ```typescript
 * // Exibir como checklist acionável
 * optimizations.forEach(opt => {
 *   console.log(`[ ] ${opt}`);
 * });
 * ```
 */
function generateOptimizations(
  input: SmartPricingInput,
  competitorAnalysis: CompetitorAnalysisResult
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
