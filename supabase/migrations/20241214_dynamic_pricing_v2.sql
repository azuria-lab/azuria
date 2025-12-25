-- =====================================================
-- AZURIA v2.0 - DYNAMIC PRICING ENGINE
-- =====================================================
-- Ajusta preços automaticamente baseado em regras e mercado
-- Criado em: 13/12/2024
-- =====================================================

-- Função auxiliar para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Tabela de regras de precificação
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identificação
    rule_name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0, -- Maior = mais prioridade
    
    -- Tipo de regra
    rule_type TEXT NOT NULL, -- 'margin_based', 'competitor_based', 'demand_based', 'time_based', 'inventory_based'
    
    -- Condições (JSON com flexibilidade)
    conditions JSONB NOT NULL, -- Ex: {"min_margin": 20, "max_competitors": 5}
    
    -- Ações (o que fazer quando condições são atendidas)
    actions JSONB NOT NULL, -- Ex: {"price_adjustment": -5, "adjustment_type": "percentage"}
    
    -- Aplicação
    apply_to TEXT DEFAULT 'all', -- 'all', 'category', 'product', 'marketplace'
    apply_to_ids JSONB DEFAULT '[]'::jsonb, -- IDs específicos (produtos, categorias)
    
    -- Marketplaces alvo
    target_marketplaces JSONB DEFAULT '["mercadolivre", "shopee", "amazon"]'::jsonb,
    
    -- Limites de segurança
    min_price_limit DECIMAL(10,2),
    max_price_limit DECIMAL(10,2),
    max_adjustment_percent DECIMAL(5,2) DEFAULT 15.0,
    
    -- Controle
    is_active BOOLEAN DEFAULT true,
    is_automatic BOOLEAN DEFAULT false, -- Se true, executa automaticamente
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT valid_rule_type CHECK (rule_type IN ('margin_based', 'competitor_based', 'demand_based', 'time_based', 'inventory_based', 'custom')),
    CONSTRAINT valid_apply_to CHECK (apply_to IN ('all', 'category', 'product', 'marketplace', 'tag'))
);

-- 2. Tabela de execuções de regras
CREATE TABLE IF NOT EXISTS pricing_rule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pricing_rule_id UUID NOT NULL REFERENCES pricing_rules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Produtos afetados
    products_evaluated INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    
    -- Resultados
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Impacto
    total_price_changes DECIMAL(12,2),
    avg_price_change_percent DECIMAL(5,2),
    
    -- Detalhes (logs estruturados)
    execution_log JSONB,
    
    -- Timestamp
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    duration_ms INTEGER
);

-- 3. Tabela de ajustes de preço aplicados
CREATE TABLE IF NOT EXISTS price_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Produto
    product_id UUID, -- Referência externa (calculadora, marketplace)
    product_name TEXT NOT NULL,
    sku TEXT,
    
    -- Preços
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    price_change DECIMAL(10,2) GENERATED ALWAYS AS (new_price - old_price) STORED,
    price_change_percent DECIMAL(5,2),
    
    -- Origem do ajuste
    source TEXT NOT NULL, -- 'rule', 'suggestion', 'manual', 'ai_recommendation'
    source_id UUID, -- ID da regra ou sugestão
    
    -- Marketplace
    marketplace TEXT,
    marketplace_listing_id TEXT,
    
    -- Aplicação
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    applied_by TEXT DEFAULT 'system', -- 'system', 'user', 'api'
    
    -- Status da aplicação
    status TEXT DEFAULT 'pending', -- 'pending', 'applied', 'failed', 'reverted'
    marketplace_response JSONB,
    
    -- Resultado
    reverted_at TIMESTAMPTZ,
    revert_reason TEXT,
    
    -- Constraints
    CONSTRAINT valid_prices CHECK (old_price > 0 AND new_price > 0),
    CONSTRAINT valid_source CHECK (source IN ('rule', 'suggestion', 'manual', 'ai_recommendation', 'competitor_match')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'applied', 'failed', 'reverted'))
);

