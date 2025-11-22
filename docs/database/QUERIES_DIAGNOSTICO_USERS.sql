-- =====================================================
-- DIAGNÓSTICO COMPLETO: Tabelas users vs user_profiles
-- Execute cada query separadamente
-- =====================================================

-- =====================================================
-- QUERY 1: Estrutura de users
-- =====================================================
SELECT 
    'USERS - ESTRUTURA' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- QUERY 2: Estrutura de user_profiles
-- =====================================================
SELECT 
    'USER_PROFILES - ESTRUTURA' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- =====================================================
-- QUERY 3: Dados de users (primeiros 10)
-- =====================================================
SELECT 
    'USERS - DADOS' as tipo,
    id,
    email,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- QUERY 4: Dados de user_profiles (primeiros 10)
-- =====================================================
SELECT 
    'USER_PROFILES - DADOS' as tipo,
    id,
    email,
    name,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- QUERY 5: Comparar IDs e Emails
-- =====================================================
SELECT 
    'COMPARAÇÃO' as tipo,
    COALESCE(u.id::text, up.id::text) as id,
    COALESCE(u.email, up.email) as email,
    CASE WHEN u.id IS NOT NULL THEN '✅ users' ELSE '❌' END as em_users,
    CASE WHEN up.id IS NOT NULL THEN '✅ user_profiles' ELSE '❌' END as em_user_profiles
FROM public.users u
FULL OUTER JOIN public.user_profiles up ON u.id = up.id
ORDER BY COALESCE(u.created_at, up.created_at) DESC;

-- =====================================================
-- QUERY 6: Verificar se users é referenciada (via foreign keys)
-- =====================================================
SELECT 
    'REFERÊNCIAS' as tipo,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table_name,
    ccu.column_name AS referenced_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- QUERY 7: Verificar uso de users no código (via foreign keys)
-- =====================================================
SELECT 
    'FOREIGN KEYS' as tipo,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND tc.table_schema = 'public';

