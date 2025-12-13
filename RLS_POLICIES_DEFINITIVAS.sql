-- ===================================================================
-- SOLUÇÃO DEFINITIVA: Políticas RLS Seguras e Funcionais
-- ===================================================================
-- Políticas que funcionam em dev E prod, sem necessidade de alterações
-- futuras. Cada usuário só acessa seus próprios dados.
-- ===================================================================

-- ===================================================================
-- PARTE 1: Limpar todas as políticas antigas
-- ===================================================================

-- user_personalization
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "user_personalization_select" ON user_personalization;
    DROP POLICY IF EXISTS "user_personalization_insert" ON user_personalization;
    DROP POLICY IF EXISTS "user_personalization_update" ON user_personalization;
    DROP POLICY IF EXISTS "user_personalization_delete" ON user_personalization;
    DROP POLICY IF EXISTS "Allow user personalization access" ON user_personalization;
    DROP POLICY IF EXISTS "Users can manage their own personalization" ON user_personalization;
    DROP POLICY IF EXISTS "System can manage personalization" ON user_personalization;
    DROP POLICY IF EXISTS "Users can view their own personalization" ON user_personalization;
END $$;

-- user_skill_metrics
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "user_skill_metrics_select" ON user_skill_metrics;
    DROP POLICY IF EXISTS "user_skill_metrics_insert" ON user_skill_metrics;
    DROP POLICY IF EXISTS "user_skill_metrics_update" ON user_skill_metrics;
    DROP POLICY IF EXISTS "user_skill_metrics_delete" ON user_skill_metrics;
    DROP POLICY IF EXISTS "Allow user skill metrics access" ON user_skill_metrics;
    DROP POLICY IF EXISTS "Users can manage their own metrics" ON user_skill_metrics;
    DROP POLICY IF EXISTS "System can manage metrics" ON user_skill_metrics;
    DROP POLICY IF EXISTS "Users can view their own metrics" ON user_skill_metrics;
END $$;

-- user_behavior_patterns
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "user_behavior_patterns_select" ON user_behavior_patterns;
    DROP POLICY IF EXISTS "user_behavior_patterns_insert" ON user_behavior_patterns;
    DROP POLICY IF EXISTS "user_behavior_patterns_update" ON user_behavior_patterns;
    DROP POLICY IF EXISTS "user_behavior_patterns_delete" ON user_behavior_patterns;
    DROP POLICY IF EXISTS "Allow user behavior patterns access" ON user_behavior_patterns;
    DROP POLICY IF EXISTS "Users can manage their own patterns" ON user_behavior_patterns;
    DROP POLICY IF EXISTS "System can manage patterns" ON user_behavior_patterns;
    DROP POLICY IF EXISTS "Users can view their own patterns" ON user_behavior_patterns;
END $$;

-- suggestion_feedback
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "suggestion_feedback_select" ON suggestion_feedback;
    DROP POLICY IF EXISTS "suggestion_feedback_insert" ON suggestion_feedback;
    DROP POLICY IF EXISTS "suggestion_feedback_update" ON suggestion_feedback;
    DROP POLICY IF EXISTS "suggestion_feedback_delete" ON suggestion_feedback;
    DROP POLICY IF EXISTS "Allow suggestion feedback access" ON suggestion_feedback;
    DROP POLICY IF EXISTS "Users can manage their own feedback" ON suggestion_feedback;
    DROP POLICY IF EXISTS "Users can view their own feedback" ON suggestion_feedback;
    DROP POLICY IF EXISTS "Users can insert their own feedback" ON suggestion_feedback;
END $$;

-- ===================================================================
-- PARTE 2: Garantir que RLS está habilitado
-- ===================================================================

ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_feedback ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- PARTE 3: Criar políticas corretas (funcionam com UPSERT)
-- ===================================================================

-- user_personalization
-- SELECT: necessário para UPSERT verificar se registro existe
CREATE POLICY "user_personalization_select_policy" 
ON user_personalization FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- INSERT: necessário para UPSERT criar novo registro
CREATE POLICY "user_personalization_insert_policy" 
ON user_personalization FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: necessário para UPSERT atualizar registro existente
CREATE POLICY "user_personalization_update_policy" 
ON user_personalization FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: para operações de limpeza
CREATE POLICY "user_personalization_delete_policy" 
ON user_personalization FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- user_skill_metrics
CREATE POLICY "user_skill_metrics_select_policy" 
ON user_skill_metrics FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_skill_metrics_insert_policy" 
ON user_skill_metrics FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_skill_metrics_update_policy" 
ON user_skill_metrics FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_skill_metrics_delete_policy" 
ON user_skill_metrics FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- user_behavior_patterns
CREATE POLICY "user_behavior_patterns_select_policy" 
ON user_behavior_patterns FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_behavior_patterns_insert_policy" 
ON user_behavior_patterns FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_behavior_patterns_update_policy" 
ON user_behavior_patterns FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_behavior_patterns_delete_policy" 
ON user_behavior_patterns FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- suggestion_feedback
CREATE POLICY "suggestion_feedback_select_policy" 
ON suggestion_feedback FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "suggestion_feedback_insert_policy" 
ON suggestion_feedback FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "suggestion_feedback_update_policy" 
ON suggestion_feedback FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "suggestion_feedback_delete_policy" 
ON suggestion_feedback FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- ===================================================================
-- CONCLUÍDO! ✅
-- ===================================================================
-- Políticas RLS criadas com sucesso!
-- 
-- ✅ Seguras: Cada usuário só acessa seus próprios dados
-- ✅ Funcionam com UPSERT: Políticas separadas para cada operação
-- ✅ Dev e Prod: Mesmas políticas funcionam em ambos ambientes
-- ✅ TO authenticated: Garante que apenas usuários logados podem acessar
-- ✅ auth.uid() = user_id: Verifica identidade do usuário
-- 
-- Não precisa modificar nada entre dev e prod! 🎉
-- ===================================================================
