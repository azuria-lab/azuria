/**
 * Base Marketplace Handler
 * 
 * Classe abstrata base que fornece funcionalidades comuns para todos
 * os handlers de marketplace. Implementa o padrão Template Method.
 */

import type {
  CompetitorPrice,
  MarketplaceAPI,
  MarketplaceConnectionStatus,
  MarketplaceDashboardData,
  MarketplaceOrder,
  MarketplaceProduct,
  MarketplaceStatistics,
} from '@/types/marketplace-api';

export abstract class BaseMarketplaceHandler implements MarketplaceAPI {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly logoUrl: string;

  protected connectionStatus: MarketplaceConnectionStatus = {
    isConnected: false,
    syncStatus: 'idle',
  };

  protected credentials: Record<string, string> = {};

  // ========== Conexão ==========

  async connect(credentials: Record<string, string>): Promise<void> {
    this.credentials = credentials;
    
    try {
      await this.validateCredentials(credentials);
      this.connectionStatus = {
        isConnected: true,
        lastSync: new Date(),
        syncStatus: 'success',
      };
    } catch (error) {
      this.connectionStatus = {
        isConnected: false,
        syncStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      };
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.credentials = {};
    this.connectionStatus = {
      isConnected: false,
      syncStatus: 'idle',
    };
  }

  getConnectionStatus(): MarketplaceConnectionStatus {
    return { ...this.connectionStatus };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeAuthenticatedRequest('/test');
      return true;
    } catch {
      return false;
    }
  }

  // ========== Métodos Abstratos (devem ser implementados pelas subclasses) ==========

  protected abstract validateCredentials(credentials: Record<string, string>): Promise<void>;

  protected abstract makeAuthenticatedRequest(
    endpoint: string,
    options?: RequestInit
  ): Promise<Response>;

  abstract getDashboardData(): Promise<MarketplaceDashboardData>;

  abstract getProductList(filters?: {
    category?: string;
    status?: 'active' | 'inactive' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceProduct[]>;

  abstract getProductById(productId: string): Promise<MarketplaceProduct>;

  abstract createProduct(
    product: Omit<
      MarketplaceProduct,
      'id' | 'views' | 'favorites' | 'conversions' | 'lastUpdate'
    >
  ): Promise<MarketplaceProduct>;

  abstract updateProduct(
    productId: string,
    updates: Partial<MarketplaceProduct>
  ): Promise<MarketplaceProduct>;

  abstract deleteProduct(productId: string): Promise<void>;

  abstract getCompetitorPrices(productId: string): Promise<CompetitorPrice[]>;

  abstract updatePrice(productId: string, newPrice: number): Promise<void>;

  abstract bulkUpdatePrices(updates: { productId: string; price: number }[]): Promise<void>;

  abstract getSalesStats(period?: { start: Date; end: Date }): Promise<MarketplaceStatistics>;

  abstract getOrders(filters?: {
    status?: MarketplaceOrder['status'];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<MarketplaceOrder[]>;

  abstract syncInventory(): Promise<{ success: boolean; updated: number; errors?: string[] }>;

  abstract syncPrices(): Promise<{ success: boolean; updated: number; errors?: string[] }>;

  abstract getAPILimits(): Promise<{
    requestsPerDay: number;
    requestsUsed: number;
    resetAt: Date;
  }>;

  // ========== Métodos Utilitários Comuns ==========

  protected ensureConnected(): void {
    if (!this.connectionStatus.isConnected) {
      throw new Error(`Não conectado ao ${this.name}. Conecte-se primeiro.`);
    }
  }

  protected updateSyncStatus(status: MarketplaceConnectionStatus['syncStatus']): void {
    this.connectionStatus.syncStatus = status;
    if (status === 'success') {
      this.connectionStatus.lastSync = new Date();
    }
  }

  protected async handleAPIError(error: unknown): Promise<never> {
    const message = error instanceof Error ? error.message : 'Erro desconhecido na API';
    this.connectionStatus.errorMessage = message;
    this.connectionStatus.syncStatus = 'error';
    throw new Error(`[${this.name}] ${message}`);
  }

  protected generateMockData<T>(generator: () => T): T {
    // Útil durante desenvolvimento ou quando a API real está indisponível
    // Em produção, isso nunca deve ser chamado
    return generator();
  }
}
