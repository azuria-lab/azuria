/**
 * Feature #10: Advanced Templates Types
 * Sistema completo de templates de precificação com compartilhamento
 */

/**
 * Template de precificação completo
 */
export interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  
  // Dados de precificação
  pricing: TemplatePricing;
  
  // Configurações de custos
  costs: TemplateCosts;
  
  // Regras de negócio
  rules: TemplateRules;
  
  // Metadados
  metadata: TemplateMetadata;
  
  // Compartilhamento
  sharing: TemplateSharing;
  
  // Estatísticas de uso
  stats: TemplateStats;
}

/**
 * Categoria do template
 */
export type TemplateCategory = 
  | 'ecommerce'
  | 'retail'
  | 'services'
  | 'manufacturing'
  | 'b2b'
  | 'b2c'
  | 'custom';

/**
 * Dados de precificação do template
 */
export interface TemplatePricing {
  // Margens
  targetMargin: number; // Margem alvo (%)
  minMargin: number; // Margem mínima aceitável (%)
  maxMargin: number; // Margem máxima permitida (%)
  
  // Preços base
  basePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  
  // Estratégia
  pricingStrategy: PricingStrategy;
  
  // Markup
  markupPercentage?: number;
  
  // Desconto máximo permitido
  maxDiscount?: number;
}

/**
 * Estratégia de precificação
 */
export type PricingStrategy =
  | 'cost-plus' // Custo + margem
  | 'market-based' // Baseado no mercado
  | 'value-based' // Baseado no valor
  | 'competitive' // Competitivo
  | 'penetration' // Penetração
  | 'premium' // Premium
  | 'dynamic'; // Dinâmico

/**
 * Configuração de custos do template
 */
export interface TemplateCosts {
  // Custos fixos
  productCostPercentage: number; // % do preço de venda
  shippingCostPercentage: number;
  
  // Custos variáveis por marketplace
  marketplaceFees: {
    [marketplace: string]: number; // % de taxa
  };
  
  // Impostos
  taxPercentage: number;
  
  // Custos operacionais
  packagingCostPercentage?: number;
  marketingCostPercentage?: number;
  operationalCostPercentage?: number;
  
  // Custos adicionais
  additionalCosts?: {
    name: string;
    percentage: number;
    isFixed: boolean;
  }[];
}

/**
 * Regras de negócio do template
 */
export interface TemplateRules {
  // Regras de validação
  minProfitMargin: number; // Margem mínima exigida
  maxCostPercentage: number; // % máximo de custos
  
  // Regras de preço
  allowNegativeMargin: boolean;
  requireMinimumProfit: boolean;
  minimumProfitAmount?: number;
  
  // Regras de desconto
  allowDiscounts: boolean;
  maxDiscountPercentage?: number;
  requireApprovalAbove?: number; // % de desconto que requer aprovação
  
  // Regras de marketplace
  preferredMarketplaces?: string[];
  blockedMarketplaces?: string[];
  
  // Alertas automáticos
  alerts: TemplateAlert[];
}

/**
 * Alerta automático do template
 */
export interface TemplateAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  condition: AlertCondition;
  message: string;
  action?: string;
}

/**
 * Condição do alerta
 */
export type AlertCondition =
  | 'margin-below-target'
  | 'margin-below-minimum'
  | 'price-below-minimum'
  | 'cost-above-maximum'
  | 'negative-profit'
  | 'high-discount'
  | 'custom';

/**
 * Metadados do template
 */
export interface TemplateMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  lastModifiedBy: string;
  version: number;
  
  // Tags e classificação
  tags: string[];
  industry?: string;
  businessSize?: 'small' | 'medium' | 'large' | 'enterprise';
  
  // Status
  status: 'draft' | 'active' | 'archived';
  isPublic: boolean;
  isFavorite: boolean;
  
  // Notas
  notes?: string;
}

/**
 * Configurações de compartilhamento
 */
export interface TemplateSharing {
  // Controle de acesso
  visibility: 'private' | 'team' | 'organization' | 'public';
  
  // Permissões
  permissions: {
    canView: string[]; // User IDs
    canEdit: string[];
    canDelete: string[];
    canShare: string[];
  };
  
  // Compartilhamento por link
  shareLink?: {
    id: string;
    url: string;
    expiresAt?: Date;
    password?: string;
    allowCopy: boolean;
    allowExport: boolean;
  };
  
  // Histórico de compartilhamento
  shareHistory: ShareHistoryEntry[];
}

/**
 * Entrada no histórico de compartilhamento
 */
export interface ShareHistoryEntry {
  id: string;
  sharedBy: string; // User ID
  sharedWith: string; // User ID or email
  sharedAt: Date;
  accessLevel: 'view' | 'edit' | 'admin';
  message?: string;
}

/**
 * Estatísticas de uso do template
 */
export interface TemplateStats {
  // Contadores
  timesUsed: number;
  timesCopied: number;
  timesShared: number;
  
  // Usuários
  uniqueUsers: number;
  
  // Performance
  averageMarginAchieved?: number;
  totalRevenueGenerated?: number;
  
  // Última utilização
  lastUsedAt?: Date;
  lastUsedBy?: string;
  
