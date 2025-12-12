-- Migration: Tabelas para Aprendizado e Personalização (Modo Deus - Fase 4)
-- Descrição: Armazena padrões de uso, progresso de tutoriais e personalização
-- Fase 4 do plano de implementação Modo Deus

-- ===========================================================
-- TABELA: user_behavior_patterns
-- Padrões de comportamento detectados pelo PatternLearningEngine
-- ===========================================================
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificação do padrão
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'navigation', 'calculation', 'preference', 'timing', 
    'error_prone', 'feature_usage', 'skill_progression'
  )),
  pattern_key TEXT NOT NULL,
  
  -- Dados do padrão
  pattern_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  occurrences INTEGER NOT NULL DEFAULT 1,
  
  -- Contexto
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Índice único para evitar duplicatas
  UNIQUE(user_id, pattern_type, pattern_key)
);

-- ===========================================================
-- TABELA: user_skill_metrics
-- Métricas de habilidade do usuário para detecção de skill level
-- ===========================================================
CREATE TABLE IF NOT EXISTS user_skill_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Skill level atual
  skill_level TEXT NOT NULL DEFAULT 'beginner' CHECK (skill_level IN (
    'beginner', 'intermediate', 'advanced', 'expert'
  )),
  skill_score INTEGER NOT NULL DEFAULT 0,
  
  -- Métricas de uso
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_calculations INTEGER NOT NULL DEFAULT 0,
  successful_calculations INTEGER NOT NULL DEFAULT 0,
  total_errors INTEGER NOT NULL DEFAULT 0,
  
  -- Recursos avançados
  advanced_features_used INTEGER NOT NULL DEFAULT 0,
  shortcuts_used INTEGER NOT NULL DEFAULT 0,
  help_views INTEGER NOT NULL DEFAULT 0,
  
  -- Tempo
  avg_calculation_time_ms INTEGER,
  total_time_spent_ms BIGINT NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================
-- TABELA: user_tutorial_progress
-- Progresso do usuário em tutoriais
-- ===========================================================
CREATE TABLE IF NOT EXISTS user_tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'abandoned'
  )),
  
  -- Progresso
  current_step_index INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT[] DEFAULT '{}',
  skipped_steps TEXT[] DEFAULT '{}',
  
  -- Tempo
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_ms BIGINT NOT NULL DEFAULT 0,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índice único
  UNIQUE(user_id, tutorial_id)
);

-- ===========================================================
-- TABELA: user_achievements
-- Conquistas desbloqueadas pelo usuário
-- ===========================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  
  -- Dados da conquista
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Contexto
  tutorial_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índice único
  UNIQUE(user_id, achievement_id)
);

-- ===========================================================
-- TABELA: user_personalization
-- Perfil de personalização derivado dos padrões
-- ===========================================================
CREATE TABLE IF NOT EXISTS user_personalization (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências inferidas
  preferred_calculator TEXT,
  preferred_explanation_depth TEXT DEFAULT 'standard' CHECK (preferred_explanation_depth IN (
    'minimal', 'standard', 'detailed', 'expert'
  )),
  typical_usage_time TEXT CHECK (typical_usage_time IN (
    'morning', 'afternoon', 'evening', 'night'
  )),
  
  -- Comportamento
  accepts_proactive_suggestions BOOLEAN DEFAULT TRUE,
  optimal_suggestion_frequency TEXT DEFAULT 'medium' CHECK (optimal_suggestion_frequency IN (
    'low', 'medium', 'high'
  )),
  
  -- Engajamento
  engagement_score INTEGER DEFAULT 50,
  last_active_at TIMESTAMPTZ,
  consecutive_days INTEGER DEFAULT 0,
  
  -- Derivado de padrões
  inferred_preferences JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================
-- ÍNDICES
-- ===========================================================

-- user_behavior_patterns
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_user_id 
  ON user_behavior_patterns(user_id);

CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_type 
  ON user_behavior_patterns(pattern_type);

CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_confidence 
  ON user_behavior_patterns(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_last_detected 
  ON user_behavior_patterns(last_detected_at DESC);

-- user_tutorial_progress
CREATE INDEX IF NOT EXISTS idx_user_tutorial_progress_user_id 
  ON user_tutorial_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_tutorial_progress_status 
  ON user_tutorial_progress(status);

-- user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id 
  ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at 
  ON user_achievements(unlocked_at DESC);

-- ===========================================================
-- ROW LEVEL SECURITY
-- ===========================================================

ALTER TABLE user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

-- Políticas para user_behavior_patterns
CREATE POLICY "Users can view their own patterns"
  ON user_behavior_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage patterns"
  ON user_behavior_patterns FOR ALL
  WITH CHECK (true);

-- Políticas para user_skill_metrics
CREATE POLICY "Users can view their own metrics"
  ON user_skill_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage metrics"
  ON user_skill_metrics FOR ALL
  WITH CHECK (true);

-- Políticas para user_tutorial_progress
CREATE POLICY "Users can view their own tutorial progress"
  ON user_tutorial_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tutorial progress"
  ON user_tutorial_progress FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can grant achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

-- Políticas para user_personalization
CREATE POLICY "Users can view their own personalization"
  ON user_personalization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage personalization"
  ON user_personalization FOR ALL
  WITH CHECK (true);

-- ===========================================================
-- FUNÇÕES E TRIGGERS
-- ===========================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_skill_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tutorial_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_personalization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_skill_metrics_updated_at ON user_skill_metrics;
CREATE TRIGGER trigger_update_skill_metrics_updated_at
  BEFORE UPDATE ON user_skill_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_metrics_updated_at();

DROP TRIGGER IF EXISTS trigger_update_tutorial_progress_updated_at ON user_tutorial_progress;
CREATE TRIGGER trigger_update_tutorial_progress_updated_at
  BEFORE UPDATE ON user_tutorial_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_tutorial_progress_updated_at();

DROP TRIGGER IF EXISTS trigger_update_personalization_updated_at ON user_personalization;
CREATE TRIGGER trigger_update_personalization_updated_at
  BEFORE UPDATE ON user_personalization
  FOR EACH ROW
  EXECUTE FUNCTION update_personalization_updated_at();

-- ===========================================================
-- COMENTÁRIOS
-- ===========================================================

COMMENT ON TABLE user_behavior_patterns IS 'Padrões de comportamento detectados pelo sistema de aprendizado';
COMMENT ON TABLE user_skill_metrics IS 'Métricas para detecção automática de skill level';
COMMENT ON TABLE user_tutorial_progress IS 'Progresso do usuário em tutoriais interativos';
COMMENT ON TABLE user_achievements IS 'Conquistas desbloqueadas pelo usuário';
COMMENT ON TABLE user_personalization IS 'Perfil de personalização derivado dos padrões de uso';

COMMENT ON COLUMN user_behavior_patterns.pattern_type IS 'navigation=navegação, calculation=cálculos, preference=preferências, timing=horários, error_prone=erros frequentes';
COMMENT ON COLUMN user_behavior_patterns.confidence IS 'Confiança no padrão detectado (0-1)';
COMMENT ON COLUMN user_skill_metrics.skill_level IS 'Nível detectado automaticamente baseado em métricas';
COMMENT ON COLUMN user_personalization.inferred_preferences IS 'Preferências inferidas automaticamente dos padrões';
