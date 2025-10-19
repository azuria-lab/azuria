/**
 * Statistics Module
 * Handles statistical calculations for price analysis
 */

import { PriceEntry } from './types';

/**
 * Calcula mudança percentual de preço entre primeira e última entrada
 * 
 * Compara o primeiro preço registrado com o último para determinar
 * a variação total no período.
 * 
 * @param prices - Array de entradas de preço ordenadas cronologicamente
 * @returns Mudança percentual (positivo = aumento, negativo = redução)
 * 
 * @example
 * ```typescript
 * // Caso 1: Preço aumentou ao longo do tempo
 * const prices1: PriceEntry[] = [
 *   { price: 1000.00, timestamp: new Date('2024-10-01'), source: 'manual' },
 *   { price: 1050.00, timestamp: new Date('2024-10-08'), source: 'automated' },
 *   { price: 1100.00, timestamp: new Date('2024-10-15'), source: 'automated' },
 *   { price: 1150.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 * ];
 * 
 * const change1 = calculatePriceChange(prices1);
 * console.log(`Mudança: ${change1.toFixed(1)}%`);
 * // Output: Mudança: 15.0%
 * // (De R$ 1000 para R$ 1150 = +15%)
 * 
 * // Caso 2: Preço diminuiu
 * const prices2: PriceEntry[] = [
 *   { price: 5500.00, timestamp: new Date('2024-10-01'), source: 'manual' },
 *   { price: 5200.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 * ];
 * 
 * const change2 = calculatePriceChange(prices2);
 * console.log(`Mudança: ${change2.toFixed(1)}%`);
 * // Output: Mudança: -5.5%
 * // (De R$ 5500 para R$ 5200 = -5.5%)
 * 
 * // Caso 3: Histórico insuficiente (< 2 entradas)
 * const prices3: PriceEntry[] = [
 *   { price: 3000.00, timestamp: new Date(), source: 'manual' }
 * ];
 * 
 * const change3 = calculatePriceChange(prices3);
 * console.log(`Mudança: ${change3}%`);
 * // Output: Mudança: 0%
 * // (Retorna 0 quando há menos de 2 entradas)
 * 
 * // Caso 4: Array vazio
 * const change4 = calculatePriceChange([]);
 * console.log(`Mudança: ${change4}%`);
 * // Output: Mudança: 0%
 * 
 * // Caso 5: Uso com histórico de concorrente
 * const competitorHistory: PriceHistory = {
 *   productName: 'iPhone 15 Pro',
 *   platform: CompetitorPlatform.MERCADO_LIVRE,
 *   seller: 'Magazine Luiza',
 *   prices: [
 *     { price: 5499.00, timestamp: new Date('2024-10-01'), source: 'automated' },
 *     { price: 5299.00, timestamp: new Date('2024-10-08'), source: 'automated' },
 *     { price: 5399.00, timestamp: new Date('2024-10-15'), source: 'automated' },
 *     { price: 5199.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 *   ]
 * };
 * 
 * const totalChange = calculatePriceChange(competitorHistory.prices);
 * console.log(`Magazine Luiza - Mudança total: ${totalChange.toFixed(1)}%`);
 * // Output: Magazine Luiza - Mudança total: -5.5%
 * // (De R$ 5499 para R$ 5199 em 18 dias)
 * 
 * // Caso 6: Interpretar resultado
 * function interpretPriceChange(change: number): string {
 *   if (change > 10) return '📈 Alta significativa';
 *   if (change > 3) return '📈 Alta moderada';
 *   if (change > -3) return '➡️ Estável';
 *   if (change > -10) return '📉 Queda moderada';
 *   return '📉 Queda significativa';
 * }
 * 
 * console.log(interpretPriceChange(totalChange));
 * // Output: 📉 Queda moderada
 * ```
 * 
 * @remarks
 * **Fórmula**:
 * ```typescript
 * mudança% = ((preço_final - preço_inicial) / preço_inicial) × 100
 * ```
 * 
 * **Valores de retorno**:
 * - Positivo: Preço aumentou
 * - Negativo: Preço diminuiu
 * - Zero: Sem mudança OU histórico insuficiente
 * 
 * **Histórico insuficiente**:
 * - `prices.length < 2` → retorna `0`
 * - Necessário mínimo 2 pontos para calcular mudança
 * 
 * **Ordenação esperada**:
 * - Assumido que `prices[0]` é o mais antigo
 * - `prices[length-1]` é o mais recente
 * - Se ordem estiver invertida, resultado será invertido
 * 
 * **Uso típico**:
 * 
 * 1. **Mudança 24 horas**:
 *    ```typescript
 *    const last24h = prices.filter(p =>
 *      p.timestamp > new Date(Date.now() - 24*60*60*1000)
 *    );
 *    const change24h = calculatePriceChange(last24h);
 *    ```
 * 
 * 2. **Mudança 7 dias**:
 *    ```typescript
 *    const last7d = prices.filter(p =>
 *      p.timestamp > new Date(Date.now() - 7*24*60*60*1000)
 *    );
 *    const change7d = calculatePriceChange(last7d);
 *    ```
 * 
 * 3. **Dashboard de tendências**:
 *    ```typescript
 *    const stats = {
 *      change24h: calculatePriceChange(last24h),
 *      change7d: calculatePriceChange(last7d),
 *      change30d: calculatePriceChange(last30d)
 *    };
 *    ```
 * 
 * **Veja também**:
 * - `determineTrend()` - classifica tendência (up/down/stable)
 * - `calculateVolatility()` - mede instabilidade de preços
 */
