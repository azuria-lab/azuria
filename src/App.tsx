
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { HelmetProvider } from "react-helmet-async";
import PrefetchOnIdle from "@/components/system/PrefetchOnIdle";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Import skeleton loaders for better UX
import { SkeletonPage } from "@/components/ui/skeleton-loaders";

// Import critical pages directly for faster initial load
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazy load all other pages with route-based code splitting
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const RapidCalculatorPage = lazy(() => import("./pages/RapidCalculatorPage"));
const AdvancedCalculatorPage = lazy(() => import("./pages/AdvancedProCalculatorPage"));
const BatchCalculatorPage = lazy(() => import("./pages/BatchCalculatorPage"));
const TaxCalculatorPage = lazy(() => import("./pages/TaxCalculatorPage"));
const MarketplaceComparatorPage = lazy(() => import("./pages/MarketplaceComparatorPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
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
const CompanyDataPage = lazy(() => import("./pages/CompanyDataPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const SubscriptionManagementPage = lazy(() => import("./pages/SubscriptionManagementPage"));
const PaymentReturnPage = lazy(() => import("./pages/PaymentReturnPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const MonetizationPage = lazy(() => import("./pages/MonetizationPage"));
const Welcome = lazy(() => import("./pages/Welcome"));
const SecurityDashboardPage = lazy(() => import("./pages/SecurityDashboardPage"));
const ScenariosPage = lazy(() => import("./pages/ScenariosPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const Templates = lazy(() => import("./pages/Templates"));
const CollaborationPage = lazy(() => import("./pages/CollaborationPage"));
const TeamsPage = lazy(() => 
  import("./pages/TeamsPage").catch((error) => {
    console.error("Erro ao carregar TeamsPage:", error);
    // Retornar um componente de fallback em caso de erro
    return { default: () => <div>Erro ao carregar a página de Equipes. Por favor, recarregue a página.</div> };
  })
);
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AutomationPage = lazy(() => import("./pages/AutomationPage"));
const MeuNegocioPage = lazy(() => import("./pages/MeuNegocioPage"));
const ProductFormPage = lazy(() => import("./pages/ProductFormPage"));
const RuleDetailsPage = lazy(() => import("./pages/RuleDetailsPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const SupabaseDebug = lazy(() => import("./pages/SupabaseDebug"));
const CreatorAdminPage = lazy(() => import("./pages/admin/creator"));

// Bidding Module Pages
const BiddingCalculatorPage = lazy(() => import("./pages/BiddingCalculatorPage"));
const BiddingDashboardPage = lazy(() => import("./pages/BiddingDashboardPage"));
const DocumentosPage = lazy(() => import("./pages/DocumentosPage"));

// AI Module Pages - Unified
const AzuriaAIHub = lazy(() => import("./pages/AzuriaAIHub"));
const CognitiveDashboardPage = lazy(() => import("./pages/CognitiveDashboardPage"));

// Domain Providers
import { AuthProvider } from "@/domains/auth";
import { MultiTenantProvider } from "@/contexts/MultiTenantContext";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

// UI/UX Providers
import { TourOverlay, TourProvider } from "@/components/tour";
import { KeyboardShortcutsModal, KeyboardShortcutsProvider } from "@/components/keyboard";
import { GlobalShortcuts } from "@/components/shortcuts/GlobalShortcuts";

// QueryClient otimizado centralizado
import { queryClient } from "@/lib/queryClient";

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
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/cadastro" element={<Login />} />
                      <Route path="/planos" element={<PricingPage />} />
                      <Route path="/recursos" element={<ResourcesPage />} />
                      <Route path="/sobre" element={<AboutPage />} />
                      <Route path="/central-ajuda" element={<HelpCenterPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/pagamento/retorno" element={<PaymentReturnPage />} />
                      <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
                      
                      {/* Protected Dashboard Routes - All tools are now inside the dashboard */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <DashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Calculator Routes - Protected */}
                      <Route
                        path="/calculadora-rapida"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <RapidCalculatorPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      {/* Redirect antiga rota para nova */}
                      <Route
                        path="/calculadora-simples"
                        element={<Navigate to="/calculadora-rapida" replace />}
                      />
                      <Route
                        path="/calculadora-avancada"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <AdvancedCalculatorPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/calculadora-tributaria"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <TaxCalculatorPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/calculadora-lotes"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <BatchCalculatorPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/calculadora-licitacao"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <BiddingCalculatorPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analise-sensibilidade"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <SensitivityAnalysisPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* AI Routes - Protected */}
                      <Route
                        path="/azuria-ia"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <AzuriaAIHub />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/sistema-cognitivo"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <CognitiveDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Marketplace Routes - Protected */}
                      <Route
                        path="/marketplace"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <MarketplacePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/comparador-marketplaces"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <MarketplaceComparatorPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Bidding Routes - Protected */}
                      <Route
                        path="/dashboard-licitacoes"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <BiddingDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/documentos"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <DocumentosPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Analytics Routes - Protected */}
                      <Route
                        path="/analytics"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <AdvancedAnalyticsDashboard />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analytics-basico"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <AnalyticsDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/inteligencia-dados"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <IntelligenceDataPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/metricas-precos"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <PricingMetricsDashboard />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analise-rentabilidade"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <ProfitabilityAnalysisPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/relatorios"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <ReportsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* History - Protected */}
                      <Route
                        path="/historico"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <HistoryPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Templates - Protected */}
                      <Route
                        path="/templates"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <Templates />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Integrations - Protected */}
                      <Route
                        path="/integracoes"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <IntegrationsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/api"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <ApiPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Collaboration - Protected (PRO only) */}
                      <Route
                        path="/colaboracao"
                        element={
                          <ProtectedRoute requirePro={true}>
                            <DashboardLayout>
                              <CollaborationPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Teams - Protected */}
                      <Route
                        path="/equipe"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <TeamsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Redirect /times to /equipe for backwards compatibility */}
                      <Route
                        path="/times"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/equipe" replace />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Profile - Protected */}
                      <Route
                        path="/perfil"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Settings - Protected */}
                      <Route
                        path="/configuracoes"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <SettingsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/ajuda"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <HelpPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dados-empresa"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <CompanyDataPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/seguranca"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <SecurityDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/assinatura"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <SubscriptionManagementPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Other Protected Routes */}
                      <Route
                        path="/cenarios"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <ScenariosPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/importacao"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <ImportPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/automacoes"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <AutomationPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/automacoes/regra/:id"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <RuleDetailsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/enterprise"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <EnterprisePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/monetizacao"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <MonetizationPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/welcome"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <Welcome />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Produtos Routes - Protected */}
                      <Route
                        path="/produtos"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <MeuNegocioPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/produtos/novo"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <ProductFormPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      {/* Redirect antiga rota para nova */}
                      <Route
                        path="/meu-negocio"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/produtos" replace />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Admin Routes - Protected */}
                      <Route
                        path="/admin/creator"
                        element={
                          <ProtectedRoute>
                            <CreatorAdminPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <AdminPanel />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/debug-supabase"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <SupabaseDebug />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Redirects from old AI routes - Protected */}
                      <Route
                        path="/calculadora-lotes-inteligente"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/azuria-ia?section=lote" replace />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/ia"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/azuria-ia?section=precos" replace />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/azuria"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/azuria-ia?section=assistente" replace />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analise-concorrencia"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/azuria-ia?section=competitividade" replace />
                          </ProtectedRoute>
                        }
                      />
                      
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

