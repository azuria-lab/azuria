-- =====================================================
-- ROLLBACK: Remove tabelas de assinaturas
-- Use apenas se precisar recriar tudo do zero
-- =====================================================

-- Desabilitar triggers temporariamente
SET session_replication_role = replica;

-- Remover políticas RLS (se existirem)
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update their own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Team owners can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own plan history" ON public.plan_change_history;

-- Remover triggers
DROP TRIGGER IF EXISTS on_auth_user_created_create_free_subscription ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions CASCADE;
DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking CASCADE;
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams CASCADE;
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members CASCADE;

-- Remover functions
DROP FUNCTION IF EXISTS create_free_subscription_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS reset_daily_calculations() CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_counters() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Remover tabelas (na ordem correta devido às foreign keys)
DROP TABLE IF EXISTS public.plan_change_history CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Reabilitar triggers
SET session_replication_role = DEFAULT;

-- Pronto! Agora execute a migration 20250108_subscriptions.sql completa
