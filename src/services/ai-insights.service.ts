/**
 * AI Insights Service
 * 
 * Serviço de inteligência artificial para análise de marketplace
 */

import type { 
  AIInsightsReport, 
  CategorySuggestion,
  PriceRecommendation, 
  SalesOpportunity,
  SalesPrediction 
} from '@/types/ai-insights';

class AIInsightsService {
  private calculateRiskLevel(priceChangePercent: number): 'low' | 'medium' | 'high' {
    const absChange = Math.abs(priceChangePercent);
    if (absChange > 10) {
      return 'high';
    }
    if (absChange > 5) {
      return 'medium';
    }
    return 'low';
  }

  private getPeriodDays(period: '7d' | '30d' | '90d'): number {
    if (period === '7d') {
      return 7;
    }
    if (period === '30d') {
      return 30;
    }
    return 90;
  }

  private calculateTrend(trendFactor: number): 'increasing' | 'stable' | 'decreasing' {
    if (trendFactor > 0.2) {
      return 'increasing';
    }
    if (trendFactor < -0.2) {
      return 'decreasing';
    }
    return 'stable';
  }

  /**
   * Gera recomendações de preço baseadas em IA
   */
  async generatePriceRecommendations(
    _marketplaceId: string,
    _productIds?: string[]
  ): Promise<PriceRecommendation[]> {
    // Em produção, chamar API de ML real
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulação de dados
    const products = [
      {
        id: 'prod-1',
        name: 'iPhone 15 Pro 256GB',
        currentPrice: 7299,
        marketAvg: 6899,
        marketLow: 6499,
        marketHigh: 7499,
        competitorCount: 147
      },
      {
        id: 'prod-2',
        name: 'Samsung Galaxy S24 Ultra',
        currentPrice: 6499,
        marketAvg: 6299,
        marketLow: 5899,
        marketHigh: 6799,
        competitorCount: 89
      },
      {
        id: 'prod-3',
        name: 'MacBook Air M3 13"',
        currentPrice: 9299,
        marketAvg: 9499,
        marketLow: 8999,
        marketHigh: 9999,
        competitorCount: 56
      }
    ];

    return products.map(product => {
      const recommendedPrice = product.marketAvg * (0.95 + Math.random() * 0.1);
      const priceChange = recommendedPrice - product.currentPrice;
      const priceChangePercent = (priceChange / product.currentPrice) * 100;

      return {
        productId: product.id,
        productName: product.name,
        currentPrice: product.currentPrice,
        recommendedPrice: Math.round(recommendedPrice * 100) / 100,
        priceChange: Math.round(priceChange * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        confidence: 0.75 + Math.random() * 0.2,
        reasoning: [
          `${product.competitorCount} concorrentes analisados`,
          priceChange < 0 ? 'Preço acima da média do mercado' : 'Preço abaixo da média do mercado',
          'Baseado em tendência dos últimos 30 dias',
          'Considera elasticidade de demanda do produto'
        ],
        marketData: {
          competitorAvg: product.marketAvg,
          marketLow: product.marketLow,
          marketHigh: product.marketHigh,
          competitorCount: product.competitorCount
        },
        impact: {
          expectedSalesIncrease: Math.abs(priceChangePercent) * 2.5,
          expectedRevenueChange: priceChange * 50,
          riskLevel: this.calculateRiskLevel(priceChangePercent)
        }
      };
    });
  }

  /**
   * Gera previsões de vendas usando machine learning
   */
  async generateSalesPredictions(
    marketplaceId: string,
    productId: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<SalesPrediction> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const days = this.getPeriodDays(period);
    const baselineSales = 15 + Math.random() * 10;
    const trendFactor = -0.5 + Math.random();

    const predictions = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const trend = baselineSales + (trendFactor * i / days * baselineSales);
      const noise = (Math.random() - 0.5) * 5;
      const predictedSales = Math.max(0, trend + noise);
      const confidence = 0.95 - (i / days) * 0.3;

      return {
        date: date.toISOString().split('T')[0],
        predictedSales: Math.round(predictedSales),
        confidence: Math.round(confidence * 100) / 100,
        lowerBound: Math.round(predictedSales * 0.8),
        upperBound: Math.round(predictedSales * 1.2)
      };
    });

