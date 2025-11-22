-- =====================================================
-- SCRIPT COMPLETO: Verificação do Schema Supabase Cloud
-- Project: crpzkppsriranmeumfqs
-- Data: Janeiro 2025
-- =====================================================
-- 
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
-- 
-- =====================================================

-- =====================================================
-- 1. LISTAR TODAS AS TABELAS
-- =====================================================
SELECT 
    'TABELAS' as tipo,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 2. VERIFICAR ESTRUTURA DE TABELAS PRINCIPAIS
-- =====================================================

-- subscriptions
SELECT 'SUBSCRIPTIONS - ESTRUTURA' as tipo, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- user_profiles
SELECT 'USER_PROFILES - ESTRUTURA' as tipo, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- usage_tracking
SELECT 'USAGE_TRACKING - ESTRUTURA' as tipo, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'usage_tracking'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR COLUNAS STRIPE EM SUBSCRIPTIONS
-- =====================================================
SELECT 'SUBSCRIPTIONS - COLUNAS STRIPE' as tipo, column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND (column_name LIKE '%stripe%' OR column_name LIKE '%Stripe%');

-- =====================================================
-- 4. LISTAR TODAS AS FUNÇÕES
-- =====================================================
SELECT 'FUNÇÕES' as tipo, routine_name, routine_type, data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- 5. LISTAR TODOS OS TRIGGERS
-- =====================================================
SELECT 'TRIGGERS' as tipo, trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 6. LISTAR TODAS AS POLÍTICAS RLS
-- =====================================================
SELECT 'POLÍTICAS RLS' as tipo, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 7. LISTAR TODOS OS ÍNDICES
-- =====================================================
SELECT 'ÍNDICES' as tipo, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 8. VERIFICAR CONSTRAINTS
-- =====================================================
SELECT 'CONSTRAINTS' as tipo, table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;

-- =====================================================
-- 9. VERIFICAR TABELAS FALTANTES (Comparar com esperado)
-- =====================================================
-- Tabelas esperadas:
-- ✅ user_profiles
-- ✅ subscriptions
-- ✅ usage_tracking
-- ⚠️ payment_history
-- ⚠️ business_metrics
-- ⚠️ sales_data
-- ⚠️ product_performance
-- ✅ user_marketplace_templates
-- ✅ advanced_calculation_history
-- ✅ teams
-- ✅ team_members
-- ✅ plan_change_history

SELECT 'TABELAS FALTANTES?' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_history') THEN '✅ payment_history existe'
        ELSE '❌ payment_history FALTANDO'
    END as status
UNION ALL
SELECT 'TABELAS FALTANTES?' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_metrics') THEN '✅ business_metrics existe'
        ELSE '❌ business_metrics FALTANDO'
    END
UNION ALL
SELECT 'TABELAS FALTANTES?' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sales_data') THEN '✅ sales_data existe'
        ELSE '❌ sales_data FALTANDO'
    END
UNION ALL
SELECT 'TABELAS FALTANTES?' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_performance') THEN '✅ product_performance existe'
        ELSE '❌ product_performance FALTANDO'
    END;

-- =====================================================
-- 10. RESUMO GERAL
-- =====================================================
SELECT 
    'RESUMO' as tipo,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_funcoes,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas_rls,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indices;

