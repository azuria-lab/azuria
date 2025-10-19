/**
 * Tipos do Serviço Avançado de Monitoramento de Concorrentes
 * 
 * Define todas as interfaces e tipos usados no monitoramento e análise de concorrência.
 * 
 * @module types
 * 
 * @remarks
 * **Organização**: 6 interfaces principais para monitoramento de preços e análise de mercado
 * 
 * **Dependências**: Importa `AIAlert` e `CompetitorPlatform` de `@/shared/types/ai`
 */

import { AIAlert, CompetitorPlatform } from '@/shared/types/ai';

/**
 * Regra de monitoramento de concorrentes
 * 
 * Define como e quando um produto deve ser monitorado nas plataformas.
 * 
 * @interface MonitoringRule
 * 
 * @property {string} id - Identificador único da regra (gerado automaticamente)
 * @property {string} productName - Nome do produto a monitorar
 * @property {CompetitorPlatform[]} platforms - Plataformas onde buscar (ex: ['mercadolivre', 'amazon'])
 * @property {'hourly' | 'daily' | 'weekly'} frequency - Frequência de verificação
 * @property {number} priceThreshold - % de mudança para gerar alerta (ex: 5 = 5%)
 * @property {boolean} isActive - Se a regra está ativa
 * @property {Date} createdAt - Data de criação da regra
 * @property {Date} [lastCheck] - Data da última verificação (opcional)
 * 
 * @example
 * ```typescript
 * const rule: MonitoringRule = {
 *   id: 'rule_abc123',
 *   productName: 'iPhone 15 Pro',
 *   platforms: ['mercadolivre', 'amazon'],
 *   frequency: 'daily',
 *   priceThreshold: 5,
 *   isActive: true,
 *   createdAt: new Date(),
 *   lastCheck: new Date()
 * };
 * ```
 * 
 * @remarks
 * **Criação**: Use `addMonitoringRule()` para criar regras com ID gerado automaticamente
 * 
 * **Frequência**:
 * - `hourly`: Verifica a cada hora
 * - `daily`: Verifica 1x por dia
 * - `weekly`: Verifica 1x por semana
 * 
 * **Threshold**: Define sensibilidade de alertas (5% = alerta se preço mudar ≥5%)
 */
export interface MonitoringRule {
  id: string;
  productName: string;
  platforms: CompetitorPlatform[];
  frequency: 'hourly' | 'daily' | 'weekly';
  priceThreshold: number;
  isActive: boolean;
  createdAt: Date;
  lastCheck?: Date;
}

/**
 * Histórico de preços de um produto
 * 
 * Armazena todos os registros de preço de um produto em uma plataforma específica.
 * 
 * @interface PriceHistory
 * 
 * @property {string} productName - Nome do produto
 * @property {CompetitorPlatform} platform - Plataforma de origem (ex: 'mercadolivre')
 * @property {string} seller - Nome do vendedor
 * @property {PriceEntry[]} prices - Array de registros de preço ao longo do tempo
 * 
 * @example
 * ```typescript
 * const history: PriceHistory = {
 *   productName: 'Samsung Galaxy S24',
 *   platform: 'mercadolivre',
 *   seller: 'Samsung Oficial',
 *   prices: [
 *     { price: 4299.99, timestamp: new Date('2025-01-01'), source: 'scraper' },
 *     { price: 4199.99, timestamp: new Date('2025-01-02'), source: 'scraper' },
 *     { price: 3999.99, timestamp: new Date('2025-01-03'), source: 'api' }
 *   ]
 * };
 * console.log(`Variação: R$ ${history.prices[0].price - history.prices[2].price}`);
 * // Saída: "Variação: R$ 300"
 * ```
 * 
 * @remarks
 * **Estrutura**: Um objeto por combinação produto + plataforma + vendedor
 * 
 * **Ordenação**: `prices` geralmente ordenado por timestamp (mais antigo → mais recente)
 * 
 * **Uso**: Base para análise de tendências, volatilidade e oportunidades
 */
export interface PriceHistory {
  productName: string;
  platform: CompetitorPlatform;
  seller: string;
  prices: PriceEntry[];
}

