# 🔑 Configurar MERCADOPAGO_ACCESS_TOKEN no Supabase

## ❌ Erro Atual

```
ERROR: MERCADOPAGO_ACCESS_TOKEN not configured
```

## ✅ Solução

Adicionar a variável de ambiente `MERCADOPAGO_ACCESS_TOKEN` como Secret no Supabase.

---

## 📋 Passo a Passo

### 1. Obter Access Token do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione a aplicação **"Azuria"**
3. Vá em: **TESTES** → **Credenciais de teste**
4. Copie o **Access Token** (formato: `TEST-xxxxx...`)

> **Nota**: Para produção, use as credenciais de **PRODUÇÃO** → **Credenciais de produção**

### 2. Adicionar Secret no Supabase

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá na seção **"Secrets"**
3. Clique em **"Add new secret"**
4. Configure:
   - **Name**: `MERCADOPAGO_ACCESS_TOKEN`
   - **Value**: Cole o Access Token copiado (ex: `TEST-xxxxx...`)
5. Clique em **"Save"**

### 3. Verificar Outras Secrets Necessárias

Certifique-se de que estas secrets também estão configuradas:

- ✅ `MERCADOPAGO_ACCESS_TOKEN` ← **ADICIONAR AGORA**
- ✅ `MERCADOPAGO_WEBHOOK_SECRET` (já configurada)
- ✅ `SUPABASE_URL` (geralmente já configurada automaticamente)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (geralmente já configurada automaticamente)

### 4. Fazer Redeploy (Opcional)

Após adicionar a secret, a função deve pegar automaticamente. Se necessário:

```bash
supabase functions deploy mercadopago-webhook
```

### 5. Testar Novamente

1. No painel do Mercado Pago, clique em **"Simular notificação"**
2. Verifique os logs no Supabase
3. Não deve mais aparecer o erro `MERCADOPAGO_ACCESS_TOKEN not configured`

---

## 🔍 Verificar se Está Funcionando

### Via Logs do Supabase

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs
2. Procure por:
   - ✅ `Webhook received: { type: "payment", action: "payment.updated" }`
   - ✅ `Payment processed: { status: "...", external_reference: "..." }`
   - ❌ Não deve aparecer: `MERCADOPAGO_ACCESS_TOKEN not configured`

### Via Teste no Mercado Pago

1. Painel do Mercado Pago → Webhooks → Simular notificação
2. Deve retornar **200 - OK**
3. Verificar logs para confirmar processamento

---

## 📝 Notas Importantes

### Access Token de Teste vs Produção

- **Teste**: `TEST-xxxxx...` (para desenvolvimento)
- **Produção**: `APP_USR-xxxxx...` (para produção)

### Segurança

- ⚠️ **NUNCA** commite o Access Token no código
- ⚠️ Use apenas Secrets do Supabase
- ⚠️ Mantenha tokens de teste e produção separados

### Rotação de Tokens

Se precisar rotacionar o token:
1. Gerar novo token no Mercado Pago
2. Atualizar a secret no Supabase
3. A função pegará automaticamente o novo valor

---

## ✅ Checklist

- [ ] Access Token obtido do Mercado Pago
- [ ] Secret `MERCADOPAGO_ACCESS_TOKEN` adicionada no Supabase
- [ ] Valor verificado (não está vazio)
- [ ] Teste executado no painel do Mercado Pago
- [ ] Logs verificados (sem erro de token)
- [ ] Webhook processando corretamente

---

## 🔗 Links Úteis

- **Supabase Secrets**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
- **Mercado Pago Credentials**: https://www.mercadopago.com.br/developers/panel/app
- **Logs Webhook**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs

---

**Última atualização**: 01/01/2025

