-- ===========================================================
-- FIX RLS POLICIES FOR AI TABLES
-- Este script corrige as políticas RLS para as tabelas de IA
-- Garantindo que usuários autenticados possam acessar seus próprios dados
-- ===========================================================

-- Verificar se as tabelas existem (não criar se já existem)
-- Este é apenas um script de correção de políticas

-- ===========================================================
-- PASSO 1: Garantir que RLS está habilitado
-- ===========================================================

ALTER TABLE IF EXISTS user_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_skill_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_copilot_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS suggestion_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_achievements ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- PASSO 2: Remover todas as políticas existentes
-- ===========================================================

-- user_personalization
DROP POLICY IF EXISTS "user_personalization_select" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_insert" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_update" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_delete" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_all" ON user_personalization;
DROP POLICY IF EXISTS "Users can view their own personalization" ON user_personalization;
DROP POLICY IF EXISTS "System can manage personalization" ON user_personalization;

-- user_skill_metrics
DROP POLICY IF EXISTS "user_skill_metrics_select" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_insert" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_update" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_delete" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_all" ON user_skill_metrics;
DROP POLICY IF EXISTS "Users can view their own metrics" ON user_skill_metrics;
DROP POLICY IF EXISTS "System can manage metrics" ON user_skill_metrics;

-- user_behavior_patterns
DROP POLICY IF EXISTS "user_behavior_patterns_select" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_insert" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_update" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_delete" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_all" ON user_behavior_patterns;
DROP POLICY IF EXISTS "Users can view their own patterns" ON user_behavior_patterns;
DROP POLICY IF EXISTS "System can manage patterns" ON user_behavior_patterns;

-- user_copilot_preferences
DROP POLICY IF EXISTS "user_copilot_preferences_select" ON user_copilot_preferences;
DROP POLICY IF EXISTS "user_copilot_preferences_insert" ON user_copilot_preferences;
DROP POLICY IF EXISTS "user_copilot_preferences_update" ON user_copilot_preferences;
DROP POLICY IF EXISTS "user_copilot_preferences_delete" ON user_copilot_preferences;
DROP POLICY IF EXISTS "user_copilot_preferences_all" ON user_copilot_preferences;

-- user_suggestions
DROP POLICY IF EXISTS "user_suggestions_select" ON user_suggestions;
DROP POLICY IF EXISTS "user_suggestions_insert" ON user_suggestions;
DROP POLICY IF EXISTS "user_suggestions_update" ON user_suggestions;
DROP POLICY IF EXISTS "user_suggestions_delete" ON user_suggestions;
DROP POLICY IF EXISTS "user_suggestions_all" ON user_suggestions;

-- suggestion_feedback
DROP POLICY IF EXISTS "suggestion_feedback_select" ON suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_insert" ON suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_update" ON suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_delete" ON suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_all" ON suggestion_feedback;

-- user_tutorial_progress
DROP POLICY IF EXISTS "user_tutorial_progress_select" ON user_tutorial_progress;
DROP POLICY IF EXISTS "user_tutorial_progress_insert" ON user_tutorial_progress;
DROP POLICY IF EXISTS "user_tutorial_progress_update" ON user_tutorial_progress;
DROP POLICY IF EXISTS "user_tutorial_progress_delete" ON user_tutorial_progress;
DROP POLICY IF EXISTS "user_tutorial_progress_all" ON user_tutorial_progress;

-- user_achievements
DROP POLICY IF EXISTS "user_achievements_select" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_insert" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_update" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_delete" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_all" ON user_achievements;

-- ===========================================================
-- PASSO 3: Criar novas políticas permissivas
-- Usando FOR ALL com USING e WITH CHECK para todas operações
-- ===========================================================

-- user_personalization: usuário pode gerenciar seus próprios dados
CREATE POLICY "user_personalization_policy"
  ON user_personalization
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_skill_metrics: usuário pode gerenciar suas próprias métricas
CREATE POLICY "user_skill_metrics_policy"
  ON user_skill_metrics
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_behavior_patterns: usuário pode gerenciar seus próprios padrões
CREATE POLICY "user_behavior_patterns_policy"
  ON user_behavior_patterns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_copilot_preferences: usuário pode gerenciar suas próprias preferências
CREATE POLICY "user_copilot_preferences_policy"
  ON user_copilot_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_suggestions: usuário pode gerenciar suas próprias sugestões
CREATE POLICY "user_suggestions_policy"
  ON user_suggestions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- suggestion_feedback: usuário pode gerenciar seus próprios feedbacks
CREATE POLICY "suggestion_feedback_policy"
  ON suggestion_feedback
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_tutorial_progress: usuário pode gerenciar seu próprio progresso
CREATE POLICY "user_tutorial_progress_policy"
  ON user_tutorial_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_achievements: usuário pode gerenciar suas próprias conquistas
CREATE POLICY "user_achievements_policy"
  ON user_achievements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===========================================================
-- PASSO 4: Verificar se as políticas foram criadas
-- ===========================================================

-- Esta query mostra as políticas criadas (executar separadamente no Supabase)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' 
-- AND tablename IN ('user_personalization', 'user_skill_metrics', 'user_behavior_patterns');
