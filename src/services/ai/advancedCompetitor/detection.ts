/**
 * Detection Module
 * Handles price change detection, alerts generation, and alert processing
 */

import { AIAlert, CompetitorPricing } from '@/shared/types/ai';
import { generateSecureId } from '@/utils/secureRandom';
import { competitorService } from '../competitorService';
import { logger } from '../logger';
import { MonitoringRule, PriceHistory } from './types';

/**
 * Verifica uma regra de monitoramento específica
 * 
 * Busca preços atuais dos concorrentes, armazena no histórico
 * e detecta mudanças significativas de preços.
 * 
 * @param rule - Regra de monitoramento a executar
 * @param priceHistory - Mapa de histórico de preços (mutável)
 * @returns Promise que resolve quando verificação completa
 * 
 * @example
 * ```typescript
 * const rules = new Map<string, MonitoringRule>();
 * const history = new Map<string, PriceHistory[]>();
 * 
 * // Criar regra de monitoramento
 * const rule: MonitoringRule = {
 *   id: 'rule_123',
 *   productName: 'iPhone 15 Pro 256GB',
 *   platforms: [CompetitorPlatform.MERCADO_LIVRE, CompetitorPlatform.AMAZON],
 *   frequency: 'daily',
 *   priceThreshold: 5,  // Alerta com mudança de ±5%
 *   isActive: true,
 *   createdAt: new Date()
 * };
 * 
 * // Caso 1: Primeira verificação (sem histórico)
 * console.log('🔍 Verificando preços pela primeira vez...');
 * await checkRule(rule, history);
 * 
 * console.log('Histórico criado:');
 * const key = `${rule.productName}_${rule.platforms.join('_')}`;
 * const stored = history.get(key);
 * console.log(`${stored?.length || 0} vendedores registrados`);
 * // Output:
 * // 🔍 Verificando preços pela primeira vez...
 * // Histórico criado:
 * // 3 vendedores registrados
 * 
 * stored?.forEach(h => {
 *   console.log(`  ${h.platform} - ${h.seller}: R$ ${h.prices[0].price}`);
 * });
 * // Output:
 * //   mercado_livre - Magazine Luiza: R$ 5499.00
 * //   mercado_livre - Fast Shop: R$ 5399.00
 * //   amazon - Amazon: R$ 5599.00
 * 
 * // Caso 2: Segunda verificação (com mudança de preço)
 * // Simular mudança de preço depois de 1 dia
 * await new Promise(resolve => setTimeout(resolve, 100));
 * 
 * console.log('\n🔍 Verificando preços novamente...');
 * await checkRule(rule, history);
 * 
 * // Se algum preço mudou > 5%, alerta será gerado
 * // Exemplo: Magazine Luiza baixou de R$ 5499 para R$ 5199 (-5.4%)
 * // Output nos logs:
 * // 🚨 ALERTA: Mudança de preço detectada - Magazine Luiza reduziu o preço em 5.4%
 * 
 * // Caso 3: Verificar histórico acumulado
 * const magazineLuiza = stored?.find(
 *   h => h.platform === 'mercado_livre' && h.seller === 'Magazine Luiza'
 * );
 * 
 * console.log('\n📊 Histórico Magazine Luiza:');
 * magazineLuiza?.prices.forEach((p, i) => {
 *   console.log(`  ${i + 1}. R$ ${p.price} - ${p.timestamp.toISOString()}`);
 * });
 * // Output:
 * // 📊 Histórico Magazine Luiza:
 * //   1. R$ 5499.00 - 2024-10-19T10:00:00.000Z
 * //   2. R$ 5199.00 - 2024-10-19T11:00:00.000Z
 * 
 * // Caso 4: Limite de histórico (máximo 100 entradas)
 * // Simular 150 verificações
 * for (let i = 0; i < 150; i++) {
 *   await checkRule(rule, history);
 * }
 * 
 * const finalHistory = history.get(key);
 * finalHistory?.forEach(h => {
 *   console.log(`${h.seller}: ${h.prices.length} entradas no histórico`);
 * });
 * // Output (cada vendedor mantém no máximo 100 entradas):
 * // Magazine Luiza: 100 entradas no histórico
 * // Fast Shop: 100 entradas no histórico
 * // Amazon: 100 entradas no histórico
 * ```
 * 
 * @remarks
 * **Pipeline de execução**:
 * 
 * 1. **Buscar preços atuais**:
 *    ```typescript
 *    const currentPrices = await competitorService.analyzeCompetitors(
 *      rule.productName
 *    );
 *    ```
 *    - Busca em todas as plataformas configuradas
 *    - Web scraping + APIs
 * 
 * 2. **Preparar chave de histórico**:
 *    ```typescript
 *    const historicalKey = `${productName}_${platforms.join('_')}`;
 *    // Ex: 'iPhone 15_mercado_livre_amazon'
 *    ```
 * 
 * 3. **Atualizar histórico por vendedor**:
 *    - Encontra ou cria entrada para cada (platform, seller)
 *    - Adiciona novo preço com timestamp
 *    - Limita a 100 entradas mais recentes (FIFO)
 * 
 * 4. **Detectar mudanças**:
 *    ```typescript
 *    await detectPriceChanges(rule, currentPrices, history);
 *    ```
 *    - Compara preço atual vs anterior
 *    - Gera alertas se mudança >= threshold
 * 
 * **Estrutura do histórico**:
 * ```typescript
 * Map {
 *   'iPhone 15_mercado_livre_amazon' => [
 *     {
 *       productName: 'iPhone 15',
 *       platform: 'mercado_livre',
 *       seller: 'Magazine Luiza',
 *       prices: [
 *         { price: 5499.00, timestamp: Date, source: 'automated_monitoring' },
 *         { price: 5199.00, timestamp: Date, source: 'automated_monitoring' }
 *       ]
 *     }
 *   ]
 * }
 * ```
 * 
 * **Limite de histórico**:
 * - Máximo 100 entradas por vendedor
 * - Mantém apenas as mais recentes
 * - Implementação: `prices.slice(-100)`
 * 
 * **Source tag**:
 * Todas as entradas têm `source: 'automated_monitoring'`
 * para distinguir de verificações manuais.
 * 
 * **Mutações**:
 * - `priceHistory` Map é modificado (adiciona/atualiza histórico)
 * - Não modifica a `rule` (apenas lê)
 * 
 * **Performance**:
 * - Tempo típico: 1-3 segundos
 * - Depende de quantas plataformas e web scraping
 * - Gargalo: `competitorService.analyzeCompetitors()`
 * 
 * **Alertas gerados**:
 * - Automáticos quando mudança >= threshold
 * - Processados por `detectPriceChanges()` e `processAlerts()`
 * - Logs com `logger.info()`
 * 
 * **Uso no ciclo de monitoramento**:
 * Esta função é chamada por `runMonitoringCycle()` para cada regra ativa.
 */