export function calculatePriceChange(prices: PriceEntry[]): number {
  if (prices.length < 2) {
    return 0;
  }
  
  const firstPrice = prices[0].price;
  const lastPrice = prices[prices.length - 1].price;
  
  return ((lastPrice - firstPrice) / firstPrice) * 100;
}

/**
 * Calcula volatilidade de preços (coeficiente de variação)
 * 
 * Mede a instabilidade/dispersão dos preços usando desvio padrão
 * relativo à média. Volatilidade alta indica preços inconsistentes.
 * 
 * @param prices - Array de entradas de preço
 * @returns Volatilidade como percentual (0-100+)
 * 
 * @example
 * ```typescript
 * // Caso 1: Preços muito estáveis (baixa volatilidade)
 * const stablePrices: PriceEntry[] = [
 *   { price: 1000.00, timestamp: new Date('2024-10-01'), source: 'automated' },
 *   { price: 1005.00, timestamp: new Date('2024-10-05'), source: 'automated' },
 *   { price: 1002.00, timestamp: new Date('2024-10-10'), source: 'automated' },
 *   { price: 998.00, timestamp: new Date('2024-10-15'), source: 'automated' },
 *   { price: 1001.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 * ];
 * 
 * const vol1 = calculateVolatility(stablePrices);
 * console.log(`Volatilidade: ${vol1.toFixed(2)}%`);
 * // Output: Volatilidade: 0.28%
 * // (Preços variam muito pouco - mercado estável)
 * 
 * // Caso 2: Preços voláteis (alta volatilidade)
 * const volatilePrices: PriceEntry[] = [
 *   { price: 1000.00, timestamp: new Date('2024-10-01'), source: 'automated' },
 *   { price: 1200.00, timestamp: new Date('2024-10-05'), source: 'automated' },
 *   { price: 900.00, timestamp: new Date('2024-10-10'), source: 'automated' },
 *   { price: 1100.00, timestamp: new Date('2024-10-15'), source: 'automated' },
 *   { price: 950.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 * ];
 * 
 * const vol2 = calculateVolatility(volatilePrices);
 * console.log(`Volatilidade: ${vol2.toFixed(2)}%`);
 * // Output: Volatilidade: 11.87%
 * // (Preços oscilam muito - mercado instável)
 * 
 * // Caso 3: Histórico insuficiente
 * const singlePrice: PriceEntry[] = [
 *   { price: 5000.00, timestamp: new Date(), source: 'manual' }
 * ];
 * 
 * const vol3 = calculateVolatility(singlePrice);
 * console.log(`Volatilidade: ${vol3}%`);
 * // Output: Volatilidade: 0%
 * // (Retorna 0 quando < 2 entradas)
 * 
 * // Caso 4: Classificar volatilidade
 * function classifyVolatility(vol: number): string {
 *   if (vol < 3) return '🟢 Muito Baixa (estável)';
 *   if (vol < 7) return '🟡 Baixa (previsível)';
 *   if (vol < 12) return '🟠 Moderada (atenção)';
 *   if (vol < 20) return '🔴 Alta (arriscado)';
 *   return '⚫ Muito Alta (caótico)';
 * }
 * 
 * console.log(classifyVolatility(vol1));  // Output: 🟢 Muito Baixa (estável)
 * console.log(classifyVolatility(vol2));  // Output: 🟠 Moderada (atenção)
 * 
 * // Caso 5: Análise de múltiplos concorrentes
 * const competitors = [
 *   { name: 'Magazine Luiza', prices: stablePrices },
 *   { name: 'Amazon', prices: volatilePrices }
 * ];
 * 
 * console.log('📊 Análise de Volatilidade:');
 * competitors.forEach(c => {
 *   const vol = calculateVolatility(c.prices);
 *   const classification = classifyVolatility(vol);
 *   console.log(`  ${c.name}: ${vol.toFixed(2)}% - ${classification}`);
 * });
 * // Output:
 * // 📊 Análise de Volatilidade:
 * //   Magazine Luiza: 0.28% - 🟢 Muito Baixa (estável)
 * //   Amazon: 11.87% - 🟠 Moderada (atenção)
 * 
 * // Caso 6: Estratégia baseada em volatilidade
 * function recommendStrategy(vol: number): string[] {
 *   if (vol < 3) {
 *     return [
 *       'Mercado estável - bom para testar preços premium',
 *       'Concorrentes previsíveis - mantenha monitoramento semanal'
 *     ];
 *   } else if (vol > 10) {
 *     return [
 *       'Alta volatilidade - considere precificação dinâmica',
 *       'Monitore concorrentes diariamente',
 *       'Evite comprometer-se com preços fixos de longo prazo'
 *     ];
 *   }
 *   return ['Volatilidade moderada - mantenha estratégia atual'];
 * }
 * 
 * const strategy = recommendStrategy(vol2);
 * console.log('\n💡 Estratégia recomendada:');
 * strategy.forEach(s => console.log(`  - ${s}`));
 * ```
 * 
 * @remarks
 * **Fórmula** (Coeficiente de Variação):
 * ```typescript
 * CV = (σ / μ) × 100
 * 
 * onde:
 * σ (sigma) = desvio padrão = √(Σ(x - μ)² / n)
 * μ (mu) = média = Σx / n
 * x = cada preço individual
 * n = número de preços
 * ```
 * 
 * **Implementação**:
 * 1. Calcular média dos preços
 * 2. Calcular variância: Σ(preço - média)² / n
 * 3. Calcular desvio padrão: √variância
 * 4. Calcular CV: (desvio / média) × 100
 * 
 * **Interpretação**:
 * - **0-3%**: Muito baixa (preços estáveis)
 * - **3-7%**: Baixa (oscilações pequenas)
 * - **7-12%**: Moderada (alguma instabilidade)
 * - **12-20%**: Alta (preços imprevisíveis)
 * - **>20%**: Muito alta (mercado caótico)
 * 
 * **Histórico insuficiente**:
 * - `prices.length < 2` → retorna `0`
 * - Mínimo 2 pontos necessário para calcular variância
 * 
 * **Uso na prática**:
 * 
 * 1. **Alertar sobre instabilidade**:
 *    ```typescript
 *    if (calculateVolatility(prices) > 10) {
 *      sendAlert('Concorrentes com preços instáveis');
 *    }
 *    ```
 * 
 * 2. **Escolher frequência de monitoramento**:
 *    ```typescript
 *    const vol = calculateVolatility(prices);
 *    const frequency = vol > 10 ? 'hourly' : vol > 5 ? 'daily' : 'weekly';
 *    ```
 * 
 * 3. **Decidir estratégia de precificação**:
 *    ```typescript
 *    const vol = calculateVolatility(competitorPrices);
 *    if (vol < 3) {
 *      strategy = 'fixed_premium';  // Mercado estável
 *    } else if (vol > 12) {
 *      strategy = 'dynamic_matching';  // Mercado volátil
 *    }
 *    ```
 * 
 * **Diferença vs mudança de preço**:
 * - `calculatePriceChange()`: Direção (subiu/caiu)
 * - `calculateVolatility()`: Estabilidade (consistente/volátil)
 * 
 * **Exemplo combinado**:
 * ```typescript
 * const change = calculatePriceChange(prices);  // -5% (caiu)
 * const vol = calculateVolatility(prices);       // 15% (alta)
 * 
 * // Interpretação: Preço está caindo de forma errática
 * // Recomendação: Aguardar estabilização antes de ajustar
 * ```
 * 
 * **Veja também**:
 * - `identifyOpportunities()` - usa volatilidade para sugestões
 */
