-- 0004_billing_core.sql
-- Estruturas base: invoices e transactions (referem users / tenants existentes)
-- Padrões: UUID PK, created_at default now(), FKs c/ ON DELETE CASCADE

BEGIN;

-- Nota: public.users já existe (multi-tenant). Reuso de tenants/users.

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users (id) ON DELETE SET NULL, -- criador
    number TEXT NOT NULL, -- ex: INV-2025-0001
    description TEXT,
    currency TEXT NOT NULL DEFAULT 'BRL',
    subtotal NUMERIC(14, 4) NOT NULL DEFAULT 0,
    tax_total NUMERIC(14, 4) NOT NULL DEFAULT 0,
    discount_total NUMERIC(14, 4) NOT NULL DEFAULT 0,
    grand_total NUMERIC(14, 4) GENERATED ALWAYS AS (
        subtotal + tax_total - discount_total
    ) STORED,
    status TEXT NOT NULL CHECK (
        status IN ('DRAFT', 'OPEN', 'PAID', 'CANCELLED', 'OVERDUE')
    ) DEFAULT 'DRAFT',
    issued_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, number)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices (id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users (id) ON DELETE SET NULL, -- registrador
    amount NUMERIC(14, 4) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    direction TEXT NOT NULL CHECK (
        direction IN ('IN', 'OUT')
    ), -- IN=recebimento OUT=estorno/pagamento
    method TEXT, -- 'PIX','CARD','BOLETO','TED'
    status TEXT NOT NULL CHECK (
        status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')
    ) DEFAULT 'PENDING',
    external_ref TEXT, -- ref gateway
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atualizador updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_generic()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invoices_set_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_set_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

DROP TRIGGER IF EXISTS trg_transactions_set_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status
ON public.invoices (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_issued
ON public.invoices (tenant_id, issued_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_direction
ON public.transactions (tenant_id, direction);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_invoice
ON public.transactions (tenant_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_created
ON public.transactions (tenant_id, created_at DESC);

-- Partial index invoices abertas/overdue
CREATE INDEX IF NOT EXISTS idx_invoices_open_overdue
ON public.invoices (tenant_id, due_at)
WHERE status IN ('OPEN', 'OVERDUE');

-- RLS placeholders (ativar em migração futura)
-- ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY invoices_select_same_tenant ON public.invoices
--   FOR SELECT USING (tenant_id = public.current_tenant_id());
-- CREATE POLICY transactions_select_same_tenant ON public.transactions
--   FOR SELECT USING (tenant_id = public.current_tenant_id());

COMMIT;