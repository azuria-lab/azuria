-- =====================================================
-- QUERIES FINAIS PARA VERIFICAÇÃO COMPLETA
-- Execute cada uma e envie os resultados
-- =====================================================

-- =====================================================
-- QUERY 1: Verificar estrutura COMPLETA de subscriptions
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Verificar especificamente colunas Stripe
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND (column_name LIKE '%stripe%' OR column_name LIKE '%Stripe%' OR column_name LIKE '%STRIPE%');

-- Verificar constraints de subscriptions
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions';

-- =====================================================
-- QUERY 2: Listar TODAS as 49 tabelas (completo)
-- =====================================================
SELECT 
    table_name as nome,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- QUERY 3: Verificar tabelas relacionadas a subscriptions
-- =====================================================
SELECT 
    'usage_tracking' as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_tracking') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END as status
UNION ALL
SELECT 'teams',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 'team_members',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 'plan_change_history',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plan_change_history') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END;

-- =====================================================
-- QUERY 4: Resumo geral completo
-- =====================================================
SELECT 
    'RESUMO' as tipo,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_funcoes,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas_rls,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indices;

-- =====================================================
-- QUERY 5: Verificar funções importantes
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    data_type as retorno
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND (routine_name LIKE '%subscription%' 
         OR routine_name LIKE '%usage%'
         OR routine_name LIKE '%update_updated_at%')
ORDER BY routine_name;

