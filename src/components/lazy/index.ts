/**
 * @fileoverview Lazy loading de componentes pesados (modais, dialogs, etc.)
 *
 * Estes componentes são carregados sob demanda para reduzir o bundle inicial
 * NOTA: Componentes ainda não implementados estão comentados para evitar erros de build
 */

import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Cria um componente lazy com fallback null (para modais que não precisam de skeleton)
 */
export function lazyModal<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(importFn);
}

// ============================================================================
// Modais e Dialogs Lazy-loaded
// ============================================================================

// NOTA: Os componentes abaixo estão comentados porque ainda não foram implementados.
// Quando forem criados, basta descomentar a linha correspondente.

// export const LazyKeyboardShortcutsModal = lazy(
//   () => import('@/components/keyboard/KeyboardShortcutsModal')
// );

// export const LazyConnectMarketplaceDialog = lazy(
//   () => import('@/components/marketplace/ConnectMarketplaceDialog')
// );

// export const LazyShareCalculationDialog = lazy(
//   () => import('@/components/collaboration/ShareCalculationDialog')
// );

// export const LazyOnboardingModal = lazy(
//   () => import('@/components/onboarding/OnboardingModal')
// );

// export const LazyFeedbackModal = lazy(
//   () => import('@/components/feedback/FeedbackModal')
// );

/**
 * Modal de upgrade para PRO
 */
export const LazyUpgradeModal = lazy(
  () => import('@/components/subscription/UpgradeModal')
);

// ============================================================================
// Componentes pesados de Analytics (a implementar)
// ============================================================================

// export const LazyAdvancedAnalyticsDashboard = lazy(
//   () => import('@/components/analytics/advanced/AdvancedAnalyticsDashboard')
// );

// export const LazyAdvancedCharts = lazy(
//   () => import('@/components/analytics/charts/AdvancedCharts')
// );

// ============================================================================
// Componentes pesados de Integrações (a implementar)
// ============================================================================

// export const LazyMarketplaceIntegrations = lazy(
//   () => import('@/components/integrations/MarketplaceIntegrations')
// );

// export const LazyEcommerceIntegrations = lazy(
//   () => import('@/components/integrations/EcommerceIntegrations')
// );

// export const LazyERPIntegrations = lazy(
//   () => import('@/components/integrations/ERPIntegrations')
// );

// ============================================================================
// Componentes pesados de IA (a implementar)
// ============================================================================

// export const LazyAIAssistant = lazy(
//   () => import('@/components/ai/AIAssistant')
// );

// export const LazyAIAnalysisPanel = lazy(
//   () => import('@/components/ai/AIAnalysisPanel')
// );
