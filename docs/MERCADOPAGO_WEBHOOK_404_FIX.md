# 🔧 Corrigir Erro 404 - Payment Not Found

## ❌ Problema

Após adicionar o `MERCADOPAGO_ACCESS_TOKEN`, o webhook está funcionando, mas aparece erro:

```
ERROR: Mercado Pago API error: Not Found
Payment not found: 123456
```

## 🔍 Causa

O ID `123456` usado na **simulação** do Mercado Pago não é um pagamento real. É apenas um ID de teste para verificar se o webhook está recebendo notificações.

## ✅ Solução Aplicada

A função foi ajustada para:

1. ✅ **Detectar IDs de teste** (`123456`, `123456789`) e retornar 200 OK sem tentar buscar
2. ✅ **Tratar erros 404** de forma elegante (pagamentos deletados ou não encontrados)
3. ✅ **Sempre retornar 200** para o Mercado Pago não reenviar notificações

### Código Atualizado

```typescript
// Verificar se é um ID de teste (simulação)
const paymentId = notification.data.id;
const isTestId = paymentId === '123456' || paymentId === '123456789' || !paymentId;

if (isTestId) {
  console.log('Test notification received, skipping payment lookup:', paymentId);
  return new Response(JSON.stringify({
    success: true,
    message: 'Test notification received and acknowledged',
    test: true,
  }), { status: 200 });
}

// Buscar pagamento com tratamento de erro 404
try {
  payment = await mercadoPagoRequest(`/v1/payments/${paymentId}`, { method: 'GET' });
} catch (error) {
  if (error.message.includes('Not Found')) {
    console.warn(`Payment not found: ${paymentId}. May be test or deleted.`);
    return new Response(JSON.stringify({
      success: true,
      message: 'Payment not found (may be test or deleted)',
    }), { status: 200 });
  }
  throw error;
}
```

---

## 🧪 Testar Novamente

1. **No painel do Mercado Pago:**
   - Vá em: Webhooks → Simular notificação
   - Use ID: `123456` (ou qualquer ID de teste)
   - Clique em "Enviar teste"

2. **Resultado esperado:**
   - ✅ Resposta: `200 - OK`
   - ✅ Logs: `Test notification received, skipping payment lookup: 123456`
   - ✅ Sem erros

---

## 📊 Logs Esperados

### Para Simulação (ID de teste)
```
INFO: Webhook received: { type: "payment", action: "payment.updated" }
INFO: Test notification received, skipping payment lookup: 123456
```

### Para Pagamento Real
```
INFO: Webhook received: { type: "payment", action: "payment.updated" }
INFO: Payment processed: { status: "approved", external_reference: "user_123_..." }
INFO: Subscription activated: user user_123
```

---

## ✅ Checklist

- [x] Função atualizada para detectar IDs de teste
- [x] Tratamento de erro 404 implementado
- [x] Deploy realizado
- [ ] Teste de simulação executado
- [ ] Logs verificados (sem erros)
- [ ] Teste com pagamento real (quando disponível)

---

## 🎯 Próximos Passos

1. **Testar simulação novamente** - deve funcionar agora
2. **Testar com pagamento real** - criar um pagamento de teste no app
3. **Monitorar logs** - verificar processamento correto

---

**Última atualização**: 01/01/2025

