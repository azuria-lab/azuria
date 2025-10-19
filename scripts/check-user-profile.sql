-- Script para verificar e atualizar o perfil do usuário
-- Execute este script no Supabase SQL Editor

-- 1. Verificar os dados atuais do usuário
SELECT 
  id,
  email,
  name,
  is_pro,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar os metadados do usuário na tabela auth.users
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as metadata_name,
  raw_app_meta_data,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Atualizar o nome do usuário (substitua o email pelo seu)
-- UPDATE user_profiles 
-- SET name = 'Rômulo Barbosa'
-- WHERE email = '2romulo.barbosa@icloud.com';

-- 4. Verificar a atualização
-- SELECT id, email, name, is_pro 
-- FROM user_profiles 
-- WHERE email = '2romulo.barbosa@icloud.com';
