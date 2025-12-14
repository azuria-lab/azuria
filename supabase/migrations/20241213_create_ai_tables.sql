-- ============================================================================
-- Migration: Criar tabelas para IA do Azuria (Modo Deus)
-- Data: 2024-12-13
-- Descrição: Tabelas para persistência de padrões de comportamento,
--            personalização, sugestões e feedback do Co-Piloto
-- ============================================================================

-- ===========================================================
-- PARTE 1: TABELAS DO CO-PILOTO OPERACIONAL
-- ===========================================================

-- TABELA: user_suggestions
CREATE TABLE IF NOT EXISTS user_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  suggestion_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tip', 'warning', 'insight', 'action', 'explanation')),
  category TEXT NOT NULL CHECK (category IN (
    'general', 'pricing', 'bidding', 'inventory', 'communication', 
    'performance', 'compliance', 'opportunity'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  actions JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'shown', 'accepted', 'dismissed', 'expired', 'completed'
  )),
  
  context JSONB DEFAULT '{}'::JSONB,
  screen TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shown_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user_id, suggestion_id)
);

-- TABELA: suggestion_feedback
CREATE TABLE IF NOT EXISTS suggestion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES user_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'helpful', 'not_helpful', 'too_frequent', 'wrong_timing', 'confusing', 'other'
  )),
  comment TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  context JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABELA: user_copilot_preferences
CREATE TABLE IF NOT EXISTS user_copilot_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  frequency TEXT NOT NULL DEFAULT 'balanced' CHECK (frequency IN ('minimal', 'balanced', 'proactive')),
  
  silenced_categories TEXT[] DEFAULT '{}',
  silenced_types TEXT[] DEFAULT '{}',
  
  max_per_hour INTEGER DEFAULT 10,
  silence_during_typing BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================
-- PARTE 2: TABELAS DE APRENDIZADO E PERSONALIZAÇÃO
-- ===========================================================

-- TABELA: user_behavior_patterns
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'navigation', 'calculation', 'preference', 'timing', 
    'error_prone', 'feature_usage', 'skill_progression'
  )),
  pattern_key TEXT NOT NULL,
  
  pattern_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  occurrences INTEGER NOT NULL DEFAULT 1,
  
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'::JSONB,
  
  UNIQUE(user_id, pattern_type, pattern_key)
);

-- TABELA: user_skill_metrics
CREATE TABLE IF NOT EXISTS user_skill_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  skill_level TEXT NOT NULL DEFAULT 'beginner' CHECK (skill_level IN (
    'beginner', 'intermediate', 'advanced', 'expert'
  )),
  skill_score INTEGER NOT NULL DEFAULT 0,
  
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_calculations INTEGER NOT NULL DEFAULT 0,
  successful_calculations INTEGER NOT NULL DEFAULT 0,
  total_errors INTEGER NOT NULL DEFAULT 0,
  
  advanced_features_used INTEGER NOT NULL DEFAULT 0,
  shortcuts_used INTEGER NOT NULL DEFAULT 0,
  help_views INTEGER NOT NULL DEFAULT 0,
  
  avg_calculation_time_ms INTEGER,
  total_time_spent_ms BIGINT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABELA: user_personalization
CREATE TABLE IF NOT EXISTS user_personalization (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  preferred_calculator TEXT,
  preferred_explanation_depth TEXT DEFAULT 'standard' CHECK (preferred_explanation_depth IN (
    'minimal', 'standard', 'detailed', 'expert'
  )),
  typical_usage_time TEXT CHECK (typical_usage_time IN (
    'morning', 'afternoon', 'evening', 'night'
  )),
  
  accepts_proactive_suggestions BOOLEAN DEFAULT TRUE,
  optimal_suggestion_frequency TEXT DEFAULT 'medium' CHECK (optimal_suggestion_frequency IN (
    'low', 'medium', 'high'
  )),
  
  engagement_score INTEGER DEFAULT 50,
  last_active_at TIMESTAMPTZ,
  consecutive_days INTEGER DEFAULT 0,
  
  inferred_preferences JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABELA: user_tutorial_progress
CREATE TABLE IF NOT EXISTS user_tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'abandoned'
  )),
  
  current_step_index INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT[] DEFAULT '{}',
  skipped_steps TEXT[] DEFAULT '{}',
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_ms BIGINT NOT NULL DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, tutorial_id)
);

-- TABELA: user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  tutorial_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- ===========================================================
-- ÍNDICES
-- ===========================================================

-- user_suggestions
CREATE INDEX IF NOT EXISTS idx_user_suggestions_user_id ON user_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_status ON user_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_type ON user_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_created_at ON user_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_user_status ON user_suggestions(user_id, status);

-- suggestion_feedback
CREATE INDEX IF NOT EXISTS idx_suggestion_feedback_user_id ON suggestion_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_feedback_type ON suggestion_feedback(feedback_type);

