-- ===================================================================
-- CORREÇÃO: Políticas RLS para Tabelas de IA
-- ===================================================================
-- Este script corrige as políticas de RLS que estão bloqueando
-- o acesso às tabelas de IA com erro 406
-- ===================================================================

-- ===================================================================
-- PARTE 1: Remover Políticas Restritivas
-- ===================================================================

-- user_personalization
DROP POLICY IF EXISTS "System can manage personalization" ON user_personalization;
DROP POLICY IF EXISTS "Users can view their own personalization" ON user_personalization;

-- user_skill_metrics
DROP POLICY IF EXISTS "System can manage metrics" ON user_skill_metrics;
DROP POLICY IF EXISTS "Users can view their own metrics" ON user_skill_metrics;

-- user_behavior_patterns
DROP POLICY IF EXISTS "System can manage patterns" ON user_behavior_patterns;
DROP POLICY IF EXISTS "Users can view their own patterns" ON user_behavior_patterns;

-- ===================================================================
-- PARTE 2: Criar Políticas Permissivas (mas ainda seguras)
-- ===================================================================

-- user_personalization: Permitir que usuários gerenciem seus próprios dados
CREATE POLICY "Users can manage their own personalization"
  ON user_personalization FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_skill_metrics: Permitir que usuários gerenciem suas próprias métricas
CREATE POLICY "Users can manage their own metrics"
  ON user_skill_metrics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_behavior_patterns: Permitir que usuários gerenciem seus próprios padrões
CREATE POLICY "Users can manage their own patterns"
  ON user_behavior_patterns FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- PARTE 3: Corrigir suggestion_feedback também
-- ===================================================================

DROP POLICY IF EXISTS "Users can view their own feedback" ON suggestion_feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON suggestion_feedback;

CREATE POLICY "Users can manage their own feedback"
  ON suggestion_feedback FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- CONCLUÍDO! ✅
-- ===================================================================
-- As políticas de RLS foram corrigidas!
-- Os erros 406 devem desaparecer após recarregar a aplicação.
-- ===================================================================
