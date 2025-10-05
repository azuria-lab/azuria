import { CompetitorPlatform, CompetitorPricing } from '@/shared/types/ai';
import { logger } from './logger';

interface CompetitorSearchParams {
  productName: string;
  category?: string;
  maxResults?: number;
  platforms?: CompetitorPlatform[];
}

class CompetitorService {
  private readonly PLATFORMS = {
    [CompetitorPlatform.MERCADO_LIVRE]: {
      name: 'Mercado Livre',
      baseUrl: 'https://lista.mercadolivre.com.br',
      enabled: true
    },
    [CompetitorPlatform.SHOPEE]: {
      name: 'Shopee',
      baseUrl: 'https://shopee.com.br',
      enabled: true
    },
    [CompetitorPlatform.AMAZON]: {
      name: 'Amazon',
      baseUrl: 'https://amazon.com.br',
      enabled: true
    },
    [CompetitorPlatform.AMERICANAS]: {
      name: 'Americanas',
      baseUrl: 'https://americanas.com.br',
      enabled: true
    }
  };

  /**
   * Analisa preços dos concorrentes (simulado)
   */
  async analyzeCompetitors(productName: string): Promise<CompetitorPricing[]> {
    try {
      const startTime = Date.now();
      
      // Em uma implementação real, aqui faria web scraping ou chamadas para APIs
      // Por enquanto, vamos simular dados realistas
      const mockData = await this.generateMockCompetitorData(productName);

      const duration = Date.now() - startTime;
      logger.trackAIUsage('competitor_analysis', duration, true, {
        productName,
        competitorsFound: mockData.length
      });

      return mockData;

    } catch (error) {
      logger.trackAIError('competitor_analysis', error, { productName });
      return []; // Retorna lista vazia em caso de erro
    }
  }

  /**
   * Monitora mudanças de preços (simulado)
   */
  async monitorPriceChanges(
    productName: string,
    currentCompetitors: CompetitorPricing[]
  ): Promise<{
    changes: Array<{
      platform: string;
      seller: string;
      oldPrice: number;
      newPrice: number;
      changePercent: number;
      changeType: 'increase' | 'decrease';
    }>;
    alerts: string[];
  }> {
    try {
      const newPrices = await this.generateMockCompetitorData(productName);
      const result = this.processPriceChanges(currentCompetitors, newPrices);

      logger.info('Monitoramento de preços concluído', {
        productName,
        changesDetected: result.changes.length,
        alertsGenerated: result.alerts.length
      });

      return result;

    } catch (error) {
      logger.trackAIError('price_monitoring', error, { productName });
      return { changes: [], alerts: [] };
    }
  }

  /**
   * Processa mudanças de preços entre duas listas
   */
  private processPriceChanges(
    currentCompetitors: CompetitorPricing[],
    newPrices: CompetitorPricing[]
  ) {
    const changes: Array<{
      platform: string;
      seller: string;
      oldPrice: number;
      newPrice: number;
      changePercent: number;
      changeType: 'increase' | 'decrease';
    }> = [];
    const alerts: string[] = [];

    for (const current of currentCompetitors) {
      const updated = newPrices.find(
        p => p.platform === current.platform && p.seller === current.seller
      );

      if (updated && updated.price !== current.price) {
        const changePercent = ((updated.price - current.price) / current.price) * 100;
        
        changes.push({
          platform: this.PLATFORMS[current.platform]?.name || current.platform,
          seller: current.seller,
          oldPrice: current.price,
          newPrice: updated.price,
          changePercent: Math.round(changePercent * 100) / 100,
          changeType: updated.price > current.price ? 'increase' : 'decrease'
        });

        // Gera alertas para mudanças significativas
        if (Math.abs(changePercent) > 5) {
          const platformName = this.PLATFORMS[current.platform]?.name || current.platform;
          const changeDirection = updated.price > current.price ? 'aumentou' : 'reduziu';
          const emoji = updated.price > current.price ? '📈' : '📉';
          
          alerts.push(
            `${emoji} ${platformName}: ${current.seller} ${changeDirection} preço em ${Math.abs(changePercent).toFixed(1)}%`
          );
        }
      }
    }

    return { changes, alerts };
  }

