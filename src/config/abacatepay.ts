/**
 * Configuração de produtos e preços do Abacatepay
 * @module config/abacatepay
 */

import type { AbacatePayProduct } from '@/types/abacatepay';

/**
 * Configuração de produtos por plano e intervalo de cobrança
 */
export const ABACATEPAY_PRODUCTS = {
  essencial: {
    monthly: {
      externalId: 'AZURIA-ESSENCIAL-MONTHLY',
      name: 'Plano Essencial - Mensal',
      description: 'Acesso completo às funcionalidades essenciais da Azuria',
      quantity: 1,
      price: 5900, // R$ 59,00 em centavos
    } as AbacatePayProduct,
    annual: {
      externalId: 'AZURIA-ESSENCIAL-ANNUAL',
      name: 'Plano Essencial - Anual',
      description:
        'Acesso completo às funcionalidades essenciais da Azuria por 12 meses',
      quantity: 1,
      price: 59000, // R$ 590,00 em centavos (equivalente a ~R$ 49,17/mês - 17% de desconto)
    } as AbacatePayProduct,
  },
  pro: {
    monthly: {
      externalId: 'AZURIA-PRO-MONTHLY',
      name: 'Plano Pro - Mensal',
      description:
        'Acesso completo a todas as funcionalidades avançadas da Azuria',
      quantity: 1,
      price: 14900, // R$ 149,00 em centavos
    } as AbacatePayProduct,
    annual: {
      externalId: 'AZURIA-PRO-ANNUAL',
      name: 'Plano Pro - Anual',
      description:
        'Acesso completo a todas as funcionalidades avançadas da Azuria por 12 meses',
      quantity: 1,
      price: 149000, // R$ 1.490,00 em centavos (equivalente a ~R$ 124,17/mês - 17% de desconto)
    } as AbacatePayProduct,
  },
  enterprise: {
    monthly: {
      externalId: 'AZURIA-ENTERPRISE-MONTHLY',
      name: 'Plano Enterprise - Mensal',
      description: 'Solução completa e customizável para empresas',
      quantity: 1,
      price: 29900, // R$ 299,00 em centavos (preço base, pode ser customizado)
    } as AbacatePayProduct,
    annual: {
      externalId: 'AZURIA-ENTERPRISE-ANNUAL',
      name: 'Plano Enterprise - Anual',
      description: 'Solução completa e customizável para empresas por 12 meses',
      quantity: 1,
      price: 299000, // R$ 2.990,00 em centavos (preço base, pode ser customizado)
    } as AbacatePayProduct,
  },
} as const;

/**
 * Métodos de pagamento padrão
 */
export const DEFAULT_PAYMENT_METHODS = ['PIX', 'CARD'] as const;

/**
 * Obter produto baseado no plano e intervalo
 */
export function getAbacatePayProduct(
  planId: 'essencial' | 'pro' | 'enterprise',
  billingInterval: 'monthly' | 'annual'
): AbacatePayProduct {
  return ABACATEPAY_PRODUCTS[planId][billingInterval];
}

/**
 * Formatar valor em centavos para reais
 */
export function formatCentsToReais(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Converter reais para centavos
 */
export function convertReaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * URLs de retorno e conclusão
 */
export const ABACATEPAY_URLS = {
  returnUrl:
    typeof globalThis.window !== 'undefined'
      ? `${globalThis.window.location.origin}/pricing`
      : 'https://azuria.app.br/pricing',
  completionUrl:
    typeof globalThis.window !== 'undefined'
      ? `${globalThis.window.location.origin}/payment/success`
      : 'https://azuria.app.br/payment/success',
} as const;
