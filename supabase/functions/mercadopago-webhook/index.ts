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

  // Verificar se é um ID de teste (simulação)
  const paymentId = notification.data.id;
  const isTestId = paymentId === '123456' || paymentId === '123456789' || !paymentId;
  
  if (isTestId) {
    console.log('Test notification received, skipping payment lookup:', paymentId);
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test notification received and acknowledged',
        test: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  // Buscar detalhes do pagamento no Mercado Pago
  let payment: MercadoPagoPayment;
  try {
    payment = await mercadoPagoRequest<MercadoPagoPayment>(
      `/v1/payments/${paymentId}`,
      {
        method: 'GET',
      }
    );
  } catch (error) {
    // Se o pagamento não for encontrado, logar mas não falhar
    if (error instanceof Error && error.message.includes('Not Found')) {
      console.warn(`Payment not found: ${paymentId}. This may be a test notification or deleted payment.`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment not found (may be test or deleted)',
          paymentId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200, // Retornar 200 para Mercado Pago não reenviar
        }
      );
    }
    // Re-throw outros erros
    throw error;
  }

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

// Serve handler - webhooks públicos não precisam de autenticação JWT
// IMPORTANTE: Esta função deve ser configurada como pública no Supabase Dashboard
// Settings → Edge Functions → mercadopago-webhook → Disable JWT verification
Deno.serve(async (req: Request): Promise<Response> => {
  // Log detalhado da requisição recebida
  const headers = Object.fromEntries(req.headers.entries());
  console.log('Webhook request received:', {
    method: req.method,
    url: req.url,
    hasAuth: !!headers.authorization,
    hasApiKey: !!headers.apikey,
    origin: headers.origin || 'none',
    userAgent: headers['user-agent'] || 'none',
  });

  // Aceitar apenas POST
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  // Log que chegou até aqui (se chegar)
  console.log('Processing POST request...');

  try {
    // Validar assinatura do webhook (opcional, mas recomendado)
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    
    console.log('Webhook headers:', {
      signature: signature ? 'present' : 'missing',
      requestId: requestId || 'missing',
    });
    
    // Se a secret estiver configurada, validar assinatura
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      // TODO: Implementar validação de assinatura HMAC
      // Por enquanto, apenas verificar se existe
      console.log('Webhook secret configured, signature validation pending');
    }

    // Processar webhook
    const response = await handleMercadoPagoWebhook(req);
    
    // Adicionar headers de resposta
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    // Retornar 200 mesmo em erro para Mercado Pago não reenviar
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200, // Importante: 200 para Mercado Pago não reenviar
      }
    );
  }
});
