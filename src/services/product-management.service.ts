/**
 * Product Management Service
 * 
 * Serviço para gerenciamento de produtos e sincronização
 */

import type { 
  BulkSyncOperation, 
  ImportResult, 
  Product, 
  ProductFilter, 
  ProductTemplate 
} from '@/types/product-management';

class ProductManagementService {
  /**
   * Lista produtos com filtros e paginação
   */
  async listProducts(filters?: ProductFilter): Promise<{ products: Product[]; total: number }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulação de dados
    const mockProducts: Product[] = [
      {
        id: 'prod-1',
        sku: 'IPHONE-15-PRO-256',
        name: 'iPhone 15 Pro 256GB',
        description: 'iPhone 15 Pro com 256GB de armazenamento interno, chip A17 Pro, câmera tripla de 48MP',
        category: 'Eletrônicos',
        subcategory: 'Smartphones',
        brand: 'Apple',
        basePrice: 7299,
        costPrice: 5500,
        compareAtPrice: 7999,
        currency: 'BRL',
        stock: 45,
        lowStockThreshold: 10,
        trackInventory: true,
        allowBackorder: false,
        images: [
          { id: 'img-1', url: '/products/iphone-15-pro.jpg', position: 0, isPrimary: true }
        ],
        tags: ['smartphone', 'apple', 'iphone', '5g'],
        marketplaceListings: [
          { marketplaceId: 'mercado-livre', marketplaceName: 'Mercado Livre', status: 'synced', price: 7299, stock: 45, lastSyncAt: new Date().toISOString() },
          { marketplaceId: 'shopee', marketplaceName: 'Shopee', status: 'synced', price: 7199, stock: 45, lastSyncAt: new Date().toISOString() }
        ],
        syncEnabled: true,
        status: 'active',
        visibility: 'public',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        lastSyncAt: new Date().toISOString()
      },
      {
        id: 'prod-2',
        sku: 'SAMSUNG-S24-ULTRA',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Samsung Galaxy S24 Ultra com 512GB, tela Dynamic AMOLED 2X de 6.8", Snapdragon 8 Gen 3',
        category: 'Eletrônicos',
        subcategory: 'Smartphones',
        brand: 'Samsung',
        basePrice: 6499,
        costPrice: 4800,
        currency: 'BRL',
        stock: 28,
        lowStockThreshold: 15,
        trackInventory: true,
        allowBackorder: false,
        images: [
          { id: 'img-2', url: '/products/s24-ultra.jpg', position: 0, isPrimary: true }
        ],
        tags: ['smartphone', 'samsung', 'android', '5g'],
        marketplaceListings: [
          { marketplaceId: 'mercado-livre', marketplaceName: 'Mercado Livre', status: 'synced', price: 6499, stock: 28, lastSyncAt: new Date().toISOString() }
        ],
        syncEnabled: true,
        status: 'active',
        visibility: 'public',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        lastSyncAt: new Date().toISOString()
      },
      {
        id: 'prod-3',
        sku: 'MACBOOK-AIR-M3',
        name: 'MacBook Air M3 13"',
        description: 'MacBook Air com chip M3, tela Retina de 13.6", 16GB RAM, 512GB SSD',
        category: 'Informática',
        subcategory: 'Notebooks',
        brand: 'Apple',
        basePrice: 9299,
        costPrice: 7200,
        currency: 'BRL',
        stock: 8,
        lowStockThreshold: 5,
        trackInventory: true,
        allowBackorder: true,
        images: [
          { id: 'img-3', url: '/products/macbook-air-m3.jpg', position: 0, isPrimary: true }
        ],
        tags: ['notebook', 'apple', 'macbook', 'm3'],
        marketplaceListings: [
          { marketplaceId: 'amazon', marketplaceName: 'Amazon', status: 'pending', price: 9299, stock: 8 }
        ],
        syncEnabled: true,
        status: 'active',
        visibility: 'public',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1'
      },
      {
        id: 'prod-4',
        sku: 'AIRPODS-PRO-2',
        name: 'AirPods Pro 2ª Geração',
        description: 'AirPods Pro com cancelamento ativo de ruído, modo transparência adaptativo, áudio espacial',
        category: 'Acessórios',
        subcategory: 'Fones de Ouvido',
        brand: 'Apple',
        basePrice: 2299,
        costPrice: 1600,
        currency: 'BRL',
        stock: 120,
        lowStockThreshold: 30,
        trackInventory: true,
        allowBackorder: false,
        images: [
          { id: 'img-4', url: '/products/airpods-pro-2.jpg', position: 0, isPrimary: true }
        ],
        tags: ['fone', 'apple', 'airpods', 'bluetooth'],
        marketplaceListings: [
          { marketplaceId: 'mercado-livre', marketplaceName: 'Mercado Livre', status: 'synced', price: 2299, stock: 120, lastSyncAt: new Date().toISOString() },
          { marketplaceId: 'shopee', marketplaceName: 'Shopee', status: 'synced', price: 2249, stock: 120, lastSyncAt: new Date().toISOString() },
          { marketplaceId: 'magalu', marketplaceName: 'Magazine Luiza', status: 'synced', price: 2299, stock: 120, lastSyncAt: new Date().toISOString() }
        ],
        syncEnabled: true,
        status: 'active',
        visibility: 'public',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        lastSyncAt: new Date().toISOString()
      },
      {
        id: 'prod-5',
        sku: 'WATCH-ULTRA-2',
        name: 'Apple Watch Ultra 2',
        description: 'Apple Watch Ultra 2 com GPS, tela Always-On, resistência extrema',
        category: 'Acessórios',
        subcategory: 'Smartwatches',
        brand: 'Apple',
        basePrice: 9499,
        costPrice: 7000,
        currency: 'BRL',
        stock: 3,
        lowStockThreshold: 5,
        trackInventory: true,
        allowBackorder: false,
        images: [
          { id: 'img-5', url: '/products/watch-ultra-2.jpg', position: 0, isPrimary: true }
        ],
        tags: ['smartwatch', 'apple', 'watch', 'ultra'],
        marketplaceListings: [],
        syncEnabled: false,
        status: 'draft',
        visibility: 'private',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1'
      }
    ];

