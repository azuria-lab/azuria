# ✅ Finalizar Configuração Mercado Pago - Webhooks (ETAPA 2/5)

**Status Atual**: ETAPA 2 DE 5 - Configurar Notificações  
**Aplicação**: Azuria (ID: 3611371522197021)  
**Tipo**: Assinaturas com plano associado

---

## 🎯 Objetivo

Configurar as notificações Webhooks no painel do Mercado Pago para receber atualizações sobre:
- Pagamentos de assinaturas
- Criação/atualização de assinaturas
- Pagamentos recorrentes

---

## 📋 Passo 1: Obter URL do Webhook

A URL do seu webhook no Supabase é:

```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook
```

**✅ Verificar se a Edge Function está deployada:**

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions
2. Procure por: `mercadopago-webhook`
3. Se não estiver deployada, execute:

```bash
supabase functions deploy mercadopago-webhook
```

---

## 🔧 Passo 2: Configurar Webhooks no Mercado Pago

### 2.1 Acessar Configuração de Webhooks

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione a aplicação **"Azuria"**
3. No menu lateral esquerdo, clique em: **"Webhooks"** → **"Configurar notificações"**

### 2.2 Configurar URLs

**URL Modo Teste:**
```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook
```

**URL Modo Produção:**
```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook
```

> **Nota**: Você pode usar a mesma URL para ambos os modos, ou criar URLs diferentes se necessário.

### 2.3 Selecionar Eventos (Tópicos)

Como sua aplicação é **"Assinaturas com plano associado"**, você precisa ativar os seguintes tópicos:

#### ✅ Tópicos Obrigatórios para Assinaturas:

1. **✅ Pagamentos** (`payment`)
   - Notifica sobre pagamentos associados às assinaturas
   - Status: aprovado, rejeitado, pendente, etc.

2. **✅ Planos e assinaturas** → **`subscription_preapproval_plan`**
   - Notifica sobre criação/atualização de planos de assinatura
   - Importante para assinaturas com planos associados

3. **✅ Planos e assinaturas** → **`subscription_preapproval`**
   - Notifica sobre criação/atualização de assinaturas
   - Status: autorizada, pausada, cancelada

4. **✅ Planos e assinaturas** → **`subscription_authorized_payment`**
   - Notifica sobre pagamentos recorrentes autorizados
   - Quando uma cobrança recorrente é processada

#### 📋 Tabela de Tópicos:

| Evento | Tópico | Quando é enviado |
|--------|--------|------------------|
| Criação/atualização de pagamentos | `payment` | Sempre que um pagamento muda de status |
| Vinculação de plano | `subscription_preapproval_plan` | Quando um plano é criado ou atualizado |
| Vinculação de assinatura | `subscription_preapproval` | Quando uma assinatura é criada ou atualizada |
| Pagamento recorrente | `subscription_authorized_payment` | Quando uma cobrança recorrente é autorizada |

### 2.4 Salvar Configuração

1. Após selecionar todos os tópicos, clique em **"Salvar"**
2. Uma **assinatura secreta** será gerada automaticamente
3. **Copie e guarde a assinatura secreta** (você precisará dela para validar as notificações)

---

## 🔒 Passo 3: Validar Assinatura do Webhook (Opcional mas Recomendado)

A Edge Function já está preparada para validar assinaturas. Para habilitar a validação completa:

1. Adicione a assinatura secreta como Secret no Supabase:
   - Dashboard → Settings → Edge Functions → Secrets
   - Nome: `MERCADOPAGO_WEBHOOK_SECRET`
   - Valor: (cole a assinatura secreta gerada)

2. Atualize a Edge Function para validar a assinatura (já implementado no código)

---

## ✅ Passo 4: Testar Webhook

### 4.1 Simular Notificação no Painel

1. No painel do Mercado Pago, após salvar a configuração
2. Clique em **"Simular"** (botão ao lado de "Salvar")
3. Selecione:
   - **URL**: Modo teste ou produção
   - **Tipo de evento**: `payment` ou `subscription_preapproval`
   - **ID**: Use um ID de teste (ex: `123456789`)
4. Clique em **"Enviar teste"**

### 4.2 Verificar Logs

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs
2. Verifique se a notificação foi recebida
3. Procure por logs como:
   ```
   Webhook received: { type: 'payment', action: 'payment.created' }
   ```

---

## 📊 Passo 5: Verificar Próximas Etapas

Após configurar os webhooks, você estará na **ETAPA 3 DE 5**.

As próximas etapas geralmente são:
- **ETAPA 3**: Configurar credenciais de produção
- **ETAPA 4**: Testar integração completa
- **ETAPA 5**: Subir em produção

---

## 🎯 Checklist Final

- [ ] Edge Function `mercadopago-webhook` está deployada
- [ ] URLs de webhook configuradas (teste e produção)
- [ ] Tópico `payment` ativado
- [ ] Tópico `subscription_preapproval_plan` ativado
- [ ] Tópico `subscription_preapproval` ativado
- [ ] Tópico `subscription_authorized_payment` ativado
- [ ] Configuração salva no painel
- [ ] Assinatura secreta copiada e guardada
- [ ] Teste de simulação executado com sucesso
- [ ] Logs verificados no Supabase

---

## 🔍 Troubleshooting

### Problema: Webhook não recebe notificações

**Soluções:**
1. Verifique se a Edge Function está deployada
2. Verifique se a URL está correta (sem trailing slash)
3. Verifique se os tópicos estão selecionados
4. Verifique os logs do Supabase para erros

### Problema: Erro 401/403 ao receber webhook

**Soluções:**
1. Verifique se a assinatura secreta está configurada corretamente
2. Verifique se a validação de assinatura está implementada
3. Verifique os headers `x-signature` e `x-request-id`

### Problema: Notificações não processam corretamente

**Soluções:**
1. Verifique os logs da Edge Function
2. Verifique se o `external_reference` está sendo enviado corretamente
3. Verifique se a tabela `subscriptions` existe e está configurada

---

## 📚 Recursos Adicionais

- **Documentação Webhooks**: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks
- **Painel de Notificações**: https://www.mercadopago.com.br/developers/panel/app (seção Webhooks)
- **Logs Supabase**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs

---

**Última atualização**: Janeiro 2025  
**Status**: 🟡 Aguardando configuração

