-- =====================================================
-- QUERIES INDIVIDUAIS PARA VERIFICAÇÃO
-- Execute cada uma separadamente e envie os resultados
-- =====================================================

-- =====================================================
-- QUERY 1: Listar TODAS as tabelas (Execute primeiro!)
-- =====================================================
SELECT 
    table_name as nome,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- QUERY 2: Verificar se subscriptions existe e sua estrutura
-- =====================================================
-- Primeiro verificar se existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') 
        THEN '✅ subscriptions EXISTE'
        ELSE '❌ subscriptions FALTANDO'
    END as status;

-- Se existir, ver estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Verificar colunas Stripe
SELECT 
    column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND (column_name LIKE '%stripe%' OR column_name LIKE '%Stripe%');

-- =====================================================
-- QUERY 3: Verificar tabelas novas (faltantes)
-- =====================================================
SELECT 
    'payment_history' as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_history') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END as status
UNION ALL
SELECT 'business_metrics',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_metrics') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 'sales_data',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sales_data') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 'product_performance',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_performance') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END;

-- =====================================================
-- QUERY 4: Resumo geral (contadores)
-- =====================================================
SELECT 
    'RESUMO' as tipo,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_funcoes,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas_rls,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indices;