export async function checkRule(
  rule: MonitoringRule,
  priceHistory: Map<string, PriceHistory[]>
): Promise<void> {
  const currentPrices = await competitorService.analyzeCompetitors(rule.productName);
  const historicalKey = `${rule.productName}_${rule.platforms.join('_')}`;
  const history = priceHistory.get(historicalKey) || [];

  for (const competitor of currentPrices) {
    let productHistory = history.find(h => 
      h.platform === competitor.platform && h.seller === competitor.seller
    );

    if (!productHistory) {
      productHistory = {
        productName: rule.productName,
        platform: competitor.platform,
        seller: competitor.seller || 'Desconhecido',
        prices: []
      };
      history.push(productHistory);
    }

    productHistory.prices.push({
      price: competitor.price,
      timestamp: new Date(),
      source: 'automated_monitoring'
    });

    if (productHistory.prices.length > 100) {
      productHistory.prices = productHistory.prices.slice(-100);
    }
  }

  priceHistory.set(historicalKey, history);

  await detectPriceChanges(rule, currentPrices, history);
}

/**
 * Detecta mudanças significativas de preços
 * 
 * Compara preços atuais com histórico anterior e gera alertas
 * quando a mudança ultrapassa o threshold configurado.
 * 
 * @param rule - Regra com threshold e configurações
 * @param currentPrices - Preços atuais dos concorrentes
 * @param history - Histórico de preços para comparação
 * @returns Promise que resolve quando detecção completa
 * 
 * @example
 * ```typescript
 * // Exemplo interno - função privada, mas vamos demonstrar lógica
 * 
 * const rule: MonitoringRule = {
 *   id: 'rule_123',
 *   productName: 'iPhone 15 Pro',
 *   platforms: [CompetitorPlatform.MERCADO_LIVRE],
 *   frequency: 'daily',
 *   priceThreshold: 5,  // Alertar com mudança >= 5%
 *   isActive: true,
 *   createdAt: new Date()
 * };
 * 
 * const currentPrices: CompetitorPricing[] = [
 *   {
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Magazine Luiza',
 *     price: 5199.00,
 *     url: 'https://...'
 *   },
 *   {
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Fast Shop',
 *     price: 5650.00,
 *     url: 'https://...'
 *   }
 * ];
 * 
 * const history: PriceHistory[] = [
 *   {
 *     productName: 'iPhone 15 Pro',
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Magazine Luiza',
 *     prices: [
 *       { price: 5499.00, timestamp: new Date('2024-10-18'), source: 'automated' },
 *       { price: 5299.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 *     ]
 *   },
 *   {
 *     productName: 'iPhone 15 Pro',
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Fast Shop',
 *     prices: [
 *       { price: 5599.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 *     ]
 *   }
 * ];
 * 
 * // Executar detecção
 * await detectPriceChanges(rule, currentPrices, history);
 * 
 * // Análise do que aconteceu:
 * 
 * // 1. Magazine Luiza:
 * //    - Preço anterior: R$ 5299.00 (última entrada do histórico)
 * //    - Preço atual: R$ 5199.00
 * //    - Mudança: -1.9% (abaixo do threshold de 5%)
 * //    - Resultado: SEM alerta
 * 
 * // 2. Fast Shop:
 * //    - Tem apenas 1 entrada no histórico (precisa >= 2)
 * //    - Resultado: SEM alerta (histórico insuficiente)
 * 
 * // Caso com alerta:
 * const historyWithBigChange: PriceHistory[] = [
 *   {
 *     productName: 'iPhone 15 Pro',
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Magazine Luiza',
 *     prices: [
 *       { price: 5499.00, timestamp: new Date('2024-10-18'), source: 'automated' },
 *       { price: 5899.00, timestamp: new Date('2024-10-19'), source: 'automated' }
 *       // Preço subiu R$ 400 (histórico)
 *     ]
 *   }
 * ];
 * 
 * const newCurrentPrices: CompetitorPricing[] = [
 *   {
 *     platform: CompetitorPlatform.MERCADO_LIVRE,
 *     seller: 'Magazine Luiza',
 *     price: 5199.00,  // Caiu de R$ 5899 para R$ 5199
 *     url: 'https://...'
 *   }
 * ];
 * 
 * await detectPriceChanges(rule, newCurrentPrices, historyWithBigChange);
 * 
 * // Análise:
 * // - Preço anterior: R$ 5899.00
 * // - Preço atual: R$ 5199.00
 * // - Mudança: -11.9% (acima do threshold de 5%)
 * // - Severidade: 'medium' (|11.9%| < 15%)
 * // - Resultado: ALERTA GERADO ✅
 * 
 * // Alerta gerado:
 * // {
 * //   id: 'alert_1729368000000_xyz',
 * //   type: 'competitor_price_change',
 * //   severity: 'medium',
 * //   title: 'Mudança de preço detectada',
 * //   message: 'Magazine Luiza reduziu o preço em 11.9%',
 * //   timestamp: Date,
 * //   actionable: false,  // (11.9% < 20%)
 * //   suggestedAction: 'Atenção: concorrente reduziu preço significativamente',
 * //   productId: 'iPhone 15 Pro'
 * // }
 * 
 * // Logs gerados:
 * // INFO: Alerta de concorrência gerado {...}
 * // INFO: 🚨 ALERTA: Mudança de preço detectada - Magazine Luiza reduziu...
 * ```
 * 
 * @remarks
 * **Lógica de detecção**:
 * 
 * 1. **Para cada concorrente**:
 *    - Busca histórico correspondente (platform + seller)
 *    - Requer mínimo 2 entradas no histórico
 *    - Compara preço atual vs penúltimo preço
 * 
 * 2. **Cálculo da mudança**:
 *    ```typescript
 *    const previousPrice = prices[prices.length - 2].price;
 *    const currentPrice = competitor.price;
 *    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
 *    ```
 * 
 * 3. **Threshold**:
 *    - Se `|changePercent| >= rule.priceThreshold` → ALERTA
 *    - Exemplo: threshold=5% → alerta com mudanças >= ±5%
 * 
 * 4. **Severidade do alerta**:
 *    - `|changePercent| > 15%` → severity: 'high'
 *    - `|changePercent| <= 15%` → severity: 'medium'
 * 
 * 5. **Actionable**:
 *    - `|changePercent| > 20%` → actionable: true
 *    - Mudanças muito grandes requerem ação imediata
 * 
 * **Geração de sugestões**:
 * - Delegado para `generatePriceChangeSuggestions()`
 * - Primeira sugestão vira `suggestedAction`
 * 
 * **Processamento de alertas**:
 * - Se alertas gerados → `processAlerts()` é chamado
 * - Logs são registrados
 * - Alertas podem ser enviados (email, webhook, etc.)
 * 
 * **Estrutura do alerta**:
 * ```typescript
 * {
 *   id: 'alert_{timestamp}_{random}',
 *   type: 'competitor_price_change',
 *   severity: 'high' | 'medium',
 *   title: 'Mudança de preço detectada',
 *   message: 'Vendedor aumentou/reduziu o preço em X%',
 *   timestamp: new Date(),
 *   actionable: boolean,  // true se |mudança| > 20%
 *   suggestedAction: string,
 *   productId: string  // nome do produto
 * }
 * ```
 * 
 * **Por que comparar com penúltimo preço?**
 * - Última entrada (`prices[length-1]`) é o preço ATUAL que acabou de ser adicionado
 * - Penúltima entrada (`prices[length-2]`) é o preço ANTERIOR (última verificação)
 * - Permite detectar mudanças entre verificações sucessivas
 * 
 * **Edge cases**:
 * - Histórico vazio → nenhum alerta
 * - Apenas 1 entrada → nenhum alerta (precisa comparar)
 * - Mudança = 0% → nenhum alerta
 * - Vendedor desapareceu → nenhum alerta para esse vendedor
 * 
 * **Performance**:
 * - Loop sequencial por concorrente
 * - Operações O(1) por concorrente
 * - Total: O(n) onde n = número de concorrentes
 */
