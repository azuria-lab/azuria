export interface MarketplaceTemplate {
  id: string;
  name: string;
  logo: string;
  category: 'ecommerce' | 'social' | 'marketplace' | 'custom';
  defaultValues: {
    commission: number; // Comissão %
    paymentFee: number; // Taxa de pagamento %
    shippingFee?: number; // Taxa de frete %
    advertisingFee?: number; // Taxa de publicidade %
    storageFee?: number; // Taxa de armazenagem %
    fulfillmentFee?: number; // Taxa de fulfillment %
    cashbackFee?: number; // Taxa de cashback %
    insuranceFee?: number; // Taxa de seguro %
  };
  customFields?: {
    id: string;
    label: string;
    type: 'percentage' | 'fixed' | 'boolean';
    defaultValue: number | boolean;
    tooltip?: string;
  }[];
  description: string;
  isPremium?: boolean;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: Date;
}

export interface TaxTemplate {
  id: string;
  name: string;
  description: string;
  rates: {
    icms: number;
    icmsSt?: number;
    ipi?: number;
    pis: number;
    cofins: number;
    issqn?: number;
    simples?: number;
  };
  applicableStates?: string[];
  regime: 'simples' | 'presumido' | 'real' | 'mei';
}

export interface StateICMSRule {
  from: string;
  to: string;
  rate: number;
  internalRate: number;
}

export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
];

export const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: 'mercado-livre',
    name: 'Mercado Livre',
    logo: '/logos/mercadolivre.svg',
    category: 'marketplace',
    defaultValues: {
      commission: 13.5,
      paymentFee: 4.99,
      shippingFee: 0,
      advertisingFee: 3.0,
    },
    customFields: [
      {
        id: 'mercadoPago',
        label: 'Usar Mercado Pago',
        type: 'boolean',
        defaultValue: true,
        tooltip: 'Taxa adicional do Mercado Pago'
      },
      {
        id: 'fullFillment',
        label: 'Mercado Envios Full',
        type: 'boolean',
        defaultValue: false,
        tooltip: 'Usar fulfillment do Mercado Livre'
      }
    ],
    description: 'Template para Mercado Livre com comissão variável por categoria e opções de Mercado Pago'
  },
  {
    id: 'shopee',
    name: 'Shopee',
    logo: '/logos/shopee.svg',
    category: 'marketplace',
    defaultValues: {
      commission: 9.0,
      paymentFee: 2.99,
      cashbackFee: 1.5,
      advertisingFee: 2.0,
    },
    customFields: [
      {
        id: 'shopeePay',
        label: 'ShopeePay',
        type: 'boolean',
        defaultValue: true,
        tooltip: 'Usar ShopeePay como método de pagamento'
      }
    ],
    description: 'Template para Shopee com cashback e promoções frequentes'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '/logos/amazon.svg',
    category: 'marketplace',
    defaultValues: {
      commission: 15.0,
      paymentFee: 0,
      fulfillmentFee: 12.0,
      storageFee: 2.5,
      advertisingFee: 5.0,
    },
    customFields: [
      {
        id: 'fba',
        label: 'Usar FBA',
        type: 'boolean',
        defaultValue: true,
        tooltip: 'Fulfillment by Amazon'
      },
      {
        id: 'longTermStorage',
        label: 'Armazenagem Longa',
        type: 'percentage',
        defaultValue: 6.9,
        tooltip: 'Taxa adicional para produtos com mais de 365 dias em estoque'
      }
    ],
    description: 'Template para Amazon com FBA e taxas de armazenagem'
  },
  {
    id: 'magalu',
    name: 'Magazine Luiza',
    logo: '/logos/magalu.svg',
    category: 'marketplace',
    defaultValues: {
      commission: 16.0,
      paymentFee: 3.49,
      shippingFee: 0,
      advertisingFee: 4.0,
    },
    description: 'Template para Magazine Luiza com logística integrada'
  }
];