-- Migration: Correção Final Completa das Políticas RLS do Chat
-- Data: 2025-01-22
-- Descrição: Corrige definitivamente todas as políticas RLS usando funções SECURITY DEFINER

-- ============================================
-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ============================================

-- Remover políticas de chat_rooms
DROP POLICY IF EXISTS "chat_rooms_select" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_insert" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_update" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update rooms they created or are admin" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_select_simple" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_insert_simple" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_update_simple" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_select_final" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_insert_final" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_update_final" ON chat_rooms;

-- Remover políticas de chat_room_members
DROP POLICY IF EXISTS "Users can view members of rooms they belong to" ON chat_room_members;
DROP POLICY IF EXISTS "Users can add members to rooms they created or are admin" ON chat_room_members;
DROP POLICY IF EXISTS "Users can update their own member status" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_select" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_insert" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_update" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_select_policy" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_select_simple" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_select_final" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_insert_final" ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_update_final" ON chat_room_members;

-- Remover políticas de chat_messages
DROP POLICY IF EXISTS "Users can view messages from rooms they belong to" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in rooms they belong to" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_select" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update" ON chat_messages;

-- ============================================
-- 2. GARANTIR QUE AS FUNÇÕES AUXILIARES EXISTEM
-- ============================================

-- Função para verificar se usuário é membro de uma sala (bypass RLS)
CREATE OR REPLACE FUNCTION user_is_room_member(p_room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Esta função bypass RLS completamente usando SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1
    FROM chat_room_members
    WHERE room_id = p_room_id
      AND user_id = auth.uid()
  );
END;
$$;

-- Função para verificar se usuário criou uma sala
CREATE OR REPLACE FUNCTION user_created_room(p_room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM chat_rooms
    WHERE id = p_room_id
      AND created_by = auth.uid()
  );
END;
$$;

-- Garantir permissões nas funções
GRANT EXECUTE ON FUNCTION user_is_room_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_room_member(uuid) TO anon;
GRANT EXECUTE ON FUNCTION user_created_room(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_created_room(uuid) TO anon;

-- ============================================
-- 3. CRIAR POLÍTICAS SEGURAS (SEM RECURSÃO)
-- ============================================

-- Políticas para chat_rooms
CREATE POLICY "chat_rooms_select_safe"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    user_is_room_member(id)
  );

CREATE POLICY "chat_rooms_insert_safe"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "chat_rooms_update_safe"
  ON chat_rooms FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Políticas para chat_room_members
CREATE POLICY "chat_room_members_select_safe"
  ON chat_room_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    user_created_room(room_id)
  );

CREATE POLICY "chat_room_members_insert_safe"
  ON chat_room_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    user_created_room(room_id)
  );

CREATE POLICY "chat_room_members_update_safe"
  ON chat_room_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Políticas para chat_messages
CREATE POLICY "chat_messages_select_safe"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      sender_id = auth.uid()
      OR
      user_is_room_member(room_id)
    )
  );

CREATE POLICY "chat_messages_insert_safe"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND
    user_is_room_member(room_id)
  );

CREATE POLICY "chat_messages_update_safe"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- ============================================
-- 4. COMENTÁRIOS
-- ============================================

COMMENT ON FUNCTION user_is_room_member IS 'Verifica se o usuário atual é membro de uma sala (usa SECURITY DEFINER para bypass RLS e evitar recursão)';
COMMENT ON FUNCTION user_created_room IS 'Verifica se o usuário atual criou uma sala (usa SECURITY DEFINER para bypass RLS e evitar recursão)';