  /**
   * Obtém análise de posicionamento competitivo
   */
  async getCompetitivePosition(
    yourPrice: number,
    competitors: CompetitorPricing[]
  ): Promise<{
    position: 'lowest' | 'below_average' | 'average' | 'above_average' | 'highest';
    percentile: number;
    insights: string[];
    recommendations: string[];
  }> {
    if (competitors.length === 0) {
      return {
        position: 'average',
        percentile: 50,
        insights: ['Não há dados de concorrentes para comparação'],
        recommendations: ['Busque por produtos similares no mercado para comparar preços']
      };
    }

    const prices = competitors.map(c => c.price).sort((a, b) => a - b);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Calcula percentil
    const lowerPrices = prices.filter(p => p < yourPrice).length;
    const percentile = (lowerPrices / prices.length) * 100;

    // Determina posição
    let position: 'lowest' | 'below_average' | 'average' | 'above_average' | 'highest';
    if (yourPrice <= minPrice) {
      position = 'lowest';
    } else if (yourPrice >= maxPrice) {
      position = 'highest';
    } else if (yourPrice < avgPrice * 0.9) {
      position = 'below_average';
    } else if (yourPrice > avgPrice * 1.1) {
      position = 'above_average';
    } else {
      position = 'average';
    }

    // Gera insights
    const insights = [
      `Seu preço: R$ ${yourPrice.toFixed(2)}`,
      `Preço médio dos concorrentes: R$ ${avgPrice.toFixed(2)}`,
      `Menor preço: R$ ${minPrice.toFixed(2)}`,
      `Maior preço: R$ ${maxPrice.toFixed(2)}`,
      `Você está no percentil ${percentile.toFixed(0)}% (${percentile > 50 ? 'acima' : 'abaixo'} da mediana)`
    ];

    // Gera recomendações
    const recommendations = this.generatePositionRecommendations(position, yourPrice, avgPrice, minPrice, maxPrice);

    return {
      position,
      percentile: Math.round(percentile),
      insights,
      recommendations
    };
  }

  /**
   * Busca oportunidades de mercado
   */
  async findMarketOpportunities(
    productCategory: string,
    targetMargin: number
  ): Promise<{
    opportunities: Array<{
      title: string;
      description: string;
      potentialRevenue: number;
      difficulty: 'low' | 'medium' | 'high';
      timeToMarket: string;
    }>;
    marketInsights: string[];
  }> {
    // Simula análise de oportunidades de mercado
    const opportunities = [
      {
        title: 'Nicho Premium',
        description: 'Produtos com diferenciação e valor agregado podem sustentar preços 20-30% maiores',
        potentialRevenue: 5000,
        difficulty: 'medium' as const,
        timeToMarket: '2-3 meses'
      },
      {
        title: 'Mercado B2B',
        description: 'Vendas para empresas geralmente têm margens maiores e pedidos recorrentes',
        potentialRevenue: 8000,
        difficulty: 'high' as const,
        timeToMarket: '4-6 meses'
      },
      {
        title: 'Cross-sell',
        description: 'Produtos complementares podem aumentar o ticket médio em 40%',
        potentialRevenue: 3000,
        difficulty: 'low' as const,
        timeToMarket: '1 mês'
      }
    ];

    const marketInsights = [
      `Categoria ${productCategory} tem crescimento médio de 15% ao ano`,
      'Sazonalidade forte em novembro/dezembro (+40% nas vendas)',
      'Consumidores valorizam entrega rápida (+25% disposição a pagar mais)',
      'Mercado móvel representa 60% das compras online'
    ];

    return {
      opportunities,
      marketInsights
    };
  }

  /**
   * Gera dados simulados de concorrentes (substitui web scraping real)
   */
  private async generateMockCompetitorData(productName: string): Promise<CompetitorPricing[]> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Gera preços realistas baseados no nome do produto
    const basePrice = this.generateBasePriceFromName(productName);
    const competitors: CompetitorPricing[] = [];

    const platforms = [
      CompetitorPlatform.MERCADO_LIVRE,
      CompetitorPlatform.SHOPEE,
      CompetitorPlatform.AMAZON,
      CompetitorPlatform.AMERICANAS
    ];

