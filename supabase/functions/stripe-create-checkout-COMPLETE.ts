/**
 * Edge Function: stripe-create-checkout
 * 
 * Cria uma sessão de checkout do Stripe
 * Deploy no Supabase Dashboard: Copie este código completo
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.21.0';

// ============================================================
// CORS Headers
// ============================================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// Utility Functions
// ============================================================
function createStripeClient(): Stripe {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {throw new Error('STRIPE_SECRET_KEY not configured');}
  
  return new Stripe(stripeKey, {
    apiVersion: '2024-04-10',
  });
}

function createSupabaseClient(authHeader?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
}

async function validateAuth(authHeader: string | null) {
  if (!authHeader) {throw new Error('Authorization header is required');}
  
  const supabase = createSupabaseClient(authHeader);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {throw new Error('Invalid authentication token');}
  return { user, supabase };
}

function getFrontendUrl(): string {
  return Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';
}

// ============================================================
// Plan Configuration
// ============================================================
const STRIPE_PLANS = {
  essencial: {
    monthlyPriceId: Deno.env.get('STRIPE_PRICE_ESSENCIAL_MENSAL') || '',
    yearlyPriceId: Deno.env.get('STRIPE_PRICE_ESSENCIAL_ANUAL') || '',
  },
  pro: {
    monthlyPriceId: Deno.env.get('STRIPE_PRICE_PRO_MENSAL') || '',
    yearlyPriceId: Deno.env.get('STRIPE_PRICE_PRO_ANUAL') || '',
  },
  enterprise: {
    monthlyPriceId: Deno.env.get('STRIPE_PRICE_ENTERPRISE_MENSAL') || '',
    yearlyPriceId: Deno.env.get('STRIPE_PRICE_ENTERPRISE_ANUAL') || '',
  },
};

// ============================================================
// Main Handler
// ============================================================
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
    const { planId, billingInterval } = await req.json();

    // Validar plano
    if (!planId || !STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS]) {
      throw new Error('Invalid plan');
    }

    // Obter Price ID correto
    const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS];
    const priceId = billingInterval === 'month' 
      ? plan.monthlyPriceId 
      : plan.yearlyPriceId;

    if (!priceId) {
      throw new Error('Price ID not configured');
    }

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
        metadata: { supabase_user_id: user.id },
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
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${frontendUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/assinatura`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        sessionUrl: session.url || '',
        sessionId: session.id,
      },
      message: 'Checkout session created successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const err = error as Error;
    
    return new Response(JSON.stringify({
      success: false,
      error: err.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
