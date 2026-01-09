-- ═══════════════════════════════════════════════════════════════════════════════
-- UNIFIED MEMORY TABLES - Sistema de Memória do Modo Deus
-- ═══════════════════════════════════════════════════════════════════════════════
-- Cria as tabelas necessárias para o sistema de memória unificado:
-- - ai_memory_ltm: Long-Term Memory (preferências, padrões de comportamento)
-- - ai_memory_interactions: Histórico de interações
-- - ai_memory_patterns: Padrões detectados
-- - ai_memory_insights: Insights aprendidos
-- ═══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABELA: ai_memory_ltm (Long-Term Memory)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_memory_ltm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências do usuário
  preferences JSONB DEFAULT '{}' NOT NULL,
  
  -- Padrões de comportamento detectados
  behavior_patterns JSONB DEFAULT '[]' NOT NULL,
  
  -- Histórico resumido (últimas interações importantes)
  history_summary JSONB DEFAULT '[]' NOT NULL,
  
  -- Contexto de uso (páginas mais visitadas, features mais usadas)
  usage_context JSONB DEFAULT '{}' NOT NULL,
  
  -- Insights que a IA aprendeu sobre o usuário
  learned_insights JSONB DEFAULT '[]' NOT NULL,
  
  -- Última sincronização
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Garantir único por usuário
  CONSTRAINT ai_memory_ltm_user_unique UNIQUE (user_id)
);

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_ai_memory_ltm_user_id ON public.ai_memory_ltm(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_ltm_updated_at ON public.ai_memory_ltm(updated_at);

-- RLS
ALTER TABLE public.ai_memory_ltm ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário pode ver apenas sua própria memória
CREATE POLICY "Users can view own memory" ON public.ai_memory_ltm
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuário pode inserir sua própria memória
CREATE POLICY "Users can insert own memory" ON public.ai_memory_ltm
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Usuário pode atualizar sua própria memória
CREATE POLICY "Users can update own memory" ON public.ai_memory_ltm
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Usuário pode deletar sua própria memória
CREATE POLICY "Users can delete own memory" ON public.ai_memory_ltm
  FOR DELETE USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. TABELA: ai_memory_interactions (Histórico de Interações)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_memory_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de interação (message, calculation, navigation, action)
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('message', 'calculation', 'navigation', 'action', 'suggestion', 'other')),
  
  -- Input do usuário
  user_input TEXT,
  
  -- Output da IA
  ai_output TEXT,
  
  -- Contexto (página, sessão, etc)
  context JSONB DEFAULT '{}',
  
  -- Metadados (tokens, latência, modelo usado)
  metadata JSONB DEFAULT '{}',
  
  -- Se a interação foi útil (feedback do usuário)
  was_helpful BOOLEAN,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_memory_interactions_user_id ON public.ai_memory_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_interactions_type ON public.ai_memory_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_memory_interactions_created_at ON public.ai_memory_interactions(created_at DESC);