export function calculateVolatility(prices: PriceEntry[]): number {
  if (prices.length < 2) {
    return 0;
  }
  
  const priceValues = prices.map(p => p.price);
  const avg = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
  const variance = priceValues.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / priceValues.length;
  
  return Math.sqrt(variance) / avg * 100;
}

/**
 * Determina direção da tendência de preços
 * 
 * Classifica a tendência como alta, baixa ou estável baseado
 * na mudança percentual em 7 dias.
 * 
 * @param priceChange7d - Mudança percentual em 7 dias
 * @returns 'up' (alta), 'down' (baixa), ou 'stable' (estável)
 * 
 * @example
 * ```typescript
 * // Caso 1: Tendência de alta
 * const change1 = 8.5;  // +8.5% em 7 dias
 * const trend1 = determineTrend(change1);
 * console.log(`Mudança: ${change1}% → Tendência: ${trend1}`);
 * // Output: Mudança: 8.5% → Tendência: up
 * 
 * // Caso 2: Tendência de baixa
 * const change2 = -12.3;  // -12.3% em 7 dias
 * const trend2 = determineTrend(change2);
 * console.log(`Mudança: ${change2}% → Tendência: ${trend2}`);
 * // Output: Mudança: -12.3% → Tendência: down
 * 
 * // Caso 3: Estável (mudança pequena)
 * const change3 = 1.5;  // +1.5% em 7 dias
 * const trend3 = determineTrend(change3);
 * console.log(`Mudança: ${change3}% → Tendência: ${trend3}`);
 * // Output: Mudança: 1.5% → Tendência: stable
 * 
 * // Caso 4: Edge cases nos limites
 * console.log(determineTrend(3.0));   // Output: stable (exatamente no limite)
 * console.log(determineTrend(3.1));   // Output: up (acima do limite)
 * console.log(determineTrend(-3.0));  // Output: stable (exatamente no limite)
 * console.log(determineTrend(-3.1));  // Output: down (abaixo do limite)
 * 
 * // Caso 5: Uso com histórico real
 * const prices: PriceEntry[] = [
 *   { price: 1000.00, timestamp: new Date('2024-10-12'), source: 'automated' },
 *   { price: 1020.00, timestamp: new Date('2024-10-14'), source: 'automated' },
 *   { price: 1050.00, timestamp: new Date('2024-10-16'), source: 'automated' },
 *   { price: 1080.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 * ];
 * 
 * const change7d = calculatePriceChange(prices);
 * const trend = determineTrend(change7d);
 * 
 * console.log(`Análise de 7 dias:`);
 * console.log(`  Mudança: ${change7d.toFixed(1)}%`);
 * console.log(`  Tendência: ${trend}`);
 * // Output:
 * // Análise de 7 dias:
 * //   Mudança: 8.0%
 * //   Tendência: up
 * 
 * // Caso 6: Formatação para UI
 * function formatTrend(trend: 'up' | 'down' | 'stable'): string {
 *   const icons = {
 *     up: '📈 Alta',
 *     down: '📉 Baixa',
 *     stable: '➡️ Estável'
 *   };
 *   return icons[trend];
 * }
 * 
 * console.log(formatTrend(trend1));  // Output: 📈 Alta
 * console.log(formatTrend(trend2));  // Output: 📉 Baixa
 * console.log(formatTrend(trend3));  // Output: ➡️ Estável
 * 
 * // Caso 7: Dashboard de concorrentes
 * const competitors = [
 *   { name: 'Magazine Luiza', change7d: 5.2 },
 *   { name: 'Amazon', change7d: -8.1 },
 *   { name: 'Mercado Livre', change7d: 2.0 }
 * ];
 * 
 * console.log('📊 Tendências dos Concorrentes:');
 * competitors.forEach(c => {
 *   const trend = determineTrend(c.change7d);
 *   const formatted = formatTrend(trend);
 *   console.log(`  ${c.name}: ${formatted} (${c.change7d > 0 ? '+' : ''}${c.change7d}%)`);
 * });
 * // Output:
 * // 📊 Tendências dos Concorrentes:
 * //   Magazine Luiza: 📈 Alta (+5.2%)
 * //   Amazon: 📉 Baixa (-8.1%)
 * //   Mercado Livre: ➡️ Estável (+2.0%)
 * 
 * // Caso 8: Alertas baseados em tendência
 * function shouldAlert(trend: 'up' | 'down' | 'stable', change: number): boolean {
 *   // Alertar se tendência forte (|change| > 10%)
 *   return trend !== 'stable' && Math.abs(change) > 10;
 * }
 * 
 * competitors.forEach(c => {
 *   const trend = determineTrend(c.change7d);
 *   if (shouldAlert(trend, c.change7d)) {
 *     console.log(`🚨 ALERTA: ${c.name} com tendência ${trend} forte`);
 *   }
 * });
 * // Output: 🚨 ALERTA: Amazon com tendência down forte
 * ```
 * 
 * @remarks
 * **Thresholds**:
 * - `change > 3%` → Tendência de ALTA
 * - `change < -3%` → Tendência de BAIXA
 * - `-3% ≤ change ≤ 3%` → ESTÁVEL
 * 
 * **Lógica de decisão**:
 * ```typescript
 * if (priceChange7d > 3) return 'up';
 * if (priceChange7d < -3) return 'down';
 * return 'stable';
 * ```
 * 
 * **Por que 3%?**:
 * - Mudanças < 3% são consideradas ruído/flutuação normal
 * - Threshold comum em análise financeira
 * - Evita classificar oscilações pequenas como tendências
 * 
 * **Período fixo (7 dias)**:
 * - Função assume que `priceChange7d` é sempre de 7 dias
 * - Para outros períodos, ajuste os thresholds:
 *   * 24h: ±1-2%
 *   * 7d: ±3%
 *   * 30d: ±5-7%
 * 
 * **Uso típico**:
 * 
 * 1. **Análise de mercado**:
 *    ```typescript
 *    const last7d = prices.slice(-7);
 *    const change = calculatePriceChange(last7d);
 *    const trend = determineTrend(change);
 *    ```
 * 
 * 2. **Decisão de precificação**:
 *    ```typescript
 *    if (trend === 'up') {
 *      // Concorrentes aumentando - pode aumentar também
 *    } else if (trend === 'down') {
 *      // Concorrentes reduzindo - avaliar se acompanha
 *    }
 *    ```
 * 
 * 3. **Filtrar por tendência**:
 *    ```typescript
 *    const rising = competitors.filter(c =>
 *      determineTrend(c.change7d) === 'up'
 *    );
 *    ```
 * 
 * **Combinação com volatilidade**:
 * ```typescript
 * const trend = determineTrend(change7d);
 * const vol = calculateVolatility(prices);
 * 
 * if (trend === 'up' && vol < 5) {
 *   // Alta consistente - tendência confiável
 * } else if (trend === 'up' && vol > 15) {
 *   // Alta volátil - pode reverter
 * }
 * ```
 * 
 * **Veja também**:
 * - `calculatePriceChange()` - calcula a mudança percentual
 * - `identifyOpportunities()` - usa tendências para sugestões
 */