/**
 * Entrada individual de preço em um histórico
 * 
 * Representa um registro único de preço em um momento específico.
 * 
 * @interface PriceEntry
 * 
 * @property {number} price - Preço registrado (em R$)
 * @property {Date} timestamp - Data e hora do registro
 * @property {string} source - Origem do dado (ex: 'scraper', 'api', 'manual')
 * 
 * @example
 * ```typescript
 * const entry: PriceEntry = {
 *   price: 1999.99,
 *   timestamp: new Date('2025-10-19T14:30:00'),
 *   source: 'scraper'
 * };
 * 
 * console.log(`Preço: R$ ${entry.price.toFixed(2)}`);
 * console.log(`Registrado em: ${entry.timestamp.toLocaleString('pt-BR')}`);
 * console.log(`Fonte: ${entry.source}`);
 * // Saída:
 * // Preço: R$ 1999.99
 * // Registrado em: 19/10/2025 14:30:00
 * // Fonte: scraper
 * ```
 * 
 * @remarks
 * **Granularidade**: Cada verificação de preço gera uma nova entrada
 * 
 * **Fontes comuns**:
 * - `scraper`: Dados extraídos via web scraping
 * - `api`: Dados de API oficial de plataforma
 * - `manual`: Entrada manual de usuário
 * - `simulation`: Dados simulados para testes
 * 
 * **Precisão**: Preço armazenado com 2 casas decimais (centavos)
 */
export interface PriceEntry {
  price: number;
  timestamp: Date;
  source: string;
}

/**
 * Tendência de mercado de um produto
 * 
 * Análise completa de tendências de preço com estatísticas e oportunidades.
 * 
 * @interface MarketTrend
 * 
 * @property {string} productName - Nome do produto analisado
 * @property {number} avgPrice - Preço médio do período (R$)
 * @property {number} priceChange24h - Variação de preço em 24h (%)
 * @property {number} priceChange7d - Variação de preço em 7 dias (%)
 * @property {number} priceChange30d - Variação de preço em 30 dias (%)
 * @property {number} volatility - Coeficiente de variação (0-100+)
 * @property {'up' | 'down' | 'stable'} trendDirection - Direção da tendência
 * @property {string[]} opportunities - Oportunidades estratégicas identificadas
 * 
 * @example
 * ```typescript
 * const trend: MarketTrend = {
 *   productName: 'PlayStation 5',
 *   avgPrice: 3899.99,
 *   priceChange24h: -2.5,
 *   priceChange7d: -5.2,
 *   priceChange30d: +3.8,
 *   volatility: 8.5,
 *   trendDirection: 'down',
 *   opportunities: [
 *     'Preço em queda (-5.2% em 7d) - ótimo momento para compra',
 *     'Volatilidade baixa (8.5%) indica estabilidade'
 *   ]
 * };
 * 
 * console.log(`Tendência: ${trend.trendDirection}`);
 * console.log(`Mudança semanal: ${trend.priceChange7d}%`);
 * console.log(`Oportunidades: ${trend.opportunities.length}`);
 * // Saída:
 * // Tendência: down
 * // Mudança semanal: -5.2%
 * // Oportunidades: 2
 * ```
 * 
 * @remarks
 * **Períodos de análise**: 24h, 7 dias, 30 dias para capturar tendências de curto, médio e longo prazo
 * 
 * **Volatilidade**:
 * - `< 10%`: Baixa (preços estáveis)
 * - `10-20%`: Média (flutuações moderadas)
 * - `> 20%`: Alta (preços instáveis)
 * 
 * **Direção de tendência**:
 * - `up`: Preço subindo (mudança 7d > +2%)
 * - `down`: Preço caindo (mudança 7d < -2%)
 * - `stable`: Preço estável (-2% a +2%)
 * 
 * **Oportunidades**: Sugestões estratégicas baseadas em 5 regras (veja `identifyOpportunities()`)
 * 
 * **Geração**: Use `analyzeMarketTrends()` para criar instâncias desta interface
 */
export interface MarketTrend {
  productName: string;
  avgPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  volatility: number;
  trendDirection: 'up' | 'down' | 'stable';
  opportunities: string[];
}

