# 🔄 Atualizar Credenciais de Produção no Supabase

## 📋 Passo a Passo

### 1. Copiar Access Token do Mercado Pago

1. Na página de **Credenciais de produção** do Mercado Pago
2. Encontre o campo **"Access Token"**
3. Clique no **ícone do olho** 👁️ para revelar o token
4. Clique no **ícone de copiar** 📋 para copiar
5. O token deve começar com `APP_USR-...`

### 2. Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Ou navegue: **Settings** → **Edge Functions** → **Secrets**

### 3. Atualizar Secret `MERCADOPAGO_ACCESS_TOKEN`

1. Na seção **"Secrets"**, encontre `MERCADOPAGO_ACCESS_TOKEN`
2. Clique em **"Edit"** (ou no ícone de edição)
3. **Cole** o Access Token de produção que você copiou:
   - Deve ser: `APP_USR-xxxxx...` (não `TEST-xxxxx...`)
4. Clique em **"Save"** ou **"Update"**

### 4. Verificar Outras Secrets (Opcional)

Certifique-se de que estas secrets também estão configuradas:

- ✅ `MERCADOPAGO_ACCESS_TOKEN` ← **ATUALIZAR AGORA** (único necessário do Mercado Pago)
- ✅ `MERCADOPAGO_WEBHOOK_SECRET` (já configurada)
- ✅ `SUPABASE_URL` (geralmente automático)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (geralmente automático)

### ⚠️ O que NÃO precisa cadastrar

- ❌ **Client ID** - Não é necessário (usado apenas para OAuth, que não usamos)
- ❌ **Client Secret** - Não é necessário (usado apenas para OAuth, que não usamos)
- ❌ **Public Key** - Não é necessário (removido do frontend, tudo no backend)

**Por quê?**
- Usamos apenas o **Access Token** diretamente nas Edge Functions
- Client ID/Secret são para fluxos OAuth, que não estamos usando
- A autenticação é feita via `Authorization: Bearer ${accessToken}`

### 5. Verificar se Está Funcionando

Após atualizar, teste:

1. Acesse: https://azuria.app.br/planos
2. Faça login
3. Selecione um plano
4. Clique em "Começar agora"
5. Deve redirecionar para checkout do Mercado Pago (produção)

---

## 🔍 Verificar Logs (Se Houver Erro)

### Via Dashboard

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/create-subscription/logs
2. Verifique os logs mais recentes
3. Procure por erros relacionados a:
   - `Invalid credentials`
   - `Unauthorized`
   - `MERCADOPAGO_ACCESS_TOKEN`

### Via CLI

```bash
# Ver logs da função
supabase functions logs create-subscription --limit 10
```

---

## ⚠️ Importante

### ✅ O que fazer

- ✅ Usar Access Token de **PRODUÇÃO** (`APP_USR-...`)
- ✅ Manter a secret segura (não compartilhar)
- ✅ Testar após atualizar

### ❌ O que NÃO fazer

- ❌ Não usar token de teste (`TEST-...`) em produção
- ❌ Não commitar o token no código
- ❌ Não compartilhar o token publicamente

---

## 📝 Checklist

- [ ] Access Token de produção copiado do Mercado Pago
- [ ] Secret `MERCADOPAGO_ACCESS_TOKEN` atualizada no Supabase
- [ ] Token verificado (começa com `APP_USR-...`)
- [ ] Teste realizado (criação de assinatura)
- [ ] Logs verificados (sem erros)

---

## 🔄 Reverter para Teste (Se Necessário)

Se precisar voltar para modo teste:

1. No Supabase Dashboard
2. Edite `MERCADOPAGO_ACCESS_TOKEN`
3. Substitua por token de teste: `TEST-xxxxx...`
4. Salve

---

**Última atualização**: 01/01/2025

