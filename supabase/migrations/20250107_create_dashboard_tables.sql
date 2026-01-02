-- Migration: Criar tabelas necessárias para o Dashboard
-- Data: 2025-01-07
-- Descrição: Cria tabelas user_daily_stats, user_activities, user_notifications e dashboard_tips

-- ============================================
-- 1. Tabela: user_daily_stats
-- Armazena estatísticas diárias agregadas por usuário
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calculations_count INTEGER NOT NULL DEFAULT 0,
  total_savings NUMERIC(10, 2) NOT NULL DEFAULT 0,
  products_analyzed INTEGER NOT NULL DEFAULT 0,
  time_saved_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_id ON public.user_daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_date ON public.user_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_date ON public.user_daily_stats(user_id, date);

-- Comentários
COMMENT ON TABLE public.user_daily_stats IS 'Estatísticas diárias agregadas por usuário para o dashboard';
COMMENT ON COLUMN public.user_daily_stats.calculations_count IS 'Número de cálculos realizados no dia';
COMMENT ON COLUMN public.user_daily_stats.total_savings IS 'Economia total gerada no dia (R$)';
COMMENT ON COLUMN public.user_daily_stats.products_analyzed IS 'Número de produtos analisados no dia';
COMMENT ON COLUMN public.user_daily_stats.time_saved_minutes IS 'Tempo economizado em minutos';

-- ============================================
-- 2. Tabela: user_activities
-- Registra atividades do usuário para o feed de atividades
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created ON public.user_activities(user_id, created_at DESC);

-- Comentários
COMMENT ON TABLE public.user_activities IS 'Atividades do usuário para exibição no feed do dashboard';
COMMENT ON COLUMN public.user_activities.activity_type IS 'Tipo de atividade: calculation, analysis, export, etc';
COMMENT ON COLUMN public.user_activities.metadata IS 'Dados adicionais da atividade em formato JSON';

-- ============================================
-- 3. Tabela: user_notifications
-- Notificações e alertas para o usuário
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'tip')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read ON public.user_notifications(user_id, is_read, created_at DESC);

-- Comentários
COMMENT ON TABLE public.user_notifications IS 'Notificações e alertas para os usuários';
COMMENT ON COLUMN public.user_notifications.type IS 'Tipo da notificação: info, success, warning, error, tip';
COMMENT ON COLUMN public.user_notifications.action_url IS 'URL opcional para ação relacionada à notificação';

-- ============================================
-- 4. Tabela: dashboard_tips
-- Dicas contextuais para exibição no dashboard
-- ============================================
CREATE TABLE IF NOT EXISTS public.dashboard_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT,
  action_url TEXT,
  action_label TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_audience TEXT CHECK (target_audience IN ('all', 'beginner', 'intermediate', 'advanced')) DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dashboard_tips_is_active ON public.dashboard_tips(is_active);
