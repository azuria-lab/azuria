-- sql-lint-disable
-- Skeleton para particionamento futuro de transactions (mensal).
-- NÃO cria partições reais agora; apenas função utilitária e comentários.

BEGIN;

-- Função placeholder: cria partição mensal se não existir.
CREATE OR REPLACE FUNCTION public.ensure_transactions_partition(p_month date)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  part_suffix text := to_char(p_month, 'YYYYMM');
  part_table text := 'transactions_' || part_suffix;
  full_name text := 'public.' || part_table;
  start_date date := date_trunc('month', p_month);
  end_date date := (date_trunc('month', p_month) + interval '1 month');
BEGIN
  -- Exemplo de particionamento futuro:
  -- 1. ALTER TABLE public.transactions PARTITION BY RANGE (occurred_at);
  -- 2. CREATE TABLE IF NOT EXISTS public.transactions_YYYYMM PARTITION OF public.transactions
  --    FOR VALUES FROM ('YYYY-MM-01') TO ('YYYY-MM-01' + 1 month);
  -- Este projeto ainda não ativou PARTITION BY para manter simplicidade no MVP.
  RAISE NOTICE 'Partition skeleton invoked for % (% - %). No action performed.', part_table, start_date, end_date;
END;$$;

COMMENT ON FUNCTION public.ensure_transactions_partition(date) IS 'Placeholder: cria partição mensal de transactions quando/ se particionamento range for ativado.';

COMMIT;
