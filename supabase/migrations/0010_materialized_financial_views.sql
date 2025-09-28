-- sql-lint-disable
-- Materialized views para métricas financeiras derivadas + função de refresh.
-- Substituem (ou complementam) as views não materializadas criadas em 0008.
-- Estratégia: manter views originais para queries em tempo real e oferecer MVs para dashboards pesados.

BEGIN;

-- Drop seguro caso já existam (idempotência em ambientes de reprovisionamento)
DROP MATERIALIZED VIEW IF EXISTS public.mv_invoice_monthly_totals;
DROP MATERIALIZED VIEW IF EXISTS public.mv_invoice_aging;

CREATE MATERIALIZED VIEW public.mv_invoice_monthly_totals AS
SELECT
  tenant_id,
  date_trunc('month', issued_at) AS month,
  currency,
  COUNT(*) FILTER (WHERE status IN ('OPEN','PAID','OVERDUE')) AS invoice_count,
  SUM(grand_total) FILTER (WHERE status IN ('OPEN','PAID','OVERDUE')) AS total_amount,
  SUM(grand_total) FILTER (WHERE status = 'PAID') AS total_paid,
  SUM(grand_total) FILTER (WHERE status = 'OPEN') AS total_open,
  SUM(grand_total) FILTER (WHERE status = 'OVERDUE') AS total_overdue
FROM public.invoices
GROUP BY tenant_id, month, currency
WITH NO DATA; -- preencher após primeira carga manual

-- Índice para acelerar filtros por tenant/mês
CREATE INDEX mv_invoice_monthly_totals_tenant_month_idx
  ON public.mv_invoice_monthly_totals (tenant_id, month DESC);

CREATE MATERIALIZED VIEW public.mv_invoice_aging AS
WITH base AS (
  SELECT tenant_id, id, currency, grand_total, due_at, status,
    CASE
      WHEN status NOT IN ('OPEN','OVERDUE') THEN NULL
      ELSE GREATEST(0, (now()::date - due_at::date))
    END AS days_overdue
  FROM public.invoices
)
SELECT
  tenant_id,
  currency,
  COUNT(*) FILTER (WHERE days_overdue IS NOT NULL) AS open_overdue_count,
  SUM(grand_total) FILTER (WHERE days_overdue IS NOT NULL) AS open_overdue_total,
  SUM(grand_total) FILTER (WHERE days_overdue BETWEEN 0 AND 30) AS bucket_0_30,
  SUM(grand_total) FILTER (WHERE days_overdue BETWEEN 31 AND 60) AS bucket_31_60,
  SUM(grand_total) FILTER (WHERE days_overdue BETWEEN 61 AND 90) AS bucket_61_90,
  SUM(grand_total) FILTER (WHERE days_overdue > 90) AS bucket_gt_90
FROM base
GROUP BY tenant_id, currency
WITH NO DATA;

CREATE INDEX mv_invoice_aging_tenant_currency_idx
  ON public.mv_invoice_aging (tenant_id, currency);

-- Função de refresh (CONCURRENTLY para leitura não bloqueante)
CREATE OR REPLACE FUNCTION public.refresh_financial_materialized_views()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_invoice_monthly_totals;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_invoice_aging;
END;$$;

COMMENT ON FUNCTION public.refresh_financial_materialized_views() IS 'Atualiza materialized views financeiras (monthly totals e aging).';

COMMIT;
