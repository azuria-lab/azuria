import { AIAlert, CompetitorPlatform, CompetitorPricing } from '@/shared/types/ai';
import { competitorService } from './competitorService';
import { logger } from './logger';
import { generateSecureId } from '@/utils/secureRandom';

interface MonitoringRule {
  id: string;
  productName: string;
  platforms: CompetitorPlatform[];
  frequency: 'hourly' | 'daily' | 'weekly';
  priceThreshold: number; // Percentual de mudança para alertar
  isActive: boolean;
  createdAt: Date;
  lastCheck?: Date;
}

interface PriceHistory {
  productName: string;
  platform: CompetitorPlatform;
  seller: string;
  prices: Array<{
    price: number;
    timestamp: Date;
    source: string;
  }>;
}

interface MarketTrend {
  productName: string;
  avgPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  volatility: number;
  trendDirection: 'up' | 'down' | 'stable';
  opportunities: string[];
}

class AdvancedCompetitorService {
  private readonly monitoringRules: Map<string, MonitoringRule> = new Map();
  private readonly priceHistory: Map<string, PriceHistory[]> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Inicia monitoramento automático
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    // Executa verificação a cada 5 minutos (em produção seria menos frequente)
    this.monitoringInterval = setInterval(() => {
      this.runMonitoringCycle();
    }, 5 * 60 * 1000);

