-- sql-lint-disable
-- Índices adicionais baseados em padrões esperados de consulta.
-- Racional:
--  * transactions: dashboards filtram por tenant + período
--    índice proposto: (tenant_id, occurred_at DESC)
--  * invoices: listagens por tenant + status + ordenação recente
--    índice proposto: (tenant_id, status, issued_at DESC)
-- Evita duplicar índices já existentes. Se um similar existir,
-- este CREATE é ignorado (bloco DO). Ajustar manualmente se divergente.

BEGIN;

-- transactions (tenant_id, occurred_at DESC)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='transactions' AND indexname='idx_transactions_tenant_occurred_desc'
  ) THEN
    EXECUTE 'CREATE INDEX idx_transactions_tenant_occurred_desc ON public.transactions (tenant_id, occurred_at DESC)';
  END IF;
END;$$;

-- invoices (tenant_id, status, issued_at DESC)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='invoices' AND indexname='idx_invoices_tenant_status_issued_desc'
  ) THEN
    EXECUTE 'CREATE INDEX idx_invoices_tenant_status_issued_desc ON public.invoices (tenant_id, status, issued_at DESC)';
  END IF;
END;$$;

COMMIT;
