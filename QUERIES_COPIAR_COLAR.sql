-- =====================================================
-- QUERIES PARA DIAGNÓSTICO: users vs user_profiles
-- Copie e cole cada query separadamente no SQL Editor
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
-- QUERY 5: Comparar IDs e Emails (CRÍTICO)
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
-- BÔNUS: Verificar price_audit
-- =====================================================
-- Total de registros
SELECT COUNT(*) as total_registros FROM public.price_audit;

-- Registros por user_id
SELECT user_id, COUNT(*) as quantidade 
FROM public.price_audit 
GROUP BY user_id;

