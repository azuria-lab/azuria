# ✅ Checklist de Integração Stripe - Passo a Passo

## 📋 Status da Integração

- [ ] **Fase 1**: Conta e configuração do Stripe
- [ ] **Fase 2**: Banco de dados
- [ ] **Fase 3**: Deploy das Edge Functions
- [ ] **Fase 4**: Frontend
- [ ] **Fase 5**: Testes

---

## 🎯 FASE 1: Conta e Configuração do Stripe

### 1.1 Criar Conta (5 min)
- [ ] Acessar https://dashboard.stripe.com/register
- [ ] Completar cadastro
- [ ] Verificar email
- [ ] **Ativar modo de teste** (toggle no canto superior direito)

### 1.2 Obter API Keys (2 min)
- [ ] Ir em **Developers** → **API keys**
- [ ] Copiar **Publishable key** (pk_test_...)
  ```
  pk_test_... → Anotar aqui para usar no frontend
  ```
- [ ] Copiar **Secret key** (sk_test_...) 
  ```
  sk_test_... → Anotar aqui para usar no backend
  ```
  ⚠️ **IMPORTANTE**: Nunca commite a Secret Key!

### 1.3 Criar Produtos (10 min)

#### Produto 1: Plano Essencial
- [ ] Ir em **Products** → **Add product**
- [ ] Nome: `Plano Essencial`
- [ ] Descrição: `Até 100 cálculos por dia, 2000 por mês, 50 consultas IA`
- [ ] **Criar preço mensal**:
  - [ ] Modelo de preço: `Recurring`
  - [ ] Valor: `R$ 29,90`
  - [ ] Período: `Monthly`
  - [ ] Copiar Price ID: `price_...` → **Anotar**
  
- [ ] **Criar preço anual**:
  - [ ] Clicar em `Add another price` no produto
  - [ ] Modelo: `Recurring`
  - [ ] Valor: `R$ 299,00`
  - [ ] Período: `Yearly`
  - [ ] Copiar Price ID: `price_...` → **Anotar**

#### Produto 2: Plano Pro
- [ ] **Add product**
- [ ] Nome: `Plano Pro`
- [ ] Descrição: `Até 500 cálculos por dia, 10000 por mês, 200 consultas IA`
- [ ] **Criar preço mensal**:
  - [ ] Modelo: `Recurring`
  - [ ] Valor: `R$ 79,90`
  - [ ] Período: `Monthly`
  - [ ] Copiar Price ID: `price_...` → **Anotar**
  
- [ ] **Criar preço anual**:
  - [ ] Modelo: `Recurring`
  - [ ] Valor: `R$ 799,00`
  - [ ] Período: `Yearly`
  - [ ] Copiar Price ID: `price_...` → **Anotar**

### 1.4 Configurar Customer Portal (3 min)
- [ ] Ir em **Settings** → **Billing** → **Customer portal**
- [ ] Clicar em **Activate test link**
- [ ] Configurações recomendadas:
  - [ ] ✅ Permitir cancelar assinaturas
  - [ ] ✅ Permitir atualizar métodos de pagamento
  - [ ] ✅ Permitir mudar de plano
  - [ ] ✅ Mostrar histórico de faturas

---

## 🎯 FASE 2: Banco de Dados

### 2.1 Executar Migração (2 min)
- [ ] Abrir Supabase Dashboard
- [ ] Ir em **SQL Editor**
- [ ] Criar nova query
- [ ] Copiar conteúdo de `supabase/migrations/20250110_add_stripe_support.sql`
- [ ] Executar (Run)
- [ ] Verificar mensagem: `Success. No rows returned`

### 2.2 Verificar Tabelas (1 min)
- [ ] Ir em **Table Editor**
- [ ] Verificar tabela `subscriptions`:
  - [ ] Coluna `stripe_subscription_id` existe
  - [ ] Coluna `stripe_customer_id` existe
- [ ] Verificar tabela `profiles` (se existir):
  - [ ] Coluna `stripe_customer_id` existe

---

## 🎯 FASE 3: Deploy das Edge Functions

### 3.1 Configurar Secrets no Supabase (5 min)
- [ ] Ir em **Project Settings** → **Edge Functions**
- [ ] Adicionar as seguintes secrets (clicar em **Add secret**):

```
Nome: STRIPE_SECRET_KEY
Valor: sk_test_... (copiar da Fase 1.2)

Nome: STRIPE_PRICE_ESSENCIAL_MONTHLY
Valor: price_... (copiar da Fase 1.3 - Essencial Mensal)

Nome: STRIPE_PRICE_ESSENCIAL_YEARLY
Valor: price_... (copiar da Fase 1.3 - Essencial Anual)

Nome: STRIPE_PRICE_PRO_MONTHLY
Valor: price_... (copiar da Fase 1.3 - Pro Mensal)

Nome: STRIPE_PRICE_PRO_YEARLY
Valor: price_... (copiar da Fase 1.3 - Pro Anual)

Nome: FRONTEND_URL
Valor: http://localhost:5173 (dev) ou https://seu-dominio.com (prod)
```

