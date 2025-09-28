-- sql-lint-disable
-- Enriquecimento de auditoria:
-- adiciona coluna field_diffs e diffs estruturados
-- para invoices e transactions.

BEGIN;

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS field_diffs jsonb;

-- Função: recebe jsonb antigo/novo e chaves
-- e retorna apenas valores alterados
CREATE OR REPLACE FUNCTION public.json_diff_keys(
  old_row jsonb,
  new_row jsonb,
  keys text []
)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  k text;
  result jsonb := '{}'::jsonb;
  old_v jsonb;
  new_v jsonb;
BEGIN
  FOREACH k IN ARRAY keys LOOP
    old_v := old_row -> k;
    new_v := new_row -> k;
    IF old_v IS DISTINCT FROM new_v THEN
      result := result || jsonb_build_object(k, jsonb_build_object('old', old_v, 'new', new_v));
    END IF;
  END LOOP;
  IF result = '{}'::jsonb THEN
    RETURN NULL; -- sem mudanças relevantes
  END IF;
  RETURN result;
END;$$;

-- Atualiza função de invoices
CREATE OR REPLACE FUNCTION public.log_invoice_status_change()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  diffs jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    diffs := public.json_diff_keys(to_jsonb(OLD), to_jsonb(NEW), ARRAY['status','grand_total','paid_at']);
    IF diffs IS NOT NULL THEN
      INSERT INTO public.audit_logs(tenant_id, entity_type, entity_id, old_status, new_status, changed_by, metadata, field_diffs)
      VALUES (NEW.tenant_id, 'INVOICE', NEW.id, OLD.status, NEW.status, NEW.user_id, jsonb_build_object('table','invoices'), diffs);
    END IF;
  END IF;
  RETURN NEW;
END;$$;

-- Atualiza função de transactions
CREATE OR REPLACE FUNCTION public.log_transaction_status_change()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  diffs jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    diffs := public.json_diff_keys(to_jsonb(OLD), to_jsonb(NEW), ARRAY['status','amount','occurred_at']);
    IF diffs IS NOT NULL THEN
      INSERT INTO public.audit_logs(tenant_id, entity_type, entity_id, old_status, new_status, changed_by, metadata, field_diffs)
      VALUES (NEW.tenant_id, 'TRANSACTION', NEW.id, OLD.status, NEW.status, NEW.user_id, jsonb_build_object('table','transactions'), diffs);
    END IF;
  END IF;
  RETURN NEW;
END;$$;

-- Triggers existentes continuam válidos (recriados em migração anterior).
-- Não é necessário recriar nesta migração.
-- Caso se deseje garantir versão: DROP TRIGGER + CREATE novamente (opcional).

COMMIT;
