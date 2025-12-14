// Modern calculator using new architecture patterns
import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, Calculator, Download, History } from "lucide-react";
import { CalculatorProvider } from "../context/CalculatorContext";
import { useRapidCalculator } from "@/hooks/useRapidCalculator";
import { ComponentErrorBoundary } from "@/shared/components/ErrorBoundary";
import { AdvancedLoadingSpinner } from "@/components/ui/advanced-loading-spinner";
import CalculatorContent from "./CalculatorContent";
import HistoryDisplayOptimized from "@/components/calculators/HistoryDisplayOptimized";
import ResultAnalysis from "@/components/calculators/ResultAnalysis";
import TemplateSelector from "@/components/templates/TemplateSelector";
import MaquininhaModal from "@/components/calculators/modals/MaquininhaModal";
import ImpostosModal from "@/components/calculators/modals/ImpostosModal";
import ComparadorMaquininhasModal from "@/components/calculators/modals/ComparadorMaquininhasModal";
import SimuladorCenariosModal from "@/components/calculators/modals/SimuladorCenariosModal";
import ExportImportPresetsModal from "@/components/calculators/modals/ExportImportPresetsModal";
import HistoricoTaxasModal from "@/components/calculators/modals/HistoricoTaxasModal";
import { HistoryService } from "../services/HistoryService";
import { useTemplateApplication } from "@/hooks/useTemplateApplication";
import type { CalculationTemplate } from "@/types/templates";
import type { CalculationHistory } from "../types/calculator";
import { useAuthContext } from "@/domains/auth";
// hooks imported above

interface RapidCalculatorModernProps {
  isPro?: boolean;
  userId?: string;
}

// Main calculator component using new architecture
const CalculatorWithProvider = memo<RapidCalculatorModernProps>(({ isPro = false, userId }) => {
  return (
    <CalculatorProvider>
      <ComponentErrorBoundary>
        <RapidCalculatorInner isPro={isPro} userId={userId} />
      </ComponentErrorBoundary>
    </CalculatorProvider>
  );
});