-- RLS
ALTER TABLE public.ai_memory_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário pode ver suas próprias interações
CREATE POLICY "Users can view own interactions" ON public.ai_memory_interactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuário pode inserir suas interações
CREATE POLICY "Users can insert own interactions" ON public.ai_memory_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. TABELA: ai_memory_patterns (Padrões Detectados)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_memory_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ID único do padrão
  pattern_id TEXT NOT NULL,
  
  -- Nome legível do padrão
  pattern_name TEXT NOT NULL,
  
  -- Categoria do padrão (behavior, usage, preference, risk, opportunity)
  category TEXT NOT NULL CHECK (category IN ('behavior', 'usage', 'preference', 'risk', 'opportunity', 'other')),
  
  -- Confiança do padrão (0-1)
  confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Dados do padrão
  data JSONB DEFAULT '{}',
  
  -- Quantas vezes foi detectado
  occurrence_count INTEGER DEFAULT 1,
  
  -- Última vez que foi detectado
  last_detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Único por usuário + pattern_id
  CONSTRAINT ai_memory_patterns_unique UNIQUE (user_id, pattern_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_memory_patterns_user_id ON public.ai_memory_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_patterns_category ON public.ai_memory_patterns(category);
CREATE INDEX IF NOT EXISTS idx_ai_memory_patterns_confidence ON public.ai_memory_patterns(confidence DESC);

-- RLS
ALTER TABLE public.ai_memory_patterns ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário pode ver seus padrões
CREATE POLICY "Users can view own patterns" ON public.ai_memory_patterns
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuário pode inserir padrões
CREATE POLICY "Users can insert own patterns" ON public.ai_memory_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Usuário pode atualizar padrões
CREATE POLICY "Users can update own patterns" ON public.ai_memory_patterns
  FOR UPDATE USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. TABELA: ai_memory_insights (Insights Aprendidos)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_memory_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de insight (user_preference, optimization, risk, opportunity)
  insight_type TEXT NOT NULL CHECK (insight_type IN ('user_preference', 'optimization', 'risk', 'opportunity', 'behavior', 'other')),
  
  -- Título do insight
  title TEXT NOT NULL,
  
  -- Descrição detalhada
  description TEXT,
  
  -- Dados do insight
  data JSONB DEFAULT '{}',
  
  -- Confiança (0-1)
  confidence DECIMAL(3, 2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Se foi aplicado/usado
  was_applied BOOLEAN DEFAULT FALSE,
  
  -- Feedback do usuário
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', 'neutral')),
  
  -- Validade (expiração)
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_memory_insights_user_id ON public.ai_memory_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_insights_type ON public.ai_memory_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_memory_insights_confidence ON public.ai_memory_insights(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_ai_memory_insights_created_at ON public.ai_memory_insights(created_at DESC);

-- RLS
ALTER TABLE public.ai_memory_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário pode ver seus insights
CREATE POLICY "Users can view own insights" ON public.ai_memory_insights
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuário pode inserir insights
CREATE POLICY "Users can insert own insights" ON public.ai_memory_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Usuário pode atualizar feedback
CREATE POLICY "Users can update own insights" ON public.ai_memory_insights
  FOR UPDATE USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. FUNÇÕES AUXILIARES
-- ══════════════════════════════════════════════════════════════════════════════

-- Função para upsert de memória LTM
CREATE OR REPLACE FUNCTION public.upsert_ai_memory_ltm(
  p_user_id UUID,
  p_preferences JSONB DEFAULT NULL,
  p_behavior_patterns JSONB DEFAULT NULL,
  p_history_summary JSONB DEFAULT NULL,
  p_usage_context JSONB DEFAULT NULL,
  p_learned_insights JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.ai_memory_ltm (
    user_id, preferences, behavior_patterns, history_summary, usage_context, learned_insights, updated_at, last_sync_at
  )
  VALUES (
    p_user_id,
    COALESCE(p_preferences, '{}'),
    COALESCE(p_behavior_patterns, '[]'),
    COALESCE(p_history_summary, '[]'),
    COALESCE(p_usage_context, '{}'),
    COALESCE(p_learned_insights, '[]'),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    preferences = COALESCE(p_preferences, ai_memory_ltm.preferences),
    behavior_patterns = COALESCE(p_behavior_patterns, ai_memory_ltm.behavior_patterns),
    history_summary = COALESCE(p_history_summary, ai_memory_ltm.history_summary),
    usage_context = COALESCE(p_usage_context, ai_memory_ltm.usage_context),
    learned_insights = COALESCE(p_learned_insights, ai_memory_ltm.learned_insights),
    updated_at = NOW(),
    last_sync_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Função para buscar memória do usuário
CREATE OR REPLACE FUNCTION public.get_ai_memory_for_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ltm JSONB;
  v_recent_interactions JSONB;
  v_active_patterns JSONB;
BEGIN
  -- Buscar LTM
  SELECT to_jsonb(ltm.*) INTO v_ltm
  FROM public.ai_memory_ltm ltm
  WHERE ltm.user_id = p_user_id;
  
  -- Buscar interações recentes (últimas 20)
  SELECT COALESCE(jsonb_agg(to_jsonb(i.*)), '[]'::jsonb) INTO v_recent_interactions
  FROM (
    SELECT id, interaction_type, user_input, ai_output, context, created_at
    FROM public.ai_memory_interactions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 20
  ) i;
  
  -- Buscar padrões ativos (confiança > 0.5)
  SELECT COALESCE(jsonb_agg(to_jsonb(p.*)), '[]'::jsonb) INTO v_active_patterns
  FROM public.ai_memory_patterns p
  WHERE p.user_id = p_user_id
    AND p.confidence > 0.5
  ORDER BY p.confidence DESC;
  
  RETURN jsonb_build_object(
    'ltm', COALESCE(v_ltm, '{}'),
    'recentInteractions', v_recent_interactions,
    'activePatterns', v_active_patterns
  );
END;
$$;

-- Função para limpar interações antigas (manter últimas 100)
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_interactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ai_memory_interactions
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM public.ai_memory_interactions
    ) ranked
    WHERE rn <= 100
  );
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. TRIGGERS PARA updated_at
-- ══════════════════════════════════════════════════════════════════════════════

-- Trigger para ai_memory_ltm
CREATE OR REPLACE FUNCTION public.update_ai_memory_ltm_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_ai_memory_ltm_updated_at ON public.ai_memory_ltm;
CREATE TRIGGER trigger_update_ai_memory_ltm_updated_at
  BEFORE UPDATE ON public.ai_memory_ltm
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_memory_ltm_updated_at();

-- Trigger para ai_memory_patterns
CREATE OR REPLACE FUNCTION public.update_ai_memory_patterns_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_ai_memory_patterns_updated_at ON public.ai_memory_patterns;
CREATE TRIGGER trigger_update_ai_memory_patterns_updated_at
  BEFORE UPDATE ON public.ai_memory_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_memory_patterns_updated_at();


-- ══════════════════════════════════════════════════════════════════════════════
-- 7. COMENTÁRIOS DAS TABELAS
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.ai_memory_ltm IS 'Long-Term Memory do sistema de IA - preferências e padrões persistentes do usuário';
COMMENT ON TABLE public.ai_memory_interactions IS 'Histórico de interações do usuário com a IA';
COMMENT ON TABLE public.ai_memory_patterns IS 'Padrões de comportamento detectados pelo sistema';
COMMENT ON TABLE public.ai_memory_insights IS 'Insights que o sistema aprendeu sobre o usuário';

COMMENT ON FUNCTION public.upsert_ai_memory_ltm IS 'Insere ou atualiza a memória LTM do usuário';
COMMENT ON FUNCTION public.get_ai_memory_for_user IS 'Retorna memória completa do usuário (LTM + interações recentes + padrões)';
COMMENT ON FUNCTION public.cleanup_old_ai_interactions IS 'Remove interações antigas mantendo as 100 mais recentes por usuário';
