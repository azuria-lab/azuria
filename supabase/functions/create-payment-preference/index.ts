/**
 * Edge Function: create-payment-preference
 *
 * Cria uma preferência de pagamento único no Mercado Pago
 *
 * Método: POST
 * Body: { planId: 'essencial' | 'pro' | 'enterprise', billingInterval: 'monthly' | 'annual' }
 */

import { withSecurityMiddleware } from '../_shared/security-config.ts';
import {
  type BillingInterval,
  type EdgeFunctionResponse,
  type MercadoPagoPreference,
  type PlanId,
  PLANS,
} from '../_shared/types.ts';
import {
  getReturnUrl,
  mercadoPagoRequest,
  validateAuth,
} from '../_shared/utils.ts';

interface CreatePreferenceRequest {
  planId: PlanId;
  billingInterval: BillingInterval;
}

async function handleCreatePaymentPreference(req: Request): Promise<Response> {
  // Validar autenticação
  const authHeader = req.headers.get('Authorization');
  const { user, supabase } = await validateAuth(authHeader);

  // Parse request body
  const { planId, billingInterval }: CreatePreferenceRequest = await req.json();

  // Validar plano
  if (!planId || !PLANS[planId]) {
    throw new Error('Invalid plan');
  }

  if (planId === 'free' || planId === 'enterprise') {
    throw new Error('Cannot create payment for this plan type');
  }

  // Validar intervalo de cobrança
  if (!billingInterval || !['monthly', 'annual'].includes(billingInterval)) {
    throw new Error('Invalid billing interval');
  }

  // Obter configuração do plano
  const plan = PLANS[planId];
  const price =
    billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

  // Criar preferência de pagamento no Mercado Pago
  const preference: MercadoPagoPreference = await mercadoPagoRequest(
    '/checkout/preferences',
    {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            id: planId,
            title: `${plan.name} - ${
              billingInterval === 'monthly' ? 'Mensal' : 'Anual'
            }`,
            description: `Assinatura do plano ${plan.name}`,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
        },
        back_urls: {
          success: getReturnUrl('success'),
          failure: getReturnUrl('failure'),
          pending: getReturnUrl('pending'),
        },
        auto_return: 'approved',
        external_reference: `${user.id}_${planId}_${Date.now()}`,
        statement_descriptor: 'AZURIA',
        payment_methods: {
          excluded_payment_types: [],
          installments: billingInterval === 'annual' ? 12 : 1,
        },
        notification_url: `${Deno.env.get(
          'SUPABASE_URL'
        )}/functions/v1/mercadopago-webhook`,
      }),
    }
  );

  // Criar ou atualizar registro de assinatura no banco
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const subscriptionData = {
    user_id: user.id,
    plan_id: planId,
    status: 'incomplete' as const,
    billing_interval: billingInterval,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(
      Date.now() +
        (billingInterval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
    ).toISOString(),
  };

  if (existingSubscription) {
    await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id);
  } else {
    await supabase.from('subscriptions').insert(subscriptionData);
  }

  // Retornar URL de checkout
  const response: EdgeFunctionResponse<{
    checkoutUrl: string;
    preferenceId: string;
  }> = {
    success: true,
    data: {
      checkoutUrl: preference.init_point,
      preferenceId: preference.id,
    },
    message: 'Payment preference created successfully',
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

// Wrap handler with security middleware
// Requires authentication
Deno.serve(
  withSecurityMiddleware(handleCreatePaymentPreference, {
    allowCredentials: true,
  })
);
