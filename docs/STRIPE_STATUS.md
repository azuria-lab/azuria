# 🎯 Stripe Integration - Status e Próximos Passos

**Data de Atualização:** 10/11/2025  
**Status Geral:** 🟡 **Em Configuração** (Backend pronto, aguardando configuração externa)

---

## ✅ O que JÁ está Pronto

### 1. Código e Estrutura (100% Completo)
- ✅ Pacotes instalados (`stripe` v17.4.0, `@stripe/stripe-js` v5.1.0)
- ✅ 3 Edge Functions criadas e funcionais:
  - `stripe-create-checkout` - Cria sessão de checkout
  - `stripe-create-portal` - Acessa portal do cliente
  - `stripe-webhook` - Processa eventos do Stripe
- ✅ Migração do banco criada: `20250110_add_stripe_support.sql`
- ✅ Utilitários compartilhados: `_shared/stripe-types.ts` e `stripe-utils.ts`
- ✅ Variáveis de ambiente documentadas: `.env.example` atualizado

### 2. Documentação (100% Completo)
- ✅ `STRIPE_QUICK_SETUP.md` - Guia rápido passo a passo (NOVO!)
- ✅ `STRIPE_SETUP_CHECKLIST.md` - Checklist detalhado
- ✅ `STRIPE_README.md` - Quick reference
- ✅ `docs/STRIPE_INTEGRATION.md` - Documentação técnica completa

---

## 🔄 O que FALTA Fazer (Configuração Externa)

### Etapa 1: Conta e Produtos no Stripe Dashboard (15 min) ⏳
**Status:** Aguardando ação manual

**O que fazer:**
1. Criar conta em https://dashboard.stripe.com/register
2. Ativar **modo de teste**
3. Criar 2 produtos com 2 preços cada (monthly/yearly):
   - **Plano Essencial**: R$ 29,90/mês ou R$ 299/ano
   - **Plano Pro**: R$ 79,90/mês ou R$ 799/ano
4. Copiar as seguintes credenciais:
   - ✅ Publishable Key (pk_test_...)
   - ✅ Secret Key (sk_test_...)
   - ✅ 4 Price IDs (price_...)

**Guia Completo:** Siga `STRIPE_QUICK_SETUP.md` seção 1️⃣

---

### Etapa 2: Configurar Variáveis de Ambiente (5 min) ⏳
**Status:** Aguardando credenciais do Stripe

**Arquivo `.env.local` (raiz do projeto):**
```bash
# Copiar de .env.example e preencher com valores do Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_ESSENCIAL_MONTHLY=price_...
VITE_STRIPE_PRICE_ESSENCIAL_YEARLY=price_...
VITE_STRIPE_PRICE_PRO_MONTHLY=price_...
VITE_STRIPE_PRICE_PRO_YEARLY=price_...
```

**Supabase Functions Secrets:**
Acessar: Dashboard → Settings → Edge Functions → Secrets
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ESSENCIAL_MONTHLY=price_...
STRIPE_PRICE_ESSENCIAL_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
FRONTEND_URL=http://localhost:5173
```

---

### Etapa 3: Executar Migração do Banco (2 min) ⏳
**Status:** Pronto para executar

**Como fazer:**
1. Supabase Dashboard → SQL Editor → New Query
2. Copiar TODO o conteúdo de: `supabase/migrations/20250110_add_stripe_support.sql`
3. Colar e clicar em **Run**
4. Verificar: `Success. No rows returned`

**O que faz:**
- Adiciona colunas `stripe_subscription_id` e `stripe_customer_id` na tabela `subscriptions`
- Adiciona coluna `stripe_customer_id` na tabela `profiles` (se existir)
- Cria índices para melhor performance

---

### Etapa 4: Deploy das Edge Functions (5 min) ⏳
**Status:** Pronto para deploy

**Comandos:**
```bash
# No terminal, na raiz do projeto:
npx supabase login
npx supabase link --project-ref [SEU_PROJECT_ID]