    return {
      productId,
      productName: 'iPhone 15 Pro 256GB',
      period,
      predictions,
      trend: this.calculateTrend(trendFactor),
      seasonality: {
        detected: Math.random() > 0.5,
        pattern: 'semanal',
        peakMonths: [11, 12]
      },
      accuracy: 0.85 + Math.random() * 0.1
    };
  }

  /**
   * Sugere categorias otimizadas usando NLP
   */
  async suggestCategories(
    productId: string,
    productName: string,
    _description?: string
  ): Promise<CategorySuggestion> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const categoryMappings = [
      {
        keywords: ['iphone', 'samsung', 'smartphone', 'celular'],
        category: 'Eletrônicos',
        subcategory: 'Celulares e Smartphones',
        marketplaceSpecific: {
          'mercado-livre': 'MLB1055/Celulares-e-Telefones',
          'shopee': 'Celulares-e-Acessorios',
          'amazon': 'Electronics/Cell-Phones'
        }
      },
      {
        keywords: ['notebook', 'laptop', 'macbook'],
        category: 'Informática',
        subcategory: 'Notebooks',
        marketplaceSpecific: {
          'mercado-livre': 'MLB1649/Computacao/Notebooks',
          'shopee': 'Computadores-e-Acessorios',
          'amazon': 'Computers/Laptops'
        }
      }
    ];

    const lowerName = productName.toLowerCase();
    const matchedCategory = categoryMappings.find(mapping =>
      mapping.keywords.some(keyword => lowerName.includes(keyword))
    ) || categoryMappings[0];

    return {
      productId,
      productName,
      suggestedCategories: [
        {
          category: matchedCategory.category,
          subcategory: matchedCategory.subcategory,
          confidence: 0.92,
          reasoning: 'Baseado em análise de título e palavras-chave',
          marketplaceSpecific: matchedCategory.marketplaceSpecific
        },
        {
          category: 'Eletrônicos',
          subcategory: 'Tecnologia',
          confidence: 0.78,
          reasoning: 'Categoria alternativa com boa performance',
          marketplaceSpecific: {
            'mercado-livre': 'MLB1000/Eletronicos',
            'shopee': 'Eletronicos',
            'amazon': 'Electronics'
          }
        }
      ],
      keywords: matchedCategory.keywords,
      attributes: {
        marca: 'Apple',
        modelo: 'iPhone 15 Pro',
        capacidade: '256GB'
      }
    };
  }

  /**
   * Detecta oportunidades de vendas usando análise preditiva
   */
  async detectOpportunities(_marketplaceId: string): Promise<SalesOpportunity[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'opp-1',
        type: 'price_optimization',
        priority: 'high',
        title: '3 produtos com preço acima do mercado',
        description: 'Reduza o preço em 8-12% para aumentar competitividade',
        products: ['prod-1', 'prod-5', 'prod-8'],
        metrics: {
          potentialRevenue: 12500,
          estimatedImpact: 35,
          timeframe: '30 dias'
        },
        action: {
          type: 'adjust_price',
          instructions: [
            'Reduzir preço do iPhone 15 Pro para R$ 6.899',
            'Ajustar Samsung S24 para R$ 6.299',
            'Revisar precificação do MacBook Air'
          ],
          automatable: true
        },
        detectedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      },
      {
        id: 'opp-2',
        type: 'trend_detected',
        priority: 'critical',
        title: 'Tendência de alta em Eletrônicos',
        description: 'Demanda por smartphones aumentou 47% na última semana',
        products: ['prod-1', 'prod-2', 'prod-3'],
        metrics: {
          potentialRevenue: 28900,
          estimatedImpact: 47,
          timeframe: '15 dias'
        },
        action: {
          type: 'promote',
          instructions: [
            'Aumentar estoque de smartphones em 30%',
            'Criar campanha promocional',
            'Destacar produtos em alta demanda'
          ],
          automatable: false
        },
        detectedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      },
      {
        id: 'opp-3',
        type: 'competitor_gap',
        priority: 'medium',
        title: 'Gap de mercado identificado',
        description: 'Faltam produtos na categoria "Acessórios Premium"',
        products: [],
        metrics: {
          potentialRevenue: 8500,
          estimatedImpact: 22,
          timeframe: '60 dias'
        },
        action: {
          type: 'expand_listing',
          instructions: [
            'Adicionar cases premium para iPhone',
            'Incluir carregadores rápidos',
            'Expandir linha de acessórios'
          ],
          automatable: false
        },
        detectedAt: now.toISOString()
      },
      {
        id: 'opp-4',
        type: 'seasonal_boost',
        priority: 'high',
        title: 'Pico sazonal se aproximando',
        description: 'Black Friday em 3 semanas - preparar estoque e preços',
        products: ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'],
        metrics: {
          potentialRevenue: 45000,
          estimatedImpact: 120,
          timeframe: '30 dias'
        },
        action: {
          type: 'promote',
          instructions: [
            'Garantir estoque suficiente para pico',
            'Preparar preços competitivos',
            'Configurar campanhas de marketing',
            'Testar logística de entrega'
          ],
          automatable: false
        },
        detectedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'opp-5',
        type: 'stock_alert',
        priority: 'medium',
        title: 'Produtos com baixa rotação',
        description: '5 produtos parados há mais de 45 dias',
        products: ['prod-9', 'prod-12', 'prod-15', 'prod-18', 'prod-21'],
        metrics: {
          potentialRevenue: -3200,
          estimatedImpact: -15,
          timeframe: 'imediato'
        },
        action: {
          type: 'adjust_price',
          instructions: [
            'Aplicar desconto de 15-20% para liquidação',
            'Criar bundle com produtos populares',
            'Considerar promoção relâmpago'
          ],
          automatable: true
        },
        detectedAt: now.toISOString()
      }
    ];
  }

  /**
   * Gera relatório completo de insights de IA
   */
  async generateInsightsReport(marketplaceId: string): Promise<AIInsightsReport> {
    const [priceRecommendations, opportunities] = await Promise.all([
      this.generatePriceRecommendations(marketplaceId),
      this.detectOpportunities(marketplaceId)
    ]);

    const predictions = await this.generateSalesPredictions(marketplaceId, 'prod-1', '30d');
    const categorySuggestions = await this.suggestCategories(
      'prod-1',
      'iPhone 15 Pro 256GB',
      'Smartphone Apple iPhone 15 Pro com 256GB de armazenamento'
    );

    const totalPotentialRevenue = opportunities.reduce(
      (sum, opp) => sum + (opp.metrics.potentialRevenue || 0),
      0
    );

    const avgConfidence = priceRecommendations.reduce(
      (sum, rec) => sum + rec.confidence,
      0
    ) / priceRecommendations.length;

    return {
      generatedAt: new Date().toISOString(),
      marketplace: marketplaceId,
      summary: {
        totalOpportunities: opportunities.length,
        potentialRevenue: totalPotentialRevenue,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        topRecommendation: opportunities[0]?.title || 'Nenhuma recomendação no momento'
      },
      priceRecommendations,
      predictions: [predictions],
      categorySuggestions: [categorySuggestions],
      opportunities
    };
  }
}

export const aiInsightsService = new AIInsightsService();
