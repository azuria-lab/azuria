# 🚀 DEPLOY DA AZURIA AI - PASSO A PASSO

## ✅ ETAPA 1: Configurar Secret do Gemini (JÁ FEITO!)

Você já criou a API Key do Gemini! Agora precisa configurar o **nome correto** no Supabase:

### 🔧 Configuração do Secret

1. **Acesse**: Supabase Dashboard → Edge Functions → Secrets
2. **Adicione um novo secret** (ou edite o existente):
   - **Name**: `GEMINI_API_KEY` ← **DEVE SER EXATAMENTE ISSO!**
   - **Value**: `cole_a_chave_do_gemini_aqui`
3. **Salve**

> ⚠️ **IMPORTANTE**: O nome **DEVE ser** `GEMINI_API_KEY` (não "Azuria AI - Production")
> 
> A Edge Function busca especificamente por esse nome:
> ```typescript
> const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
> ```

---

## 📋 PRÓXIMAS ETAPAS

### **ETAPA 2: Deploy da Edge Function** 🚀

```bash
# Verificar se está logado no Supabase
supabase login

# Verificar projeto linkado
supabase status

# Se não estiver linkado, linkar ao projeto
supabase link --project-ref SEU_PROJECT_ID

# Deploy da Edge Function
supabase functions deploy azuria-chat
```

**OU via Dashboard**:
1. Acesse: Supabase Dashboard → Edge Functions
2. Clique em **"Deploy a new function"**
3. Nome: `azuria-chat`
4. Cole o código de `supabase/functions/azuria-chat/index.ts`
5. Deploy

---

### **ETAPA 3: Criar Tabela ai_logs** 💾

```bash
# Via CLI
supabase db push

# Ou via SQL Editor (copiar conteúdo abaixo)
```

**SQL para colar no SQL Editor**:

```sql
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
```

---

### **ETAPA 4: Testar!** 🧪

```bash
# Iniciar dev server
npm run dev

# Acessar: http://localhost:5173/azuria
# Enviar mensagem: "Olá, Azuria!"
```

---

## 🐛 VERIFICAÇÃO DE PROBLEMAS

### **Erro: "GEMINI_API_KEY não encontrada"**

✅ Verificar:
1. Secret foi criado com o nome **EXATO** `GEMINI_API_KEY`?
2. Valor da chave está correto?
3. Edge Function foi redeployada após adicionar o secret?

### **Erro: "Tabela ai_logs não existe"**

✅ Verificar:
1. Migration SQL foi executada?
2. Tabela existe no Supabase Dashboard → Database → Tables?

### **Chat não responde**

✅ Verificar:
1. Console do navegador (erros JS)?
2. Network tab → Filtrar por `azuria-chat` → Status 200?
3. Logs da Edge Function: `supabase functions logs azuria-chat`

---

## 📊 CHECKLIST FINAL

- [ ] Secret `GEMINI_API_KEY` configurado (nome EXATO!)
- [ ] Edge Function `azuria-chat` deployada
- [ ] Tabela `ai_logs` criada
- [ ] Políticas RLS ativas
- [ ] Dev server rodando (`npm run dev`)
- [ ] Rota `/azuria` acessível
- [ ] Chat responde a mensagens
- [ ] Histórico persiste no localStorage

---

**🎉 PRONTO! Quando terminar, a Azuria AI estará 100% funcional!**

