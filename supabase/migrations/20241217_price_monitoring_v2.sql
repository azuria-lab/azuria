-- =====================================================
-- AZURIA v2.0 - PRICE MONITORING AGENT
-- =====================================================
-- Monitora preços de concorrentes 24/7 e sugere ajustes
-- Criado em: 13/12/2024
-- =====================================================

-- 1. Tabela de produtos monitorados
CREATE TABLE IF NOT EXISTS monitored_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados do produto
    product_name TEXT NOT NULL,
    sku TEXT,
    ean TEXT,
    category TEXT,
    brand TEXT,
    
    -- Preço atual do usuário
    current_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    target_margin DECIMAL(5,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    
    -- Marketplaces onde está listado
    marketplaces JSONB DEFAULT '[]'::jsonb,
    
    -- Configurações de monitoramento
    monitor_enabled BOOLEAN DEFAULT true,
    check_interval INTEGER DEFAULT 60, -- minutos
    alert_threshold DECIMAL(5,2) DEFAULT 5.0, -- % diferença
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ,
    
    -- Índices para busca
    CONSTRAINT valid_prices CHECK (current_price > 0 AND cost_price >= 0)
);

-- 2. Tabela de preços de concorrentes
CREATE TABLE IF NOT EXISTS competitor_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitored_product_id UUID NOT NULL REFERENCES monitored_products(id) ON DELETE CASCADE,
    
    -- Dados do concorrente
    marketplace TEXT NOT NULL, -- 'mercadolivre', 'shopee', 'amazon', etc
    competitor_name TEXT NOT NULL,
    competitor_url TEXT,
    
    -- Preço encontrado
    price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (price + shipping_cost) STORED,
    
    -- Dados adicionais
    stock_available BOOLEAN,
    rating DECIMAL(3,2),
    reviews_count INTEGER,
    seller_reputation TEXT,
    
    -- Metadata
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true,
    
    -- Índices
    CONSTRAINT valid_competitor_price CHECK (price > 0)
);

-- 3. Tabela de sugestões de ajuste de preço
CREATE TABLE IF NOT EXISTS price_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitored_product_id UUID NOT NULL REFERENCES monitored_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Análise
    current_price DECIMAL(10,2) NOT NULL,
    suggested_price DECIMAL(10,2) NOT NULL,
    price_change DECIMAL(10,2) GENERATED ALWAYS AS (suggested_price - current_price) STORED,
    price_change_percent DECIMAL(5,2),
    
    -- Justificativa
    reason TEXT NOT NULL, -- 'competitor_lower', 'market_average', 'margin_optimization'
    analysis JSONB, -- Dados detalhados da análise
    
    -- Comparação com mercado
    market_avg_price DECIMAL(10,2),
    lowest_competitor_price DECIMAL(10,2),
    highest_competitor_price DECIMAL(10,2),
    competitors_count INTEGER,
    
    -- Impacto estimado
    estimated_margin DECIMAL(5,2),
    estimated_sales_impact TEXT, -- 'increase', 'decrease', 'neutral'
    confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 a 1.0
    
    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'applied', 'rejected', 'expired'
    applied_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_suggestion CHECK (suggested_price > 0),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'applied', 'rejected', 'expired'))
);

-- 4. Tabela de histórico de monitoramento
CREATE TABLE IF NOT EXISTS price_monitoring_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitored_product_id UUID NOT NULL REFERENCES monitored_products(id) ON DELETE CASCADE,
    
    -- Snapshot do momento
    user_price DECIMAL(10,2) NOT NULL,
    market_avg_price DECIMAL(10,2),
    lowest_price DECIMAL(10,2),
    highest_price DECIMAL(10,2),
    competitors_count INTEGER,
    
    -- Posicionamento
    price_position TEXT, -- 'lowest', 'competitive', 'average', 'high', 'highest'
    price_advantage DECIMAL(5,2), -- % diferença vs média
    
    -- Alertas gerados
    alerts_generated INTEGER DEFAULT 0,
    suggestions_created INTEGER DEFAULT 0,
    
    -- Timestamp
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de alertas de preço
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monitored_product_id UUID NOT NULL REFERENCES monitored_products(id) ON DELETE CASCADE,
    
    -- Tipo de alerta
    alert_type TEXT NOT NULL, -- 'competitor_lower', 'margin_risk', 'price_drop', 'price_spike'
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Mensagem
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_required TEXT,
    
    -- Dados relacionados
    related_competitor_id UUID REFERENCES competitor_prices(id),
    related_suggestion_id UUID REFERENCES price_suggestions(id),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    
    -- Constraints
    CONSTRAINT valid_alert_type CHECK (alert_type IN ('competitor_lower', 'margin_risk', 'price_drop', 'price_spike', 'stock_out', 'new_competitor')),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- 6. Tabela de configurações do agente
