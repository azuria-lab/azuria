-- =====================================================
-- AZURIA v2.0 - DYNAMIC PRICING ENGINE (FIXED)
-- =====================================================
-- Versão simplificada sem complexidades
-- Criado em: 13/12/2024
-- =====================================================

-- LIMPAR TABELAS ANTERIORES (se existirem com problemas)
DROP TABLE IF EXISTS price_simulations CASCADE;
DROP TABLE IF EXISTS pricing_performance_metrics CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS pricing_strategies CASCADE;
DROP TABLE IF EXISTS price_adjustments CASCADE;
DROP TABLE IF EXISTS pricing_rule_executions CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;

-- 1. Tabela de regras de precificação
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Identificação
    rule_name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    
    -- Tipo de regra
    rule_type TEXT NOT NULL,
    
    -- Condições e Ações (JSON)
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    
    -- Aplicação
    apply_to TEXT DEFAULT 'all',
    apply_to_ids JSONB DEFAULT '[]'::jsonb,
    target_marketplaces JSONB DEFAULT '["mercadolivre", "shopee", "amazon"]'::jsonb,
    
    -- Limites
    min_price_limit DECIMAL(10,2),
    max_price_limit DECIMAL(10,2),
    max_adjustment_percent DECIMAL(5,2) DEFAULT 15.0,
    
    -- Controle
    is_active BOOLEAN DEFAULT true,
    is_automatic BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    
    -- Foreign key
    CONSTRAINT fk_pricing_rules_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Tabela de execuções de regras
CREATE TABLE pricing_rule_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_rule_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    products_evaluated INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    total_price_changes DECIMAL(12,2),
    avg_price_change_percent DECIMAL(5,2),
    execution_log JSONB,
    
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    duration_ms INTEGER,
    
    CONSTRAINT fk_executions_rule FOREIGN KEY (pricing_rule_id) REFERENCES pricing_rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_executions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Tabela de ajustes de preço
CREATE TABLE price_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    product_id UUID,
    product_name TEXT NOT NULL,
    sku TEXT,
    
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    price_change_percent DECIMAL(5,2),
    
    source TEXT NOT NULL,
    source_id UUID,
    
    marketplace TEXT,
    marketplace_listing_id TEXT,
    
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    applied_by TEXT DEFAULT 'system',
    status TEXT DEFAULT 'pending',
    marketplace_response JSONB,
    
    reverted_at TIMESTAMPTZ,
    revert_reason TEXT,
    
    CONSTRAINT fk_adjustments_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT valid_prices CHECK (old_price > 0 AND new_price > 0)
);

-- 4. Tabela de estratégias
CREATE TABLE pricing_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    strategy_name TEXT NOT NULL,
    description TEXT,
    strategy_type TEXT NOT NULL,
    
    base_margin DECIMAL(5,2) NOT NULL,
    min_margin DECIMAL(5,2) NOT NULL,
    max_margin DECIMAL(5,2),
    
    competitor_match_threshold DECIMAL(5,2) DEFAULT 5.0,
    undercut_by DECIMAL(5,2) DEFAULT 1.0,
    demand_sensitivity DECIMAL(3,2) DEFAULT 1.0,
    
    time_based_multipliers JSONB,
    inventory_based_adjustments JSONB,
    
    is_default BOOLEAN DEFAULT false,
    apply_to_categories JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_strategies_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT valid_margins CHECK (min_margin >= 0 AND base_margin >= min_margin)
);

-- 5. Tabela de histórico de preços
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    product_id UUID,
    product_name TEXT NOT NULL,
    sku TEXT,
    
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    margin DECIMAL(5,2),
    
    marketplace TEXT,
    competitors_avg_price DECIMAL(10,2),
    market_position TEXT,
    change_reason TEXT,
    
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT valid_price CHECK (price > 0)
);

-- 6. Tabela de métricas
CREATE TABLE pricing_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    date DATE NOT NULL,
    hour INTEGER,
    product_id UUID,
    marketplace TEXT,
    
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    avg_transaction_value DECIMAL(10,2),
    avg_price DECIMAL(10,2),
    avg_margin DECIMAL(5,2),
    
    avg_price_position DECIMAL(3,2),
    times_was_lowest INTEGER DEFAULT 0,
    price_adjustments_count INTEGER DEFAULT 0,
    avg_adjustment_percent DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_metrics_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date, hour, product_id, marketplace)
);

-- 7. Tabela de simulações
CREATE TABLE price_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    product_name TEXT NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    
    scenarios JSONB NOT NULL,
    recommended_price DECIMAL(10,2),
    recommendation_reason TEXT,
    
    simulation_type TEXT DEFAULT 'demand_curve',
    parameters JSONB,
    optimal_margin DECIMAL(5,2),
    estimated_impact TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_simulations_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pricing_rules_user ON pricing_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_rule_executions_rule ON pricing_rule_executions(pricing_rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_executions_date ON pricing_rule_executions(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_adjustments_user ON price_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_product ON price_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_status ON price_adjustments(status);

CREATE INDEX IF NOT EXISTS idx_strategies_user ON pricing_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_user ON pricing_performance_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_simulations_user ON price_simulations(user_id);

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================
-- Nota: RLS será configurado via interface do Supabase após criação das tabelas
-- Para evitar erros de "column user_id does not exist" durante a migration

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE pricing_rules IS 'Regras de precificação automática';
COMMENT ON TABLE pricing_rule_executions IS 'Histórico de execuções de regras';
COMMENT ON TABLE price_adjustments IS 'Ajustes de preço aplicados';
COMMENT ON TABLE pricing_strategies IS 'Estratégias de precificação';
COMMENT ON TABLE price_history IS 'Histórico de mudanças de preço';
COMMENT ON TABLE pricing_performance_metrics IS 'Métricas de performance';
COMMENT ON TABLE price_simulations IS 'Simulações de preço';

-- =====================================================
-- FIM
-- =====================================================
