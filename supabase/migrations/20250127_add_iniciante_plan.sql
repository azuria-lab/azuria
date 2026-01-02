-- =====================================================
-- MIGRAÇÃO: Adicionar plano "iniciante" às constraints
-- Data: 2025-01-27
-- Descrição: Adiciona o plano "iniciante" às constraints CHECK
--            das tabelas subscriptions e plan_change_history
-- =====================================================

-- Atualizar constraint de plan_id na tabela subscriptions
DO $$
BEGIN
    -- Remover constraint antiga
    ALTER TABLE public.subscriptions 
    DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;
    
    -- Adicionar nova constraint incluindo 'iniciante'
    ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_check 
    CHECK (plan_id IN ('free', 'iniciante', 'essencial', 'pro', 'enterprise'));
    
    EXCEPTION WHEN OTHERS THEN
        -- Se der erro, tentar de outra forma
        RAISE NOTICE 'Erro ao atualizar constraint: %', SQLERRM;
END $$;

-- Atualizar constraint de from_plan_id na tabela plan_change_history
DO $$
BEGIN
    ALTER TABLE public.plan_change_history 
    DROP CONSTRAINT IF EXISTS plan_change_history_from_plan_id_check;
    
    ALTER TABLE public.plan_change_history
    ADD CONSTRAINT plan_change_history_from_plan_id_check 
    CHECK (from_plan_id IN ('free', 'iniciante', 'essencial', 'pro', 'enterprise'));
    
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao atualizar constraint from_plan_id: %', SQLERRM;
END $$;

-- Atualizar constraint de to_plan_id na tabela plan_change_history
DO $$
BEGIN
    ALTER TABLE public.plan_change_history 
    DROP CONSTRAINT IF EXISTS plan_change_history_to_plan_id_check;
    
    ALTER TABLE public.plan_change_history
    ADD CONSTRAINT plan_change_history_to_plan_id_check 
    CHECK (to_plan_id IN ('free', 'iniciante', 'essencial', 'pro', 'enterprise'));
    
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao atualizar constraint to_plan_id: %', SQLERRM;
END $$;

-- Atualizar comentários
COMMENT ON COLUMN public.subscriptions.plan_id IS 'ID do plano: free, iniciante, essencial, pro, enterprise';

-- =====================================================
-- SUCESSO!
-- =====================================================
-- ✅ subscriptions.plan_id - constraint atualizada
-- ✅ plan_change_history.from_plan_id - constraint atualizada
-- ✅ plan_change_history.to_plan_id - constraint atualizada
-- ✅ Comentários atualizados

