# 🚀 Setup Rápido - AbacatePay

## Passo 1: Obter API Key

1. Acesse o dashboard do AbacatePay: https://www.abacatepay.com/app
2. Vá em **Configurações > API Keys** (ou **INTEGRAÇÃO > API** no menu lateral)
3. Copie sua **API Key** (começa com `abacate_`)

## Passo 2: Configurar no Supabase

### Via Dashboard do Supabase

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **Project Settings > Edge Functions > Secrets**
3. Adicione a variável:
   - **Nome**: `ABACATEPAY_API_KEY`
   - **Valor**: `abacate_sua_chave_aqui`
4. Adicione também (opcional, para modo de desenvolvimento):
   - **Nome**: `VITE_ABACATEPAY_DEV_MODE`
   - **Valor**: `true` (para testes) ou `false` (para produção)

### Via CLI (opcional)

```bash
supabase secrets set ABACATEPAY_API_KEY=abacate_sua_chave_aqui
supabase secrets set VITE_ABACATEPAY_DEV_MODE=true
```

## Passo 3: Configurar Webhook

1. No dashboard do AbacatePay, vá em **INTEGRAÇÃO > Webhook**
2. Adicione a URL do webhook:
   ```
   https://[seu-projeto-id].supabase.co/functions/v1/abacatepay-webhook
   ```
3. Selecione os eventos:
   - ✅ `billing.paid`
   - ✅ `billing.refunded`
   - ✅ `billing.expired`
   - ✅ `billing.created` (opcional)

**Dica:** Para encontrar seu projeto ID, veja a URL do Supabase Dashboard ou nas configurações do projeto.

## Passo 4: Fazer Deploy das Edge Functions

```bash
# Deploy de todas as funções do AbacatePay
supabase functions deploy abacatepay-create-billing
supabase functions deploy abacatepay-webhook
supabase functions deploy abacatepay-check-status
supabase functions deploy abacatepay-renew-subscription
```

## Passo 5: Testar

### Testar em Modo Desenvolvimento

1. Certifique-se que `VITE_ABACATEPAY_DEV_MODE=true` está configurado
2. Acesse sua aplicação e vá para a página de planos
3. Selecione um plano e inicie o checkout
4. Você será redirecionado para o AbacatePay (modo teste)
5. No dashboard do AbacatePay, vá em **Cobranças** e simule um pagamento

### Simular Pagamento no AbacatePay (Modo Teste)

1. Acesse **TRANSAÇÕES > Cobranças** no dashboard
2. Encontre a cobrança criada
3. Clique em **"Simular Pagamento"** ou **"Aprovar"**
4. O webhook será disparado automaticamente
5. Verifique se a subscription foi ativada no seu banco de dados

## ⚠️ Importante

**NÃO é necessário:**
- ❌ Criar "Links de Pagamento" manualmente
- ❌ Criar "Produtos" manualmente no dashboard
- ❌ Configurar URLs manualmente

**Tudo isso é feito automaticamente pela API!**

O sistema cria as cobranças automaticamente quando um usuário inicia o checkout na sua aplicação.

## Verificação Rápida

Após configurar, você pode testar usando a API diretamente:

```bash
curl -X POST https://[seu-projeto].supabase.co/functions/v1/abacatepay-create-billing \
  -H "Authorization: Bearer [seu-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "essencial",
    "billingInterval": "monthly",
    "methods": ["PIX", "CARD"]
  }'
```

## Próximos Passos

- 📖 Ver [ABACATEPAY_INTEGRATION.md](./ABACATEPAY_INTEGRATION.md) para documentação completa
- 🔄 Ver [ABACATEPAY_RENEWAL_SYSTEM.md](./ABACATEPAY_RENEWAL_SYSTEM.md) para sistema de renovações
- 🧪 Testar o fluxo completo de assinatura
- 📧 Configurar notificações (opcional)

