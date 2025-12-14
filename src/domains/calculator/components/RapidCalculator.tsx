// Modern calculator using new architecture patterns
import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CalculatorProvider } from "../context/CalculatorContext";
import { useRapidCalculator } from "@/hooks/useRapidCalculator";
import { ComponentErrorBoundary } from "@/shared/components/ErrorBoundary";
import { AdvancedLoadingSpinner } from "@/components/ui/advanced-loading-spinner";
import CalculatorContent from "./CalculatorContent";
import HistoryDisplayOptimized from "@/components/calculators/HistoryDisplayOptimized";
import ResultAnalysis from "@/components/calculators/ResultAnalysis";
import TemplateSelector from "@/components/templates/TemplateSelector";
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
  const isSupabaseConfigured = HistoryService.isSupabaseAvailable();

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
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      
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