async function detectPriceChanges(
  rule: MonitoringRule,
  currentPrices: CompetitorPricing[],
  history: PriceHistory[]
): Promise<void> {
  const alerts: AIAlert[] = [];

  for (const competitor of currentPrices) {
    const productHistory = history.find(h => 
      h.platform === competitor.platform && h.seller === competitor.seller
    );

    if (!productHistory || productHistory.prices.length < 2) {
      continue;
    }

    const prices = productHistory.prices;
    const previousPrice = prices[prices.length - 2].price;
    const currentPrice = competitor.price;
    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

    if (Math.abs(changePercent) >= rule.priceThreshold) {
      const suggestions = generatePriceChangeSuggestions(changePercent, competitor, rule.productName);
      const alert: AIAlert = {
        id: `alert_${Date.now()}_${generateSecureId(9)}`,
        type: 'competitor_price_change',
        severity: Math.abs(changePercent) > 15 ? 'high' : 'medium',
        title: 'Mudança de preço detectada',
        message: `${competitor.seller || 'Vendedor'} ${changePercent > 0 ? 'aumentou' : 'reduziu'} o preço em ${Math.abs(changePercent).toFixed(1)}%`,
        timestamp: new Date(),
        actionable: Math.abs(changePercent) > 20,
        suggestedAction: suggestions.length > 0 ? suggestions[0] : undefined,
        productId: rule.productName
      };

      alerts.push(alert);
    }
  }

  if (alerts.length > 0) {
    await processAlerts(alerts);
  }
}

