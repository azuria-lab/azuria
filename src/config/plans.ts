/**
 * Configuração dos Planos de Assinatura do Azuria
 * Define todos os planos disponíveis com suas features e preços
 */

import { Plan, PlanId } from '@/types/subscription';

/**
 * Plano FREE
 * Modo de teste - não exibido na página de planos
 */
const freePlan: Plan = {
  id: 'free',
  name: 'Gratuito',
  description:
    'Modo de teste para experimentar a plataforma',
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
    dailyCalculations: 5, // Limite reduzido para 5
    aiQueriesPerMonth: 0,
    apiRequestsPerMonth: 0,
    maxStores: 0,
    teamMembers: 1,

    // Funcionalidades
    saveHistory: false, // Histórico limitado (últimos 3)
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
 * Plano INICIANTE
 * Foco exclusivo na Calculadora Rápida ilimitada
 */
const iniciantePlan: Plan = {
  id: 'iniciante',
  name: 'Iniciante',
  description:
    'Perfeito para quem está começando e precisa precificar rápido, sem complicação',
  pricing: {
    monthly: 25,
    annual: 250,
    annualDiscount: 17,
    currency: 'BRL',
    trialDays: 7,
  },
  features: {
    // Calculadoras
    basicCalculator: true, // Calculadora Rápida ilimitada
    advancedCalculator: false, // Bloqueada

    // Limites
    dailyCalculations: 'unlimited', // Ilimitado para Calculadora Rápida
    aiQueriesPerMonth: 0,
    apiRequestsPerMonth: 0,
    maxStores: 0,
    teamMembers: 1,

    // Funcionalidades
    saveHistory: true, // Histórico ilimitado
    exportReports: true, // Exportação em PDF
    exportFormats: ['pdf'],

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
 * Plano ESSENCIAL ⭐
 * O plano mais popular - ideal para pequenos negócios e profissionais
 */
const essencialPlan: Plan = {
  id: 'essencial',
  name: 'Essencial',
  description:
    'Para empreendedores individuais que precisam de controle profissional',
  tagline: 'Mais Popular',
  popular: true,
  pricing: {
    monthly: 59,
    annual: 590,
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
  description: 'Para negócios em expansão com múltiplos canais de venda',
  tagline: 'Recomendado',
  recommended: true,
  pricing: {
    monthly: 119,
    annual: 1190,
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
  description: 'Solução corporativa com recursos avançados e suporte dedicado',
  tagline: 'Enterprise',
  customPricing: true,
  pricing: {
    monthly: 299,
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
  iniciante: iniciantePlan,
  essencial: essencialPlan,
  pro: proPlan,
  enterprise: enterprisePlan,
};

/**
 * Array ordenado dos planos para exibição (FREE não é exibido)
 */
export const PLANS_ARRAY: Plan[] = [
  iniciantePlan,
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
export const planHasFeature = (
  planId: PlanId,
  feature: keyof Plan['features']
): boolean => {
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
  const order: PlanId[] = ['free', 'iniciante', 'essencial', 'pro', 'enterprise'];
  return order.indexOf(planId1) - order.indexOf(planId2);
};

/**
 * Verifica se um plano é superior a outro
 */
export const isPlanHigher = (
  planId: PlanId,
  comparedToPlanId: PlanId
): boolean => {
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
  const planOrder: PlanId[] = ['free', 'iniciante', 'essencial', 'pro', 'enterprise'];
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
    'Até 5 cálculos/dia',
    'Calculadora rápida',
    'Templates básicos',
    'Histórico limitado (3 últimos)',
  ],
  iniciante: [
    'Uso ilimitado da Calculadora Rápida',
    'Templates completos',
    'Histórico ilimitado',
    'Exportação em PDF',
    'Presets salvos (maquininha e impostos)',
    'Duplicar cálculos',
    'Salvar modelos rápidos',
  ],
  essencial: [
    'Tudo do Iniciante',
    'Calculadora Avançada',
    'Calculadora Tributária',
    '50 consultas IA/mês (GPT-3.5)',
    'Analytics básico',
    "Sem marca d'água",
  ],
  pro: [
    'Tudo do Essencial',
    'IA ilimitada (GPT-4)',
    'Integração com marketplaces',
    'Análise de concorrência',
    'Alertas de preço',
    'Analytics avançado',
    'Até 3 lojas conectadas',
    'API (1.000 requisições/mês)',
  ],
  enterprise: [
    'Tudo do Pro',
    'API ilimitada',
    'Lojas ilimitadas',
    'Colaboração em equipe',
    'Usuários ilimitados',
    'Controle de permissões',
    'White label',
    'Suporte prioritário 24/7',
    'Account manager dedicado',
  ],
};