// Inner component that uses the calculator context
const RapidCalculatorInner = memo<RapidCalculatorModernProps>(({ isPro = false, userId }) => {
  // Legacy hook usage to maintain backward-compatibility with existing tests/mocks
  const legacy = useRapidCalculator(isPro, userId);
  const { applyTemplate } = useTemplateApplication();
  // Keep service hook available for future use but don't destructure to avoid lint errors
  // const services = useCalculatorWithServices(isPro, userId);
  const { user, isAuthenticated } = useAuthContext();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [maquininhaModalOpen, setMaquininhaModalOpen] = useState(false);
  const [impostosModalOpen, setImpostosModalOpen] = useState(false);
  const [comparadorModalOpen, setComparadorModalOpen] = useState(false);
  const [simuladorModalOpen, setSimuladorModalOpen] = useState(false);
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [historicoTaxasModalOpen, setHistoricoTaxasModalOpen] = useState(false);
  const isSupabaseConfigured = HistoryService.isSupabaseAvailable();

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver em um input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault();
            setMaquininhaModalOpen(true);
            break;
          case 'i':
            e.preventDefault();
            setImpostosModalOpen(true);
            break;
          case 'k':
            e.preventDefault();
            setComparadorModalOpen(true);
            break;
          case 'j':
            e.preventDefault();
            setSimuladorModalOpen(true);
            break;
        }
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const h = await HistoryService.getHistory(user?.id);
      setHistory(h);
    } catch (e: unknown) {
      setHistoryError(e instanceof Error ? e.message : 'Erro ao carregar histórico');
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, user?.id, loadHistory]);

  const handleMaquininhaSave = (taxa: number) => {
    legacy.setCardFee({ target: { value: taxa.toString() } } as unknown as React.ChangeEvent<HTMLInputElement>);
    legacy.setCardFeeValue(taxa.toString());
  };

  const handleImpostosSave = (impostos: number) => {
    legacy.setTax({ target: { value: impostos.toString() } } as unknown as React.ChangeEvent<HTMLInputElement>);
    legacy.setTaxValue(impostos.toString());
  };
  
  // Performance monitoring - simplified for now
  // const performance = usePerformanceMonitor();

  // Optimized animation variants
  const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.div {...animationVariants} className="w-full space-y-8">
      {/* Main Calculator Card */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand-500/5 rounded-2xl blur-3xl" />
        
        <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header with gradient bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-brand-500" />
          
          <CardContent className="p-8">
            {/* Template Selector */}
            <Suspense fallback={<AdvancedLoadingSpinner size="md" />}>
              <div className="mb-8" data-onboarding="template-selector">
                <TemplateSelector 
                  onSelectTemplate={(template: CalculationTemplate) => {
                    // Apply template using legacy state updater for backward compatibility
                    applyTemplate(template, (newState) => {
                      legacy.setState(newState);
                    });
                  }} 
                />
              </div>
            </Suspense>
            
            {/* Calculator Content */}
            <Suspense fallback={<AdvancedLoadingSpinner size="lg" />}>
              <CalculatorContent
                isPro={isPro}
                // Inputs from legacy hook to satisfy existing tests
                cost={legacy.cost}
                setCost={(value: string) => { legacy.setCost({ target: { value } } as unknown as React.ChangeEvent<HTMLInputElement>); legacy.setCostValue(value); }}
                otherCosts={legacy.otherCosts}
                setOtherCosts={(value: string) => { legacy.setOtherCosts({ target: { value } } as unknown as React.ChangeEvent<HTMLInputElement>); legacy.setOtherCostsValue(value); }}
                shipping={legacy.shipping}
                setShipping={(value: string) => { legacy.setShipping({ target: { value } } as unknown as React.ChangeEvent<HTMLInputElement>); legacy.setShippingValue(value); }}
                includeShipping={legacy.includeShipping}
                setIncludeShipping={legacy.setIncludeShipping}
                tax={legacy.tax}
                setTax={(value: string) => { legacy.setTax({ target: { value } } as unknown as React.ChangeEvent<HTMLInputElement>); legacy.setTaxValue(value); }}
                cardFee={legacy.cardFee}
                setCardFee={(value: string) => { legacy.setCardFee({ target: { value } } as unknown as React.ChangeEvent<HTMLInputElement>); legacy.setCardFeeValue(value); }}
                margin={legacy.margin}
                // MarginSection expects (values: number[]); bridge to legacy signature (number)
                setMargin={(values) => legacy.setMargin(values[0])}
                // Actions
                calculatePrice={legacy.calculatePrice}
                resetCalculator={legacy.resetCalculator}
                // Result / status
                displayedResult={legacy.result}
                formatCurrency={legacy.formatCurrency}
                isLoading={legacy.isLoading}
                // Manual pricing controls
                isManualMode={legacy.isManualMode}
                manualPrice={legacy.manualPrice}
                onToggleMode={legacy.togglePriceMode}
                onManualPriceChange={legacy.handleManualPriceChange}
                // Modals
                onOpenMaquininhaModal={() => setMaquininhaModalOpen(true)}
                onOpenImpostosModal={() => setImpostosModalOpen(true)}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
      <MaquininhaModal
        isOpen={maquininhaModalOpen}
        onClose={() => setMaquininhaModalOpen(false)}
        valorVenda={legacy.result?.sellingPrice || 0}
        onSave={handleMaquininhaSave}
      />
      
      <ImpostosModal
        isOpen={impostosModalOpen}
        onClose={() => setImpostosModalOpen(false)}
        valorVenda={legacy.result?.sellingPrice || 0}
        onSave={handleImpostosSave}
      />

      <ComparadorMaquininhasModal
        isOpen={comparadorModalOpen}
        onClose={() => setComparadorModalOpen(false)}
        valorVenda={legacy.result?.sellingPrice || 100}
      />

      <SimuladorCenariosModal
        isOpen={simuladorModalOpen}
        onClose={() => setSimuladorModalOpen(false)}
        valorVenda={legacy.result?.sellingPrice || 100}
      />

      <ExportImportPresetsModal
        isOpen={exportImportModalOpen}
        onClose={() => setExportImportModalOpen(false)}
      />

      <HistoricoTaxasModal
        isOpen={historicoTaxasModalOpen}
        onClose={() => setHistoricoTaxasModalOpen(false)}
      />

      {/* Barra de Ferramentas Avançadas */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-muted-foreground">
              Ferramentas Avançadas
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComparadorModalOpen(true)}
                className="text-xs"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Comparador
                <kbd className="ml-2 px-1 py-0.5 text-[10px] bg-muted rounded hidden sm:inline">Ctrl+K</kbd>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimuladorModalOpen(true)}
                className="text-xs"
              >
                <Calculator className="h-3 w-3 mr-1" />
                Simulador
                <kbd className="ml-2 px-1 py-0.5 text-[10px] bg-muted rounded hidden sm:inline">Ctrl+J</kbd>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoricoTaxasModalOpen(true)}
                className="text-xs"
              >
                <History className="h-3 w-3 mr-1" />
                Histórico
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportImportModalOpen(true)}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Backup
              </Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Atalhos: <kbd className="px-1 bg-muted rounded">Ctrl+M</kbd> Maquininha • <kbd className="px-1 bg-muted rounded">Ctrl+I</kbd> Impostos
          </div>
        </CardContent>
      </Card>
      
  {/* Result Analysis Section */}
  {legacy.result && (
        <Suspense fallback={<AdvancedLoadingSpinner size="md" />}>
          <ResultAnalysis 
    result={legacy.result}
    formatCurrency={legacy.formatCurrency}
          />
        </Suspense>
      )}
      
      {/* History Section */}
      <Suspense fallback={<AdvancedLoadingSpinner size="md" />}>
        <HistoryDisplayOptimized
          isPro={isPro}
          isSupabaseConfigured={isSupabaseConfigured}
          history={history}
          historyLoading={historyLoading}
          historyError={historyError}
          formatCurrency={legacy.formatCurrency}
          onDeleteItem={async (id) => { await HistoryService.deleteHistoryItem(id, user?.id); await loadHistory(); }}
          onItemClick={() => { /* future: load item into calculator */ }}
        />
      </Suspense>
    </motion.div>
  );
});

CalculatorWithProvider.displayName = "RapidCalculatorModern";
RapidCalculatorInner.displayName = "RapidCalculatorInner";

export default CalculatorWithProvider;