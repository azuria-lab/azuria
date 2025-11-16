/**
 * Tipos compartilhados entre as Edge Functions
 */

export type PlanId = 'free' | 'essencial' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';

/**
 * Configuração dos planos
 */
export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  limits: {
    calculations_per_day: number;
    calculations_per_month: number;
    ai_queries_per_month: number;
    api_requests_per_month: number;
  };
}

/**
 * Planos disponíveis
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Plano Gratuito',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: {
      calculations_per_day: 10,
      calculations_per_month: 100,
      ai_queries_per_month: 0,
      api_requests_per_month: 0,
    },
  },
  essencial: {
    id: 'essencial',
    name: 'Plano Essencial',
    monthlyPrice: 29.90,
    annualPrice: 299.00,
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
    monthlyPrice: 79.90,
    annualPrice: 799.00,
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
    monthlyPrice: 299.90,
    annualPrice: 2999.00,
    limits: {
      calculations_per_day: -1, // ilimitado
      calculations_per_month: -1, // ilimitado
      ai_queries_per_month: -1, // ilimitado
      api_requests_per_month: -1, // ilimitado
    },
  },
};

/**
 * Estrutura de resposta do Mercado Pago - Subscription
 */
export interface MercadoPagoSubscription {
  id: string;
  preapproval_plan_id: string;
  payer_id: number;
  status: string;
  reason: string;
  external_reference: string;
  date_created: string;
  last_modified: string;
  init_point: string;
  sandbox_init_point: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
  back_url: string;
  payment_method_id?: string;
}

/**
 * Estrutura de resposta do Mercado Pago - Preference
 */
export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer?: {
    email?: string;
    name?: string;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: string;
  external_reference?: string;
}

/**
 * Estrutura de notificação do Mercado Pago (Webhook)
 */
export interface MercadoPagoWebhookNotification {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
  date_created: string;
  application_id: number;
  user_id: string;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

/**
 * Estrutura de pagamento do Mercado Pago
 */
export interface MercadoPagoPayment {
  id: number;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  money_release_date?: string;
  operation_type: string;
  issuer_id: string;
  payment_method_id: string;
  payment_type_id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  currency_id: string;
  description?: string;
  live_mode: boolean;
  sponsor_id?: number;
  authorization_code?: string;
  money_release_schema?: string;
  taxes_amount: number;
  counter_currency?: string;
  shipping_amount: number;
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  transaction_details: {
    payment_method_reference_id?: string;
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    external_resource_url?: string;
    installment_amount: number;
    financial_institution?: string;
  };
  installments: number;
  external_reference?: string;
  payer: {
    type?: string;
    id?: string;
    email?: string;
    identification?: {
      type: string;
      number: string;
    };
    phone?: {
      area_code?: string;
      number?: string;
      extension?: string;
    };
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Resposta padrão das Edge Functions
 */
export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Headers CORS padrão
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
