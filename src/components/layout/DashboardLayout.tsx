import React, { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdvancedLoadingSpinner } from "@/components/ui/advanced-loading-spinner";
import ErrorBoundary from "./ErrorBoundary";
import { ModeDeusProvider } from "@/azuria_ai";

// Lazy load componentes pesados para melhorar TTI (Time to Interactive)
const DashboardSidebar = lazy(() => import("@/components/layout/DashboardSidebar"));
const DashboardHeader = lazy(() => import("@/components/layout/DashboardHeader"));
const CoPilot = lazy(() => import("@/azuria_ai/ui/CoPilot"));

// Skeleton leve para sidebar (não bloqueia renderização)
const SidebarSkeleton = () => (
  <div className="w-[280px] h-screen bg-muted/30 animate-pulse" />
);

// Skeleton leve para header
const HeaderSkeleton = () => (
  <div className="h-14 w-full bg-muted/30 animate-pulse" />
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * DashboardLayout - Layout específico para área logada
 * Deve ser usado dentro de ProtectedRoute
 * Não faz verificação de autenticação (ProtectedRoute já faz isso)
 * 
 * Otimizações de Performance:
 * - Sidebar, Header e CoPilot são carregados via lazy loading
 * - ModeDeusProvider inicializa engines em background
 * - Skeletons leves evitam layout shift
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = "Dashboard - Azuria",
  description = "Dashboard principal com todas as ferramentas e funcionalidades do Azuria.",
}) => {
  return (
    <ErrorBoundary variant="page">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Helmet>

      <ModeDeusProvider autoInitialize>
        <SidebarProvider>
          <div className="flex flex-col min-h-screen w-full">
            {/* Header no topo */}
            <Suspense fallback={<HeaderSkeleton />}>
              <DashboardHeader />
            </Suspense>
            <Separator />
            
            {/* Conteúdo principal com sidebar e main */}
            <div className="flex flex-1 min-h-0 w-full relative">
              <Suspense fallback={<SidebarSkeleton />}>
                <DashboardSidebar />
              </Suspense>
              <SidebarInset className="flex flex-col flex-1 min-h-0">
                <main className="flex-1 overflow-auto">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[400px]">
                        <AdvancedLoadingSpinner
                          variant="dashboard"
                          size="lg"
                          message="Carregando..."
                        />
                      </div>
                    }
                  >
                    <div className="container mx-auto px-4 py-6">
                      {children}
                    </div>
                  </Suspense>
                </main>
              </SidebarInset>
            </div>
          </div>
          {/* CoPilot unificado - lazy loaded para não bloquear renderização inicial */}
          <Suspense fallback={null}>
            <CoPilot position="bottom-right" defaultMinimized />
          </Suspense>
        </SidebarProvider>
      </ModeDeusProvider>
    </ErrorBoundary>
  );
};

export default DashboardLayout;

