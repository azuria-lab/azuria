# Supabase Edge Functions - Mercado Pago

Este diretório contém as Edge Functions serverless para integração com o Mercado Pago.

## 📁 Estrutura

```
functions/
├── _shared/                    # Código compartilhado
│   ├── types.ts               # Definições de tipos TypeScript
│   └── utils.ts               # Utilitários (auth, API calls, etc.)
├── create-subscription/       # Cria assinatura recorrente
│   └── index.ts
├── create-payment-preference/ # Cria pagamento único
│   └── index.ts
├── cancel-subscription/       # Cancela assinatura
│   └── index.ts
├── mercadopago-webhook/       # Processa notificações do MP
│   └── index.ts
├── deno.json                  # Configuração do Deno
└── .env.example              # Exemplo de variáveis de ambiente
```

## 🚀 Quick Start

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login

```bash
supabase login
```

### 3. Link do projeto

```bash
supabase link --project-ref crpzkppsriranmeumfqs
```

### 4. Configurar variáveis

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Mercado Pago.

### 5. Deploy

```bash
# Deploy todas as funções
supabase functions deploy create-subscription
supabase functions deploy create-payment-preference
supabase functions deploy cancel-subscription
supabase functions deploy mercadopago-webhook
```

## 🧪 Desenvolvimento Local

### Iniciar servidor local

```bash
supabase functions serve --env-file .env
```

As funções estarão disponíveis em:
- `http://localhost:54321/functions/v1/create-subscription`
- `http://localhost:54321/functions/v1/create-payment-preference`
- `http://localhost:54321/functions/v1/cancel-subscription`
- `http://localhost:54321/functions/v1/mercadopago-webhook`

### Testar com curl

```bash
# Obter token (faça login no app e copie do localStorage)
export TOKEN="seu_token_aqui"

# Testar criação de assinatura
curl -X POST http://localhost:54321/functions/v1/create-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planId":"essencial","billingInterval":"monthly"}'
```

## 📚 Documentação Completa

- **Deploy**: Veja `../../docs/EDGE_FUNCTIONS_DEPLOY.md`
- **Uso**: Veja `../../docs/EDGE_FUNCTIONS_USAGE.md`
- **Resumo**: Veja `../../MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md`

## 🔐 Segurança

- ✅ Nunca commite `.env` ou tokens reais
- ✅ Use credenciais de TESTE em desenvolvimento
- ✅ Configure secrets no Supabase Dashboard para produção
- ✅ Todas as funções validam autenticação JWT

## 🐛 Debug

### Ver logs em tempo real

```bash
supabase functions logs mercadopago-webhook --follow
```

### Ver logs no Dashboard

https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/logs/edge-functions

## 🔄 Atualizar funções

Após modificar o código:

```bash
supabase functions deploy nome-da-funcao
```

## 📊 Monitoramento

### Status das funções

```bash
supabase functions list
```

### Invocar diretamente

```bash
supabase functions invoke create-subscription \
  --body '{"planId":"essencial","billingInterval":"monthly"}' \
  --header "Authorization: Bearer $TOKEN"
```

## ⚠️ Troubleshooting

### Erro: "Cannot find module"
**Solução**: Certifique-se de que `deno.json` está na raiz de `functions/`

### Erro: "MERCADOPAGO_ACCESS_TOKEN not configured"
**Solução**: Configure a secret no Supabase Dashboard

### Erro: "Invalid authentication token"
**Solução**: Verifique se o token JWT é válido e não expirou

## 🎯 Próximos Passos

1. ✅ Configure variáveis de ambiente
2. ✅ Faça deploy das funções
3. ✅ Configure webhook no Mercado Pago
4. ✅ Teste com pagamento de teste
5. ✅ Monitore logs
6. ✅ Integre com frontend

---

**Dúvidas?** Consulte a documentação completa em `docs/`
