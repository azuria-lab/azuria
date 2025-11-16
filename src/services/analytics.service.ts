/**
 * Analytics Service
 * 
 * Serviço para gerenciamento de analytics e métricas
 */

import type {
  AIInsight,
  AnalyticsFilter,
  AnalyticsMetric,
  AnalyticsReport,
  CategoryAnalysis,
  MarketplaceComparison,
  ProductPerformance,
  TimeRange,
  TimeSeriesData,
  TrendAnalysis
} from '@/types/marketplace-analytics';

class AnalyticsService {
  /**
   * Gera relatório completo de analytics
   */
  async generateReport(filters: AnalyticsFilter): Promise<AnalyticsReport> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const period = this.calculatePeriod(filters.timeRange);
    
    return {
      id: `report-${Date.now()}`,
      period,
      overview: {
        totalRevenue: 428500,
        totalOrders: 1247,
        avgTicket: 343.62,
        totalProfit: 128550,
        profitMargin: 30,
        conversionRate: 3.8
      },
      metrics: this.generateMetrics(),
      topProducts: this.generateTopProducts(),
      marketplaceComparison: this.generateMarketplaceComparison(),
      categoryAnalysis: this.generateCategoryAnalysis(),
      trends: this.generateTrends(),
      timeSeries: {
        revenue: this.generateTimeSeries('revenue', filters.timeRange),
        orders: this.generateTimeSeries('orders', filters.timeRange),
        conversion: this.generateTimeSeries('conversion', filters.timeRange)
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Retorna métricas principais
   */
  private generateMetrics(): AnalyticsMetric[] {
    return [
      {
        id: 'revenue',
        type: 'revenue',
        name: 'Receita Total',
        value: 428500,
        previousValue: 385200,
        change: 11.2,
        trend: 'up',
        format: 'currency',
        icon: 'dollar-sign'
      },
      {
        id: 'orders',
        type: 'orders',
        name: 'Pedidos',
        value: 1247,
        previousValue: 1156,
        change: 7.9,
        trend: 'up',
        format: 'number',
        icon: 'shopping-cart'
      },
      {
        id: 'conversion',
        type: 'conversion',
        name: 'Taxa de Conversão',
        value: 3.8,
        previousValue: 3.5,
        change: 8.6,
        trend: 'up',
        format: 'percentage',
        icon: 'trending-up'
      },
      {
        id: 'avg-ticket',
        type: 'avg_ticket',
        name: 'Ticket Médio',
        value: 343.62,
        previousValue: 333.16,
        change: 3.1,
        trend: 'up',
        format: 'currency',
        icon: 'receipt'
      },
      {
        id: 'profit-margin',
        type: 'profit_margin',
        name: 'Margem de Lucro',
        value: 30,
        previousValue: 28.5,
        change: 5.3,
        trend: 'up',
        format: 'percentage',
        icon: 'percent'
      }
    ];
  }

  /**
   * Retorna top produtos por performance
   */
  private generateTopProducts(): ProductPerformance[] {
    return [
      {
        productId: 'prod-1',
        productName: 'iPhone 15 Pro 256GB',
        sku: 'AAPL-IP15P-256-BLU',
        revenue: 145800,
        orders: 20,
        views: 2450,
        conversionRate: 0.82,
        avgPrice: 7290,
        totalProfit: 43740,
        profitMargin: 30,
        stock: 12,
        trend: 'up',
        revenueChange: 18.5
      },
      {
        productId: 'prod-2',
        productName: 'Samsung Galaxy S24 Ultra',
        sku: 'SMSG-S24U-512-BLK',
        revenue: 97500,
        orders: 15,
        views: 1890,
        conversionRate: 0.79,
        avgPrice: 6500,
        totalProfit: 29250,
        profitMargin: 30,
        stock: 8,
        trend: 'up',
        revenueChange: 12.3
      },
      {
        productId: 'prod-3',
        productName: 'MacBook Air M3 13"',
        sku: 'AAPL-MBA-M3-13-SLV',
        revenue: 74390,
        orders: 8,
        views: 1560,
        conversionRate: 0.51,
        avgPrice: 9299,
        totalProfit: 22317,
        profitMargin: 30,
        stock: 5,
        trend: 'stable',
        revenueChange: 2.1
      },
      {
        productId: 'prod-4',
        productName: 'AirPods Pro 2ª Geração',
        sku: 'AAPL-APP2-WHT',
        revenue: 54950,
        orders: 25,
        views: 3420,
        conversionRate: 0.73,
        avgPrice: 2198,
        totalProfit: 16485,
        profitMargin: 30,
        stock: 34,
        trend: 'up',
        revenueChange: 15.7
      },
      {
        productId: 'prod-5',
        productName: 'Apple Watch Ultra 2',
        sku: 'AAPL-AWU2-49-TIT',
        revenue: 33600,
        orders: 4,
        views: 890,
        conversionRate: 0.45,
        avgPrice: 8400,
        totalProfit: 10080,
        profitMargin: 30,
        stock: 3,
        trend: 'down',
        revenueChange: -5.2
      }
    ];
  }

  /**
   * Retorna comparação entre marketplaces
   */
  private generateMarketplaceComparison(): MarketplaceComparison[] {
    return [
      {
        marketplaceId: 'mercado-livre',
        marketplaceName: 'Mercado Livre',
        revenue: 171400,
        revenueShare: 40,
        orders: 523,
        ordersShare: 42,
        avgTicket: 327.82,
        conversionRate: 4.2,
        activeProducts: 45,
        topCategory: 'Eletrônicos',
        growth: 15.3
      },
      {
        marketplaceId: 'amazon',
        marketplaceName: 'Amazon',
        revenue: 128550,
        revenueShare: 30,
        orders: 361,
        ordersShare: 29,
        avgTicket: 356.09,
        conversionRate: 3.8,
        activeProducts: 38,
        topCategory: 'Eletrônicos',
        growth: 12.1
      },
      {
        marketplaceId: 'shopee',
        marketplaceName: 'Shopee',
        revenue: 85700,
        revenueShare: 20,
        orders: 274,
        ordersShare: 22,
        avgTicket: 312.77,
        conversionRate: 3.5,
        activeProducts: 42,
        topCategory: 'Moda',
        growth: 8.7
      },
      {
        marketplaceId: 'magalu',
        marketplaceName: 'Magalu',
        revenue: 42850,
        revenueShare: 10,
        orders: 89,
        ordersShare: 7,
        avgTicket: 481.46,
        conversionRate: 2.9,
        activeProducts: 28,
        topCategory: 'Eletrônicos',
        growth: 5.2
      }
    ];
  }

  /**
   * Retorna análise por categoria
   */
  private generateCategoryAnalysis(): CategoryAnalysis[] {
    return [
      {
        categoryId: 'electronics',
        categoryName: 'Eletrônicos',
        revenue: 321350,
        revenueShare: 75,
        orders: 72,
        avgPrice: 4463.19,
        products: 8,
        conversionRate: 0.68,
        trend: 'up',
        topProduct: {
          name: 'iPhone 15 Pro 256GB',
          revenue: 145800
        }
      },
      {
        categoryId: 'accessories',
        categoryName: 'Acessórios',
        revenue: 85700,
        revenueShare: 20,
        orders: 45,
        avgPrice: 1904.44,
        products: 12,
        conversionRate: 0.82,
        trend: 'up',
        topProduct: {
          name: 'AirPods Pro 2ª Geração',
          revenue: 54950
        }
      },
      {
        categoryId: 'wearables',
        categoryName: 'Wearables',
        revenue: 21450,
        revenueShare: 5,
        orders: 8,
        avgPrice: 2681.25,
        products: 5,
        conversionRate: 0.51,
        trend: 'stable',
        topProduct: {
          name: 'Apple Watch Ultra 2',
          revenue: 33600
        }
      }
    ];
  }

  /**
   * Retorna análise de tendências
   */
  private generateTrends(): TrendAnalysis[] {
    return [
      {
        id: 'trend-1',
        type: 'demand',
        title: 'Alta demanda por smartphones premium',
        description: 'Crescimento de 25% na demanda por smartphones acima de R$ 5.000 nos últimos 30 dias',
        impact: 'positive',
        severity: 'high',
        confidence: 92,
        affectedProducts: ['prod-1', 'prod-2'],
        recommendation: 'Aumentar estoque de iPhone 15 Pro e Galaxy S24 Ultra em 30%',
        data: this.generateTrendData(30)
      },
      {
        id: 'trend-2',
        type: 'seasonality',
        title: 'Pico sazonal de acessórios',
        description: 'Histórico mostra aumento de 40% nas vendas de acessórios em novembro/dezembro',
        impact: 'positive',
        severity: 'medium',
        confidence: 88,
        affectedProducts: ['prod-4'],
        recommendation: 'Preparar estoque de AirPods e carregadores para Black Friday',
        data: this.generateTrendData(90)
      },
      {
        id: 'trend-3',
        type: 'competition',
        title: 'Concorrência acirrada em wearables',
        description: '8 novos sellers entraram na categoria de smartwatches com preços 12% menores',
        impact: 'negative',
        severity: 'medium',
        confidence: 85,
        affectedProducts: ['prod-5'],
        recommendation: 'Considerar ajuste de preço ou promoção no Apple Watch Ultra 2'
      },
      {
        id: 'trend-4',
        type: 'price',
        title: 'Oportunidade de otimização de preço',
        description: 'MacBook Air M3 está 8% acima do mercado mas mantém conversão estável',
        impact: 'neutral',
        severity: 'low',
        confidence: 78,
        affectedProducts: ['prod-3'],
        recommendation: 'Manter preço atual, marca justifica premium'
      }
    ];
  }

  /**
   * Retorna insights de IA
   */
  async getAIInsights(): Promise<AIInsight[]> {
    await new Promise(resolve => setTimeout(resolve, 600));

    return [
      {
        id: 'insight-1',
        type: 'opportunity',
        priority: 'high',
        title: 'Oportunidade de cross-sell identificada',
        description: '73% dos clientes que compram iPhone também visualizam AirPods. Apenas 28% convertem.',
        impact: {
          metric: 'revenue',
          estimatedChange: 15,
          estimatedValue: 12450
        },
        actions: [
          { id: 'create-bundle', label: 'Criar Combo', action: 'create_bundle', variant: 'primary' },
          { id: 'send-offer', label: 'Enviar Oferta', action: 'send_offer', variant: 'secondary' }
        ],
        confidence: 87,
        basedOn: ['purchase_history', 'browsing_behavior', 'cart_analysis'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'insight-2',
        type: 'warning',
        priority: 'critical',
        title: 'Risco de ruptura de estoque',
        description: 'Apple Watch Ultra 2 tem apenas 3 unidades e venda média de 1.2 por semana. Ruptura em 2-3 dias.',
        impact: {
          metric: 'revenue',
          estimatedChange: -8,
          estimatedValue: -8400
        },
        actions: [
          { id: 'reorder', label: 'Reabastecer', action: 'reorder', variant: 'primary' },
          { id: 'pause-ads', label: 'Pausar Anúncios', action: 'pause_ads', variant: 'destructive' }
        ],
        confidence: 95,
        basedOn: ['stock_level', 'sales_velocity', 'supplier_lead_time'],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'insight-3',
        type: 'recommendation',
        priority: 'medium',
        title: 'Ajuste de preço recomendado',
        description: 'Samsung S24 Ultra pode aumentar em 3% sem perder conversão, baseado em análise de elasticidade.',
        impact: {
          metric: 'profit_margin',
          estimatedChange: 12,
          estimatedValue: 2925
        },
        actions: [
          { id: 'apply-price', label: 'Aplicar Preço', action: 'apply_price', variant: 'primary' },
          { id: 'test-ab', label: 'Teste A/B', action: 'ab_test', variant: 'secondary' }
        ],
        confidence: 82,
        basedOn: ['price_elasticity', 'competitor_analysis', 'demand_forecast'],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Calcula período com base no time range
   */
  private calculatePeriod(range: TimeRange): { start: string; end: string; range: TimeRange } {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2024, 0, 1);
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      range
    };
  }

  /**
   * Gera dados de série temporal
   */
  private generateTimeSeries(type: 'revenue' | 'orders' | 'conversion', range: TimeRange): TimeSeriesData[] {
    let days: number;
    if (range === '7d') {
      days = 7;
    } else if (range === '30d') {
      days = 30;
    } else if (range === '90d') {
      days = 90;
    } else {
      days = 365;
    }

    const data: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      let value: number;
      if (type === 'revenue') {
        value = 10000 + Math.random() * 8000 + Math.sin(i / 7) * 2000;
      } else if (type === 'orders') {
        value = 30 + Math.random() * 20 + Math.sin(i / 7) * 5;
      } else {
        value = 3 + Math.random() * 1.5 + Math.sin(i / 7) * 0.5;
      }

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }

    return data;
  }

  /**
   * Gera dados de tendência
   */
  private generateTrendData(days: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const baseValue = 100;
      const trend = (days - i) / days * 25; // crescimento linear
      const noise = Math.random() * 10 - 5;
      const value = baseValue + trend + noise;

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }

    return data;
  }
}

export const analyticsService = new AnalyticsService();
