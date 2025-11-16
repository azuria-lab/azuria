/**
 * Edge Function: stripe-create-portal
 * 
 * Cria uma sessão do Stripe Customer Portal
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

    // Buscar customer ID
    const supabase = createSupabaseClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      throw new Error('No active subscription found');
    }

    // Criar portal session
    const stripe = createStripeClient();
    const frontendUrl = getFrontendUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${frontendUrl}/assinatura`,
    });

    return new Response(JSON.stringify({
      success: true,
      data: { portalUrl: portalSession.url },
      message: 'Portal session created successfully',
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
