-- =====================================================
-- MIGRAÇÃO: Adicionar suporte ao Stripe
-- Data: 2025-01-10
-- =====================================================

-- Adicionar colunas do Stripe na tabela subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON public.subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON public.subscriptions(stripe_customer_id);

-- Adicionar coluna stripe_customer_id na tabela profiles (se ela existir)
-- Se a tabela profiles não existir, você pode ignorar este comando
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
        ON public.profiles(stripe_customer_id);
    END IF;
END $$;

-- Comentários
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'ID da subscription no Stripe';
COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'ID do customer no Stripe';

-- =====================================================
-- SUCESSO!
-- =====================================================
-- Tabelas atualizadas para suportar Stripe
-- ✅ subscriptions - adicionadas colunas do Stripe
-- ✅ profiles - adicionada coluna stripe_customer_id (se existir)
