-- ============================================
-- SCRIPT OTIMIZADO: Correção de Perfil de Usuário
-- Execute no SQL Editor do Supabase
-- ============================================

-- 📋 PASSO 1: Verificar se o perfil existe
-- Esta query mostra o estado atual do perfil
SELECT 
  up.id,
  up.email,
  up.name,
  up.is_pro,
  up.created_at,
  up.updated_at,
  au.email as auth_email,
  au.raw_user_meta_data->>'name' as metadata_name
FROM user_profiles up
FULL OUTER JOIN auth.users au ON up.id = au.id
WHERE up.email = 'zromulo.barbosa@icloud.com' 
   OR au.email = 'zromulo.barbosa@icloud.com';

-- ============================================
-- 🔧 PASSO 2: Atualizar/Criar perfil
-- Esta query garante que o perfil existe com o nome correto
-- ============================================
INSERT INTO user_profiles (id, email, name, is_pro, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name', 
    'Rômulo Barbosa'
  ) as name,
  false as is_pro,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'zromulo.barbosa@icloud.com'
ON CONFLICT (id) 
DO UPDATE SET
  name = COALESCE(
    EXCLUDED.name,
    user_profiles.name,
    'Rômulo Barbosa'
  ),
  email = EXCLUDED.email,
  updated_at = now();

-- ============================================
-- ✅ PASSO 3: Confirmar que foi atualizado
-- ============================================
SELECT 
  id,
  email,
  name,
  is_pro,
  avatar_url,
  created_at,
  updated_at
FROM user_profiles
WHERE email = 'zromulo.barbosa@icloud.com';

-- ============================================
-- 🔍 DIAGNÓSTICO ADICIONAL (se ainda houver problemas)
-- ============================================

-- Verificar se o trigger de criação de perfil está ativo
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_schema = 'auth';

-- Verificar a função que cria perfis
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user'
  AND n.nspname = 'public';

-- ============================================
-- 🧪 TESTE: Simular criação de perfil
-- (Descomente apenas se quiser testar a função manualmente)
-- ============================================
-- DO $$
-- DECLARE
--   test_user_id uuid;
-- BEGIN
--   SELECT id INTO test_user_id 
--   FROM auth.users 
--   WHERE email = 'zromulo.barbosa@icloud.com';
--   
--   IF test_user_id IS NOT NULL THEN
--     PERFORM public.handle_new_user();
--     RAISE NOTICE 'Perfil criado/atualizado para user_id: %', test_user_id;
--   ELSE
--     RAISE NOTICE 'Usuário não encontrado em auth.users';
--   END IF;
-- END $$;