    let filtered = [...mockProducts];

    // Aplicar filtros
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters?.status && filters.status.length > 0) {
      filtered = filtered.filter(p => filters.status?.includes(p.status));
    }

    if (filters?.stockLevel && filters.stockLevel !== 'all') {
      filtered = filtered.filter(p => {
        if (filters.stockLevel === 'out_of_stock') {
          return p.stock === 0;
        }
        if (filters.stockLevel === 'low_stock') {
          return p.stock > 0 && p.stock <= p.lowStockThreshold;
        }
        if (filters.stockLevel === 'in_stock') {
          return p.stock > p.lowStockThreshold;
        }
        return true;
      });
    }

    return {
      products: filtered,
      total: filtered.length
    };
  }

  /**
   * Busca um produto por ID
   */
  async getProduct(id: string): Promise<Product | null> {
    const { products } = await this.listProducts();
    return products.find(p => p.id === id) || null;
  }

  /**
   * Cria um novo produto
   */
  async createProduct(data: Partial<Product>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: data.sku || `SKU-${Date.now()}`,
      name: data.name || 'Novo Produto',
      description: data.description || '',
      category: data.category || 'Sem Categoria',
      basePrice: data.basePrice || 0,
      currency: 'BRL',
      stock: data.stock || 0,
      lowStockThreshold: data.lowStockThreshold || 10,
      trackInventory: data.trackInventory ?? true,
      allowBackorder: data.allowBackorder ?? false,
      images: data.images || [],
      tags: data.tags || [],
      marketplaceListings: data.marketplaceListings || [],
      syncEnabled: data.syncEnabled ?? false,
      status: data.status || 'draft',
      visibility: data.visibility || 'private',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
      ...data
    };

    return newProduct;
  }

  /**
   * Atualiza um produto existente
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const product = await this.getProduct(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return {
      ...product,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Deleta um produto
   */
  async deleteProduct(_id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Sincroniza produtos em lote com marketplaces
   */
  async bulkSync(
    productIds: string[],
    marketplaceIds: string[],
    operation: BulkSyncOperation['operation']
  ): Promise<BulkSyncOperation> {
    const operationId = `sync-${Date.now()}`;

    // Iniciar operação
    const syncOperation: BulkSyncOperation = {
      id: operationId,
      productIds,
      marketplaceIds,
      operation,
      status: 'processing',
      progress: {
        total: productIds.length * marketplaceIds.length,
        completed: 0,
        failed: 0
      },
      results: [],
      startedAt: new Date().toISOString(),
      createdBy: 'user-1'
    };

    // Simular sincronização
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular resultados (90% sucesso)
    const results = productIds.flatMap(productId =>
      marketplaceIds.map(marketplaceId => ({
        productId,
        marketplaceId,
        status: Math.random() > 0.1 ? 'success' as const : 'error' as const,
        message: Math.random() > 0.1 ? 'Sincronizado com sucesso' : 'Erro na sincronização'
      }))
    );

    syncOperation.results = results;
    syncOperation.progress.completed = results.filter(r => r.status === 'success').length;
    syncOperation.progress.failed = results.filter(r => r.status === 'error').length;
    syncOperation.status = syncOperation.progress.failed === 0 ? 'completed' : 'partial';
    syncOperation.completedAt = new Date().toISOString();

    return syncOperation;
  }

  /**
   * Importa produtos de arquivo CSV
   */
  async importFromCSV(_file: File): Promise<ImportResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulação de importação
    return {
      total: 10,
      successful: 8,
      failed: 2,
      errors: [
        { row: 3, field: 'basePrice', message: 'Preço inválido' },
        { row: 7, field: 'sku', message: 'SKU duplicado' }
      ],
      products: []
    };
  }

  /**
   * Retorna templates de produtos disponíveis
   */
  async getTemplates(): Promise<ProductTemplate[]> {
    return [
      {
        id: 'tpl-electronics',
        name: 'Eletrônicos',
        description: 'Template para produtos eletrônicos',
        category: 'Eletrônicos',
        fields: [
          { name: 'marca', label: 'Marca', type: 'text', required: true },
          { name: 'modelo', label: 'Modelo', type: 'text', required: true },
          { name: 'garantia', label: 'Garantia (meses)', type: 'number', defaultValue: 12, required: true }
        ],
        descriptionTemplate: '{{marca}} {{modelo}} - {{description}}\n\nGarantia: {{garantia}} meses\n\nCaracterísticas:\n- {{features}}',
        seoTemplate: 'Compre {{marca}} {{modelo}} com melhor preço | Garantia {{garantia}} meses',
        isDefault: true,
        usageCount: 145
      },
      {
        id: 'tpl-fashion',
        name: 'Moda e Vestuário',
        description: 'Template para roupas e acessórios',
        category: 'Moda',
        fields: [
          { name: 'tamanho', label: 'Tamanho', type: 'select', options: ['PP', 'P', 'M', 'G', 'GG', 'XG'], required: true },
          { name: 'cor', label: 'Cor', type: 'text', required: true },
          { name: 'material', label: 'Material', type: 'text', required: true }
        ],
        descriptionTemplate: '{{description}}\n\nTamanho: {{tamanho}}\nCor: {{cor}}\nMaterial: {{material}}',
        isDefault: false,
        usageCount: 87
      }
    ];
  }

  /**
   * Aplica template a um produto
   */
  async applyTemplate(_productId: string, _templateId: string): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Not implemented');
  }
}

export const productManagementService = new ProductManagementService();
