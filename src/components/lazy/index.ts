/**
 * @fileoverview Lazy loading de componentes pesados (modais, dialogs, etc.)
 * 
 * Estes componentes são carregados sob demanda para reduzir o bundle inicial
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

/**
 * Modal de atalhos de teclado (raramente usado)
 */
export const LazyKeyboardShortcutsModal = lazy(
  () => import('@/components/keyboard/KeyboardShortcutsModal')
);

/**
 * Dialog de conexão com marketplace
 */
export const LazyConnectMarketplaceDialog = lazy(
  () => import('@/components/marketplace/ConnectMarketplaceDialog')
);

/**
 * Dialog de compartilhamento de cálculo
 */
export const LazyShareCalculationDialog = lazy(
  () => import('@/components/collaboration/ShareCalculationDialog')
);

/**
 * Modal de onboarding/tour
 */
export const LazyOnboardingModal = lazy(
  () => import('@/components/onboarding/OnboardingModal').catch(() => ({ default: () => null }))
);

/**
 * Modal de feedback
 */
export const LazyFeedbackModal = lazy(
  () => import('@/components/feedback/FeedbackModal').catch(() => ({ default: () => null }))
);

/**
 * Modal de upgrade para PRO
 */
export const LazyUpgradeModal = lazy(
  () => import('@/components/subscription/UpgradeModal').catch(() => ({ default: () => null }))
);

// ============================================================================
// Componentes pesados de Analytics
// ============================================================================

/**
 * Dashboard avançado de analytics
 */
export const LazyAdvancedAnalyticsDashboard = lazy(
  () => import('@/components/analytics/advanced/AdvancedAnalyticsDashboard')
);

/**
 * Gráficos avançados (charts pesados)
 */
export const LazyAdvancedCharts = lazy(
  () => import('@/components/analytics/charts/AdvancedCharts').catch(() => ({ default: () => null }))
);

// ============================================================================
// Componentes pesados de Integrações
// ============================================================================

/**
 * Painel de integrações com marketplaces
 */
export const LazyMarketplaceIntegrations = lazy(
  () => import('@/components/integrations/MarketplaceIntegrations')
);

/**
 * Painel de integrações E-commerce
 */
export const LazyEcommerceIntegrations = lazy(
  () => import('@/components/integrations/EcommerceIntegrations')
);

/**
 * Painel de integrações ERP
 */
export const LazyERPIntegrations = lazy(
  () => import('@/components/integrations/ERPIntegrations')
);

// ============================================================================
// Componentes pesados de IA
// ============================================================================

/**
 * Assistente IA completo
 */
export const LazyAIAssistant = lazy(
  () => import('@/components/ai/AIAssistant').catch(() => ({ default: () => null }))
);

/**
 * Painel de análise IA
 */
export const LazyAIAnalysisPanel = lazy(
  () => import('@/components/ai/AIAnalysisPanel').catch(() => ({ default: () => null }))
);
