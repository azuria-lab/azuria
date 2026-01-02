/**
 * =====================================================
 * AZURIA v2.0 - DYNAMIC PRICING ENGINE
 * =====================================================
 * Engine inteligente de precificação dinâmica automática
 *
 * Funcionalidades:
 * - Criação e gestão de regras de precificação
 * - Execução automática baseada em condições
 * - Estratégias pré-configuradas (aggressive, competitive, premium)
 * - Simulação de impacto de mudanças de preço
 * - Otimização de margem vs volume
 *
 * @module dynamicPricingEngine
 * @created 13/12/2024
 * =====================================================
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import { callGeminiViaEdgeFunction } from './edgeFunctionHelper';

// =====================================================
// SUPABASE HELPER (para tabelas sem tipagem)
// =====================================================

// Helper para operações em tabelas não tipadas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedFrom = (table: string) => supabase.from(table as any) as any;

/* eslint-disable no-console */

// =====================================================
// TYPES
// =====================================================

export interface PricingRule {
  id: string;
  userId: string;
  ruleName: string;
  description?: string;
  priority: number;
  ruleType:
    | 'margin_based'
    | 'competitor_based'
    | 'demand_based'
    | 'time_based'
    | 'inventory_based'
    | 'custom';
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  applyTo: 'all' | 'category' | 'product' | 'marketplace' | 'tag';
  applyToIds: string[];
  targetMarketplaces: string[];
  minPriceLimit?: number;
  maxPriceLimit?: number;
  maxAdjustmentPercent: number;
  isActive: boolean;
  isAutomatic: boolean;
  lastExecutedAt?: Date;
  executionCount: number;
}

export interface PricingStrategy {
  id: string;
  userId: string;
  strategyName: string;
  description?: string;
  strategyType:
    | 'aggressive'
    | 'competitive'
    | 'premium'
    | 'value'
    | 'dynamic'
    | 'custom';
  baseMargin: number;
  minMargin: number;
  maxMargin?: number;
  competitorMatchThreshold: number;
  undercutBy: number;
  demandSensitivity: number;
  timeBasedMultipliers?: Record<string, number>;
  inventoryBasedAdjustments?: Record<string, number>;
  isDefault: boolean;
  applyToCategories: string[];
}

export interface PriceAdjustment {
  id: string;
  userId: string;
  productId?: string;
  productName: string;
  sku?: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangePercent: number;
  source:
    | 'rule'
    | 'suggestion'
    | 'manual'
    | 'ai_recommendation'
    | 'competitor_match';
  sourceId?: string;
  marketplace?: string;
  status: 'pending' | 'applied' | 'failed' | 'reverted';
  appliedAt: Date;
  appliedBy: string;
}

export interface PriceSimulation {
  id: string;
  userId: string;
  productName: string;
  currentPrice: number;
  costPrice: number;
  scenarios: Array<{
    price: number;
    estimatedSales: number;
    estimatedRevenue: number;
    margin: number;
  }>;
  recommendedPrice: number;
  recommendationReason: string;
  simulationType:
    | 'demand_curve'
    | 'competitor_response'
    | 'margin_optimization'
    | 'sensitivity_analysis';
  optimalMargin?: number;
  estimatedImpact: 'revenue_max' | 'volume_max' | 'margin_max' | 'balanced';
}

export interface OptimizationResult {
  optimalPrice: number;
  expectedRevenue: number;
  expectedMargin: number;
  expectedVolume: number;
  confidence: number;
  reasoning: string;
}

// =====================================================
// CLASSE PRINCIPAL
// =====================================================

class DynamicPricingEngine {
  private genAI: GoogleGenerativeAI | null = null;
  private isInitialized = false;
  private useEdgeFunction = false; // Usar Edge Function em vez de API direta
  private readonly autoExecutionInterval: NodeJS.Timeout | null = null;
  private readonly isAutoExecuting = false;

