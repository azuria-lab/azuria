# 🔧 Corrigir Erro 401 - Webhook Mercado Pago

## ❌ Problema

O webhook está retornando **401 Unauthorized** mesmo após remover o middleware de segurança.

## 🔍 Causa Raiz

O Supabase Edge Functions **por padrão requerem autenticação JWT**. Para webhooks públicos, precisamos **desabilitar a verificação JWT** no dashboard.

## ✅ Solução

### Passo 1: Desabilitar JWT Verification no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook
2. Vá na aba **"Details"** ou **"Settings"**
3. Procure por **"Verify JWT"** ou **"JWT Verification"**
4. **Desabilite** a verificação JWT (toggle OFF)
5. Salve as alterações

### Passo 2: Verificar Configuração

A função já está configurada para aceitar requisições sem autenticação:

```typescript
// Serve handler - webhooks públicos não precisam de autenticação JWT
Deno.serve(async (req: Request): Promise<Response> => {
  // Aceitar apenas POST
  if (req.method !== 'POST') {
    return new Response(/* ... */, { status: 405 });
  }
  // ... processar webhook
});
```

### Passo 3: Fazer Deploy Novamente

```bash
supabase functions deploy mercadopago-webhook
```

### Passo 4: Testar

1. No painel do Mercado Pago, clique em **"Simular notificação"**
2. Verifique os logs no Supabase
3. Deve retornar **200 OK** agora

---

## 🔍 Alternativa: Verificar via Dashboard

Se não encontrar a opção "Verify JWT", verifique:

1. **Settings → Edge Functions → mercadopago-webhook**
2. Procure por configurações de **"Authentication"** ou **"Security"**
3. Ou verifique se há uma opção **"Public"** ou **"No Auth Required"**

---

## 📝 Nota Importante

Webhooks de serviços externos (Mercado Pago, Stripe, etc.) **NÃO devem** usar autenticação JWT porque:
- Eles não têm tokens JWT válidos
- A validação deve ser feita via **assinatura secreta** (x-signature)
- A segurança vem da validação HMAC, não de JWT

---

## ✅ Checklist

- [ ] JWT Verification desabilitada no dashboard
- [ ] Função deployada novamente
- [ ] Teste executado no painel do Mercado Pago
- [ ] Logs verificados (deve mostrar 200 OK)
- [ ] Webhook processando corretamente

---

**Última atualização**: 01/01/2025

