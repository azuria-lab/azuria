/**
 * =====================================================
 * AZURIA v2.0 - PRICE MONITORING AGENT ENGINE
 * =====================================================
 * Engine autÃ´nomo que monitora preÃ§os de concorrentes 24/7
 *
 * Funcionalidades:
 * - Scraping de marketplaces (ML, Shopee, Amazon, etc)
 * - ComparaÃ§Ã£o com preÃ§os do usuÃ¡rio
 * - GeraÃ§Ã£o de alertas e sugestÃµes
 * - AnÃ¡lise de posicionamento de mercado
 *
 * @module priceMonitoringAgent
 * @created 13/12/2024
 * =====================================================
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import { callGeminiViaEdgeFunction } from './edgeFunctionHelper';

/* eslint-disable no-console */

// =====================================================
// SUPABASE HELPER (para tabelas sem tipagem)
// =====================================================

// Helper para operaÃ§Ãµes em tabelas nÃ£o tipadas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedFrom = (table: string) => supabase.from(table as any) as any;

// =====================================================
// TYPES
// =====================================================

export interface MonitoredProduct {
  id: string;
  userId: string;
  productName: string;
  sku?: string;
  ean?: string;
  category?: string;
  brand?: string;
  currentPrice: number;
  costPrice?: number;
  targetMargin?: number;
  minPrice?: number;
  maxPrice?: number;
  marketplaces: string[];
  monitorEnabled: boolean;
  checkInterval: number;
  alertThreshold: number;
  lastCheckedAt?: Date;
}

export interface CompetitorPrice {
  id: string;
  monitoredProductId: string;
  marketplace: string;
  competitorName: string;
  competitorUrl?: string;
  price: number;
  shippingCost: number;
  totalPrice: number;
  stockAvailable?: boolean;
  rating?: number;
  reviewsCount?: number;
  sellerReputation?: string;
  scrapedAt: Date;
  isValid: boolean;
}

export interface PriceSuggestion {
  id: string;
  monitoredProductId: string;
  userId: string;
  currentPrice: number;
  suggestedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  reason: 'competitor_lower' | 'market_average' | 'margin_optimization';
  analysis: Record<string, unknown>;
  marketAvgPrice?: number;
  lowestCompetitorPrice?: number;
  highestCompetitorPrice?: number;
  competitorsCount: number;
  estimatedMargin?: number;
  estimatedSalesImpact: 'increase' | 'decrease' | 'neutral';
  confidenceScore: number;
  status: 'pending' | 'applied' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface PriceAlert {
  id: string;
  userId: string;
  monitoredProductId: string;
  alertType:
    | 'competitor_lower'
    | 'margin_risk'
    | 'price_drop'
    | 'price_spike'
    | 'stock_out'
    | 'new_competitor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface MonitoringStats {
  isRunning: boolean;
  productsMonitored: number;
  lastCheckAt?: Date;
  nextCheckAt?: Date;
  competitorsPricesCollected: number;
  alertsGenerated: number;
  suggestionsCreated: number;
  avgCheckDuration: number;
}

export interface ScrapeResult {
  success: boolean;
  marketplace: string;
  productName: string;
  prices: CompetitorPrice[];
  error?: string;
}

export interface MarketAnalysis {
  productId: string;
  userPrice: number;
  marketAvgPrice: number;
  lowestPrice: number;
  highestPrice: number;
  competitorsCount: number;
  pricePosition: 'lowest' | 'competitive' | 'average' | 'high' | 'highest';
  priceAdvantage: number;
  recommendation: string;
  suggestedActions: string[];
}

// =====================================================
// CLASSE PRINCIPAL
// =====================================================

class PriceMonitoringAgentEngine {
  private genAI: GoogleGenerativeAI | null = null;
  private isInitialized = false;
  private useEdgeFunction = false; // Usar Edge Function em vez de API direta
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private readonly stats: MonitoringStats = {
    isRunning: false,
    productsMonitored: 0,
    competitorsPricesCollected: 0,
    alertsGenerated: 0,
    suggestionsCreated: 0,
    avgCheckDuration: 0,
  };

