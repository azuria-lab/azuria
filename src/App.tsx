
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { HelmetProvider } from "react-helmet-async";
import PrefetchOnIdle from "@/components/system/PrefetchOnIdle";

// Import skeleton loaders for better UX
import { SkeletonPage } from "@/components/ui/skeleton-loaders";

// Import critical pages directly for faster initial load
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazy load all other pages with route-based code splitting
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SimpleCalculatorPage = lazy(() => import("./pages/SimpleCalculatorPage"));
const AdvancedCalculatorPage = lazy(() => import("./pages/AdvancedProCalculatorPage"));
const BatchCalculatorPage = lazy(() => import("./pages/BatchCalculatorPage"));
const TaxCalculatorPage = lazy(() => import("./pages/TaxCalculatorPage"));
const IntelligentBatchCalculatorPage = lazy(() => import("./pages/IntelligentBatchCalculatorPage"));
const MarketplaceComparatorPage = lazy(() => import("./pages/MarketplaceComparatorPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const CompetitionAnalysisPage = lazy(() => import("./pages/CompetitionAnalysisPage"));
const SensitivityAnalysisPage = lazy(() => import("./pages/SensitivityAnalysisPage"));
const ProfitabilityAnalysisPage = lazy(() => import("./pages/ProfitabilityAnalysisPage"));
const AdvancedAnalyticsDashboard = lazy(() => import("./pages/AdvancedAnalyticsDashboard"));
const AnalyticsDashboardPage = lazy(() => import("./pages/AnalyticsDashboardPage"));
const IntelligenceDataPage = lazy(() => import("./pages/IntelligenceDataPage"));
const PricingMetricsDashboard = lazy(() => import("./pages/PricingMetricsDashboard"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const IntegrationsPage = lazy(() => import("./pages/IntegrationsPage"));
const ApiPage = lazy(() => import("./pages/ApiPage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const SubscriptionManagementPage = lazy(() => import("./pages/SubscriptionManagementPage"));
const PaymentReturnPage = lazy(() => import("./pages/PaymentReturnPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const MonetizationPage = lazy(() => import("./pages/MonetizationPage"));
const Welcome = lazy(() => import("./pages/Welcome"));
const SecurityDashboardPage = lazy(() => import("./pages/SecurityDashboardPage"));
const ScenariosPage = lazy(() => import("./pages/ScenariosPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const AIPage = lazy(() => import("./pages/AIPage"));
const Templates = lazy(() => import("./pages/Templates"));
const CollaborationPage = lazy(() => import("./pages/CollaborationPage"));
const AutomationPage = lazy(() => import("./pages/AutomationPage"));
const RuleDetailsPage = lazy(() => import("./pages/RuleDetailsPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const SupabaseDebug = lazy(() => import("./pages/SupabaseDebug"));

// Domain Providers
import { AuthProvider } from "@/domains/auth";
import { MultiTenantProvider } from "@/contexts/MultiTenantContext";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

// UI/UX Providers
import { TourOverlay, TourProvider } from "@/components/tour";
import { KeyboardShortcutsModal, KeyboardShortcutsProvider } from "@/components/keyboard";
import { GlobalShortcuts } from "@/components/shortcuts/GlobalShortcuts";

// Optimized query client with better cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="azuria-theme">
              <KeyboardShortcutsProvider>
                <TourProvider>
                  <AuthProvider>
                    <MultiTenantProvider>
                      <AnalyticsProvider>
                        <Toaster />
                        <PrefetchOnIdle />
                        <TourOverlay />
                        <KeyboardShortcutsModal />
                        <GlobalShortcuts />
                  <Suspense fallback={<SkeletonPage />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/calculadora-simples" element={<SimpleCalculatorPage />} />
                      <Route path="/calculadora-avancada" element={<AdvancedCalculatorPage />} />
                      <Route path="/calculadora-tributaria" element={<TaxCalculatorPage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/cadastro" element={<Login />} />
                      
                      {/* Lazy loaded routes */}
                      <Route path="/calculadora-lotes" element={<BatchCalculatorPage />} />
                      <Route path="/calculadora-lotes-inteligente" element={<IntelligentBatchCalculatorPage />} />
                      <Route path="/cenarios" element={<ScenariosPage />} />
                      <Route path="/importacao" element={<ImportPage />} />
                      <Route path="/comparador-marketplaces" element={<MarketplaceComparatorPage />} />
                      <Route path="/marketplace" element={<MarketplacePage />} />
                      <Route path="/analise-concorrencia" element={<CompetitionAnalysisPage />} />
                      <Route path="/analise-sensibilidade" element={<SensitivityAnalysisPage />} />
                      <Route path="/analise-rentabilidade" element={<ProfitabilityAnalysisPage />} />
                      <Route path="/analytics" element={<AdvancedAnalyticsDashboard />} />
                      <Route path="/analytics-basico" element={<AnalyticsDashboardPage />} />
                      <Route path="/inteligencia-dados" element={<IntelligenceDataPage />} />
                      <Route path="/metricas-precos" element={<PricingMetricsDashboard />} />
                      <Route path="/relatorios" element={<ReportsPage />} />
                      <Route path="/historico" element={<HistoryPage />} />
                      <Route path="/integracoes" element={<IntegrationsPage />} />
                      <Route path="/automacoes" element={<AutomationPage />} />
                      <Route path="/automacoes/regra/:id" element={<RuleDetailsPage />} />
                      <Route path="/api" element={<ApiPage />} />
                      <Route path="/enterprise" element={<EnterprisePage />} />
                      <Route path="/configuracoes" element={<SettingsPage />} />
                      <Route path="/seguranca" element={<SecurityDashboardPage />} />
                      <Route path="/planos" element={<PricingPage />} />
                      <Route path="/assinatura" element={<SubscriptionManagementPage />} />
                      <Route path="/pagamento/retorno" element={<PaymentReturnPage />} />
                      <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
                      <Route path="/monetizacao" element={<MonetizationPage />} />
                      <Route path="/templates" element={<Templates />} />
                      <Route path="/colaboracao" element={<CollaborationPage />} />
                      <Route path="/ia" element={<AIPage />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/debug-supabase" element={<SupabaseDebug />} />
                      <Route path="/welcome" element={<Welcome />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                      </Suspense>
                    </AnalyticsProvider>
                  </MultiTenantProvider>
                </AuthProvider>
              </TourProvider>
            </KeyboardShortcutsProvider>
          </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