/**
 * Gera sugestões baseadas em mudanças de preço
 * 
 * Cria recomendações estratégicas de acordo com a direção e magnitude
 * da mudança de preço detectada.
 * 
 * @param changePercent - Percentual de mudança (positivo = aumento, negativo = redução)
 * @param competitor - Dados do concorrente
 * @param productName - Nome do produto
 * @returns Array de sugestões acionáveis
 * 
 * @example
 * ```typescript
 * const competitor: CompetitorPricing = {
 *   platform: CompetitorPlatform.MERCADO_LIVRE,
 *   seller: 'Magazine Luiza',
 *   price: 5799.00,
 *   url: 'https://...'
 * };
 * 
 * // Caso 1: Concorrente aumentou preço significativamente (+15%)
 * const suggestions1 = generatePriceChangeSuggestions(
 *   15,  // +15%
 *   competitor,
 *   'iPhone 15 Pro'
 * );
 * 
 * console.log('Concorrente aumentou +15%:');
 * suggestions1.forEach((s, i) => console.log(`${i + 1}. ${s}`));
 * // Output:
 * // 1. Oportunidade: concorrente aumentou preço - considere manter o seu para ganhar market share
 * // 2. Monitore se outros concorrentes seguirão o aumento
 * // 3. Revisar posicionamento de iPhone 15 Pro na plataforma mercado_livre
 * 
 * // Caso 2: Concorrente reduziu preço significativamente (-12%)
 * const suggestions2 = generatePriceChangeSuggestions(
 *   -12,  // -12%
 *   competitor,
 *   'iPhone 15 Pro'
 * );
 * 
 * console.log('\nConcorrente reduziu -12%:');
 * suggestions2.forEach((s, i) => console.log(`${i + 1}. ${s}`));
 * // Output:
 * // 1. Atenção: concorrente reduziu preço significativamente
 * // 2. Avalie se deve acompanhar a redução ou diferenciar valor
 * // 3. Verifique se é promoção temporária ou mudança permanente
 * // 4. Revisar posicionamento de iPhone 15 Pro na plataforma mercado_livre
 * 
 * // Caso 3: Pequena mudança (+3%)
 * const suggestions3 = generatePriceChangeSuggestions(
 *   3,  // +3%
 *   competitor,
 *   'iPhone 15 Pro'
 * );
 * 
 * console.log('\nPequena mudança +3%:');
 * suggestions3.forEach((s, i) => console.log(`${i + 1}. ${s}`));
 * // Output:
 * // 1. Revisar posicionamento de iPhone 15 Pro na plataforma mercado_livre
 * // (Apenas sugestão genérica - mudança não é significativa)
 * 
 * // Caso 4: Uso em alerta
 * const changePercent = -18.5;  // Queda de 18.5%
 * const allSuggestions = generatePriceChangeSuggestions(
 *   changePercent,
 *   competitor,
 *   'PlayStation 5'
 * );
 * 
 * const alert: AIAlert = {
 *   id: 'alert_123',
 *   type: 'competitor_price_change',
 *   severity: 'high',
 *   title: 'Mudança de preço detectada',
 *   message: `${competitor.seller} reduziu o preço em ${Math.abs(changePercent)}%`,
 *   timestamp: new Date(),
 *   actionable: true,
 *   suggestedAction: allSuggestions[0],  // Primeira sugestão
 *   productId: 'PlayStation 5'
 * };
 * 
 * console.log('\nAlerta criado com primeira sugestão:');
 * console.log(alert.suggestedAction);
 * // Output: Atenção: concorrente reduziu preço significativamente
 * ```
 * 
 * @remarks
 * **Lógica de sugestões**:
 * 
 * 1. **Aumento significativo** (changePercent > 10%):
 *    - Oportunidade de ganhar market share mantendo preço
 *    - Monitorar se outros seguirão o movimento
 * 
 * 2. **Redução significativa** (changePercent < -10%):
 *    - Alertar sobre redução agressiva
 *    - Avaliar se deve acompanhar ou diferenciar
 *    - Verificar se é promoção ou mudança permanente
 * 
 * 3. **Sugestão genérica** (sempre adicionada):
 *    - Revisar posicionamento na plataforma
 *    - Inclui nome do produto e plataforma
 * 
 * **Threshold de 10%**:
 * - Mudanças < 10% → apenas sugestão genérica
 * - Mudanças >= 10% → sugestões específicas + genérica
 * 
 * **Ordem das sugestões**:
 * - Primeira: Mais acionável/urgente
 * - Última: Genérica (sempre presente)
 * 
 * **Uso em detectPriceChanges()**:
 * ```typescript
 * const suggestions = generatePriceChangeSuggestions(...);
 * alert.suggestedAction = suggestions.length > 0 ? suggestions[0] : undefined;
 * ```
 * 
 * **Personalização**:
 * Você pode adicionar mais regras:
 * - Mudanças extremas (> 30%)
 * - Categoria-específicas
 * - Baseadas em histórico (tendências)
 * - Sazonalidade (Black Friday, etc.)
 * 
 * **Exemplos de personalização**:
 * ```typescript
 * if (changePercent > 30) {
 *   suggestions.unshift('URGENTE: Mudança extrema detectada - revisar imediatamente');
 * }
 * 
 * if (competitor.platform === 'amazon' && changePercent < -15) {
 *   suggestions.push('Amazon geralmente puxa mercado - considere ajuste preventivo');
 * }
 * ```
 */
