-- Criado em: 2025-09-27
-- Descrição: Schema completo para Hub Multi-Marketplace
-- Autor: Sistema Azuria

-- Extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de plataformas de marketplace
CREATE TABLE IF NOT EXISTS marketplace_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform_type TEXT NOT NULL CHECK (platform_type IN (
        'AMAZON', 'MERCADO_LIVRE', 'SHOPIFY', 'MAGENTO', 'WOOCOMMERCE', 
        'SHOPEE', 'EBAY', 'ETSY', 'FACEBOOK', 'INSTAGRAM', 'OTHER'
    )),
    api_credentials JSONB NOT NULL DEFAULT '{}',
    configuration JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR', 'SYNC')),
    last_sync_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT marketplace_platforms_tenant_name_unique UNIQUE (tenant_id, name)
);

-- Trigger para updated_at
CREATE TRIGGER trg_marketplace_platforms_set_updated_at 
    BEFORE UPDATE ON marketplace_platforms 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tabela de produtos de marketplace (relaciona produtos com plataformas)
CREATE TABLE IF NOT EXISTS marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES marketplace_platforms(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- ID do produto na plataforma externa
    external_sku TEXT,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,4) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
    category_external TEXT,
    attributes JSONB NOT NULL DEFAULT '{}',
    images JSONB NOT NULL DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT marketplace_products_platform_external_unique UNIQUE (platform_id, external_id)
);

-- Trigger para updated_at
CREATE TRIGGER trg_marketplace_products_set_updated_at 
    BEFORE UPDATE ON marketplace_products 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tabela de pedidos de marketplace
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES marketplace_platforms(id) ON DELETE CASCADE,
    external_order_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    total_amount NUMERIC(12,4) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL CHECK (status IN (
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    )),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'
    )),
    shipping_address JSONB NOT NULL DEFAULT '{}',
    billing_address JSONB NOT NULL DEFAULT '{}',
    order_date TIMESTAMPTZ NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    fees JSONB NOT NULL DEFAULT '{}',
    tracking_code TEXT,
    notes TEXT,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT marketplace_orders_platform_external_unique UNIQUE (platform_id, external_order_id)
);

-- Trigger para updated_at
CREATE TRIGGER trg_marketplace_orders_set_updated_at 
    BEFORE UPDATE ON marketplace_orders 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tabela de jobs de sincronização