  // Rating
  rating?: number; // 0-5
  reviews?: TemplateReview[];
}

/**
 * Review/avaliação do template
 */
export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  helpful: number; // Quantos acharam útil
}

/**
 * Filtros para busca de templates
 */
export interface TemplateFilters {
  category?: TemplateCategory[];
  pricingStrategy?: PricingStrategy[];
  tags?: string[];
  status?: ('draft' | 'active' | 'archived')[];
  visibility?: ('private' | 'team' | 'organization' | 'public')[];
  createdBy?: string;
  minRating?: number;
  searchTerm?: string;
}

/**
 * Resultado de busca de templates
 */
export interface TemplateSearchResult {
  templates: PricingTemplate[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Operação em lote (bulk operation)
 */
export interface TemplateBulkOperation {
  templateIds: string[];
  operation: 'delete' | 'archive' | 'activate' | 'duplicate' | 'export' | 'share';
  options?: Record<string, unknown>;
}

/**
 * Resultado de operação em lote
 */
export interface TemplateBulkResult {
  success: number;
  failed: number;
  errors: {
    templateId: string;
    error: string;
  }[];
}

/**
 * Template de exportação (formato simplificado)
 */
export interface TemplateExport {
  template: PricingTemplate;
  exportedAt: Date;
  exportedBy: string;
  format: 'json' | 'csv' | 'pdf' | 'excel';
  includeStats: boolean;
  includeHistory: boolean;
}

/**
 * Configuração de importação
 */
export interface TemplateImport {
  source: 'file' | 'url' | 'clipboard';
  data: string | File;
  options: {
    mergeExisting: boolean;
    overwriteDuplicates: boolean;
    preserveIds: boolean;
    preserveMetadata: boolean;
  };
}

/**
 * Resultado de importação
 */
export interface TemplateImportResult {
  imported: number;
  skipped: number;
  errors: {
    index: number;
    name: string;
    error: string;
  }[];
  templates: PricingTemplate[];
}

/**
 * Notificação de template
 */
export interface TemplateNotification {
  id: string;
  type: 'shared' | 'edited' | 'commented' | 'used' | 'archived';
  templateId: string;
  templateName: string;
  message: string;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  read: boolean;
}

/**
 * Presets de templates populares
 */
export const TEMPLATE_PRESETS: Partial<PricingTemplate>[] = [
  {
    id: 'preset-ecommerce-ml',
    name: 'E-commerce Mercado Livre',
    description: 'Template otimizado para vendas no Mercado Livre',
    category: 'ecommerce',
    pricing: {
      targetMargin: 30,
      minMargin: 15,
      maxMargin: 50,
      pricingStrategy: 'competitive',
      maxDiscount: 20,
    },
    costs: {
      productCostPercentage: 40,
      shippingCostPercentage: 10,
      marketplaceFees: {
        'Mercado Livre': 16,
      },
      taxPercentage: 8.5,
      packagingCostPercentage: 2,
      marketingCostPercentage: 5,
    },
  },
  {
    id: 'preset-retail-loja',
    name: 'Loja Física Varejo',
    description: 'Template para lojas físicas de varejo',
    category: 'retail',
    pricing: {
      targetMargin: 40,
      minMargin: 25,
      maxMargin: 60,
      pricingStrategy: 'cost-plus',
      markupPercentage: 100,
      maxDiscount: 30,
    },
    costs: {
      productCostPercentage: 50,
      shippingCostPercentage: 0,
      marketplaceFees: {},
      taxPercentage: 8.5,
      operationalCostPercentage: 15,
    },
  },
  {
    id: 'preset-premium',
    name: 'Produtos Premium',
    description: 'Template para produtos de alto valor agregado',
    category: 'b2c',
    pricing: {
      targetMargin: 60,
      minMargin: 45,
      maxMargin: 80,
      pricingStrategy: 'premium',
      maxDiscount: 10,
    },
    costs: {
      productCostPercentage: 30,
      shippingCostPercentage: 5,
      marketplaceFees: {
        'Site Próprio': 3,
      },
      taxPercentage: 8.5,
      packagingCostPercentage: 8,
      marketingCostPercentage: 15,
    },
  },
  {
    id: 'preset-b2b',
    name: 'B2B Atacado',
    description: 'Template para vendas B2B em grande volume',
    category: 'b2b',
    pricing: {
      targetMargin: 20,
      minMargin: 12,
      maxMargin: 35,
      pricingStrategy: 'value-based',
      maxDiscount: 15,
    },
    costs: {
      productCostPercentage: 60,
      shippingCostPercentage: 8,
      marketplaceFees: {},
      taxPercentage: 8.5,
      operationalCostPercentage: 5,
    },
  },
  {
    id: 'preset-marketplace-multi',
    name: 'Multi-Marketplace',
    description: 'Template para vender em múltiplos marketplaces',
    category: 'ecommerce',
    pricing: {
      targetMargin: 28,
      minMargin: 18,
      maxMargin: 45,
      pricingStrategy: 'dynamic',
      maxDiscount: 25,
    },
    costs: {
      productCostPercentage: 45,
      shippingCostPercentage: 12,
      marketplaceFees: {
        'Mercado Livre': 16,
        'Shopee': 14,
        'Amazon': 15,
        'Magazine Luiza': 13,
      },
      taxPercentage: 8.5,
      packagingCostPercentage: 3,
      marketingCostPercentage: 8,
    },
  },
];

/**
 * Metadata dos templates para visualização
 */
export const TEMPLATE_CATEGORY_METADATA: Record<TemplateCategory, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  ecommerce: {
    label: 'E-commerce',
    icon: '🛒',
    color: 'text-blue-600',
    description: 'Templates para vendas online',
  },
  retail: {
    label: 'Varejo',
    icon: '🏪',
    color: 'text-green-600',
    description: 'Templates para lojas físicas',
  },
  services: {
    label: 'Serviços',
    icon: '🔧',
    color: 'text-purple-600',
    description: 'Templates para prestação de serviços',
  },
  manufacturing: {
    label: 'Indústria',
    icon: '🏭',
    color: 'text-orange-600',
    description: 'Templates para manufatura',
  },
  b2b: {
    label: 'B2B',
    icon: '🤝',
    color: 'text-indigo-600',
    description: 'Templates para vendas corporativas',
  },
  b2c: {
    label: 'B2C',
    icon: '👥',
    color: 'text-pink-600',
    description: 'Templates para consumidor final',
  },
  custom: {
    label: 'Personalizado',
    icon: '⚙️',
    color: 'text-gray-600',
    description: 'Templates customizados',
  },
};

/**
 * Metadata das estratégias de precificação
 */
export const PRICING_STRATEGY_METADATA: Record<PricingStrategy, {
  label: string;
  icon: string;
  description: string;
  bestFor: string;
}> = {
  'cost-plus': {
    label: 'Custo + Margem',
    icon: '➕',
    description: 'Adiciona margem fixa sobre o custo',
    bestFor: 'Produtos com custos estáveis',
  },
  'market-based': {
    label: 'Baseado no Mercado',
    icon: '📊',
    description: 'Segue os preços do mercado',
    bestFor: 'Mercados competitivos',
  },
  'value-based': {
    label: 'Baseado no Valor',
    icon: '💎',
    description: 'Precifica pelo valor percebido',
    bestFor: 'Produtos com alto valor agregado',
  },
  competitive: {
    label: 'Competitivo',
    icon: '⚔️',
    description: 'Preços alinhados com concorrentes',
    bestFor: 'Ganhar market share',
  },
  penetration: {
    label: 'Penetração',
    icon: '🎯',
    description: 'Preços baixos para entrar no mercado',
    bestFor: 'Novos produtos ou mercados',
  },
  premium: {
    label: 'Premium',
    icon: '⭐',
    description: 'Preços elevados para posicionamento',
    bestFor: 'Produtos de luxo ou exclusivos',
  },
  dynamic: {
    label: 'Dinâmico',
    icon: '🔄',
    description: 'Ajusta preços automaticamente',
    bestFor: 'Múltiplos canais ou alta volatilidade',
  },
};

/**
 * Utilitário: Cria um template vazio
 */
export const createEmptyTemplate = (userId: string): PricingTemplate => ({
  id: `template-${Date.now()}`,
  name: 'Novo Template',
  description: '',
  category: 'custom',
  pricing: {
    targetMargin: 30,
    minMargin: 15,
    maxMargin: 50,
    pricingStrategy: 'cost-plus',
    maxDiscount: 20,
  },
  costs: {
    productCostPercentage: 50,
    shippingCostPercentage: 10,
    marketplaceFees: {},
    taxPercentage: 8.5,
  },
  rules: {
    minProfitMargin: 10,
    maxCostPercentage: 70,
    allowNegativeMargin: false,
    requireMinimumProfit: true,
    allowDiscounts: true,
    alerts: [],
  },
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId,
    lastModifiedBy: userId,
    version: 1,
    tags: [],
    status: 'draft',
    isPublic: false,
    isFavorite: false,
  },
  sharing: {
    visibility: 'private',
    permissions: {
      canView: [userId],
      canEdit: [userId],
      canDelete: [userId],
      canShare: [userId],
    },
    shareHistory: [],
  },
  stats: {
    timesUsed: 0,
    timesCopied: 0,
    timesShared: 0,
    uniqueUsers: 0,
  },
});

/**
 * Utilitário: Valida template
 */
export const validateTemplate = (template: PricingTemplate): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!template.name || template.name.trim() === '') {
    errors.push('Nome do template é obrigatório');
  }

  if (template.pricing.minMargin > template.pricing.targetMargin) {
    errors.push('Margem mínima não pode ser maior que margem alvo');
  }

  if (template.pricing.targetMargin > template.pricing.maxMargin) {
    errors.push('Margem alvo não pode ser maior que margem máxima');
  }

  if (template.costs.productCostPercentage < 0 || template.costs.productCostPercentage > 100) {
    errors.push('Custo do produto deve estar entre 0% e 100%');
  }

  if (template.rules.minProfitMargin < 0) {
    errors.push('Margem mínima de lucro não pode ser negativa');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