  /**
   * Inicializa o engine
   * Prioriza Edge Functions (seguro) - fallback para API direta apenas em desenvolvimento
   */
  initDynamicPricing(apiKey?: string, useEdgeFunction: boolean = true): void {
    // Priorizar Edge Functions (recomendado em produção)
    if (useEdgeFunction) {
      this.useEdgeFunction = true;
      this.isInitialized = true;
      console.log('[DynamicPricing] ✅ Engine inicializado (usando Edge Functions)');
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
    console.log('[DynamicPricing] ✅ Engine inicializado (API direta - apenas DEV)');
  }

  /**
   * Verifica se o engine está inicializado
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        'DynamicPricing engine não inicializado. Chame initDynamicPricing() primeiro.'
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
        context: 'dynamic_pricing',
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
  // GESTÃO DE REGRAS
  // =====================================================

  /**
   * Cria uma nova regra de precificação
   */
  async createRule(
    rule: Omit<PricingRule, 'id' | 'executionCount' | 'lastExecutedAt'>
  ): Promise<PricingRule> {
    const { data, error } = await untypedFrom('pricing_rules')
      .insert({
        user_id: rule.userId,
        rule_name: rule.ruleName,
        description: rule.description,
        priority: rule.priority,
        rule_type: rule.ruleType,
        conditions: rule.conditions,
        actions: rule.actions,
        apply_to: rule.applyTo,
        apply_to_ids: rule.applyToIds,
        target_marketplaces: rule.targetMarketplaces,
        min_price_limit: rule.minPriceLimit,
        max_price_limit: rule.maxPriceLimit,
        max_adjustment_percent: rule.maxAdjustmentPercent,
        is_active: rule.isActive,
        is_automatic: rule.isAutomatic,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar regra: ${error.message}`);
    }

    console.log(`[DynamicPricing] ✅ Regra "${rule.ruleName}" criada`);
    return this.mapRuleFromDB(data);
  }

  /**
   * Lista regras do usuário
   */
  async getRules(
    userId: string,
    activeOnly: boolean = false
  ): Promise<PricingRule[]> {
    let query = untypedFrom('pricing_rules')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[DynamicPricing] Erro ao buscar regras:', error);
      return [];
    }

    return (data || []).map(this.mapRuleFromDB);
  }

  /**
   * Executa uma regra específica
   */
  async executeRule(ruleId: string): Promise<{
    success: boolean;
    productsEvaluated: number;
    productsUpdated: number;
    adjustments: PriceAdjustment[];
    error?: string;
  }> {
    this.checkInitialized();

    try {
      // Buscar regra
      const { data: ruleData, error: ruleError } = await untypedFrom(
        'pricing_rules'
      )
        .select('*')
        .eq('id', ruleId)
        .single();

      if (ruleError || !ruleData) {
        throw new Error('Regra não encontrada');
      }

      const rule = this.mapRuleFromDB(ruleData);

      console.log(`[DynamicPricing] ⚙️ Executando regra: ${rule.ruleName}`);

      // Buscar produtos aplicáveis
      const products = await this.getApplicableProducts(rule);
      console.log(
        `[DynamicPricing] 📦 ${products.length} produtos encontrados`
      );

      const adjustments: PriceAdjustment[] = [];

      // Aplicar regra em cada produto
      for (const product of products) {
        try {
          const adjustment = await this.applyRuleToProduct(rule, product);
          if (adjustment) {
            adjustments.push(adjustment);
          }
        } catch (error) {
          const productName =
            typeof product.name === 'string' ? product.name : 'unknown';
          console.error(
            `[DynamicPricing] Erro ao aplicar regra no produto ${productName}:`,
            error
          );
        }
      }

      // Atualizar contadores da regra
      await untypedFrom('pricing_rules')
        .update({
          execution_count: rule.executionCount + 1,
          last_executed_at: new Date().toISOString(),
        })
        .eq('id', ruleId);

      // Registrar execução
      await untypedFrom('pricing_rule_executions').insert({
        pricing_rule_id: ruleId,
        user_id: rule.userId,
        products_evaluated: products.length,
        products_updated: adjustments.length,
        success: true,
        execution_log: {
          adjustments: adjustments.map(a => ({
            product: a.productName,
            oldPrice: a.oldPrice,
            newPrice: a.newPrice,
            change: a.priceChangePercent,
          })),
        },
      });

      console.log(
        `[DynamicPricing] ✅ Regra executada: ${adjustments.length} ajustes aplicados`
      );

      return {
        success: true,
        productsEvaluated: products.length,
        productsUpdated: adjustments.length,
        adjustments,
      };
    } catch (error) {
      console.error('[DynamicPricing] Erro ao executar regra:', error);
      return {
        success: false,
        productsEvaluated: 0,
        productsUpdated: 0,
        adjustments: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Aplica regra em um produto específico
   */
  private async applyRuleToProduct(
    rule: PricingRule,
    product: Record<string, unknown>
  ): Promise<PriceAdjustment | null> {
    // Avaliar condições
    const conditionsMet = this.evaluateConditions(rule.conditions, product);

    if (!conditionsMet) {
      return null; // Condições não atendidas
    }

    // Calcular novo preço baseado nas ações
    const newPrice = this.calculateNewPrice(rule, product);

    // Aplicar limites de segurança
    const safePrice = this.applySafeLimits(newPrice, rule, product);

    // Verificar se houve mudança significativa
    const currentPrice = product.currentPrice as number;
    const priceChange = safePrice - currentPrice;
    const priceChangePercent = (priceChange / currentPrice) * 100;

    if (Math.abs(priceChangePercent) < 0.5) {
      return null; // Mudança insignificante
    }

    // Criar ajuste
    const { data, error } = await untypedFrom('price_adjustments')
      .insert({
        user_id: rule.userId,
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        old_price: product.currentPrice,
        new_price: safePrice,
        price_change_percent: priceChangePercent,
        source: 'rule',
        source_id: rule.id,
        marketplace: product.marketplace,
        status: rule.isAutomatic ? 'applied' : 'pending',
        applied_by: 'system',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar ajuste: ${error.message}`);
    }

    return this.mapAdjustmentFromDB(data);
  }

  /**
   * Avalia condições da regra
   */
  private evaluateConditions(
    conditions: Record<string, unknown>,
    product: Record<string, unknown>
  ): boolean {
    // Implementação simplificada - expandir conforme necessário
    const currentPrice = product.currentPrice as number;
    const cost = product.cost as number;
    const competitorsCount = product.competitorsCount as number | undefined;
    const stock = product.stock as number | undefined;

    if (conditions.min_margin !== undefined) {
      const margin = ((currentPrice - cost) / currentPrice) * 100;
      if (margin < (conditions.min_margin as number)) {
        return true;
      }
    }

    if (
      conditions.max_competitors !== undefined &&
      competitorsCount !== undefined
    ) {
      if (competitorsCount > (conditions.max_competitors as number)) {
        return true;
      }
    }

    if (conditions.stock_level !== undefined && stock !== undefined) {
      if (stock <= (conditions.stock_level as number)) {
        return true;
      }
    }

    // Se não há condições específicas, considerar atendida
    return Object.keys(conditions).length === 0;
  }

  /**
   * Calcula novo preço baseado nas ações da regra
   */
  private calculateNewPrice(
    rule: PricingRule,
    product: Record<string, unknown>
  ): number {
    const actions = rule.actions;
    const currentPrice = product.currentPrice as number;
    const cost = product.cost as number | undefined;
    const lowestCompetitorPrice = product.lowestCompetitorPrice as
      | number
      | undefined;
    let newPrice = currentPrice;

    if (actions.price_adjustment !== undefined) {
      const adjustment = actions.price_adjustment as number;

      if (actions.adjustment_type === 'percentage') {
        newPrice = currentPrice * (1 + adjustment / 100);
      } else if (actions.adjustment_type === 'fixed') {
        newPrice = currentPrice + adjustment;
      } else if (actions.adjustment_type === 'set') {
        newPrice = adjustment;
      }
    }

    if (actions.match_competitor === true && lowestCompetitorPrice) {
      const undercut = (actions.undercut_by as number) || 1;
      newPrice = lowestCompetitorPrice * (1 - undercut / 100);
    }

    if (actions.target_margin !== undefined && cost) {
      newPrice = cost / (1 - (actions.target_margin as number) / 100);
    }

    return newPrice;
  }

  /**
   * Aplica limites de segurança no preço
   */
  private applySafeLimits(
    price: number,
    rule: PricingRule,
    product: Record<string, unknown>
  ): number {
    const currentPrice = product.currentPrice as number;
    const cost = product.cost as number | undefined;
    let safePrice = price;

    // Limite mínimo da regra
    if (rule.minPriceLimit) {
      safePrice = Math.max(safePrice, rule.minPriceLimit);
    }

    // Limite máximo da regra
    if (rule.maxPriceLimit) {
      safePrice = Math.min(safePrice, rule.maxPriceLimit);
    }

    // Limite de ajuste percentual
    const maxChange = (currentPrice * rule.maxAdjustmentPercent) / 100;
    const change = safePrice - currentPrice;

    if (Math.abs(change) > maxChange) {
      safePrice = currentPrice + (change > 0 ? maxChange : -maxChange);
    }

    // Garantir preço mínimo baseado em custo
    if (cost) {
      const minPriceFromCost = cost * 1.05; // Mínimo 5% de margem
      safePrice = Math.max(safePrice, minPriceFromCost);
    }

    return Math.round(safePrice * 100) / 100; // Arredondar para 2 decimais
  }

  // =====================================================
  // ESTRATÉGIAS
  // =====================================================

  /**
   * Cria estratégia de precificação
   */
  async createStrategy(
    strategy: Omit<PricingStrategy, 'id'>
  ): Promise<PricingStrategy> {
    const { data, error } = await untypedFrom('pricing_strategies')
      .insert({
        user_id: strategy.userId,
        strategy_name: strategy.strategyName,
        description: strategy.description,
        strategy_type: strategy.strategyType,
        base_margin: strategy.baseMargin,
        min_margin: strategy.minMargin,
        max_margin: strategy.maxMargin,
        competitor_match_threshold: strategy.competitorMatchThreshold,
        undercut_by: strategy.undercutBy,
        demand_sensitivity: strategy.demandSensitivity,
        time_based_multipliers: strategy.timeBasedMultipliers,
        inventory_based_adjustments: strategy.inventoryBasedAdjustments,
        is_default: strategy.isDefault,
        apply_to_categories: strategy.applyToCategories,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar estratégia: ${error.message}`);
    }

    console.log(
      `[DynamicPricing] ✅ Estratégia "${strategy.strategyName}" criada`
    );
    return this.mapStrategyFromDB(data);
  }

  /**
   * Obtém estratégias do usuário
   */
  async getStrategies(userId: string): Promise<PricingStrategy[]> {
    const { data, error } = await untypedFrom('pricing_strategies')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('[DynamicPricing] Erro ao buscar estratégias:', error);
      return [];
    }

    return (data || []).map(this.mapStrategyFromDB);
  }

  /**
   * Aplica estratégia pré-configurada
   */
  async applyStrategy(
    strategyId: string,
    productIds: string[]
  ): Promise<PriceAdjustment[]> {
    this.checkInitialized();

    // Buscar estratégia
    const { data: strategyData, error } = await untypedFrom(
      'pricing_strategies'
    )
      .select('*')
      .eq('id', strategyId)
      .single();

    if (error || !strategyData) {
      throw new Error('Estratégia não encontrada');
    }

    const strategy = this.mapStrategyFromDB(strategyData);
    console.log(
      `[DynamicPricing] 📊 Aplicando estratégia: ${strategy.strategyName}`
    );

    const adjustments: PriceAdjustment[] = [];

    // Aplicar em cada produto
    for (const productId of productIds) {
      try {
        // Buscar dados do produto (implementar conforme necessário)
        const product = await this.getProductData(productId);

        if (product) {
          const newPrice = this.calculatePriceWithStrategy(strategy, product);

          // Type assertions para propriedades do produto
          const productIdStr = product.id as string;
          const productName = product.name as string;
          const productSku = product.sku as string;
          const productCurrentPrice = product.currentPrice as number;

          const adjustment = await this.createAdjustment({
            userId: strategy.userId,
            productId: productIdStr,
            productName: productName,
            sku: productSku,
            oldPrice: productCurrentPrice,
            newPrice,
            source: 'manual',
            sourceId: strategyId,
          });

          adjustments.push(adjustment);
        }
      } catch (error) {
        console.error(
          `[DynamicPricing] Erro ao aplicar estratégia no produto ${productId}:`,
          error
        );
      }
    }

    console.log(
      `[DynamicPricing] ✅ Estratégia aplicada em ${adjustments.length} produtos`
    );
    return adjustments;
  }

  /**
   * Aplica multiplicadores temporais ao preço
   */
  private applyTimeMultipliers(
    price: number,
    multipliers: Record<string, number>
  ): number {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Aumentar preço no fim de semana
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return price * (multipliers.weekend || 1);
    }
    return price;
  }

  /**
   * Aplica ajustes de estoque ao preço
   */
  private applyInventoryAdjustments(
    price: number,
    stock: number,
    adjustments: Record<string, number>
  ): number {
    if (stock < 10) {
      return price * (adjustments.low_stock || 1);
    }
    if (stock > 100) {
      return price * (adjustments.overstock || 1);
    }
    return price;
  }

  /**
   * Calcula preço usando estratégia
   */
  private calculatePriceWithStrategy(
    strategy: PricingStrategy,
    product: Record<string, unknown>
  ): number {
    const cost = (product.cost as number) || 0;
    let price: number = this.calculateBasePrice(strategy, product, cost);

    // Aplicar ajustes dinâmicos se for estratégia dinâmica
    if (strategy.strategyType === 'dynamic') {
      price = this.applyDynamicAdjustments(price, strategy, product);
    }

    return Math.round(price * 100) / 100;
  }

  /**
   * Calcula o preço base de acordo com o tipo de estratégia
   */
  private calculateBasePrice(
    strategy: PricingStrategy,
    product: Record<string, unknown>,
    cost: number
  ): number {
    switch (strategy.strategyType) {
      case 'aggressive':
        return this.calculateAggressivePrice(cost, strategy, product);

      case 'competitive':
        return this.calculateCompetitivePrice(cost, strategy, product);

      case 'premium':
        return cost / (1 - (strategy.maxMargin || strategy.baseMargin) / 100);

      case 'value':
      case 'dynamic':
      default:
        return cost / (1 - strategy.baseMargin / 100);
    }
  }

  /**
   * Calcula preço agressivo (menor possível mantendo margem)
   */
  private calculateAggressivePrice(
    cost: number,
    strategy: PricingStrategy,
    product: Record<string, unknown>
  ): number {
    let price = cost / (1 - strategy.minMargin / 100);
    if (product.lowestCompetitorPrice) {
      price = Math.min(price, (product.lowestCompetitorPrice as number) * 0.98);
    }
    return price;
  }

  /**
   * Calcula preço competitivo (baseado em concorrência)
   */
  private calculateCompetitivePrice(
    cost: number,
    strategy: PricingStrategy,
    product: Record<string, unknown>
  ): number {
    let price = cost / (1 - strategy.baseMargin / 100);
    if (product.avgCompetitorPrice) {
      price = (price + (product.avgCompetitorPrice as number)) / 2;
    }
    return price;
  }

  /**
   * Aplica ajustes dinâmicos ao preço
   */
  private applyDynamicAdjustments(
    price: number,
    strategy: PricingStrategy,
    product: Record<string, unknown>
  ): number {
    let adjustedPrice = price;

    // Aplicar multiplicadores temporais
    if (strategy.timeBasedMultipliers) {
      adjustedPrice = this.applyTimeMultipliers(
        adjustedPrice,
        strategy.timeBasedMultipliers
      );
    }

    // Ajustes por estoque
    if (strategy.inventoryBasedAdjustments && product.stock !== undefined) {
      const stock = product.stock as number;
      adjustedPrice = this.applyInventoryAdjustments(
        adjustedPrice,
        stock,
        strategy.inventoryBasedAdjustments
      );
    }

    return adjustedPrice;
  }

  // =====================================================
  // SIMULAÇÕES
  // =====================================================

  /**
   * Simula impacto de mudanças de preço
   */
  async simulatePriceChange(
    productName: string,
    currentPrice: number,
    costPrice: number,
    priceRange: { min: number; max: number; step: number }
  ): Promise<PriceSimulation> {
    this.checkInitialized();

    console.log(
      `[DynamicPricing] 🔮 Simulando mudanças de preço para ${productName}`
    );

    const prompt = `
Você é um especialista em precificação e análise de demanda.

Produto: ${productName}
Preço Atual: R$ ${currentPrice.toFixed(2)}
Custo: R$ ${costPrice.toFixed(2)}
Range de Simulação: R$ ${priceRange.min.toFixed(
      2
    )} - R$ ${priceRange.max.toFixed(2)}

Simule o impacto de diferentes preços nas vendas, considerando elasticidade de demanda.
Gere cenários realistas variando o preço de ${priceRange.min} até ${
      priceRange.max
    } em steps de ${priceRange.step}.

Para cada cenário, estime:
- Vendas esperadas (unidades)
- Receita total
- Margem em %

Retorne APENAS um JSON:
{
  "scenarios": [
    {"price": 100, "estimatedSales": 50, "estimatedRevenue": 5000, "margin": 30}
  ],
  "recommendedPrice": 120,
  "recommendationReason": "Maximiza receita mantendo volume saudável",
  "optimalMargin": 35,
  "estimatedImpact": "revenue_max"
}
    `.trim();

    const text = await this.callGemini(prompt, {
      productName,
      currentPrice,
      costPrice,
      priceRange,
    });

    const jsonMatch = /\{[\s\S]*\}/.exec(text);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const simData = JSON.parse(jsonMatch[0]);

    // Salvar simulação
    const { data, error } = await untypedFrom('price_simulations')
      .insert({
        user_id: '', // Pegar do contexto
        product_name: productName,
        current_price: currentPrice,
        cost_price: costPrice,
        scenarios: simData.scenarios,
        recommended_price: simData.recommendedPrice,
        recommendation_reason: simData.recommendationReason,
        simulation_type: 'demand_curve',
        optimal_margin: simData.optimalMargin,
        estimated_impact: simData.estimatedImpact,
      })
      .select()
      .single();

    if (error) {
      console.error('[DynamicPricing] Erro ao salvar simulação:', error);
    }

    console.log(
      `[DynamicPricing] ✅ Simulação completa: ${simData.scenarios.length} cenários`
    );

    return {
      id: data?.id ?? '',
      userId: data?.user_id ?? '',
      productName,
      currentPrice,
      costPrice,
      scenarios: simData.scenarios,
      recommendedPrice: simData.recommendedPrice,
      recommendationReason: simData.recommendationReason,
      simulationType: 'demand_curve',
      optimalMargin: simData.optimalMargin,
      estimatedImpact: simData.estimatedImpact,
    };
  }

  /**
   * Otimiza preço para maximizar objetivo
   */
  async optimizePrice(
    product: {
      name: string;
      currentPrice: number;
      cost: number;
      avgSales: number;
      competitorAvgPrice?: number;
    },
    objective: 'revenue' | 'margin' | 'volume' | 'balanced' = 'balanced'
  ): Promise<OptimizationResult> {
    this.checkInitialized();

    if (!this.genAI) {
      throw new Error('GenAI not initialized');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const getObjectiveText = (obj: string): string => {
      switch (obj) {
        case 'revenue':
          return 'RECEITA';
        case 'margin':
          return 'MARGEM';
        case 'volume':
          return 'VOLUME';
        default:
          return 'EQUILÍBRIO';
      }
    };

    const prompt = `
Você é um especialista em otimização de preços.

Produto: ${product.name}
Preço Atual: R$ ${product.currentPrice.toFixed(2)}
Custo: R$ ${product.cost.toFixed(2)}
Vendas Médias: ${product.avgSales} un/mês
Preço Médio Concorrentes: ${
      product.competitorAvgPrice
        ? `R$ ${product.competitorAvgPrice.toFixed(2)}`
        : 'N/A'
    }

Objetivo: Maximizar ${getObjectiveText(objective)}

Calcule o preço ótimo e justifique sua recomendação.

Retorne APENAS um JSON:
{
  "optimalPrice": 125.50,
  "expectedRevenue": 15000,
  "expectedMargin": 35,
  "expectedVolume": 120,
  "confidence": 0.85,
  "reasoning": "Preço equilibrado que maximiza receita mantendo competitividade"
}
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = /\{[\s\S]*\}/.exec(text);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const optData = JSON.parse(jsonMatch[0]);

    console.log(
      `[DynamicPricing] 🎯 Preço otimizado: R$ ${optData.optimalPrice.toFixed(
        2
      )}`
    );

    return {
      optimalPrice: optData.optimalPrice,
      expectedRevenue: optData.expectedRevenue,
      expectedMargin: optData.expectedMargin,
      expectedVolume: optData.expectedVolume,
      confidence: optData.confidence,
      reasoning: optData.reasoning,
    };
  }

  // =====================================================
  // UTILITÁRIOS PRIVADOS
  // =====================================================

  /**
   * Busca produtos aplicáveis para uma regra (placeholder para implementação futura)
   * Esta função será integrada com o sistema de catálogo de produtos
   */
  private async getApplicableProducts(
    _rule: PricingRule
  ): Promise<Record<string, unknown>[]> {
    // Placeholder: retorna array vazio até integração com catálogo
    return [];
  }

  /**
   * Busca dados de um produto (placeholder para implementação futura)
   * Esta função será integrada com o sistema de catálogo de produtos
   */
  private async getProductData(
    _productId: string
  ): Promise<Record<string, unknown> | null> {
    // Placeholder: retorna null até integração com catálogo
    return null;
  }

  /**
   * Cria um ajuste de preço
   */
  private async createAdjustment(data: {
    userId: string;
    productId?: string;
    productName: string;
    sku?: string;
    oldPrice: number;
    newPrice: number;
    source: PriceAdjustment['source'];
    sourceId?: string;
  }): Promise<PriceAdjustment> {
    const priceChange = data.newPrice - data.oldPrice;
    const priceChangePercent = (priceChange / data.oldPrice) * 100;

    const { data: adjusted, error } = await untypedFrom('price_adjustments')
      .insert({
        user_id: data.userId,
        product_id: data.productId,
        product_name: data.productName,
        sku: data.sku,
        old_price: data.oldPrice,
        new_price: data.newPrice,
        price_change_percent: priceChangePercent,
        source: data.source,
        source_id: data.sourceId,
        status: 'pending',
        applied_by: 'system',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar ajuste: ${error.message}`);
    }

    return this.mapAdjustmentFromDB(adjusted);
  }

  /**
   * Mapeia dados do banco para PricingRule
   */
  private mapRuleFromDB(data: Record<string, unknown>): PricingRule {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      ruleName: data.rule_name as string,
      description: data.description as string | undefined,
      priority: data.priority as number,
      ruleType: data.rule_type as PricingRule['ruleType'],
      conditions: data.conditions as Record<string, unknown>,
      actions: data.actions as Record<string, unknown>,
      applyTo: data.apply_to as PricingRule['applyTo'],
      applyToIds: (data.apply_to_ids as string[]) || [],
      targetMarketplaces: (data.target_marketplaces as string[]) || [],
      minPriceLimit: data.min_price_limit
        ? Number.parseFloat(data.min_price_limit as string)
        : undefined,
      maxPriceLimit: data.max_price_limit
        ? Number.parseFloat(data.max_price_limit as string)
        : undefined,
      maxAdjustmentPercent: Number.parseFloat(
        data.max_adjustment_percent as string
      ),
      isActive: data.is_active as boolean,
      isAutomatic: data.is_automatic as boolean,
      lastExecutedAt: data.last_executed_at
        ? new Date(data.last_executed_at as string)
        : undefined,
      executionCount: data.execution_count as number,
    };
  }

  /**
   * Mapeia dados do banco para PricingStrategy
   */
  private mapStrategyFromDB(data: Record<string, unknown>): PricingStrategy {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      strategyName: data.strategy_name as string,
      description: data.description as string | undefined,
      strategyType: data.strategy_type as PricingStrategy['strategyType'],
      baseMargin: Number.parseFloat(data.base_margin as string),
      minMargin: Number.parseFloat(data.min_margin as string),
      maxMargin: data.max_margin
        ? Number.parseFloat(data.max_margin as string)
        : undefined,
      competitorMatchThreshold: Number.parseFloat(
        data.competitor_match_threshold as string
      ),
      undercutBy: Number.parseFloat(data.undercut_by as string),
      demandSensitivity: Number.parseFloat(data.demand_sensitivity as string),
      timeBasedMultipliers: data.time_based_multipliers as
        | Record<string, number>
        | undefined,
      inventoryBasedAdjustments: data.inventory_based_adjustments as
        | Record<string, number>
        | undefined,
      isDefault: data.is_default as boolean,
      applyToCategories: (data.apply_to_categories as string[]) || [],
    };
  }

  /**
   * Mapeia dados do banco para PriceAdjustment
   */
  private mapAdjustmentFromDB(data: Record<string, unknown>): PriceAdjustment {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      productId: data.product_id as string,
      productName: data.product_name as string,
      sku: data.sku as string,
      oldPrice: Number.parseFloat(data.old_price as string),
      newPrice: Number.parseFloat(data.new_price as string),
      priceChange: Number.parseFloat(data.price_change as string),
      priceChangePercent: Number.parseFloat(
        data.price_change_percent as string
      ),
      source: data.source as PriceAdjustment['source'],
      sourceId: data.source_id as string | undefined,
      marketplace: data.marketplace as string | undefined,
      status: data.status as PriceAdjustment['status'],
      appliedAt: new Date(data.applied_at as string),
      appliedBy: data.applied_by as string | undefined,
    };
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

const dynamicPricingEngine = new DynamicPricingEngine();
export default dynamicPricingEngine;
