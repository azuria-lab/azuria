/**
 * Configuração dos Planos de Assinatura do Azuria
 * Define todos os planos disponíveis com suas features e preços
 */

import { Plan, PlanId } from '@/types/subscription';

/**
 * Plano FREE
 * Ideal para usuários que querem experimentar a plataforma
 */
const freePlan: Plan = {
  id: 'free',
  name: 'Free',
  description: 'Para começar a calcular seus custos e descobrir o Azuria',
  pricing: {
    monthly: 0,
    annual: 0,
    annualDiscount: 0,
    currency: 'BRL',
  },
  features: {
    // Calculadoras
    basicCalculator: true,
    advancedCalculator: false,
    
    // Limites
    dailyCalculations: 10,
    aiQueriesPerMonth: 0,
    apiRequestsPerMonth: 0,
    maxStores: 0,
    teamMembers: 1,
    
    // Funcionalidades
    saveHistory: false,
    exportReports: false,
    exportFormats: [],
    
    // IA
    aiAssistant: false,
    aiModel: null,
    
    // Analytics
    basicAnalytics: false,
    advancedAnalytics: false,
    competitorAnalysis: false,
    
    // Integrações
    marketplaceIntegration: false,
    marketplaces: [],
    priceAlerts: false,
    
    // API
    apiAccess: false,
    
    // Colaboração
    teamCollaboration: false,
    permissionsSystem: false,
    auditLog: false,
    commentsOnCalculations: false,
    approvalWorkflow: false,
    consolidatedDashboard: false,
    
    // Suporte
    supportType: 'none',
    supportResponseTime: '-',
    accountManager: false,
    personalizedOnboarding: false,
    slaGuarantee: false,
    
    // Branding
    watermark: true,
    whiteLabel: false,
  },
};

/**
 * Plano ESSENCIAL ⭐
 * O plano mais popular - ideal para pequenos negócios e profissionais
 */
const essencialPlan: Plan = {
  id: 'essencial',
  name: 'Essencial',
  description: 'Perfeito para pequenos negócios que precisam de controle total sobre custos',
  tagline: '⭐ POPULAR',
  popular: true,
  pricing: {
    monthly: 59.00,
    annual: 590.00,
    annualDiscount: 17,
    currency: 'BRL',
    trialDays: 7,
  },
  features: {
    // Calculadoras
    basicCalculator: true,
    advancedCalculator: true,
    
    // Limites
    dailyCalculations: 'unlimited',
    aiQueriesPerMonth: 50,
    apiRequestsPerMonth: 0,
    maxStores: 1,
    teamMembers: 1,
    
    // Funcionalidades
    saveHistory: true,
    exportReports: true,
    exportFormats: ['pdf'],
    
    // IA
    aiAssistant: true,
    aiModel: 'gpt-3.5',
    
    // Analytics
    basicAnalytics: true,
    advancedAnalytics: false,
    competitorAnalysis: false,
    
    // Integrações
    marketplaceIntegration: false,
    marketplaces: [],
    priceAlerts: false,
    
    // API
    apiAccess: false,
    
    // Colaboração
    teamCollaboration: false,
    permissionsSystem: false,
    auditLog: false,
    commentsOnCalculations: false,
    approvalWorkflow: false,
    consolidatedDashboard: false,
    
    // Suporte
    supportType: 'email',
    supportResponseTime: '48h',
    accountManager: false,
    personalizedOnboarding: false,
    slaGuarantee: false,
    
    // Branding
    watermark: false,
    whiteLabel: false,
  },
};

/**
 * Plano PRO 🚀
 * Recomendado para negócios em crescimento que vendem em múltiplos marketplaces
 */
const proPlan: Plan = {
  id: 'pro',
  name: 'Pro',
  description: 'Para negócios sérios que vendem em múltiplos marketplaces e precisam de IA avançada',
  tagline: '🚀 RECOMENDADO',
  recommended: true,
  pricing: {
    monthly: 119.00,
    annual: 1190.00,
    annualDiscount: 17,
    currency: 'BRL',
    trialDays: 14,
  },
  features: {
    // Calculadoras
    basicCalculator: true,
    advancedCalculator: true,
    
    // Limites
    dailyCalculations: 'unlimited',
    aiQueriesPerMonth: 'unlimited',
    apiRequestsPerMonth: 1000,
    maxStores: 3,
    teamMembers: 1,
    
    // Funcionalidades
    saveHistory: true,
    exportReports: true,
    exportFormats: ['pdf', 'excel', 'csv'],
    
    // IA
    aiAssistant: true,
    aiModel: 'gpt-4',
    
    // Analytics
    basicAnalytics: true,
    advancedAnalytics: true,
    competitorAnalysis: true,
    
    // Integrações
    marketplaceIntegration: true,
    marketplaces: ['mercadolivre', 'shopee', 'amazon'],
    priceAlerts: true,
    
    // API
    apiAccess: true,
    
    // Colaboração
    teamCollaboration: false,
    permissionsSystem: false,
    auditLog: false,
    commentsOnCalculations: false,
    approvalWorkflow: false,
    consolidatedDashboard: false,
    
    // Suporte
    supportType: 'priority',
    supportResponseTime: '24h',
    accountManager: false,
    personalizedOnboarding: false,
    slaGuarantee: false,
    
    // Branding
    watermark: false,
    whiteLabel: false,
  },
};

