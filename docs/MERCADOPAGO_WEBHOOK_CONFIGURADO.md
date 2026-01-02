# ✅ Webhook Mercado Pago - Configurado via MCP

**Data de Configuração**: 01/01/2025  
**Método**: Mercado Pago MCP Server  
**Status**: ✅ Configurado com sucesso

---

## 🔗 URLs Configuradas

**Produção:**
```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook
```

**Sandbox/Teste:**
```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook
```

---

## 📋 Tópicos Ativados

✅ **payment** - Notificações de pagamentos  
✅ **subscription_preapproval** - Criação/atualização de assinaturas  
✅ **subscription_preapproval_plan** - Criação/atualização de planos  
✅ **subscription_authorized_payment** - Pagamentos recorrentes autorizados

---

## 🔐 Chave Secreta (Webhook Secret)

**⚠️ IMPORTANTE**: Esta chave é necessária para validar a autenticidade das notificações.

**Primeiros caracteres**: `966e7c8...`

**Para ver a chave completa:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione a aplicação "Azuria"
3. Vá em: **Webhooks** → **Configurar notificações**
4. A chave secreta estará visível no campo "Assinatura secreta"

---

## 🔧 Próximos Passos

### 1. Adicionar Secret no Supabase (Opcional mas Recomendado)

Para validar a assinatura dos webhooks, adicione a chave secreta completa como Secret no Supabase:

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá em **Secrets**
3. Clique em **"Add new secret"**
4. Nome: `MERCADOPAGO_WEBHOOK_SECRET`
5. Valor: (cole a chave secreta completa do painel do Mercado Pago)

### 2. Verificar Edge Function

A Edge Function `mercadopago-webhook` já está implementada e pronta para receber notificações.

**Localização**: `supabase/functions/mercadopago-webhook/index.ts`

### 3. Testar Webhook

Você pode testar o webhook de duas formas:

#### Opção A: Via Painel do Mercado Pago
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em: **Webhooks** → **Configurar notificações**
3. Clique em **"Simular notificação"**
4. Selecione o tipo de evento e um ID válido
5. Clique em **"Enviar teste"**

#### Opção B: Criar um pagamento de teste
1. Crie um pagamento de teste no Mercado Pago
2. O webhook será disparado automaticamente
3. Verifique os logs no Supabase

### 4. Verificar Logs

Acesse os logs da Edge Function:
```
https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/mercadopago-webhook/logs
```

---

## ✅ Checklist

- [x] Webhook configurado via MCP
- [x] URLs de produção e sandbox configuradas
- [x] Tópicos de notificação ativados
- [x] Chave secreta gerada
- [ ] Chave secreta adicionada no Supabase (opcional)
- [ ] Edge Function deployada
- [ ] Webhook testado
- [ ] Logs verificados

---

## 📊 Informações da Aplicação

**Application ID**: `3611371522197021`  
**Tipo**: Assinaturas com plano associado  
**Criado**: 2026-01-01T15:06:22Z  
**Atualizado**: 2026-01-01T15:06:22Z

---

## 🔍 Troubleshooting

### Webhook não recebe notificações

1. Verifique se a Edge Function está deployada:
   ```bash
   supabase functions deploy mercadopago-webhook
   ```

2. Verifique se a URL está acessível publicamente

3. Verifique os logs do Supabase para erros

### Erro ao validar assinatura

1. Verifique se a chave secreta está correta
2. Verifique se o header `x-signature` está sendo recebido
3. Consulte a documentação de validação de assinatura

---

**Configurado via**: Mercado Pago MCP Server  
**Última atualização**: 01/01/2025

