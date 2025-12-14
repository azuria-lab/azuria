/**
 * Sistema de Planos e Assinaturas do Azuria
 * Define tipos e interfaces para gerenciamento de planos
 */

export type PlanId = 'free' | 'iniciante' | 'essencial' | 'pro' | 'enterprise';

export type BillingInterval = 'monthly' | 'annual';

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete'
  | 'incomplete_expired';

export type TeamRole = 'admin' | 'manager' | 'analyst' | 'operator';

/**
 * Features disponíveis por plano
 */
export interface PlanFeatures {
  // Calculadoras
  basicCalculator: boolean;
  advancedCalculator: boolean;
  
  // Limites
  dailyCalculations: number | 'unlimited';
  aiQueriesPerMonth: number | 'unlimited';
  apiRequestsPerMonth: number | 'unlimited';
  maxStores: number | 'unlimited';
  teamMembers: number | 'unlimited';
  
  // Funcionalidades
  saveHistory: boolean;
  exportReports: boolean;
  exportFormats: string[]; // ['pdf', 'excel', 'csv']
  
  // IA
  aiAssistant: boolean;
  aiModel: 'gpt-3.5' | 'gpt-4' | null;
  
  // Analytics
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  competitorAnalysis: boolean;
  
  // Integrações
  marketplaceIntegration: boolean;
  marketplaces: string[]; // ['mercadolivre', 'shopee', 'amazon']
  priceAlerts: boolean;
  
  // API
  apiAccess: boolean;
  
  // Colaboração (Enterprise)
  teamCollaboration: boolean;
  permissionsSystem: boolean;
  auditLog: boolean;
  commentsOnCalculations: boolean;
  approvalWorkflow: boolean;
  consolidatedDashboard: boolean;
  
  // Suporte
  supportType: 'none' | 'email' | 'priority' | '24/7';
  supportResponseTime: string; // '48h', '24h', 'immediate'
  accountManager: boolean;
  personalizedOnboarding: boolean;
  slaGuarantee: boolean;
  
  // Branding
  watermark: boolean;
  whiteLabel: boolean;
}

/**
 * Informações de preço do plano
 */
export interface PlanPricing {
  monthly: number;
  annual: number;
  annualDiscount: number; // porcentagem
  currency: string;
  trialDays?: number;
}

/**
 * Definição completa de um plano
 */
export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  tagline?: string; // '⭐ POPULAR', '🚀 RECOMENDADO', '💼 EMPRESARIAL'
  pricing: PlanPricing;
  features: PlanFeatures;
  popular?: boolean;
  recommended?: boolean;
  customPricing?: boolean; // Para Enterprise com preço sob consulta
}

/**
 * Assinatura do usuário
 */
export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  
  // Mercado Pago
  mercadoPagoSubscriptionId?: string;
  mercadoPagoPreapprovalId?: string;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rastreamento de uso do usuário
 */
export interface UsageTracking {
  id: string;
  userId: string;
  subscriptionId: string;
  
  // Contadores do período atual
  calculationsToday: number;
  calculationsThisMonth: number;
  aiQueriesThisMonth: number;
  apiRequestsThisMonth: number;
  
  // Timestamps
  lastCalculationAt?: Date;
  lastAiQueryAt?: Date;
  lastApiRequestAt?: Date;
  periodStart: Date;
  periodEnd: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Membro de equipe (Enterprise)
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  
  // Permissões específicas
  permissions: {
    viewCalculations: boolean;
    createCalculations: boolean;
    editCalculations: boolean;
    deleteCalculations: boolean;
    exportReports: boolean;
    manageIntegrations: boolean;
    viewAnalytics: boolean;
    manageTeam: boolean;
    manageBilling: boolean;
  };
  
  invitedBy: string;
  invitedAt: Date;
  acceptedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Equipe (Enterprise)
 */
export interface Team {
  id: string;
  name: string;
  ownerId: string;
  subscriptionId: string;
  
  // Configurações
  settings: {
    requireApproval: boolean;
    allowComments: boolean;
    auditLogEnabled: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Histórico de mudanças de plano
 */
export interface PlanChangeHistory {
  id: string;
  userId: string;
  subscriptionId: string;
  fromPlanId: PlanId;
  toPlanId: PlanId;
  changeType: 'upgrade' | 'downgrade' | 'reactivation' | 'cancellation';
  reason?: string;
  effectiveDate: Date;
  createdAt: Date;
}

/**
 * Resultado da verificação de acesso a feature
 */
export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  limit?: number | 'unlimited';
  current?: number;
  upgradeRequired?: boolean;
  suggestedPlan?: PlanId;
}

/**
 * Limites de uso atuais do usuário
 */
export interface UserLimits {
  dailyCalculations: {
    limit: number | 'unlimited';
    used: number;
    remaining: number | 'unlimited';
    resetsAt: Date;
  };
  monthlyAiQueries: {
    limit: number | 'unlimited';
    used: number;
    remaining: number | 'unlimited';
    resetsAt: Date;
  };
  monthlyApiRequests: {
    limit: number | 'unlimited';
    used: number;
    remaining: number | 'unlimited';
    resetsAt: Date;
  };
  stores: {
    limit: number | 'unlimited';
    used: number;
    remaining: number | 'unlimited';
  };
  teamMembers: {
    limit: number | 'unlimited';
    used: number;
    remaining: number | 'unlimited';
  };
}
