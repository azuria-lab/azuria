# 🔐 Secrets do Supabase para Edge Functions

## Como Adicionar

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá em **"Secrets"** no menu lateral
3. Clique em **"Add new secret"** para cada item abaixo
4. Copie exatamente o **Nome** e o **Valor**

---

## ⚡ Secrets Necessários

### 1. STRIPE_SECRET_KEY
**Valor:** `[REDACTED - Obter do Dashboard do Stripe]`

### 2. STRIPE_WEBHOOK_SECRET
**Valor:** `[REDACTED - Obter do Dashboard do Stripe ao criar webhook]`

### 3. STRIPE_PRICE_ESSENCIAL_MENSAL
**Valor:** `price_1SSP00JrAXrajkmpENptgPPs`

### 4. STRIPE_PRICE_ESSENCIAL_ANUAL
**Valor:** `price_1SSP06JrAXrajkmpi35qX9cA`

### 5. STRIPE_PRICE_PRO_MENSAL
**Valor:** `price_1SSP0IJrAXrajkmpw9vj8b3S`

### 6. STRIPE_PRICE_PRO_ANUAL
**Valor:** `price_1SSP0NJrAXrajkmpwWfw2sdh`

### 7. STRIPE_PRICE_ENTERPRISE_MENSAL
**Valor:** `price_1SSPKpJrAXrajkmpQk2InTDD`

### 8. STRIPE_PRICE_ENTERPRISE_ANUAL
**Valor:** `price_1SSPKyJrAXrajkmp6buEiAkc`

### 9. FRONTEND_URL
**Valor:** `http://localhost:8080`

---

## ✅ Verificação

Após adicionar todos os secrets:

1. Volte para a página de Edge Functions
2. Clique em `stripe-create-checkout`
3. Clique em **"Deploy"** (redeploy para pegar os novos secrets)
4. Aguarde o deploy completar
5. Teste novamente no frontend

---

## 🔍 Como Saber se Está Correto

- ✅ Total de 9 secrets configurados
- ✅ Nenhum valor vazio ou com "..."
- ✅ FRONTEND_URL aponta para `http://localhost:8080` (porta do seu dev server)
- ✅ STRIPE_SECRET_KEY começa com `sk_test_`
- ✅ STRIPE_WEBHOOK_SECRET começa com `whsec_`
- ✅ Todos os PRICE IDs começam com `price_`
