# Implementação das Edge Functions - Mercado Pago

## 📋 Visão Geral

Este documento detalha as Edge Functions necessárias para completar a integração com Mercado Pago. Estas funções devem ser criadas no Supabase.

---

## 🔧 Edge Functions Necessárias

### 1. `mercadopago-create-preference`

Cria uma preferência de pagamento único no Mercado Pago.

**Arquivo:** `supabase/functions/mercadopago-create-preference/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

const PLAN_PRICES: Record<string, number> = {
  essencial: 59.00,
  pro: 119.00,
};

serve(async (req) => {
  try {
    const { planType, userId } = await req.json();

    if (!planType || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const price = PLAN_PRICES[planType];
    if (!price) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Criar preferência no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: `Azuria - Plano ${planType.charAt(0).toUpperCase() + planType.slice(1)}`,
            unit_price: price,
            quantity: 1,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: userId, // Usar email do usuário aqui
        },
        back_urls: {
          success: `${APP_URL}/pagamento/retorno?status=success`,
          failure: `${APP_URL}/pagamento/retorno?status=failure`,
          pending: `${APP_URL}/pagamento/retorno?status=pending`,
        },
        auto_return: 'approved',
        external_reference: userId,
        metadata: {
          user_id: userId,
          plan_type: planType,
        },
      }),
    });

    const preference = await response.json();

    if (!response.ok) {
      throw new Error(preference.message || 'Failed to create preference');
    }

    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating preference:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

### 2. `mercadopago-create-subscription`

Cria uma assinatura recorrente (preapproval) no Mercado Pago.

**Arquivo:** `supabase/functions/mercadopago-create-subscription/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

const PLAN_PRICES: Record<string, number> = {
  essencial: 59.00,
  pro: 119.00,
};

serve(async (req) => {
  try {
    const { planType, userId } = await req.json();

    if (!planType || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const price = PLAN_PRICES[planType];
    if (!price) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Criar assinatura no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: `Azuria - Plano ${planType.charAt(0).toUpperCase() + planType.slice(1)}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: price,
          currency_id: 'BRL',
        },
        back_url: `${APP_URL}/pagamento/retorno?status=success`,
        payer_email: userId, // Usar email real aqui
        external_reference: userId,
        status: 'pending',
      }),
    });

    const subscription = await response.json();

    if (!response.ok) {
      throw new Error(subscription.message || 'Failed to create subscription');
    }

    return new Response(
      JSON.stringify({
        id: subscription.id,
        status: subscription.status,
        reason: subscription.reason,
        payer_email: subscription.payer_email,
        auto_recurring: subscription.auto_recurring,
        back_url: subscription.back_url,
        init_point: subscription.init_point,
        sandbox_init_point: subscription.sandbox_init_point,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

### 3. `mercadopago-webhook`

Processa webhooks do Mercado Pago (pagamentos e atualizações de assinatura).

**Arquivo:** `supabase/functions/mercadopago-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const body = await req.json();
    
    console.log('Webhook received:', body);

    // Processar diferentes tipos de eventos
    switch (body.type) {
      case 'payment':
        await handlePayment(body.data.id);
        break;
      
      case 'subscription_preapproval':
      case 'subscription_preapproval_updated':
        await handleSubscription(body.data.id);
        break;
      
      default:
        console.log('Unhandled event type:', body.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePayment(paymentId: string) {
  try {
    // Buscar dados do pagamento
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await response.json();
    console.log('Payment data:', payment);

    const userId = payment.external_reference || payment.metadata?.user_id;
    const planType = payment.metadata?.plan_type;

    if (!userId) {
      console.error('User ID not found in payment');
      return;
    }

    // Atualizar subscription baseado no status do pagamento
    if (payment.status === 'approved') {
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      await supabase
        .from('subscriptions')
        .update({
          plan_id: planType || 'essencial',
          status: 'active',
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          mercadopago_customer_id: payment.payer?.id,
          mercadopago_subscription_id: payment.preapproval_id || null,
        })
        .eq('user_id', userId);

      // Registrar histórico
      await supabase
        .from('plan_change_history')
        .insert({
          user_id: userId,
          from_plan: 'free',
          to_plan: planType || 'essencial',
          change_type: 'upgrade',
          reason: 'Pagamento aprovado',
        });
    }
  } catch (error) {
    console.error('Error handling payment:', error);
    throw error;
  }
}

async function handleSubscription(preapprovalId: string) {
  try {
    // Buscar dados da assinatura
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${preapprovalId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const subscription = await response.json();
    console.log('Subscription data:', subscription);

    const userId = subscription.external_reference;

    if (!userId) {
      console.error('User ID not found in subscription');
      return;
    }

    // Mapear status do Mercado Pago para status interno
    const statusMap: Record<string, string> = {
      'authorized': 'active',
      'paused': 'canceled',
      'cancelled': 'canceled',
      'pending': 'trialing',
    };

    const status = statusMap[subscription.status] || 'trialing';

    // Atualizar subscription
    await supabase
        .from('subscriptions')
        .update({
          status,
          mercadopago_subscription_id: preapprovalId,
          mercadopago_customer_id: subscription.payer_id,
        })
        .eq('user_id', userId);
  } catch (error) {
    console.error('Error handling subscription:', error);
    throw error;
  }
}
```

---

### 4. `mercadopago-cancel-subscription`

Cancela uma assinatura no Mercado Pago.

**Arquivo:** `supabase/functions/mercadopago-cancel-subscription/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;

serve(async (req) => {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing subscription ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cancelar no Mercado Pago
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      }
    );

    const subscription = await response.json();

    if (!response.ok) {
      throw new Error(subscription.message || 'Failed to cancel subscription');
    }

    return new Response(
      JSON.stringify(subscription),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🚀 Comandos de Deploy

```bash
# Criar as funções
supabase functions new mercadopago-create-preference
supabase functions new mercadopago-create-subscription
supabase functions new mercadopago-webhook
supabase functions new mercadopago-cancel-subscription

# Deploy
supabase functions deploy mercadopago-create-preference
supabase functions deploy mercadopago-create-subscription
supabase functions deploy mercadopago-webhook --no-verify-jwt
supabase functions deploy mercadopago-cancel-subscription

# Configurar secrets
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-your-access-token
supabase secrets set APP_URL=https://your-app.vercel.app
```

---

## 🔐 Variáveis de Ambiente

Configurar no Supabase Dashboard:

- `MERCADOPAGO_ACCESS_TOKEN`: Token de acesso do Mercado Pago
- `APP_URL`: URL da aplicação frontend
- `SUPABASE_URL`: URL do projeto Supabase (já configurado)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (já configurado)

---

## ✅ Checklist de Implementação

- [ ] Criar as 4 Edge Functions
- [ ] Fazer deploy das funções
- [ ] Configurar variáveis de ambiente
- [ ] Configurar webhook no Mercado Pago
- [ ] Testar criação de preferência
- [ ] Testar criação de assinatura
- [ ] Testar webhook com pagamento aprovado
- [ ] Testar cancelamento de assinatura
- [ ] Validar atualização no Supabase
- [ ] Testar fluxo completo end-to-end

---

**Status:** ⚠️ Pendente de Implementação  
**Dependências:** Credenciais do Mercado Pago, Supabase CLI  
**Tempo Estimado:** 2-4 horas
