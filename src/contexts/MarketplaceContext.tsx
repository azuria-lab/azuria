import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { 
  HubConfiguration,
  Marketplace, 
  MarketplaceDashboardData,
  MarketplacePlatform,
  Order, 
  OrderFilter,
  PaginatedResponse,
  Product, 
  ProductFilter,
  SyncJob
} from '../types/marketplace';

interface MarketplaceContextType {
  // State
  marketplaces: Marketplace[];
  products: Product[];
  orders: Order[];
  syncJobs: SyncJob[];
  dashboardData: MarketplaceDashboardData | null;
  configuration: HubConfiguration;
  isLoading: boolean;
  error: string | null;

  // Marketplace Management
  connectMarketplace: (platform: MarketplacePlatform, credentials: Record<string, unknown>) => Promise<Marketplace>;
  disconnectMarketplace: (marketplaceId: string) => Promise<void>;
  updateMarketplaceSettings: (marketplaceId: string, settings: Partial<Marketplace['settings']>) => Promise<void>;
  testConnection: (marketplaceId: string) => Promise<boolean>;

  // Sync Operations
  startSync: (marketplaceId: string, type: SyncJob['type']) => Promise<SyncJob>;
  startBulkSync: (marketplaceIds: string[], type: SyncJob['type']) => Promise<SyncJob[]>;
  cancelSync: (syncJobId: string) => Promise<void>;
  getSyncStatus: (syncJobId: string) => Promise<SyncJob>;

  // Product Management
  getProducts: (filter?: ProductFilter, page?: number, limit?: number) => Promise<PaginatedResponse<Product>>;
  getProduct: (productId: string) => Promise<Product>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  syncProductToMarketplace: (productId: string, marketplaceId: string) => Promise<void>;
  bulkUpdateProducts: (productIds: string[], updates: Partial<Product>) => Promise<void>;

  // Order Management
  getOrders: (filter?: OrderFilter, page?: number, limit?: number) => Promise<PaginatedResponse<Order>>;
  getOrder: (orderId: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  updateShippingInfo: (orderId: string, trackingCode: string, carrier: string) => Promise<Order>;
  cancelOrder: (orderId: string, reason: string) => Promise<Order>;

  // Dashboard and Analytics
  getDashboardData: () => Promise<MarketplaceDashboardData>;
  refreshDashboard: () => Promise<void>;

  // Configuration
  updateConfiguration: (config: Partial<HubConfiguration>) => Promise<void>;

  // Utility
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

interface MarketplaceProviderProps {
  readonly children: ReactNode;
}

// Mock API Service
class MarketplaceService {
  private static instance: MarketplaceService;
  
  static getInstance(): MarketplaceService {
    if (!MarketplaceService.instance) {
      MarketplaceService.instance = new MarketplaceService();
    }
    return MarketplaceService.instance;
  }

  async connectMarketplace(platform: MarketplacePlatform, credentials: Record<string, unknown>): Promise<Marketplace> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const marketplace: Marketplace = {
      id: Date.now().toString(),
      name: this.getPlatformName(platform),
      platform,
      status: 'connected',
      credentials,
      settings: {
        autoSync: true,
        syncInterval: 60,
        syncProducts: true,
        syncOrders: true,
        syncInventory: true,
        syncPrices: true,
        conflictResolution: 'marketplace_wins',
        priceMarkup: 0,
        stockBuffer: 5,
        categories: [],
        excludedProducts: []
      },
      lastSync: new Date(),
      totalProducts: Math.floor(Math.random() * 1000),
      totalOrders: Math.floor(Math.random() * 500),
      syncStats: {
        lastSyncDuration: Math.floor(Math.random() * 300),
        productsSync: { total: 100, success: 95, errors: 5 },
        ordersSync: { total: 50, success: 48, errors: 2 },
        inventorySync: { total: 100, success: 98, errors: 2 }
      }
    };

    return marketplace;
  }

  async testConnection(_marketplaceId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.1; // 90% success rate
  }

  async startSync(marketplaceId: string, type: SyncJob['type']): Promise<SyncJob> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const syncJob: SyncJob = {
      id: Date.now().toString(),
      type,
      marketplaceId,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      results: {
        totalItems: 100,
        processedItems: 0,
        successItems: 0,
        errorItems: 0,
        skippedItems: 0
      },
      errors: []
    };

    // Simulate progress updates
    setTimeout(() => {
      syncJob.progress = 100;
      syncJob.status = 'completed';
      syncJob.endTime = new Date();
      syncJob.results.processedItems = 100;
      syncJob.results.successItems = 95;
      syncJob.results.errorItems = 5;
    }, 3000);

    return syncJob;
  }

