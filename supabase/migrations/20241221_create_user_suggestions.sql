-- ============================================================================
-- Migração: Tabelas de Sugestões da IA (Co-Piloto)
-- Data: 2024-12-21
-- Descrição: Cria tabelas para persistir sugestões do Co-Piloto e feedback
-- ============================================================================

-- Dropar tabelas se existirem (para evitar conflitos)
DROP TABLE IF EXISTS public.user_suggestion_feedback CASCADE;
DROP TABLE IF EXISTS public.user_suggestions CASCADE;

-- Tabela principal de sugestões
CREATE TABLE public.user_suggestions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL DEFAULT 'anonymous',
  
  -- Dados da sugestão
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  context JSONB,
  
  -- Status e confiança
  status TEXT NOT NULL DEFAULT 'pending',
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.80,
  
  -- Timestamps de ação
  shown_at TIMESTAMPTZ,
  action_at TIMESTAMPTZ,
  action_type TEXT,
  
  -- Timestamps padrão
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Tabela de feedback das sugestões
CREATE TABLE public.user_suggestion_feedback (
  id TEXT PRIMARY KEY,
  suggestion_id TEXT NOT NULL REFERENCES public.user_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Dados do feedback
  type TEXT NOT NULL,
  comment TEXT,
  context JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Índices para performance
-- ============================================================================

CREATE INDEX idx_user_suggestions_user_id ON public.user_suggestions(user_id);
CREATE INDEX idx_user_suggestions_session_id ON public.user_suggestions(session_id);
CREATE INDEX idx_user_suggestions_status ON public.user_suggestions(status);
CREATE INDEX idx_user_suggestions_created_at ON public.user_suggestions(created_at DESC);
CREATE INDEX idx_user_suggestion_feedback_suggestion_id ON public.user_suggestion_feedback(suggestion_id);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suggestion_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas para user_suggestions
CREATE POLICY "Users can view own suggestions" ON public.user_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions" ON public.user_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own suggestions" ON public.user_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access suggestions" ON public.user_suggestions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para user_suggestion_feedback
CREATE POLICY "Users can view own feedback" ON public.user_suggestion_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback" ON public.user_suggestion_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role full access feedback" ON public.user_suggestion_feedback
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- Comentários
-- ============================================================================

COMMENT ON TABLE public.user_suggestions IS 'Sugestões do Co-Piloto de IA para usuários';
COMMENT ON TABLE public.user_suggestion_feedback IS 'Feedback dos usuários sobre sugestões recebidas';
