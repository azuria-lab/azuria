import { useEffect } from "react";

export default function PrefetchOnIdle() {
  // Avoid prefetching in development to prevent pulling in modules with build issues
  if (import.meta.env.DEV) {
    return null;
  }
  useEffect(() => {
    const prefetch = () => {
      // Prefetch rotas-chave e módulos pesados em idle
      const tasks = [
        import("@/pages/DashboardPage"),
        import("@/pages/PricingPage"),
        import("@/pages/IntegrationsPage"),
        import("@/pages/EnterprisePage"),
        import("@/pages/Welcome"),
        import("@/pages/AdvancedAnalyticsDashboard"),
      ];

// MarketplaceIntegrations e outros módulos pesados usados dentro de integrações
      tasks.push(import("@/components/integrations/MarketplaceIntegrations"));
      tasks.push(import("@/components/integrations/EcommerceIntegrations"));
      tasks.push(import("@/components/integrations/ERPIntegrations"));
      tasks.push(import("@/components/integrations/SpreadsheetSync"));
      tasks.push(import("@/components/integrations/WebhookAutomation"));
      tasks.push(import("@/components/integrations/WebhookIntegration"));
      tasks.push(import("@/components/integrations/SharingOptions"));
      tasks.push(import("@/components/integrations/ExportOptions"));

      // Dashboards/Analytics
      tasks.push(import("@/components/analytics/AnalyticsDashboard"));
      tasks.push(import("@/components/analytics/advanced/AdvancedAnalyticsDashboard"));

      Promise.allSettled(tasks).catch(() => {
        // Silencia erros de prefetch
      });
    };

    // Executa em idle ou após pequeno atraso
    const hasRIC = typeof (window as any).requestIdleCallback === "function";
    if (hasRIC) {
      (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
      setTimeout(prefetch, 1200);
    }
  }, []);

  return null;
}
