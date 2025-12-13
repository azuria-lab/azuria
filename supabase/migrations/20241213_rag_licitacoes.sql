-- Migration: RAG + Licitações - Vector Database e Tabelas
-- Descrição: Cria estrutura para RAG, monitoramento de portais e alertas
-- Versão: 1.0.0
-- Data: 2024

-- ============================================================================
-- 1. Habilitar extensão pgvector
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. Tabela de documentos indexados (RAG)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rag_documents (
  -- Identificação
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  
  -- Conteúdo
  content TEXT NOT NULL,
  embedding vector(768), -- Gemini embeddings têm dimensão 768
  
  -- Posição no documento
  chunk_index INTEGER NOT NULL,
  
  -- Metadados
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT rag_documents_document_chunk_idx UNIQUE (document_id, chunk_index)
);

-- Índice para busca vetorial (IVFFlat é mais rápido que HNSW para datasets pequenos)
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx 
ON rag_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índice para busca por tipo de documento
CREATE INDEX IF NOT EXISTS rag_documents_metadata_type_idx 
ON rag_documents 
USING gin ((metadata->'type'));

-- Índice para busca por tags
CREATE INDEX IF NOT EXISTS rag_documents_metadata_tags_idx 
ON rag_documents 
USING gin ((metadata->'tags'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rag_documents_updated_at
BEFORE UPDATE ON rag_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. Função de busca semântica por similaridade
-- ============================================================================

CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_type text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  document_id text,
  content text,
  chunk_index integer,
  metadata jsonb,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_documents.id,
    rag_documents.document_id,
    rag_documents.content,
    rag_documents.chunk_index,
    rag_documents.metadata,
    1 - (rag_documents.embedding <=> query_embedding) AS similarity
  FROM rag_documents
  WHERE 
    1 - (rag_documents.embedding <=> query_embedding) > match_threshold
    AND (filter_type IS NULL OR metadata->>'type' = filter_type)
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Tabela de portais de licitação
-- ============================================================================

CREATE TABLE IF NOT EXISTS portals (
  -- Identificação
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  
  -- Tipo
  type TEXT NOT NULL CHECK (type IN ('comprasnet', 'bll', 'licitacoes-e', 'municipal', 'estadual', 'custom')),
  
  -- Status
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Configurações de scraping
  scraping JSONB,
  
  -- Credenciais (encriptadas)
  credentials JSONB,
  
  -- Última sincronização
  last_sync_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portals_enabled_idx ON portals(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS portals_type_idx ON portals(type);

CREATE TRIGGER update_portals_updated_at
BEFORE UPDATE ON portals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Tabela de editais detectados
-- ============================================================================

CREATE TABLE IF NOT EXISTS detected_editais (
  -- Identificação
  id TEXT PRIMARY KEY,
  portal_id TEXT NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  
  -- Dados do edital
  numero TEXT NOT NULL,
  orgao TEXT NOT NULL,
  objeto TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  data_abertura TIMESTAMPTZ NOT NULL,
  data_limite TIMESTAMPTZ,
  valor_estimado NUMERIC(15, 2),
  url TEXT NOT NULL,
  
  -- Análise
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'analisado', 'interessante', 'ignorado')),
  relevance_score FLOAT DEFAULT 0,
  win_probability FLOAT,
  relevance_reasons TEXT[],
  
  -- Dados completos (JSON)
  full_data JSONB,
  
  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint única por edital
  CONSTRAINT detected_editais_unique_edital UNIQUE (numero, orgao)
);

CREATE INDEX IF NOT EXISTS detected_editais_portal_id_idx ON detected_editais(portal_id);
CREATE INDEX IF NOT EXISTS detected_editais_status_idx ON detected_editais(status);
CREATE INDEX IF NOT EXISTS detected_editais_data_abertura_idx ON detected_editais(data_abertura);
CREATE INDEX IF NOT EXISTS detected_editais_relevance_score_idx ON detected_editais(relevance_score DESC);

CREATE TRIGGER update_detected_editais_updated_at
BEFORE UPDATE ON detected_editais
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Tabela de perfis de interesse dos usuários
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_interest_profiles (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências
  keywords TEXT[] NOT NULL DEFAULT '{}',
  modalidades TEXT[],
  orgaos TEXT[],
  valor_min NUMERIC(15, 2),
  valor_max NUMERIC(15, 2),
  estados TEXT[],
  cidades TEXT[],
  categorias TEXT[],
  
  -- Características da empresa
  experience_level TEXT CHECK (experience_level IN ('iniciante', 'intermediario', 'avancado')),
  certificacoes TEXT[],
  
  -- Status
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Um perfil por usuário
  CONSTRAINT user_interest_profiles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS user_interest_profiles_user_id_idx ON user_interest_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_interest_profiles_enabled_idx ON user_interest_profiles(enabled) WHERE enabled = true;

CREATE TRIGGER update_user_interest_profiles_updated_at
BEFORE UPDATE ON user_interest_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Tabela de alertas
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
  -- Identificação
  id TEXT PRIMARY KEY,
  edital_id TEXT NOT NULL REFERENCES detected_editais(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conteúdo
  type TEXT NOT NULL CHECK (type IN ('novo_edital', 'prazo_proximo', 'alta_relevancia', 'baixa_concorrencia')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  
  -- Ações sugeridas
  suggested_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Status
  read BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON alerts(user_id);
CREATE INDEX IF NOT EXISTS alerts_edital_id_idx ON alerts(edital_id);
CREATE INDEX IF NOT EXISTS alerts_read_idx ON alerts(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS alerts_urgency_idx ON alerts(urgency);
CREATE INDEX IF NOT EXISTS alerts_created_at_idx ON alerts(created_at DESC);

-- ============================================================================
-- 8. Tabela de documentos processados (OCR/Multimodal)
-- ============================================================================

CREATE TABLE IF NOT EXISTS processed_documents (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Arquivo original
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT,
  
  -- Resultado do processamento
  document_type TEXT NOT NULL,
  full_text TEXT,
  extracted_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  extracted_tables JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence FLOAT NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  
  -- Metadados
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS processed_documents_user_id_idx ON processed_documents(user_id);
CREATE INDEX IF NOT EXISTS processed_documents_document_type_idx ON processed_documents(document_type);
CREATE INDEX IF NOT EXISTS processed_documents_status_idx ON processed_documents(status);
CREATE INDEX IF NOT EXISTS processed_documents_created_at_idx ON processed_documents(created_at DESC);

CREATE TRIGGER update_processed_documents_updated_at
BEFORE UPDATE ON processed_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Tabela de explicações XAI
-- ============================================================================

CREATE TABLE IF NOT EXISTS xai_explanations (
  -- Identificação
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de decisão
  decision_type TEXT NOT NULL CHECK (decision_type IN ('bdi_calculation', 'margin_suggestion', 'risk_assessment', 'compliance_check')),
  
  -- Resultado
  result JSONB NOT NULL,
  
  -- Fatores
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Explicação
  rationale TEXT NOT NULL,
  legal_basis JSONB NOT NULL DEFAULT '[]'::jsonb,
  alternatives JSONB,
  
  -- Metadados
  confidence FLOAT NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS xai_explanations_user_id_idx ON xai_explanations(user_id);
CREATE INDEX IF NOT EXISTS xai_explanations_decision_type_idx ON xai_explanations(decision_type);
CREATE INDEX IF NOT EXISTS xai_explanations_created_at_idx ON xai_explanations(created_at DESC);

-- ============================================================================
-- 10. Row Level Security (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE user_interest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_explanations ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê seus próprios dados

CREATE POLICY user_interest_profiles_policy ON user_interest_profiles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY alerts_policy ON alerts
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY processed_documents_policy ON processed_documents
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY xai_explanations_policy ON xai_explanations
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 11. Funções auxiliares
-- ============================================================================

-- Função para buscar alertas não lidos do usuário
CREATE OR REPLACE FUNCTION get_unread_alerts(p_user_id UUID)
RETURNS TABLE (
  id text,
  edital_numero text,
  type text,
  title text,
  message text,
  urgency text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    e.numero AS edital_numero,
    a.type,
    a.title,
    a.message,
    a.urgency,
    a.created_at
  FROM alerts a
  INNER JOIN detected_editais e ON a.edital_id = e.id
  WHERE a.user_id = p_user_id
    AND a.read = false
  ORDER BY 
    CASE a.urgency
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    a.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar alerta como lido
CREATE OR REPLACE FUNCTION mark_alert_read(p_alert_id TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE alerts
  SET read = true, read_at = NOW()
  WHERE id = p_alert_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de monitoramento
CREATE OR REPLACE FUNCTION get_monitoring_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_editais', COUNT(*),
    'editais_novos', COUNT(*) FILTER (WHERE status = 'novo'),
    'editais_interessantes', COUNT(*) FILTER (WHERE status = 'interessante'),
    'alertas_nao_lidos', (
      SELECT COUNT(*) FROM alerts 
      WHERE user_id = p_user_id AND read = false
    ),
    'alertas_criticos', (
      SELECT COUNT(*) FROM alerts 
      WHERE user_id = p_user_id AND read = false AND urgency = 'critical'
    )
  ) INTO result
  FROM detected_editais
  WHERE EXISTS (
    SELECT 1 FROM user_interest_profiles 
    WHERE user_id = p_user_id AND enabled = true
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. Dados de exemplo (legislação TCU)
-- ============================================================================

-- Inserir documentos base de legislação (para RAG)
-- Nota: Em produção, isso seria feito via script de seed separado

INSERT INTO rag_documents (id, document_id, content, embedding, chunk_index, metadata) VALUES
(
  'lei-8666-chunk-0',
  'lei-8666-1993',
  'Lei nº 8.666, de 21 de junho de 1993. Regulamenta o art. 37, inciso XXI, da Constituição Federal, institui normas para licitações e contratos da Administração Pública e dá outras providências. Art. 6º Para os fins desta Lei, considera-se: [...] XI - BDI - Benefícios e Despesas Indiretas: percentual sobre os custos diretos que contempla os custos indiretos (administração central, despesas financeiras, lucro, seguros, garantias e tributos incidentes sobre o preço de venda).',
  ARRAY(SELECT random() FROM generate_series(1, 768))::vector(768), -- Placeholder embedding
  0,
  '{"type": "legislation", "source": "Lei 8.666/1993", "title": "Lei de Licitações - Definição de BDI", "authority": "Congresso Nacional", "documentNumber": "Lei 8.666/1993", "tags": ["bdi", "licitacao", "definicao"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO rag_documents (id, document_id, content, embedding, chunk_index, metadata) VALUES
(
  'acordao-tcu-2622-chunk-0',
  'acordao-tcu-2622-2013',
  'Acórdão TCU nº 2.622/2013 - Plenário. Estabelece orientações a serem observadas na fiscalização de obras e serviços de engenharia. Recomenda que os percentuais de Administração Central variem entre 0,5% e 5,0% dos custos diretos; Despesas Financeiras entre 0,5% e 3,0%; Lucro entre 3,0% e 10,0%; Seguros e Garantias entre 0,1% e 1,5%.',
  ARRAY(SELECT random() FROM generate_series(1, 768))::vector(768),
  0,
  '{"type": "jurisprudence", "source": "Acórdão TCU 2622/2013", "title": "Orientações sobre composição de BDI", "authority": "TCU", "documentNumber": "2622/2013", "tags": ["bdi", "percentuais", "tcu", "orientacao"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 13. Comments (documentação)
-- ============================================================================

COMMENT ON TABLE rag_documents IS 'Documentos indexados para busca semântica (RAG)';
COMMENT ON TABLE portals IS 'Portais de licitação monitorados';
COMMENT ON TABLE detected_editais IS 'Editais detectados pelos agentes de monitoramento';
COMMENT ON TABLE user_interest_profiles IS 'Perfis de interesse dos usuários para filtragem de editais';
COMMENT ON TABLE alerts IS 'Alertas gerados para usuários sobre editais relevantes';
COMMENT ON TABLE processed_documents IS 'Documentos processados via OCR/Vision';
COMMENT ON TABLE xai_explanations IS 'Explicações de decisões de IA (Explainable AI)';

COMMENT ON FUNCTION search_documents IS 'Busca semântica usando similaridade de cosseno em embeddings';
COMMENT ON FUNCTION get_unread_alerts IS 'Retorna alertas não lidos do usuário ordenados por urgência';
COMMENT ON FUNCTION mark_alert_read IS 'Marca um alerta como lido';
COMMENT ON FUNCTION get_monitoring_stats IS 'Retorna estatísticas de monitoramento do usuário';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
