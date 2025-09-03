
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: 'enterprise' | 'team' | 'pro';
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  address?: StoreAddress;
  settings: StoreSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrganizationSettings {
  currency: string;
  timezone: string;
  language: string;
  features: string[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface StoreSettings {
  defaultMargin: number;
  defaultTax: number;
  defaultCardFee: number;
  defaultShipping: number;
  includeShippingDefault: boolean;
  operatingHours?: {
    open: string;
    close: string;
    days: string[];
  };
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  permissions: string[];
  storesAccess: string[];
  invitedBy?: string;
  invitedAt: Date;
  joinedAt?: Date;
  isActive: boolean;
}

export interface MultiTenantContext {
  currentOrganization: Organization | null;
  currentStore: Store | null;
  organizations: Organization[];
  stores: Store[];
  userRole: string | null;
  userPermissions: string[];
  switchOrganization: (organizationId: string) => Promise<void>;
  switchStore: (storeId: string) => void;
  hasPermission: (permission: string, storeId?: string) => boolean;
}

export interface ConsolidatedMetrics {
  totalRevenue: number;
  totalCalculations: number;
  totalStores: number;
  activeUsers: number;
  topPerformingStore: Store | null;
  growthRate: number;
  storeComparison: StoreMetrics[];
}

export interface StoreMetrics {
  store: Store;
  revenue: number;
  calculations: number;
  activeUsers: number;
  avgMargin: number;
  conversionRate: number;
}