function generatePriceChangeSuggestions(
  changePercent: number,
  competitor: CompetitorPricing,
  productName: string
): string[] {
  const suggestions: string[] = [];

  if (changePercent > 10) {
    suggestions.push('Oportunidade: concorrente aumentou preço - considere manter o seu para ganhar market share');
    suggestions.push('Monitore se outros concorrentes seguirão o aumento');
  } else if (changePercent < -10) {
    suggestions.push('Atenção: concorrente reduziu preço significativamente');
    suggestions.push('Avalie se deve acompanhar a redução ou diferenciar valor');
    suggestions.push('Verifique se é promoção temporária ou mudança permanente');
  }

  suggestions.push(`Revisar posicionamento de ${productName} na plataforma ${competitor.platform}`);
  
  return suggestions;
}

/**
 * Processa alertas gerados
 * 
 * Registra logs e envia alertas para cada mudança de preço detectada.
 * 
 * @param alerts - Array de alertas a processar
 * @returns Promise que resolve quando todos os alertas são processados
 * 
 * @example
 * ```typescript
 * // Criar alguns alertas
 * const alerts: AIAlert[] = [
 *   {
 *     id: 'alert_1729368000_abc',
 *     type: 'competitor_price_change',
 *     severity: 'high',
 *     title: 'Mudança de preço detectada',
 *     message: 'Magazine Luiza reduziu o preço em 18.5%',
 *     timestamp: new Date(),
 *     actionable: false,
 *     suggestedAction: 'Atenção: concorrente reduziu preço significativamente',
 *     productId: 'iPhone 15 Pro'
 *   },
 *   {
 *     id: 'alert_1729368001_xyz',
 *     type: 'competitor_price_change',
 *     severity: 'medium',
 *     title: 'Mudança de preço detectada',
 *     message: 'Amazon aumentou o preço em 12.3%',
 *     timestamp: new Date(),
 *     actionable: false,
 *     suggestedAction: 'Oportunidade: concorrente aumentou preço',
 *     productId: 'iPhone 15 Pro'
 *   }
 * ];
 * 
 * // Processar alertas
 * await processAlerts(alerts);
 * 
 * // Logs gerados:
 * // INFO: Alerta de concorrência gerado
 * //   {
 * //     alertId: 'alert_1729368000_abc',
 * //     type: 'competitor_price_change',
 * //     severity: 'high',
 * //     productId: 'iPhone 15 Pro'
 * //   }
 * // INFO: 🚨 ALERTA: Mudança de preço detectada - Magazine Luiza reduziu...
 * //
 * // INFO: Alerta de concorrência gerado
 * //   {
 * //     alertId: 'alert_1729368001_xyz',
 * //     type: 'competitor_price_change',
 * //     severity: 'medium',
 * //     productId: 'iPhone 15 Pro'
 * //   }
 * // INFO: 🚨 ALERTA: Mudança de preço detectada - Amazon aumentou...
 * ```
 * 
 * @remarks
 * **Pipeline de processamento**:
 * 
 * 1. **Para cada alerta**:
 *    - Registra log estruturado com `logger.info()`
 *    - Envia alerta via `sendAlert()`
 * 
 * 2. **Logging estruturado**:
 *    ```typescript
 *    logger.info('Alerta de concorrência gerado', {
 *      alertId: alert.id,
 *      type: alert.type,
 *      severity: alert.severity,
 *      productId: alert.productId
 *    });
 *    ```
 * 
 * 3. **Envio de alerta**:
 *    - Delegado para `sendAlert()`
 *    - Implementação atual: apenas log
 *    - Pode ser estendido para email, webhook, Slack, etc.
 * 
 * **Processamento sequencial**:
 * - Loop `for...of` processa um alerta por vez
 * - Não há paralelismo (garante ordem)
 * 
 * **Uso em produção**:
 * Esta função é chamada internamente por `detectPriceChanges()`
 * quando mudanças significativas são detectadas.
 * 
 * **Extensão futura**:
 * ```typescript
 * async function processAlerts(alerts: AIAlert[]): Promise<void> {
 *   for (const alert of alerts) {
 *     // 1. Log estruturado
 *     logger.info('Alerta de concorrência gerado', {...});
 *     
 *     // 2. Enviar alerta
 *     await sendAlert(alert);
 *     
 *     // 3. Salvar no banco
 *     await supabase.from('alerts').insert({
 *       id: alert.id,
 *       type: alert.type,
 *       severity: alert.severity,
 *       message: alert.message,
 *       product_id: alert.productId,
 *       created_at: alert.timestamp
 *     });
 *     
 *     // 4. Notificar usuários (se severity = 'high')
 *     if (alert.severity === 'high') {
 *       await notifyUsers(alert);
 *     }
 *   }
 * }
 * ```
 */
