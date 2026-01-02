import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withSecurityMiddleware } from '../_shared/security-config.ts';
import AbacatePay from 'npm:abacatepay-nodejs-sdk@^1.0.0';

/**
 * Edge Function para criar cobranças no Abacatepay
 */
async function handleCreateBilling(req: Request): Promise<Response> {
  // Verificar autenticação
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  // Criar cliente Supabase
  const supabaseClient = createClient(
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
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Parse request body
  const { planId, billingInterval, methods } = await req.json();

  if (!planId || !billingInterval) {
    throw new Error('Missing required parameters: planId and billingInterval');
  }

  // Mapear produtos baseado no plano
  const PRODUCTS = {
    essencial: {
      monthly: {
        externalId: 'AZURIA-ESSENCIAL-MONTHLY',
        name: 'Plano Essencial - Mensal',
        description: 'Acesso completo às funcionalidades essenciais da Azuria',
        quantity: 1,
        price: 5900,
      },
      annual: {
        externalId: 'AZURIA-ESSENCIAL-ANNUAL',
        name: 'Plano Essencial - Anual',
        description:
          'Acesso completo às funcionalidades essenciais da Azuria por 12 meses',
        quantity: 1,
        price: 59000,
      },
    },
    pro: {
      monthly: {
        externalId: 'AZURIA-PRO-MONTHLY',
        name: 'Plano Pro - Mensal',
        description:
          'Acesso completo a todas as funcionalidades avançadas da Azuria',
        quantity: 1,
        price: 14900,
      },
      annual: {
        externalId: 'AZURIA-PRO-ANNUAL',
        name: 'Plano Pro - Anual',
        description:
          'Acesso completo a todas as funcionalidades avançadas da Azuria por 12 meses',
        quantity: 1,
        price: 149000,
      },
    },
  };

  const product = PRODUCTS[planId]?.[billingInterval];
  if (!product) {
    throw new Error('Invalid plan or billing interval');
  }

  // Obter dados do usuário
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single();

  const userEmail = profile?.email || user.email || '';

  // Inicializar SDK do Abacatepay
  const abacateApiKey = Deno.env.get('ABACATEPAY_API_KEY');
  if (!abacateApiKey) {
    throw new Error('Abacatepay API key not configured');
  }

  const abacate = AbacatePay(abacateApiKey);

  // Determinar frequência
  const frequency = billingInterval === 'monthly' ? 'MONTHLY' : 'ONE_TIME';

  // URLs de retorno
  const origin = req.headers.get('origin') || 'https://azuria.app.br';
  const returnUrl = `${origin}/pricing`;
  const completionUrl = `${origin}/payment/success`;

  // Criar cobrança
  const devMode = Deno.env.get('VITE_ABACATEPAY_DEV_MODE') === 'true';

  console.log('Creating billing with AbacatePay:', {
    planId,
    billingInterval,
    frequency,
    methods: methods || ['PIX', 'CARD'],
    devMode,
    userEmail,
  });

  const billing = await abacate.billing.create({
    frequency,
    methods: methods || ['PIX', 'CARD'],
    products: [product],
    returnUrl,
    completionUrl,
    customer: {
      email: userEmail,
      name: profile?.full_name,
    },
    metadata: {
      userId: user.id,
      planId,
      billingInterval,
    },
  });

  console.log('AbacatePay billing response:', {
    hasError: !!billing.error,
    hasData: !!billing.data,
    error: billing.error,
  });

  if (billing.error) {
    console.error('AbacatePay error:', billing.error);
    throw new Error(`AbacatePay API error: ${billing.error}`);
  }

  if (!billing.data) {
    console.error('AbacatePay returned no data');
    throw new Error('Failed to create billing: No data returned from AbacatePay');
  }

  // Buscar subscription existente do usuário (se houver)
  const { data: existingSubscription } = await supabaseClient
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('payment_provider', 'abacatepay')
    .single();

  // Salvar no banco de dados
  const { error: insertError } = await supabaseClient
    .from('abacatepay_billings')
    .insert({
      user_id: user.id,
      subscription_id: existingSubscription?.id || null,
      billing_id: billing.data.id,
      plan_id: planId,
      billing_interval: billingInterval,
      amount: product.price,
      status: 'PENDING',
      payment_url: billing.data.url,
      methods: methods || ['PIX', 'CARD'],
      frequency,
      metadata: {
        devMode,
        externalId: product.externalId,
      },
    });

  if (insertError) {
    console.error('Error saving billing to database:', insertError);
    // Não falhar a requisição se apenas o salvamento no banco falhar
  }

  // Retornar resposta de sucesso
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        billingId: billing.data.id,
        url: billing.data.url,
        amount: product.price,
      },
      error: null,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Wrap handler with security middleware
// Requires authentication
Deno.serve(
  withSecurityMiddleware(handleCreateBilling, { allowCredentials: true })
);
