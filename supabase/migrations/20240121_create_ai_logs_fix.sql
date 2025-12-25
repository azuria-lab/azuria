-- ============================================
-- FIX: Criar tabela ai_logs e políticas RLS
-- Versão segura que não dá erro se já existir
-- ============================================

-- 1. Criar tabela (se não existir)
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  context VARCHAR(50) DEFAULT 'general',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices (se não existirem)
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session_id ON ai_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_message_type ON ai_logs(message_type);

-- 3. Habilitar RLS (se ainda não estiver habilitado)
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER políticas antigas (se existirem) - sem erro se não existir
DROP POLICY IF EXISTS "Users can view their own AI logs" ON ai_logs;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON ai_logs;
DROP POLICY IF EXISTS "Users can view their own AI logs" ON ai_logs; -- Redundante mas seguro
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON ai_logs; -- Redundante mas seguro

-- 5. Criar políticas RLS (novamente)
CREATE POLICY "Users can view their own AI logs"
  ON ai_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
  ON ai_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se tabela existe
SELECT 
  'Tabela ai_logs' as componente,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_logs'
  ) THEN '✅ OK' ELSE '❌ FALTA CRIAR' END as status;

-- Verificar colunas
SELECT 
  'Colunas da tabela' as componente,
  COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_name = 'ai_logs';

-- Verificar RLS
SELECT 
  'RLS habilitado' as componente,
  CASE WHEN relrowsecurity THEN '✅ ATIVADO' ELSE '❌ DESATIVADO' END as status
FROM pg_class
WHERE relname = 'ai_logs';

-- Verificar políticas
SELECT 
  'Policies criadas' as componente,
  COUNT(*) as total_policies,
  CASE WHEN COUNT(*) >= 2 THEN '✅ OK (2 policies)' ELSE '⚠️ INCOMPLETO' END as status
FROM pg_policies
WHERE tablename = 'ai_logs';

-- Listar políticas
SELECT 
  policyname as "Nome da Policy",
  cmd as "Operação"
FROM pg_policies
WHERE tablename = 'ai_logs'
ORDER BY cmd;

