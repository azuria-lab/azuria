-- sql-lint-disable
-- Views financeiras: totais mensais e aging de invoices.

BEGIN;

-- v_invoice_monthly_totals: soma de grand_total por mês (issued_at) e currency
CREATE OR REPLACE VIEW public.v_invoice_monthly_totals AS
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
GROUP BY tenant_id, month, currency;

-- Aging buckets (0-30,31-60,61-90,>90) baseado em due_at e now()
CREATE OR REPLACE VIEW public.v_invoice_aging AS
WITH base AS (
  SELECT tenant_id, id, currency, grand_total, due_at, status,
    CASE
      WHEN status NOT IN ('OPEN','OVERDUE') THEN NULL
      ELSE GREATEST(0, (now()::date - due_at::date)) -- dias em atraso
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
GROUP BY tenant_id, currency;

COMMIT;
