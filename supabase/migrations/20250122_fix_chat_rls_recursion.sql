-- Migration: Corrigir Recursão Infinita nas Políticas RLS do Chat
-- Data: 2025-01-22
-- Descrição: Corrige políticas RLS que causam recursão infinita em chat_room_members

-- ============================================
-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
-- ============================================

-- Remover política que causa recursão infinita
DROP POLICY IF EXISTS "Users can view members of rooms they belong to" ON chat_room_members;
DROP POLICY IF EXISTS "Users can add members to rooms they created or are admin" ON chat_room_members;

-- ============================================
-- 2. CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR MEMBROS
-- ============================================

-- Função auxiliar para verificar se usuário é membro de uma sala
-- Usa security definer para evitar recursão
CREATE OR REPLACE FUNCTION is_room_member(p_room_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chat_room_members
    WHERE room_id = p_room_id
      AND user_id = p_user_id
  );
$$;

-- ============================================
-- 3. RECRIAR POLÍTICAS CORRIGIDAS
-- ============================================

-- Política simplificada: usuários podem ver membros de salas que participam
-- Usa a função auxiliar para evitar recursão
CREATE POLICY "Users can view members of rooms they belong to"
  ON chat_room_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_room_member(room_id, auth.uid())
  );

-- Política para inserção: usuários podem adicionar membros se criaram a sala ou são admin
CREATE POLICY "Users can add members to rooms they created or are admin"
  ON chat_room_members FOR INSERT
  WITH CHECK (
    -- Permite inserir se o usuário está criando seu próprio registro de membro
    user_id = auth.uid()
    OR
    -- Ou se o usuário criou a sala
    EXISTS (
      SELECT 1
      FROM chat_rooms
      WHERE id = chat_room_members.room_id
        AND created_by = auth.uid()
    )
    OR
    -- Ou se o usuário é admin da sala
    EXISTS (
      SELECT 1
      FROM chat_room_members crm
      WHERE crm.room_id = chat_room_members.room_id
        AND crm.user_id = auth.uid()
        AND crm.role = 'admin'
    )
  );

-- ============================================
-- 4. COMENTÁRIOS
-- ============================================

COMMENT ON FUNCTION is_room_member IS 'Verifica se um usuário é membro de uma sala (usa security definer para evitar recursão)';

