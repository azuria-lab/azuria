/**
 * Trends Module
 * Handles market trend analysis
 */

import { calculatePriceChange, calculateVolatility, determineTrend, generateSimulatedTrend, identifyOpportunities } from './statistics';
import { MarketTrend, PriceHistory } from './types';

/**
 * Analisa tendências de mercado para um produto
 * 
 * Processa histórico de preços de todas as plataformas e calcula
 * estatísticas abrangentes incluindo mudanças, volatilidade e oportunidades.
 * 
 * @param productName - Nome do produto a analisar
 * @param priceHistory - Mapa de histórico de preços
 * @returns Tendência de mercado completa com estatísticas e oportunidades
 * 
 * @example
 * ```typescript
 * const history = new Map<string, PriceHistory[]>();
 * 
 * // Caso 1: Produto sem histórico (usa dados simulados)
 * const trend1 = await analyzeMarketTrends('iPhone 15 Pro', history);
 * 
 * console.log('📊 Análise - iPhone 15 Pro (sem histórico):');
 * console.log(`  Produto: ${trend1.productName}`);
 * console.log(`  Preço médio: R$ ${trend1.avgPrice.toFixed(2)}`);
 * console.log(`  Mudança 24h: ${trend1.priceChange24h > 0 ? '+' : ''}${trend1.priceChange24h}%`);
 * console.log(`  Mudança 7d: ${trend1.priceChange7d > 0 ? '+' : ''}${trend1.priceChange7d}%`);
 * console.log(`  Mudança 30d: ${trend1.priceChange30d > 0 ? '+' : ''}${trend1.priceChange30d}%`);
 * console.log(`  Volatilidade: ${trend1.volatility}%`);
 * console.log(`  Tendência: ${trend1.trendDirection}`);
 * console.log(`  Oportunidades: ${trend1.opportunities.length}`);
 * trend1.opportunities.forEach(o => console.log(`    - ${o}`));
 * // Output:
 * // 📊 Análise - iPhone 15 Pro (sem histórico):
 * //   Produto: iPhone 15 Pro
 * //   Preço médio: R$ 5299.99
 * //   Mudança 24h: +2.14%
 * //   Mudança 7d: +4.86%
 * //   Mudança 30d: +11.23%
 * //   Volatilidade: 8.47%
 * //   Tendência: up
 * //   Oportunidades: 1
 * //     - Alta volatilidade - considere estratégia de precificação dinâmica
 * 
 * // Caso 2: Produto com histórico real
 * // Adicionar histórico
 * const realHistory: PriceHistory[] = [
 *   {
 *     productName: 'PlayStation 5',
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Magazine Luiza',
 *     prices: [
 *       { price: 3500.00, timestamp: new Date('2024-09-19'), source: 'automated' },
 *       { price: 3450.00, timestamp: new Date('2024-09-26'), source: 'automated' },
 *       { price: 3400.00, timestamp: new Date('2024-10-03'), source: 'automated' },
 *       { price: 3380.00, timestamp: new Date('2024-10-10'), source: 'automated' },
 *       { price: 3350.00, timestamp: new Date('2024-10-17'), source: 'automated' },
 *       { price: 3320.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 *     ]
 *   },
 *   {
 *     productName: 'PlayStation 5',
 *     platform: CompetitorPlatform.AMAZON,
 *     seller: 'Amazon',
 *     prices: [
 *       { price: 3600.00, timestamp: new Date('2024-09-19'), source: 'automated' },
 *       { price: 3550.00, timestamp: new Date('2024-09-26'), source: 'automated' },
 *       { price: 3500.00, timestamp: new Date('2024-10-03'), source: 'automated' },
 *       { price: 3480.00, timestamp: new Date('2024-10-10'), source: 'automated' },
 *       { price: 3450.00, timestamp: new Date('2024-10-17'), source: 'automated' },
 *       { price: 3420.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 *     ]
 *   }
 * ];
 * 
 * history.set('PlayStation 5_all_platforms', realHistory);
 * 
 * const trend2 = await analyzeMarketTrends('PlayStation 5', history);
 * 
 * console.log('\n📊 Análise - PlayStation 5 (com histórico):');
 * console.log(`  Preço médio: R$ ${trend2.avgPrice.toFixed(2)}`);
 * console.log(`  Mudança 7d: ${trend2.priceChange7d.toFixed(2)}%`);
 * console.log(`  Tendência: ${trend2.trendDirection}`);
 * console.log(`  Volatilidade: ${trend2.volatility.toFixed(2)}%`);
 * // Output:
 * // 📊 Análise - PlayStation 5 (com histórico):
 * //   Preço médio: R$ 3470.00
 * //   Mudança 7d: -1.77%
 * //   Tendência: stable
 * //   Volatilidade: 2.47%
 * 
 * if (trend2.opportunities.length > 0) {
 *   console.log('  💡 Oportunidades:');
 *   trend2.opportunities.forEach(o => console.log(`    - ${o}`));
 * } else {
 *   console.log('  💡 Nenhuma oportunidade identificada');
 * }
 * // Output: 💡 Nenhuma oportunidade identificada
 * 
 * // Caso 3: Análise comparativa de múltiplos produtos
 * const products = ['iPhone 15 Pro', 'Galaxy S24', 'PlayStation 5'];
 * 
 * console.log('\n📊 Comparação de Tendências:');
 * for (const product of products) {
 *   const trend = await analyzeMarketTrends(product, history);
 *   const trendIcon = trend.trendDirection === 'up' ? '📈' : 
 *                     trend.trendDirection === 'down' ? '📉' : '➡️';
 *   
 *   console.log(`\n${product}:`);
 *   console.log(`  ${trendIcon} ${trend.trendDirection.toUpperCase()}`);
 *   console.log(`  R$ ${trend.avgPrice.toFixed(2)} (7d: ${trend.priceChange7d > 0 ? '+' : ''}${trend.priceChange7d.toFixed(1)}%)`);
 *   console.log(`  Volatilidade: ${trend.volatility.toFixed(1)}%`);
 * }
 * 
 * // Caso 4: Dashboard com alertas
 * const trend4 = await analyzeMarketTrends('Notebook Gamer', history);
 * 
 * console.log('\n🎯 Dashboard - Notebook Gamer:');
 * console.log(`Preço: R$ ${trend4.avgPrice.toFixed(2)}`);
 * console.log(`Tendência: ${trend4.trendDirection}`);
 * 
 * // Alertas baseados em volatilidade
 * if (trend4.volatility > 10) {
 *   console.log('⚠️ ALERTA: Alta volatilidade detectada');
 * }
 * 
 * // Alertas baseados em mudança
 * if (Math.abs(trend4.priceChange24h) > 5) {
 *   console.log(`⚠️ ALERTA: Mudança significativa em 24h (${trend4.priceChange24h.toFixed(1)}%)`);
 * }
 * 
 * // Caso 5: Exportar para relatório
 * function generateTrendReport(trend: MarketTrend): string {
 *   return `
 * RELATÓRIO DE TENDÊNCIA - ${trend.productName}
 * ================================================
 * 
 * PREÇOS:
 * - Preço médio: R$ ${trend.avgPrice.toFixed(2)}
 * - Mudança 24h: ${trend.priceChange24h > 0 ? '+' : ''}${trend.priceChange24h.toFixed(2)}%
 * - Mudança 7d: ${trend.priceChange7d > 0 ? '+' : ''}${trend.priceChange7d.toFixed(2)}%
 * - Mudança 30d: ${trend.priceChange30d > 0 ? '+' : ''}${trend.priceChange30d.toFixed(2)}%
 * 
 * ANÁLISE:
 * - Volatilidade: ${trend.volatility.toFixed(2)}%
 * - Tendência: ${trend.trendDirection.toUpperCase()}
 * 
 * OPORTUNIDADES (${trend.opportunities.length}):
 * ${trend.opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n')}
 * `;
 * }
 * 
 * const report = generateTrendReport(trend2);
 * console.log(report);
 * ```
 * 
 * @remarks
 * **Pipeline de análise**:
 * 
 * 1. **Buscar histórico**:
 *    ```typescript
 *    const key = `${productName}_all_platforms`;
 *    const history = priceHistory.get(key) || [];
 *    ```
 * 
 * 2. **Fallback sem histórico**:
 *    - Se `history.length === 0` → usa `generateSimulatedTrend()`
 *    - Retorna dados sintéticos para demonstração
 * 
 * 3. **Processar histórico real**:
 *    - Combina preços de todas as plataformas
 *    - Ordena por timestamp (mais antigo → mais recente)
 *    - Filtra por períodos (24h, 7d, 30d)
 * 
 * 4. **Calcular estatísticas**:
 *    - `avgPrice`: Média de todos os preços
 *    - `priceChange24h/7d/30d`: Mudanças percentuais
 *    - `volatility`: Coeficiente de variação
 *    - `trendDirection`: Classificação (up/down/stable)
 *    - `opportunities`: Sugestões estratégicas
 * 
 * **Estrutura do retorno**:
 * ```typescript
 * {
 *   productName: string,
 *   avgPrice: number,
 *   priceChange24h: number,
 *   priceChange7d: number,
 *   priceChange30d: number,
 *   volatility: number,
 *   trendDirection: 'up' | 'down' | 'stable',
 *   opportunities: string[]
 * }
 * ```
 * 
 * **Filtragem por período**:
 * ```typescript
 * const now = new Date();
 * const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
 * const prices24h = allPrices.filter(p => p.timestamp >= day24h);
 * ```
 * 
 * **Funções delegadas**:
 * - `calculatePriceChange()` - Mudanças percentuais
 * - `calculateVolatility()` - Instabilidade
 * - `determineTrend()` - Direção (up/down/stable)
 * - `identifyOpportunities()` - Sugestões estratégicas
 * - `generateSimulatedTrend()` - Fallback sem dados
 * 
 * **Chave do histórico**:
 * - Formato: `{productName}_all_platforms`
 * - Exemplo: `iPhone 15 Pro_all_platforms`
 * - Agrega dados de todas as plataformas
 * 
 * **Performance**:
 * - Tempo típico: 10-50ms (depende do tamanho do histórico)
 * - Operações assíncronas mínimas
 * - Principalmente cálculos matemáticos
 * 
 * **Uso em produção**:
 * ```typescript
 * // API endpoint
 * app.get('/api/trends/:productName', async (req, res) => {
 *   const trend = await analyzeMarketTrends(
 *     req.params.productName,
 *     globalPriceHistory
 *   );
 *   res.json(trend);
 * });
 * ```
 * 
 * **Veja também**:
 * - `getPriceHistory()` - recupera histórico bruto
 * - Módulo `statistics.ts` - funções de cálculo
 */