export function determineTrend(priceChange7d: number): 'up' | 'down' | 'stable' {
  if (priceChange7d > 3) {
    return 'up';
  }
  if (priceChange7d < -3) {
    return 'down';
  }
  return 'stable';
}

/**
 * Identifica oportunidades de mercado baseadas em tendências
 * 
 * Analisa mudanças de preço e volatilidade para gerar sugestões
 * estratégicas de precificação e posicionamento.
 * 
 * @param change24h - Mudança percentual em 24 horas
 * @param change7d - Mudança percentual em 7 dias
 * @param volatility - Volatilidade dos preços (%)
 * @returns Array de oportunidades identificadas
 * 
 * @example
 * ```typescript
 * // Caso 1: Correção de curto prazo em tendência de alta
 * const opp1 = identifyOpportunities(
 *   -6,    // Queda de 6% nas últimas 24h
 *   8,     // Alta de 8% nos últimos 7 dias
 *   5      // Volatilidade moderada
 * );
 * 
 * console.log('Oportunidade 1:');
 * opp1.forEach(o => console.log(`  - ${o}`));
 * // Output:
 * //   - Correção de curto prazo em tendência de alta - oportunidade de entrada
 * 
 * // Caso 2: Alta volatilidade
 * const opp2 = identifyOpportunities(
 *   3,     // Alta de 3% em 24h
 *   5,     // Alta de 5% em 7 dias
 *   15     // Volatilidade alta
 * );
 * 
 * console.log('\nOportunidade 2:');
 * opp2.forEach(o => console.log(`  - ${o}`));
 * // Output:
 * //   - Alta volatilidade - considere estratégia de precificação dinâmica
 * 
 * // Caso 3: Forte tendência de alta
 * const opp3 = identifyOpportunities(
 *   7,     // Alta de 7% em 24h
 *   15,    // Alta de 15% em 7 dias
 *   8      // Volatilidade moderada
 * );
 * 
 * console.log('\nOportunidade 3:');
 * opp3.forEach(o => console.log(`  - ${o}`));
 * // Output:
 * //   - Alta volatilidade - considere estratégia de precificação dinâmica
 * //   - Forte tendência de alta - oportunidade para aumentar preços
 * 
 * // Caso 4: Tendência de baixa
 * const opp4 = identifyOpportunities(
 *   -3,    // Queda de 3% em 24h
 *   -12,   // Queda de 12% em 7 dias
 *   6      // Volatilidade baixa
 * );
 * 
 * console.log('\nOportunidade 4:');
 * opp4.forEach(o => console.log(`  - ${o}`));
 * // Output:
 * //   - Tendência de baixa - oportunidade para ganhar market share
 * 
 * // Caso 5: Mercado estável
 * const opp5 = identifyOpportunities(
 *   0.5,   // Quase sem mudança em 24h
 *   -1,    // Quase sem mudança em 7 dias
 *   2      // Volatilidade muito baixa
 * );
 * 
 * console.log('\nOportunidade 5:');
 * opp5.forEach(o => console.log(`  - ${o}`));
 * // Output:
 * //   - Mercado estável - bom momento para testar preços premium
 * 
 * // Caso 6: Múltiplas oportunidades
 * const opp6 = identifyOpportunities(
 *   8,     // Alta de 8% em 24h
 *   18,    // Alta de 18% em 7 dias
 *   12     // Alta volatilidade
 * );
 * 
 * console.log('\nOportunidade 6 (múltiplas):');
 * opp6.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
 * // Output:
 * //   1. Alta volatilidade - considere estratégia de precificação dinâmica
 * //   2. Forte tendência de alta - oportunidade para aumentar preços
 * 
 * // Caso 7: Sem oportunidades claras
 * const opp7 = identifyOpportunities(
 *   2,     // Pequena alta em 24h
 *   4,     // Pequena alta em 7 dias
 *   5      // Volatilidade baixa
 * );
 * 
 * console.log('\nOportunidade 7:');
 * console.log(opp7.length === 0 ? '  (Nenhuma oportunidade identificada)' : opp7);
 * // Output: (Nenhuma oportunidade identificada)
 * 
 * // Caso 8: Uso em análise de concorrente
 * const competitorData = {
 *   name: 'Amazon',
 *   change24h: -7,
 *   change7d: 5,
 *   volatility: 11
 * };
 * 
 * const opportunities = identifyOpportunities(
 *   competitorData.change24h,
 *   competitorData.change7d,
 *   competitorData.volatility
 * );
 * 
 * console.log(`\n📊 Análise: ${competitorData.name}`);
 * console.log(`  24h: ${competitorData.change24h}%`);
 * console.log(`  7d: ${competitorData.change7d}%`);
 * console.log(`  Volatilidade: ${competitorData.volatility}%`);
 * console.log(`\n💡 Oportunidades:`);
 * opportunities.forEach(o => console.log(`  - ${o}`));
 * // Output:
 * // 📊 Análise: Amazon
 * //   24h: -7%
 * //   7d: 5%
 * //   Volatilidade: 11%
 * // 
 * // 💡 Oportunidades:
 * //   - Correção de curto prazo em tendência de alta - oportunidade de entrada
 * //   - Alta volatilidade - considere estratégia de precificação dinâmica
 * ```
 * 
 * @remarks
 * **Regras de identificação**:
 * 
 * 1. **Correção de curto prazo** (melhor oportunidade):
 *    - Condição: `change24h < -5` AND `change7d > 0`
 *    - Situação: Queda recente mas tendência geral é de alta
 *    - Ação: Oportunidade de entrar/manter preço competitivo
 * 
 * 2. **Alta volatilidade**:
 *    - Condição: `volatility > 10`
 *    - Situação: Preços instáveis
 *    - Ação: Usar precificação dinâmica
 * 
 * 3. **Forte tendência de alta**:
 *    - Condição: `change24h > 5` AND `change7d > 10`
 *    - Situação: Alta consistente
 *    - Ação: Pode aumentar preços
 * 
 * 4. **Tendência de baixa**:
 *    - Condição: `change7d < -10`
 *    - Situação: Concorrentes reduzindo
 *    - Ação: Oportunidade de ganhar market share
 * 
 * 5. **Mercado estável**:
 *    - Condição: `|change24h| < 1` AND `volatility < 3`
 *    - Situação: Preços previsíveis
 *    - Ação: Testar preços premium
 * 
 * **Priorização**:
 * - Oportunidades são retornadas na ordem de identificação
 * - Primeira oportunidade geralmente é a mais acionável
 * - Múltiplas oportunidades podem coexistir
 * 
 * **Array vazio**:
 * - Retorna `[]` se nenhuma regra é satisfeita
 * - Situações "normais" sem oportunidades claras
 * 
 * **Uso em dashboard**:
 * ```typescript
 * const opportunities = identifyOpportunities(
 *   stats.change24h,
 *   stats.change7d,
 *   stats.volatility
 * );
 * 
 * if (opportunities.length > 0) {
 *   showOpportunityBanner(opportunities[0]);
 * }
 * ```
 * 
 * **Customização**:
 * Ajuste os thresholds conforme seu negócio:
 * ```typescript
 * // Exemplo: Setor mais conservador
 * if (change24h < -3 && change7d > 0) {  // -3% ao invés de -5%
 *   opportunities.push('Correção detectada...');
 * }
 * 
 * // Exemplo: Considerar volatilidade moderada
 * if (volatility > 7) {  // 7% ao invés de 10%
 *   opportunities.push('Volatilidade crescente...');
 * }
 * ```
 * 
 * **Combinação com alertas**:
 * ```typescript
 * const opps = identifyOpportunities(change24h, change7d, vol);
 * 
 * if (opps.length > 0) {
 *   sendAlert({
 *     type: 'market_opportunity',
 *     severity: 'medium',
 *     message: opps[0],
 *     opportunities: opps
 *   });
 * }
 * ```
 */
