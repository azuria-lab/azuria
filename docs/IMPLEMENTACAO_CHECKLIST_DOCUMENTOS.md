# 📄 IMPLEMENTAÇÃO DO MÓDULO DE DOCUMENTOS

## 🎯 OBJETIVO

Criar sistema completo de gerenciamento de documentos para licitações, incluindo upload, vencimento, alertas e organização por categorias.

---

## ✅ FASE 1: INFRAESTRUTURA (CONCLUÍDA)

### **1.1 Database Schema**

```sql
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  categoria VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  numero VARCHAR(100),
  orgao_emissor VARCHAR(255),
  data_emissao DATE,
  data_validade DATE,
  arquivo_url TEXT,
  arquivo_nome VARCHAR(255),
  arquivo_tamanho INTEGER,
  status VARCHAR(20) DEFAULT 'ativo',
  observacoes TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documentos_user_id ON documentos(user_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo);
CREATE INDEX idx_documentos_data_validade ON documentos(data_validade);
CREATE INDEX idx_documentos_status ON documentos(status);
```

### **1.2 Row Level Security**

```sql
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view own documents
CREATE POLICY "Users can view own documents"
  ON documentos FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create own documents
CREATE POLICY "Users can create own documents"
  ON documentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update own documents
CREATE POLICY "Users can update own documents"
  ON documentos FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can delete own documents
CREATE POLICY "Users can delete own documents"
  ON documentos FOR DELETE
  USING (auth.uid() = user_id);
```

### **1.3 Triggers**

```sql
-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### **1.4 Storage Bucket**

```typescript
// Criar bucket para documentos
const { data, error } = await supabase
  .storage
  .createBucket('documentos', {
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  });
```

### **1.5 Storage Policies**

```sql
-- SELECT: Users can view own files
CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- INSERT: Users can upload own files
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE: Users can delete own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🚧 FASE 2: TIPOS E INTERFACES (CONCLUÍDA)

### **2.1 Types**

```typescript
// src/types/documento.ts
export enum TipoDocumento {
  // Certidões Negativas
  CND_FEDERAL = 'cnd_federal',
  CND_ESTADUAL = 'cnd_estadual',
  CND_MUNICIPAL = 'cnd_municipal',
  CND_TRABALHISTA = 'cnd_trabalhista',
  CNDT = 'cndt',
  
  // Documentos Empresariais
  CONTRATO_SOCIAL = 'contrato_social',
  CNPJ = 'cnpj',
  INSCRICAO_ESTADUAL = 'inscricao_estadual',
  INSCRICAO_MUNICIPAL = 'inscricao_municipal',
  
  // Habilitação Técnica
  ATESTADO_CAPACIDADE = 'atestado_capacidade',
  CERTIDAO_REGISTRO = 'certidao_registro',
  ALVARA_FUNCIONAMENTO = 'alvara_funcionamento',
  
  // Outros
  PROCURACAO = 'procuracao',
  DECLARACAO = 'declaracao',
  OUTRO = 'outro',
}

export enum StatusDocumento {
  ATIVO = 'ativo',
  VENCIDO = 'vencido',
  PROXIMO_VENCIMENTO = 'proximo_vencimento',
  ARQUIVADO = 'arquivado',
}

export interface Documento {
  id: string;
  user_id: string;
  tipo: TipoDocumento;
  categoria?: string;
  nome: string;
  numero?: string;
  orgao_emissor?: string;
  data_emissao?: string;
  data_validade?: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  arquivo_tamanho?: number;
  status: StatusDocumento;
  observacoes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

---

## 📋 FASE 3: COMPONENTES (EM DESENVOLVIMENTO)

### **3.1 DocumentUploader**

```typescript
// src/components/documentos/DocumentUploader.tsx
interface DocumentUploaderProps {
  onUploadComplete: (documento: Documento) => void;
  tipo?: TipoDocumento;
}

export function DocumentUploader({ onUploadComplete, tipo }: DocumentUploaderProps) {
  const handleFileSelect = async (file: File) => {
    // 1. Upload para Supabase Storage
    // 2. Criar registro na tabela documentos
    // 3. Callback com documento criado
  };
  
  return (
    <div className="border-2 border-dashed rounded-lg p-8">
      <input type="file" accept=".pdf,.jpg,.png,.doc,.docx" />
      <p>Arraste arquivos ou clique para selecionar</p>
    </div>
  );
}
```

### **3.2 DocumentChecklist**

```typescript
// src/components/documentos/DocumentChecklist.tsx
interface ChecklistItem {
  tipo: TipoDocumento;
  nome: string;
  obrigatorio: boolean;
  documento?: Documento;
}