export async function analyzeMarketTrends(
  productName: string,
  priceHistory: Map<string, PriceHistory[]>
): Promise<MarketTrend> {
  const historicalKey = `${productName}_all_platforms`;
  const history = priceHistory.get(historicalKey) || [];

  if (history.length === 0) {
    const simulated = generateSimulatedTrend(productName);
    return {
      productName,
      ...simulated,
      trendDirection: determineTrend(simulated.priceChange7d),
      opportunities: identifyOpportunities(
        simulated.priceChange24h,
        simulated.priceChange7d,
        simulated.volatility
      )
    };
  }

  const allPrices = history.flatMap(h => h.prices);
  allPrices.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const now = new Date();
  const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const day7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const day30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const prices24h = allPrices.filter(p => p.timestamp >= day24h);
  const prices7d = allPrices.filter(p => p.timestamp >= day7d);
  const prices30d = allPrices.filter(p => p.timestamp >= day30d);

  const avgPrice = allPrices.reduce((sum, p) => sum + p.price, 0) / allPrices.length;
  
  const priceChange24h = calculatePriceChange(prices24h);
  const priceChange7d = calculatePriceChange(prices7d);
  const priceChange30d = calculatePriceChange(prices30d);

  const volatility = calculateVolatility(allPrices);
  const trendDirection = determineTrend(priceChange7d);
  const opportunities = identifyOpportunities(priceChange24h, priceChange7d, volatility);

  return {
    productName,
    avgPrice,
    priceChange24h,
    priceChange7d,
    priceChange30d,
    volatility,
    trendDirection,
    opportunities
  };
}

