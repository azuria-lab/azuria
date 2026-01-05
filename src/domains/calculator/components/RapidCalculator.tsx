// Modern calculator using new architecture patterns
import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import MaquininhaModal from "@/components/calculators/modals/MaquininhaModal";
import ImpostosModal from "@/components/calculators/modals/ImpostosModal";
import ComparadorMaquininhasModal from "@/components/calculators/modals/ComparadorMaquininhasModal";
import SimuladorCenariosModal from "@/components/calculators/modals/SimuladorCenariosModal";
import ExportImportPresetsModal from "@/components/calculators/modals/ExportImportPresetsModal";
import HistoricoTaxasModal from "@/components/calculators/modals/HistoricoTaxasModal";
import { HistoryService } from "../services/HistoryService";
import type { CalculationHistory } from "../types/calculator";
import { useAuthContext } from "@/domains/auth";
import { useDailyCalculationLimit } from "@/hooks/useDailyCalculationLimit";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const isSupabaseConfigured = HistoryService.isSupabaseAvailable();
  
  // Daily calculation limit hook
  const { 
    used, 
    limit, 
    remaining, 
    canCalculate, 
    isFreeUser,
    recordCalculation 
  } = useDailyCalculationLimit();

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

  // Wrapper para calculatePrice com verificação de limite
  const handleCalculateWithLimit = () => {
    if (!canCalculate) {
      setUpgradeModalOpen(true);
      return;
    }

    // Registrar cálculo antes de executar
    const canProceed = recordCalculation();
    
    if (!canProceed) {
      setUpgradeModalOpen(true);
      return;
    }

    // Executar cálculo normalmente
    legacy.calculatePrice();
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
    <motion.div {...animationVariants} className="w-full space-y-6">
      {/* Indicador de limite para usuários FREE */}
      {isFreeUser && typeof limit === 'number' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 border border-border rounded-lg p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {used} de {limit} cálculos diários no modo gratuito
              </span>
            </div>
            {remaining === 0 ? (
              <Link to="/planos" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 min-h-[44px] text-primary border-primary/20 hover:bg-primary/10">
                  Assine para uso ilimitado
                </Button>
              </Link>
            ) : (
              <Link to="/planos" className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto h-10 min-h-[44px] text-xs sm:text-sm text-muted-foreground hover:text-primary">
                  Assine o Plano Iniciante para uso ilimitado
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Calculator Card */}
      <Card 
        className="rounded-lg border border-border bg-card shadow-sm border-l-4"
        style={{ borderLeftColor: '#148D8D' }}
      >
        <CardContent className="p-4 sm:p-6 md:p-8">
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
              // Actions - usar wrapper com verificação de limite
              calculatePrice={handleCalculateWithLimit}
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
      
      {/* Upgrade Modal */}
      {isFreeUser && (
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          currentLimit={typeof limit === 'number' ? limit : 5}
          used={used}
        />
      )}
      
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
      <Card className="rounded-lg border border-border bg-card shadow-sm border-l-4 border-l-indigo-500">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-50 border border-indigo-100">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Ferramentas Avançadas
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Comparadores, simuladores e recursos adicionais
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setComparadorModalOpen(true)}
                  className="border-border hover:bg-accent"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparador
                  <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-muted rounded hidden sm:inline">Ctrl+K</kbd>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSimuladorModalOpen(true)}
                  className="border-border hover:bg-accent"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Simulador
                  <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-muted rounded hidden sm:inline">Ctrl+J</kbd>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoricoTaxasModalOpen(true)}
                  className="border-border hover:bg-accent"
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportImportModalOpen(true)}
                  className="border-border hover:bg-accent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Backup
                </Button>
              </motion.div>
            </div>
            <div className="text-xs text-muted-foreground pt-3 border-t border-border">
              <p className="font-medium mb-1.5">Atalhos de teclado:</p>
              <div className="flex flex-wrap gap-2">
                <span><kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Ctrl+M</kbd> Calculadora de Taxas</span>
                <span><kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Ctrl+I</kbd> Calculadora de Impostos</span>
                <span><kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Ctrl+K</kbd> Comparador</span>
                <span><kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Ctrl+J</kbd> Simulador</span>
              </div>
            </div>
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