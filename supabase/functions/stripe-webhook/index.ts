/**
 * Edge Function: stripe-webhook
 * 
 * Processa webhooks do Stripe
 * 
 * Método: POST
 * Body: Evento do Stripe
 */

import { corsHeaders, type EdgeFunctionResponse } from '../_shared/stripe-types.ts';
import { createStripeClient, createSupabaseClient } from '../_shared/stripe-utils.ts';
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = createStripeClient();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret');
    }

    // Verificar assinatura do webhook
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createSupabaseClient();

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;

        if (!userId || !planId) {break;}

        // Buscar a subscription criada
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Atualizar ou criar subscription no banco
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single();

        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        const subscriptionData = {
          user_id: userId,
          plan_id: planId,
          status: 'active' as const,
          billing_interval: subscription.items.data[0].price.recurring?.interval === 'month' ? 'monthly' : 'annual',
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
        };

        if (existingSub) {
          await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('id', existingSub.id);
        } else {
          await supabase
            .from('subscriptions')
            .insert(subscriptionData);
        }

        // Atualizar usage_tracking
        const { data: usage } = await supabase
          .from('usage_tracking')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (usage) {
          await supabase
            .from('usage_tracking')
            .update({
              period_start: currentPeriodStart.toISOString(),
              period_end: currentPeriodEnd.toISOString(),
            })
            .eq('id', usage.id);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // Registrar no histórico
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id, plan_id, id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          await supabase
            .from('plan_change_history')
            .insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              from_plan_id: sub.plan_id,
              to_plan_id: 'free',
              change_type: 'cancellation',
              reason: 'Subscription canceled via Stripe',
            });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', invoice.subscription);
        }

        break;
      }
    }

    const response: EdgeFunctionResponse = {
      success: true,
      message: 'Webhook processed successfully',
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const err = error as Error;
    
    // Retornar 200 para não reprocessar
    const response: EdgeFunctionResponse = {
      success: false,
      error: err.message,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
