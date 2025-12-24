-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO DE SEGURANÇA - EXECUTE APÓS A MIGRAÇÃO
-- ============================================================================
-- Este script verifica se todas as correções de segurança foram aplicadas
-- Execute no SQL Editor do Supabase para validar
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR RLS HABILITADO EM TODAS AS TABELAS CRÍTICAS
-- ============================================================================

SELECT 
    '=== VERIFICAÇÃO DE RLS HABILITADO ===' as info;

SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESABILITADO - CRÍTICO!'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    -- Tabelas de Dynamic Pricing (CRÍTICO)
    'pricing_rules', 
    'pricing_rule_executions',
    'price_adjustments',
    'pricing_strategies',
    'price_history',
    'pricing_performance_metrics',
    'price_simulations',
    -- Tabelas de RAG/Licitações
    'rag_documents',
    'portals',
    'detected_editais',
    -- Tabelas de Price Monitoring
    'monitored_products',
    'competitor_prices',
    'price_suggestions',
    'price_monitoring_history',
    'price_alerts',
    'price_monitoring_settings',
    -- Outras tabelas importantes
    'user_profiles',
    'business_settings',
    'calculation_history',
    'subscriptions',
    'user_marketplace_templates'
  )
ORDER BY 
    CASE WHEN rowsecurity THEN 1 ELSE 0 END,
    tablename;

-- ============================================================================
-- 2. CONTAR POLÍTICAS POR TABELA
-- ============================================================================

SELECT 
    '=== CONTAGEM DE POLÍTICAS POR TABELA ===' as info;

SELECT 
    tablename,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
    COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 3. LISTAR TODAS AS POLÍTICAS CRIADAS
-- ============================================================================

SELECT 
    '=== DETALHES DAS POLÍTICAS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    roles::text,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN '✅ Filtro por usuário'
        WHEN qual = 'true' THEN '⚠️ Acesso público (read-only esperado)'
        ELSE '⚠️ Verificar: ' || LEFT(qual, 50)
    END as security_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- 4. VERIFICAR VIEWS COM SECURITY DEFINER (PROBLEMA)
-- ============================================================================

SELECT 
    '=== VERIFICAÇÃO DE VIEWS ===' as info;

-- Verificar se a view v_price_monitoring_summary existe e tem security_invoker
SELECT 
    viewname,
    CASE 
        WHEN definition LIKE '%security_invoker%' THEN '✅ SECURITY INVOKER'
        ELSE '⚠️ Verificar configuração'
    END as security_mode
FROM pg_views 
WHERE schemaname = 'public'
  AND viewname = 'v_price_monitoring_summary';

-- ============================================================================
-- 5. TABELAS PÚBLICAS SEM RLS (POTENCIAL PROBLEMA)
-- ============================================================================

SELECT 
    '=== TABELAS SEM RLS (VERIFICAR SE É INTENCIONAL) ===' as info;

SELECT 
    tablename,
    '❌ RLS DESABILITADO' as status,
    'Verificar se esta tabela contém dados sensíveis' as action
FROM pg_tables 
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT IN (
    -- Tabelas do sistema que podem não precisar de RLS
    'schema_migrations',
    'supabase_functions'
  )
ORDER BY tablename;

-- ============================================================================
-- 6. RESUMO FINAL
-- ============================================================================

SELECT 
    '=== RESUMO DA AUDITORIA ===' as info;

SELECT 
    'Total de tabelas públicas' as metric,
    COUNT(*)::text as value
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Tabelas com RLS habilitado',
    COUNT(*)::text
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
UNION ALL
SELECT 
    'Tabelas sem RLS',
    COUNT(*)::text
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false
UNION ALL
SELECT 
    'Total de políticas RLS',
    COUNT(*)::text
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- ============================================================================

