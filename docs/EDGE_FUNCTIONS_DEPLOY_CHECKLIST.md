# ✅ Checklist de Deploy - Edge Functions Mercado Pago

Use este checklist para garantir que todo o deploy seja feito corretamente.

## 📋 Pré-requisitos

- [ ] Node.js instalado (versão 18+)
- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Conta no Mercado Pago Developers
- [ ] Access Token do Mercado Pago (teste ou produção)
- [ ] Acesso ao projeto Supabase (crpzkppsriranmeumfqs)

## 🔧 Configuração Local

- [ ] Clonar/atualizar repositório
- [ ] Executar `npm install`
- [ ] Executar `npm run validate:edge-functions` (deve passar)
- [ ] Verificar que todos os arquivos estão presentes

## 🔐 Mercado Pago

- [ ] Acessar: https://www.mercadopago.com.br/developers
- [ ] Criar/selecionar aplicação
- [ ] Copiar Access Token (Teste para dev, Produção para prod)
- [ ] Anotar credenciais em local seguro

## ☁️ Supabase - Autenticação

- [ ] Executar `supabase login`
- [ ] Executar `supabase link --project-ref crpzkppsriranmeumfqs`
- [ ] Verificar conexão: `supabase projects list`

## 🔑 Supabase - Secrets

Acessar: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions

Adicionar as seguintes secrets:

- [ ] `MERCADOPAGO_ACCESS_TOKEN` = [seu token aqui]
- [ ] `FRONTEND_URL` = https://seu-dominio.vercel.app (ou http://localhost:5173 para dev)

## 🚀 Deploy das Edge Functions

Executar os seguintes comandos (um de cada vez):

- [ ] `supabase functions deploy create-subscription`
  - Verificar: ✅ Deployed successfully
  
- [ ] `supabase functions deploy create-payment-preference`
  - Verificar: ✅ Deployed successfully
  
- [ ] `supabase functions deploy cancel-subscription`
  - Verificar: ✅ Deployed successfully
  
- [ ] `supabase functions deploy mercadopago-webhook`
  - Verificar: ✅ Deployed successfully

## ✅ Verificação de Deploy

- [ ] Executar `supabase functions list`
- [ ] Verificar que as 4 funções aparecem na lista
- [ ] Verificar versão mais recente de cada função

## 🔔 Configurar Webhook no Mercado Pago

Acessar: https://www.mercadopago.com.br/developers/panel/app/webhooks

- [ ] Clicar em "Configurar notificações"
- [ ] Adicionar URL: `https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook`
- [ ] Selecionar eventos:
  - [ ] ✅ Pagamentos
  - [ ] ✅ Assinaturas
  - [ ] ✅ Planos
- [ ] Salvar configuração
- [ ] Copiar chave de segurança (se fornecida)

## 🧪 Testes

### Teste 1: Criar Assinatura

```bash
# Obter token do localStorage após login no app
export TOKEN="seu_token_jwt_aqui"

# Testar criação
curl -X POST https://crpzkppsriranmeumfqs.supabase.co/functions/v1/create-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"essencial","billingInterval":"monthly"}'
```

- [ ] Resposta 200 OK
- [ ] Retornou `checkoutUrl`
- [ ] Retornou `subscriptionId`

### Teste 2: Acessar Checkout

- [ ] Abrir `checkoutUrl` no navegador
- [ ] Página do Mercado Pago carregou
- [ ] Formulário de pagamento aparece

### Teste 3: Webhook (Simular)

```bash
# Fazer um pagamento de teste
# Aguardar 30-60 segundos
# Verificar logs
supabase functions logs mercadopago-webhook --limit 10
```

- [ ] Logs mostram notificação recebida
- [ ] Status da assinatura atualizado no banco
- [ ] Sem erros nos logs

### Teste 4: Cancelamento

```bash
curl -X POST https://crpzkppsriranmeumfqs.supabase.co/functions/v1/cancel-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscriptionId":"MP_SUBSCRIPTION_ID"}'
```

- [ ] Resposta 200 OK
- [ ] Status atualizado para `canceled` no banco

## 📊 Monitoramento

### Dashboard Supabase

- [ ] Acessar: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/logs/edge-functions
- [ ] Verificar logs das 4 funções
- [ ] Confirmar que não há erros

### Logs em Tempo Real

```bash
# Terminal 1: Webhook
supabase functions logs mercadopago-webhook --follow

# Terminal 2: Outras funções
supabase functions logs create-subscription --follow
```

- [ ] Logs aparecem quando funções são invocadas
- [ ] Sem erros ou warnings críticos

## 🔄 Atualizar Frontend

### Arquivo: src/lib/mercadopago-client.ts

- [ ] Verificar que as funções chamam as Edge Functions
- [ ] URLs corretas: `https://crpzkppsriranmeumfqs.supabase.co/functions/v1/...`
- [ ] Headers de autenticação corretos

### Teste no Frontend

- [ ] Login no app
- [ ] Navegar para página de assinaturas
- [ ] Clicar em "Assinar Plano Essencial"
- [ ] Redirecionar para Mercado Pago
- [ ] Completar pagamento de teste
- [ ] Retornar ao app
- [ ] Verificar status "active" na assinatura

## 🐛 Troubleshooting

### Erro: "Function not found"
- [ ] Verificar deploy: `supabase functions list`
- [ ] Re-deploy: `supabase functions deploy [nome]`

### Erro: "MERCADOPAGO_ACCESS_TOKEN not configured"
- [ ] Verificar secrets no Supabase Dashboard
- [ ] Adicionar token nas settings

### Erro: "Invalid authentication token"
- [ ] Verificar que token JWT é válido
- [ ] Fazer novo login no app
- [ ] Verificar header Authorization

### Webhook não recebe notificações
- [ ] Verificar URL no painel do Mercado Pago
- [ ] Testar manualmente: `curl -X POST [webhook-url]`
- [ ] Verificar logs: `supabase functions logs mercadopago-webhook`

## 📚 Documentação

- [ ] Ler `docs/EDGE_FUNCTIONS_DEPLOY.md` (guia completo)
- [ ] Ler `docs/EDGE_FUNCTIONS_USAGE.md` (exemplos)
- [ ] Ler `MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md` (resumo técnico)

## ✨ Produção

### Antes de ir para produção:

- [ ] Trocar `MERCADOPAGO_ACCESS_TOKEN` para credenciais de PRODUÇÃO
- [ ] Atualizar `FRONTEND_URL` para domínio real
- [ ] Atualizar webhook no Mercado Pago para URL de produção
- [ ] Fazer teste completo com pagamento real (valor baixo)
- [ ] Monitorar logs por 24-48h
- [ ] Configurar alertas de erro (opcional)

## 🎉 Conclusão

- [ ] Todas as etapas acima concluídas
- [ ] Testes passaram
- [ ] Logs sem erros
- [ ] Frontend integrado
- [ ] Documentação revisada

**Status**: ✅ Deploy concluído com sucesso!

---

**Data do deploy**: ___/___/2025  
**Responsável**: ________________  
**Ambiente**: [ ] Desenvolvimento [ ] Produção  
**Observações**: ________________________________________

