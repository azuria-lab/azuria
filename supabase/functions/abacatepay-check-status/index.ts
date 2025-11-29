import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import AbacatePay from 'npm:abacatepay-nodejs-sdk@^1.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function para verificar status de cobrança no Abacatepay
 */
serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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
    const { billingId } = await req.json();

    if (!billingId) {
      throw new Error('Missing required parameter: billingId');
    }

    // Inicializar SDK do Abacatepay
    const abacateApiKey = Deno.env.get('ABACATEPAY_API_KEY');
    if (!abacateApiKey) {
      throw new Error('Abacatepay API key not configured');
    }

    const abacate = AbacatePay(abacateApiKey);

    // Buscar status da cobrança
    const billing = await abacate.billing.get(billingId);

    if (billing.error) {
      throw new Error(billing.error);
    }

    if (!billing.data) {
      throw new Error('Billing not found');
    }

    // Atualizar no banco de dados
    const { error: updateError } = await supabaseClient
      .from('abacatepay_billings')
      .update({
        status: billing.data.status,
        updated_at: new Date().toISOString(),
        ...(billing.data.status === 'PAID' && {
          paid_at: billing.data.updatedAt,
        }),
      })
      .eq('billing_id', billingId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating billing status:', updateError);
      // Não falhar a requisição se apenas o update falhar
    }

    // Retornar status
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: billing.data.status,
          amount: billing.data.amount,
          paidAt:
            billing.data.status === 'PAID' ? billing.data.updatedAt : undefined,
        },
        error: null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in abacatepay-check-status:', error);

    return new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
