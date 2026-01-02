# 🔧 Corrigir Erro "Invalid authentication token"

## ❌ Problema

Erro nos logs:
```
ERROR: Invalid authentication token
at validateAuth (file:///Projects/azuria/supabase/functions/_shared/utils.ts:30:11)
```

## 🔍 Causa

A função `validateAuth` estava usando `SUPABASE_SERVICE_ROLE_KEY` para validar o token JWT do usuário, mas precisa usar `SUPABASE_ANON_KEY`.

**Por quê?**
- `SERVICE_ROLE_KEY` bypassa validação de JWT
- `ANON_KEY` valida corretamente tokens JWT de usuários
- Para validar usuário, precisamos usar `ANON_KEY`
- Para operações no banco, usamos `SERVICE_ROLE_KEY`

## ✅ Solução Aplicada

A função `validateAuth` foi corrigida para:
1. Usar `SUPABASE_ANON_KEY` para validar o token JWT
2. Retornar cliente com `SERVICE_ROLE_KEY` para operações no banco

## 🔑 Verificar Secrets

Certifique-se de que estas secrets estão configuradas no Supabase:

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá em **"Secrets"**
3. Verifique se existem:
   - ✅ `SUPABASE_URL` (geralmente automático)
   - ✅ `SUPABASE_ANON_KEY` (geralmente automático)
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` (geralmente automático)
   - ✅ `MERCADOPAGO_ACCESS_TOKEN` (você configurou)

**Se `SUPABASE_ANON_KEY` não estiver configurada:**

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/api
2. Copie a **"anon public"** key
3. Volte em **Settings → Functions → Secrets**
4. Adicione nova secret:
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: Cole a anon key copiada
5. Salve

## 🧪 Testar Novamente

1. Acesse: https://azuria.app.br/planos
2. Faça login (se necessário)
3. Selecione um plano
4. Clique em "Começar agora"
5. Deve funcionar agora!

## 📊 Verificar Logs

Se ainda der erro, verifique os logs:

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/create-subscription/logs
2. Procure por:
   - `=== CREATE SUBSCRIPTION START ===`
   - `User authenticated: [user-id]` (se funcionou)
   - `Auth validation error:` (se ainda falhar)

---

**Última atualização**: 01/01/2025