async function processAlerts(alerts: AIAlert[]): Promise<void> {
  for (const alert of alerts) {
    logger.info('Alerta de concorrência gerado', {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      productId: alert.productId
    });

    await sendAlert(alert);
  }
}

/**
 * Envia um alerta (implementação simulada)
 * 
 * Registra o alerta em logs. Pode ser estendido para enviar
 * notificações por email, webhook, Slack, etc.
 * 
 * @param alert - Alerta a ser enviado
 * @returns Promise que resolve quando envio completa
 * 
 * @example
 * ```typescript
 * const alert: AIAlert = {
 *   id: 'alert_123',
 *   type: 'competitor_price_change',
 *   severity: 'high',
 *   title: 'Mudança de preço detectada',
 *   message: 'Magazine Luiza reduziu o preço em 18.5%',
 *   timestamp: new Date(),
 *   actionable: true,
 *   suggestedAction: 'Atenção: concorrente reduziu preço significativamente',
 *   productId: 'iPhone 15 Pro'
 * };
 * 
 * await sendAlert(alert);
 * 
 * // Log gerado:
 * // INFO: 🚨 ALERTA: Mudança de preço detectada - Magazine Luiza reduziu o preço em 18.5%
 * ```
 * 
 * @remarks
 * **Implementação atual**:
 * - Apenas registra log com `logger.info()`
 * - Formato: `🚨 ALERTA: {title} - {message}`
 * 
 * **Extensões possíveis**:
 * 
 * 1. **Email**:
 *    ```typescript
 *    await sendEmail({
 *      to: 'vendas@empresa.com',
 *      subject: alert.title,
 *      body: `
 *        ${alert.message}
 *        
 *        Severidade: ${alert.severity}
 *        Produto: ${alert.productId}
 *        Ação sugerida: ${alert.suggestedAction}
 *      `
 *    });
 *    ```
 * 
 * 2. **Slack**:
 *    ```typescript
 *    await fetch(process.env.SLACK_WEBHOOK_URL, {
 *      method: 'POST',
 *      body: JSON.stringify({
 *        text: `🚨 *${alert.title}*`,
 *        attachments: [{
 *          color: alert.severity === 'high' ? 'danger' : 'warning',
 *          fields: [
 *            { title: 'Mensagem', value: alert.message },
 *            { title: 'Produto', value: alert.productId },
 *            { title: 'Sugestão', value: alert.suggestedAction }
 *          ]
 *        }]
 *      })
 *    });
 *    ```
 * 
 * 3. **Push notification**:
 *    ```typescript
 *    await sendPushNotification({
 *      title: alert.title,
 *      body: alert.message,
 *      data: {
 *        alertId: alert.id,
 *        productId: alert.productId,
 *        severity: alert.severity
 *      }
 *    });
 *    ```
 * 
 * 4. **Webhook**:
 *    ```typescript
 *    await fetch(process.env.ALERT_WEBHOOK_URL, {
 *      method: 'POST',
 *      headers: { 'Content-Type': 'application/json' },
 *      body: JSON.stringify(alert)
 *    });
 *    ```
 * 
 * **Uso interno**:
 * Esta função é chamada por `processAlerts()` para cada alerta individual.
 */
async function sendAlert(alert: AIAlert): Promise<void> {
  logger.info(`🚨 ALERTA: ${alert.title} - ${alert.message}`);
}
