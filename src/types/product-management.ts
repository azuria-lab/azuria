/**
 * Product Management Types
 * 
 * Tipos para sistema de gestão de produtos
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  
  // Pricing
  basePrice: number;
  costPrice?: number;
  compareAtPrice?: number;
  currency: string;
  
  // Inventory
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  
  // Physical attributes
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'm' | 'in' | 'ft';
  };
  
  // Media
  images: ProductImage[];
  videos?: ProductVideo[];
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  
  // Marketplace integration
  marketplaceListings: MarketplaceListing[];
  syncEnabled: boolean;
  
  // Status
  status: 'draft' | 'active' | 'inactive' | 'archived';
  visibility: 'public' | 'private' | 'hidden';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastSyncAt?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductVideo {
  id: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  platform?: 'youtube' | 'vimeo' | 'custom';
}

export interface MarketplaceListing {
  marketplaceId: string;
  marketplaceName: string;
  listingId?: string;
  status: 'synced' | 'pending' | 'error' | 'disabled';
  price?: number;
  stock?: number;
  customTitle?: string;
  customDescription?: string;
  categoryMapping?: string;
  lastSyncAt?: string;
  syncError?: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'image';
    defaultValue?: string | number | boolean;
    options?: string[];
    required: boolean;
  }[];
  descriptionTemplate: string;
  seoTemplate?: string;
  isDefault: boolean;
  usageCount: number;
}

export interface BulkSyncOperation {
  id: string;
  productIds: string[];
  marketplaceIds: string[];
  operation: 'create' | 'update' | 'delete' | 'sync_stock' | 'sync_price';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  results: {
    productId: string;
    marketplaceId: string;
    status: 'success' | 'error';
    message?: string;
  }[];
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  status?: Product['status'][];
  priceRange?: {
    min?: number;
    max?: number;
  };
  stockLevel?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  marketplace?: string[];
  tags?: string[];
  sortBy?: 'name' | 'price' | 'stock' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  costPrice?: number;
  stock: number;
  images: File[];
  marketplaces: string[];
  tags: string[];
  [key: string]: string | number | File[] | string[] | undefined;
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
  products: Product[];
}
