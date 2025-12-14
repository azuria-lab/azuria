import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * PrefetchOnIdle - Pré-carrega módulos importantes em tempo ocioso
 * 
 * Estratégias de otimização:
 * 1. Prefetch inicial: carrega rotas mais usadas após página carregar
 * 2. Prefetch contextual: carrega rotas relacionadas à página atual
 * 3. Usa requestIdleCallback para não bloquear interações do usuário
 */
export default function PrefetchOnIdle() {
  const location = useLocation();

  /**
   * Prefetch inicial - rotas mais acessadas
   */
  const prefetchCriticalRoutes = useCallback(() => {
    const criticalTasks = [
      import("@/pages/DashboardPage"),
      import("@/pages/RapidCalculatorPage"),
      import("@/pages/AdvancedProCalculatorPage"),
    ];

    Promise.allSettled(criticalTasks).catch(() => {
      // Silencia erros de prefetch
    });
  }, []);

  /**
   * Prefetch secundário - outras rotas importantes
   */
  const prefetchSecondaryRoutes = useCallback(() => {
    const secondaryTasks = [
      import("@/pages/PricingPage"),
      import("@/pages/IntegrationsPage"),
      import("@/pages/AdvancedAnalyticsDashboard"),
      import("@/pages/BatchCalculatorPage"),
      import("@/pages/HistoryPage"),
    ];

    Promise.allSettled(secondaryTasks).catch(() => {
      // Silencia erros de prefetch
    });
  }, []);

  /**
   * Prefetch de componentes pesados (analytics, integrações)
   */
  const prefetchHeavyComponents = useCallback(() => {
    const heavyTasks = [
      import("@/components/integrations/MarketplaceIntegrations"),
      import("@/components/integrations/EcommerceIntegrations"),
      import("@/components/analytics/AnalyticsDashboard"),
      import("@/components/analytics/advanced/AdvancedAnalyticsDashboard"),
    ];

    Promise.allSettled(heavyTasks).catch(() => {
      // Silencia erros de prefetch
    });
  }, []);

  /**
   * Prefetch contextual baseado na rota atual
   */
  const prefetchContextualRoutes = useCallback(() => {
    const path = location.pathname;

    // Se estiver no dashboard, prefetch das calculadoras
    if (path === "/dashboard") {
      Promise.allSettled([
        import("@/pages/RapidCalculatorPage"),
        import("@/pages/AdvancedProCalculatorPage"),
        import("@/pages/AnalyticsDashboardPage"),
      ]).catch(() => {});
    }

    // Se estiver em calculadora rápida, prefetch da avançada
    if (path === "/calculadora-rapida") {
      Promise.allSettled([
        import("@/pages/AdvancedProCalculatorPage"),
        import("@/pages/BatchCalculatorPage"),
      ]).catch(() => {});
    }

    // Se estiver em analytics, prefetch de relatórios
    if (path.includes("analytics")) {
      Promise.allSettled([
        import("@/pages/ReportsPage"),
        import("@/pages/ProfitabilityAnalysisPage"),
      ]).catch(() => {});
    }
  }, [location.pathname]);

  // Prefetch inicial (apenas produção)
  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }

    const w = globalThis as typeof globalThis & { 
      requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number 
    };
    const hasRIC = typeof w.requestIdleCallback === "function";

    // Fase 1: Rotas críticas (imediato no idle)
    const scheduleIdle = (cb: () => void, timeout: number) => {
      if (hasRIC && w.requestIdleCallback) {
        w.requestIdleCallback(cb, { timeout });
      } else {
        setTimeout(cb, timeout);
      }
    };

    // Escalonar prefetch para não sobrecarregar
    scheduleIdle(prefetchCriticalRoutes, 500);
    scheduleIdle(prefetchSecondaryRoutes, 2000);
    scheduleIdle(prefetchHeavyComponents, 4000);
  }, [prefetchCriticalRoutes, prefetchSecondaryRoutes, prefetchHeavyComponents]);

  // Prefetch contextual quando rota muda
  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }

    const timer = setTimeout(prefetchContextualRoutes, 1000);
    return () => clearTimeout(timer);
  }, [prefetchContextualRoutes]);

  return null;
}
