-- =====================================================
-- VERIFICAÇÃO COMPLETA DO SCHEMA SUPABASE CLOUD (CORRIGIDO)
-- Project: crpzkppsriranmeumfqs
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. LISTAR TODAS AS TABELAS (49 mencionadas)
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
-- 2. VERIFICAR ESTRUTURA DE SUBSCRIPTIONS
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

-- Verificar se tem colunas Stripe
SELECT 
    'SUBSCRIPTIONS - STRIPE' as tipo,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND (column_name LIKE '%stripe%' OR column_name LIKE '%Stripe%');

-- =====================================================
-- 3. VERIFICAR TABELAS FALTANTES (Novas migrações)
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
-- 4. LISTAR TODAS AS FUNÇÕES
-- =====================================================
SELECT 
    'FUNÇÕES' as categoria,
    routine_name as nome,
    routine_type as tipo,
    data_type as retorno
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- 5. LISTAR TODOS OS TRIGGERS
-- =====================================================
SELECT 
    'TRIGGERS' as categoria,
    trigger_name as nome,
    event_object_table as tabela,
    action_timing as timing,
    event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 6. LISTAR TODAS AS POLÍTICAS RLS
-- =====================================================
SELECT 
    'RLS POLICIES' as categoria,
    tablename as tabela,
    policyname as politica,
    permissive,
    roles,
    cmd as comando
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 7. LISTAR TODOS OS ÍNDICES
-- =====================================================
SELECT 
    'ÍNDICES' as categoria,
    tablename as tabela,
    indexname as indice
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 8. VERIFICAR CONSTRAINTS
-- =====================================================
SELECT 
    'CONSTRAINTS' as categoria,
    table_name as tabela,
    constraint_name as constraint,
    constraint_type as tipo
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;

-- =====================================================
-- 9. RESUMO GERAL
-- =====================================================
SELECT 
    'RESUMO' as categoria,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_funcoes,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas_rls,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indices;

-- =====================================================
-- 10. VERIFICAR MIGRAÇÕES APLICADAS (CORRIGIDO)
-- =====================================================
-- Verificar estrutura da tabela de migrações primeiro
SELECT 
    'MIGRAÇÕES - ESTRUTURA' as categoria,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'supabase_migrations' 
    AND table_name = 'schema_migrations'
ORDER BY ordinal_position;

-- Listar migrações aplicadas (usando colunas corretas)
SELECT 
    'MIGRAÇÕES' as categoria,
    version,
    name
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;

