/**
 * Edge Function: create-subscription
 * 
 * Cria uma assinatura recorrente no Mercado Pago
 * 
 * Método: POST
 * Body: { planId: 'essencial' | 'pro' | 'enterprise', billingInterval: 'monthly' | 'annual' }
 */

import { type BillingInterval, corsHeaders, type EdgeFunctionResponse, type MercadoPagoSubscription, type PlanId, PLANS } from '../_shared/types.ts';
import { getReturnUrl, mercadoPagoRequest, validateAuth } from '../_shared/utils.ts';

interface CreateSubscriptionRequest {
  planId: PlanId;
  billingInterval: BillingInterval;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validar autenticação
    const authHeader = req.headers.get('Authorization');
    const { user, supabase } = await validateAuth(authHeader);

    // Parse request body
    const { planId, billingInterval }: CreateSubscriptionRequest = await req.json();

    // Validar plano
    if (!planId || !PLANS[planId]) {
      throw new Error('Invalid plan');
    }

    if (planId === 'free' || planId === 'enterprise') {
      throw new Error('Cannot create subscription for this plan type');
    }

    // Validar intervalo de cobrança
    if (!billingInterval || !['monthly', 'annual'].includes(billingInterval)) {
      throw new Error('Invalid billing interval');
    }

    // Obter configuração do plano
    const plan = PLANS[planId];
    const price = billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

    // Buscar ou criar assinatura no banco
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Criar preapproval plan no Mercado Pago
    const preapprovalPlan = await mercadoPagoRequest('/preapproval_plan', {
      method: 'POST',
      body: JSON.stringify({
        reason: plan.name,
        auto_recurring: {
          frequency: 1,
          frequency_type: billingInterval === 'monthly' ? 'months' : 'years',
          transaction_amount: price,
          currency_id: 'BRL',
        },
        back_url: getReturnUrl('success'),
      }),
    });

    // Criar subscription no Mercado Pago
    const subscription: MercadoPagoSubscription = await mercadoPagoRequest('/preapproval', {
      method: 'POST',
      body: JSON.stringify({
        preapproval_plan_id: preapprovalPlan.id,
        reason: plan.name,
        external_reference: `${user.id}_${planId}_${Date.now()}`,
        payer_email: user.email,
        back_url: getReturnUrl('success'),
        status: 'pending',
        auto_recurring: {
          frequency: 1,
          frequency_type: billingInterval === 'monthly' ? 'months' : 'years',
          transaction_amount: price,
          currency_id: 'BRL',
        },
      }),
    });

    // Atualizar ou criar registro de assinatura no banco
    const subscriptionData = {
      user_id: user.id,
      plan_id: planId,
      status: 'incomplete' as const,
      billing_interval: billingInterval,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (billingInterval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
      mercadopago_subscription_id: subscription.id,
      mercadopago_preapproval_id: subscription.preapproval_plan_id,
    };

    if (existingSubscription) {
      // Atualizar assinatura existente
      await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id);
    } else {
      // Criar nova assinatura
      await supabase
        .from('subscriptions')
        .insert(subscriptionData);
    }

    // Retornar URL de checkout
    const response: EdgeFunctionResponse<{ checkoutUrl: string; subscriptionId: string }> = {
      success: true,
      data: {
        checkoutUrl: subscription.init_point,
        subscriptionId: subscription.id,
      },
      message: 'Subscription created successfully',
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const err = error as Error;
    
    const response: EdgeFunctionResponse = {
      success: false,
      error: err.message,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