CREATE TABLE IF NOT EXISTS price_monitoring_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Configurações globais
    global_check_interval INTEGER DEFAULT 60, -- minutos
    auto_apply_suggestions BOOLEAN DEFAULT false,
    max_price_change_percent DECIMAL(5,2) DEFAULT 10.0,
    
    -- Notificações
    email_alerts BOOLEAN DEFAULT true,
    push_alerts BOOLEAN DEFAULT true,
    alert_min_severity TEXT DEFAULT 'medium',
    
    -- Marketplaces habilitados
    enabled_marketplaces JSONB DEFAULT '["mercadolivre", "shopee", "amazon"]'::jsonb,
    
    -- Estratégia padrão
    default_strategy TEXT DEFAULT 'competitive', -- 'aggressive', 'competitive', 'conservative'
    
    -- API keys (criptografadas)
    marketplace_credentials JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_monitored_products_user_id ON monitored_products(user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_products_enabled ON monitored_products(monitor_enabled) WHERE monitor_enabled = true;
CREATE INDEX IF NOT EXISTS idx_monitored_products_last_checked ON monitored_products(last_checked_at);

CREATE INDEX IF NOT EXISTS idx_competitor_prices_product ON competitor_prices(monitored_product_id);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_marketplace ON competitor_prices(marketplace);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_scraped_at ON competitor_prices(scraped_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_suggestions_user_id ON price_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_price_suggestions_status ON price_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_price_suggestions_created_at ON price_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_unread ON price_alerts(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_price_alerts_severity ON price_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_monitoring_history_product ON price_monitoring_history(monitored_product_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_history_checked_at ON price_monitoring_history(checked_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monitored_products_updated_at
    BEFORE UPDATE ON monitored_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_monitoring_settings_updated_at
    BEFORE UPDATE ON price_monitoring_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE monitored_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_monitoring_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_monitoring_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para monitored_products
CREATE POLICY "Users can view own monitored products"
    ON monitored_products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monitored products"
    ON monitored_products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitored products"
    ON monitored_products FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitored products"
    ON monitored_products FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para competitor_prices (via monitored_products)
CREATE POLICY "Users can view competitor prices for own products"
    ON competitor_prices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM monitored_products
            WHERE monitored_products.id = competitor_prices.monitored_product_id
            AND monitored_products.user_id = auth.uid()
        )
    );

-- Políticas para price_suggestions
CREATE POLICY "Users can view own price suggestions"
    ON price_suggestions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own price suggestions"
    ON price_suggestions FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para price_alerts
CREATE POLICY "Users can view own price alerts"
    ON price_alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts"
    ON price_alerts FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para price_monitoring_history
CREATE POLICY "Users can view own monitoring history"
    ON price_monitoring_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM monitored_products
            WHERE monitored_products.id = price_monitoring_history.monitored_product_id
            AND monitored_products.user_id = auth.uid()
        )
    );

-- Políticas para price_monitoring_settings
CREATE POLICY "Users can view own settings"
    ON price_monitoring_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON price_monitoring_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON price_monitoring_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular posição de preço no mercado
CREATE OR REPLACE FUNCTION calculate_price_position(
    p_user_price DECIMAL,
    p_market_avg DECIMAL,
    p_lowest_price DECIMAL,
    p_highest_price DECIMAL
)
RETURNS TEXT AS $$
BEGIN
    IF p_user_price <= p_lowest_price THEN
        RETURN 'lowest';
    ELSIF p_user_price <= p_market_avg * 0.95 THEN
        RETURN 'competitive';
    ELSIF p_user_price <= p_market_avg * 1.05 THEN
        RETURN 'average';
    ELSIF p_user_price < p_highest_price THEN
        RETURN 'high';
    ELSE
        RETURN 'highest';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para expirar sugestões antigas
CREATE OR REPLACE FUNCTION expire_old_suggestions()
RETURNS void AS $$
BEGIN
    UPDATE price_suggestions
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View com resumo de monitoramento por produto
CREATE OR REPLACE VIEW v_price_monitoring_summary AS
SELECT 
    mp.id,
    mp.user_id,
    mp.product_name,
    mp.current_price,
    mp.cost_price,
    mp.target_margin,
    mp.monitor_enabled,
    mp.last_checked_at,
    
    -- Estatísticas de concorrentes
    COUNT(DISTINCT cp.id) as competitors_count,
    AVG(cp.total_price) as avg_competitor_price,
    MIN(cp.total_price) as lowest_competitor_price,
    MAX(cp.total_price) as highest_competitor_price,
    
    -- Posição no mercado
    calculate_price_position(
        mp.current_price,
        AVG(cp.total_price),
        MIN(cp.total_price),
        MAX(cp.total_price)
    ) as price_position,
    
    -- Alertas pendentes
    COUNT(DISTINCT pa.id) FILTER (WHERE pa.is_read = false) as unread_alerts,
    
    -- Sugestões pendentes
    COUNT(DISTINCT ps.id) FILTER (WHERE ps.status = 'pending') as pending_suggestions
    
FROM monitored_products mp
LEFT JOIN competitor_prices cp ON cp.monitored_product_id = mp.id 
    AND cp.scraped_at > NOW() - INTERVAL '7 days'
    AND cp.is_valid = true
LEFT JOIN price_alerts pa ON pa.monitored_product_id = mp.id
LEFT JOIN price_suggestions ps ON ps.monitored_product_id = mp.id
GROUP BY mp.id;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Criar configurações padrão para usuários existentes
INSERT INTO price_monitoring_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE monitored_products IS 'Produtos sendo monitorados pelo Price Monitoring Agent';
COMMENT ON TABLE competitor_prices IS 'Preços coletados de concorrentes nos marketplaces';
COMMENT ON TABLE price_suggestions IS 'Sugestões de ajuste de preço geradas pelo agente';
COMMENT ON TABLE price_monitoring_history IS 'Histórico de snapshots do monitoramento';
COMMENT ON TABLE price_alerts IS 'Alertas de preço para o usuário';
COMMENT ON TABLE price_monitoring_settings IS 'Configurações do agente por usuário';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
