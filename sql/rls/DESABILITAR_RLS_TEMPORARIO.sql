-- ============================================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA DESENVOLVIMENTO
-- ============================================================================
-- Este script desabilita o RLS nas tabelas de IA para permitir operações
-- durante o desenvolvimento. NUNCA use isso em produção!
-- ============================================================================

-- Desabilitar RLS nas tabelas de personalização
ALTER TABLE user_personalization DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_metrics DISABLE ROW LEVEL SECURITY;

-- Verificar status (deve mostrar false para rls_enabled)
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_personalization',
    'user_skill_metrics',
    'user_behavior_patterns',
    'suggestion_feedback',
    'user_tutorial_progress',
    'user_achievements',
    'user_suggestions',
    'user_copilot_preferences'
)
ORDER BY tablename;

-- ============================================================================
-- RESULTADO ESPERADO: Todas as tabelas devem mostrar rls_enabled = false
-- ============================================================================
