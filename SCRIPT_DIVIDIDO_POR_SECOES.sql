-- =====================================================
-- VERIFICAÇÃO DIVIDIDA POR SEÇÕES (Execute uma por vez)
-- Project: crpzkppsriranmeumfqs
-- =====================================================
-- Execute cada seção separadamente para evitar timeout
-- =====================================================

-- =====================================================
-- SEÇÃO 1: LISTAR TODAS AS TABELAS
-- =====================================================
SELECT 
    'TABELAS' as categoria,
    table_name as nome,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- SEÇÃO 2: VERIFICAR SUBSCRIPTIONS
-- =====================================================
SELECT 
    'SUBSCRIPTIONS' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
ORDER BY ordinal_position;

SELECT 
    'SUBSCRIPTIONS - STRIPE' as tipo,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND (column_name LIKE '%stripe%' OR column_name LIKE '%Stripe%');

-- =====================================================
-- SEÇÃO 3: VERIFICAR TABELAS FALTANTES
-- =====================================================
SELECT 
    'VERIFICAÇÃO' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_history') 
        THEN '✅ payment_history existe'
        ELSE '❌ payment_history FALTANDO'
    END as status
UNION ALL
SELECT 'VERIFICAÇÃO', 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_metrics') 
        THEN '✅ business_metrics existe'
        ELSE '❌ business_metrics FALTANDO'
    END
UNION ALL
SELECT 'VERIFICAÇÃO',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sales_data') 
        THEN '✅ sales_data existe'
        ELSE '❌ sales_data FALTANDO'
    END
UNION ALL
SELECT 'VERIFICAÇÃO',
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_performance') 
        THEN '✅ product_performance existe'
        ELSE '❌ product_performance FALTANDO'
    END;

-- =====================================================
-- SEÇÃO 4: FUNÇÕES E TRIGGERS
-- =====================================================
SELECT 
    'FUNÇÕES' as categoria,
    routine_name as nome,
    routine_type as tipo
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

SELECT 
    'TRIGGERS' as categoria,
    trigger_name as nome,
    event_object_table as tabela
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- SEÇÃO 5: POLÍTICAS RLS E ÍNDICES
-- =====================================================
SELECT 
    'RLS POLICIES' as categoria,
    tablename as tabela,
    policyname as politica
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 
    'ÍNDICES' as categoria,
    tablename as tabela,
    indexname as indice
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- SEÇÃO 6: RESUMO
-- =====================================================
SELECT 
    'RESUMO' as categoria,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_funcoes,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas_rls,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indices;

