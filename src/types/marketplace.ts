// Types for Multi-Marketplace Hub
export interface Marketplace {
  id: string;
  name: string;
  platform: MarketplacePlatform;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  credentials: MarketplaceCredentials;
  settings: MarketplaceSettings;
  lastSync: Date | null;
  totalProducts: number;
  totalOrders: number;
  syncStats: SyncStats;
}

export type MarketplacePlatform = 
  | 'amazon'
  | 'mercadolivre'
  | 'shopify'
  | 'magento'
  | 'woocommerce'
  | 'shopee'
  | 'americanas'
  | 'casasbahia'
  | 'extra'
  | 'custom';

export interface MarketplaceCredentials {
  apiKey?: string;
  secretKey?: string;
  storeUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  sellerId?: string;
  applicationId?: string;
  [key: string]: unknown;
}

export interface MarketplaceSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  syncProducts: boolean;
  syncOrders: boolean;
  syncInventory: boolean;
  syncPrices: boolean;
  conflictResolution: 'marketplace_wins' | 'local_wins' | 'manual';
  priceMarkup: number;
  stockBuffer: number;
  categories: string[];
  excludedProducts: string[];
}

export interface SyncStats {
  lastSyncDuration: number;
  productsSync: {
    total: number;
    success: number;
    errors: number;
  };
  ordersSync: {
    total: number;
    success: number;
    errors: number;
  };
  inventorySync: {
    total: number;
    success: number;
    errors: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  salePrice?: number;
  costPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  marketplaceData: Record<string, MarketplaceProductData>;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
}

export interface ProductVariation {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
}

export interface MarketplaceProductData {
  marketplaceId: string;
  externalId: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  price: number;
  stock: number;
  lastSync: Date;
  errors: string[];
}

export interface Order {
  id: string;
  marketplaceOrderId: string;
  marketplace: MarketplacePlatform;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  customer: Customer;
  items: OrderItem[];
  shipping: ShippingInfo;
  totals: OrderTotals;
  dates: OrderDates;
  tracking?: TrackingInfo;
  notes: string[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type ShippingStatus = 
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'returned';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: Address;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variation?: string;
}

export interface ShippingInfo {
  method: string;
  cost: number;
  estimatedDelivery: Date;
  address: Address;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderDates {
  created: Date;
  confirmed?: Date;
  shipped?: Date;
  delivered?: Date;
  cancelled?: Date;
}

export interface TrackingInfo {
  code: string;
  carrier: string;
  url: string;
  status: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  date: Date;
  status: string;
  location: string;
  description: string;
}

export interface SyncJob {
  id: string;
  type: 'products' | 'orders' | 'inventory' | 'prices' | 'full';
  marketplaceId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  results: SyncResult;
  errors: SyncError[];
}

export interface SyncResult {
  totalItems: number;
  processedItems: number;
  successItems: number;
  errorItems: number;
  skippedItems: number;
}

export interface SyncError {
  itemId: string;
  itemType: string;
  error: string;
  details?: Record<string, unknown>;
}

export interface MarketplaceTemplate {
  platform: MarketplacePlatform;
  name: string;
  description: string;
  requiredCredentials: string[];
  optionalCredentials: string[];
  supportedFeatures: MarketplaceFeature[];
  connectionSteps: ConnectionStep[];
  documentation: string;
}

export type MarketplaceFeature = 
  | 'products'
  | 'orders'
  | 'inventory'
  | 'prices'
  | 'categories'
  | 'shipping'
  | 'tracking'
  | 'reviews'
  | 'promotions';

export interface ConnectionStep {
  step: number;
  title: string;
  description: string;
  action?: 'input' | 'redirect' | 'verify';
  fields?: ConnectionField[];
}

export interface ConnectionField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: string;
}

// Dashboard and Analytics Types
export interface MarketplaceDashboardData {
  totalMarketplaces: number;
  connectedMarketplaces: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  marketplaceStats: MarketplaceStats[];
  recentOrders: Order[];
  topProducts: ProductStats[];
  syncHistory: SyncJob[];
}

export interface MarketplaceStats {
  marketplace: MarketplacePlatform;
  orders: number;
  revenue: number;
  products: number;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date | null;
}

export interface ProductStats {
  productId: string;
  title: string;
  totalSold: number;
  revenue: number;
  marketplaces: string[];
}

// Configuration Types
export interface HubConfiguration {
  defaultSyncInterval: number;
  maxConcurrentSyncs: number;
  retryAttempts: number;
  retryDelay: number;
  enableWebhooks: boolean;
  webhookUrl?: string;
  enableNotifications: boolean;
  notificationChannels: NotificationChannel[];
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'slack';
  enabled: boolean;
  settings: Record<string, unknown>;
  events: NotificationEvent[];
}

export type NotificationEvent = 
  | 'sync_completed'
  | 'sync_failed'
  | 'new_order'
  | 'low_stock'
  | 'connection_error'
  | 'high_error_rate';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current: number;
    total: number;
    pages: number;
    limit: number;
  };
}

// Filter and Search Types
export interface ProductFilter {
  search?: string;
  category?: string;
  brand?: string;
  status?: 'active' | 'inactive' | 'draft';
  marketplace?: MarketplacePlatform;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface OrderFilter {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  marketplace?: MarketplacePlatform;
  dateFrom?: Date;
  dateTo?: Date;
  customer?: string;
  minTotal?: number;
  maxTotal?: number;
}