/**
 * Plano ENTERPRISE 💼
 * Para empresas que precisam de colaboração em equipe e suporte premium
 */
const enterprisePlan: Plan = {
  id: 'enterprise',
  name: 'Enterprise',
  description: 'Solução completa para empresas com equipes, white label e suporte dedicado',
  tagline: '💼 EMPRESARIAL',
  customPricing: true,
  pricing: {
    monthly: 299.00,
    annual: 0, // Negociável
    annualDiscount: 0,
    currency: 'BRL',
    trialDays: 30,
  },
  features: {
    // Calculadoras
    basicCalculator: true,
    advancedCalculator: true,
    
    // Limites
    dailyCalculations: 'unlimited',
    aiQueriesPerMonth: 'unlimited',
    apiRequestsPerMonth: 'unlimited',
    maxStores: 'unlimited',
    teamMembers: 'unlimited',
    
    // Funcionalidades
    saveHistory: true,
    exportReports: true,
    exportFormats: ['pdf', 'excel', 'csv'],
    
    // IA
    aiAssistant: true,
    aiModel: 'gpt-4',
    
    // Analytics
    basicAnalytics: true,
    advancedAnalytics: true,
    competitorAnalysis: true,
    
    // Integrações
    marketplaceIntegration: true,
    marketplaces: ['mercadolivre', 'shopee', 'amazon'],
    priceAlerts: true,
    
    // API
    apiAccess: true,
    
    // Colaboração (Exclusivo Enterprise)
    teamCollaboration: true,
    permissionsSystem: true,
    auditLog: true,
    commentsOnCalculations: true,
    approvalWorkflow: true,
    consolidatedDashboard: true,
    
    // Suporte Premium
    supportType: '24/7',
    supportResponseTime: 'immediate',
    accountManager: true,
    personalizedOnboarding: true,
    slaGuarantee: true,
    
    // Branding
    watermark: false,
    whiteLabel: true,
  },
};

/**
 * Todos os planos disponíveis
 */
export const PLANS: Record<PlanId, Plan> = {
  free: freePlan,
  essencial: essencialPlan,
  pro: proPlan,
  enterprise: enterprisePlan,
};

/**
 * Array ordenado dos planos para exibição
 */
export const PLANS_ARRAY: Plan[] = [
  freePlan,
  essencialPlan,
  proPlan,
  enterprisePlan,
];

/**
 * Obtém um plano por ID
 */
export const getPlanById = (planId: PlanId): Plan => {
  return PLANS[planId];
};

/**
 * Verifica se um plano tem uma feature específica
 */
export const planHasFeature = (planId: PlanId, feature: keyof Plan['features']): boolean => {
  const plan = PLANS[planId];
  const featureValue = plan.features[feature];
  
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  if (typeof featureValue === 'number') {
    return featureValue > 0;
  }
  
  if (featureValue === 'unlimited') {
    return true;
  }
  
  if (Array.isArray(featureValue)) {
    return featureValue.length > 0;
  }
  
  return false;
};

/**
 * Compara dois planos
 */
export const comparePlans = (planId1: PlanId, planId2: PlanId): number => {
  const order: PlanId[] = ['free', 'essencial', 'pro', 'enterprise'];
  return order.indexOf(planId1) - order.indexOf(planId2);
};

/**
 * Verifica se um plano é superior a outro
 */
export const isPlanHigher = (planId: PlanId, comparedToPlanId: PlanId): boolean => {
  return comparePlans(planId, comparedToPlanId) > 0;
};

/**
 * Calcula o preço anual com desconto
 */
export const getAnnualPrice = (planId: PlanId): number => {
  const plan = PLANS[planId];
  return plan.pricing.annual;
};

/**
 * Calcula a economia anual em reais
 */
export const getAnnualSavings = (planId: PlanId): number => {
  const plan = PLANS[planId];
  const monthlyTotal = plan.pricing.monthly * 12;
  return monthlyTotal - plan.pricing.annual;
};

/**
 * Formata preço em BRL
 */
export const formatPrice = (price: number): string => {
  if (price === 0) {
    return 'Grátis';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

/**
 * Obtém o plano recomendado para upgrade
 */
export const getRecommendedUpgrade = (currentPlanId: PlanId): PlanId | null => {
  const planOrder: PlanId[] = ['free', 'essencial', 'pro', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlanId);
  
  if (currentIndex < planOrder.length - 1) {
    return planOrder[currentIndex + 1];
  }
  
  return null;
};

/**
 * Mensagens de features destacadas por plano
 */
export const PLAN_HIGHLIGHTS: Record<PlanId, string[]> = {
  free: [
    '10 cálculos por dia',
    'Calculadora básica',
    'Marca d\'água',
  ],
  essencial: [
    'Cálculos ilimitados',
    'Histórico ilimitado',
    '50 consultas IA/mês',
    'Analytics básico',
    'Exportar PDF',
    'Sem marca d\'água',
  ],
  pro: [
    'Tudo do Essencial',
    'IA ilimitada (GPT-4)',
    'Integração com marketplaces',
    'Análise de concorrência',
    'Alertas de preço',
    'Dashboard avançado',
    'Até 3 lojas',
    'API básica',
  ],
  enterprise: [
    'Tudo do PRO',
    'API ilimitada',
    'Lojas ilimitadas',
    'Sistema de equipes',
    'Usuários ilimitados',
    'Permissões por função',
    'White label',
    'Suporte 24/7',
    'Account manager dedicado',
  ],
};
