-- Migration: Criar tabelas para presets de maquininha e impostos
-- Data: 2024-12-14

-- Tabela de presets de maquininha
CREATE TABLE IF NOT EXISTS public.maquininha_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  maquininha_fornecedor TEXT DEFAULT 'manual',
  bandeira TEXT NOT NULL,
  parcelas_default INTEGER NOT NULL DEFAULT 1,
  taxas_por_parcela JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de presets de impostos
CREATE TABLE IF NOT EXISTS public.impostos_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  origem_uf TEXT NOT NULL,
  destino_uf TEXT,
  tipo_operacao TEXT NOT NULL CHECK (tipo_operacao IN ('interna', 'interestadual')),
  icms DECIMAL(5,2) NOT NULL DEFAULT 0,
  pis DECIMAL(5,2) NOT NULL DEFAULT 0,
  cofins DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de histórico de taxas aplicadas
CREATE TABLE IF NOT EXISTS public.taxas_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('maquininha', 'impostos')),
  valor_venda DECIMAL(12,2) NOT NULL,
  taxa_aplicada DECIMAL(5,2) NOT NULL,
  valor_recebido DECIMAL(12,2) NOT NULL,
  detalhes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_maquininha_presets_user_id ON public.maquininha_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_impostos_presets_user_id ON public.impostos_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_taxas_historico_user_id ON public.taxas_historico(user_id);
CREATE INDEX IF NOT EXISTS idx_taxas_historico_created_at ON public.taxas_historico(created_at DESC);

-- RLS Policies
ALTER TABLE public.maquininha_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impostos_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxas_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para maquininha_presets
CREATE POLICY "Users can view own maquininha presets"
  ON public.maquininha_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own maquininha presets"
  ON public.maquininha_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maquininha presets"
  ON public.maquininha_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own maquininha presets"
  ON public.maquininha_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para impostos_presets
CREATE POLICY "Users can view own impostos presets"
  ON public.impostos_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own impostos presets"
  ON public.impostos_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own impostos presets"
  ON public.impostos_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own impostos presets"
  ON public.impostos_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para taxas_historico
CREATE POLICY "Users can view own taxas historico"
  ON public.taxas_historico FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own taxas historico"
  ON public.taxas_historico FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own taxas historico"
  ON public.taxas_historico FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_maquininha_presets_updated_at ON public.maquininha_presets;
CREATE TRIGGER update_maquininha_presets_updated_at
  BEFORE UPDATE ON public.maquininha_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_impostos_presets_updated_at ON public.impostos_presets;
CREATE TRIGGER update_impostos_presets_updated_at
  BEFORE UPDATE ON public.impostos_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.maquininha_presets IS 'Presets de taxas de maquininha salvos pelos usuários';
COMMENT ON TABLE public.impostos_presets IS 'Presets de impostos salvos pelos usuários';
COMMENT ON TABLE public.taxas_historico IS 'Histórico de taxas aplicadas pelos usuários';
