/**
 * Edge Function: stripe-create-portal
 *
 * Cria uma sessão do Stripe Customer Portal para gerenciar assinatura
 *
 * Método: POST
 * Body: {}
 */

import { withSecurityMiddleware } from '../_shared/security-config.ts';
import { type EdgeFunctionResponse } from '../_shared/stripe-types.ts';
import {
  createStripeClient,
  createSupabaseClient,
  getFrontendUrl,
  validateAuth,
} from '../_shared/stripe-utils.ts';

async function handleCreatePortal(req: Request): Promise<Response> {
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

  const response: EdgeFunctionResponse<{ portalUrl: string }> = {
    success: true,
    data: {
      portalUrl: portalSession.url,
    },
    message: 'Portal session created successfully',
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

// Wrap handler with security middleware
// Requires authentication
Deno.serve(
  withSecurityMiddleware(handleCreatePortal, { allowCredentials: true })
);