/**
 * Estatísticas de monitoramento
 * 
 * Métricas agregadas sobre o estado atual do sistema de monitoramento.
 * 
 * @interface MonitoringStats
 * 
 * @property {number} totalRules - Total de regras cadastradas (ativas + inativas)
 * @property {number} activeRules - Número de regras ativas
 * @property {number} totalProducts - Número de produtos únicos monitorados
 * @property {number} totalAlerts24h - Alertas gerados nas últimas 24 horas
 * @property {string} averageCheckFrequency - Frequência média de verificação (ex: '4h')
 * 
 * @example
 * ```typescript
 * const stats: MonitoringStats = {
 *   totalRules: 15,
 *   activeRules: 12,
 *   totalProducts: 8,
 *   totalAlerts24h: 3,
 *   averageCheckFrequency: '6h'
 * };
 * 
 * console.log(`Regras: ${stats.activeRules}/${stats.totalRules} ativas`);
 * console.log(`Produtos monitorados: ${stats.totalProducts}`);
 * console.log(`Alertas (24h): ${stats.totalAlerts24h}`);
 * console.log(`Frequência: a cada ${stats.averageCheckFrequency}`);
 * // Saída:
 * // Regras: 12/15 ativas
 * // Produtos monitorados: 8
 * // Alertas (24h): 3
 * // Frequência: a cada 6h
 * ```
 * 
 * @remarks
 * **Cálculo**: Gerado em tempo real por `getMonitoringStats()`
 * 
 * **Frequência média**: Calculada a partir de regras ativas (hourly=1h, daily=24h, weekly=168h)
 * 
 * **Produtos únicos**: Conta produtos distintos, mesmo com múltiplas regras
 * 
 * **Alertas 24h**: Atualmente simulado (0-10 aleatório) - futura integração com logs reais
 * 
 * **Uso**: Dashboard de administração, relatórios de performance
 */
export interface MonitoringStats {
  totalRules: number;
  activeRules: number;
  totalProducts: number;
  totalAlerts24h: number;
  averageCheckFrequency: string;
}

/**
 * Alerta de mudança de preço
 * 
 * Estende `AIAlert` com informações específicas de variação de preço.
 * 
 * @interface PriceChangeAlert
 * @extends {AIAlert}
 * 
 * @property {number} changePercent - Percentual de mudança (ex: -5.2 = queda de 5.2%)
 * @property {number} previousPrice - Preço anterior (R$)
 * @property {number} currentPrice - Preço atual (R$)
 * 
 * @example
 * ```typescript
 * const alert: PriceChangeAlert = {
 *   // Propriedades de AIAlert
 *   id: 'alert_xyz789',
 *   type: 'price_change',
 *   message: 'Preço do iPhone 15 Pro caiu 8%',
 *   severity: 'high',
 *   timestamp: new Date(),
 *   productId: 'prod_123',
 *   
 *   // Propriedades específicas de PriceChangeAlert
 *   changePercent: -8.0,
 *   previousPrice: 7999.99,
 *   currentPrice: 7359.99
 * };
 * 
 * const savings = alert.previousPrice - alert.currentPrice;
 * console.log(`${alert.message}`);
 * console.log(`Economia: R$ ${savings.toFixed(2)}`);
 * // Saída:
 * // Preço do iPhone 15 Pro caiu 8%
 * // Economia: R$ 640.00
 * ```
 * 
 * @remarks
 * **Herança**: Inclui todas as propriedades de `AIAlert` (id, type, message, severity, timestamp, productId)
 * 
 * **Geração**: Criado por `detectPriceChanges()` quando mudança ≥ threshold
 * 
 * **Severidade típica**:
 * - `high`: Mudança > 10%
 * - `medium`: Mudança 5-10%
 * - `low`: Mudança < 5%
 * 
 * **Sinal de changePercent**:
 * - Negativo: Preço caiu (oportunidade de compra)
 * - Positivo: Preço subiu (alerta de aumento)
 * 
 * **Processamento**: Use `processAlerts()` para logar e enviar alertas
 */
export interface PriceChangeAlert extends AIAlert {
  changePercent: number;
  previousPrice: number;
  currentPrice: number;
}