    for (const platform of platforms) {
      // 2-4 vendedores por plataforma
      const sellerCount = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < sellerCount; i++) {
        const priceVariation = 0.8 + Math.random() * 0.4; // ±20% do preço base
        const price = Math.round(basePrice * priceVariation * 100) / 100;
        
        competitors.push({
          platform,
          price,
          seller: this.generateMockSellerName(platform, i),
          url: `${this.PLATFORMS[platform].baseUrl}/produto-${Math.random().toString(36).substr(2, 9)}`,
          lastUpdated: new Date()
        });
      }
    }

    return competitors.slice(0, 8); // Máximo 8 concorrentes
  }

  /**
   * Gera preço base simulado baseado no nome do produto
   */
  private generateBasePriceFromName(productName: string): number {
    // Hash simples do nome para gerar preço consistente
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      const char = productName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Converte hash em preço entre R$ 10 e R$ 500
    const price = 10 + (Math.abs(hash) % 490);
    return Math.round(price * 100) / 100;
  }

  /**
   * Gera nomes simulados de vendedores
   */
  private generateMockSellerName(platform: CompetitorPlatform, index: number): string {
    const sellers = {
      [CompetitorPlatform.MERCADO_LIVRE]: [
        'TechStore_BR', 'MegaEletronicos', 'LojaDoFuturo', 'SuperTech2024'
      ],
      [CompetitorPlatform.SHOPEE]: [
        'FashionBrasil', 'TrendyShop', 'StyleCenter', 'ModaExpress'
      ],
      [CompetitorPlatform.AMAZON]: [
        'AmazonBasics', 'TechGlobal', 'PrimeSeller', 'FastDelivery'
      ],
      [CompetitorPlatform.AMERICANAS]: [
        'LojaAmerica', 'TechAmerica', 'ExpressShop', 'MegaStore'
      ]
    };

    const platformSellers = sellers[platform] || ['VendedorPadrao'];
    return platformSellers[index % platformSellers.length];
  }

  /**
   * Gera recomendações baseadas na posição competitiva
   */
  private generatePositionRecommendations(
    position: string,
    yourPrice: number,
    avgPrice: number,
    minPrice: number,
    maxPrice: number
  ): string[] {
    const recommendations: string[] = [];

    switch (position) {
      case 'lowest':
        recommendations.push('💡 Você tem o menor preço do mercado - considere aumentar gradualmente');
        recommendations.push('🎯 Teste um preço 10% maior para melhorar a margem');
        recommendations.push('📦 Adicione valor percebido (frete grátis, garantia)');
        break;

      case 'below_average':
        recommendations.push('✅ Preço competitivo, mas ainda há espaço para aumentar');
        recommendations.push('📊 Monitore o volume de vendas antes de ajustar');
        break;

      case 'average':
        recommendations.push('⚖️ Preço bem posicionado no mercado');
        recommendations.push('🔍 Foque em diferenciação para justificar preços maiores');
        break;

      case 'above_average':
        recommendations.push('⚠️ Preço acima da média - certifique-se de oferecer valor extra');
        recommendations.push('🌟 Destaque seus diferenciais competitivos');
        recommendations.push('📈 Monitore conversão e considere pequenos ajustes');
        break;

      case 'highest':
        recommendations.push('🚨 Preço mais alto do mercado - risco de perder vendas');
        recommendations.push('💰 Considere reduzir para ficar mais competitivo');
        recommendations.push('🏆 Se mantiver preço alto, garanta qualidade superior');
        break;
    }

    // Recomendações gerais
    recommendations.push(`📊 Acompanhe a variação de preços semanalmente`);
    
    return recommendations;
  }

  /**
   * Obtém estatísticas de preços por plataforma
   */
  async getPlatformStatistics(
    competitors: CompetitorPricing[]
  ): Promise<Record<string, {
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    sellerCount: number;
    marketShare: number;
  }>> {
    const stats: Record<string, any> = {};
    const totalCompetitors = competitors.length;

    for (const platform of Object.values(CompetitorPlatform)) {
      const platformCompetitors = competitors.filter(c => c.platform === platform);
      
      if (platformCompetitors.length > 0) {
        const prices = platformCompetitors.map(c => c.price);
        
        stats[platform] = {
          averagePrice: Math.round((prices.reduce((sum, p) => sum + p, 0) / prices.length) * 100) / 100,
          lowestPrice: Math.min(...prices),
          highestPrice: Math.max(...prices),
          sellerCount: platformCompetitors.length,
          marketShare: Math.round((platformCompetitors.length / totalCompetitors) * 100)
        };
      }
    }

    return stats;
  }
}

export const competitorService = new CompetitorService();