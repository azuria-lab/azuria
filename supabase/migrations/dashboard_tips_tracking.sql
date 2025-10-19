-- =============================================
-- TABELA PARA TRACKING DE DICAS VISUALIZADAS
-- =============================================

-- Tabela para rastrear quais dicas cada usuário já visualizou
CREATE TABLE IF NOT EXISTS public.user_tip_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES public.dashboard_tips(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_action BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que cada usuário vê cada dica apenas uma vez (por session)
  UNIQUE(user_id, tip_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_tip_views_user_id ON public.user_tip_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_views_tip_id ON public.user_tip_views(tip_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_views_viewed_at ON public.user_tip_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_tip_views_clicked ON public.user_tip_views(clicked_action) WHERE clicked_action = TRUE;

-- =============================================
-- TABELA PARA PERFIL DO USUÁRIO
-- =============================================

-- Tabela para armazenar o perfil de experiência do usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_level TEXT NOT NULL DEFAULT 'new' CHECK (experience_level IN ('new', 'intermediate', 'advanced', 'expert')),
  total_calculations INT DEFAULT 0,
  total_savings_generated DECIMAL(10,2) DEFAULT 0,
  days_active INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  profile_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience ON public.user_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_activity ON public.user_profiles(last_activity_at DESC);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Habilitar RLS
ALTER TABLE public.user_tip_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies para user_tip_views
CREATE POLICY "Usuários podem ver suas próprias visualizações"
  ON public.user_tip_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias visualizações"
  ON public.user_tip_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias visualizações"
  ON public.user_tip_views FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies para user_profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNÇÕES PARA ANÁLISE DE PERFIL
-- =============================================

-- Função para calcular o nível de experiência do usuário
CREATE OR REPLACE FUNCTION public.calculate_user_experience_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_total_calculations INT;
  v_total_savings DECIMAL;
  v_days_active INT;
  v_experience_level TEXT;
BEGIN
  -- Buscar estatísticas do usuário
  SELECT 
    COALESCE(SUM(calculations_count), 0),
    COALESCE(SUM(total_savings), 0),
    COALESCE(COUNT(DISTINCT date), 0)
  INTO v_total_calculations, v_total_savings, v_days_active
  FROM public.user_daily_stats
  WHERE user_id = p_user_id;

  -- Determinar nível de experiência baseado em critérios
  IF v_total_calculations = 0 AND v_days_active <= 1 THEN
    v_experience_level := 'new';
  ELSIF v_total_calculations < 10 AND v_days_active < 7 THEN
    v_experience_level := 'new';
  ELSIF v_total_calculations < 50 AND v_days_active < 30 THEN
    v_experience_level := 'intermediate';
  ELSIF v_total_calculations < 200 AND v_days_active < 90 THEN
    v_experience_level := 'advanced';
  ELSE
    v_experience_level := 'expert';
  END IF;

  -- Inserir ou atualizar o perfil
  INSERT INTO public.user_profiles (
    user_id, 
    experience_level, 
    total_calculations, 
    total_savings_generated, 
    days_active,
    last_activity_at,
    profile_updated_at
  )
  VALUES (
    p_user_id, 
    v_experience_level, 
    v_total_calculations, 
    v_total_savings, 
    v_days_active,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    experience_level = v_experience_level,
    total_calculations = v_total_calculations,
    total_savings_generated = v_total_savings,
    days_active = v_days_active,
    last_activity_at = NOW(),
    profile_updated_at = NOW(),
    updated_at = NOW();

  RETURN v_experience_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Função para registrar visualização de dica
CREATE OR REPLACE FUNCTION public.track_tip_view(p_tip_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_tip_views (user_id, tip_id, viewed_at)
  VALUES (auth.uid(), p_tip_id, NOW())
  ON CONFLICT (user_id, tip_id) 
  DO UPDATE SET viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Função para registrar clique em ação da dica
CREATE OR REPLACE FUNCTION public.track_tip_action_click(p_tip_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_tip_views
  SET clicked_action = TRUE, clicked_at = NOW()
  WHERE user_id = auth.uid() AND tip_id = p_tip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Função para buscar próxima dica personalizada
CREATE OR REPLACE FUNCTION public.get_next_personalized_tip(p_user_id UUID)
RETURNS TABLE (
  tip_id UUID,
  title TEXT,
  message TEXT,
  category TEXT,
  priority INT,
  action_url TEXT,
  action_label TEXT
) AS $$
DECLARE
  v_experience_level TEXT;
BEGIN
  -- Calcular e obter nível de experiência
  v_experience_level := public.calculate_user_experience_level(p_user_id);

  -- Buscar dica não visualizada com maior prioridade para o nível do usuário
  RETURN QUERY
  SELECT 
    dt.id,
    dt.title,
    dt.message,
    dt.category,
    dt.priority,
    dt.action_url,
    dt.action_label
  FROM public.dashboard_tips dt
  LEFT JOIN public.user_tip_views utv 
    ON dt.id = utv.tip_id AND utv.user_id = p_user_id
  WHERE 
    dt.is_active = TRUE
    AND (dt.target_user_type = 'all' OR dt.target_user_type = v_experience_level)
    AND utv.id IS NULL  -- Não foi visualizada ainda
  ORDER BY dt.priority DESC, RANDOM()
  LIMIT 1;

  -- Se não houver dicas não visualizadas, retornar uma aleatória
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      dt.id,
      dt.title,
      dt.message,
      dt.category,
      dt.priority,
      dt.action_url,
      dt.action_label
    FROM public.dashboard_tips dt
    WHERE 
      dt.is_active = TRUE
      AND (dt.target_user_type = 'all' OR dt.target_user_type = v_experience_level)
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at em user_profiles
CREATE OR REPLACE FUNCTION public.update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profile_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profile_updated_at();

-- =============================================
-- DICAS ADICIONAIS POR NÍVEL
-- =============================================

-- Dicas para usuários novos
INSERT INTO public.dashboard_tips (title, message, category, priority, target_user_type, action_url, action_label)
VALUES
  (
    'Bem-vindo ao Azuria! 👋',
    'Comece criando seu primeiro cálculo de precificação. É rápido e fácil!',
    'onboarding',
    100,
    'new',
    '/calculadora-simples',
    'Criar Cálculo'
  ),
  (
    'Aprenda os Básicos',
    'Veja nosso guia para entender como calcular margem de lucro ideal para seu negócio.',
    'education',
    90,
    'new',
    '/user-guide',
    'Ver Guia'
  ),
  (
    'Explore as Ferramentas',
    'Azuria tem 5 calculadoras diferentes. Descubra qual se encaixa melhor no seu fluxo!',
    'productivity',
    85,
    'new',
    '/calculadora-simples',
    'Explorar'
  );

-- Dicas para usuários intermediários
INSERT INTO public.dashboard_tips (title, message, category, priority, target_user_type, action_url, action_label)
VALUES
  (
    'Upgrade para PRO 🚀',
    'Desbloqueie análise de concorrência e cálculos em lote. Experimente 7 dias grátis!',
    'upgrade',
    80,
    'intermediate',
    '/planos',
    'Ver Planos'
  ),
  (
    'Use Análise de Sensibilidade',
    'Veja como mudanças de custo impactam seu lucro com gráficos interativos.',
    'feature',
    75,
    'intermediate',
    '/analise-sensibilidade',
    'Experimentar'
  ),
  (
    'Integre com Marketplaces',
    'Conecte Mercado Livre, Shopee e Amazon para automatizar seus preços.',
    'integration',
    70,
    'intermediate',
    '/integracoes',
    'Conectar'
  );

-- Dicas para usuários avançados
INSERT INTO public.dashboard_tips (title, message, category, priority, target_user_type, action_url, action_label)
VALUES
  (
    'Automação de Preços 🤖',
    'Configure regras automáticas para ajustar preços baseado em estoque e concorrência.',
    'automation',
    65,
    'advanced',
    '/automacao',
    'Configurar'
  ),
  (
    'API para Desenvolvedores',
    'Integre o Azuria ao seu sistema usando nossa API REST completa.',
    'technical',
    60,
    'advanced',
    '/api',
    'Ver Docs'
  ),
  (
    'Dashboard Analítico',
    'Acompanhe KPIs de precificação com dashboards personalizáveis.',
    'analytics',
    55,
    'advanced',
    '/analytics-dashboard',
    'Abrir Dashboard'
  );

-- Dicas para experts
INSERT INTO public.dashboard_tips (title, message, category, priority, target_user_type, action_url, action_label)
VALUES
  (
    'Plano Enterprise',
    'Gerencie múltiplas lojas e usuários com permissões avançadas.',
    'enterprise',
    50,
    'expert',
    '/enterprise',
    'Saber Mais'
  ),
  (
    'Análise Preditiva com IA',
    'Use Machine Learning para prever tendências de preço no seu setor.',
    'ai',
    45,
    'expert',
    '/ai',
    'Ativar IA'
  );

-- =============================================
-- COMENTÁRIOS SOBRE O SISTEMA
-- =============================================

COMMENT ON TABLE public.user_tip_views IS 'Rastreia quais dicas cada usuário visualizou e se clicou na ação';
COMMENT ON TABLE public.user_profiles IS 'Perfil de experiência do usuário calculado automaticamente';
COMMENT ON FUNCTION public.calculate_user_experience_level IS 'Calcula nível (new/intermediate/advanced/expert) baseado em uso';
COMMENT ON FUNCTION public.get_next_personalized_tip IS 'Retorna próxima dica não visualizada personalizada para o nível do usuário';
COMMENT ON FUNCTION public.track_tip_view IS 'Registra que usuário visualizou uma dica';
COMMENT ON FUNCTION public.track_tip_action_click IS 'Registra que usuário clicou na ação de uma dica';

-- CONCLUÍDO! Sistema de dicas personalizadas pronto.