-- 4. Tabela de estratégias de precificação
CREATE TABLE IF NOT EXISTS pricing_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identificação
    strategy_name TEXT NOT NULL,
    description TEXT,
    
    -- Tipo de estratégia
    strategy_type TEXT NOT NULL, -- 'aggressive', 'competitive', 'premium', 'value', 'dynamic'
    
    -- Parâmetros
    base_margin DECIMAL(5,2) NOT NULL, -- Margem base desejada
    min_margin DECIMAL(5,2) NOT NULL, -- Margem mínima aceitável
    max_margin DECIMAL(5,2), -- Margem máxima
    
    -- Comportamento competitivo
    competitor_match_threshold DECIMAL(5,2) DEFAULT 5.0, -- % diferença para ajustar
    undercut_by DECIMAL(5,2) DEFAULT 1.0, -- % para ficar abaixo do concorrente
    
    -- Elasticidade de demanda
    demand_sensitivity DECIMAL(3,2) DEFAULT 1.0, -- 0.5 = inelástico, 2.0 = elástico
    
    -- Ajustes dinâmicos
    time_based_multipliers JSONB, -- Ex: {"weekend": 1.05, "blackfriday": 0.90}
    inventory_based_adjustments JSONB, -- Ex: {"low_stock": 1.10, "overstock": 0.95}
    
    -- Aplicação
    is_default BOOLEAN DEFAULT false,
    apply_to_categories JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_strategy_type CHECK (strategy_type IN ('aggressive', 'competitive', 'premium', 'value', 'dynamic', 'custom')),
    CONSTRAINT valid_margins CHECK (min_margin >= 0 AND base_margin >= min_margin)
);

-- 5. Tabela de histórico de preços
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Produto
    product_id UUID,
    product_name TEXT NOT NULL,
    sku TEXT,
    
    -- Preço
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    margin DECIMAL(5,2),
    
    -- Marketplace
    marketplace TEXT,
    
    -- Contexto
    competitors_avg_price DECIMAL(10,2),
    market_position TEXT, -- 'lowest', 'competitive', 'average', 'high', 'highest'
    
    -- Origem
    change_reason TEXT, -- 'rule_execution', 'manual_update', 'suggestion_applied', 'competitor_response'
    
    -- Timestamp
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_price CHECK (price > 0)
);

-- 6. Tabela de métricas de performance de precificação
CREATE TABLE IF NOT EXISTS pricing_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Período
    date DATE NOT NULL,
    hour INTEGER, -- 0-23, NULL = dia completo
    
    -- Produto (opcional, NULL = agregado)
    product_id UUID,
    marketplace TEXT,
    
    -- Métricas de vendas
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    avg_transaction_value DECIMAL(10,2),
    
    -- Métricas de preço
    avg_price DECIMAL(10,2),
    avg_margin DECIMAL(5,2),
    
    -- Métricas de competitividade
    avg_price_position DECIMAL(3,2), -- 1.0 = lowest, 5.0 = highest
    times_was_lowest INTEGER DEFAULT 0,
    
    -- Ajustes realizados
    price_adjustments_count INTEGER DEFAULT 0,
    avg_adjustment_percent DECIMAL(5,2),
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índice único para prevenir duplicatas
    UNIQUE(user_id, date, hour, product_id, marketplace)
);

