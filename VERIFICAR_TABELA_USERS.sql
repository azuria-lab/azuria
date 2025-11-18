-- =====================================================
-- VERIFICAR TABELA users vs user_profiles
-- =====================================================

-- 1. Verificar estrutura de users
SELECT 
    'USERS - ESTRUTURA' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verificar estrutura de user_profiles
SELECT 
    'USER_PROFILES - ESTRUTURA' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Verificar se users tem dados
SELECT 
    'USERS - CONTAGEM' as tipo,
    COUNT(*) as total_registros
FROM public.users;

-- 4. Verificar se user_profiles tem dados
SELECT 
    'USER_PROFILES - CONTAGEM' as tipo,
    COUNT(*) as total_registros
FROM public.user_profiles;

-- 5. Comparar IDs (verificar se são os mesmos usuários)
SELECT 
    'COMPARAÇÃO' as tipo,
    COUNT(DISTINCT u.id) as usuarios_em_users,
    COUNT(DISTINCT up.id) as usuarios_em_user_profiles,
    COUNT(DISTINCT CASE WHEN u.id = up.id THEN u.id END) as usuarios_em_ambos
FROM public.users u
FULL OUTER JOIN public.user_profiles up ON u.id = up.id;

