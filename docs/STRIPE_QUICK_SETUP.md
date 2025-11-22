# 🚀 Guia Rápido - Configuração Stripe para Azuria

## ✅ Status Atual

- ✅ Pacotes instalados (`stripe`, `@stripe/stripe-js`)
- ✅ Edge Functions criadas (3 functions)
- ✅ Migração do banco criada
- ✅ Variáveis de ambiente configuradas no `.env.example`

## 📋 Próximos Passos

### 1️⃣ Criar Conta e Produtos no Stripe (15 min)

#### Passo 1.1: Criar Conta
1. Acesse https://dashboard.stripe.com/register
2. Complete o cadastro e verifique o email
3. **Ative o modo de teste** (toggle no canto superior direito do dashboard)

#### Passo 1.2: Obter API Keys
1. Vá em **Developers** → **API keys**
2. Copie as seguintes chaves:
   - **Publishable key** (pk_test_...) - Para o frontend
   - **Secret key** (sk_test_...) - Para o backend

#### Passo 1.3: Criar Produtos e Preços

**Produto 1: Plano Essencial**
1. Vá em **Products** → **Add product**
2. Preencha:
   - Nome: `Plano Essencial`
   - Descrição: `Até 100 cálculos por dia, 2000 por mês, 50 consultas IA`
3. **Criar preço mensal**:
   - Modelo de preço: `Recurring`
   - Valor: `R$ 29,90` ou `BRL 29.90`
   - Período: `Monthly`
   - ✅ Copie o **Price ID** (price_...)
4. Adicionar preço anual:
   - Clique em `Add another price` no mesmo produto
   - Modelo: `Recurring`
   - Valor: `R$ 299,00` ou `BRL 299.00`
   - Período: `Yearly`
   - ✅ Copie o **Price ID** (price_...)

**Produto 2: Plano Pro**
1. **Add product** (novo produto)
2. Preencha:
   - Nome: `Plano Pro`
   - Descrição: `Até 500 cálculos por dia, 10000 por mês, 200 consultas IA`
3. **Criar preço mensal**:
   - Modelo: `Recurring`
   - Valor: `R$ 79,90` ou `BRL 79.90`
   - Período: `Monthly`
   - ✅ Copie o **Price ID** (price_...)
4. Adicionar preço anual:
   - Modelo: `Recurring`
   - Valor: `R$ 799,00` ou `BRL 799.00`
   - Período: `Yearly`
   - ✅ Copie o **Price ID** (price_...)

---

### 2️⃣ Configurar Variáveis de Ambiente

#### No arquivo `.env.local` (raiz do projeto):

```bash
# Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs
VITE_STRIPE_PRICE_ESSENCIAL_MONTHLY=price_...
VITE_STRIPE_PRICE_ESSENCIAL_YEARLY=price_...
VITE_STRIPE_PRICE_PRO_MONTHLY=price_...
VITE_STRIPE_PRICE_PRO_YEARLY=price_...
```

#### No Supabase Dashboard (Edge Functions):

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/settings/functions
2. Clique em **"Add new secret"** e adicione:

```bash
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
STRIPE_PRICE_ESSENCIAL_MONTHLY=price_...
STRIPE_PRICE_ESSENCIAL_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

---

### 3️⃣ Executar Migração do Banco (2 min)

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Clique em **"New query"**
3. Copie TODO o conteúdo de: `supabase/migrations/20250110_add_stripe_support.sql`
4. Cole na query e clique em **"Run"**
5. Verifique a mensagem: `Success. No rows returned`

---

### 4️⃣ Deploy das Edge Functions (5 min)

Abra o terminal na raiz do projeto:

```bash
# Login no Supabase CLI (se ainda não logou)
npx supabase login

# Link do projeto
npx supabase link --project-ref [SEU_PROJECT_ID]

# Deploy das 3 functions
npx supabase functions deploy stripe-create-checkout
npx supabase functions deploy stripe-create-portal
npx supabase functions deploy stripe-webhook
```

---

### 5️⃣ Configurar Webhook no Stripe (5 min)

1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Clique em **"Add endpoint"**
3. Preencha:
   - **Endpoint URL**: 
     ```
     https://[SEU_PROJECT_ID].supabase.co/functions/v1/stripe-webhook
     ```
   - **Description**: `Azuria Webhook`
   - **Events to send**: Selecione:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_failed`
     - ✅ `invoice.payment_succeeded`
4. Clique em **"Add endpoint"**
5. Após criar, clique no endpoint criado
6. Copie o **Signing secret** (whsec_...)
7. Adicione no Supabase Functions Secrets:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### 6️⃣ Testar a Integração (10 min)

#### Teste do Checkout:
1. Inicie o projeto: `npm run dev`
2. Acesse: `http://localhost:5173/assinatura`
3. Clique em **"Assinar"** em algum plano
4. Você será redirecionado para o Stripe Checkout
5. Use o **cartão de teste**:
   ```
   Número: 4242 4242 4242 4242
   Data: qualquer data futura
   CVC: qualquer 3 dígitos
   CEP: qualquer CEP
   ```
6. Complete o pagamento
7. Verifique se foi redirecionado para `/pagamento/sucesso`

#### Verificar no Banco:
1. Supabase Dashboard → **Table Editor** → `subscriptions`
2. Verifique se existe um registro com:
   - `stripe_subscription_id` preenchido
   - `status = 'active'`
   - `plan = 'essencial'` ou `'pro'`

#### Testar Customer Portal:
1. No app, vá em **Configurações** → **Assinatura**
2. Clique em **"Gerenciar Assinatura"**
3. Você será redirecionado para o Stripe Customer Portal
4. Teste cancelar/atualizar a assinatura

---

## 🎉 Pronto!

Se todos os testes passaram, sua integração Stripe está funcionando! 🚀

## 📚 Documentação Completa

- **Detalhes Técnicos**: `docs/STRIPE_INTEGRATION.md`
- **Checklist Completo**: `STRIPE_SETUP_CHECKLIST.md`
- **Quick Reference**: `STRIPE_README.md`

## 🆘 Problemas Comuns

### Erro: "No such price"
- Verifique se copiou os Price IDs corretos
- Confirme que está usando o modo de teste (pk_test_, sk_test_)

### Erro: "Invalid API Key"
- Verifique se a Secret Key está correta no Supabase
- Confirme que não tem espaços extras

### Webhook não está funcionando
- Verifique se o endpoint está correto
- Confirme que o Signing Secret está configurado
- Teste o webhook manualmente no Stripe Dashboard

## 📞 Suporte

Se precisar de ajuda, consulte:
- Documentação do Stripe: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs
- Issues do projeto: https://github.com/azuria-lab/azuria/issues
