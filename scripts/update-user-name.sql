-- Script para atualizar o nome do usuário na tabela user_profiles
-- Copie o nome do user_metadata e atualize na tabela

-- 1. Ver o estado atual
SELECT id, name, email, created_at
FROM user_profiles;

-- 2. Atualizar o nome (substitua o ID e o nome pelos seus dados)
UPDATE user_profiles
SET name = 'Rômulo Barbosa'
WHERE email = 'zromulo.barbosa@icloud.com';

-- 3. Verificar a atualização
SELECT id, name, email, created_at
FROM user_profiles
WHERE email = 'zromulo.barbosa@icloud.com';