-- user_behavior_patterns
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_user_id ON user_behavior_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_type ON user_behavior_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_confidence ON user_behavior_patterns(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_last_detected ON user_behavior_patterns(last_detected_at DESC);

-- user_tutorial_progress
CREATE INDEX IF NOT EXISTS idx_user_tutorial_progress_user_id ON user_tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tutorial_progress_status ON user_tutorial_progress(status);

-- user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- ===========================================================
-- ROW LEVEL SECURITY
-- ===========================================================

ALTER TABLE user_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_copilot_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- POLÍTICAS RLS
-- ===========================================================

-- Limpar políticas existentes
DROP POLICY IF EXISTS "user_suggestions_select" ON user_suggestions;
DROP POLICY IF EXISTS "user_suggestions_insert" ON user_suggestions;
DROP POLICY IF EXISTS "user_suggestions_update" ON user_suggestions;
DROP POLICY IF EXISTS "user_suggestions_upsert" ON user_suggestions;
DROP POLICY IF EXISTS "suggestion_feedback_select" ON suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_insert" ON suggestion_feedback;
DROP POLICY IF EXISTS "user_copilot_preferences_all" ON user_copilot_preferences;
DROP POLICY IF EXISTS "user_behavior_patterns_select" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_insert" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_update" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_all" ON user_behavior_patterns;
DROP POLICY IF EXISTS "user_skill_metrics_select" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_insert" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_update" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_all" ON user_skill_metrics;
DROP POLICY IF EXISTS "user_personalization_select" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_insert" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_update" ON user_personalization;
DROP POLICY IF EXISTS "user_personalization_all" ON user_personalization;
DROP POLICY IF EXISTS "user_tutorial_progress_all" ON user_tutorial_progress;
DROP POLICY IF EXISTS "user_achievements_select" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_insert" ON user_achievements;

-- Políticas antigas (caso existam)
DROP POLICY IF EXISTS "Users can view their own patterns" ON user_behavior_patterns;
DROP POLICY IF EXISTS "System can manage patterns" ON user_behavior_patterns;
DROP POLICY IF EXISTS "Users can view their own metrics" ON user_skill_metrics;
DROP POLICY IF EXISTS "System can manage metrics" ON user_skill_metrics;
DROP POLICY IF EXISTS "Users can view their own personalization" ON user_personalization;
DROP POLICY IF EXISTS "System can manage personalization" ON user_personalization;

-- user_suggestions (permitir todas operações para usuário autenticado com seu próprio user_id)
CREATE POLICY "user_suggestions_all" ON user_suggestions FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- suggestion_feedback
CREATE POLICY "suggestion_feedback_select" ON suggestion_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "suggestion_feedback_insert" ON suggestion_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_copilot_preferences
CREATE POLICY "user_copilot_preferences_all" ON user_copilot_preferences FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_behavior_patterns (permitir todas operações para usuário autenticado)
CREATE POLICY "user_behavior_patterns_all" ON user_behavior_patterns FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_skill_metrics (permitir todas operações para usuário autenticado)
CREATE POLICY "user_skill_metrics_all" ON user_skill_metrics FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_personalization (permitir todas operações para usuário autenticado)
CREATE POLICY "user_personalization_all" ON user_personalization FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_tutorial_progress
CREATE POLICY "user_tutorial_progress_all" ON user_tutorial_progress FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_achievements
CREATE POLICY "user_achievements_select" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_achievements_insert" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================================================
-- TRIGGERS PARA UPDATED_AT
-- ===========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_copilot_preferences_updated_at
  BEFORE UPDATE ON user_copilot_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_skill_metrics_updated_at
  BEFORE UPDATE ON user_skill_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_personalization_updated_at
  BEFORE UPDATE ON user_personalization
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_tutorial_progress_updated_at
  BEFORE UPDATE ON user_tutorial_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================================
-- COMENTÁRIOS
-- ===========================================================

COMMENT ON TABLE user_suggestions IS 'Sugestões do Co-Piloto Azuria para usuários';
COMMENT ON TABLE suggestion_feedback IS 'Feedback dos usuários sobre sugestões';
COMMENT ON TABLE user_copilot_preferences IS 'Preferências do Co-Piloto por usuário';
COMMENT ON TABLE user_behavior_patterns IS 'Padrões de comportamento detectados pelo sistema de IA';
COMMENT ON TABLE user_skill_metrics IS 'Métricas para detecção automática de skill level';
COMMENT ON TABLE user_personalization IS 'Perfil de personalização derivado dos padrões de uso';
COMMENT ON TABLE user_tutorial_progress IS 'Progresso do usuário em tutoriais interativos';
COMMENT ON TABLE user_achievements IS 'Conquistas desbloqueadas pelo usuário';
