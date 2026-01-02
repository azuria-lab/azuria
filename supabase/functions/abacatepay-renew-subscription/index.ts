import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withSecurityMiddleware } from '../_shared/security-config.ts';
import AbacatePay from 'npm:abacatepay-nodejs-sdk@^1.0.0';

/**
 * Edge Function para renovar assinatura AbacatePay
 * Cria uma nova cobrança quando a assinatura está próxima do vencimento
 * 
 * Esta função pode ser chamada:
 * 1. Automaticamente por um cron job
 * 2. Manualmente via API para uma subscription específica
 */
async function handleRenewSubscription(req: Request): Promise<Response> {
  // Criar cliente Supabase com service role (para operações administrativas)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const body = await req.json().catch(() => ({}));
    const { subscriptionId, userId } = body;

    // Se subscriptionId for fornecido, renovar apenas essa subscription
    if (subscriptionId) {
      return await renewSpecificSubscription(supabaseAdmin, subscriptionId);
    }

    // Se userId for fornecido, renovar subscription desse usuário
    if (userId) {
      return await renewUserSubscription(supabaseAdmin, userId);
    }

    // Se nenhum parâmetro específico, verificar todas as subscriptions que precisam renovar
    // (útil para chamadas via cron job)
    return await renewPendingSubscriptions(supabaseAdmin);
  } catch (error) {
    console.error('Error in handleRenewSubscription:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}

/**
 * Renova uma subscription específica
 */
async function renewSpecificSubscription(
  supabase: any,
  subscriptionId: string
): Promise<Response> {
  // Buscar subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('payment_provider', 'abacatepay')
    .eq('status', 'active')
    .single();

  if (subError || !subscription) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Subscription not found or invalid',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  }

  // Verificar se precisa renovar (3 dias antes do vencimento)
  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);
  const daysUntilExpiry = Math.ceil(
    (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry > 3) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Subscription not ready for renewal. Expires in ${daysUntilExpiry} days.`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  // Verificar se já existe uma cobrança pendente de renovação
  const { data: existingBilling } = await supabase
    .from('abacatepay_billings')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existingBilling) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Renewal billing already exists',
        billingId: existingBilling.id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  // Criar nova cobrança
  const result = await createRenewalBilling(supabase, subscription);
  
  return new Response(
    JSON.stringify(result),
    {
      headers: { 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500,
    }
  );
}

/**
 * Renova subscription de um usuário específico
 */
async function renewUserSubscription(
  supabase: any,
  userId: string
): Promise<Response> {
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('payment_provider', 'abacatepay')
    .eq('status', 'active')
    .single();

  if (subError || !subscription) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Subscription not found',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  }

  return await renewSpecificSubscription(supabase, subscription.id);
}

/**
 * Renova todas as subscriptions que precisam de renovação
 * (chamado por cron job)
 */
async function renewPendingSubscriptions(supabase: any): Promise<Response> {
  // Buscar subscriptions ativas do AbacatePay que expiram em até 3 dias
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('payment_provider', 'abacatepay')
    .eq('status', 'active')
    .lte('current_period_end', threeDaysFromNow.toISOString())
    .is('cancel_at_period_end', false); // Não renovar se cancelada

  if (subError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: subError.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No subscriptions need renewal',
        renewed: 0,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  const results = [];
  for (const subscription of subscriptions) {
    // Verificar se já existe cobrança pendente
    const { data: existingBilling } = await supabase
      .from('abacatepay_billings')
      .select('id')
      .eq('subscription_id', subscription.id)
      .eq('status', 'PENDING')
      .single();

    if (!existingBilling) {
      try {
        const result = await createRenewalBilling(supabase, subscription);
        results.push({
          subscriptionId: subscription.id,
          userId: subscription.user_id,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        results.push({
          subscriptionId: subscription.id,
          userId: subscription.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  const successful = results.filter((r) => r.success).length;
  
  return new Response(
    JSON.stringify({
      success: true,
      renewed: successful,
      total: subscriptions.length,
      results,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Cria uma nova cobrança de renovação no AbacatePay
 */
async function createRenewalBilling(
  supabase: any,
  subscription: any
): Promise<{ success: boolean; error?: string; billingId?: string; url?: string }> {
  // Inicializar SDK do AbacatePay
  const abacateApiKey = Deno.env.get('ABACATEPAY_API_KEY');
  if (!abacateApiKey) {
    throw new Error('Abacatepay API key not configured');
  }

  const abacate = AbacatePay(abacateApiKey);

  // Mapear produtos
  const PRODUCTS = {
    essencial: {
      monthly: {
        externalId: 'AZURIA-ESSENCIAL-MONTHLY',
        name: 'Plano Essencial - Mensal',
        description: 'Renovação - Acesso completo às funcionalidades essenciais da Azuria',
        quantity: 1,
        price: 5900,
      },
      annual: {
        externalId: 'AZURIA-ESSENCIAL-ANNUAL',
        name: 'Plano Essencial - Anual',
        description: 'Renovação - Acesso completo às funcionalidades essenciais da Azuria por 12 meses',
        quantity: 1,
        price: 59000,
      },
    },
    pro: {
      monthly: {
        externalId: 'AZURIA-PRO-MONTHLY',
        name: 'Plano Pro - Mensal',
        description: 'Renovação - Acesso completo a todas as funcionalidades avançadas da Azuria',
        quantity: 1,
        price: 14900,
      },
      annual: {
        externalId: 'AZURIA-PRO-ANNUAL',
        name: 'Plano Pro - Anual',
        description: 'Renovação - Acesso completo a todas as funcionalidades avançadas da Azuria por 12 meses',
        quantity: 1,
        price: 149000,
      },
    },
  };

  const product = PRODUCTS[subscription.plan_id]?.[subscription.billing_interval];
  if (!product) {
    throw new Error(`Invalid plan or billing interval: ${subscription.plan_id}/${subscription.billing_interval}`);
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', subscription.user_id)
    .single();

  // Buscar email do usuário do auth
  const { data: authUser } = await supabase.auth.admin.getUserById(subscription.user_id);
  const userEmail = profile?.email || authUser?.user?.email || '';

  // Determinar frequência
  const frequency = subscription.billing_interval === 'monthly' ? 'MONTHLY' : 'ONE_TIME';

  // URLs de retorno
  const origin = Deno.env.get('VITE_APP_URL') || 'https://azuria.app.br';
  const returnUrl = `${origin}/pricing`;
  const completionUrl = `${origin}/payment/success`;

  // Criar cobrança
  const devMode = Deno.env.get('VITE_ABACATEPAY_DEV_MODE') === 'true';

  const billing = await abacate.billing.create({
    frequency,
    methods: ['PIX', 'CARD'],
    products: [product],
    returnUrl,
    completionUrl,
    customer: {
      email: userEmail,
      name: profile?.full_name,
    },
    metadata: {
      userId: subscription.user_id,
      planId: subscription.plan_id,
      billingInterval: subscription.billing_interval,
      subscriptionId: subscription.id,
      isRenewal: true,
    },
    devMode,
  });

  if (billing.error) {
    return {
      success: false,
      error: billing.error,
    };
  }

  if (!billing.data) {
    return {
      success: false,
      error: 'Failed to create billing',
    };
  }

  // Salvar no banco de dados
  const { error: insertError } = await supabase
    .from('abacatepay_billings')
    .insert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      billing_id: billing.data.id,
      plan_id: subscription.plan_id,
      billing_interval: subscription.billing_interval,
      amount: product.price,
      status: 'PENDING',
      payment_url: billing.data.url,
      methods: ['PIX', 'CARD'],
      frequency,
      metadata: {
        devMode,
        externalId: product.externalId,
        isRenewal: true,
      },
    });

  if (insertError) {
    console.error('Error saving renewal billing to database:', insertError);
    return {
      success: false,
      error: insertError.message,
    };
  }

  return {
    success: true,
    billingId: billing.data.id,
    url: billing.data.url,
  };
}

// Wrap handler with security middleware
// Esta função pode ser chamada por service role (cron job) ou com autenticação
Deno.serve(withSecurityMiddleware(handleRenewSubscription));