CREATE TABLE IF NOT EXISTS marketplace_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES marketplace_platforms(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN (
        'FULL_SYNC', 'PRODUCTS_SYNC', 'ORDERS_SYNC', 'INVENTORY_SYNC', 'PRICING_SYNC'
    )),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'
    )),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_error INTEGER DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER trg_marketplace_sync_jobs_set_updated_at 
    BEFORE UPDATE ON marketplace_sync_jobs 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_marketplace_platforms_tenant_status 
    ON marketplace_platforms(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_tenant_platform 
    ON marketplace_products(tenant_id, platform_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_product_id 
    ON marketplace_products(product_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_tenant_platform 
    ON marketplace_orders(tenant_id, platform_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status 
    ON marketplace_orders(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_date 
    ON marketplace_orders(tenant_id, order_date DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_sync_jobs_tenant_status 
    ON marketplace_sync_jobs(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_marketplace_sync_jobs_platform_type 
    ON marketplace_sync_jobs(platform_id, job_type);

-- Habilitar RLS nas novas tabelas
ALTER TABLE marketplace_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Policies para marketplace_platforms
CREATE POLICY "Users can view marketplace platforms for their tenant" 
    ON marketplace_platforms FOR SELECT 
    USING (tenant_id = current_tenant_id());

CREATE POLICY "Users can insert marketplace platforms for their tenant" 
    ON marketplace_platforms FOR INSERT 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can update marketplace platforms for their tenant" 
    ON marketplace_platforms FOR UPDATE 
    USING (tenant_id = current_tenant_id()) 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can delete marketplace platforms for their tenant" 
    ON marketplace_platforms FOR DELETE 
    USING (tenant_id = current_tenant_id());

-- Policies para marketplace_products
CREATE POLICY "Users can view marketplace products for their tenant" 
    ON marketplace_products FOR SELECT 
    USING (tenant_id = current_tenant_id());

CREATE POLICY "Users can insert marketplace products for their tenant" 
    ON marketplace_products FOR INSERT 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can update marketplace products for their tenant" 
    ON marketplace_products FOR UPDATE 
    USING (tenant_id = current_tenant_id()) 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can delete marketplace products for their tenant" 
    ON marketplace_products FOR DELETE 
    USING (tenant_id = current_tenant_id());

-- Policies para marketplace_orders
CREATE POLICY "Users can view marketplace orders for their tenant" 
    ON marketplace_orders FOR SELECT 
    USING (tenant_id = current_tenant_id());

CREATE POLICY "Users can insert marketplace orders for their tenant" 
    ON marketplace_orders FOR INSERT 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can update marketplace orders for their tenant" 
    ON marketplace_orders FOR UPDATE 
    USING (tenant_id = current_tenant_id()) 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can delete marketplace orders for their tenant" 
    ON marketplace_orders FOR DELETE 
    USING (tenant_id = current_tenant_id());

-- Policies para marketplace_sync_jobs
CREATE POLICY "Users can view marketplace sync jobs for their tenant" 
    ON marketplace_sync_jobs FOR SELECT 
    USING (tenant_id = current_tenant_id());

CREATE POLICY "Users can insert marketplace sync jobs for their tenant" 
    ON marketplace_sync_jobs FOR INSERT 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can update marketplace sync jobs for their tenant" 
    ON marketplace_sync_jobs FOR UPDATE 
    USING (tenant_id = current_tenant_id()) 
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "Users can delete marketplace sync jobs for their tenant" 
    ON marketplace_sync_jobs FOR DELETE 
    USING (tenant_id = current_tenant_id());

-- View para estatísticas de plataformas por tenant
CREATE OR REPLACE VIEW v_marketplace_platform_stats AS
SELECT 
    mp.tenant_id,
    mp.platform_type,
    mp.name as platform_name,
    mp.status,
    COUNT(mpr.id) as total_products,
    COUNT(CASE WHEN mpr.status = 'ACTIVE' THEN 1 END) as active_products,
    COUNT(mo.id) as total_orders,
    COALESCE(SUM(mo.total_amount), 0) as total_revenue,
    mp.last_sync_at,
    mp.created_at,
    mp.updated_at
FROM marketplace_platforms mp
LEFT JOIN marketplace_products mpr ON mp.id = mpr.platform_id
LEFT JOIN marketplace_orders mo ON mp.id = mo.platform_id
GROUP BY mp.id, mp.tenant_id, mp.platform_type, mp.name, mp.status, mp.last_sync_at, mp.created_at, mp.updated_at;

-- View para relatório de vendas por plataforma
CREATE OR REPLACE VIEW v_marketplace_sales_report AS
SELECT 
    mo.tenant_id,
    mp.platform_type,
    mp.name as platform_name,
    DATE_TRUNC('day', mo.order_date) as order_date,
    COUNT(mo.id) as order_count,
    SUM(mo.total_amount) as daily_revenue,
    AVG(mo.total_amount) as avg_order_value,
    COUNT(CASE WHEN mo.status = 'DELIVERED' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN mo.status = 'CANCELLED' THEN 1 END) as cancelled_orders
FROM marketplace_orders mo
JOIN marketplace_platforms mp ON mo.platform_id = mp.id
WHERE mo.order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY mo.tenant_id, mp.platform_type, mp.name, DATE_TRUNC('day', mo.order_date)
ORDER BY order_date DESC;

-- View para produtos com performance por plataforma
CREATE OR REPLACE VIEW v_marketplace_product_performance AS
SELECT 
    mpr.tenant_id,
    mpr.product_id,
    p.sku,
    p.name as product_name,
    mp.platform_type,
    mp.name as platform_name,
    mpr.title as marketplace_title,
    mpr.price as marketplace_price,
    mpr.stock_quantity,
    mpr.status,
    COUNT(mo.id) as total_orders,
    COALESCE(SUM(
        CASE 
            WHEN jsonb_typeof(mo.items) = 'array' THEN
                (SELECT COALESCE(sum((item->>'quantity')::numeric), 0) 
                 FROM jsonb_array_elements(mo.items) as item 
                 WHERE item->>'external_id' = mpr.external_id)
            ELSE 0
        END
    ), 0) as total_quantity_sold,
    COALESCE(SUM(
        CASE 
            WHEN jsonb_typeof(mo.items) = 'array' THEN
                (SELECT COALESCE(sum((item->>'total')::numeric), 0) 
                 FROM jsonb_array_elements(mo.items) as item 
                 WHERE item->>'external_id' = mpr.external_id)
            ELSE 0
        END
    ), 0) as total_revenue,
    mpr.last_sync_at,
    mpr.updated_at
FROM marketplace_products mpr
JOIN products p ON mpr.product_id = p.id
JOIN marketplace_platforms mp ON mpr.platform_id = mp.id
LEFT JOIN marketplace_orders mo ON mo.platform_id = mp.id 
    AND jsonb_path_exists(mo.items, ('$[*] ? (@.external_id == "' || mpr.external_id || '")')::jsonpath)
GROUP BY mpr.tenant_id, mpr.product_id, p.sku, p.name, mp.platform_type, mp.name, 
         mpr.title, mpr.price, mpr.stock_quantity, mpr.status, mpr.last_sync_at, mpr.updated_at;

-- View para dashboard principal
CREATE OR REPLACE VIEW v_marketplace_dashboard AS
SELECT 
    mp.tenant_id,
    COUNT(DISTINCT mp.id) as total_platforms,
    COUNT(DISTINCT CASE WHEN mp.status = 'ACTIVE' THEN mp.id END) as active_platforms,
    COUNT(DISTINCT mpr.id) as total_products,
    COUNT(DISTINCT CASE WHEN mpr.status = 'ACTIVE' THEN mpr.id END) as active_products,
    COUNT(DISTINCT mo.id) as total_orders,
    COUNT(DISTINCT CASE WHEN mo.order_date >= CURRENT_DATE - INTERVAL '30 days' THEN mo.id END) as orders_last_30_days,
    COALESCE(SUM(mo.total_amount), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN mo.order_date >= CURRENT_DATE - INTERVAL '30 days' THEN mo.total_amount END), 0) as revenue_last_30_days,
    COUNT(DISTINCT CASE WHEN msj.status = 'RUNNING' THEN msj.id END) as active_sync_jobs,
    COUNT(DISTINCT CASE WHEN msj.created_at >= CURRENT_DATE - INTERVAL '1 day' AND msj.status = 'FAILED' THEN msj.id END) as failed_jobs_last_24h
FROM marketplace_platforms mp
LEFT JOIN marketplace_products mpr ON mp.id = mpr.platform_id
LEFT JOIN marketplace_orders mo ON mp.id = mo.platform_id
LEFT JOIN marketplace_sync_jobs msj ON mp.id = msj.platform_id
GROUP BY mp.tenant_id;

-- Habilitar RLS nas views
ALTER VIEW v_marketplace_platform_stats SET (security_invoker = true);
ALTER VIEW v_marketplace_sales_report SET (security_invoker = true);
ALTER VIEW v_marketplace_product_performance SET (security_invoker = true);
ALTER VIEW v_marketplace_dashboard SET (security_invoker = true);

-- Função para obter estatísticas de sincronização
CREATE OR REPLACE FUNCTION get_marketplace_sync_stats(p_tenant_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    job_type TEXT,
    total_jobs BIGINT,
    completed_jobs BIGINT,
    failed_jobs BIGINT,
    success_rate NUMERIC,
    avg_processing_time INTERVAL,
    last_success_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        msj.job_type,
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN msj.status = 'COMPLETED' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN msj.status = 'FAILED' THEN 1 END) as failed_jobs,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN msj.status = 'COMPLETED' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as success_rate,
        AVG(msj.completed_at - msj.started_at) as avg_processing_time,
        MAX(CASE WHEN msj.status = 'COMPLETED' THEN msj.completed_at END) as last_success_at
    FROM marketplace_sync_jobs msj
    WHERE msj.tenant_id = p_tenant_id 
        AND msj.created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
    GROUP BY msj.job_type
    ORDER BY msj.job_type;
END;
$$;

-- Função para calcular métricas de marketplace
CREATE OR REPLACE FUNCTION calculate_marketplace_metrics(p_tenant_id UUID, p_period TEXT DEFAULT 'month')
RETURNS TABLE (
    platform_name TEXT,
    platform_type TEXT,
    total_orders BIGINT,
    total_revenue NUMERIC,
    avg_order_value NUMERIC,
    conversion_rate NUMERIC,
    top_selling_products JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    date_filter INTERVAL;
BEGIN
    -- Definir período de análise
    CASE p_period
        WHEN 'week' THEN date_filter := INTERVAL '7 days';
        WHEN 'month' THEN date_filter := INTERVAL '30 days';
        WHEN 'quarter' THEN date_filter := INTERVAL '90 days';
        WHEN 'year' THEN date_filter := INTERVAL '365 days';
        ELSE date_filter := INTERVAL '30 days';
    END CASE;

    RETURN QUERY
    WITH platform_metrics AS (
        SELECT 
            mp.name as platform_name,
            mp.platform_type,
            COUNT(mo.id) as total_orders,
            COALESCE(SUM(mo.total_amount), 0) as total_revenue,
            CASE 
                WHEN COUNT(mo.id) > 0 THEN COALESCE(SUM(mo.total_amount), 0) / COUNT(mo.id)
                ELSE 0
            END as avg_order_value,
            -- Conversão = pedidos / produtos ativos (aproximação)
            CASE 
                WHEN COUNT(DISTINCT mpr.id) > 0 THEN 
                    (COUNT(mo.id)::NUMERIC / COUNT(DISTINCT mpr.id)::NUMERIC) * 100
                ELSE 0
            END as conversion_rate
        FROM marketplace_platforms mp
        LEFT JOIN marketplace_products mpr ON mp.id = mpr.platform_id AND mpr.status = 'ACTIVE'
        LEFT JOIN marketplace_orders mo ON mp.id = mo.platform_id 
            AND mo.order_date >= CURRENT_DATE - date_filter
        WHERE mp.tenant_id = p_tenant_id
        GROUP BY mp.id, mp.name, mp.platform_type
    ),
    top_products AS (
        SELECT 
            mp.id as platform_id,
            jsonb_agg(
                jsonb_build_object(
                    'product_name', p.name,
                    'sku', p.sku,
                    'quantity_sold', product_sales.quantity_sold,
                    'revenue', product_sales.revenue
                ) ORDER BY product_sales.quantity_sold DESC
            ) FILTER (WHERE product_sales.quantity_sold > 0) as top_products
        FROM marketplace_platforms mp
        LEFT JOIN (
            SELECT 
                mpr.platform_id,
                mpr.product_id,
                COALESCE(SUM(
                    CASE 
                        WHEN jsonb_typeof(mo.items) = 'array' THEN
                            (SELECT COALESCE(sum((item->>'quantity')::numeric), 0) 
                             FROM jsonb_array_elements(mo.items) as item 
                             WHERE item->>'external_id' = mpr.external_id)
                        ELSE 0
                    END
                ), 0) as quantity_sold,
                COALESCE(SUM(
                    CASE 
                        WHEN jsonb_typeof(mo.items) = 'array' THEN
                            (SELECT COALESCE(sum((item->>'total')::numeric), 0) 
                             FROM jsonb_array_elements(mo.items) as item 
                             WHERE item->>'external_id' = mpr.external_id)
                        ELSE 0
                    END
                ), 0) as revenue
            FROM marketplace_products mpr
            LEFT JOIN marketplace_orders mo ON mo.platform_id = mpr.platform_id 
                AND mo.order_date >= CURRENT_DATE - date_filter
                AND jsonb_path_exists(mo.items, ('$[*] ? (@.external_id == "' || mpr.external_id || '")')::jsonpath)
            WHERE mpr.tenant_id = p_tenant_id
            GROUP BY mpr.platform_id, mpr.product_id
        ) product_sales ON mp.id = product_sales.platform_id
        LEFT JOIN products p ON product_sales.product_id = p.id
        WHERE mp.tenant_id = p_tenant_id
        GROUP BY mp.id
    )
    SELECT 
        pm.platform_name,
        pm.platform_type,
        pm.total_orders,
        pm.total_revenue,
        pm.avg_order_value,
        pm.conversion_rate,
        COALESCE(tp.top_products, '[]'::jsonb) as top_selling_products
    FROM platform_metrics pm
    LEFT JOIN top_products tp ON tp.platform_id IN (
        SELECT id FROM marketplace_platforms WHERE name = pm.platform_name AND tenant_id = p_tenant_id
    )
    ORDER BY pm.total_revenue DESC;
END;
$$;

-- Função para limpar dados antigos de sync jobs
CREATE OR REPLACE FUNCTION cleanup_old_sync_jobs(p_tenant_id UUID, p_days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM marketplace_sync_jobs 
    WHERE tenant_id = p_tenant_id 
        AND created_at < CURRENT_DATE - INTERVAL '1 day' * p_days_to_keep
        AND status IN ('COMPLETED', 'FAILED', 'CANCELLED');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Função para validar credenciais de plataforma
CREATE OR REPLACE FUNCTION validate_platform_credentials(p_platform_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    platform_record marketplace_platforms%ROWTYPE;
    required_fields TEXT[];
    field TEXT;
BEGIN
    SELECT * INTO platform_record FROM marketplace_platforms WHERE id = p_platform_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Definir campos obrigatórios por tipo de plataforma
    CASE platform_record.platform_type
        WHEN 'AMAZON' THEN 
            required_fields := ARRAY['access_key', 'secret_key', 'seller_id', 'marketplace_id'];
        WHEN 'MERCADO_LIVRE' THEN 
            required_fields := ARRAY['client_id', 'client_secret', 'access_token'];
        WHEN 'SHOPIFY' THEN 
            required_fields := ARRAY['api_key', 'api_secret', 'shop_domain'];
        WHEN 'MAGENTO' THEN 
            required_fields := ARRAY['base_url', 'consumer_key', 'consumer_secret', 'access_token'];
        WHEN 'WOOCOMMERCE' THEN 
            required_fields := ARRAY['base_url', 'consumer_key', 'consumer_secret'];
        ELSE 
            required_fields := ARRAY['api_key'];
    END CASE;
    
    -- Verificar se todos os campos obrigatórios estão presentes
    FOREACH field IN ARRAY required_fields
    LOOP
        IF NOT (platform_record.api_credentials ? field) OR 
           (platform_record.api_credentials ->> field) IS NULL OR 
           (platform_record.api_credentials ->> field) = '' THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$;

-- Comentários para documentação
COMMENT ON TABLE marketplace_platforms IS 'Plataformas de marketplace conectadas ao sistema';
COMMENT ON TABLE marketplace_products IS 'Produtos sincronizados com plataformas de marketplace';
COMMENT ON TABLE marketplace_orders IS 'Pedidos recebidos das plataformas de marketplace';
COMMENT ON TABLE marketplace_sync_jobs IS 'Jobs de sincronização executados com as plataformas';

COMMENT ON COLUMN marketplace_platforms.api_credentials IS 'Credenciais de API criptografadas para autenticação';
COMMENT ON COLUMN marketplace_platforms.configuration IS 'Configurações específicas da plataforma';
COMMENT ON COLUMN marketplace_products.attributes IS 'Atributos específicos do produto na plataforma';
COMMENT ON COLUMN marketplace_products.images IS 'URLs e metadados das imagens do produto';
COMMENT ON COLUMN marketplace_orders.items IS 'Array com detalhes dos itens do pedido';
COMMENT ON COLUMN marketplace_orders.fees IS 'Taxas e custos associados ao pedido';
COMMENT ON COLUMN marketplace_sync_jobs.metadata IS 'Metadados adicionais sobre o job de sincronização';

COMMENT ON VIEW v_marketplace_platform_stats IS 'Estatísticas consolidadas por plataforma de marketplace';
COMMENT ON VIEW v_marketplace_sales_report IS 'Relatório de vendas diárias por plataforma dos últimos 30 dias';
COMMENT ON VIEW v_marketplace_product_performance IS 'Performance de produtos por plataforma com métricas de vendas';
COMMENT ON VIEW v_marketplace_dashboard IS 'Métricas principais para dashboard do marketplace';

COMMENT ON FUNCTION get_marketplace_sync_stats IS 'Retorna estatísticas de sincronização por tipo de job';
COMMENT ON FUNCTION calculate_marketplace_metrics IS 'Calcula métricas consolidadas de performance por plataforma';
COMMENT ON FUNCTION cleanup_old_sync_jobs IS 'Remove jobs de sincronização antigos para manter a base limpa';
COMMENT ON FUNCTION validate_platform_credentials IS 'Valida se as credenciais da plataforma estão completas';