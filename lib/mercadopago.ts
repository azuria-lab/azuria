/**
 * Mercado Pago Integration
 * 
 * This module handles all Mercado Pago operations for subscription management
 * in the Azuria App.
 * 
 * Features:
 * - Create subscription plans (PRO, BUSINESS)
 * - Create subscriptions for users
 * - Cancel subscriptions
 * - Handle webhooks for payment events
 * 
 * @see https://www.mercadopago.com.br/developers/pt/docs
 */

/* eslint-disable no-console, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import mercadopago from 'mercadopago';

// Configure Mercado Pago SDK
// Access token should be set in environment variables
// For testing: use TEST-xxx token from https://www.mercadopago.com.br/developers/panel
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN not set. Mercado Pago features will not work.');
} else {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });
}

/**
 * Subscription Plans
 * 
 * These are the available subscription tiers for Azuria App
 */
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '10 cálculos por dia',
      'Histórico de 7 dias',
      'Anúncios leves',
      'Suporte por email'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    price: 9.90,
    features: [
      'Cálculos ilimitados',
      'Histórico ilimitado',
      'Sem anúncios',
      'Exportar PDF',
      'Gráficos avançados',
      'Suporte prioritário'
    ]
  },
  BUSINESS: {
    id: 'business',
    name: 'BUSINESS',
    price: 29.90,
    features: [
      'Tudo do PRO',
      'Até 5 usuários',
      'API access',
      'White-label',
      'Integração Zapier',
      'Suporte dedicado'
    ]
  }
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Create a subscription plan in Mercado Pago
 * 
 * This should be run once to create the plan in Mercado Pago.
 * The plan ID will be stored and reused for all subscriptions.
 * 
 * @param planType - The subscription plan type (PRO or BUSINESS)
 * @returns The plan ID from Mercado Pago
 * 
 * @example
 * ```typescript
 * const proPlanId = await createSubscriptionPlan('PRO');
 * // Save proPlanId to your database or environment variables
 * ```
 */
export async function createSubscriptionPlan(
  planType: 'PRO' | 'BUSINESS'
): Promise<string> {
  const plan = SUBSCRIPTION_PLANS[planType];
  
  try {
    const response = await mercadopago.preapproval_plan.create({
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: plan.price,
        currency_id: 'BRL',
        billing_day_proportional: false
      },
      back_url: `${process.env.VITE_APP_URL || 'https://azuria.app.br'}/subscription/success`,
      reason: `Azuria ${plan.name} - Assinatura Mensal`
    });

    console.log(`✅ Plan ${planType} created successfully:`, response.body.id);
    return response.body.id;
  } catch (error) {
    console.error(`❌ Error creating plan ${planType}:`, error);
    throw new Error(`Failed to create subscription plan: ${error}`);
  }
}

/**
 * Create a subscription for a user
 * 
 * This creates a subscription in Mercado Pago and returns the payment link
 * where the user will complete the payment process.
 * 
 * @param params - Subscription parameters
 * @returns Object containing subscription ID and init point (payment URL)
 * 
 * @example
 * ```typescript
 * const { subscriptionId, initPoint } = await createSubscription({
 *   userId: 'user-123',
 *   planId: 'plan-456',
 *   email: 'user@example.com',
 *   planType: 'PRO'
 * });
 * 
 * // Redirect user to initPoint to complete payment
 * window.location.href = initPoint;
 * ```
 */
export async function createSubscription(params: {
  userId: string;
  planId: string;
  email: string;
  planType: 'PRO' | 'BUSINESS';
  cardToken?: string; // Optional: for direct charge without redirect
}): Promise<{
  subscriptionId: string;
  initPoint: string;
  status: string;
}> {
  const { userId, planId, email, planType, cardToken } = params;
  const plan = SUBSCRIPTION_PLANS[planType];
  
  try {
    const subscriptionData: any = {
      preapproval_plan_id: planId,
      reason: `Azuria ${plan.name}`,
      payer_email: email,
      back_url: `${process.env.VITE_APP_URL || 'https://azuria.app.br'}/subscription/success`,
      external_reference: userId, // Your user ID for reference
      status: 'pending',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: plan.price,
        currency_id: 'BRL',
        start_date: new Date().toISOString(),
        billing_day: new Date().getDate()
      }
    };

    // If card token is provided, add payment method
    if (cardToken) {
      subscriptionData.card_token_id = cardToken;
    }

    const response = await mercadopago.preapproval.create(subscriptionData);

    return {
      subscriptionId: response.body.id,
      initPoint: response.body.init_point, // URL to redirect user for payment
      status: response.body.status
    };
  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    throw new Error(`Failed to create subscription: ${error}`);
  }
}

/**
 * Cancel a subscription
 * 
 * This cancels an active subscription in Mercado Pago.
 * The user will keep access until the end of the current billing period.
 * 
 * @param subscriptionId - The Mercado Pago subscription ID
 * @returns Success status
 * 
 * @example
 * ```typescript
 * await cancelSubscription('2c9380848d2a2e3b018d2a4c6e9c0145');
 * // Subscription will be cancelled at the end of current period
 * ```
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await mercadopago.preapproval.update({
      id: subscriptionId,
      status: 'cancelled'
    });

    console.log(`✅ Subscription ${subscriptionId} cancelled successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    throw new Error(`Failed to cancel subscription: ${error}`);
  }
}

/**
 * Get subscription details
 * 
 * Fetches current subscription information from Mercado Pago
 * 
 * @param subscriptionId - The Mercado Pago subscription ID
 * @returns Subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const response = await mercadopago.preapproval.get({
      id: subscriptionId
    });

    return response.body;
  } catch (error) {
    console.error('❌ Error getting subscription:', error);
    throw new Error(`Failed to get subscription: ${error}`);
  }
}

/**
 * Webhook Event Types
 * 
 * Events that Mercado Pago sends to your webhook endpoint
 */
