import React, { Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdvancedLoadingSpinner } from "@/components/ui/advanced-loading-spinner";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ErrorBoundary from "./ErrorBoundary";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * DashboardLayout - Layout específico para área logada
 * Deve ser usado dentro de ProtectedRoute
 * Não faz verificação de autenticação (ProtectedRoute já faz isso)
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

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <DashboardHeader />
            <Separator />
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
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default DashboardLayout;

