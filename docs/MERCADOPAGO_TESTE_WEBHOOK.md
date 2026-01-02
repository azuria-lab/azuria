# 🧪 Teste do Webhook Mercado Pago

**Status**: ✅ Edge Function deployada  
**URL**: `https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook`  
**Data**: 01/01/2025

---

## ✅ Deploy Concluído

A Edge Function `mercadopago-webhook` foi deployada com sucesso!

**Tamanho do script**: 78.63kB  
**Dashboard**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions

---

## 🧪 Métodos de Teste

### Método 1: Simulação via Painel do Mercado Pago (Recomendado)

1. **Acesse o painel:**
   - https://www.mercadopago.com.br/developers/panel/app
   - Selecione a aplicação **"Azuria"**
   - Vá em: **Webhooks** → **Configurar notificações**

2. **Clique em "Simular notificação"**

3. **Configure a simulação:**
   - **URL**: Selecione "Modo de teste" ou "Modo de produção"
   - **Tipo de evento**: Selecione `payment`
   - **ID**: Use um ID de teste (ex: `123456789`)

4. **Clique em "Enviar teste"**

5. **Verifique os logs:**
   - Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs
   - Procure por: `Webhook received: { type: 'payment', action: 'payment.created' }`

---

### Método 2: Criar Pagamento de Teste

1. **Use cartões de teste do Mercado Pago:**

   **Cartão Aprovado:**
   - Número: `5031 4332 1540 6351`
   - CVV: `123`
   - Validade: Qualquer data futura
   - Nome: Qualquer nome

   **Cartão Recusado:**
   - Número: `5031 4332 1540 6353`
   - CVV: `123`
   - Validade: Qualquer data futura

2. **Crie uma assinatura de teste:**
   - Acesse a página de planos no seu app
   - Selecione um plano
   - Complete o checkout com o cartão de teste
   - O webhook será disparado automaticamente após o pagamento

3. **Aguarde 30-60 segundos** para o webhook ser processado

4. **Verifique os logs** no Supabase

---

### Método 3: Teste Manual com cURL

```bash
# Substitua PAYMENT_ID por um ID de pagamento real do Mercado Pago
curl -X POST https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=test_signature" \
  -H "x-request-id: test-request-id" \
  -d '{
    "id": 12345,
    "live_mode": false,
    "type": "payment",
    "date_created": "2025-01-01T15:00:00.000-03:00",
    "user_id": 253590159,
    "api_version": "v1",
    "action": "payment.created",
    "data": {
      "id": "PAYMENT_ID"
    }
  }'
```

> **Nota**: Este método requer um `PAYMENT_ID` válido do Mercado Pago.

---

## 📊 Verificar Logs

### Via Dashboard Supabase

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs
2. Filtre por data/hora recente
3. Procure por:
   - `Webhook received: { type: 'payment', action: 'payment.created' }`
   - `Payment processed: { status: 'approved', external_reference: '...' }`
   - `Subscription activated: user ...`

### Via CLI

```bash
supabase functions logs mercadopago-webhook --limit 20
```

---

## ✅ Checklist de Teste

### Teste Básico
- [ ] Webhook recebe notificação (verificar logs)
- [ ] Resposta HTTP 200 OK
- [ ] Log mostra tipo e ação do evento

### Teste de Pagamento Aprovado
- [ ] Criar pagamento de teste aprovado
- [ ] Webhook recebe notificação
- [ ] Assinatura atualizada para `active` no banco
- [ ] `current_period_start` e `current_period_end` definidos
- [ ] `usage_tracking` criado/atualizado

### Teste de Pagamento Pendente
- [ ] Criar pagamento pendente (PIX, boleto)
- [ ] Webhook recebe notificação
- [ ] Assinatura atualizada para `incomplete`
- [ ] Log mostra status `pending`

### Teste de Pagamento Rejeitado
- [ ] Criar pagamento rejeitado (cartão recusado)
- [ ] Webhook recebe notificação
- [ ] Assinatura atualizada para `incomplete_expired`
- [ ] Log mostra status `rejected`

### Teste de Reembolso
- [ ] Processar reembolso de um pagamento
- [ ] Webhook recebe notificação
- [ ] Assinatura atualizada para `canceled`
- [ ] `plan_change_history` registrado

---

## 🔍 O que Verificar nos Logs

### Logs Esperados (Sucesso)

```
Webhook received: { type: 'payment', action: 'payment.created' }
Payment processed: { status: 'approved', external_reference: 'user_123_...' }
Subscription activated: user user_123
```

### Logs de Erro (Problemas)

```
Error: External reference not found in payment
Error: Subscription not found for user ...
Error: Supabase credentials not configured
```

---

## 🐛 Troubleshooting

### Webhook não recebe notificações

1. **Verifique se a URL está correta:**
   - Deve ser: `https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook`
   - Sem trailing slash `/` no final

2. **Verifique se os tópicos estão ativados:**
   - `payment` ✅
   - `subscription_preapproval` ✅
   - `subscription_preapproval_plan` ✅
   - `subscription_authorized_payment` ✅

3. **Verifique se a Edge Function está deployada:**
   ```bash
   supabase functions list
   ```

### Erro 401/403

- Verifique se a assinatura secreta está configurada corretamente
- Verifique os headers `x-signature` e `x-request-id`

### Erro 500 (Internal Server Error)

1. Verifique os logs detalhados no Supabase
2. Verifique se as variáveis de ambiente estão configuradas:
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MERCADOPAGO_WEBHOOK_SECRET` (opcional)

### Notificação recebida mas não processa

1. Verifique se o `external_reference` está no formato correto: `user_id_...`
2. Verifique se a assinatura existe no banco de dados
3. Verifique se a tabela `subscriptions` tem os campos necessários

---

## 📈 Próximos Passos Após Testes

1. ✅ Testar todos os cenários acima
2. ✅ Verificar logs para garantir processamento correto
3. ✅ Testar com pagamentos reais em modo sandbox
4. ✅ Validar atualizações no banco de dados
5. ✅ Preparar para produção

---

## 🔗 Links Úteis

- **Logs Supabase**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs
- **Painel Mercado Pago**: https://www.mercadopago.com.br/developers/panel/app
- **Documentação Webhooks**: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks
- **Cartões de Teste**: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/test-cards

---

**Última atualização**: 01/01/2025  
**Status**: 🟢 Pronto para testes

