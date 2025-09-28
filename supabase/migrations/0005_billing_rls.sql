-- sql-lint-disable
-- Habilita RLS e cria políticas multi-tenant para invoices e transactions.
-- Requer função public.current_tenant_id() já existente (migr. anterior).

BEGIN;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: somente linhas do tenant corrente
CREATE POLICY invoices_select_same_tenant
	ON public.invoices FOR SELECT
	USING (tenant_id = public.current_tenant_id());
CREATE POLICY transactions_select_same_tenant
	ON public.transactions FOR SELECT
	USING (tenant_id = public.current_tenant_id());

-- INSERT: só permite inserir se tenant_id coincide
CREATE POLICY invoices_insert_same_tenant
	ON public.invoices FOR INSERT
	WITH CHECK (tenant_id = public.current_tenant_id());
CREATE POLICY transactions_insert_same_tenant
	ON public.transactions FOR INSERT
	WITH CHECK (tenant_id = public.current_tenant_id());

-- UPDATE: somente dentro do tenant
CREATE POLICY invoices_update_same_tenant
	ON public.invoices FOR UPDATE
	USING (tenant_id = public.current_tenant_id())
	WITH CHECK (tenant_id = public.current_tenant_id());
CREATE POLICY transactions_update_same_tenant
	ON public.transactions FOR UPDATE
	USING (tenant_id = public.current_tenant_id())
	WITH CHECK (tenant_id = public.current_tenant_id());

-- DELETE: coerência multi-tenant
CREATE POLICY invoices_delete_same_tenant
	ON public.invoices FOR DELETE
	USING (tenant_id = public.current_tenant_id());
CREATE POLICY transactions_delete_same_tenant
	ON public.transactions FOR DELETE
	USING (tenant_id = public.current_tenant_id());

-- (Opcional futuro) Política somente leitura para roles específicas
-- CREATE POLICY invoices_readonly_role
--   ON public.invoices FOR SELECT TO readonly_role
--   USING (tenant_id = public.current_tenant_id());

COMMIT;