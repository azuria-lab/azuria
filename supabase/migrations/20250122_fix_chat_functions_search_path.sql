-- Migration: Corrigir search_path das funções de chat
-- Data: 2025-01-22
-- Descrição: Corrige o search_path das funções get_unread_count e mark_messages_as_read

-- ============================================
-- 1. CORRIGIR get_unread_count
-- ============================================

-- Remover configuração de search_path vazia (se existir)
DO $$
BEGIN
  BEGIN
    ALTER FUNCTION get_unread_count(uuid, uuid) RESET search_path;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Recriar função com search_path correto
CREATE OR REPLACE FUNCTION get_unread_count(p_room_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_last_read_at timestamptz;
  v_count integer;
BEGIN
  -- Busca última leitura do usuário na sala
  SELECT last_read_at INTO v_last_read_at
  FROM chat_room_members
  WHERE room_id = p_room_id AND user_id = p_user_id;
  
  -- Conta mensagens após última leitura (ou todas se nunca leu)
  SELECT count(*) INTO v_count
  FROM chat_messages
  WHERE room_id = p_room_id
    AND sender_id != p_user_id
    AND deleted_at IS NULL
    AND (v_last_read_at IS NULL OR created_at > v_last_read_at);
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION get_unread_count(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count(uuid, uuid) TO anon;

-- ============================================
-- 2. CORRIGIR mark_messages_as_read
-- ============================================

-- Remover configuração de search_path vazia (se existir)
DO $$
BEGIN
  BEGIN
    ALTER FUNCTION mark_messages_as_read(uuid, uuid) RESET search_path;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Recriar função com search_path correto
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_room_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualiza last_read_at do membro
  UPDATE chat_room_members
  SET last_read_at = now()
  WHERE room_id = p_room_id AND user_id = p_user_id;
  
  -- Marca mensagens como lidas
  INSERT INTO chat_message_reads (message_id, user_id)
  SELECT id, p_user_id
  FROM chat_messages
  WHERE room_id = p_room_id
    AND sender_id != p_user_id
    AND deleted_at IS NULL
    AND id NOT IN (
      SELECT message_id FROM chat_message_reads WHERE user_id = p_user_id
    )
  ON CONFLICT DO NOTHING;
  
  -- Atualiza status das mensagens para "read"
  UPDATE chat_messages
  SET status = 'read'
  WHERE room_id = p_room_id
    AND sender_id != p_user_id
    AND status = 'delivered'
    AND id IN (
      SELECT message_id FROM chat_message_reads WHERE user_id = p_user_id
    );
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION mark_messages_as_read(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read(uuid, uuid) TO anon;

-- ============================================
-- 3. COMENTÁRIOS
-- ============================================

COMMENT ON FUNCTION get_unread_count IS 'Retorna o número de mensagens não lidas de um usuário em uma sala (search_path corrigido)';
COMMENT ON FUNCTION mark_messages_as_read IS 'Marca mensagens como lidas e atualiza last_read_at (search_path corrigido)';

