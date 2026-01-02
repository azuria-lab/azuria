import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withSecurityMiddleware } from '../_shared/security-config.ts';

/**
 * Edge Function para receber webhooks do Abacatepay
 */
async function handleAbacatepayWebhook(req: Request): Promise<Response> {
  // Criar cliente Supabase com service role (sem autenticação de usuário)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Parse webhook payload
  const event = await req.json();

  console.log('Received Abacatepay webhook:', event.kind);

  if (!event.billing || !event.billing.id) {
    throw new Error('Invalid webhook payload');
  }

  const billingId = event.billing.id;
  const eventKind = event.kind;

  // Buscar billing no banco de dados
  const { data: billingRecord, error: fetchError } = await supabaseAdmin
    .from('abacatepay_billings')
    .select('*')
    .eq('billing_id', billingId)
    .single();

  if (fetchError || !billingRecord) {
    console.error('Billing not found in database:', billingId);
    throw new Error('Billing not found');
  }

  // Processar evento baseado no tipo
  let newStatus = billingRecord.status;
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  switch (eventKind) {
    case 'billing.paid':
      newStatus = 'PAID';
      updateData.status = 'PAID';
      updateData.paid_at = new Date().toISOString();

      // Se for uma renovação (tem subscription_id), estender o período
      // Caso contrário, ativar/criar nova assinatura
      if (billingRecord.subscription_id) {
        await renewSubscription(
          supabaseAdmin,
          billingRecord.subscription_id,
          billingRecord.billing_interval
        );
      } else {
        await activateSubscription(
          supabaseAdmin,
          billingRecord.user_id,
          billingRecord.plan_id,
          billingRecord.billing_interval
        );
      }
      break;

    case 'billing.refunded':
      newStatus = 'REFUNDED';
      updateData.status = 'REFUNDED';

      // Cancelar assinatura do usuário
      await deactivateSubscription(supabaseAdmin, billingRecord.user_id);
      break;

    case 'billing.expired':
      newStatus = 'EXPIRED';
      updateData.status = 'EXPIRED';
      break;

    case 'billing.created':
      // Apenas log, não precisa atualizar nada
      console.log('Billing created event received');
      break;

    default:
      console.log('Unknown event kind:', eventKind);
  }

  // Atualizar billing no banco
  const { error: updateError } = await supabaseAdmin
    .from('abacatepay_billings')
    .update(updateData)
    .eq('billing_id', billingId);

  if (updateError) {
    console.error('Error updating billing:', updateError);
    throw updateError;
  }

  console.log(`Billing ${billingId} updated to status: ${newStatus}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Ativa a assinatura do usuário
 */
async function activateSubscription(
  supabase: any,
  userId: string,
  planId: string,
  billingInterval: string
) {
  try {
    // Calcular data de expiração
    const now = new Date();
    const expiresAt = new Date(now);

    if (billingInterval === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Atualizar ou criar assinatura
    const { error } = await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        plan_id: planId,
        status: 'active',
        billing_interval: billingInterval,
        current_period_start: now.toISOString(),
        current_period_end: expiresAt.toISOString(),
        payment_provider: 'abacatepay',
        updated_at: now.toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }

    console.log(`Subscription activated for user ${userId}`);
  } catch (error) {
    console.error('Error in activateSubscription:', error);
    throw error;
  }
}

/**
 * Renova uma subscription existente (estende o período)
 */
async function renewSubscription(
  supabase: any,
  subscriptionId: string,
  billingInterval: string
) {
  try {
    // Buscar subscription atual
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found for renewal:', subscriptionId);
      throw new Error('Subscription not found');
    }

    // Calcular novo período baseado no período atual
    const currentPeriodEnd = new Date(subscription.current_period_end);
    const newPeriodEnd = new Date(currentPeriodEnd);

    if (billingInterval === 'monthly') {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
    } else {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
    }

    // Atualizar subscription estendendo o período
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: currentPeriodEnd.toISOString(),
        current_period_end: newPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }

    console.log(`Subscription ${subscriptionId} renewed until ${newPeriodEnd.toISOString()}`);
  } catch (error) {
    console.error('Error in renewSubscription:', error);
    throw error;
  }
}

/**
 * Desativa a assinatura do usuário
 */
async function deactivateSubscription(supabase: any, userId: string) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error deactivating subscription:', error);
      throw error;
    }

    console.log(`Subscription deactivated for user ${userId}`);
  } catch (error) {
    console.error('Error in deactivateSubscription:', error);
    throw error;
  }
}

// Wrap handler with security middleware
// Webhooks don't need credentials but need to accept requests from Abacatepay
Deno.serve(withSecurityMiddleware(handleAbacatepayWebhook));
