-- =====================================================
-- MIGRAÇÃO: Tabelas de Métricas de Negócio
-- Data: 2025-01-11
-- Descrição: Cria tabelas para business_metrics, sales_data e product_performance
-- =====================================================

-- =====================================================
-- TABELA: business_metrics
-- Métricas de negócio por período
-- =====================================================
CREATE TABLE IF NOT EXISTS public.business_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Período
    period_date DATE NOT NULL,
    
    -- Métricas financeiras
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    total_cost NUMERIC(12, 2) DEFAULT 0,
    gross_profit NUMERIC(12, 2) DEFAULT 0,
    net_profit NUMERIC(12, 2) DEFAULT 0,
    profit_margin NUMERIC(5, 2) DEFAULT 0,
    
    -- Métricas de vendas
    total_sales INTEGER DEFAULT 0,
    average_ticket NUMERIC(10, 2) DEFAULT 0,
    conversion_rate NUMERIC(5, 2) DEFAULT 0,
    
    -- Métricas de produtos
    products_sold INTEGER DEFAULT 0,
    top_product_id TEXT,
    top_product_name TEXT,
    
    -- Métricas de canais
    channel_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint: uma métrica por usuário por dia
    CONSTRAINT unique_business_metrics_per_user_date UNIQUE (user_id, period_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_business_metrics_user_id ON public.business_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_period_date ON public.business_metrics(period_date DESC);
CREATE INDEX IF NOT EXISTS idx_business_metrics_user_period ON public.business_metrics(user_id, period_date);

-- Comentários
COMMENT ON TABLE public.business_metrics IS 'Métricas de negócio agregadas por período';
COMMENT ON COLUMN public.business_metrics.period_date IS 'Data do período (diário, semanal, mensal)';
COMMENT ON COLUMN public.business_metrics.channel_breakdown IS 'Breakdown por canal de venda (JSONB)';

-- =====================================================
-- TABELA: sales_data
-- Dados de vendas individuais
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sales_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Data da venda
    sale_date DATE NOT NULL,
    
    -- Informações do produto
    product_id TEXT,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    
    -- Informações da venda
    sale_value NUMERIC(12, 2) NOT NULL,
    cost_value NUMERIC(12, 2) DEFAULT 0,
    profit_margin NUMERIC(5, 2) DEFAULT 0,
    
    -- Custos
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    commission_fee NUMERIC(10, 2) DEFAULT 0,
    advertising_cost NUMERIC(10, 2) DEFAULT 0,
    other_costs NUMERIC(10, 2) DEFAULT 0,
    
    -- Canal de venda
    channel_name TEXT NOT NULL,
    channel_type TEXT, -- marketplace, ecommerce, physical, etc.
    
    -- Metadata adicional
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sales_data_user_id ON public.sales_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_sale_date ON public.sales_data(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_data_user_date ON public.sales_data(user_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_data_channel_name ON public.sales_data(channel_name);
CREATE INDEX IF NOT EXISTS idx_sales_data_product_id ON public.sales_data(product_id);

-- Comentários
COMMENT ON TABLE public.sales_data IS 'Dados individuais de vendas';
COMMENT ON COLUMN public.sales_data.channel_name IS 'Nome do canal (Mercado Livre, Amazon, Loja própria, etc.)';
COMMENT ON COLUMN public.sales_data.metadata IS 'Dados adicionais da venda (JSONB)';

-- =====================================================
-- TABELA: product_performance
-- Performance de produtos por período
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações do produto
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_id TEXT,
    
    -- Período
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Métricas de vendas
    total_sales INTEGER DEFAULT 0,
    units_sold NUMERIC(10, 2) DEFAULT 0,
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    
    -- Métricas de performance
    conversion_rate NUMERIC(5, 2) DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    
    -- Métricas financeiras
    avg_margin NUMERIC(5, 2) DEFAULT 0,
    total_cost NUMERIC(12, 2) DEFAULT 0,
    total_profit NUMERIC(12, 2) DEFAULT 0,
    
    -- Status e breakdown
    performance_status TEXT, -- excellent, good, average, poor
    channel_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint: um registro por produto por período
    CONSTRAINT unique_product_performance_per_user_period UNIQUE (user_id, product_id, period_start)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_product_performance_user_id ON public.product_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_product_performance_product_id ON public.product_performance(product_id);
CREATE INDEX IF NOT EXISTS idx_product_performance_period ON public.product_performance(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_product_performance_user_period ON public.product_performance(user_id, period_start DESC);

-- Comentários
COMMENT ON TABLE public.product_performance IS 'Performance de produtos por período';
COMMENT ON COLUMN public.product_performance.performance_status IS 'Status: excellent, good, average, poor';
COMMENT ON COLUMN public.product_performance.channel_breakdown IS 'Breakdown por canal (JSONB)';

-- =====================================================
-- TRIGGERS: Atualização automática de timestamps
-- =====================================================

-- Trigger para business_metrics
DROP TRIGGER IF EXISTS update_business_metrics_updated_at ON public.business_metrics;
CREATE TRIGGER update_business_metrics_updated_at
    BEFORE UPDATE ON public.business_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para sales_data
DROP TRIGGER IF EXISTS update_sales_data_updated_at ON public.sales_data;
CREATE TRIGGER update_sales_data_updated_at
    BEFORE UPDATE ON public.sales_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para product_performance
DROP TRIGGER IF EXISTS update_product_performance_updated_at ON public.product_performance;
CREATE TRIGGER update_product_performance_updated_at
    BEFORE UPDATE ON public.product_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_performance ENABLE ROW LEVEL SECURITY;

-- Políticas para business_metrics
DROP POLICY IF EXISTS "Users can view their own business metrics" ON public.business_metrics;
CREATE POLICY "Users can view their own business metrics"
    ON public.business_metrics FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own business metrics" ON public.business_metrics;
CREATE POLICY "Users can manage their own business metrics"
    ON public.business_metrics FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para sales_data
DROP POLICY IF EXISTS "Users can view their own sales data" ON public.sales_data;
CREATE POLICY "Users can view their own sales data"
    ON public.sales_data FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own sales data" ON public.sales_data;
CREATE POLICY "Users can manage their own sales data"
    ON public.sales_data FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para product_performance
DROP POLICY IF EXISTS "Users can view their own product performance" ON public.product_performance;
CREATE POLICY "Users can view their own product performance"
    ON public.product_performance FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own product performance" ON public.product_performance;
CREATE POLICY "Users can manage their own product performance"
    ON public.product_performance FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- GRANTS: Permissões
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_performance TO authenticated;

-- =====================================================
-- SUCESSO!
-- =====================================================
-- Tabelas criadas:
-- ✅ business_metrics
-- ✅ sales_data
-- ✅ product_performance

