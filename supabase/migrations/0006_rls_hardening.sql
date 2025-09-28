-- sql-lint-disable
-- Hardening de RLS para invoices e transactions.
-- Aplica FORCE ROW LEVEL SECURITY, remove grants amplos e adiciona comentários descritivos nas policies.

BEGIN;

-- Garantir FORCE RLS (mesmo owner passa por policies)
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

-- Revogar privilégios amplos (caso algum tenha sido concedido anteriormente)
REVOKE ALL ON public.invoices FROM PUBLIC;
REVOKE ALL ON public.transactions FROM PUBLIC;

-- Comentários nas policies existentes (idempotente: COMMENT não falha se existir)
COMMENT ON POLICY invoices_select_same_tenant ON public.invoices IS 'SELECT somente linhas do tenant atual';
COMMENT ON POLICY invoices_insert_same_tenant ON public.invoices IS 'INSERT restrito: tenant_id deve coincidir';
COMMENT ON POLICY invoices_update_same_tenant ON public.invoices IS 'UPDATE restrito + WITH CHECK para manter tenant';
COMMENT ON POLICY invoices_delete_same_tenant ON public.invoices IS 'DELETE somente dentro do tenant';

COMMENT ON POLICY transactions_select_same_tenant ON public.transactions IS 'SELECT somente linhas do tenant atual';
COMMENT ON POLICY transactions_insert_same_tenant ON public.transactions IS 'INSERT restrito: tenant_id deve coincidir';
COMMENT ON POLICY transactions_update_same_tenant ON public.transactions IS 'UPDATE restrito + WITH CHECK para manter tenant';
COMMENT ON POLICY transactions_delete_same_tenant ON public.transactions IS 'DELETE somente dentro do tenant';

COMMIT;
