
export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
  lastActive?: Date;
  permissions: Permission[];
}

export interface Team {
  id: string;
  name: string;
  plan: 'enterprise' | 'team' | 'pro';
  ownerId: string;
  members: TeamMember[];
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'calculators' | 'analytics' | 'settings' | 'api' | 'reports' | 'stores';
}

export interface TeamSettings {
  allowInvites: boolean;
  requireApproval: boolean;
  defaultRole: 'editor' | 'viewer';
  maxMembers: number;
  features: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed?: Date;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  usage: {
    requests: number;
    limit: number;
    resetDate: Date;
  };
}

export interface WhiteLabelConfig {
  id: string;
  clientId: string;
  brandName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
  customCss?: string;
  hideOriginalBranding: boolean;
  favicon?: string;
  footerText?: string;
}

export interface AdvancedReport {
  id: string;
  name: string;
  type: 'calculations' | 'analytics' | 'usage' | 'financial' | 'consolidated';
  format: 'pdf' | 'excel' | 'csv';
  schedule?: 'daily' | 'weekly' | 'monthly';
  filters: ReportFilters;
  recipients: string[];
  createdAt: Date;
  lastGenerated?: Date;
  organizationId?: string;
  storeIds?: string[];
}

export interface ReportFilters {
  dateRange: { start: Date; end: Date };
  users?: string[];
  calculators?: string[];
  stores?: string[];
  status?: string[];
  customFilters?: Record<string, unknown>;
}

// Re-export types from multi-tenant
export type { 
  Organization, 
  Store, 
  OrganizationMember, 
  ConsolidatedMetrics, 
  StoreMetrics 
} from './multi-tenant';