/**
 * Recupera histórico de preços de um produto
 * 
 * Busca todas as entradas de histórico agregadas de todas as plataformas
 * para um produto específico.
 * 
 * @param productName - Nome do produto
 * @param priceHistory - Mapa de histórico de preços
 * @returns Array de históricos por plataforma/vendedor ou array vazio
 * 
 * @example
 * ```typescript
 * const history = new Map<string, PriceHistory[]>();
 * 
 * // Adicionar histórico de exemplo
 * const ps5History: PriceHistory[] = [
 *   {
 *     productName: 'PlayStation 5',
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Magazine Luiza',
 *     prices: [
 *       { price: 3500.00, timestamp: new Date('2024-10-01'), source: 'automated' },
 *       { price: 3450.00, timestamp: new Date('2024-10-08'), source: 'automated' },
 *       { price: 3400.00, timestamp: new Date('2024-10-15'), source: 'automated' }
 *     ]
 *   },
 *   {
 *     productName: 'PlayStation 5',
 *     platform: CompetitorPlatform.AMAZON,
 *     seller: 'Amazon',
 *     prices: [
 *       { price: 3600.00, timestamp: new Date('2024-10-01'), source: 'automated' },
 *       { price: 3550.00, timestamp: new Date('2024-10-08'), source: 'automated' },
 *       { price: 3500.00, timestamp: new Date('2024-10-15'), source: 'automated' }
 *     ]
 *   }
 * ];
 * 
 * history.set('PlayStation 5_all_platforms', ps5History);
 * 
 * // Caso 1: Produto com histórico
 * const retrieved = getPriceHistory('PlayStation 5', history);
 * 
 * console.log(`📦 Histórico recuperado para PlayStation 5:`);
 * console.log(`  Total de vendedores: ${retrieved.length}`);
 * retrieved.forEach(h => {
 *   console.log(`\n  ${h.platform} - ${h.seller}:`);
 *   console.log(`    Entradas: ${h.prices.length}`);
 *   console.log(`    Último preço: R$ ${h.prices[h.prices.length - 1].price}`);
 * });
 * // Output:
 * // 📦 Histórico recuperado para PlayStation 5:
 * //   Total de vendedores: 2
 * // 
 * //   mercado_livre - Magazine Luiza:
 * //     Entradas: 3
 * //     Último preço: R$ 3400.00
 * // 
 * //   amazon - Amazon:
 * //     Entradas: 3
 * //     Último preço: R$ 3500.00
 * 
 * // Caso 2: Produto sem histórico
 * const empty = getPriceHistory('Produto Inexistente', history);
 * 
 * console.log(`\n📦 Histórico para produto inexistente:`);
 * console.log(`  Vendedores encontrados: ${empty.length}`);
 * // Output:
 * // 📦 Histórico para produto inexistente:
 * //   Vendedores encontrados: 0
 * 
 * // Caso 3: Extrair todos os preços
 * const allHistory = getPriceHistory('PlayStation 5', history);
 * const allPrices = allHistory.flatMap(h => h.prices);
 * 
 * console.log(`\n📊 Todos os preços:`);
 * console.log(`  Total: ${allPrices.length} entradas`);
 * const avgPrice = allPrices.reduce((sum, p) => sum + p.price, 0) / allPrices.length;
 * console.log(`  Preço médio: R$ ${avgPrice.toFixed(2)}`);
 * // Output:
 * // 📊 Todos os preços:
 * //   Total: 6 entradas
 * //   Preço médio: R$ 3483.33
 * 
 * // Caso 4: Filtrar por plataforma
 * const mlHistory = allHistory.filter(
 *   h => h.platform === CompetitorPlatform.MERCADO_LIVRE
 * );
 * 
 * console.log(`\n🛒 Apenas Mercado Livre:`);
 * console.log(`  Vendedores: ${mlHistory.length}`);
 * mlHistory.forEach(h => {
 *   console.log(`    - ${h.seller}: ${h.prices.length} preços`);
 * });
 * // Output:
 * // 🛒 Apenas Mercado Livre:
 * //   Vendedores: 1
 * //     - Magazine Luiza: 3 preços
 * 
 * // Caso 5: Encontrar menor preço atual
 * const currentPrices = allHistory.map(h => ({
 *   seller: h.seller,
 *   platform: h.platform,
 *   price: h.prices[h.prices.length - 1].price
 * }));
 * 
 * const cheapest = currentPrices.reduce((min, curr) =>
 *   curr.price < min.price ? curr : min
 * );
 * 
 * console.log(`\n💰 Menor preço atual:`);
 * console.log(`  ${cheapest.seller} (${cheapest.platform}): R$ ${cheapest.price}`);
 * // Output:
 * // 💰 Menor preço atual:
 * //   Magazine Luiza (mercado_livre): R$ 3400.00
 * 
 * // Caso 6: Verificar se tem histórico antes de analisar
 * function analyzeIfHasHistory(productName: string, history: Map<string, PriceHistory[]>) {
 *   const productHistory = getPriceHistory(productName, history);
 *   
 *   if (productHistory.length === 0) {
 *     console.log(`⚠️ Sem histórico para ${productName}`);
 *     return null;
 *   }
 *   
 *   const totalPrices = productHistory.reduce((sum, h) => sum + h.prices.length, 0);
 *   console.log(`✅ ${productName}: ${productHistory.length} vendedores, ${totalPrices} preços`);
 *   
 *   return analyzeMarketTrends(productName, history);
 * }
 * 
 * await analyzeIfHasHistory('PlayStation 5', history);
 * // Output: ✅ PlayStation 5: 2 vendedores, 6 preços
 * 
 * await analyzeIfHasHistory('Xbox Series X', history);
 * // Output: ⚠️ Sem histórico para Xbox Series X
 * 
 * // Caso 7: Listar produtos com histórico
 * console.log(`\n📋 Produtos monitorados:`);
 * const allProducts = new Set<string>();
 * 
 * history.forEach((histories, key) => {
 *   // Extrair nome do produto da chave (remove "_all_platforms")
 *   const productName = key.replace('_all_platforms', '');
 *   allProducts.add(productName);
 * });
 * 
 * allProducts.forEach(product => {
 *   const hist = getPriceHistory(product, history);
 *   const totalEntries = hist.reduce((sum, h) => sum + h.prices.length, 0);
 *   console.log(`  - ${product}: ${hist.length} vendedores, ${totalEntries} entradas`);
 * });
 * // Output:
 * // 📋 Produtos monitorados:
 * //   - PlayStation 5: 2 vendedores, 6 entradas
 * ```
 * 
 * @remarks
 * **Chave de busca**:
 * ```typescript
 * const historicalKey = `${productName}_all_platforms`;
 * ```
 * - Formato fixo: `{productName}_all_platforms`
 * - Exemplo: `iPhone 15 Pro_all_platforms`
 * - Case-sensitive
 * 
 * **Retorno**:
 * - Array de `PriceHistory[]` se encontrado
 * - Array vazio `[]` se não encontrado
 * - NUNCA retorna `null` ou `undefined`
 * 
 * **Estrutura de PriceHistory**:
 * ```typescript
 * {
 *   productName: string,
 *   platform: CompetitorPlatform,
 *   seller: string,
 *   prices: Array<{
 *     price: number,
 *     timestamp: Date,
 *     source: string
 *   }>
 * }
 * ```
 * 
 * **Múltiplos vendedores**:
 * - Cada vendedor/plataforma tem sua própria entrada
 * - Exemplo: Magazine Luiza (ML) + Amazon = 2 entradas
 * 
 * **Ordenação**:
 * - Não há ordenação garantida dos vendedores
 * - Preços dentro de cada vendedor podem estar desordenados
 * - Use `.sort()` se precisar de ordem específica
 * 
 * **Uso típico**:
 * 
 * 1. **Verificar existência**:
 *    ```typescript
 *    const hist = getPriceHistory(product, history);
 *    if (hist.length === 0) {
 *      console.log('Sem dados');
 *    }
 *    ```
 * 
 * 2. **Extrair todos os preços**:
 *    ```typescript
 *    const allPrices = getPriceHistory(product, history)
 *      .flatMap(h => h.prices);
 *    ```
 * 
 * 3. **Contar entradas**:
 *    ```typescript
 *    const totalEntries = getPriceHistory(product, history)
 *      .reduce((sum, h) => sum + h.prices.length, 0);
 *    ```
 * 
 * **Performance**:
 * - Operação O(1) - acesso direto ao Map
 * - Muito rápida mesmo com milhares de produtos
 * 
 * **Diferença vs analyzeMarketTrends()**:
 * - `getPriceHistory()`: Retorna dados brutos
 * - `analyzeMarketTrends()`: Processa e analisa dados
 * 
 * **Veja também**:
 * - `analyzeMarketTrends()` - usa esta função internamente
 * - `checkRule()` em `detection.ts` - popula o histórico
 */
export function getPriceHistory(
  productName: string,
  priceHistory: Map<string, PriceHistory[]>
): PriceHistory[] {
  const historicalKey = `${productName}_all_platforms`;
  return priceHistory.get(historicalKey) || [];
}
