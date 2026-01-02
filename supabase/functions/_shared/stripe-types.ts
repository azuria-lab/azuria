/**
 * Tipos compartilhados para integração com Stripe
 */

export type PlanId = 'free' | 'iniciante' | 'essencial' | 'pro' | 'enterprise';
export type BillingInterval = 'month' | 'year';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';

/**
 * Configuração dos planos com Price IDs do Stripe
 */
export interface StripePlanConfig {
  id: PlanId;
  name: string;
  monthlyPriceId: string; // Stripe Price ID para mensal
  yearlyPriceId: string;  // Stripe Price ID para anual
  limits: {
    calculations_per_day: number;
    calculations_per_month: number;
    ai_queries_per_month: number;
    api_requests_per_month: number;
  };
}

/**
 * IMPORTANTE: Substitua os Price IDs pelos seus próprios do Stripe Dashboard
 * Teste: price_test_xxxxx
 * Produção: price_xxxxx
 */
export const STRIPE_PLANS: Record<Exclude<PlanId, 'free'>, StripePlanConfig> = {
  essencial: {
    id: 'essencial',
    name: 'Plano Essencial',
    monthlyPriceId: process.env.STRIPE_PRICE_ESSENCIAL_MONTHLY || 'price_essencial_monthly',
    yearlyPriceId: process.env.STRIPE_PRICE_ESSENCIAL_YEARLY || 'price_essencial_yearly',
    limits: {
      calculations_per_day: 100,
      calculations_per_month: 2000,
      ai_queries_per_month: 50,
      api_requests_per_month: 100,
    },
  },
  pro: {
    id: 'pro',
    name: 'Plano Pro',
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
    limits: {
      calculations_per_day: 500,
      calculations_per_month: 10000,
      ai_queries_per_month: 200,
      api_requests_per_month: 500,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Plano Enterprise',
    monthlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    yearlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
    limits: {
      calculations_per_day: -1, // ilimitado
      calculations_per_month: -1, // ilimitado
      ai_queries_per_month: -1, // ilimitado
      api_requests_per_month: -1, // ilimitado
    },
  },
};

/**
 * Headers CORS padrão
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Resposta padrão das Edge Functions
 */
export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