export function DocumentChecklist() {
  const items: ChecklistItem[] = [
    {
      tipo: TipoDocumento.CND_FEDERAL,
      nome: 'Certidão Negativa de Débitos Federais',
      obrigatorio: true,
    },
    // ...
  ];
  
  return (
    <div className="space-y-4">
      {items.map(item => (
        <ChecklistItemCard
          key={item.tipo}
          item={item}
          onUpload={handleUpload}
        />
      ))}
    </div>
  );
}
```

### **3.3 DocumentCard**

```typescript
// src/components/documentos/DocumentCard.tsx
interface DocumentCardProps {
  documento: Documento;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function DocumentCard({ documento, onDelete, onDownload }: DocumentCardProps) {
  const diasParaVencer = calcularDiasParaVencer(documento.data_validade);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{documento.nome}</CardTitle>
            <CardDescription>
              {documento.numero} • {documento.orgao_emissor}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(diasParaVencer)}>
            {getStatusLabel(diasParaVencer)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Validade: {formatDate(documento.data_validade)}</span>
          <span>Vence em {diasParaVencer} dias</span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={() => onDownload(documento.id)}>
            <Download /> Baixar
          </Button>
          <Button variant="destructive" onClick={() => onDelete(documento.id)}>
            <Trash /> Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **3.4 AlertaVencimento**

```typescript
// src/components/documentos/AlertaVencimento.tsx
export function AlertaVencimento() {
  const documentosProximosVencimento = useDocumentosProximosVencimento(30);
  
  if (documentosProximosVencimento.length === 0) {
    return null;
  }
  
  return (
    <Alert variant="warning">
      <AlertCircle />
      <AlertTitle>Documentos Próximos do Vencimento</AlertTitle>
      <AlertDescription>
        Você tem {documentosProximosVencimento.length} documento(s) que vencem nos próximos 30 dias.
      </AlertDescription>
      
      <div className="mt-4 space-y-2">
        {documentosProximosVencimento.map(doc => (
          <div key={doc.id} className="flex justify-between items-center">
            <span>{doc.nome}</span>
            <Badge variant="warning">
              Vence em {calcularDiasParaVencer(doc.data_validade)} dias
            </Badge>
          </div>
        ))}
      </div>
    </Alert>
  );
}
```

---

## 🔧 FASE 4: HOOKS E SERVIÇOS

### **4.1 useDocumentos**

```typescript
// src/hooks/useDocumentos.ts
export function useDocumentos() {
  const { data: documentos, isLoading, error } = useQuery({
    queryKey: ['documentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Documento[];
    },
  });
  
  const uploadDocumento = useMutation({
    mutationFn: async (params: UploadDocumentoParams) => {
      // 1. Upload arquivo
      const filePath = `${params.userId}/${params.file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, params.file);
      
      if (uploadError) throw uploadError;
      
      // 2. Criar registro
      const { data, error } = await supabase
        .from('documentos')
        .insert([{
          user_id: params.userId,
          tipo: params.tipo,
          nome: params.nome,
          arquivo_url: fileData.path,
          arquivo_nome: params.file.name,
          arquivo_tamanho: params.file.size,
          // ...
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
  
  return {
    documentos,
    isLoading,
    error,
    uploadDocumento,
  };
}
```

### **4.2 useAlertasVencimento**

```typescript
// src/hooks/useAlertasVencimento.ts
export function useAlertasVencimento(diasAntecedencia: number = 30) {
  return useQuery({
    queryKey: ['alertas-vencimento', diasAntecedencia],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);
      
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .lte('data_validade', dataLimite.toISOString())
        .eq('status', 'ativo');
      
      if (error) throw error;
      return data as Documento[];
    },
    refetchInterval: 1000 * 60 * 60, // Atualiza a cada hora
  });
}
```

---

## 📧 FASE 5: SISTEMA DE ALERTAS

### **5.1 Edge Function: Enviar Alertas**

```typescript
// supabase/functions/enviar-alertas-vencimento/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  
  // Buscar documentos que vencem em 30, 15, 7 e 1 dia(s)
  const diasAlerta = [30, 15, 7, 1];
  
  for (const dias of diasAlerta) {
    const dataAlerta = new Date();
    dataAlerta.setDate(dataAlerta.getDate() + dias);
    
    const { data: documentos } = await supabase
      .from('documentos')
      .select('*, user:auth.users(email)')
      .eq('data_validade', dataAlerta.toISOString().split('T')[0]);
    
    // Enviar email para cada documento
    for (const doc of documentos) {
      await enviarEmail({
        to: doc.user.email,
        subject: `Documento "${doc.nome}" vence em ${dias} dia(s)`,
        body: `Seu documento ${doc.nome} vencerá em ${dias} dia(s). Acesse o Azuria para renovar.`,
      });
    }
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### **5.2 Cron Job**

```sql
-- Executar diariamente às 8h
SELECT cron.schedule(
  'enviar-alertas-vencimento',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT.supabase.co/functions/v1/enviar-alertas-vencimento',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Infraestrutura**
- [x] Tabela `documentos` criada
- [x] RLS policies configuradas
- [x] Triggers de auditoria
- [x] Storage bucket criado
- [x] Storage policies configuradas

### **Backend**
- [x] Types TypeScript criados
- [ ] Edge functions para alertas
- [ ] Cron jobs configurados
- [ ] Integração com email

### **Frontend**
- [x] Página básica criada
- [ ] Componente de upload
- [ ] Lista de documentos
- [ ] Filtros e busca
- [ ] Alertas de vencimento
- [ ] Download de arquivos

### **Testes**
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E

### **Documentação**
- [x] Documentação técnica
- [ ] Guia do usuário
- [ ] Vídeo tutorial

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar upload de arquivos** (Prioridade Alta)
2. **Criar sistema de alertas** (Prioridade Alta)
3. **Implementar OCR para extração de dados** (Prioridade Média)
4. **Adicionar histórico de renovações** (Prioridade Baixa)

---

**Status**: 🟡 Em Desenvolvimento (40% completo)  
**Última Atualização**: Janeiro 2025

