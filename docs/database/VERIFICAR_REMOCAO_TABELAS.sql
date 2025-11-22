-- =====================================================
-- VERIFICAÇÃO: Tabelas users e price_audit removidas
-- Execute após aplicar migração 20250111_remove_legacy_users.sql
-- =====================================================

-- =====================================================
-- QUERY 1: Verificar se users foi removida
-- =====================================================
SELECT 
    'VERIFICAÇÃO USERS' as tipo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        ) THEN '❌ AINDA EXISTE'
        ELSE '✅ REMOVIDA COM SUCESSO'
    END as status;

-- =====================================================
-- QUERY 2: Verificar se price_audit foi removida
-- =====================================================
SELECT 
    'VERIFICAÇÃO PRICE_AUDIT' as tipo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'price_audit'
        ) THEN '❌ AINDA EXISTE'
        ELSE '✅ REMOVIDA COM SUCESSO'
    END as status;

-- =====================================================
-- QUERY 3: Contar tabelas restantes no schema public
-- =====================================================
SELECT 
    'TOTAL TABELAS' as tipo,
    COUNT(*) as total_tabelas
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- =====================================================
-- QUERY 4: Listar todas as tabelas (verificar limpeza)
-- =====================================================
SELECT 
    'LISTA TABELAS' as tipo,
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_schema = 'public' 
     AND table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- QUERY 5: Verificar se há foreign keys órfãs
-- =====================================================
SELECT 
    'FOREIGN KEYS ÓRFÃS' as tipo,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name IN ('users', 'price_audit')
ORDER BY tc.table_name;

