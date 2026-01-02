# 🔍 Verificar Erro 401 - Checklist Completo

## ❌ Problema Persistente

O erro **401 Unauthorized** ainda aparece mesmo após:
- ✅ Remover `withSecurityMiddleware`
- ✅ Desabilitar JWT Verification
- ✅ Fazer deploy

## 🔍 Diagnóstico

O erro 401 pode estar vindo de:

1. **Supabase ainda exigindo JWT** (mesmo com toggle desabilitado)
2. **Cache do Supabase** (pode levar alguns minutos)
3. **Configuração não salva** no dashboard
4. **Outra validação** que não identificamos

---

## ✅ Checklist de Verificação

### 1. Verificar JWT Verification no Dashboard

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook
2. Vá na aba **"Details"**
3. Procure por **"Verify JWT with legacy secret"**
4. **DEVE estar DESABILITADO (OFF)** ⚠️
5. Se estiver ON, **desabilite e salve**
6. Aguarde 1-2 minutos para propagar

### 2. Verificar Logs Detalhados

Após o deploy mais recente, os logs devem mostrar:

```
INFO: Webhook request received: {
  method: "POST",
  url: "...",
  hasAuth: false,
  hasApiKey: false,
  origin: "none",
  userAgent: "..."
}
INFO: Processing POST request...
```

**Se NÃO aparecer "Processing POST request..."**, significa que o Supabase está bloqueando antes de chegar ao nosso código.

### 3. Verificar Invocações

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/invocations
2. Clique na invocação mais recente
3. Verifique:
   - **Status**: Se for 401, veja os detalhes
   - **Request Headers**: Verifique se há `Authorization` ou `apikey`
   - **Response**: Veja a mensagem de erro

### 4. Testar Diretamente com cURL

Teste a função diretamente para ver se o problema é do Mercado Pago ou do Supabase:

```bash
curl -X POST \
  'https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data": {"id": "123456"},
    "id": "123456",
    "live_mode": false,
    "user_id": 253590159
  }'
```

**Resultado esperado:**
- ✅ `200 OK` com `{"success": true, "message": "Test notification received...", "test": true}`
- ❌ Se der `401`, o problema é do Supabase

---

## 🔧 Soluções Alternativas

### Solução 1: Usar anon key no header (Workaround)

Se o Supabase ainda exigir autenticação, podemos adicionar o anon key:

```bash
curl -X POST \
  'https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{...}'
```

Mas isso **NÃO é ideal** porque o Mercado Pago não envia esses headers.

### Solução 2: Verificar se há outra função com mesmo nome

1. Verifique se há múltiplas versões da função
2. Delete versões antigas se houver
3. Faça deploy novamente

### Solução 3: Criar função do zero

Se nada funcionar:
1. Delete a função atual
2. Crie uma nova com o mesmo nome
3. Configure JWT como desabilitado desde o início
4. Faça deploy

---

## 📊 Logs Esperados (Sucesso)

Se tudo estiver funcionando, você deve ver:

```
INFO: Webhook request received: { method: "POST", ... }
INFO: Processing POST request...
INFO: Webhook received: { type: "payment", action: "payment.updated" }
INFO: Test notification received, skipping payment lookup: 123456
```

---

## 🎯 Próximos Passos

1. ✅ Verificar JWT Verification no dashboard (DEVE estar OFF)
2. ✅ Aguardar 2-3 minutos após desabilitar
3. ✅ Testar novamente no painel do Mercado Pago
4. ✅ Verificar logs detalhados
5. ✅ Se ainda falhar, testar com cURL direto

---

**Última atualização**: 01/01/2025

