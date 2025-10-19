-- =============================================
-- DASHBOARD STATISTICS SCHEMA
-- Criado em: 2025-10-18
-- Descrição: Tabelas para estatísticas do dashboard
-- =============================================

-- Tabela de estatísticas diárias do usuário
CREATE TABLE IF NOT EXISTS public.user_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calculations_count INTEGER DEFAULT 0,
  total_savings DECIMAL(10, 2) DEFAULT 0.00,
  products_analyzed INTEGER DEFAULT 0,
  time_saved_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, date)
);

-- Tabela de atividades recentes
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'calculation', 'template_created', 'export', etc
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB, -- Dados adicionais flexíveis
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error', 'tip'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50), -- Nome do ícone lucide-react
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500), -- URL opcional para ação
  action_label VARCHAR(100), -- Label do botão de ação
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Tabela de dicas personalizadas
CREATE TABLE IF NOT EXISTS public.dashboard_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50), -- 'productivity', 'feature', 'best-practice', etc
  priority INTEGER DEFAULT 0, -- Maior = mais importante
  target_user_type VARCHAR(50), -- 'new', 'intermediate', 'advanced', 'all'
  action_url VARCHAR(500),
  action_label VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de configuração de widgets do dashboard
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type VARCHAR(50) NOT NULL, -- 'stats', 'chart', 'activity', 'tips', etc
  position JSONB NOT NULL, -- {x: 0, y: 0, w: 4, h: 2}
  config JSONB, -- Configurações específicas do widget
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES para performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_date 
  ON public.user_daily_stats(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_created 
  ON public.user_activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread 
  ON public.user_notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_tips_active_priority 
  ON public.dashboard_tips(is_active, priority DESC) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user 
  ON public.dashboard_widgets(user_id) WHERE is_visible = TRUE;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Políticas para user_daily_stats
CREATE POLICY "Users can view their own daily stats"
  ON public.user_daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
  ON public.user_daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
  ON public.user_daily_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para user_activities
CREATE POLICY "Users can view their own activities"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para dashboard_tips (público para leitura)
CREATE POLICY "Anyone can view active tips"
  ON public.dashboard_tips FOR SELECT
  USING (is_active = TRUE);

-- Políticas para dashboard_widgets
CREATE POLICY "Users can manage their own widgets"
  ON public.dashboard_widgets FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_user_daily_stats_updated_at ON public.user_daily_stats;
CREATE TRIGGER update_user_daily_stats_updated_at
  BEFORE UPDATE ON public.user_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON public.dashboard_widgets;
CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para incrementar estatísticas diárias
CREATE OR REPLACE FUNCTION public.increment_daily_stat(
  p_user_id UUID,
  p_stat_type VARCHAR,
  p_value DECIMAL DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_daily_stats (
    user_id, 
    date, 
    calculations_count,
    total_savings,
    products_analyzed,
    time_saved_minutes
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    CASE WHEN p_stat_type = 'calculations' THEN p_value ELSE 0 END,
    CASE WHEN p_stat_type = 'savings' THEN p_value ELSE 0 END,
    CASE WHEN p_stat_type = 'products' THEN p_value ELSE 0 END,
    CASE WHEN p_stat_type = 'time' THEN p_value ELSE 0 END
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    calculations_count = CASE 
      WHEN p_stat_type = 'calculations' 
      THEN public.user_daily_stats.calculations_count + p_value 
      ELSE public.user_daily_stats.calculations_count 
    END,
    total_savings = CASE 
      WHEN p_stat_type = 'savings' 
      THEN public.user_daily_stats.total_savings + p_value 
      ELSE public.user_daily_stats.total_savings 
    END,
    products_analyzed = CASE 
      WHEN p_stat_type = 'products' 
      THEN public.user_daily_stats.products_analyzed + p_value 
      ELSE public.user_daily_stats.products_analyzed 
    END,
    time_saved_minutes = CASE 
      WHEN p_stat_type = 'time' 
      THEN public.user_daily_stats.time_saved_minutes + p_value 
      ELSE public.user_daily_stats.time_saved_minutes 
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- =============================================
-- DADOS INICIAIS (SEED)
-- =============================================

-- Inserir dicas padrão
INSERT INTO public.dashboard_tips (title, message, category, priority, target_user_type, action_url, action_label)
VALUES
  (
    'Use Templates para Ganhar Tempo',
    'Crie templates dos seus produtos mais vendidos e economize até 80% do tempo em cálculos repetitivos.',
    'productivity',
    10,
    'all',
    '/templates',
    'Ver Templates'
  ),
  (
    'Analise sua Concorrência',
    'Use nossa ferramenta de análise de concorrência para descobrir oportunidades de precificação.',
    'feature',
    8,
    'intermediate',
    '/analise-concorrencia',
    'Analisar Agora'
  ),
  (
    'Exporte seus Relatórios',
    'Gere relatórios em PDF ou Excel para apresentar aos seus clientes ou equipe.',
    'feature',
    7,
    'all',
    '/relatorios',
    'Criar Relatório'
  ),
  (
    'Configure Alertas de Preço',
    'Receba notificações quando os preços dos concorrentes mudarem.',
    'feature',
    6,
    'advanced',
    '/configuracoes',
    'Configurar'
  ),
  (
    'Integre com Marketplaces',
    'Conecte sua conta com Mercado Livre, Shopee e outros marketplaces.',
    'feature',
    9,
    'all',
    '/integracoes',
    'Ver Integrações'
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================

COMMENT ON TABLE public.user_daily_stats IS 'Estatísticas diárias agregadas por usuário';
COMMENT ON TABLE public.user_activities IS 'Registro de atividades do usuário para timeline';
COMMENT ON TABLE public.user_notifications IS 'Notificações em tempo real para usuários';
COMMENT ON TABLE public.dashboard_tips IS 'Dicas e sugestões para exibir no dashboard';
COMMENT ON TABLE public.dashboard_widgets IS 'Configuração de layout personalizado do dashboard';

COMMENT ON FUNCTION public.increment_daily_stat IS 'Incrementa estatística diária do usuário de forma atômica';
COMMENT ON FUNCTION public.mark_notification_as_read IS 'Marca notificação como lida para o usuário autenticado';
