/**
 * Tipos TypeScript para integração com Abacatepay
 * @module types/abacatepay
 */

/**
 * Status possíveis de uma cobrança no Abacatepay
 */
export type AbacatePayBillingStatus =
  | 'PENDING'
  | 'PAID'
  | 'REFUNDED'
  | 'EXPIRED';

/**
 * Métodos de pagamento suportados
 */
export type AbacatePayMethod = 'PIX' | 'CARD';

/**
 * Frequência de cobrança
 */
export type AbacatePayFrequency = 'ONE_TIME' | 'MONTHLY' | 'YEARLY';

/**
 * Produto para cobrança
 */
export interface AbacatePayProduct {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number; // Valor em centavos
}

/**
 * Dados do cliente
 */
export interface AbacatePayCustomer {
  id?: string;
  email: string;
  name?: string;
  cellphone?: string;
  taxId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Resposta da API do Abacatepay para criação de cobrança
 */
export interface AbacatePayBilling {
  id: string;
  url: string;
  amount: number;
  status: AbacatePayBillingStatus;
  devMode: boolean;
  methods: AbacatePayMethod[];
  frequency: AbacatePayFrequency;
  nextBilling: string | null;
  customer: {
    id: string;
    metadata: {
      email: string;
      [key: string]: unknown;
    };
  };
  products?: AbacatePayProduct[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Parâmetros para criar uma cobrança
 */
export interface CreateBillingParams {
  frequency: AbacatePayFrequency;
  methods: AbacatePayMethod[];
  products: AbacatePayProduct[];
  returnUrl: string;
  completionUrl: string;
  customer: AbacatePayCustomer;
  customerId?: string;
  allowCoupons?: boolean;
  coupons?: string[];
  externalId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Resposta padrão da API do Abacatepay
 */
export interface AbacatePayResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Parâmetros para criar cobrança de assinatura
 */
export interface CreateSubscriptionBillingParams {
  planId: 'essencial' | 'pro' | 'enterprise';
  billingInterval: 'monthly' | 'annual';
  methods?: AbacatePayMethod[];
}

/**
 * Evento de webhook do Abacatepay
 */
export interface AbacatePayWebhookEvent {
  id: string;
  kind:
    | 'billing.paid'
    | 'billing.refunded'
    | 'billing.expired'
    | 'billing.created';
  billing: AbacatePayBilling;
  createdAt: string;
}

/**
 * Dados salvos no banco de dados
 */
export interface AbacatePayBillingRecord {
  id: string;
  user_id: string;
  billing_id: string;
  plan_id: string;
  billing_interval: string;
  amount: number;
  status: AbacatePayBillingStatus;
  payment_url: string;
  methods: AbacatePayMethod[];
  frequency: AbacatePayFrequency;
  metadata?: Record<string, unknown>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}