  /**
   * Inicializa o engine
   * Prioriza Edge Functions (seguro) - fallback para API direta apenas em desenvolvimento
   */
  initPriceMonitoring(apiKey?: string, useEdgeFunction: boolean = true): void {
    // Priorizar Edge Functions (recomendado em produção)
    if (useEdgeFunction) {
      this.useEdgeFunction = true;
      this.isInitialized = true;
      console.log('[PriceMonitoring] ✅ Engine inicializado (usando Edge Functions)');
      return;
    }

    // Fallback: API direta (apenas em desenvolvimento)
    if (!apiKey) {
      // Silencioso: esperado quando API key não está disponível
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.useEdgeFunction = false;
    this.isInitialized = true;
    console.log('[PriceMonitoring] ✅ Engine inicializado (API direta - apenas DEV)');
  }

  /**
   * Verifica se o engine está inicializado
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        'PriceMonitoring engine não inicializado. Chame initPriceMonitoring() primeiro.'
      );
    }
    // Se usar API direta, verificar genAI
    if (!this.useEdgeFunction && !this.genAI) {
      throw new Error('GenAI not initialized');
    }
  }

  /**
   * Helper para chamar Gemini (via Edge Function ou API direta)
   */
  private async callGemini(prompt: string, context?: Record<string, unknown>): Promise<string> {
    if (this.useEdgeFunction) {
      const response = await callGeminiViaEdgeFunction(prompt, {
        context: 'price_monitoring',
        ...context,
      });
      if (!response) {
        throw new Error('Edge Function não retornou resposta');
      }
      return response.trim();
    }

    if (!this.genAI) {
      throw new Error('GenAI not initialized');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  // =====================================================
  // MONITORAMENTO AUTOMÃTICO
  // =====================================================

  /**
   * Inicia o monitoramento automÃ¡tico de preÃ§os
   */
  async startMonitoring(options?: {
    intervalMinutes?: number;
    userId?: string;
  }): Promise<void> {
    this.checkInitialized();

    if (this.isMonitoring) {
      console.log('[PriceMonitoring] Monitoramento jÃ¡ estÃ¡ ativo');
      return;
    }

    const intervalMs = (options?.intervalMinutes || 60) * 60 * 1000;

    // Executar primeira checagem imediatamente
    await this.runMonitoringCycle(options?.userId);

    // Agendar checagens futuras
    this.monitoringInterval = setInterval(async () => {
      await this.runMonitoringCycle(options?.userId);
    }, intervalMs);

    this.isMonitoring = true;
    this.stats.isRunning = true;
    console.log(
      `[PriceMonitoring] âœ… Monitoramento iniciado (intervalo: ${
        options?.intervalMinutes || 60
      }min)`
    );
  }

  /**
   * Para o monitoramento automÃ¡tico
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    this.stats.isRunning = false;
    console.log('[PriceMonitoring] â¹ï¸ Monitoramento parado');
  }

  /**
   * Executa um ciclo completo de monitoramento
   */
  private async runMonitoringCycle(userId?: string): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('[PriceMonitoring] ðŸ”„ Iniciando ciclo de monitoramento...');

      // 1. Buscar produtos para monitorar
      const products = await this.getProductsToMonitor(userId);
      console.log(
        `[PriceMonitoring] ðŸ“¦ ${products.length} produtos para monitorar`
      );

      if (products.length === 0) {
        console.log(
          '[PriceMonitoring] Nenhum produto configurado para monitoramento'
        );
        return;
      }

      // 2. Para cada produto, coletar preÃ§os
      for (const product of products) {
        try {
          await this.monitorProduct(product);
        } catch (error) {
          console.error(
            `[PriceMonitoring] Erro ao monitorar produto ${product.id}:`,
            error
          );
        }
      }

      // 3. Atualizar estatÃ­sticas
      const duration = Date.now() - startTime;
      this.stats.avgCheckDuration = duration;
      this.stats.lastCheckAt = new Date();
      this.stats.nextCheckAt = new Date(Date.now() + 60 * 60 * 1000); // +1 hora

      console.log(`[PriceMonitoring] âœ… Ciclo completo em ${duration}ms`);
    } catch (error) {
      console.error('[PriceMonitoring] Erro no ciclo de monitoramento:', error);
    }
  }

  /**
   * Monitora um produto especÃ­fico
   */
  private async monitorProduct(product: MonitoredProduct): Promise<void> {
    try {
      // 1. Coletar preÃ§os de concorrentes
      const competitorPrices = await this.collectCompetitorPrices(product);

      if (competitorPrices.length === 0) {
        console.log(
          `[PriceMonitoring] Nenhum preÃ§o encontrado para ${product.productName}`
        );
        return;
      }

      // 2. Analisar mercado
      const analysis = await this.analyzeMarket(product, competitorPrices);

      // 3. Gerar alertas se necessÃ¡rio
      await this.generateAlerts(product, analysis);

      // 4. Gerar sugestões se necessário
      await this.generateSuggestions(product, analysis);

      // 5. Atualizar last_checked_at
      await untypedFrom('monitored_products')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', product.id);

      this.stats.productsMonitored++;
      console.log(`[PriceMonitoring] âœ… ${product.productName} monitorado`);
    } catch (error) {
      console.error(
        `[PriceMonitoring] Erro ao monitorar ${product.productName}:`,
        error
      );
    }
  }

  // =====================================================
  // COLETA DE PREÃ‡OS (SCRAPING)
  // =====================================================

  /**
   * Coleta preÃ§os de concorrentes para um produto
   * NOTA: ImplementaÃ§Ã£o simplificada usando Gemini AI para simular
   * Em produÃ§Ã£o, usar APIs oficiais ou scraping real
   */
  private async collectCompetitorPrices(
    product: MonitoredProduct
  ): Promise<CompetitorPrice[]> {
    this.checkInitialized();

    const prompt = `
Você é um assistente de análise de mercado. Gere dados REALISTAS de preços de concorrentes para o seguinte produto:

Produto: ${product.productName}
Preço Atual: R$ ${product.currentPrice.toFixed(2)}
Categoria: ${product.category || 'Geral'}

Gere 3-5 preços de concorrentes em diferentes marketplaces (Mercado Livre, Shopee, Amazon, Magazine Luiza).
Os preços devem variar entre -15% e +20% do preço atual.

Retorne APENAS um JSON array no formato:
[
  {
    "marketplace": "mercadolivre",
    "competitorName": "Loja XYZ",
    "price": 95.00,
    "shippingCost": 10.00,
    "rating": 4.5,
    "reviewsCount": 120
  }
]
      `.trim();

    try {
      const text = await this.callGemini(prompt, { product: product.productName });

      // Extrair JSON da resposta
      const jsonMatch = /[\s\S]*/.exec(text);
      if (!jsonMatch) {
        throw new Error('Resposta nÃ£o contÃ©m JSON vÃ¡lido');
      }

      const competitorsData = JSON.parse(jsonMatch[0]);

      // Salvar preços no banco
      const competitorPrices: CompetitorPrice[] = [];

      for (const data of competitorsData) {
        const { data: saved, error } = await untypedFrom('competitor_prices')
          .insert({
            monitored_product_id: product.id,
            marketplace: data.marketplace,
            competitor_name: data.competitorName,
            price: data.price,
            shipping_cost: data.shippingCost || 0,
            rating: data.rating,
            reviews_count: data.reviewsCount,
            is_valid: true,
          })
          .select()
          .single();

        if (!error && saved) {
          competitorPrices.push({
            id: saved.id,
            monitoredProductId: product.id,
            marketplace: saved.marketplace,
            competitorName: saved.competitor_name,
            price: saved.price,
            shippingCost: saved.shipping_cost,
            totalPrice: saved.price + saved.shipping_cost,
            rating: saved.rating,
            reviewsCount: saved.reviews_count,
            scrapedAt: new Date(saved.scraped_at),
            isValid: saved.is_valid,
          });
        }
      }

      this.stats.competitorsPricesCollected += competitorPrices.length;
      return competitorPrices;
    } catch (error) {
      console.error('[PriceMonitoring] Erro ao coletar preÃ§os:', error);
      return [];
    }
  }

  // =====================================================
  // ANÃLISE DE MERCADO
  // =====================================================

  /**
   * Analisa posiÃ§Ã£o do produto no mercado
   */
  private async analyzeMarket(
    product: MonitoredProduct,
    competitorPrices: CompetitorPrice[]
  ): Promise<MarketAnalysis> {
    const prices = competitorPrices.map(cp => cp.totalPrice);

    const marketAvgPrice =
      prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    // Calcular posiÃ§Ã£o
    let pricePosition: MarketAnalysis['pricePosition'];
    if (product.currentPrice <= lowestPrice) {
      pricePosition = 'lowest';
    } else if (product.currentPrice <= marketAvgPrice * 0.95) {
      pricePosition = 'competitive';
    } else if (product.currentPrice >= highestPrice) {
      pricePosition = 'highest';
    } else if (product.currentPrice > marketAvgPrice * 1.05) {
      pricePosition = 'high';
    } else {
      pricePosition = 'average';
    }

    const priceAdvantage =
      ((marketAvgPrice - product.currentPrice) / marketAvgPrice) * 100;

    // Gerar recomendaÃ§Ã£o usando IA
    const recommendation = await this.generateRecommendation(product, {
      marketAvgPrice,
      lowestPrice,
      highestPrice,
      pricePosition,
      priceAdvantage,
    });

    return {
      productId: product.id,
      userPrice: product.currentPrice,
      marketAvgPrice,
      lowestPrice,
      highestPrice,
      competitorsCount: competitorPrices.length,
      pricePosition,
      priceAdvantage,
      recommendation,
      suggestedActions: this.getSuggestedActions(pricePosition, priceAdvantage),
    };
  }

  /**
   * Gera recomendaÃ§Ã£o usando Gemini
   */
  private async generateRecommendation(
    product: MonitoredProduct,
    analysis: Partial<MarketAnalysis>
  ): Promise<string> {
    this.checkInitialized();

    const prompt = `
Você é um especialista em precificação estratégica. Analise a situação e dê uma recomendação concisa (máx 100 palavras):

Produto: ${product.productName}
Preço Atual: R$ ${product.currentPrice.toFixed(2)}
Custo: R$ ${product.costPrice?.toFixed(2) || 'N/A'}
Margem Alvo: ${product.targetMargin}%

Análise de Mercado:
- Média do Mercado: R$ ${analysis.marketAvgPrice?.toFixed(2)}
- Menor Preço: R$ ${analysis.lowestPrice?.toFixed(2)}
- Maior Preço: R$ ${analysis.highestPrice?.toFixed(2)}
- Posição: ${analysis.pricePosition}
- Vantagem: ${analysis.priceAdvantage?.toFixed(1)}%

Recomende uma ação estratégica clara e justificada.
    `.trim();

    try {
      return await this.callGemini(prompt, {
        product: product.productName,
        analysis,
      });
    } catch (error) {
      console.error('[PriceMonitoring] Erro ao gerar recomendação:', error);
      return 'Não foi possível gerar recomendação no momento.';
    }
  }

  /**
   * Retorna aÃ§Ãµes sugeridas baseado na anÃ¡lise
   */
  private getSuggestedActions(
    position: MarketAnalysis['pricePosition'],
    advantage: number
  ): string[] {
    const actions: string[] = [];

    if (position === 'highest') {
      actions.push(
        '🔻 Considere reduzir o preço para se manter competitivo',
        '📊 Analise se a margem atual justifica a posição premium'
      );
    } else if (position === 'high') {
      actions.push('⚠️ Seu preço está acima da média do mercado');
      if (advantage < -10) {
        actions.push('📉 Recomendamos ajuste de -5% a -10%');
      }
    } else if (position === 'competitive' || position === 'lowest') {
      actions.push(
        '✅ Preço competitivo mantido',
        '📈 Considere testar pequenos aumentos (+2-5%)'
      );
    }

    return actions;
  }

  // =====================================================
  // ALERTAS E SUGESTÃ•ES
  // =====================================================

  /**
   * Gera alertas baseado na anÃ¡lise
   */
  private async generateAlerts(
    product: MonitoredProduct,
    analysis: MarketAnalysis
  ): Promise<void> {
    const alerts: Partial<PriceAlert>[] = [];

    // Alerta: Concorrente mais barato
    if (analysis.lowestPrice < product.currentPrice * 0.95) {
      alerts.push({
        userId: product.userId,
        monitoredProductId: product.id,
        alertType: 'competitor_lower',
        severity: 'high',
        title: `Concorrente com preÃ§o ${(
          (1 - analysis.lowestPrice / product.currentPrice) *
          100
        ).toFixed(0)}% menor`,
        message: `O produto "${
          product.productName
        }" tem concorrentes vendendo por R$ ${analysis.lowestPrice.toFixed(
          2
        )}, enquanto seu preÃ§o Ã© R$ ${product.currentPrice.toFixed(2)}.`,
        actionRequired:
          'Considere ajustar seu preÃ§o para manter competitividade',
      });
    }

    // Alerta: Risco de margem
    if (product.costPrice && product.minPrice) {
      const currentMargin =
        ((product.currentPrice - product.costPrice) / product.currentPrice) *
        100;
      const minMargin =
        ((product.minPrice - product.costPrice) / product.minPrice) * 100;

      if (currentMargin < minMargin + 5) {
        alerts.push({
          userId: product.userId,
          monitoredProductId: product.id,
          alertType: 'margin_risk',
          severity: 'critical',
          title: 'Margem abaixo do limite',
          message: `A margem atual de ${currentMargin.toFixed(
            1
          )}% estÃ¡ prÃ³xima do mÃ­nimo de ${minMargin.toFixed(1)}%.`,
          actionRequired: 'Revise seus custos ou ajuste o preÃ§o mÃ­nimo',
        });
      }
    }

    // Salvar alertas no banco
    for (const alertData of alerts) {
      await untypedFrom('price_alerts').insert(alertData);
      this.stats.alertsGenerated++;
    }
  }

  /**
   * Gera sugestÃµes de ajuste de preÃ§o
   */
  private async generateSuggestions(
    product: MonitoredProduct,
    analysis: MarketAnalysis
  ): Promise<void> {
    // SÃ³ gera sugestÃ£o se houver diferenÃ§a significativa
    const threshold = product.alertThreshold || 5;
    const priceDiff = Math.abs(analysis.priceAdvantage);

    if (priceDiff < threshold) {
      return; // DiferenÃ§a insignificante
    }

    let suggestedPrice = product.currentPrice;
    let reason: PriceSuggestion['reason'] = 'market_average';

    if (
      analysis.pricePosition === 'highest' ||
      analysis.pricePosition === 'high'
    ) {
      // Sugerir reduÃ§Ã£o
      suggestedPrice = analysis.marketAvgPrice * 0.95; // 5% abaixo da mÃ©dia
      reason = 'competitor_lower';
    } else if (analysis.pricePosition === 'lowest') {
      // Sugerir aumento
      suggestedPrice = Math.min(
        analysis.marketAvgPrice,
        product.maxPrice || Infinity
      );
      reason = 'margin_optimization';
    }

    // Garantir que estÃ¡ dentro dos limites
    if (product.minPrice) {
      suggestedPrice = Math.max(suggestedPrice, product.minPrice);
    }
    if (product.maxPrice) {
      suggestedPrice = Math.min(suggestedPrice, product.maxPrice);
    }

    const priceChange = suggestedPrice - product.currentPrice;
    const priceChangePercent = (priceChange / product.currentPrice) * 100;

    // Calcular margem estimada
    let estimatedMargin: number | undefined;
    if (product.costPrice) {
      estimatedMargin =
        ((suggestedPrice - product.costPrice) / suggestedPrice) * 100;
    }

    // Salvar sugestÃ£o
    const { error } = await untypedFrom('price_suggestions').insert({
      monitored_product_id: product.id,
      user_id: product.userId,
      current_price: product.currentPrice,
      suggested_price: suggestedPrice,
      price_change_percent: priceChangePercent,
      reason,
      analysis: {
        marketAvgPrice: analysis.marketAvgPrice,
        lowestPrice: analysis.lowestPrice,
        highestPrice: analysis.highestPrice,
        pricePosition: analysis.pricePosition,
        recommendation: analysis.recommendation,
      },
      market_avg_price: analysis.marketAvgPrice,
      lowest_competitor_price: analysis.lowestPrice,
      highest_competitor_price: analysis.highestPrice,
      competitors_count: analysis.competitorsCount,
      estimated_margin: estimatedMargin,
      estimated_sales_impact: priceChange < 0 ? 'increase' : 'decrease',
      confidence_score: 0.75,
      status: 'pending',
    });

    if (!error) {
      this.stats.suggestionsCreated++;
    }
  }

  // =====================================================
  // QUERIES PÃšBLICAS
  // =====================================================

  /**
   * Busca produtos para monitorar
   */
  private async getProductsToMonitor(
    userId?: string
  ): Promise<MonitoredProduct[]> {
    let query = untypedFrom('monitored_products')
      .select('*')
      .eq('monitor_enabled', true);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[PriceMonitoring] Erro ao buscar produtos:', error);
      return [];
    }

    return (data || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      productName: p.product_name,
      sku: p.sku,
      ean: p.ean,
      category: p.category,
      brand: p.brand,
      currentPrice: Number.parseFloat(p.current_price),
      costPrice: p.cost_price ? Number.parseFloat(p.cost_price) : undefined,
      targetMargin: p.target_margin
        ? Number.parseFloat(p.target_margin)
        : undefined,
      minPrice: p.min_price ? Number.parseFloat(p.min_price) : undefined,
      maxPrice: p.max_price ? Number.parseFloat(p.max_price) : undefined,
      marketplaces: p.marketplaces || [],
      monitorEnabled: p.monitor_enabled,
      checkInterval: p.check_interval,
      alertThreshold: Number.parseFloat(p.alert_threshold),
      lastCheckedAt: p.last_checked_at
        ? new Date(p.last_checked_at)
        : undefined,
    }));
  }

  /**
   * Retorna estatÃ­sticas do monitoramento
   */
  getMonitoringStats(): MonitoringStats {
    return { ...this.stats };
  }

  /**
   * Busca alertas nÃ£o lidos do usuÃ¡rio
   */
  async getUnreadAlerts(userId: string): Promise<PriceAlert[]> {
    const { data, error } = await untypedFrom('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[PriceMonitoring] Erro ao buscar alertas:', error);
      return [];
    }

    return (data || []).map(a => ({
      id: a.id,
      userId: a.user_id,
      monitoredProductId: a.monitored_product_id,
      alertType: a.alert_type,
      severity: a.severity,
      title: a.title,
      message: a.message,
      actionRequired: a.action_required,
      isRead: a.is_read,
      isDismissed: a.is_dismissed,
      createdAt: new Date(a.created_at),
      expiresAt: new Date(a.expires_at),
    }));
  }

  /**
   * Busca sugestÃµes pendentes do usuÃ¡rio
   */
  async getPendingSuggestions(userId: string): Promise<PriceSuggestion[]> {
    const { data, error } = await untypedFrom('price_suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[PriceMonitoring] Erro ao buscar sugestÃµes:', error);
      return [];
    }

    return (data || []).map(s => ({
      id: s.id,
      monitoredProductId: s.monitored_product_id,
      userId: s.user_id,
      currentPrice: Number.parseFloat(s.current_price),
      suggestedPrice: Number.parseFloat(s.suggested_price),
      priceChange: Number.parseFloat(s.price_change),
      priceChangePercent: Number.parseFloat(s.price_change_percent),
      reason: s.reason,
      analysis: s.analysis,
      marketAvgPrice: s.market_avg_price
        ? Number.parseFloat(s.market_avg_price)
        : undefined,
      lowestCompetitorPrice: s.lowest_competitor_price
        ? Number.parseFloat(s.lowest_competitor_price)
        : undefined,
      highestCompetitorPrice: s.highest_competitor_price
        ? Number.parseFloat(s.highest_competitor_price)
        : undefined,
      competitorsCount: s.competitors_count,
      estimatedMargin: s.estimated_margin
        ? Number.parseFloat(s.estimated_margin)
        : undefined,
      estimatedSalesImpact: s.estimated_sales_impact,
      confidenceScore: Number.parseFloat(s.confidence_score),
      status: s.status,
      createdAt: new Date(s.created_at),
      expiresAt: new Date(s.expires_at),
    }));
  }

  /**
   * Marca alerta como lido
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    await untypedFrom('price_alerts')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', alertId);
  }

  /**
   * Aplica sugestÃ£o de preÃ§o
   */
  async applySuggestion(suggestionId: string): Promise<void> {
    await untypedFrom('price_suggestions')
      .update({ status: 'applied', applied_at: new Date().toISOString() })
      .eq('id', suggestionId);
  }

  /**
   * Rejeita sugestÃ£o de preÃ§o
   */
  async rejectSuggestion(suggestionId: string): Promise<void> {
    await untypedFrom('price_suggestions')
      .update({ status: 'rejected' })
      .eq('id', suggestionId);
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

const priceMonitoringAgent = new PriceMonitoringAgentEngine();
export default priceMonitoringAgent;
