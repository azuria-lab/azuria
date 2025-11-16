/**
 * Edge Function: create-checkout-session
 * 
 * Cria uma sessão de checkout do Stripe
 * 
 * Método: POST
 * Body: { planId: 'essencial' | 'pro', billingInterval: 'month' | 'year' }
 */

import { corsHeaders, type EdgeFunctionResponse, type PlanId, STRIPE_PLANS } from '../_shared/stripe-types.ts';
import { createStripeClient, createSupabaseClient, getFrontendUrl, validateAuth } from '../_shared/stripe-utils.ts';

interface CreateCheckoutRequest {
  planId: Exclude<PlanId, 'free'>;
  billingInterval: 'month' | 'year';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validar autenticação
    const authHeader = req.headers.get('Authorization');
    const { user } = await validateAuth(authHeader);

    // Parse request body
    const { planId, billingInterval }: CreateCheckoutRequest = await req.json();

    // Validar plano
    if (!planId || !STRIPE_PLANS[planId]) {
      throw new Error('Invalid plan');
    }

    // Obter Price ID correto
    const priceId = billingInterval === 'month' 
      ? STRIPE_PLANS[planId].monthlyPriceId 
      : STRIPE_PLANS[planId].yearlyPriceId;

    // Criar cliente Stripe
    const stripe = createStripeClient();
    const frontendUrl = getFrontendUrl();

    // Buscar ou criar customer no Stripe
    const supabase = createSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Se não existe customer, criar
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Salvar no banco
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/assinatura`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    const response: EdgeFunctionResponse<{ sessionUrl: string; sessionId: string }> = {
      success: true,
      data: {
        sessionUrl: session.url || '',
        sessionId: session.id,
      },
      message: 'Checkout session created successfully',
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
