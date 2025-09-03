
export interface EcommerceConnection {
  id: string;
  platform: 'shopify' | 'woocommerce' | 'mercadolivre';
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  credentials: {
    apiKey?: string;
    secretKey?: string;
    storeUrl?: string;
    accessToken?: string;
  };
  lastSync?: Date;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EcommerceProduct {
  id: string;
  externalId: string;
  platform: string;
  name: string;
  sku?: string;
  price: number;
  cost?: number;
  margin?: number;
  category?: string;
  status: 'active' | 'inactive';
  inventory?: number;
  lastUpdated: Date;
}

export interface PriceSync {
  id: string;
  productId: string;
  platform: string;
  oldPrice: number;
  newPrice: number;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
  syncedAt: Date;
}

export interface WebhookEvent {
  id: string;
  platform: string;
  event: 'product_updated' | 'price_changed' | 'inventory_updated';
  payload: any;
  processed: boolean;
  receivedAt: Date;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // em minutos
  priceRules: {
    applyMargin: boolean;
    marginPercentage?: number;
    roundPrices: boolean;
    minimumPrice?: number;
    maximumPrice?: number;
  };
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    email?: string;
  };
}
