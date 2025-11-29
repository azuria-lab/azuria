import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function para receber webhooks do Abacatepay
 */
serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

        // Ativar assinatura do usuário
        await activateSubscription(
          supabaseAdmin,
          billingRecord.user_id,
          billingRecord.plan_id,
          billingRecord.billing_interval
        );
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

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