  async getDashboardData(): Promise<MarketplaceDashboardData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      totalMarketplaces: 5,
      connectedMarketplaces: 4,
      totalProducts: 2500,
      totalOrders: 1200,
      totalRevenue: 150000,
      recentSync: new Date(),
      syncStatus: 'idle',
      marketplaceStats: [
        {
          marketplace: 'amazon',
          orders: 400,
          revenue: 60000,
          products: 800,
          status: 'connected',
          lastSync: new Date()
        },
        {
          marketplace: 'mercadolivre',
          orders: 350,
          revenue: 45000,
          products: 700,
          status: 'connected',
          lastSync: new Date()
        },
        {
          marketplace: 'shopify',
          orders: 300,
          revenue: 30000,
          products: 600,
          status: 'connected',
          lastSync: new Date()
        },
        {
          marketplace: 'shopee',
          orders: 150,
          revenue: 15000,
          products: 400,
          status: 'connected',
          lastSync: new Date()
        }
      ],
      recentOrders: [],
      topProducts: [
        {
          productId: '1',
          title: 'Smartphone Premium',
          totalSold: 150,
          revenue: 45000,
          marketplaces: ['amazon', 'mercadolivre']
        },
        {
          productId: '2',
          title: 'Notebook Gaming',
          totalSold: 80,
          revenue: 40000,
          marketplaces: ['amazon', 'shopify']
        },
        {
          productId: '3',
          title: 'Fone Bluetooth',
          totalSold: 300,
          revenue: 15000,
          marketplaces: ['mercadolivre', 'shopee']
        }
      ],
      syncHistory: []
    };
  }

  async getProducts(filter?: ProductFilter, page = 1, limit = 20): Promise<PaginatedResponse<Product>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockProducts: Product[] = Array.from({ length: limit }, (_, i) => ({
      id: (page * limit + i).toString(),
      sku: `SKU-${page * limit + i}`,
      title: `Produto ${page * limit + i}`,
      description: `Descrição do produto ${page * limit + i}`,
      category: 'Eletrônicos',
      brand: 'Marca ' + (i % 5 + 1),
      price: Math.floor(Math.random() * 1000) + 100,
      costPrice: Math.floor(Math.random() * 500) + 50,
      stock: Math.floor(Math.random() * 100),
      minStock: 10,
      maxStock: 1000,
      weight: Math.random() * 5,
      dimensions: { length: 10, width: 10, height: 5 },
      images: [],
      attributes: [],
      variations: [],
      marketplaceData: {},
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return {
      success: true,
      data: mockProducts,
      pagination: {
        current: page,
        total: 1000,
        pages: Math.ceil(1000 / limit),
        limit
      }
    };
  }

  async getOrders(filter?: OrderFilter, page = 1, limit = 20): Promise<PaginatedResponse<Order>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockOrders: Order[] = Array.from({ length: limit }, (_, i) => ({
      id: (page * limit + i).toString(),
      marketplaceOrderId: `MKT-${page * limit + i}`,
      marketplace: ['amazon', 'mercadolivre', 'shopify', 'shopee'][i % 4] as MarketplacePlatform,
      status: ['pending', 'confirmed', 'shipped', 'delivered'][i % 4] as Order['status'],
      paymentStatus: ['pending', 'paid'][i % 2] as Order['paymentStatus'],
      shippingStatus: ['pending', 'shipped', 'delivered'][i % 3] as Order['shippingStatus'],
      customer: {
        id: 'customer-' + i,
        name: `Cliente ${i}`,
        email: `cliente${i}@email.com`,
        phone: '(11) 99999-9999',
        document: '123.456.789-00',
        address: {
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        }
      },
      items: [
        {
          id: 'item-' + i,
          productId: 'product-' + i,
          sku: 'SKU-' + i,
          title: `Produto ${i}`,
          quantity: Math.floor(Math.random() * 3) + 1,
          unitPrice: Math.floor(Math.random() * 500) + 100,
          totalPrice: 0
        }
      ],
      shipping: {
        method: 'PAC',
        cost: 15.50,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        address: {
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        }
      },
      totals: {
        subtotal: 0,
        shipping: 15.50,
        tax: 0,
        discount: 0,
        total: 0
      },
      dates: {
        created: new Date(),
        confirmed: new Date()
      },
      notes: []
    }));

    // Calculate totals
    mockOrders.forEach(order => {
      const subtotal = order.items.reduce((sum, item) => {
        item.totalPrice = item.unitPrice * item.quantity;
        return sum + item.totalPrice;
      }, 0);
      order.totals.subtotal = subtotal;
      order.totals.total = subtotal + order.totals.shipping;
    });

    return {
      success: true,
      data: mockOrders,
      pagination: {
        current: page,
        total: 500,
        pages: Math.ceil(500 / limit),
        limit
      }
    };
  }

  private getPlatformName(platform: MarketplacePlatform): string {
    const names: Record<MarketplacePlatform, string> = {
      amazon: 'Amazon',
      mercadolivre: 'Mercado Livre',
      shopify: 'Shopify',
      magento: 'Magento',
      woocommerce: 'WooCommerce',
      shopee: 'Shopee',
      americanas: 'Americanas',
      casasbahia: 'Casas Bahia',
      extra: 'Extra',
      custom: 'Personalizado'
    };
    return names[platform];
  }
}

