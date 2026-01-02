/**
 * Edge Function: create-subscription
 *
 * Cria uma assinatura recorrente no Mercado Pago
 *
 * Método: POST
 * Body: { planId: 'essencial' | 'pro' | 'enterprise', billingInterval: 'monthly' | 'annual' }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withSecurityMiddleware } from '../_shared/security-config.ts';
import {
  type BillingInterval,
  type EdgeFunctionResponse,
  type MercadoPagoSubscription,
  type PlanId,
  PLANS,
} from '../_shared/types.ts';
import { createSupabaseClient, mercadoPagoRequest } from '../_shared/utils.ts';

interface CreateSubscriptionRequest {
  planId: PlanId;
  billingInterval: BillingInterval;
}

async function handleCreateSubscription(req: Request): Promise<Response> {
  try {
    console.log('=== CREATE SUBSCRIPTION START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);

    // Verificar autenticação (mesmo padrão do abacatepay-create-billing que funciona)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    console.log('Auth header present:', !!authHeader);
    console.log(
      'Auth header value (first 50 chars):',
      authHeader?.substring(0, 50)
    );

    // Criar cliente Supabase com ANON_KEY para validar o token JWT
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verificar usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      console.error('Auth validation error:', {
        error: userError?.message,
        errorCode: userError?.status,
        hasUser: !!user,
      });
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Criar cliente com SERVICE_ROLE_KEY para operações no banco
    const supabase = createSupabaseClient(authHeader);

    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);
    const { planId, billingInterval }: CreateSubscriptionRequest = body;

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
    const price =
      billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

    // Buscar ou criar assinatura no banco
    const { data: existingSubscription, error: subscriptionError } =
      await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError);
      throw new Error(`Database error: ${subscriptionError.message}`);
    }

    console.log('Creating subscription:', {
      planId,
      billingInterval,
      price,
      userId: user.id,
    });

    // Criar subscription diretamente no Mercado Pago (sem criar plan separado)
    // O Mercado Pago cria o plan automaticamente quando criamos a subscription
    let subscription: MercadoPagoSubscription;
    try {
      subscription = await mercadoPagoRequest<MercadoPagoSubscription>(
        '/preapproval',
        {
          method: 'POST',
          body: JSON.stringify({
            reason: `${plan.name} - ${
              billingInterval === 'monthly' ? 'Mensal' : 'Anual'
            }`,
            external_reference: `${user.id}_${planId}_${Date.now()}`,
            payer_email: user.email,
            // Mercado Pago exige URL HTTPS válida - usar URL de produção
            back_url: 'https://azuria.app.br/pagamento/retorno?status=success',
            status: 'pending',
            auto_recurring: {
              frequency: 1,
              frequency_type:
                billingInterval === 'monthly' ? 'months' : 'years',
              transaction_amount: price,
              currency_id: 'BRL',
            },
          }),
        }
      );
      console.log('Subscription created in Mercado Pago:', {
        id: subscription.id,
        init_point: subscription.init_point,
      });
    } catch (error) {
      console.error('Error creating subscription in Mercado Pago:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to create subscription in Mercado Pago: ${errorMessage}`
      );
    }

    // Atualizar ou criar registro de assinatura no banco
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
      mercadopago_subscription_id: subscription.id,
      mercadopago_preapproval_id:
        subscription.preapproval_plan_id || subscription.id,
    };

    if (existingSubscription) {
      // Atualizar assinatura existente
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw new Error(
          `Failed to update subscription: ${updateError.message}`
        );
      }
      console.log('Subscription updated in database');
    } else {
      // Criar nova assinatura
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);

      if (insertError) {
        console.error('Error inserting subscription:', insertError);
        throw new Error(
          `Failed to create subscription: ${insertError.message}`
        );
      }
      console.log('Subscription created in database');
    }

    // Retornar URL de checkout
    const response: EdgeFunctionResponse<{
      checkoutUrl: string;
      subscriptionId: string;
    }> = {
      success: true,
      data: {
        checkoutUrl: subscription.init_point,
        subscriptionId: subscription.id,
      },
      message: 'Subscription created successfully',
    };

    console.log('=== CREATE SUBSCRIPTION SUCCESS ===');
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('=== CREATE SUBSCRIPTION ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error(
      'Error message:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack'
    );

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    const errorResponse: EdgeFunctionResponse = {
      success: false,
      message: errorMessage,
      error: errorMessage,
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// Wrap handler with security middleware
// Requires authentication
Deno.serve(
  withSecurityMiddleware(handleCreateSubscription, { allowCredentials: true })
);
