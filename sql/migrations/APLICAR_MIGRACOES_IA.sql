-- ===================================================================
-- SCRIPT CONSOLIDADO: Aplicar Tabelas de IA no Supabase
-- ===================================================================
-- Este script cria todas as tabelas necessárias para os engines de IA
-- do Azuria (Co-Piloto, Personalização, Padrões e Feedback)
--
-- COMO USAR:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Vá em "SQL Editor" no menu lateral
-- 3. Clique em "New Query"
-- 4. Cole TODO este script
-- 5. Clique em "Run" (ou pressione Ctrl+Enter)
--
-- NOTA: Se as tabelas já existirem, serão ignoradas (CREATE IF NOT EXISTS)
-- ===================================================================

-- ===================================================================
-- PARTE 1: Tabelas de Sugestões do Co-Piloto
-- Fonte: 20250614_create_user_suggestions.sql
-- ===================================================================

-- Tabela: user_suggestions
CREATE TABLE IF NOT EXISTS user_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificação da sugestão
  suggestion_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tip', 'warning', 'insight', 'action', 'explanation')),
  category TEXT NOT NULL CHECK (category IN (
    'general', 'pricing', 'bidding', 'inventory', 'communication', 
    'performance', 'compliance', 'opportunity'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  actions JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'shown', 'accepted', 'dismissed', 'expired', 'completed'
  )),
  
  -- Contexto
  context JSONB DEFAULT '{}'::JSONB,
  screen TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shown_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Índice único para evitar duplicatas
  UNIQUE(user_id, suggestion_id)
);

-- Tabela: suggestion_feedback
CREATE TABLE IF NOT EXISTS suggestion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES user_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de feedback
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'helpful', 'not_helpful', 'too_frequent', 'wrong_timing', 'confusing', 'other'
  )),
  comment TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Contexto do feedback
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: user_copilot_preferences
CREATE TABLE IF NOT EXISTS user_copilot_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências gerais
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  frequency TEXT NOT NULL DEFAULT 'balanced' CHECK (frequency IN ('minimal', 'balanced', 'proactive')),
  
  -- Categorias silenciadas
  silenced_categories TEXT[] DEFAULT '{}',
  silenced_types TEXT[] DEFAULT '{}',
  
  -- Throttle personalizado
  max_per_hour INTEGER DEFAULT 10,
  silence_during_typing BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- PARTE 2: Tabelas de Aprendizado e Personalização
-- Fonte: 20250615_create_learning_tables.sql
-- ===================================================================

-- Tabela: user_behavior_patterns
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

-- Tabela: user_skill_metrics
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

-- Tabela: user_tutorial_progress
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

-- Tabela: user_achievements
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

-- Tabela: user_personalization
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

-- ===================================================================
-- PARTE 3: Índices para Performance
-- ===================================================================

-- user_suggestions
CREATE INDEX IF NOT EXISTS idx_user_suggestions_user_id 
  ON user_suggestions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_status 
  ON user_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_priority 
  ON user_suggestions(priority);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_created_at 
  ON user_suggestions(created_at DESC);

-- suggestion_feedback
CREATE INDEX IF NOT EXISTS idx_suggestion_feedback_suggestion_id 
  ON suggestion_feedback(suggestion_id);

CREATE INDEX IF NOT EXISTS idx_suggestion_feedback_user_id 
  ON suggestion_feedback(user_id);

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

-- ===================================================================
-- PARTE 4: Row Level Security (RLS)
-- ===================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_copilot_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

-- Políticas para user_suggestions
DROP POLICY IF EXISTS "Users can view their own suggestions" ON user_suggestions;
CREATE POLICY "Users can view their own suggestions"
  ON user_suggestions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own suggestions" ON user_suggestions;
CREATE POLICY "Users can update their own suggestions"
  ON user_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage suggestions" ON user_suggestions;
CREATE POLICY "System can manage suggestions"
  ON user_suggestions FOR ALL
  WITH CHECK (true);

-- Políticas para suggestion_feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON suggestion_feedback;
CREATE POLICY "Users can view their own feedback"
  ON suggestion_feedback FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own feedback" ON suggestion_feedback;
CREATE POLICY "Users can insert their own feedback"
  ON suggestion_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_copilot_preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_copilot_preferences;
CREATE POLICY "Users can manage their own preferences"
  ON user_copilot_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para user_behavior_patterns
DROP POLICY IF EXISTS "Users can view their own patterns" ON user_behavior_patterns;
CREATE POLICY "Users can view their own patterns"
  ON user_behavior_patterns FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage patterns" ON user_behavior_patterns;
CREATE POLICY "System can manage patterns"
  ON user_behavior_patterns FOR ALL
  WITH CHECK (true);

-- Políticas para user_skill_metrics
DROP POLICY IF EXISTS "Users can view their own metrics" ON user_skill_metrics;
CREATE POLICY "Users can view their own metrics"
  ON user_skill_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage metrics" ON user_skill_metrics;
CREATE POLICY "System can manage metrics"
  ON user_skill_metrics FOR ALL
  WITH CHECK (true);

-- Políticas para user_tutorial_progress
DROP POLICY IF EXISTS "Users can view their own tutorial progress" ON user_tutorial_progress;
CREATE POLICY "Users can view their own tutorial progress"
  ON user_tutorial_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own tutorial progress" ON user_tutorial_progress;
CREATE POLICY "Users can manage their own tutorial progress"
  ON user_tutorial_progress FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para user_achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can grant achievements" ON user_achievements;
CREATE POLICY "System can grant achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

-- Políticas para user_personalization
DROP POLICY IF EXISTS "Users can view their own personalization" ON user_personalization;
CREATE POLICY "Users can view their own personalization"
  ON user_personalization FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage personalization" ON user_personalization;
CREATE POLICY "System can manage personalization"
  ON user_personalization FOR ALL
  WITH CHECK (true);

-- ===================================================================
-- PARTE 5: Funções e Triggers
-- ===================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para user_skill_metrics
DROP TRIGGER IF EXISTS update_skill_metrics_updated_at ON user_skill_metrics;
CREATE TRIGGER update_skill_metrics_updated_at
  BEFORE UPDATE ON user_skill_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para user_tutorial_progress
DROP TRIGGER IF EXISTS update_tutorial_progress_updated_at ON user_tutorial_progress;
CREATE TRIGGER update_tutorial_progress_updated_at
  BEFORE UPDATE ON user_tutorial_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para user_personalization
DROP TRIGGER IF EXISTS update_personalization_updated_at ON user_personalization;
CREATE TRIGGER update_personalization_updated_at
  BEFORE UPDATE ON user_personalization
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para user_copilot_preferences
DROP TRIGGER IF EXISTS update_copilot_preferences_updated_at ON user_copilot_preferences;
CREATE TRIGGER update_copilot_preferences_updated_at
  BEFORE UPDATE ON user_copilot_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- CONCLUÍDO! ✅
-- ===================================================================
-- Todas as tabelas foram criadas com sucesso!
-- 
-- Tabelas criadas:
-- ✓ user_suggestions
-- ✓ suggestion_feedback
-- ✓ user_copilot_preferences
-- ✓ user_behavior_patterns
-- ✓ user_skill_metrics
-- ✓ user_tutorial_progress
-- ✓ user_achievements
-- ✓ user_personalization
--
-- Próximo passo: Recarregar a aplicação e testar!
-- ===================================================================
