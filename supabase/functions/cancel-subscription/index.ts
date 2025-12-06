/**
 * Edge Function: cancel-subscription
 *
 * Cancela uma assinatura no Mercado Pago
 *
 * Método: POST
 * Body: { subscriptionId: string }
 */

import { withSecurityMiddleware } from '../_shared/security-config.ts';
import { type EdgeFunctionResponse } from '../_shared/types.ts';
import { mercadoPagoRequest, validateAuth } from '../_shared/utils.ts';

interface CancelSubscriptionRequest {
  subscriptionId: string;
}

async function handleCancelSubscription(req: Request): Promise<Response> {
  // Validar autenticação
  const authHeader = req.headers.get('Authorization');
  const { user, supabase } = await validateAuth(authHeader);

  // Parse request body
  const { subscriptionId }: CancelSubscriptionRequest = await req.json();

  if (!subscriptionId) {
    throw new Error('Subscription ID is required');
  }

  // Buscar assinatura no banco
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('mercadopago_subscription_id', subscriptionId)
    .single();

  if (subscriptionError || !subscription) {
    throw new Error('Subscription not found');
  }

  // Cancelar no Mercado Pago
  await mercadoPagoRequest(`/preapproval/${subscriptionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'cancelled',
    }),
  });

  // Atualizar status no banco
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq('id', subscription.id);

  // Registrar no histórico
  await supabase.from('plan_change_history').insert({
    user_id: user.id,
    subscription_id: subscription.id,
    from_plan_id: subscription.plan_id,
    to_plan_id: 'free',
    change_type: 'cancellation',
    reason: 'User requested cancellation',
    effective_date: new Date().toISOString(),
  });

  const response: EdgeFunctionResponse = {
    success: true,
    message: 'Subscription canceled successfully',
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

// Wrap handler with security middleware
// Requires authentication
Deno.serve(
  withSecurityMiddleware(handleCancelSubscription, { allowCredentials: true })
);
