# 🚀 Deploy Manual das Edge Functions no Supabase Dashboard

## 📋 Pré-requisitos

Antes de fazer o deploy, configure os **Secrets** no Supabase Dashboard:

**Project Settings → Edge Functions → Secrets**

Adicione estas variáveis:

```env
# Substitua pelos valores reais no Dashboard (NÃO COMMITAR chaves reais)
STRIPE_SECRET_KEY=sk_test_REDACTED
STRIPE_PRICE_ESSENCIAL_MENSAL=price_1SSP00JrAXrajkmpENptgPPs
STRIPE_PRICE_ESSENCIAL_ANUAL=price_1SSP06JrAXrajkmpi35qX9cA
STRIPE_PRICE_PRO_MENSAL=price_1SSP0IJrAXrajkmpw9vj8b3S
STRIPE_PRICE_PRO_ANUAL=price_1SSP0NJrAXrajkmpwWfw2sdh
FRONTEND_URL=http://localhost:5173
```

**⚠️ Nota:** O `STRIPE_WEBHOOK_SECRET` será adicionado depois de configurar o webhook.

---

## 🔧 Como fazer o deploy

Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions

### 1️⃣ Função: stripe-create-checkout

1. Clique em **"Create a new function"**
2. Nome: `stripe-create-checkout`
3. Copie e cole o código do arquivo: `stripe-create-checkout-COMPLETE.ts`
4. Clique em **Deploy**

### 2️⃣ Função: stripe-create-portal

1. Clique em **"Create a new function"**
2. Nome: `stripe-create-portal`
3. Copie e cole o código do arquivo: `stripe-create-portal-COMPLETE.ts`
4. Clique em **Deploy**

### 3️⃣ Função: stripe-webhook

1. Clique em **"Create a new function"**
2. Nome: `stripe-webhook`
3. Copie e cole o código do arquivo: `stripe-webhook-COMPLETE.ts`
4. Clique em **Deploy**

---

## ✅ Verificação

Após o deploy, você verá as 3 funções listadas no Dashboard. Anote as URLs geradas:

```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/stripe-create-checkout
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/stripe-create-portal
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/stripe-webhook
```

---

## 🎯 Próximo Passo

Depois do deploy, configure o webhook no Stripe Dashboard usando a URL:
```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/stripe-webhook
```