### 3.2 Deploy das Funções (3 min)
- [ ] Abrir terminal no projeto
- [ ] Fazer login: `supabase login`
- [ ] Link projeto: `supabase link --project-ref crpzkppsriranmeumfqs`
- [ ] Deploy função 1:
  ```bash
  supabase functions deploy stripe-create-checkout
  ```
  **Resultado esperado**: ✅ Deployed successfully
  
- [ ] Deploy função 2:
  ```bash
  supabase functions deploy stripe-create-portal
  ```
  **Resultado esperado**: ✅ Deployed successfully
  
- [ ] Deploy função 3:
  ```bash
  supabase functions deploy stripe-webhook
  ```
  **Resultado esperado**: ✅ Deployed successfully

### 3.3 Verificar Deploy (1 min)
- [ ] Executar: `supabase functions list`
- [ ] Verificar que as 3 funções aparecem na lista

### 3.4 Configurar Webhook no Stripe (3 min)
- [ ] Voltar ao Dashboard do Stripe
- [ ] Ir em **Developers** → **Webhooks**
- [ ] Clicar em **Add endpoint**
- [ ] **Endpoint URL**:
  ```
  https://crpzkppsriranmeumfqs.supabase.co/functions/v1/stripe-webhook
  ```
- [ ] Clicar em **Select events**
- [ ] Selecionar eventos:
  - [ ] ✅ `checkout.session.completed`
  - [ ] ✅ `customer.subscription.updated`
  - [ ] ✅ `customer.subscription.deleted`
  - [ ] ✅ `invoice.payment_failed`
- [ ] Clicar em **Add endpoint**
- [ ] **Copiar Signing secret** (whsec_...)
- [ ] Voltar ao Supabase e adicionar secret:
  ```
  Nome: STRIPE_WEBHOOK_SECRET
  Valor: whsec_... (copiar do webhook)
  ```

---

## 🎯 FASE 4: Frontend

### 4.1 Configurar Variáveis de Ambiente (2 min)
- [ ] Criar arquivo `.env.local` na raiz do projeto
- [ ] Adicionar:
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
  (usar chave da Fase 1.2)

### 4.2 Criar Arquivo de Cliente (5 min)
- [ ] Criar `src/lib/stripe-client.ts`
- [ ] Copiar código do arquivo `docs/STRIPE_INTEGRATION.md` (seção "Criar client do Stripe")
- [ ] Salvar

### 4.3 Criar Hook de Integração (5 min)
- [ ] Criar `src/hooks/useStripe.tsx`
- [ ] Copiar código do arquivo `docs/STRIPE_INTEGRATION.md` (seção "Atualizar Hook useSubscription")
- [ ] Salvar

### 4.4 Atualizar Componentes (10 min)
- [ ] Modificar botões de "Assinar" para usar `useStripe()`
- [ ] Exemplo:
  ```tsx
  const { checkout, isLoading } = useStripe();
  
  <Button 
    onClick={() => checkout('essencial', 'month')}
    disabled={isLoading}
  >
    Assinar Agora
  </Button>
  ```

---

## 🎯 FASE 5: Testes

### 5.1 Teste de Checkout (5 min)
- [ ] Iniciar dev server: `npm run dev`
- [ ] Fazer login na aplicação
- [ ] Clicar em "Assinar" em um plano
- [ ] Verificar redirect para Stripe
- [ ] Usar cartão de teste: `4242 4242 4242 4242`
  - Data: qualquer futura
  - CVC: 123
  - CEP: 12345
- [ ] Completar pagamento
- [ ] Verificar redirect de volta para o app
- [ ] Verificar que assinatura aparece como `active`

### 5.2 Teste de Webhook (3 min)
- [ ] Ir no Supabase: **Edge Functions** → **Logs**
- [ ] Filtrar: `stripe-webhook`
- [ ] Verificar que recebeu evento `checkout.session.completed`
- [ ] Verificar que não há erros

### 5.3 Teste de Customer Portal (3 min)
- [ ] Na página de assinatura, clicar em "Gerenciar assinatura"
- [ ] Verificar redirect para Stripe Customer Portal
- [ ] Testar cancelar assinatura
- [ ] Verificar que status muda para `canceled` no app

### 5.4 Verificar Banco de Dados (2 min)
- [ ] Supabase: **Table Editor** → `subscriptions`
- [ ] Verificar que existe registro com:
  - [ ] `stripe_subscription_id` preenchido
  - [ ] `stripe_customer_id` preenchido
  - [ ] `status` = `active`
  - [ ] `plan_id` correto
  - [ ] Datas corretas

---

## ✅ CONCLUSÃO

Quando todos os checkboxes estiverem marcados:

🎉 **Integração Stripe completa e funcionando!**

### Próximos passos opcionais:
- [ ] Configurar ambiente de produção (mudar para chaves reais)
- [ ] Adicionar mais planos se necessário
- [ ] Configurar emails de cobrança no Stripe
- [ ] Adicionar analytics/tracking de conversão
- [ ] Implementar cupons de desconto (se necessário)

---

## 🆘 Precisa de Ajuda?

- **Erro em alguma fase?** → Veja seção Troubleshooting em `docs/STRIPE_INTEGRATION.md`
- **Dúvida sobre configuração?** → Me avise que te ajudo!
- **Stripe Docs**: https://stripe.com/docs

---

**Tempo total estimado**: 30-45 minutos  
**Última atualização**: Janeiro 2025
