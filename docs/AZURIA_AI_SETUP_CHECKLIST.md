# ✅ CHECKLIST DE CONFIGURAÇÃO - AZURIA AI

## 📋 ETAPAS OBRIGATÓRIAS

### **1. Obter Gemini API Key** 🔑

- [ ] Acessar: https://aistudio.google.com/app/apikey
- [ ] Fazer login com Google Account
- [ ] Criar nova API Key (FREE)
- [ ] Copiar a chave gerada

---

### **2. Configurar Supabase Edge Function** 🚀

#### **2.1. Adicionar Secret**

No Supabase Dashboard:

1. Acesse: **Project Settings** → **Edge Functions** → **Secrets**
2. Adicione o secret:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `sua_chave_copiada_aqui`

#### **2.2. Deploy da Function**

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Link ao projeto (se não estiver linkado)
supabase link --project-ref SEU_PROJECT_ID

# Deploy da Edge Function
supabase functions deploy azuria-chat
```

**Ou via Dashboard**:

1. Acesse: **Edge Functions** → **Deploy new function**
2. Nome: `azuria-chat`
3. Cole o código de `supabase/functions/azuria-chat/index.ts`
4. Deploy

---

### **3. Criar Tabela ai_logs** 💾

#### **Opção A: Via Supabase CLI**

```bash
supabase db push
```

#### **Opção B: Via SQL Editor**

1. Acesse: **SQL Editor** no Supabase Dashboard
2. Cole o conteúdo de: `supabase/migrations/20240120_create_ai_logs.sql`
3. Run

**Conteúdo do SQL**:

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

### **4. Verificar Instalação de Dependências** 📦

```bash
# Garantir que react-markdown está instalado
npm install

# Se houver erro, reinstalar
npm install react-markdown --save
```

---

### **5. Testar a Aplicação** 🧪

#### **5.1. Iniciar Dev Server**

```bash
npm run dev
```

#### **5.2. Acessar Azuria**

1. Abra: `http://localhost:5173/azuria`
2. Faça login (se necessário)
3. Envie uma mensagem de teste:
   - "Olá, Azuria!"
   - "Sugira um preço para meu produto"
   - "Analise meu regime tributário"

#### **5.3. Verificar Console**

- ✅ Não deve haver erros no console do navegador
- ✅ A resposta deve aparecer em ~2-3 segundos
- ✅ O histórico deve persistir ao recarregar

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### **Erro: "GEMINI_API_KEY não encontrada"**

**Solução**:
1. Verificar se secret foi criado corretamente no Supabase
2. Redeployar a Edge Function após adicionar o secret

### **Erro: "Tabela ai_logs não existe"**

**Solução**:
1. Executar a migration SQL manualmente
2. Verificar se está no projeto correto do Supabase

### **Erro: "Authorization header missing"**

**Solução**:
1. Fazer login na aplicação
2. Verificar se token está sendo enviado (`supabase.auth.getSession()`)

### **Chat não responde**

**Solução**:
1. Abrir **DevTools** → **Network** → Filtrar por `azuria-chat`
2. Verificar status da requisição (200 = OK, 500 = erro)
3. Verificar logs da Edge Function: `supabase functions logs azuria-chat`

---

## 📊 VERIFICAÇÃO FINAL

- [ ] Gemini API Key configurada
- [ ] Edge Function deployada
- [ ] Tabela `ai_logs` criada
- [ ] Políticas RLS ativas
- [ ] `react-markdown` instalado
- [ ] Rota `/azuria` acessível
- [ ] Chat responde a mensagens
- [ ] Histórico persiste no localStorage
- [ ] Logs salvos no Supabase (verificar tabela `ai_logs`)

---

## 🎉 PRONTO!

Se todos os itens acima estão ✅, a **Azuria AI está 100% funcional**!

Acesse: `http://localhost:5173/azuria` e comece a usar! 🚀

---

## 📞 PRECISA DE AJUDA?

- 📖 Leia: `AZURIA_AI_IMPLEMENTATION.md` (documentação completa)
- 🐛 Verifique: Console do navegador e logs da Edge Function
- 💬 Contato: [seu-email@azuria.com]

---

**Boa sorte! A Azuria está ansiosa para conversar! 🤖💙**

