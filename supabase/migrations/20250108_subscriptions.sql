-- =====================================================
-- MIGRATION: Sistema de Planos e Assinaturas (CONSOLIDADA)
-- Criado em: 2025-01-08
-- Atualizado em: 2025-01-11
-- Descrição: Tabelas para gerenciamento de assinaturas,
--           uso, equipes e histórico de mudanças de plano
-- NOTA: Esta migração cria as tabelas base. Use 20250111_consolidate_subscriptions.sql
--       para adicionar suporte Stripe e consolidar estrutura.
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: subscriptions
-- Armazena as assinaturas dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações do plano
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'essencial', 'pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired')),
    billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'annual')),
    
    -- Período
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    
    -- Trial
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    -- Integração Mercado Pago
    mercadopago_subscription_id TEXT,
    mercadopago_preapproval_id TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Índices e constraints
    CONSTRAINT unique_active_subscription_per_user UNIQUE (user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mercadopago_id ON public.subscriptions(mercadopago_subscription_id);

-- Comentários
COMMENT ON TABLE public.subscriptions IS 'Assinaturas dos usuários';
COMMENT ON COLUMN public.subscriptions.plan_id IS 'ID do plano: free, essencial, pro, enterprise';
COMMENT ON COLUMN public.subscriptions.status IS 'Status da assinatura';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Se TRUE, cancela ao final do período';

-- =====================================================
-- TABELA: usage_tracking
-- Rastreia o uso de recursos pelos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Contadores
    calculations_today INTEGER NOT NULL DEFAULT 0,
    calculations_this_month INTEGER NOT NULL DEFAULT 0,
    ai_queries_this_month INTEGER NOT NULL DEFAULT 0,
    api_requests_this_month INTEGER NOT NULL DEFAULT 0,
    
    -- Últimas atividades
    last_calculation_at TIMESTAMPTZ,
    last_ai_query_at TIMESTAMPTZ,
    last_api_request_at TIMESTAMPTZ,
    
    -- Período de rastreamento
    period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint: um registro de tracking por usuário por período
    CONSTRAINT unique_usage_tracking_per_user UNIQUE (user_id, period_start)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_subscription_id ON public.usage_tracking(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);

-- Comentários
COMMENT ON TABLE public.usage_tracking IS 'Rastreamento de uso de recursos dos usuários';
COMMENT ON COLUMN public.usage_tracking.calculations_today IS 'Número de cálculos realizados hoje';
COMMENT ON COLUMN public.usage_tracking.calculations_this_month IS 'Número de cálculos no mês atual';

-- =====================================================
-- TABELA: teams
-- Equipes para plano Enterprise
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Configurações da equipe
    require_approval BOOLEAN NOT NULL DEFAULT FALSE,
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    audit_log_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_team_name_per_owner UNIQUE (owner_id, name)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_subscription_id ON public.teams(subscription_id);

-- Comentários
COMMENT ON TABLE public.teams IS 'Equipes para colaboração (Enterprise)';
COMMENT ON COLUMN public.teams.require_approval IS 'Se TRUE, cálculos precisam de aprovação';

-- =====================================================
-- TABELA: team_members
-- Membros das equipes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'analyst', 'operator')),
    
    -- Permissões detalhadas
    can_view_calculations BOOLEAN NOT NULL DEFAULT TRUE,
    can_create_calculations BOOLEAN NOT NULL DEFAULT TRUE,
    can_edit_calculations BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete_calculations BOOLEAN NOT NULL DEFAULT FALSE,
    can_export_reports BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_integrations BOOLEAN NOT NULL DEFAULT FALSE,
    can_view_analytics BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_team BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_billing BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Convite
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);

-- Comentários
COMMENT ON TABLE public.team_members IS 'Membros das equipes com suas permissões';
COMMENT ON COLUMN public.team_members.role IS 'Função: admin, manager, analyst, operator';

-- =====================================================
-- TABELA: plan_change_history
-- Histórico de mudanças de plano
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plan_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Mudança
    from_plan_id TEXT NOT NULL CHECK (from_plan_id IN ('free', 'essencial', 'pro', 'enterprise')),
    to_plan_id TEXT NOT NULL CHECK (to_plan_id IN ('free', 'essencial', 'pro', 'enterprise')),
    change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'reactivation', 'cancellation')),
    
    -- Detalhes
    reason TEXT,
    effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plan_change_history_user_id ON public.plan_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_change_history_subscription_id ON public.plan_change_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_plan_change_history_effective_date ON public.plan_change_history(effective_date);

