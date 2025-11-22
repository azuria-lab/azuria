-- Tabela para logging de interações com Azuria AI
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session_id ON ai_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_message_type ON ai_logs(message_type);

-- RLS (Row Level Security)
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view their own AI logs"
  ON ai_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Permitir inserção de logs (via Edge Function com service role)
CREATE POLICY "Allow insert for authenticated users"
  ON ai_logs
  FOR INSERT
  WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE ai_logs IS 'Logs de interações com a Azuria AI';
COMMENT ON COLUMN ai_logs.user_id IS 'ID do usuário que interagiu com a IA';
COMMENT ON COLUMN ai_logs.session_id IS 'ID da sessão de conversa';
COMMENT ON COLUMN ai_logs.user_message IS 'Mensagem enviada pelo usuário';
COMMENT ON COLUMN ai_logs.ai_response IS 'Resposta gerada pela IA';
COMMENT ON COLUMN ai_logs.message_type IS 'Tipo da mensagem (text, pricing_suggestion, tax_analysis, etc)';
COMMENT ON COLUMN ai_logs.context IS 'Contexto da conversa (general, pricing, tax, competitor, etc)';
COMMENT ON COLUMN ai_logs.metadata IS 'Dados adicionais da interação (JSON)';

