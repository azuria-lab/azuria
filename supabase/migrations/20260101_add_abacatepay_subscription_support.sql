-- =====================================================
-- MIGRAÇÃO: Adicionar suporte AbacatePay às subscriptions
-- Data: 2026-01-01
-- Descrição: Adiciona coluna payment_provider na tabela subscriptions
--            e subscription_id na tabela abacatepay_billings para
--            suportar renovações automáticas
-- =====================================================

-- Adicionar coluna payment_provider na tabela subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS payment_provider TEXT 
  CHECK (payment_provider IN ('stripe', 'mercadopago', 'abacatepay', NULL));

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_provider 
ON public.subscriptions(payment_provider);

-- Adicionar coluna subscription_id na tabela abacatepay_billings
ALTER TABLE public.abacatepay_billings
ADD COLUMN IF NOT EXISTS subscription_id UUID 
  REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_abacatepay_billings_subscription_id 
ON public.abacatepay_billings(subscription_id);

-- Comentários
COMMENT ON COLUMN public.subscriptions.payment_provider IS 'Gateway de pagamento utilizado: stripe, mercadopago ou abacatepay';
COMMENT ON COLUMN public.abacatepay_billings.subscription_id IS 'Referência à subscription relacionada (para renovações)';

-- =====================================================
-- SUCESSO!
-- =====================================================
-- ✅ subscriptions - adicionada coluna payment_provider
-- ✅ abacatepay_billings - adicionada coluna subscription_id

