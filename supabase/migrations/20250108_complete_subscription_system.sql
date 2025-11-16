-- =====================================================
-- SCRIPT COMPLETO: Sistema de Planos e Assinaturas
-- Execute este arquivo COMPLETO no SQL Editor do Supabase
-- =====================================================

-- Passo 1: Limpar estruturas existentes (se houver)
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    -- Remover triggers primeiro (silenciosamente ignora se não existir)
    BEGIN
        DROP TRIGGER IF EXISTS on_auth_user_created_create_free_subscription ON auth.users CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    -- Remover functions (silenciosamente ignora se não existir)
    BEGIN
        DROP FUNCTION IF EXISTS create_free_subscription_for_new_user() CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS reset_daily_calculations() CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS reset_monthly_counters() CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    -- Remover tabelas (CASCADE remove policies automaticamente)
    BEGIN
        DROP TABLE IF EXISTS public.plan_change_history CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TABLE IF EXISTS public.team_members CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TABLE IF EXISTS public.teams CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TABLE IF EXISTS public.usage_tracking CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP TABLE IF EXISTS public.subscriptions CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: subscriptions
-- =====================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'essencial', 'pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired')),
    billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'annual')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    mercadopago_subscription_id TEXT,
    mercadopago_preapproval_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_active_subscription_per_user UNIQUE (user_id)
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_mercadopago_id ON public.subscriptions(mercadopago_subscription_id);

COMMENT ON TABLE public.subscriptions IS 'Assinaturas dos usuários';

-- =====================================================
-- TABELA: usage_tracking
-- =====================================================
CREATE TABLE public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    calculations_today INTEGER NOT NULL DEFAULT 0,
    calculations_this_month INTEGER NOT NULL DEFAULT 0,
    ai_queries_this_month INTEGER NOT NULL DEFAULT 0,
    api_requests_this_month INTEGER NOT NULL DEFAULT 0,
    last_calculation_at TIMESTAMPTZ,
    last_ai_query_at TIMESTAMPTZ,
    last_api_request_at TIMESTAMPTZ,
    period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_usage_tracking_per_user UNIQUE (user_id, period_start)
);

CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_subscription_id ON public.usage_tracking(subscription_id);
CREATE INDEX idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);

COMMENT ON TABLE public.usage_tracking IS 'Rastreamento de uso de recursos dos usuários';

-- =====================================================
-- TABELA: teams
-- =====================================================
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    require_approval BOOLEAN NOT NULL DEFAULT FALSE,
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    audit_log_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_team_name_per_owner UNIQUE (owner_id, name)
);

CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_subscription_id ON public.teams(subscription_id);

COMMENT ON TABLE public.teams IS 'Equipes para colaboração (Enterprise)';

-- =====================================================
-- TABELA: team_members
-- =====================================================
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'analyst', 'operator')),
    can_view_calculations BOOLEAN NOT NULL DEFAULT TRUE,
    can_create_calculations BOOLEAN NOT NULL DEFAULT TRUE,
    can_edit_calculations BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete_calculations BOOLEAN NOT NULL DEFAULT FALSE,
    can_export_reports BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_integrations BOOLEAN NOT NULL DEFAULT FALSE,
    can_view_analytics BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_team BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_billing BOOLEAN NOT NULL DEFAULT FALSE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_role ON public.team_members(role);

COMMENT ON TABLE public.team_members IS 'Membros das equipes com suas permissões';

-- =====================================================
-- TABELA: plan_change_history
-- =====================================================
CREATE TABLE public.plan_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    from_plan_id TEXT NOT NULL CHECK (from_plan_id IN ('free', 'essencial', 'pro', 'enterprise')),
    to_plan_id TEXT NOT NULL CHECK (to_plan_id IN ('free', 'essencial', 'pro', 'enterprise')),
    change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'reactivation', 'cancellation')),
    reason TEXT,
    effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plan_change_history_user_id ON public.plan_change_history(user_id);
CREATE INDEX idx_plan_change_history_subscription_id ON public.plan_change_history(subscription_id);
CREATE INDEX idx_plan_change_history_effective_date ON public.plan_change_history(effective_date);

COMMENT ON TABLE public.plan_change_history IS 'Histórico de mudanças de plano';

-- =====================================================
-- FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON public.usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION create_free_subscription_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (
        user_id, plan_id, status, billing_interval,
        current_period_start, current_period_end
    ) VALUES (
        NEW.id, 'free', 'active', 'monthly',
        NOW(), NOW() + INTERVAL '1 year'
    );
    
    INSERT INTO public.usage_tracking (
        user_id, subscription_id, period_start, period_end
    ) VALUES (
        NEW.id,
        (SELECT id FROM public.subscriptions WHERE user_id = NEW.id LIMIT 1),
        NOW(), NOW() + INTERVAL '1 month'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_create_free_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_free_subscription_for_new_user();

CREATE OR REPLACE FUNCTION reset_daily_calculations()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
    SET calculations_today = 0, updated_at = NOW()
    WHERE DATE(updated_at) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

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

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage"
    ON public.usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
    ON public.usage_tracking FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Team owners can view their teams"
    ON public.teams FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can manage their teams"
    ON public.teams FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view their memberships"
    ON public.team_members FOR SELECT
    USING (
        auth.uid() = user_id OR
        auth.uid() IN (SELECT owner_id FROM public.teams WHERE id = team_id)
    );

CREATE POLICY "Team owners can manage members"
    ON public.team_members FOR ALL
    USING (
        auth.uid() IN (SELECT owner_id FROM public.teams WHERE id = team_id)
    );

CREATE POLICY "Users can view their own plan history"
    ON public.plan_change_history FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usage_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT SELECT, INSERT ON public.plan_change_history TO authenticated;

-- =====================================================
-- SUCESSO!
-- =====================================================
-- Tabelas criadas:
-- ✅ subscriptions
-- ✅ usage_tracking  
-- ✅ teams
-- ✅ team_members
-- ✅ plan_change_history
--
-- Agora seus hooks React vão funcionar! 🎉
