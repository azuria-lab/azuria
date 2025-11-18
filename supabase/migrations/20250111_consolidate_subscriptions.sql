-- =====================================================
-- MIGRAÇÃO: Consolidar Subscriptions
-- Data: 2025-01-11
-- Descrição: Consolida tabela subscriptions com suporte Stripe e Mercado Pago
-- =====================================================

-- =====================================================
-- ATUALIZAR TABELA: subscriptions
-- Adicionar colunas faltantes e padronizar estrutura
-- =====================================================

-- Adicionar colunas do Stripe (se não existirem)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Adicionar colunas faltantes (se não existirem)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Atualizar constraint de plan_id para incluir todos os planos
-- Primeiro, remover constraint antiga se existir
DO $$
BEGIN
    -- Tentar remover constraint antiga (pode não existir)
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Adicionar nova constraint com todos os planos
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;

DO $$
BEGIN
    ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_check 
    CHECK (plan_id IN ('free', 'essencial', 'pro', 'enterprise'));
EXCEPTION WHEN OTHERS THEN
    -- Se já existe, não fazer nada
    NULL;
END $$;

-- Atualizar constraint de status
DO $$
BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
    ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Renomear coluna 'plan' para 'plan_id' se existir 'plan'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'plan'
    ) THEN
        ALTER TABLE public.subscriptions RENAME COLUMN plan TO plan_id;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Garantir que current_period_end não seja NULL
UPDATE public.subscriptions
SET current_period_end = current_period_start + INTERVAL '1 month'
WHERE current_period_end IS NULL;

ALTER TABLE public.subscriptions
ALTER COLUMN current_period_end SET NOT NULL;

-- Índices para Stripe
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Comentários atualizados
COMMENT ON TABLE public.subscriptions IS 'Assinaturas dos usuários com suporte Stripe e Mercado Pago';
COMMENT ON COLUMN public.subscriptions.plan_id IS 'ID do plano: free, essencial, pro, enterprise';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'ID da subscription no Stripe';
COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'ID do customer no Stripe';
COMMENT ON COLUMN public.subscriptions.mercadopago_subscription_id IS 'ID da subscription no Mercado Pago';

-- =====================================================
-- ATUALIZAR TABELA: usage_tracking
-- Consolidar estrutura (usar a versão mais completa)
-- =====================================================

-- Se a tabela tem estrutura antiga (sem subscription_id), migrar dados
DO $$
BEGIN
    -- Verificar se existe coluna 'date' (estrutura antiga)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'usage_tracking' 
        AND column_name = 'date'
    ) THEN
        -- Migrar dados da estrutura antiga para nova
        -- Criar subscription_id se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'subscription_id'
        ) THEN
            ALTER TABLE public.usage_tracking
            ADD COLUMN subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE;
            
            -- Preencher subscription_id com a subscription do usuário
            UPDATE public.usage_tracking ut
            SET subscription_id = (
                SELECT id FROM public.subscriptions s 
                WHERE s.user_id = ut.user_id 
                LIMIT 1
            )
            WHERE subscription_id IS NULL;
            
            -- Tornar obrigatório
            ALTER TABLE public.usage_tracking
            ALTER COLUMN subscription_id SET NOT NULL;
        END IF;
        
        -- Migrar 'date' para 'period_start' se necessário
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'date'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'period_start'
        ) THEN
            ALTER TABLE public.usage_tracking
            ADD COLUMN period_start TIMESTAMPTZ DEFAULT NOW();
            
            UPDATE public.usage_tracking
            SET period_start = date::timestamptz
            WHERE period_start IS NULL;
            
            ALTER TABLE public.usage_tracking
            DROP COLUMN date;
        END IF;
        
        -- Adicionar period_end se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'period_end'
        ) THEN
            ALTER TABLE public.usage_tracking
            ADD COLUMN period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month');
        END IF;
        
        -- Adicionar colunas de contadores mensais se não existirem
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'calculations_this_month'
        ) THEN
            ALTER TABLE public.usage_tracking
            ADD COLUMN calculations_this_month INTEGER DEFAULT 0,
            ADD COLUMN ai_queries_this_month INTEGER DEFAULT 0,
            ADD COLUMN api_requests_this_month INTEGER DEFAULT 0;
        END IF;
        
        -- Adicionar colunas de timestamps de última atividade
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'last_calculation_at'
        ) THEN
            ALTER TABLE public.usage_tracking
            ADD COLUMN last_calculation_at TIMESTAMPTZ,
            ADD COLUMN last_ai_query_at TIMESTAMPTZ,
            ADD COLUMN last_api_request_at TIMESTAMPTZ;
        END IF;
        
        -- Renomear calculations_count para calculations_today se necessário
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'calculations_count'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking' 
            AND column_name = 'calculations_today'
        ) THEN
            ALTER TABLE public.usage_tracking
            RENAME COLUMN calculations_count TO calculations_today;
        END IF;
        
        -- Atualizar constraint unique
        DROP INDEX IF EXISTS usage_tracking_user_id_date_key;
        CREATE UNIQUE INDEX IF NOT EXISTS unique_usage_tracking_per_user 
        ON public.usage_tracking(user_id, period_start);
    END IF;
END $$;

-- =====================================================
-- SUCESSO!
-- =====================================================
-- ✅ subscriptions consolidada com Stripe e Mercado Pago
-- ✅ usage_tracking migrada para estrutura completa

