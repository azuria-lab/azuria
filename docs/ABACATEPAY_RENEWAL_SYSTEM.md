# Sistema de Renovação Automática - AbacatePay

## Visão Geral

O AbacatePay não possui suporte nativo a assinaturas recorrentes. Este documento descreve como implementamos um sistema de renovação manual que funciona como se fosse automático.

## Como Funciona

### 1. Criação da Primeira Cobrança

Quando um usuário cria uma assinatura pela primeira vez:
- A Edge Function `abacatepay-create-billing` cria uma cobrança no AbacatePay
- A cobrança é salva na tabela `abacatepay_billings`
- Se o usuário já tem uma subscription, ela é relacionada via `subscription_id`

### 2. Processamento do Pagamento

Quando o usuário paga a cobrança:
- O webhook `abacatepay-webhook` recebe o evento `billing.paid`
- Se for uma renovação (`subscription_id` existe), a subscription é renovada (período estendido)
- Se for uma nova assinatura, uma nova subscription é criada/ativada

### 3. Renovação Automática

3 dias antes da subscription expirar:
- Um cron job chama a Edge Function `abacatepay-renew-subscription`
- A função verifica todas as subscriptions que expiram em até 3 dias
- Para cada subscription, cria uma nova cobrança no AbacatePay
- O usuário recebe um link de pagamento para renovar

### 4. Pagamento da Renovação

Quando o usuário paga a cobrança de renovação:
- O webhook identifica que é uma renovação (via `subscription_id`)
- O período da subscription é estendido automaticamente
- A subscription permanece ativa

## Configuração

### 1. Aplicar Migration

```bash
# Aplicar migration que adiciona payment_provider e subscription_id
supabase db push
```

Ou aplicar manualmente:
```sql
-- Arquivo: supabase/migrations/20260101_add_abacatepay_subscription_support.sql
```

### 2. Deploy das Edge Functions

```bash
# Deploy da função de renovação
supabase functions deploy abacatepay-renew-subscription

# Deploy do webhook atualizado (se necessário)
supabase functions deploy abacatepay-webhook
```

### 3. Configurar Cron Job

No Supabase Dashboard, vá em **Database > Cron Jobs** e crie um novo cron job:

```sql
-- Executar diariamente às 02:00 UTC para verificar renovações
SELECT cron.schedule(
  'abacatepay-renew-subscriptions',
  '0 2 * * *',  -- Todos os dias às 02:00 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/abacatepay-renew-subscription',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object()
    ) AS request_id;
  $$
);
```

**Nota:** Substitua `YOUR_PROJECT` pelo seu projeto ID do Supabase.

### 4. Configurar Webhook no AbacatePay

No dashboard do AbacatePay:
1. Vá em **Configurações > Webhooks**
2. Adicione a URL: `https://YOUR_PROJECT.supabase.co/functions/v1/abacatepay-webhook`
3. Selecione os eventos:
   - `billing.paid` ✅ (essencial)
   - `billing.refunded` ✅
   - `billing.expired` ✅
   - `billing.created` (opcional)

## Estrutura do Banco de Dados

### Tabela `subscriptions`

Agora inclui a coluna `payment_provider`:
```sql
payment_provider TEXT CHECK (payment_provider IN ('stripe', 'mercadopago', 'abacatepay', NULL))
```

### Tabela `abacatepay_billings`

Agora inclui a coluna `subscription_id`:
```sql
subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL
```

## Fluxo de Renovação

```
┌─────────────────┐
│  3 dias antes   │
│   do vencimento │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Cron Job executa diariamente    │
│  abacatepay-renew-subscription   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Verifica subscriptions que      │
│  expiram em até 3 dias           │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Cria nova cobrança no           │
│  AbacatePay para cada uma        │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Usuário recebe link de          │
│  pagamento (pode ser enviado     │
│  por email via outra função)     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Usuário paga a cobrança         │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Webhook recebe billing.paid     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Subscription é renovada         │
│  (período estendido)             │
└──────────────────────────────────┘
```

## API da Edge Function de Renovação

### Chamada Manual para Subscription Específica

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/abacatepay-renew-subscription \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "uuid-da-subscription"
  }'
```

### Chamada Manual para Usuário Específico

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/abacatepay-renew-subscription \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-do-usuario"
  }'
```

### Chamada para Renovar Todas (como cron job)

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/abacatepay-renew-subscription \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Respostas da API

### Sucesso

```json
{
  "success": true,
  "renewed": 5,
  "total": 5,
  "results": [
    {
      "subscriptionId": "uuid",
      "userId": "uuid",
      "success": true
    }
  ]
}
```

### Erro

```json
{
  "success": false,
  "error": "Subscription not found or invalid"
}
```

## Notificações (Futuro)

Para melhorar a experiência do usuário, considere implementar:

1. **Notificação por Email**: Quando uma cobrança de renovação é criada, enviar email ao usuário
2. **Notificação In-App**: Mostrar banner na aplicação quando há cobrança pendente
3. **Lembretes**: Enviar lembretes 7 dias antes, 3 dias antes e 1 dia antes do vencimento

## Troubleshooting

### Cron Job não está executando

1. Verifique se o cron job está ativo no Supabase Dashboard
2. Verifique os logs do Supabase para erros
3. Teste manualmente chamando a função diretamente

### Renovações não estão sendo criadas

1. Verifique se as subscriptions têm `payment_provider = 'abacatepay'`
2. Verifique se as subscriptions estão com status `active`
3. Verifique se `cancel_at_period_end = false`
4. Verifique se `current_period_end` está dentro do período (até 3 dias no futuro)

### Webhook não está renovando subscriptions

1. Verifique se o webhook está configurado corretamente no AbacatePay
2. Verifique se a cobrança tem `subscription_id` preenchido
3. Verifique os logs da Edge Function `abacatepay-webhook`

## Limitações

- **Renovação não é 100% automática**: O usuário precisa pagar manualmente cada renovação
- **Sem retry automático**: Se o pagamento falhar, não há tentativa automática
- **Sem notificações automáticas**: O sistema não envia emails automaticamente (precisa ser implementado)
- **Janela de renovação**: Renovações são criadas apenas 3 dias antes do vencimento

## Melhorias Futuras

- [ ] Sistema de notificações por email
- [ ] Sistema de retry automático para pagamentos falhos
- [ ] Dashboard para visualizar renovações pendentes
- [ ] Integração com sistema de lembretes
- [ ] Suporte a múltiplas tentativas de pagamento

