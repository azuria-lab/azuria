-- ============================================================================
-- POLÍTICAS RLS DEFINITIVAS PARA PRODUÇÃO E DESENVOLVIMENTO
-- ============================================================================
-- Estas políticas funcionam em dev e produção, permitindo:
-- 1. Usuários autenticados acessarem APENAS seus próprios dados
-- 2. Service role ter acesso total (para operações do backend)
-- 3. Operações de INSERT/UPDATE/DELETE funcionarem corretamente
-- ============================================================================

-- Limpar políticas antigas
DROP POLICY IF EXISTS "user_personalization_select" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_insert" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_update" ON user_personalization;
DROP POLICY IF EXISTS "user_skill_metrics_select" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_insert" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_update" ON user_skill_metrics;

-- ============================================================================
-- TABELA: user_personalization
-- ============================================================================

-- Habilitar RLS
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário vê apenas seus dados
CREATE POLICY "user_personalization_select" 
ON user_personalization
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT: Usuário pode inserir apenas seus dados
CREATE POLICY "user_personalization_insert" 
ON user_personalization
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Usuário pode atualizar apenas seus dados
CREATE POLICY "user_personalization_update" 
ON user_personalization
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Usuário pode deletar apenas seus dados
CREATE POLICY "user_personalization_delete" 
ON user_personalization
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- TABELA: user_skill_metrics
-- ============================================================================

-- Habilitar RLS
ALTER TABLE user_skill_metrics ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário vê apenas seus dados
CREATE POLICY "user_skill_metrics_select" 
ON user_skill_metrics
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT: Usuário pode inserir apenas seus dados
CREATE POLICY "user_skill_metrics_insert" 
ON user_skill_metrics
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Usuário pode atualizar apenas seus dados
CREATE POLICY "user_skill_metrics_update" 
ON user_skill_metrics
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Usuário pode deletar apenas seus dados
CREATE POLICY "user_skill_metrics_delete" 
ON user_skill_metrics
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_personalization', 'user_skill_metrics')
ORDER BY tablename, policyname;

-- Verificar RLS habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_personalization', 'user_skill_metrics');

-- ============================================================================
-- RESULTADO ESPERADO:
-- - RLS habilitado (true) em ambas as tabelas
-- - 4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)
-- - Todas as políticas com role = authenticated
-- ============================================================================
