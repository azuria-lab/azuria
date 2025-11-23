
import React, { Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Header from "./Header";
import Footer from "./Footer";
import ErrorBoundary from "./ErrorBoundary";
import PageTransition from "@/components/ui/page-transition";
import { AdvancedLoadingSpinner } from "@/components/ui/advanced-loading-spinner";
import { useScrollPerformance } from "@/hooks/useLazyLoad";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Azuria+ | Precificação inteligente com IA e automação",
  description = "Descubra o preço ideal para maximizar seus lucros em 30 segundos. IA avançada que considera impostos, concorrência e seu mercado automaticamente.",
  showHeader = true,
  showFooter = true,
}) => {
  const { isScrolling } = useScrollPerformance();

  return (
    <ErrorBoundary variant="page">
      <div className="flex flex-col min-h-screen bg-background w-full overflow-x-hidden">
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          
          {/* Performance optimizations */}
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* PWA Meta tags */}
          <meta name="theme-color" content="#3B82F6" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </Helmet>

        {showHeader && (
          <ErrorBoundary variant="component">
            <Header />
          </ErrorBoundary>
        )}

        <main className={`flex-grow w-full ${isScrolling ? 'scroll-smooth' : ''}`}>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-screen w-full">
                <AdvancedLoadingSpinner 
                  variant="dashboard" 
                  size="lg" 
                  message="Carregando conteúdo..." 
                />
              </div>
            }
          >
            <PageTransition>
              <ErrorBoundary variant="component">
                <div className="w-full">
                  {children}
                </div>
              </ErrorBoundary>
            </PageTransition>
          </Suspense>
        </main>

        {showFooter && (
          <ErrorBoundary variant="component">
            <Footer />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