export function MarketplaceProvider({ children }: MarketplaceProviderProps) {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [dashboardData, setDashboardData] = useState<MarketplaceDashboardData | null>(null);
  const [configuration, setConfiguration] = useState<HubConfiguration>({
    defaultSyncInterval: 60,
    maxConcurrentSyncs: 3,
    retryAttempts: 3,
    retryDelay: 5000,
    enableWebhooks: false,
    enableNotifications: true,
    notificationChannels: [],
    backupEnabled: true,
    backupFrequency: 'daily'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => MarketplaceService.getInstance(), []);

  // Connect Marketplace
  const connectMarketplace = useCallback(async (platform: MarketplacePlatform, credentials: Record<string, unknown>): Promise<Marketplace> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const marketplace = await service.connectMarketplace(platform, credentials);
      setMarketplaces(prev => [...prev, marketplace]);
      return marketplace;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar marketplace';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Disconnect Marketplace
  const disconnectMarketplace = useCallback(async (marketplaceId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMarketplaces(prev => prev.filter(m => m.id !== marketplaceId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao desconectar marketplace';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update Marketplace Settings
  const updateMarketplaceSettings = useCallback(async (
    marketplaceId: string, 
    settings: Partial<Marketplace['settings']>
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMarketplaces(prev => prev.map(m => 
        m.id === marketplaceId 
          ? { ...m, settings: { ...m.settings, ...settings } }
          : m
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar configurações';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test Connection
  const testConnection = useCallback(async (marketplaceId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await service.testConnection(marketplaceId);
      
      // Update marketplace status
      setMarketplaces(prev => prev.map(m => 
        m.id === marketplaceId 
          ? { ...m, status: result ? 'connected' : 'error' }
          : m
      ));
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao testar conexão';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Start Sync
  const startSync = useCallback(async (marketplaceId: string, type: SyncJob['type']): Promise<SyncJob> => {
    setIsLoading(true);
    
    try {
      const syncJob = await service.startSync(marketplaceId, type);
      setSyncJobs(prev => [...prev, syncJob]);
      
      // Update marketplace status
      setMarketplaces(prev => prev.map(m => 
        m.id === marketplaceId 
          ? { ...m, status: 'syncing' }
          : m
      ));
      
      return syncJob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar sincronização';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Start Bulk Sync
  const startBulkSync = useCallback(async (marketplaceIds: string[], type: SyncJob['type']): Promise<SyncJob[]> => {
    setIsLoading(true);
    
    try {
      const syncJobs = await Promise.all(
        marketplaceIds.map(id => service.startSync(id, type))
      );
      setSyncJobs(prev => [...prev, ...syncJobs]);
      
      // Update marketplace statuses
      setMarketplaces(prev => prev.map(m => 
        marketplaceIds.includes(m.id) 
          ? { ...m, status: 'syncing' }
          : m
      ));
      
      return syncJobs;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar sincronização em lote';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Cancel Sync
  const cancelSync = useCallback(async (syncJobId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSyncJobs(prev => prev.map(job => 
        job.id === syncJobId 
          ? { ...job, status: 'failed' as const }
          : job
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar sincronização';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get Sync Status
  const getSyncStatus = useCallback(async (syncJobId: string): Promise<SyncJob> => {
    const job = syncJobs.find(j => j.id === syncJobId);
    if (!job) {
      throw new Error('Sincronização não encontrada');
    }
    return job;
  }, [syncJobs]);

  // Product Management Functions
  const getProducts = useCallback(async (filter?: ProductFilter, page = 1, limit = 20): Promise<PaginatedResponse<Product>> => {
    setIsLoading(true);
    try {
      const result = await service.getProducts(filter, page, limit);
      if (page === 1) {
        setProducts(result.data || []);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const getProduct = useCallback(async (productId: string): Promise<Product> => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    return product;
  }, [products]);

  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar produto';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>): Promise<Product> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedProduct = { ...updates, id: productId, updatedAt: new Date() } as Product;
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedProduct } : p));
      return updatedProduct;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar produto';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncProductToMarketplace = useCallback(async (productId: string, marketplaceId: string): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Update product marketplace data
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            marketplaceData: {
              ...p.marketplaceData,
              [marketplaceId]: {
                marketplaceId,
                externalId: `ext-${productId}-${marketplaceId}`,
                status: 'active',
                price: p.price,
                stock: p.stock,
                lastSync: new Date(),
                errors: []
              }
            }
          };
        }
        return p;
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar produto';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkUpdateProducts = useCallback(async (productIds: string[], updates: Partial<Product>): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProducts(prev => prev.map(p => 
        productIds.includes(p.id) 
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produtos em lote';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Order Management Functions
  const getOrders = useCallback(async (filter?: OrderFilter, page = 1, limit = 20): Promise<PaginatedResponse<Order>> => {
    setIsLoading(true);
    try {
      const result = await service.getOrders(filter, page, limit);
      if (page === 1) {
        setOrders(result.data || []);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pedidos';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const getOrder = useCallback(async (orderId: string): Promise<Order> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }
    return order;
  }, [orders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']): Promise<Order> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedOrder = orders.find(o => o.id === orderId);
      if (!updatedOrder) {
        throw new Error('Pedido não encontrado');
      }
      
      const newOrder = { ...updatedOrder, status };
      setOrders(prev => prev.map(o => o.id === orderId ? newOrder : o));
      return newOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status do pedido';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orders]);

  const updateShippingInfo = useCallback(async (orderId: string, trackingCode: string, carrier: string): Promise<Order> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedOrder = orders.find(o => o.id === orderId);
      if (!updatedOrder) {
        throw new Error('Pedido não encontrado');
      }
      
      const newOrder = {
        ...updatedOrder,
        tracking: {
          code: trackingCode,
          carrier,
          url: `https://tracker.com/${trackingCode}`,
          status: 'shipped',
          events: [{
            date: new Date(),
            status: 'shipped',
            location: 'Centro de Distribuição',
            description: 'Produto enviado'
          }]
        },
        shippingStatus: 'shipped' as const
      };
      
      setOrders(prev => prev.map(o => o.id === orderId ? newOrder : o));
      return newOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar informações de envio';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orders]);

  const cancelOrder = useCallback(async (orderId: string, reason: string): Promise<Order> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedOrder = orders.find(o => o.id === orderId);
      if (!updatedOrder) {
        throw new Error('Pedido não encontrado');
      }
      
      const newOrder = {
        ...updatedOrder,
        status: 'cancelled' as const,
        dates: {
          ...updatedOrder.dates,
          cancelled: new Date()
        },
        notes: [...updatedOrder.notes, `Cancelado: ${reason}`]
      };
      
      setOrders(prev => prev.map(o => o.id === orderId ? newOrder : o));
      return newOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar pedido';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orders]);

  // Dashboard Functions
  const getDashboardData = useCallback(async (): Promise<MarketplaceDashboardData> => {
    setIsLoading(true);
    try {
      const data = await service.getDashboardData();
      setDashboardData(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const refreshDashboard = useCallback(async (): Promise<void> => {
    await getDashboardData();
  }, [getDashboardData]);

  // Configuration
  const updateConfiguration = useCallback(async (config: Partial<HubConfiguration>): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfiguration(prev => ({ ...prev, ...config }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility Functions
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await Promise.all([
        getDashboardData(),
        getProducts(),
        getOrders()
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar dados';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getDashboardData, getProducts, getOrders]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = useMemo<MarketplaceContextType>(() => ({
    // State
    marketplaces,
    products,
    orders,
    syncJobs,
    dashboardData,
    configuration,
    isLoading,
    error,

    // Marketplace Management
    connectMarketplace,
    disconnectMarketplace,
    updateMarketplaceSettings,
    testConnection,

    // Sync Operations
    startSync,
    startBulkSync,
    cancelSync,
    getSyncStatus,

    // Product Management
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    syncProductToMarketplace,
    bulkUpdateProducts,

    // Order Management
    getOrders,
    getOrder,
    updateOrderStatus,
    updateShippingInfo,
    cancelOrder,

    // Dashboard and Analytics
    getDashboardData,
    refreshDashboard,

    // Configuration
    updateConfiguration,

    // Utility
    clearError,
    refreshData
  }), [
    marketplaces,
    products,
    orders,
    syncJobs,
    dashboardData,
    configuration,
    isLoading,
    error,
    connectMarketplace,
    disconnectMarketplace,
    updateMarketplaceSettings,
    testConnection,
    startSync,
    startBulkSync,
    cancelSync,
    getSyncStatus,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    syncProductToMarketplace,
    bulkUpdateProducts,
    getOrders,
    getOrder,
    updateOrderStatus,
    updateShippingInfo,
    cancelOrder,
    getDashboardData,
    refreshDashboard,
    updateConfiguration,
    clearError,
    refreshData
  ]);

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export { MarketplaceContext };
export type { MarketplaceContextType };