export type MercadoPagoWebhookEvent = 
  | 'payment'           // Payment processed
  | 'subscription'      // Subscription created/updated
  | 'subscription_preapproval'     // Subscription plan events
  | 'subscription_authorized_payment'; // Recurring payment authorized

/**
 * Handle Mercado Pago webhook events
 * 
 * This function processes webhook notifications from Mercado Pago.
 * It should be called from your API webhook endpoint.
 * 
 * @param event - The webhook event data
 * @returns Processed event data
 * 
 * @example
 * ```typescript
 * // In your API route: /api/webhooks/mercadopago
 * export async function POST(req: Request) {
 *   const event = await req.json();
 *   const result = await handleMercadoPagoWebhook(event);
 *   return Response.json(result);
 * }
 * ```
 */
export async function handleMercadoPagoWebhook(event: {
  type: MercadoPagoWebhookEvent;
  action: string;
  data: { id: string };
}) {
  console.log('📥 Webhook received:', event.type, event.action);

  try {
    switch (event.type) {
      case 'payment':
        return await handlePaymentEvent(event.data.id);
      
      case 'subscription':
      case 'subscription_preapproval':
      case 'subscription_authorized_payment':
        return await handleSubscriptionEvent(event.data.id);
      
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
        return { status: 'ignored', type: event.type };
    }
  } catch (error) {
    console.error('❌ Error handling webhook:', error);
    throw error;
  }
}

/**
 * Handle payment events from webhook
 * 
 * Processes individual payment notifications
 */
async function handlePaymentEvent(paymentId: string) {
  try {
    const payment = await mercadopago.payment.get(paymentId);
    
    console.log('💳 Payment status:', payment.body.status);
    console.log('💰 Amount:', payment.body.transaction_amount);
    console.log('👤 Payer:', payment.body.payer?.email);

    // Payment approved - activate subscription
    if (payment.body.status === 'approved') {
      const userId = payment.body.external_reference;
      
      return {
        status: 'approved',
        userId,
        amount: payment.body.transaction_amount,
        paymentId: payment.body.id,
        action: 'activate_subscription'
      };
    }

    // Payment rejected - notify user
    if (payment.body.status === 'rejected') {
      return {
        status: 'rejected',
        reason: payment.body.status_detail,
        action: 'notify_payment_failed'
      };
    }

    return {
      status: payment.body.status,
      action: 'pending'
    };
  } catch (error) {
    console.error('❌ Error handling payment event:', error);
    throw error;
  }
}

/**
 * Handle subscription events from webhook
 * 
 * Processes subscription lifecycle notifications
 */
async function handleSubscriptionEvent(subscriptionId: string) {
  try {
    const subscription = await getSubscription(subscriptionId);
    
    console.log('📋 Subscription status:', subscription.status);
    console.log('👤 Subscriber:', subscription.payer_email);

    const userId = subscription.external_reference;

    switch (subscription.status) {
      case 'authorized':
        // Subscription activated
        return {
          status: 'authorized',
          userId,
          subscriptionId,
          action: 'activate_subscription'
        };

      case 'paused':
        // Subscription paused (payment failed, retrying)
        return {
          status: 'paused',
          userId,
          subscriptionId,
          action: 'pause_subscription'
        };

      case 'cancelled':
        // Subscription cancelled
        return {
          status: 'cancelled',
          userId,
          subscriptionId,
          action: 'deactivate_subscription'
        };

      default:
        return {
          status: subscription.status,
          userId,
          subscriptionId,
          action: 'update_subscription'
        };
    }
  } catch (error) {
    console.error('❌ Error handling subscription event:', error);
    throw error;
  }
}

/**
 * Verify webhook signature (security)
 * 
 * Validates that the webhook request actually came from Mercado Pago
 * 
 * @param signature - x-signature header from webhook request
 * @param requestId - x-request-id header from webhook request
 * @param data - Request body
 * @returns True if signature is valid
 * 
 * @see https://www.mercadopago.com.br/developers/pt/docs/security/notifications/webhooks
 */
export function verifyWebhookSignature(
  signature: string | null,
  requestId: string | null,
  data: string
): boolean {
  // TODO: Implement signature verification
  // For now, we'll just check if the required headers are present
  // In production, you should implement proper HMAC verification
  
  if (!signature || !requestId) {
    console.warn('⚠️ Missing webhook signature headers');
    return false;
  }

  // Add proper signature verification here
  // See: https://www.mercadopago.com.br/developers/pt/docs/security/notifications/webhooks
  
  return true;
}

export default {
  SUBSCRIPTION_PLANS,
  createSubscriptionPlan,
  createSubscription,
  cancelSubscription,
  getSubscription,
  handleMercadoPagoWebhook,
  verifyWebhookSignature
};