CREATE INDEX IF NOT EXISTS idx_dashboard_tips_priority ON public.dashboard_tips(priority DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_tips_active_priority ON public.dashboard_tips(is_active, priority DESC);

-- Comentários
COMMENT ON TABLE public.dashboard_tips IS 'Dicas contextuais para exibição no dashboard';
COMMENT ON COLUMN public.dashboard_tips.priority IS 'Prioridade da dica (maior = mais importante)';
COMMENT ON COLUMN public.dashboard_tips.target_audience IS 'Público-alvo da dica: all, beginner, intermediate, advanced';

-- ============================================
-- 5. Habilitar RLS (Row Level Security)
-- ============================================
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_tips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. Políticas RLS
-- ============================================

-- user_daily_stats: usuários só veem suas próprias estatísticas
CREATE POLICY "p_user_daily_stats_select" ON public.user_daily_stats
  FOR SELECT
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_daily_stats_insert" ON public.user_daily_stats
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_daily_stats_update" ON public.user_daily_stats
  FOR UPDATE
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_daily_stats_delete" ON public.user_daily_stats
  FOR DELETE
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

-- user_activities: usuários só veem suas próprias atividades
CREATE POLICY "p_user_activities_select" ON public.user_activities
  FOR SELECT
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_activities_insert" ON public.user_activities
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_activities_update" ON public.user_activities
  FOR UPDATE
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_activities_delete" ON public.user_activities
  FOR DELETE
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

-- user_notifications: usuários só veem suas próprias notificações
CREATE POLICY "p_user_notifications_select" ON public.user_notifications
  FOR SELECT
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_notifications_insert" ON public.user_notifications
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_notifications_update" ON public.user_notifications
  FOR UPDATE
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

CREATE POLICY "p_user_notifications_delete" ON public.user_notifications
  FOR DELETE
  USING (user_id = auth.uid() OR current_setting('request.jwt.claim.role', true) = 'service_role');

-- dashboard_tips: todos os usuários autenticados podem ver dicas ativas
CREATE POLICY "p_dashboard_tips_select" ON public.dashboard_tips
  FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- ============================================
-- 7. Adicionar colunas necessárias em user_profiles
-- ============================================
-- Adicionar colunas para métricas de experiência do usuário
-- Nota: user_profiles.id já referencia auth.users(id), então usamos id diretamente
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS total_calculations INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_savings_generated NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS days_active INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Comentários
COMMENT ON COLUMN public.user_profiles.experience_level IS 'Nível de experiência: beginner, intermediate, advanced';
COMMENT ON COLUMN public.user_profiles.total_calculations IS 'Total de cálculos realizados pelo usuário';
COMMENT ON COLUMN public.user_profiles.total_savings_generated IS 'Economia total gerada pelo usuário (R$)';
COMMENT ON COLUMN public.user_profiles.days_active IS 'Número de dias desde o primeiro uso';
COMMENT ON COLUMN public.user_profiles.last_activity_at IS 'Data da última atividade do usuário';

-- ============================================
-- 8. Funções auxiliares
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_daily_stats_updated_at
  BEFORE UPDATE ON public.user_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_tips_updated_at
  BEFORE UPDATE ON public.dashboard_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. Funções RPC necessárias para o hook useDashboardStats
-- ============================================

-- Função: increment_daily_stat
-- Incrementa uma estatística diária específica
CREATE OR REPLACE FUNCTION public.increment_daily_stat(
  p_user_id UUID,
  p_stat_type TEXT,
  p_value NUMERIC DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.user_daily_stats (user_id, date, calculations_count, total_savings, products_analyzed, time_saved_minutes)
  VALUES (
    p_user_id,
    v_today,
    CASE WHEN p_stat_type = 'calculations' THEN p_value::INTEGER ELSE 0 END,
    CASE WHEN p_stat_type = 'savings' THEN p_value ELSE 0 END,
    CASE WHEN p_stat_type = 'products' THEN p_value::INTEGER ELSE 0 END,
    CASE WHEN p_stat_type = 'time' THEN p_value::INTEGER ELSE 0 END
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    calculations_count = CASE 
      WHEN p_stat_type = 'calculations' 
      THEN user_daily_stats.calculations_count + p_value::INTEGER 
      ELSE user_daily_stats.calculations_count 
    END,
    total_savings = CASE 
      WHEN p_stat_type = 'savings' 
      THEN user_daily_stats.total_savings + p_value 
      ELSE user_daily_stats.total_savings 
    END,
    products_analyzed = CASE 
      WHEN p_stat_type = 'products' 
      THEN user_daily_stats.products_analyzed + p_value::INTEGER 
      ELSE user_daily_stats.products_analyzed 
    END,
    time_saved_minutes = CASE 
      WHEN p_stat_type = 'time' 
      THEN user_daily_stats.time_saved_minutes + p_value::INTEGER 
      ELSE user_daily_stats.time_saved_minutes 
    END,
    updated_at = now();
END;
$$;

-- Função: mark_notification_as_read
-- Marca uma notificação como lida
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(
  p_notification_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_notifications
  SET is_read = true, read_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Função: get_next_personalized_tip
-- Nota: Esta função já existe no banco de dados, então não a recriamos aqui
-- A função existente é mais completa e já funciona corretamente

-- Função: track_tip_view
-- Registra visualização de uma dica (pode ser expandida para analytics)
CREATE OR REPLACE FUNCTION public.track_tip_view(
  p_tip_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Por enquanto apenas log, pode ser expandido para tabela de analytics
  -- INSERT INTO tip_views (tip_id, user_id, viewed_at) VALUES (p_tip_id, auth.uid(), now());
  NULL;
END;
$$;

-- Função: track_tip_action_click
-- Registra clique na ação de uma dica
CREATE OR REPLACE FUNCTION public.track_tip_action_click(
  p_tip_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Por enquanto apenas log, pode ser expandido para tabela de analytics
  -- INSERT INTO tip_action_clicks (tip_id, user_id, clicked_at) VALUES (p_tip_id, auth.uid(), now());
  NULL;
END;
$$;

-- Função: calculate_user_experience_level
-- Calcula o nível de experiência do usuário baseado em métricas
DROP FUNCTION IF EXISTS public.calculate_user_experience_level(UUID);
CREATE OR REPLACE FUNCTION public.calculate_user_experience_level(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_calculations INTEGER;
  v_total_savings NUMERIC;
  v_days_active INTEGER;
  v_experience_level TEXT;
BEGIN
  -- Calcular métricas
  SELECT 
    COALESCE(SUM(calculations_count), 0),
    COALESCE(SUM(total_savings), 0),
    COUNT(DISTINCT date)
  INTO v_total_calculations, v_total_savings, v_days_active
  FROM public.user_daily_stats
  WHERE user_id = p_user_id;

  -- Determinar nível de experiência
  IF v_total_calculations >= 100 AND v_days_active >= 30 THEN
    v_experience_level := 'advanced';
  ELSIF v_total_calculations >= 30 AND v_days_active >= 10 THEN
    v_experience_level := 'intermediate';
  ELSE
    v_experience_level := 'beginner';
  END IF;

  -- Atualizar ou inserir perfil
  INSERT INTO public.user_profiles (
    id,
    experience_level,
    total_calculations,
    total_savings_generated,
    days_active,
    last_activity_at
  )
  VALUES (
    p_user_id,
    v_experience_level,
    v_total_calculations,
    v_total_savings,
    v_days_active,
    now()
  )
  ON CONFLICT (id)
  DO UPDATE SET
    experience_level = v_experience_level,
    total_calculations = v_total_calculations,
    total_savings_generated = v_total_savings,
    days_active = v_days_active,
    last_activity_at = now(),
    updated_at = now();
END;
$$;

