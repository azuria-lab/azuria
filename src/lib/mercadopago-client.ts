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
 */
const MERCADOPAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

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
 * @param userId - ID do usuário
 * @returns Dados da preferência criada
 */
export async function createPaymentPreference(
  planType: Exclude<PlanId, 'free' | 'enterprise'>,
  userId: string
): Promise<PreferenceData> {
  try {
    const { data, error } = await supabase.functions.invoke('mercadopago-create-preference', {
      body: {
        planType,
        userId,
      },
    });

    if (error) {
      throw error;
    }
    
    return data as PreferenceData;
  } catch (_error) {
    throw new Error('Falha ao criar preferência de pagamento');
  }
}

/**
 * Cria uma assinatura recorrente no Mercado Pago
 * 
 * @param planType - Tipo do plano (essencial ou pro)
 * @param userId - ID do usuário
 * @returns Dados da assinatura criada
 */
export async function createSubscription(
  planType: Exclude<PlanId, 'free' | 'enterprise'>,
  userId: string
): Promise<SubscriptionData> {
  try {
    const { data, error } = await supabase.functions.invoke('mercadopago-create-subscription', {
      body: {
        planType,
        userId,
      },
    });

    if (error) {
      throw error;
    }
    
    return data as SubscriptionData;
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
 * @returns Chave pública configurada
 */
export function getPublicKey(): string {
  if (!MERCADOPAGO_PUBLIC_KEY) {
    throw new Error('Chave pública do Mercado Pago não configurada');
  }
  return MERCADOPAGO_PUBLIC_KEY;
}

/**
 * Verifica se está em modo de teste
 * 
 * @returns true se estiver usando credenciais de teste
 */
export function isTestMode(): boolean {
  return MERCADOPAGO_PUBLIC_KEY?.startsWith('TEST-') ?? false;
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
