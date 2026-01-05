/**
 * Templates pré-configurados para marketplaces
 * Contém todas as configurações de taxas, comissões e custos para cada marketplace
 */

export interface MarketplaceTemplateConfig {
  id: string;
  name: string;
  description: string;
  // Configurações de marketplace
  marketplaceId: string;
  // Taxas e comissões (em %)
  marketplaceFee: number; // Comissão do marketplace
  paymentFee: number; // Taxa de pagamento
  // Custos operacionais
  shipping: number; // Frete médio
  packaging: number; // Embalagem
  marketing: number; // Marketing/publicidade
  otherCosts: number; // Outros custos
  // Configurações
  paymentMethod: string; // Método de pagamento padrão
  includePaymentFee: boolean; // Se taxa de pagamento está incluída na comissão
  targetMargin: number; // Margem alvo padrão (%)
  // Informações adicionais
  notes?: string; // Observações sobre o template
}

export const MARKETPLACE_TEMPLATES_CONFIG: Record<string, MarketplaceTemplateConfig> = {
  'mercado-livre': {
    id: 'mercado-livre',
    name: 'Mercado Livre',
    description: 'Template completo para Mercado Livre com comissão de 13.5%, taxa de pagamento 4.99% e frete médio',
    marketplaceId: 'mercadolivre',
    marketplaceFee: 13.5, // Comissão variável por categoria, média 13.5%
    paymentFee: 4.99, // Taxa do Mercado Pago
    shipping: 15, // Frete médio
    packaging: 2, // Embalagem
    marketing: 3, // Publicidade no ML (opcional)
    otherCosts: 1, // Outros custos
    paymentMethod: 'mercado_pago',
    includePaymentFee: false, // Taxa separada
    targetMargin: 30,
    notes: 'Comissão varia por categoria. Taxa do Mercado Pago é separada da comissão do marketplace.'
  },
  'shopee': {
    id: 'shopee',
    name: 'Shopee',
    description: 'Template para Shopee com comissão de 14%, taxa de pagamento 2.99% e frete por conta do vendedor',
    marketplaceId: 'shopee',
    marketplaceFee: 14, // Comissão padrão
    paymentFee: 2.99, // ShopeePay
    shipping: 12, // Frete por conta do vendedor
    packaging: 2,
    marketing: 2.5, // Promoções e publicidade
    otherCosts: 1,
    paymentMethod: 'shopee_pay',
    includePaymentFee: false,
    targetMargin: 30,
    notes: 'Shopee tem muitas promoções. Considere cashback de 1-2% nas campanhas.'
  },
  'amazon': {
    id: 'amazon',
    name: 'Amazon',
    description: 'Template para Amazon Brasil com comissão de 15%, FBA disponível e configurações otimizadas',
    marketplaceId: 'amazon',
    marketplaceFee: 15, // Comissão padrão
    paymentFee: 0, // Incluído na comissão
    shipping: 0, // FBA ou frete do vendedor
    packaging: 3, // Se não usar FBA
    marketing: 5, // Amazon Ads
    otherCosts: 2,
    paymentMethod: 'credit_card',
    includePaymentFee: true, // Incluído na comissão
    targetMargin: 35,
    notes: 'FBA (Fulfillment by Amazon) tem custos adicionais mas facilita muito a operação. Comissão varia por categoria.'
  },
  'magalu': {
    id: 'magalu',
    name: 'Magazine Luiza',
    description: 'Template para Magazine Luiza com comissão de 18% e configurações de frete',
    marketplaceId: 'magalu',
    marketplaceFee: 18, // Comissão mais alta
    paymentFee: 0,
    shipping: 10,
    packaging: 2,
    marketing: 3,
    otherCosts: 1,
    paymentMethod: 'credit_card',
    includePaymentFee: true,
    targetMargin: 30,
    notes: 'Comissão mais alta, mas bom alcance. Frete pode ser compartilhado com o marketplace.'
  }
};

/**
 * Converte template config para formato que pode ser salvo como CalculationTemplate
 */
export function marketplaceConfigToTemplateData(
  config: MarketplaceTemplateConfig
): {
  name: string;
  description: string;
  category: string;
  default_values: Record<string, unknown>;
  sector_specific_config: Record<string, unknown>;
} {
  return {
    name: config.name,
    description: config.description,
    category: 'ecommerce',
    default_values: {
      marketplaceId: config.marketplaceId,
      marketplaceFee: config.marketplaceFee,
      paymentFee: config.paymentFee,
      shipping: config.shipping,
      packaging: config.packaging,
      marketing: config.marketing,
      otherCosts: config.otherCosts,
      paymentMethod: config.paymentMethod,
      includePaymentFee: config.includePaymentFee,
      targetMargin: config.targetMargin,
    },
    sector_specific_config: {
      marketplace: config.marketplaceId,
      notes: config.notes || '',
    },
  };
}
