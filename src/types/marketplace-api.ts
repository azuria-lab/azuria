/**
 * Marketplace API Interface
 * 
 * Interface padronizada para integração com múltiplos marketplaces.
 * Cada marketplace deve implementar esta interface para garantir
 * consistência e facilitar a adição de novos marketplaces.
 */

export interface MarketplaceConnectionStatus {
  isConnected: boolean;
  lastSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
}

export interface MarketplaceDashboardData {
  // Visão Geral
  overview: {
    totalProducts: number;
    activeListings: number;
    inactiveListings: number;
    totalSales: number;
    grossRevenue: number;
    averageMargin: number;
  };
  
  // Análise de Preços
  pricing: {
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    priceVariationByCategory: {
      category: string;
      averagePrice: number;
      variation: number; // % de variação
    }[];
    competitorComparison: {
      myPrice: number;
      competitorAverage: number;
      difference: number;
      position: 'above' | 'below' | 'equal';
    };
    priceAlerts: {
      id: string;
      productId: string;
      productName: string;
      alertType: 'below_margin' | 'above_market' | 'competitor_change';
      message: string;
      severity: 'low' | 'medium' | 'high';
    }[];
  };
  
  // Inteligência de Mercado
  marketIntelligence: {
    topKeywords: {
      keyword: string;
      searchVolume: number;
      trend: 'up' | 'down' | 'stable';
    }[];
    peakHours: {
      hour: number;
      salesCount: number;
      revenue: number;
    }[];
    reputation: {
      score: number;
      totalReviews: number;
      averageResponseTime: number; // em horas
      positivePercentage: number;
    };
    categoryTrends: {
      category: string;
      salesGrowth: number; // % crescimento
      demandLevel: 'low' | 'medium' | 'high';
    }[];
  };
  
  // Gestão de Estoque
  inventory: {
    totalStock: number;
    outOfStock: number;
    lowStock: number; // abaixo do mínimo
    unintegrated: number; // produtos sem integração
    lastUpdate: Date;
    items: {
      productId: string;
      name: string;
      sku: string;
      stock: number;
      status: 'available' | 'low' | 'out' | 'unintegrated';
    }[];
  };
  
  // Ranking de Produtos
  topProducts: {
    productId: string;
    name: string;
    salesCount: number;
    revenue: number;
    margin: number;
    imageUrl?: string;
  }[];
}

export interface MarketplaceProduct {
  id: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'paused';
  views: number;
  favorites: number;
  conversions: number;
  lastUpdate: Date;
}

export interface MarketplaceOrder {
  id: string;
  orderId: string;
  date: Date;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
}

export interface CompetitorPrice {
  competitorId: string;
  competitorName: string;
  productId: string;
  price: number;
  lastUpdate: Date;
  url: string;
  inStock: boolean;
}

export interface MarketplaceStatistics {
  period: {
    start: Date;
    end: Date;
  };
  sales: {
    total: number;
    count: number;
    averageTicket: number;
    conversionRate: number;
  };
  performance: {
    views: number;
    clicks: number;
    favorites: number;
    ctr: number; // Click-through rate
  };
  revenue: {
    gross: number;
    net: number;
    fees: number;
    shipping: number;
  };
}

/**
 * Interface principal que todo marketplace deve implementar
 */
export interface MarketplaceAPI {
  // Identificação
  readonly id: string;
  readonly name: string;
  readonly logoUrl: string;
  
  // Conexão
  connect(credentials: Record<string, string>): Promise<void>;
  disconnect(): Promise<void>;
  getConnectionStatus(): MarketplaceConnectionStatus;
  
  // Dashboard
  getDashboardData(): Promise<MarketplaceDashboardData>;
  
  // Produtos
  getProductList(filters?: {
    category?: string;
    status?: 'active' | 'inactive' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceProduct[]>;
  
  getProductById(productId: string): Promise<MarketplaceProduct>;
  
  createProduct(product: Omit<MarketplaceProduct, 'id' | 'views' | 'favorites' | 'conversions' | 'lastUpdate'>): Promise<MarketplaceProduct>;
  
  updateProduct(productId: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct>;
  
  deleteProduct(productId: string): Promise<void>;
  
  // Preços e Concorrência
  getCompetitorPrices(productId: string): Promise<CompetitorPrice[]>;
  
  updatePrice(productId: string, newPrice: number): Promise<void>;
  
  bulkUpdatePrices(updates: { productId: string; price: number }[]): Promise<void>;
  
  // Estatísticas e Relatórios
  getSalesStats(period?: { start: Date; end: Date }): Promise<MarketplaceStatistics>;
  
  getOrders(filters?: {
    status?: MarketplaceOrder['status'];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<MarketplaceOrder[]>;
  
  // Sincronização
  syncInventory(): Promise<{ success: boolean; updated: number; errors?: string[] }>;
  
  syncPrices(): Promise<{ success: boolean; updated: number; errors?: string[] }>;
  
  // Utilitários
  testConnection(): Promise<boolean>;
  
  getAPILimits(): Promise<{
    requestsPerDay: number;
    requestsUsed: number;
    resetAt: Date;
  }>;
}

/**
 * Tipo para configuração de conexão de marketplace
 */
export interface MarketplaceCredentials {
  marketplaceId: string;
  credentials: Record<string, string>;
  autoSync?: boolean;
  syncInterval?: number; // minutos
}

/**
 * Estado de sincronização
 */
export interface SyncStatus {
  isRunning: boolean;
  lastSync?: Date;
  nextSync?: Date;
  progress?: {
    current: number;
    total: number;
    operation: string;
  };
  errors?: {
    timestamp: Date;
    operation: string;
    message: string;
  }[];
}
