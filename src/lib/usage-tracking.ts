/**
 * Utilitários para tracking de uso e aplicação de limites
 * Use essas funções nas operações críticas da aplicação
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Incrementa contador de cálculos no Supabase
 * @returns true se incrementou com sucesso, false se atingiu limite ou erro
 */
export const incrementCalculationCount = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Buscar usage atual
    const { data: usage, error: fetchError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !usage) {
      return false;
    }

    // Incrementar contadores
    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update({
        calculations_today: usage.calculations_today + 1,
        calculations_this_month: usage.calculations_this_month + 1,
        last_calculation_at: new Date().toISOString(),
      })
      .eq('id', usage.id);

    return !updateError;
  } catch {
    return false;
  }
};

/**
 * Incrementa contador de queries de IA
 */
export const incrementAIQueryCount = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: usage, error: fetchError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !usage) {
      return false;
    }

    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update({
        ai_queries_this_month: usage.ai_queries_this_month + 1,
        last_ai_query_at: new Date().toISOString(),
      })
      .eq('id', usage.id);

    return !updateError;
  } catch {
    return false;
  }
};

/**
 * Incrementa contador de requisições API
 */
export const incrementAPIRequestCount = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: usage, error: fetchError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !usage) {
      return false;
    }

    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update({
        api_requests_this_month: usage.api_requests_this_month + 1,
        last_api_request_at: new Date().toISOString(),
      })
      .eq('id', usage.id);

    return !updateError;
  } catch {
    return false;
  }
};

/**
 * Verifica se usuário pode fazer um cálculo
 */
export const canMakeCalculation = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Buscar subscription e usage
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return false;
    }

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('calculations_today')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!usage) {
      return false;
    }

    // Limites por plano
    const limits: Record<string, number | 'unlimited'> = {
      free: 10,
      essencial: 100,
      pro: 'unlimited',
      enterprise: 'unlimited',
    };

    const limit = limits[subscription.plan_id];

    if (limit === 'unlimited') {
      return true;
    }

    return usage.calculations_today < limit;
  } catch {
    return false;
  }
};

/**
 * Verifica se usuário pode fazer query à IA
 */
export const canMakeAIQuery = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return false;
    }

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('ai_queries_this_month')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!usage) {
      return false;
    }

    const limits: Record<string, number | 'unlimited'> = {
      free: 0,
      essencial: 0,
      pro: 500,
      enterprise: 'unlimited',
    };

    const limit = limits[subscription.plan_id];

    if (limit === 0) {
      return false;
    }

    if (limit === 'unlimited') {
      return true;
    }

    return usage.ai_queries_this_month < limit;
  } catch {
    return false;
  }
};

/**
 * Verifica se usuário pode fazer requisição à API
 */
export const canMakeAPIRequest = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return false;
    }

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('api_requests_this_month')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!usage) {
      return false;
    }

    const limits: Record<string, number | 'unlimited'> = {
      free: 0,
      essencial: 0,
      pro: 5000,
      enterprise: 'unlimited',
    };

    const limit = limits[subscription.plan_id];

    if (limit === 0) {
      return false;
    }

    if (limit === 'unlimited') {
      return true;
    }

    return usage.api_requests_this_month < limit;
  } catch {
    return false;
  }
};