# Deploy das 3 functions
npx supabase functions deploy stripe-create-checkout
npx supabase functions deploy stripe-create-portal
npx supabase functions deploy stripe-webhook
```

**Verificar:** Supabase Dashboard → Edge Functions (deve mostrar 3 functions ativas)

---

### Etapa 5: Configurar Webhook no Stripe (5 min) ⏳
**Status:** Aguardando deploy das functions

**Como fazer:**
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook`
3. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copiar o **Signing Secret** (whsec_...)
5. Adicionar no Supabase Functions Secrets:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### Etapa 6: Integrar Frontend (15 min) ⏳
**Status:** Aguardando configurações anteriores

**Componentes a Atualizar:**
1. `src/pages/PricingPage.tsx` - Adicionar botões de checkout
2. `src/components/settings/SettingsSubscriptionTab.tsx` - Integrar portal do cliente
3. `src/pages/PaymentReturnPage.tsx` - Criar página de sucesso/cancelamento

**Exemplo de Integração:**
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Criar checkout session
const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-create-checkout`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planId: 'essencial',
    billingInterval: 'month'
  })
});

const { data } = await response.json();
window.location.href = data.sessionUrl;
```

---

### Etapa 7: Testes (10 min) ⏳
**Status:** Aguardando todas as configurações anteriores

**Checklist de Testes:**
- [ ] Criar checkout para Plano Essencial Monthly
- [ ] Usar cartão de teste: `4242 4242 4242 4242`
- [ ] Verificar redirecionamento para página de sucesso
- [ ] Verificar registro na tabela `subscriptions` no Supabase
- [ ] Acessar Customer Portal
- [ ] Testar cancelamento de assinatura
- [ ] Verificar webhook funcionando (Stripe Dashboard → Webhooks → Events)

---

## 📊 Progresso Total

| Fase | Status | Progresso |
|------|--------|-----------|
| Código & Estrutura | ✅ Completo | 100% |
| Documentação | ✅ Completo | 100% |
| Configuração Stripe | ⏳ Pendente | 0% |
| Configuração Env Vars | ⏳ Pendente | 0% |
| Migração do Banco | ⏳ Pendente | 0% |
| Deploy Functions | ⏳ Pendente | 0% |
| Webhook Setup | ⏳ Pendente | 0% |
| Frontend Integration | ⏳ Pendente | 0% |
| Testes | ⏳ Pendente | 0% |

**Progresso Geral:** 22% (2/9 etapas)

---

## 🚀 Começar Agora

### Próxima Ação Imediata:
**👉 Siga o guia:** `STRIPE_QUICK_SETUP.md`

**Tempo estimado:** 30-45 minutos para configuração completa

**Ordem recomendada:**
1. Criar conta e produtos no Stripe (15 min)
2. Configurar variáveis de ambiente (5 min)
3. Executar migração (2 min)
4. Deploy das functions (5 min)
5. Configurar webhook (5 min)
6. Integrar frontend (15 min)
7. Testar (10 min)

---

## 📚 Recursos de Ajuda

- **Guia Rápido:** `STRIPE_QUICK_SETUP.md` ⭐ **COMECE AQUI**
- **Checklist Detalhado:** `STRIPE_SETUP_CHECKLIST.md`
- **Documentação Técnica:** `docs/STRIPE_INTEGRATION.md`
- **Quick Reference:** `STRIPE_README.md`

---

## 🆘 Problemas Comuns

**"Invalid API Key"**
→ Verifique se copiou a Secret Key correta (sk_test_...)

**"No such price"**
→ Confirme que os Price IDs estão corretos no .env

**"Webhook não funciona"**
→ Verifique o Signing Secret e os eventos selecionados

---

**Última Atualização:** 10/11/2025 21:30  
**Próxima Ação:** Criar conta no Stripe Dashboard