    logger.info('Monitoramento de concorrentes iniciado');
  }

  /**
   * Para monitoramento automático
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info('Monitoramento de concorrentes parado');
  }

  /**
   * Adiciona regra de monitoramento
   */
  addMonitoringRule(
    productName: string,
    platforms: CompetitorPlatform[] = Object.values(CompetitorPlatform),
    frequency: 'hourly' | 'daily' | 'weekly' = 'daily',
    priceThreshold: number = 5
  ): string {
    const ruleId = `rule_${Date.now()}_${generateSecureId(9)}`;
    
    const rule: MonitoringRule = {
      id: ruleId,
      productName,
      platforms,
      frequency,
      priceThreshold,
      isActive: true,
      createdAt: new Date()
    };

    this.monitoringRules.set(ruleId, rule);
    logger.info('Regra de monitoramento adicionada', { ruleId, productName });
    
    return ruleId;
  }

  /**
   * Remove regra de monitoramento
   */
  removeMonitoringRule(ruleId: string): boolean {
    const removed = this.monitoringRules.delete(ruleId);
    if (removed) {
      logger.info('Regra de monitoramento removida', { ruleId });
    }
    return removed;
  }

  /**
   * Executa ciclo de monitoramento
   */
  private async runMonitoringCycle(): Promise<void> {
    const activeRules = Array.from(this.monitoringRules.values())
      .filter(rule => rule.isActive && this.shouldCheckRule(rule));

    for (const rule of activeRules) {
      try {
        await this.checkRule(rule);
        rule.lastCheck = new Date();
      } catch (error) {
        logger.trackAIError('monitoring_rule_check', error, { ruleId: rule.id });
      }
    }
  }

  /**
   * Verifica se deve executar a regra baseado na frequência
   */
  private shouldCheckRule(rule: MonitoringRule): boolean {
    if (!rule.lastCheck) {return true;}

    const now = new Date();
    const lastCheck = rule.lastCheck;
    const timeDiff = now.getTime() - lastCheck.getTime();

    switch (rule.frequency) {
      case 'hourly':
        return timeDiff > 60 * 60 * 1000; // 1 hora
      case 'daily':
        return timeDiff > 24 * 60 * 60 * 1000; // 24 horas
      case 'weekly':
        return timeDiff > 7 * 24 * 60 * 60 * 1000; // 7 dias
      default:
        return false;
    }
  }

  /**
   * Executa verificação de uma regra específica
   */
  private async checkRule(rule: MonitoringRule): Promise<void> {
    const currentPrices = await competitorService.analyzeCompetitors(rule.productName);
    const historicalKey = `${rule.productName}_${rule.platforms.join('_')}`;
    const history = this.priceHistory.get(historicalKey) || [];

    // Adiciona preços atuais ao histórico
    for (const competitor of currentPrices) {
      // CompetitorData não tem platform e seller, usa competitor_name e source_url
      const platformStr = competitor.source_url.includes('mercadolivre') ? 'mercadolivre' :
                          competitor.source_url.includes('amazon') ? 'amazon' :
                          competitor.source_url.includes('shopee') ? 'shopee' : 'other';
      const platform = platformStr as CompetitorPlatform;
      const seller = competitor.competitor_name;
      
      let productHistory = history.find(h => 
        h.platform === platform && h.seller === seller
      );

      if (!productHistory) {
        productHistory = {
          productName: rule.productName,
          platform,
          seller: seller || 'Desconhecido',
          prices: []
        };
        if (productHistory) {
          history.push(productHistory);
        }
      }

      if (productHistory) {
        productHistory.prices.push({
          price: competitor.current_price,
          timestamp: new Date(),
          source: 'automated_monitoring'
        });

        // Mantém apenas os últimos 100 registros de preço
        if (productHistory.prices.length > 100) {
          productHistory.prices = productHistory.prices.slice(-100);
        }
      }
    }

    this.priceHistory.set(historicalKey, history);

    // Converte CompetitorData[] para CompetitorPricing[]
    const competitorPricings: CompetitorPricing[] = currentPrices.map(c => ({
      platform: platform as CompetitorPlatform,
      seller: c.competitor_name,
      price: c.current_price,
      url: c.source_url,
      lastChecked: c.last_checked,
    }));
    
    // Verifica se há mudanças significativas
    await this.detectPriceChanges(rule, competitorPricings, history);
  }

  /**
   * Detecta mudanças significativas de preço
   */
  private async detectPriceChanges(
    rule: MonitoringRule,
    currentPrices: CompetitorPricing[],
    history: PriceHistory[]
  ): Promise<void> {
    const alerts: AIAlert[] = [];

    for (const competitor of currentPrices) {
      const productHistory = history.find(h => 
        h.platform === competitor.platform && h.seller === competitor.seller
      );

      if (!productHistory || productHistory.prices.length < 2) {continue;}

      const prices = productHistory.prices;
      const previousPrice = prices[prices.length - 2].price;
      const currentPrice = competitor.price;
      const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

      if (Math.abs(changePercent) >= rule.priceThreshold) {
        const suggestions = this.generatePriceChangeSuggestions(changePercent, competitor, rule.productName);
        const alert: AIAlert = {
          id: `alert_${Date.now()}_${generateSecureId(9)}`,
          type: 'competitor_price_change',
          severity: Math.abs(changePercent) > 15 ? 'high' : 'medium',
          title: `Mudança de preço detectada`,
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
      await this.processAlerts(alerts);
    }
  }

  /**
   * Gera sugestões baseadas em mudanças de preço
   */
  private generatePriceChangeSuggestions(
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
   */
  private async processAlerts(alerts: AIAlert[]): Promise<void> {
    for (const alert of alerts) {
      logger.info('Alerta de concorrência gerado', {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
        productId: alert.productId
      });

      // Em uma implementação real, aqui enviaria notificações
      // para webhook, email, dashboard, etc.
      await this.sendAlert(alert);
    }
  }

  /**
   * Envia alerta (simulado)
   */
  private async sendAlert(alert: AIAlert): Promise<void> {
    // Simula envio de alerta
    logger.info(`🚨 ALERTA: ${alert.title} - ${alert.message}`);
    
    // Em produção, integraria com:
    // - Sistema de notificações push
    // - Email/SMS
    // - Webhook para dashboard
    // - Slack/Teams/Discord
  }

  /**
   * Analisa tendências de mercado
   */
  async analyzeMarketTrends(productName: string): Promise<MarketTrend> {
    const historicalKey = `${productName}_all_platforms`;
    const history = this.priceHistory.get(historicalKey) || [];

    if (history.length === 0) {
      // Se não há histórico, gera tendência simulada
      return this.generateSimulatedTrend(productName);
    }

    // Calcula tendências baseadas no histórico real
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
    
    const priceChange24h = this.calculatePriceChange(prices24h);
    const priceChange7d = this.calculatePriceChange(prices7d);
    const priceChange30d = this.calculatePriceChange(prices30d);

    const volatility = this.calculateVolatility(allPrices);
    const trendDirection = this.determineTrend(priceChange7d);
    const opportunities = this.identifyOpportunities(priceChange24h, priceChange7d, volatility);

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
   * Calcula mudança percentual de preço
   */
  private calculatePriceChange(prices: Array<{ price: number; timestamp: Date }>): number {
    if (prices.length < 2) {return 0;}
    
    const firstPrice = prices[0].price;
    const lastPrice = prices[prices.length - 1].price;
    
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }

  /**
   * Calcula volatilidade dos preços
   */
  private calculateVolatility(prices: Array<{ price: number; timestamp: Date }>): number {
    if (prices.length < 2) {return 0;}
    
    const priceValues = prices.map(p => p.price);
    const avg = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
    const variance = priceValues.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / priceValues.length;
    
    return Math.sqrt(variance) / avg * 100; // Coeficiente de variação
  }

  /**
   * Determina direção da tendência
   */
  private determineTrend(priceChange7d: number): 'up' | 'down' | 'stable' {
    if (priceChange7d > 3) {return 'up';}
    if (priceChange7d < -3) {return 'down';}
    return 'stable';
  }

  /**
   * Identifica oportunidades baseadas nas tendências
   */
  private identifyOpportunities(
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
   */
  private generateSimulatedTrend(productName: string): MarketTrend {
    // Simula tendências baseadas no hash do nome do produto
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      const char = productName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    const random = Math.abs(hash) / 2147483647; // Normaliza para 0-1
    
    const basePrice = 50 + (random * 200); // R$ 50-250
    const change24h = (random - 0.5) * 10; // -5% a +5%
    const change7d = (random - 0.5) * 20; // -10% a +10%
    const change30d = (random - 0.5) * 40; // -20% a +20%
    const volatility = random * 15; // 0-15%

    return {
      productName,
      avgPrice: Math.round(basePrice * 100) / 100,
      priceChange24h: Math.round(change24h * 100) / 100,
      priceChange7d: Math.round(change7d * 100) / 100,
      priceChange30d: Math.round(change30d * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      trendDirection: this.determineTrend(change7d),
      opportunities: this.identifyOpportunities(change24h, change7d, volatility)
    };
  }

  /**
   * Obtém histórico de preços
   */
  getPriceHistory(productName: string): PriceHistory[] {
    const historicalKey = `${productName}_all_platforms`;
    return this.priceHistory.get(historicalKey) || [];
  }

  /**
   * Obtém regras de monitoramento ativas
   */
  getActiveRules(): MonitoringRule[] {
    return Array.from(this.monitoringRules.values()).filter(rule => rule.isActive);
  }

  /**
   * Obtém estatísticas do monitoramento
   */
  getMonitoringStats(): {
    totalRules: number;
    activeRules: number;
    totalProducts: number;
    totalAlerts24h: number;
    averageCheckFrequency: string;
  } {
    const rules = Array.from(this.monitoringRules.values());
    const activeRules = rules.filter(r => r.isActive);
    const uniqueProducts = new Set(rules.map(r => r.productName));

    // Simula alertas das últimas 24h
    const totalAlerts24h = Math.floor(Math.random() * 10);

    const frequencies = activeRules.map(r => r.frequency);
    let avgFrequency = 0;
    
    if (frequencies.length > 0) {
      const totalHours = frequencies.reduce((acc, freq) => {
        if (freq === 'hourly') {return acc + 1;}
        if (freq === 'daily') {return acc + 24;}
        return acc + 168; // weekly
      }, 0);
      avgFrequency = totalHours / frequencies.length;
    }

    let frequencyLabel = 'Baixa';
    if (avgFrequency < 2) {
      frequencyLabel = 'Alta';
    } else if (avgFrequency < 24) {
      frequencyLabel = 'Média';
    }

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      totalProducts: uniqueProducts.size,
      totalAlerts24h,
      averageCheckFrequency: frequencyLabel
    };
  }
}

export const advancedCompetitorService = new AdvancedCompetitorService();