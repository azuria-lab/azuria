-- sql-lint-disable
-- Cria tabela audit_logs para registrar mudanças de status em invoices e transactions.
-- Inclui triggers que capturam transições relevantes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_type text NOT NULL, -- 'INVOICE' | 'TRANSACTION'
  entity_id uuid NOT NULL,
  old_status text,
  new_status text,
  changed_by uuid, -- user_id se disponível
  changed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_logs_tenant_entity_idx ON public.audit_logs (tenant_id, entity_type, changed_at DESC);

-- Função genérica para log de mudança de status invoice
CREATE OR REPLACE FUNCTION public.log_invoice_status_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.audit_logs(tenant_id, entity_type, entity_id, old_status, new_status, changed_by, metadata)
    VALUES (NEW.tenant_id, 'INVOICE', NEW.id, OLD.status, NEW.status, NEW.user_id, jsonb_build_object('table','invoices'));
  END IF;
  RETURN NEW;
END;$$;

-- Função genérica para log de mudança de status transaction
CREATE OR REPLACE FUNCTION public.log_transaction_status_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.audit_logs(tenant_id, entity_type, entity_id, old_status, new_status, changed_by, metadata)
    VALUES (NEW.tenant_id, 'TRANSACTION', NEW.id, OLD.status, NEW.status, NEW.user_id, jsonb_build_object('table','transactions'));
  END IF;
  RETURN NEW;
END;$$;

-- Triggers (usar IF EXISTS para robustez em ambientes parciais)
DROP TRIGGER IF EXISTS trg_invoice_status_audit ON public.invoices;
CREATE TRIGGER trg_invoice_status_audit
AFTER UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.log_invoice_status_change();

DROP TRIGGER IF EXISTS trg_transaction_status_audit ON public.transactions;
CREATE TRIGGER trg_transaction_status_audit
AFTER UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_transaction_status_change();

COMMIT;
