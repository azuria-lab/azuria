-- =====================================================
-- Migration: Remove Legacy users Table
-- Description: Remove tabela users legada e corrige price_audit
-- Date: 2025-01-11
-- =====================================================

-- =====================================================
-- PASSO 1: Verificar e corrigir price_audit
-- =====================================================

-- Remover foreign key de price_audit para users (se existir)
DO $$
BEGIN
    -- Verificar se existe constraint
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'price_audit_user_id_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.price_audit 
        DROP CONSTRAINT IF EXISTS price_audit_user_id_fkey;
        
        RAISE NOTICE 'Foreign key removida de price_audit para users';
    END IF;
END $$;

-- Como price_audit está vazia (0 registros) e não é usada,
-- podemos simplesmente remover a tabela também
-- Mas primeiro vamos verificar se há outras referências

-- =====================================================
-- PASSO 2: Verificar outras dependências de users
-- =====================================================

-- Verificar se há outras foreign keys apontando para users
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'users'
        AND tc.table_schema = 'public';
    
    IF fk_count > 0 THEN
        RAISE NOTICE 'Ainda existem % foreign keys referenciando users', fk_count;
    ELSE
        RAISE NOTICE 'Nenhuma foreign key encontrada referenciando users';
    END IF;
END $$;

-- =====================================================
-- PASSO 3: Remover tabela price_audit (vazia e não usada)
-- =====================================================

-- Verificar se tabela existe antes de remover policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'price_audit') THEN
        -- Remover policies de price_audit primeiro
        DROP POLICY IF EXISTS "Users can view own price audits" ON public.price_audit;
        DROP POLICY IF EXISTS "Users can insert own price audits" ON public.price_audit;
        DROP POLICY IF EXISTS "Users can update own price audits" ON public.price_audit;
        DROP POLICY IF EXISTS "Service role has full access" ON public.price_audit;
        
        -- Remover triggers
        DROP TRIGGER IF EXISTS update_price_audit_updated_at ON public.price_audit;
        
        RAISE NOTICE 'Policies e triggers de price_audit removidos';
    END IF;
END $$;

-- Remover índices (sintaxe correta: apenas nome do índice)
DROP INDEX IF EXISTS public.idx_price_audit_user_id;
DROP INDEX IF EXISTS public.idx_price_audit_product_id;
DROP INDEX IF EXISTS public.idx_price_audit_created_at;

-- Remover tabela price_audit
DROP TABLE IF EXISTS public.price_audit;

-- =====================================================
-- PASSO 4: Remover tabela users (legada, não usada)
-- =====================================================

-- Verificar se tabela existe antes de remover policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Remover policies de users primeiro (se existirem)
        DROP POLICY IF EXISTS "Users can view own data" ON public.users;
        DROP POLICY IF EXISTS "Users can update own data" ON public.users;
        DROP POLICY IF EXISTS "Service role has full access" ON public.users;
        
        RAISE NOTICE 'Policies de users removidas';
    END IF;
END $$;

-- Remover índices (sintaxe correta: apenas nome do índice)
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_tenant_id;
DROP INDEX IF EXISTS public.idx_users_role;

-- Remover tabela users
DROP TABLE IF EXISTS public.users;

-- =====================================================
-- PASSO 5: Comentários finais
-- =====================================================

COMMENT ON SCHEMA public IS 'Schema público - tabela users legada removida em 2025-01-11';

-- =====================================================
-- NOTAS:
-- =====================================================
-- 1. Tabela users era legada com estrutura multi-tenant antiga
-- 2. Tabela user_profiles é a tabela atual usada pelo código
-- 3. price_audit estava vazia (0 registros) e não era usada
-- 4. Nenhuma foreign key restante após remoção de price_audit
-- 5. Dados de users eram apenas de teste/demo (não eram reais)
-- =====================================================