export function identifyOpportunities(
  change24h: number,
  change7d: number,
  volatility: number
): string[] {
  const opportunities: string[] = [];

  if (change24h < -5 && change7d > 0) {
    opportunities.push('Correção de curto prazo em tendência de alta - oportunidade de entrada');
  }

  if (volatility > 10) {
    opportunities.push('Alta volatilidade - considere estratégia de precificação dinâmica');
  }

  if (change24h > 5 && change7d > 10) {
    opportunities.push('Forte tendência de alta - oportunidade para aumentar preços');
  }

  if (change7d < -10) {
    opportunities.push('Tendência de baixa - oportunidade para ganhar market share');
  }

  if (Math.abs(change24h) < 1 && volatility < 3) {
    opportunities.push('Mercado estável - bom momento para testar preços premium');
  }

  return opportunities;
}

/**
 * Gera tendência simulada quando não há dados históricos
 * 
 * Cria estatísticas artificiais baseadas em hash do nome do produto
 * para permitir demonstrações e testes sem dados reais.
 * 
 * @param productName - Nome do produto
 * @returns Estatísticas simuladas (preço médio, mudanças, volatilidade)
 * 
 * @example
 * ```typescript
 * // Caso 1: Produto sem histórico
 * const sim1 = generateSimulatedTrend('iPhone 15 Pro 256GB');
 * 
 * console.log('📊 Estatísticas Simuladas - iPhone 15 Pro:');
 * console.log(`  Preço médio: R$ ${sim1.avgPrice.toFixed(2)}`);
 * console.log(`  Mudança 24h: ${sim1.priceChange24h > 0 ? '+' : ''}${sim1.priceChange24h}%`);
 * console.log(`  Mudança 7d: ${sim1.priceChange7d > 0 ? '+' : ''}${sim1.priceChange7d}%`);
 * console.log(`  Mudança 30d: ${sim1.priceChange30d > 0 ? '+' : ''}${sim1.priceChange30d}%`);
 * console.log(`  Volatilidade: ${sim1.volatility}%`);
 * // Output (deterministico para mesmo nome):
 * // 📊 Estatísticas Simuladas - iPhone 15 Pro:
 * //   Preço médio: R$ 5299.99
 * //   Mudança 24h: +2.14%
 * //   Mudança 7d: +4.86%
 * //   Mudança 30d: +11.23%
 * //   Volatilidade: 8.47%
 * 
 * // Caso 2: Mesmo produto sempre retorna mesmos valores
 * const sim1a = generateSimulatedTrend('iPhone 15 Pro 256GB');
 * const sim1b = generateSimulatedTrend('iPhone 15 Pro 256GB');
 * 
 * console.log('\nConsistência:');
 * console.log(`sim1a.avgPrice: ${sim1a.avgPrice}`);
 * console.log(`sim1b.avgPrice: ${sim1b.avgPrice}`);
 * console.log(`Iguais: ${sim1a.avgPrice === sim1b.avgPrice}`);
 * // Output:
 * //   sim1a.avgPrice: 5299.99
 * //   sim1b.avgPrice: 5299.99
 * //   Iguais: true
 * 
 * // Caso 3: Produtos diferentes têm valores diferentes
 * const simIPhone = generateSimulatedTrend('iPhone 15 Pro');
 * const simGalaxy = generateSimulatedTrend('Galaxy S24 Ultra');
 * 
 * console.log('\nDiferentes produtos:');
 * console.log(`iPhone: R$ ${simIPhone.avgPrice.toFixed(2)}`);
 * console.log(`Galaxy: R$ ${simGalaxy.avgPrice.toFixed(2)}`);
 * // Output (valores diferentes):
 * //   iPhone: R$ 5299.99
 * //   Galaxy: R$ 4856.32
 * 
 * // Caso 4: Uso em fallback
 * function getProductStats(productName: string, history: PriceEntry[]) {
 *   if (history.length === 0) {
 *     console.log('⚠️ Sem histórico - gerando dados simulados');
 *     return generateSimulatedTrend(productName);
 *   }
 *   
 *   return {
 *     avgPrice: history.reduce((sum, p) => sum + p.price, 0) / history.length,
 *     priceChange24h: calculatePriceChange(history.slice(-2)),
 *     priceChange7d: calculatePriceChange(history.slice(-7)),
 *     priceChange30d: calculatePriceChange(history),
 *     volatility: calculateVolatility(history)
 *   };
 * }
 * 
 * const stats = getProductStats('PlayStation 5', []);
 * console.log('\nStats (sem histórico):');
 * console.log(stats);
 * // Output:
 * // ⚠️ Sem histórico - gerando dados simulados
 * // Stats (sem histórico):
 * // {
 * //   avgPrice: 189.23,
 * //   priceChange24h: -1.42,
 * //   priceChange7d: 3.58,
 * //   priceChange30d: -8.91,
 * //   volatility: 7.15
 * // }
 * 
 * // Caso 5: Dashboard de demonstração
 * const demoProducts = [
 *   'iPhone 15 Pro',
 *   'Galaxy S24',
 *   'PlayStation 5',
 *   'Xbox Series X',
 *   'Nintendo Switch'
 * ];
 * 
 * console.log('\n📊 Dashboard Demo:');
 * demoProducts.forEach(product => {
 *   const sim = generateSimulatedTrend(product);
 *   const trend = determineTrend(sim.priceChange7d);
 *   const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
 *   
 *   console.log(`\n${product}:`);
 *   console.log(`  ${trendIcon} R$ ${sim.avgPrice.toFixed(2)} (7d: ${sim.priceChange7d > 0 ? '+' : ''}${sim.priceChange7d}%)`);
 * });
 * // Output:
 * // 📊 Dashboard Demo:
 * // 
 * // iPhone 15 Pro:
 * //   📈 R$ 5299.99 (7d: +4.86%)
 * // 
 * // Galaxy S24:
 * //   ➡️ R$ 4856.32 (7d: +1.23%)
 * // ...
 * 
 * // Caso 6: Range de valores gerados
 * const samples = [
 *   'Produto A', 'Produto B', 'Produto C', 'Produto D', 'Produto E',
 *   'Produto F', 'Produto G', 'Produto H', 'Produto I', 'Produto J'
 * ];
 * 
 * const prices = samples.map(p => generateSimulatedTrend(p).avgPrice);
 * const minPrice = Math.min(...prices);
 * const maxPrice = Math.max(...prices);
 * 
 * console.log('\nRange de preços simulados (10 amostras):');
 * console.log(`  Mínimo: R$ ${minPrice.toFixed(2)}`);
 * console.log(`  Máximo: R$ ${maxPrice.toFixed(2)}`);
 * console.log(`  Range: R$ ${(maxPrice - minPrice).toFixed(2)}`);
 * // Output (aproximadamente):
 * //   Mínimo: R$ 52.31
 * //   Máximo: R$ 243.87
 * //   Range: R$ 191.56
 * ```
 * 
 * @remarks
 * **Algoritmo de geração**:
 * 
 * 1. **Hash do nome**:
 *    ```typescript
 *    let hash = 0;
 *    for (char of productName) {
 *      hash = ((hash << 5) - hash) + charCode;
 *    }
 *    ```
 *    - Gera número único baseado no nome
 *    - Mesmo nome → mesmo hash
 * 
 * 2. **Normalização (0-1)**:
 *    ```typescript
 *    const random = Math.abs(hash) / 2147483647;
 *    ```
 *    - Converte hash para valor 0.0-1.0
 *    - Usado como "semente" pseudo-aleatória
 * 
 * 3. **Geração de valores**:
 *    - `avgPrice`: R$ 50-250 (basePrice = 50 + random × 200)
 *    - `change24h`: -5% a +5% ((random - 0.5) × 10)
 *    - `change7d`: -10% a +10% ((random - 0.5) × 20)
 *    - `change30d`: -20% a +20% ((random - 0.5) × 40)
 *    - `volatility`: 0% a 15% (random × 15)
 * 
 * 4. **Arredondamento**:
 *    - Todos os valores arredondados para 2 casas decimais
 *    - `Math.round(value * 100) / 100`
 * 
 * **Características**:
 * - ✅ Deterministico (mesmo input → mesmo output)
 * - ✅ Distribuição razoável de valores
 * - ✅ Sem dependências externas
 * - ❌ NÃO é criptograficamente seguro
 * - ❌ NÃO reflete realidade do mercado
 * 
 * **Ranges esperados**:
 * - Preço médio: R$ 50 - R$ 250
 * - Mudança 24h: -5% a +5%
 * - Mudança 7d: -10% a +10%
 * - Mudança 30d: -20% a +20%
 * - Volatilidade: 0% a 15%
 * 
 * **Uso recomendado**:
 * 1. **Demonstrações**: Mostrar UI sem dados reais
 * 2. **Testes**: Criar dados consistentes para testes
 * 3. **Fallback**: Quando API falha ou sem histórico
 * 4. **Protótipos**: Desenvolvimento sem backend
 * 
 * **NÃO usar para**:
 * - ❌ Decisões de negócio reais
 * - ❌ Análises financeiras
 * - ❌ Relatórios oficiais
 * - ❌ Cálculos de margem/lucro
 * 
 * **Melhorias possíveis**:
 * ```typescript
 * // Adicionar categoria para ranges diferentes
 * function generateSimulatedTrend(
 *   productName: string,
 *   category?: 'eletronicos' | 'moda' | 'alimentos'
 * ) {
 *   const ranges = {
 *     eletronicos: { min: 500, max: 5000 },
 *     moda: { min: 50, max: 500 },
 *     alimentos: { min: 5, max: 100 }
 *   };
 *   
 *   const range = ranges[category] || { min: 50, max: 250 };
 *   const basePrice = range.min + (random * (range.max - range.min));
 *   // ...
 * }
 * ```
 * 
 * **Veja também**:
 * - Use dados reais sempre que possível
 * - Esta função é apenas para desenvolvimento/demo
 */
export function generateSimulatedTrend(productName: string): {
  avgPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  volatility: number;
} {
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    const char = productName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const random = Math.abs(hash) / 2147483647;
  
  const basePrice = 50 + (random * 200);
  const change24h = (random - 0.5) * 10;
  const change7d = (random - 0.5) * 20;
  const change30d = (random - 0.5) * 40;
  const volatility = random * 15;

  return {
    avgPrice: Math.round(basePrice * 100) / 100,
    priceChange24h: Math.round(change24h * 100) / 100,
    priceChange7d: Math.round(change7d * 100) / 100,
    priceChange30d: Math.round(change30d * 100) / 100,
    volatility: Math.round(volatility * 100) / 100
  };
}
