-- =====================================================
-- MIGRAÇÃO: Tabela Payment History
-- Data: 2025-01-11
-- Descrição: Cria tabela para histórico de pagamentos (Stripe e Mercado Pago)
-- =====================================================

-- =====================================================
-- TABELA: payment_history
-- Histórico de pagamentos e transações
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referências
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    
    -- Detalhes do pagamento
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
    status_detail TEXT,
    
    -- Gateway de pagamento
    payment_gateway TEXT NOT NULL CHECK (payment_gateway IN ('stripe', 'mercadopago')),
    
    -- IDs do gateway
    gateway_payment_id TEXT UNIQUE NOT NULL, -- ID do pagamento no gateway
    gateway_subscription_id TEXT, -- ID da subscription no gateway (se aplicável)
    gateway_customer_id TEXT, -- ID do customer no gateway
    
    -- Método de pagamento
    payment_type TEXT, -- credit_card, debit_card, pix, boleto, etc.
    payment_method_id TEXT, -- visa, master, pix, etc.
    
    -- Período cobrado (para subscriptions)
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata adicional
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_gateway_payment_id ON public.payment_history(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_paid_at ON public.payment_history(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_gateway ON public.payment_history(payment_gateway);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_payment_history_updated_at ON public.payment_history;
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON public.payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;
CREATE POLICY "Users can view their own payment history"
    ON public.payment_history FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full payment history access" ON public.payment_history;
CREATE POLICY "Service role has full payment history access"
    ON public.payment_history FOR ALL
    USING (auth.role() = 'service_role');

-- Grants
GRANT SELECT ON public.payment_history TO authenticated;
GRANT ALL ON public.payment_history TO service_role;

-- Comentários
COMMENT ON TABLE public.payment_history IS 'Histórico completo de pagamentos e transações';
COMMENT ON COLUMN public.payment_history.payment_gateway IS 'Gateway usado: stripe ou mercadopago';
COMMENT ON COLUMN public.payment_history.gateway_payment_id IS 'ID do pagamento no gateway (Stripe payment_intent ou MP payment_id)';

