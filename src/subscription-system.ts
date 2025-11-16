/**
 * Sistema de Planos e Assinaturas - Exports
 * Facilita importação de hooks e componentes
 */

// Hooks
export { useSubscription } from './hooks/useSubscription';
export { useFeatureAccess } from './hooks/useFeatureAccess';
export { usePlanLimits } from './hooks/usePlanLimits';
export { useMercadoPago } from './hooks/useMercadoPago';
export { useTeams } from './hooks/useTeams';
export { useTeamMembers } from './hooks/useTeamMembers';

// Componentes
export { PricingCard } from './components/subscription/PricingCard';
export { SubscriptionBadge } from './components/subscription/SubscriptionBadge';
export { FeatureGate, FeatureBlock } from './components/subscription/FeatureGate';
export { UsageDisplay } from './components/subscription/UsageDisplay';
export { LimitReachedBlock } from './components/subscription/LimitReachedBlock';
export { PlanChangeHistory as PlanHistoryComponent } from './components/subscription/PlanChangeHistory';
export { PlanComparison } from './components/subscription/PlanComparison';
export { MercadoPagoCheckout } from './components/payment/MercadoPagoCheckout';

// Páginas
export { default as SubscriptionManagementPage } from './pages/SubscriptionManagementPage';
export { default as PaymentReturnPage } from './pages/PaymentReturnPage';

// Configuração
export { 
  PLANS, 
  PLANS_ARRAY, 
  PLAN_HIGHLIGHTS,
  getPlanById,
  formatPrice,
  comparePlans,
  isPlanHigher,
  getAnnualSavings,
  getRecommendedUpgrade,
} from './config/plans';

// Tipos
export type {
  Plan,
  PlanId,
  PlanFeatures,
  PlanPricing,
  Subscription,
  SubscriptionStatus,
  BillingInterval,
  UsageTracking,
  UserLimits,
  FeatureAccessResult,
  Team,
  TeamMember,
  TeamRole,
  PlanChangeHistory,
} from './types/subscription';
