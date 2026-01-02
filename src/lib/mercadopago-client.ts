/**
 * Cliente do Mercado Pago para gerenciamento de pagamentos e assinaturas
 * 
 * @module mercadopago-client
 */

import { supabase } from '@/integrations/supabase/client';
import type { PlanId } from '@/types/subscription';

/**
 * Mapeamento de planos para preços
 */
export const PLAN_PRICES: Record<Exclude<PlanId, 'free' | 'enterprise'>, number> = {
  iniciante: 29.00,
  essencial: 59.00,
  pro: 119.00,
};

/**
 * Configuração do Mercado Pago
 * 
 * NOTA: Toda a integração é feita via Edge Functions no backend.
 * A chave pública não é necessária no frontend, pois não usamos o SDK do Mercado Pago diretamente.
 * Todas as operações (criar preferências, assinaturas, etc.) são feitas via Supabase Edge Functions.
 */

/**
 * Dados da preferência de pagamento
 */
export interface PreferenceData {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

/**
 * Dados do pagamento
 */
export interface PaymentData {
  id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  payment_type_id: string;
  payment_method_id: string;
  transaction_amount: number;
  date_created: string;
  date_approved?: string;
}

/**
 * Dados da assinatura (preapproval)
 */
export interface SubscriptionData {
  id: string;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  reason: string;
  payer_email: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'days' | 'months';
    transaction_amount: number;
    currency_id: string;
  };
  back_url: string;
  init_point: string;
  sandbox_init_point: string;
}

/**
 * Cria uma preferência de pagamento no Mercado Pago
 * 
 * @param planType - Tipo do plano (essencial ou pro)
 * @param billingInterval - Intervalo de cobrança ('monthly' ou 'annual')
 * @returns Dados da preferência criada
 */
export async function createPaymentPreference(
  planType: Exclude<PlanId, 'free' | 'enterprise'>,
  billingInterval: 'monthly' | 'annual' = 'monthly'
): Promise<PreferenceData> {
  try {
    // Obter sessão para pegar o access_token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase.functions.invoke('create-payment-preference', {
      body: {
        planId: planType,
        billingInterval: billingInterval,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw error;
    }
    
    // A função retorna { success, data: { checkoutUrl, preferenceId } }
    // Precisamos adaptar para o formato esperado
    const response = data as { success: boolean; data: { checkoutUrl: string; preferenceId: string } };
    
    return {
      id: response.data.preferenceId,
      init_point: response.data.checkoutUrl,
      sandbox_init_point: response.data.checkoutUrl, // Usar mesma URL para sandbox
    };
  } catch (_error) {
    throw new Error('Falha ao criar preferência de pagamento');
  }
}

/**
 * Cria uma assinatura recorrente no Mercado Pago
 * 
 * @param planType - Tipo do plano (essencial ou pro)
 * @param billingInterval - Intervalo de cobrança ('monthly' ou 'annual')
 * @returns Dados da assinatura criada
 */
export async function createSubscription(
  planType: Exclude<PlanId, 'free' | 'enterprise'>,
  billingInterval: 'monthly' | 'annual' = 'monthly'
): Promise<SubscriptionData> {
  try {
    // Obter sessão para pegar o access_token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: {
        planId: planType,
        billingInterval: billingInterval,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw error;
    }
    
    // A função retorna { success, data: { checkoutUrl, subscriptionId } }
    // Precisamos adaptar para o formato esperado
    const response = data as { success: boolean; data: { checkoutUrl: string; subscriptionId: string } };
    
    return {
      id: response.data.subscriptionId,
      status: 'pending',
      reason: `Azuria ${planType}`,
      payer_email: '', // Será preenchido pelo Mercado Pago
      auto_recurring: {
        frequency: billingInterval === 'monthly' ? 1 : 12,
        frequency_type: billingInterval === 'monthly' ? 'months' : 'months',
        transaction_amount: PLAN_PRICES[planType],
        currency_id: 'BRL',
      },
      back_url: '',
      init_point: response.data.checkoutUrl,
      sandbox_init_point: response.data.checkoutUrl,
    };
  } catch (_error) {
    throw new Error('Falha ao criar assinatura');
  }
}

/**
 * Busca dados de um pagamento específico
 * 
 * @param paymentId - ID do pagamento
 * @returns Dados do pagamento
 */
export async function getPayment(paymentId: string): Promise<PaymentData> {
  try {
    const { data, error } = await supabase.functions.invoke('mercadopago-get-payment', {
      body: { paymentId },
    });

    if (error) {
      throw error;
    }
    
    return data as PaymentData;
  } catch (_error) {
    throw new Error('Falha ao buscar dados do pagamento');
  }
}

/**
 * Cancela uma assinatura no Mercado Pago
 * 
 * @param subscriptionId - ID da assinatura no Mercado Pago
 * @returns Dados da assinatura cancelada
 */
export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionData> {
  try {
    const { data, error } = await supabase.functions.invoke('mercadopago-cancel-subscription', {
      body: { subscriptionId },
    });

    if (error) {
      throw error;
    }
    
    return data as SubscriptionData;
  } catch (_error) {
    throw new Error('Falha ao cancelar assinatura');
  }
}

/**
 * Atualiza uma assinatura no Mercado Pago
 * 
 * @param subscriptionId - ID da assinatura no Mercado Pago
 * @param updates - Dados para atualizar
 * @returns Dados da assinatura atualizada
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: {
    reason?: string;
    status?: 'paused' | 'authorized';
    auto_recurring?: {
      transaction_amount?: number;
    };
  }
): Promise<SubscriptionData> {
  try {
    const { data, error } = await supabase.functions.invoke('mercadopago-update-subscription', {
      body: {
        subscriptionId,
        updates,
      },
    });

    if (error) {
      throw error;
    }
    
    return data as SubscriptionData;
  } catch (_error) {
    throw new Error('Falha ao atualizar assinatura');
  }
}

/**
 * Obtém a chave pública do Mercado Pago
 * 
 * @deprecated Não é mais necessário, pois toda a integração é feita via Edge Functions
 * @returns Chave pública configurada (se disponível)
 */
export function getPublicKey(): string {
  // Não é mais necessário, mas mantido para compatibilidade
  throw new Error('Chave pública não é mais necessária. Use Edge Functions.');
}

/**
 * Verifica se está em modo de teste
 * 
 * @deprecated Não é mais necessário, pois toda a integração é feita via Edge Functions
 * @returns true se estiver usando credenciais de teste
 */
export function isTestMode(): boolean {
  // Não é mais necessário, mas mantido para compatibilidade
  return false;
}

/**
 * Formata valor em reais para o formato do Mercado Pago
 * 
 * @param value - Valor em reais
 * @returns Valor formatado
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Obtém a descrição do plano
 * 
 * @param planType - Tipo do plano
 * @returns Descrição do plano
 */
export function getPlanDescription(planType: PlanId): string {
  const descriptions: Record<PlanId, string> = {
    free: 'Plano Gratuito - Azuria',
    iniciante: 'Plano Iniciante - Azuria',
    essencial: 'Plano Essencial - Azuria',
    pro: 'Plano Pro - Azuria',
    enterprise: 'Plano Enterprise - Azuria',
  };
  
  return descriptions[planType];
}