-- Comentários
COMMENT ON TABLE public.plan_change_history IS 'Histórico de mudanças de plano';
COMMENT ON COLUMN public.plan_change_history.change_type IS 'Tipo: upgrade, downgrade, reactivation, cancellation';

-- =====================================================
-- FUNCTIONS: Atualização automática de timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON public.usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Criar assinatura FREE para novos usuários
-- =====================================================
CREATE OR REPLACE FUNCTION create_free_subscription_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar assinatura FREE
    INSERT INTO public.subscriptions (
        user_id,
        plan_id,
        status,
        billing_interval,
        current_period_start,
        current_period_end
    ) VALUES (
        NEW.id,
        'free',
        'active',
        'monthly',
        NOW(),
        NOW() + INTERVAL '1 year' -- Free nunca expira
    );
    
    -- Criar tracking de uso
    INSERT INTO public.usage_tracking (
        user_id,
        subscription_id,
        period_start,
        period_end
    ) VALUES (
        NEW.id,
        (SELECT id FROM public.subscriptions WHERE user_id = NEW.id LIMIT 1),
        NOW(),
        NOW() + INTERVAL '1 month'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar assinatura FREE
DROP TRIGGER IF EXISTS on_auth_user_created_create_free_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_create_free_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_free_subscription_for_new_user();

-- =====================================================
-- FUNCTION: Reset de contadores diários
-- =====================================================
CREATE OR REPLACE FUNCTION reset_daily_calculations()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
    SET 
        calculations_today = 0,
        updated_at = NOW()
    WHERE DATE(updated_at) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Comentário
COMMENT ON FUNCTION reset_daily_calculations() IS 'Reseta o contador de cálculos diários (executar via cron)';

-- =====================================================
-- FUNCTION: Reset de contadores mensais
-- =====================================================
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
    SET 
        calculations_this_month = 0,
        ai_queries_this_month = 0,
        api_requests_this_month = 0,
        period_start = NOW(),
        period_end = NOW() + INTERVAL '1 month',
        updated_at = NOW()
    WHERE period_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentário
COMMENT ON FUNCTION reset_monthly_counters() IS 'Reseta contadores mensais (executar via cron)';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_change_history ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
CREATE POLICY "Users can update their own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para usage_tracking
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage"
    ON public.usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage" ON public.usage_tracking;
CREATE POLICY "Users can update their own usage"
    ON public.usage_tracking FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para teams
DROP POLICY IF EXISTS "Team owners can view their teams" ON public.teams;
CREATE POLICY "Team owners can view their teams"
    ON public.teams FOR SELECT
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
CREATE POLICY "Team owners can manage their teams"
    ON public.teams FOR ALL
    USING (auth.uid() = owner_id);

-- Políticas para team_members
DROP POLICY IF EXISTS "Team members can view their memberships" ON public.team_members;
CREATE POLICY "Team members can view their memberships"
    ON public.team_members FOR SELECT
    USING (
        auth.uid() = user_id OR
        auth.uid() IN (SELECT owner_id FROM public.teams WHERE id = team_id)
    );

DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
CREATE POLICY "Team owners can manage members"
    ON public.team_members FOR ALL
    USING (
        auth.uid() IN (SELECT owner_id FROM public.teams WHERE id = team_id)
    );

-- Políticas para plan_change_history
DROP POLICY IF EXISTS "Users can view their own plan history" ON public.plan_change_history;
CREATE POLICY "Users can view their own plan history"
    ON public.plan_change_history FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- GRANTS: Permissões
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usage_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT SELECT, INSERT ON public.plan_change_history TO authenticated;

-- =====================================================
-- SEED: Dados iniciais (opcional, para testes)
-- =====================================================
-- Você pode descomentar para criar dados de teste
-- INSERT INTO public.subscriptions (user_id, plan_id, status, billing_interval, current_period_end)
-- VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'free', 'active', 'monthly', NOW() + INTERVAL '1 year');
