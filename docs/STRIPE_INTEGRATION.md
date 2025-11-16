# 🎉 Integração Stripe - Guia Completo

## 📋 Visão Geral

Integração completa com **Stripe** para gerenciamento de assinaturas, incluindo:

✅ **Checkout Sessions** - Fluxo de pagamento seguro  
✅ **Customer Portal** - Gerenciamento self-service  
✅ **Webhooks** - Sincronização automática  
✅ **Subscription Management** - Ciclo de vida completo  

---

## 🚀 Quick Start

### 1. Criar Conta no Stripe

1. Acesse: https://dashboard.stripe.com/register
2. Complete o cadastro
3. Ative o modo de teste

### 2. Obter Credenciais

No Dashboard do Stripe → Developers → API Keys:

- **Publishable Key**: `pk_test_...` (para frontend)
- **Secret Key**: `sk_test_...` (para backend)
- **Webhook Secret**: Será gerado ao configurar o webhook

### 3. Criar Produtos e Preços

No Dashboard do Stripe → Products:

#### Plano Essencial
- Nome: "Plano Essencial"
- Preço Mensal: R$ 29,90/mês
- Preço Anual: R$ 299/ano
- Copie os Price IDs: `price_xxxxx`

#### Plano Pro
- Nome: "Plano Pro"
- Preço Mensal: R$ 79,90/mês
- Preço Anual: R$ 799/ano
- Copie os Price IDs: `price_xxxxx`

### 4. Configurar Secrets no Supabase

Dashboard: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
STRIPE_PRICE_ESSENCIAL_MONTHLY=price_...
STRIPE_PRICE_ESSENCIAL_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

### 5. Deploy das Edge Functions

```bash
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-create-portal
supabase functions deploy stripe-webhook
```

### 6. Configurar Webhook no Stripe

Dashboard → Developers → Webhooks → Add endpoint

**URL**:
```
https://crpzkppsriranmeumfqs.supabase.co/functions/v1/stripe-webhook
```

**Eventos para escutar**:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Copie o **Webhook Secret** e adicione nas secrets do Supabase.

---

## 📁 Estrutura de Arquivos

```
supabase/functions/
├── _shared/
│   ├── stripe-types.ts        # Tipos e configuração
│   └── stripe-utils.ts        # Utilitários
├── stripe-create-checkout/    # Criar sessão de checkout
│   └── index.ts
├── stripe-create-portal/      # Portal do cliente
│   └── index.ts
└── stripe-webhook/            # Processar webhooks
    └── index.ts

supabase/migrations/
└── 20250110_add_stripe_support.sql  # Migração do banco
```

---

## 🔧 Atualizar Frontend

### 1. Instalar dependências

```bash
npm install stripe @stripe/stripe-js
```

### 2. Criar client do Stripe

```typescript
// src/lib/stripe-client.ts

import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const FUNCTIONS_URL = 'https://crpzkppsriranmeumfqs.supabase.co/functions/v1';

/**
 * Cria uma sessão de checkout
 */
export async function createCheckoutSession(
  planId: 'essencial' | 'pro',
  billingInterval: 'month' | 'year'
): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${FUNCTIONS_URL}/stripe-create-checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId, billingInterval }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  const result = await response.json();
  return result.data.sessionUrl;
}

/**
 * Cria uma sessão do customer portal
 */
export async function createPortalSession(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${FUNCTIONS_URL}/stripe-create-portal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create portal session');
  }

  const result = await response.json();
  return result.data.portalUrl;
}
```

### 3. Criar arquivo .env

```bash
# .env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Atualizar Hook useSubscription

```typescript
// src/hooks/useStripe.tsx

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe-client';

export function useStripe() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkout = async (
    planId: 'essencial' | 'pro',
    billingInterval: 'month' | 'year' = 'month'
  ) => {
    try {
      setIsLoading(true);
      const checkoutUrl = await createCheckoutSession(planId, billingInterval);
      window.location.href = checkoutUrl;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manageSubscription = async () => {
    try {
      setIsLoading(true);
      const portalUrl = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkout,
    manageSubscription,
    isLoading,
  };
}
```

---

## 🧪 Testar

### 1. Teste Local

```bash
# Terminal 1: Supabase local
supabase functions serve

# Terminal 2: Frontend
npm run dev
```

### 2. Cartões de Teste

Use os cartões de teste do Stripe:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **Requer autenticação**: `4000 0025 0000 3155`

Qualquer data futura + qualquer CVC + qualquer CEP

### 3. Testar Webhook Localmente

```bash
# Instalar Stripe CLI
npm install -g stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

---

## 📊 Fluxo Completo

```
1. User clica em "Assinar"
   ↓
2. Frontend chama stripe-create-checkout
   ↓
3. Edge Function cria Checkout Session
   ↓
4. User é redirecionado para Stripe
   ↓
5. User completa pagamento
   ↓
6. Stripe envia webhook (checkout.session.completed)
   ↓
7. Edge Function atualiza banco de dados
   ↓
8. User é redirecionado de volta
   ↓
9. Frontend mostra confirmação
```

---

## 🔐 Segurança

✅ **Secret Key** nunca exposta no frontend  
✅ **Webhook** assinado e verificado  
✅ **JWT** validado em todas as Edge Functions  
✅ **Customer Portal** gerenciado pelo Stripe  
✅ **PCI Compliance** - Stripe cuida de tudo  

---

## 📈 Vantagens do Stripe

✅ **Mais Simples** - API mais limpa que Mercado Pago  
✅ **Global** - Aceita pagamentos internacionais  
✅ **Customer Portal** - Interface pronta para gerenciar assinatura  
✅ **Melhor Documentação** - Docs excelentes  
✅ **Webhooks Confiáveis** - Sistema de retry robusto  
✅ **Dashboard Intuitivo** - Fácil de usar  

---

## 🆘 Troubleshooting

### Erro: "Invalid API Key"
**Solução**: Verifique se o `STRIPE_SECRET_KEY` está correto nas secrets do Supabase

### Erro: "No such price"
**Solução**: Verifique se os Price IDs estão corretos nas secrets

### Webhook não recebe eventos
**Solução**: 
1. Verifique se a URL está correta
2. Teste com Stripe CLI localmente
3. Verifique logs: `supabase functions logs stripe-webhook --follow`

---

## 📚 Documentação Oficial

- **Stripe Docs**: https://stripe.com/docs
- **Checkout Session**: https://stripe.com/docs/payments/checkout
- **Customer Portal**: https://stripe.com/docs/billing/subscriptions/customer-portal
- **Webhooks**: https://stripe.com/docs/webhooks

---

**Status**: ✅ Pronto para uso  
**Última atualização**: Janeiro 2025