-- 7. Tabela de simulações de preço
CREATE TABLE IF NOT EXISTS price_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Produto
    product_name TEXT NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    
    -- Cenários simulados
    scenarios JSONB NOT NULL, -- Array de cenários: [{price: 100, estimated_sales: 50, estimated_revenue: 5000}]
    
    -- Recomendação
    recommended_price DECIMAL(10,2),
    recommendation_reason TEXT,
    
    -- Configurações da simulação
    simulation_type TEXT DEFAULT 'demand_curve', -- 'demand_curve', 'competitor_response', 'margin_optimization'
    parameters JSONB,
    
    -- Resultado
    optimal_margin DECIMAL(5,2),
    estimated_impact TEXT, -- 'revenue_max', 'volume_max', 'margin_max', 'balanced'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_simulation_type CHECK (simulation_type IN ('demand_curve', 'competitor_response', 'margin_optimization', 'sensitivity_analysis'))
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pricing_rules_user_id ON pricing_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pricing_rules_priority ON pricing_rules(priority DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_rule_executions_rule ON pricing_rule_executions(pricing_rule_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rule_executions_executed_at ON pricing_rule_executions(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_adjustments_user_id ON price_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_price_adjustments_product ON price_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_price_adjustments_applied_at ON price_adjustments(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_adjustments_status ON price_adjustments(status);

CREATE INDEX IF NOT EXISTS idx_pricing_strategies_user_id ON pricing_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_strategies_default ON pricing_strategies(is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_performance_metrics_user_date ON pricing_performance_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_performance_metrics_product ON pricing_performance_metrics(product_id);

CREATE INDEX IF NOT EXISTS idx_price_simulations_user_id ON price_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_price_simulations_created_at ON price_simulations(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_pricing_rules_updated_at
    BEFORE UPDATE ON pricing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_strategies_updated_at
    BEFORE UPDATE ON pricing_strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar histórico de preços
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO price_history (
        user_id,
        product_id,
        product_name,
        sku,
        price,
        marketplace,
        change_reason
    ) VALUES (
        NEW.user_id,
        NEW.product_id,
        NEW.product_name,
        NEW.sku,
        NEW.new_price,
        NEW.marketplace,
        NEW.source
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_price_adjustment_history
    AFTER INSERT ON price_adjustments
    FOR EACH ROW
    WHEN (NEW.status = 'applied')
    EXECUTE FUNCTION log_price_change();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_simulations ENABLE ROW LEVEL SECURITY;

-- Políticas para pricing_rules
CREATE POLICY "Users can manage own pricing rules"
    ON pricing_rules FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para pricing_rule_executions
CREATE POLICY "Users can view own rule executions"
    ON pricing_rule_executions FOR SELECT
    USING (auth.uid() = user_id);

-- Políticas para price_adjustments
CREATE POLICY "Users can manage own price adjustments"
    ON price_adjustments FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para pricing_strategies
CREATE POLICY "Users can manage own pricing strategies"
    ON pricing_strategies FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para price_history
CREATE POLICY "Users can view own price history"
    ON price_history FOR SELECT
    USING (auth.uid() = user_id);

-- Políticas para pricing_performance_metrics
CREATE POLICY "Users can view own performance metrics"
    ON pricing_performance_metrics FOR SELECT
    USING (auth.uid() = user_id);

-- Políticas para price_simulations
CREATE POLICY "Users can manage own price simulations"
    ON price_simulations FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular preço ótimo baseado em margem e competição
CREATE OR REPLACE FUNCTION calculate_optimal_price(
    p_cost DECIMAL,
    p_target_margin DECIMAL,
    p_competitor_avg DECIMAL,
    p_strategy TEXT DEFAULT 'competitive'
)
RETURNS DECIMAL AS $$
DECLARE
    v_margin_price DECIMAL;
    v_competitive_price DECIMAL;
BEGIN
    -- Preço baseado em margem
    v_margin_price := p_cost * (1 + p_target_margin / 100);
    
    -- Preço competitivo (5% abaixo da média)
    v_competitive_price := p_competitor_avg * 0.95;
    
    -- Retornar baseado na estratégia
    CASE p_strategy
        WHEN 'aggressive' THEN
            RETURN LEAST(v_margin_price, v_competitive_price);
        WHEN 'competitive' THEN
            RETURN (v_margin_price + v_competitive_price) / 2;
        WHEN 'premium' THEN
            RETURN GREATEST(v_margin_price, v_competitive_price * 1.05);
        ELSE
            RETURN v_margin_price;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para aplicar regra de precificação
CREATE OR REPLACE FUNCTION apply_pricing_rule(p_rule_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_rule RECORD;
    v_result JSONB;
BEGIN
    -- Buscar regra
    SELECT * INTO v_rule FROM pricing_rules WHERE id = p_rule_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Rule not found or inactive');
    END IF;
    
    -- Atualizar contadores
    UPDATE pricing_rules
    SET execution_count = execution_count + 1,
        last_executed_at = NOW()
    WHERE id = p_rule_id;
    
    -- Registrar execução
    INSERT INTO pricing_rule_executions (pricing_rule_id, user_id, success)
    VALUES (p_rule_id, v_rule.user_id, true);
    
    RETURN jsonb_build_object('success', true, 'rule_id', p_rule_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- Nota: Views removidas temporariamente para evitar problemas de permissão
-- As consultas necessárias podem ser feitas diretamente nas tabelas

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Criar estratégias padrão para usuários existentes será feito pela aplicação
-- quando o usuário fizer login pela primeira vez

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE pricing_rules IS 'Regras de precificação automática configuradas pelo usuário';
COMMENT ON TABLE pricing_rule_executions IS 'Histórico de execuções de regras de precificação';
COMMENT ON TABLE price_adjustments IS 'Ajustes de preço aplicados (manual ou automático)';
COMMENT ON TABLE pricing_strategies IS 'Estratégias de precificação pré-configuradas';
COMMENT ON TABLE price_history IS 'Histórico completo de mudanças de preço';
COMMENT ON TABLE pricing_performance_metrics IS 'Métricas agregadas de performance de precificação';
COMMENT ON TABLE price_simulations IS 'Simulações de impacto de mudanças de preço';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
