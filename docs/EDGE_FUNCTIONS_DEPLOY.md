# Guia de Deploy - Edge Functions Mercado Pago

## 📋 Pré-requisitos

1. **Supabase CLI instalado**:
   ```bash
   npm install -g supabase
   ```

2. **Supabase Project configurado**:
   - Project ID: `crpzkppsriranmeumfqs`
   - URL: `https://crpzkppsriranmeumfqs.supabase.co`

3. **Credenciais do Mercado Pago**:
   - Access Token (obtido em https://www.mercadopago.com.br/developers)
   - Conta de desenvolvedor ou produção

## 🔧 Configuração

### 1. Login no Supabase CLI

```bash
supabase login
```

### 2. Link do projeto

```bash
supabase link --project-ref crpzkppsriranmeumfqs
```

### 3. Configurar variáveis de ambiente

No dashboard do Supabase (https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions):

Adicione as seguintes **Secrets** nas Edge Functions:

```
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
FRONTEND_URL=https://seu-dominio.vercel.app
```

> **Importante**: Nunca commite o access token no código!

### 4. Configurar Webhook no Mercado Pago

Acesse: https://www.mercadopago.com.br/developers/panel/app

1. Vá em **Webhooks**
2. Adicione nova URL:
   ```
   https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook
   ```
3. Selecione eventos:
   - ✅ Pagamentos
   - ✅ Assinaturas
   - ✅ Planos

## 🚀 Deploy

### Deploy de todas as funções

```bash
# Navegue até o diretório do projeto
cd c:\Rômulo\Projetos\azuria

# Deploy todas as Edge Functions
supabase functions deploy create-subscription
supabase functions deploy create-payment-preference
supabase functions deploy cancel-subscription
supabase functions deploy mercadopago-webhook
```

### Deploy individual

```bash
# Deploy apenas uma função específica
supabase functions deploy create-subscription
```

### Verificar deploy

```bash
# Listar todas as funções
supabase functions list
```

## 🔍 Testar as Edge Functions

### 1. Criar assinatura recorrente

```bash
curl -X POST \
  'https://crpzkppsriranmeumfqs.supabase.co/functions/v1/create-subscription' \
  -H 'Authorization: Bearer SEU_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "planId": "essencial",
    "billingInterval": "monthly"
  }'
```

### 2. Criar preferência de pagamento

```bash
curl -X POST \
  'https://crpzkppsriranmeumfqs.supabase.co/functions/v1/create-payment-preference' \
  -H 'Authorization: Bearer SEU_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "planId": "pro",
    "billingInterval": "annual"
  }'
```

### 3. Cancelar assinatura

```bash
curl -X POST \
  'https://crpzkppsriranmeumfqs.supabase.co/functions/v1/cancel-subscription' \
  -H 'Authorization: Bearer SEU_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "subscriptionId": "ID_DA_ASSINATURA_MERCADOPAGO"
  }'
```

## 📊 Monitoramento

### Ver logs em tempo real

```bash
# Logs de uma função específica
supabase functions logs mercadopago-webhook --follow

# Logs de todas as funções
supabase functions logs --follow
```

### Acessar logs no Dashboard

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/logs/edge-functions
2. Selecione a função
3. Visualize os logs e erros

## 🔐 Segurança

### RLS (Row Level Security)

As Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` para operações privilegiadas.

**Certifique-se de que**:
- ✅ RLS está habilitado em todas as tabelas
- ✅ Policies estão configuradas corretamente
- ✅ Apenas usuários autenticados podem criar/cancelar assinaturas
- ✅ Webhook valida dados antes de processar

### CORS

As funções já incluem headers CORS configurados para aceitar requisições do frontend.

Para restringir a origem, modifique `corsHeaders` em `_shared/types.ts`:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://seu-dominio.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## 🐛 Troubleshooting

### Erro: "MERCADOPAGO_ACCESS_TOKEN not configured"

**Solução**: Configure a secret no dashboard do Supabase.

### Erro: "Invalid authentication token"

**Solução**: Verifique se está enviando o header `Authorization: Bearer <token>` corretamente.

### Erro: "Subscription not found"

**Solução**: 
1. Verifique se a assinatura existe no banco
2. Confirme que o `user_id` está correto
3. Verifique logs: `supabase functions logs mercadopago-webhook`

### Webhook não está sendo recebido

**Solução**:
1. Verifique se a URL está correta no painel do Mercado Pago
2. Teste manualmente com curl
3. Verifique logs da função
4. Confirme que a função está deployada: `supabase functions list`

### Erro de CORS

**Solução**: Verifique se o frontend está usando a URL correta e se os headers CORS estão configurados.

## 📚 Estrutura das Funções

```
supabase/functions/
├── _shared/
│   ├── types.ts          # Tipos TypeScript compartilhados
│   └── utils.ts          # Utilitários compartilhados
├── create-subscription/
│   └── index.ts          # Cria assinatura recorrente
├── create-payment-preference/
│   └── index.ts          # Cria pagamento único
├── cancel-subscription/
│   └── index.ts          # Cancela assinatura
└── mercadopago-webhook/
    └── index.ts          # Processa webhooks do MP
```

## 🔄 Atualização

Para atualizar uma função após modificações:

```bash
# Edite o arquivo da função
# Depois faça deploy novamente
supabase functions deploy nome-da-funcao
```

## 📞 Suporte

- **Documentação Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Documentação Mercado Pago**: https://www.mercadopago.com.br/developers/pt/docs
- **Status do Supabase**: https://status.supabase.com/

## ✅ Checklist de Deploy

- [ ] Supabase CLI instalado e autenticado
- [ ] Projeto linkado
- [ ] Variáveis de ambiente configuradas (MERCADOPAGO_ACCESS_TOKEN, FRONTEND_URL)
- [ ] Todas as 4 funções deployadas
- [ ] Webhook configurado no painel do Mercado Pago
- [ ] RLS habilitado nas tabelas
- [ ] Testado criação de assinatura
- [ ] Testado cancelamento
- [ ] Testado webhook com pagamento de teste
- [ ] Logs monitorados e sem erros
- [ ] Frontend atualizado com URLs das Edge Functions

---

**Última atualização**: Janeiro 2025
