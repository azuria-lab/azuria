# 🔧 Erro "Auth session missing!" - Diagnóstico

## ❌ Erro

```
ERROR: Auth validation error: { 
  error: "Auth session missing!", 
  errorCode: 400, 
  hasUser: false, 
  authHeaderPresent: true 
}
```

## 🔍 Possíveis Causas

### 1. Token Expirado ou Inválido

O token JWT pode ter expirado. Tokens do Supabase expiram após um período.

**Solução:**
- Faça logout e login novamente no app
- Isso gerará um novo token JWT válido

### 2. SUPABASE_ANON_KEY Não Configurada

A secret `SUPABASE_ANON_KEY` pode não estar configurada nas Edge Functions.

**Verificar:**
1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá em **"Secrets"**
3. Verifique se existe `SUPABASE_ANON_KEY`

**Se não existir:**
1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/api
2. Copie a **"anon public"** key
3. Volte em **Settings → Functions → Secrets**
4. Adicione:
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: Cole a anon key
5. Salve

### 3. Token Não Está Sendo Enviado Corretamente

O frontend pode não estar enviando o token corretamente.

**Verificar:**
1. Abra o DevTools (F12)
2. Vá na aba **Network**
3. Tente criar uma assinatura
4. Procure pela requisição para `create-subscription`
5. Verifique o header **Authorization**
6. Deve ter: `Bearer eyJhbGciOiJIUzI1NiIs...`

### 4. Usuário Não Está Autenticado

O usuário pode não estar logado.

**Verificar:**
1. No app, verifique se está logado
2. Tente fazer logout e login novamente
3. Depois tente criar a assinatura

---

## 🧪 Teste Passo a Passo

### 1. Verificar Secrets

```bash
# Verificar se as secrets estão configuradas
# Acesse o dashboard e verifique manualmente
```

### 2. Fazer Logout e Login

1. No app, faça logout
2. Faça login novamente
3. Isso gerará um novo token JWT

### 3. Testar Novamente

1. Acesse: https://azuria.app.br/planos
2. Selecione um plano
3. Clique em "Começar agora"

### 4. Verificar Logs

Se ainda der erro, verifique os logs:

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/create-subscription/logs
2. Procure por:
   - `Auth validation error:` (mostra detalhes)
   - `User authenticated successfully:` (se funcionou)

---

## 🔑 Secrets Necessárias

Certifique-se de que estas secrets estão configuradas:

- ✅ `SUPABASE_URL` (geralmente automático)
- ✅ `SUPABASE_ANON_KEY` ← **VERIFICAR ESTA**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (geralmente automático)
- ✅ `MERCADOPAGO_ACCESS_TOKEN` (você configurou)

---

## 📊 Logs Detalhados

Os logs agora mostram:
- Se `SUPABASE_ANON_KEY` está configurada
- Tamanho do token
- Prefixo do token (primeiros 20 caracteres)
- Código de erro específico

Use essas informações para diagnosticar o problema.

---

**Última atualização**: 01/01/2025

