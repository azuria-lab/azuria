-- Migration: Criar tabelas para Co-Piloto Operacional (Modo Deus)
-- Descrição: Armazena sugestões e feedback do Co-Piloto para usuários finais
-- Fase 0.4 do plano de implementação Modo Deus

-- ===========================================================
-- TABELA: user_suggestions
-- Armazena sugestões geradas pelo Co-Piloto para cada usuário
-- ===========================================================
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

-- ===========================================================
-- TABELA: suggestion_feedback
-- Armazena feedback do usuário sobre sugestões
-- ===========================================================
CREATE TABLE IF NOT EXISTS suggestion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES user_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de feedback
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'helpful', 'not_helpful', 'too_frequent', 'wrong_timing', 'confusing', 'other'
  )),
  comment TEXT,
  
  -- Contexto do feedback
  context JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================
-- TABELA: user_copilot_preferences
-- Preferências do usuário para o Co-Piloto
-- ===========================================================
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

-- ===========================================================
-- ÍNDICES
-- ===========================================================

-- user_suggestions
CREATE INDEX IF NOT EXISTS idx_user_suggestions_user_id 
  ON user_suggestions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_status 
  ON user_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_type 
  ON user_suggestions(type);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_category 
  ON user_suggestions(category);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_created_at 
  ON user_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_suggestions_user_status 
  ON user_suggestions(user_id, status);

-- suggestion_feedback
CREATE INDEX IF NOT EXISTS idx_suggestion_feedback_user_id 
  ON suggestion_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_suggestion_feedback_type 
  ON suggestion_feedback(feedback_type);

-- ===========================================================
-- ROW LEVEL SECURITY
-- ===========================================================

ALTER TABLE user_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_copilot_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para user_suggestions
CREATE POLICY "Users can view their own suggestions"
  ON user_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert suggestions"
  ON user_suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own suggestions"
  ON user_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para suggestion_feedback
CREATE POLICY "Users can view their own feedback"
  ON suggestion_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON suggestion_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_copilot_preferences
CREATE POLICY "Users can manage their own preferences"
  ON user_copilot_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================================
-- FUNÇÕES
-- ===========================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_copilot_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_copilot_preferences_updated_at ON user_copilot_preferences;
CREATE TRIGGER trigger_update_copilot_preferences_updated_at
  BEFORE UPDATE ON user_copilot_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_copilot_preferences_updated_at();

-- ===========================================================
-- COMENTÁRIOS
-- ===========================================================

COMMENT ON TABLE user_suggestions IS 'Sugestões do Co-Piloto para usuários finais';
COMMENT ON TABLE suggestion_feedback IS 'Feedback dos usuários sobre sugestões';
COMMENT ON TABLE user_copilot_preferences IS 'Preferências do Co-Piloto por usuário';

COMMENT ON COLUMN user_suggestions.type IS 'tip=dica, warning=alerta, insight=análise, action=ação sugerida, explanation=explicação';
COMMENT ON COLUMN user_suggestions.category IS 'Categoria da sugestão para filtragem';
COMMENT ON COLUMN user_suggestions.priority IS 'Prioridade para ordenação de exibição';
COMMENT ON COLUMN user_suggestions.actions IS 'Array de ações possíveis para o usuário';
COMMENT ON COLUMN user_suggestions.metadata IS 'Dados adicionais específicos do contexto';
