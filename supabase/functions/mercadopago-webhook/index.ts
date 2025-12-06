/* eslint-disable no-console */
/**
 * Edge Function: mercadopago-webhook
 *
 * Recebe e processa notificações do Mercado Pago (Webhooks)
 *
 * Método: POST
 * Body: MercadoPagoWebhookNotification (enviado pelo Mercado Pago)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { withSecurityMiddleware } from '../_shared/security-config.ts';
import {
  type EdgeFunctionResponse,
  type MercadoPagoPayment,
  type MercadoPagoWebhookNotification,
} from '../_shared/types.ts';
import { mercadoPagoRequest } from '../_shared/utils.ts';

async function handleMercadoPagoWebhook(req: Request): Promise<Response> {
  // Parse webhook notification
  const notification: MercadoPagoWebhookNotification = await req.json();

  // Log da notificação recebida (apenas tipo e ação para reduzir logs)
  console.log('Webhook received:', {
    type: notification.type,
    action: notification.action,
  });

  // Processar apenas notificações de pagamento
  if (notification.type !== 'payment') {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification type not handled',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  // Buscar detalhes do pagamento no Mercado Pago
  const payment: MercadoPagoPayment = await mercadoPagoRequest(
    `/v1/payments/${notification.data.id}`,
    {
      method: 'GET',
    }
  );

  // Log apenas status e referência (informações críticas)
  console.log('Payment processed:', {
    status: payment.status,
    external_reference: payment.external_reference,
  });

  // Extrair user_id do external_reference
  const externalReference = payment.external_reference;
  if (!externalReference) {
    throw new Error('External reference not found in payment');
  }

  const [userId] = externalReference.split('_');
  if (!userId) {
    throw new Error('Invalid external reference format');
  }

  // Criar cliente Supabase com service role key
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Buscar assinatura do usuário
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (subscriptionError || !subscription) {
    throw new Error(`Subscription not found for user ${userId}`);
  }

  // Processar de acordo com o status do pagamento
  switch (payment.status) {
    case 'approved': {
      // Pagamento aprovado - ativar assinatura
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();

      if (subscription.billing_interval === 'monthly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      // Atualizar ou criar usage_tracking
      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (usage) {
        await supabase
          .from('usage_tracking')
          .update({
            subscription_id: subscription.id,
            period_start: currentPeriodStart.toISOString(),
            period_end: currentPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', usage.id);
      } else {
        await supabase.from('usage_tracking').insert({
          user_id: userId,
          subscription_id: subscription.id,
          period_start: currentPeriodStart.toISOString(),
          period_end: currentPeriodEnd.toISOString(),
        });
      }

      console.log(`Subscription activated: user ${userId}`);
      break;
    }

    case 'pending':
    case 'in_process': {
      // Pagamento pendente
      await supabase
        .from('subscriptions')
        .update({
          status: 'incomplete',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      console.log(`Subscription pending: user ${userId}`);
      break;
    }

    case 'rejected':
    case 'cancelled': {
      // Pagamento rejeitado/cancelado
      await supabase
        .from('subscriptions')
        .update({
          status: 'incomplete_expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      console.log(`Subscription failed: user ${userId}`);
      break;
    }

    case 'refunded':
    case 'charged_back': {
      // Reembolso - cancelar assinatura
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      // Registrar no histórico
      await supabase.from('plan_change_history').insert({
        user_id: userId,
        subscription_id: subscription.id,
        from_plan_id: subscription.plan_id,
        to_plan_id: 'free',
        change_type: 'cancellation',
        reason: `Payment ${payment.status}`,
        effective_date: new Date().toISOString(),
      });

      console.log(
        `Subscription canceled: user ${userId}, reason: ${payment.status}`
      );
      break;
    }

    default: {
      console.log(
        `Unhandled payment status: ${payment.status} for user ${userId}`
      );
    }
  }

  const response: EdgeFunctionResponse = {
    success: true,
    message: 'Webhook processed successfully',
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

// Wrap handler with security middleware
// Note: Retorna 200 mesmo em erro para Mercado Pago não reenviar
Deno.serve(withSecurityMiddleware(handleMercadoPagoWebhook));
