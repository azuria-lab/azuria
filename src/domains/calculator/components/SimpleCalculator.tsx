
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSimpleCalculator } from "../hooks/legacy/useSimpleCalculator";
import { useSimpleCalculatorUI } from "@/hooks/useSimpleCalculatorUI";
import { useTemplateApplication } from "@/hooks/useTemplateApplication";
import CalculatorContent from "./CalculatorContent";
import HistoryDisplay from "@/components/calculators/HistoryDisplay";
import ResultAnalysis from "@/components/calculators/ResultAnalysis";
import TemplateSelector from "@/components/templates/TemplateSelector";
import type { CalculationTemplate } from "@/types/templates";
import OfflineIndicator from "@/components/offline/OfflineIndicator";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  SubscriptionAuthError,
  UsageLimitError,
  useSubscriptionLimits,
} from "@/domains/subscription";
import { UsageLimitDialog } from "@/components/paywall/UsageLimitDialog";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/services/logger";

interface SimpleCalculatorProps {
  readonly isPro?: boolean;
  readonly userId?: string;
}

export default function SimpleCalculator({ isPro = false, userId }: SimpleCalculatorProps) {
  const navigate = useNavigate();
  // SimpleCalculator optimized for production
  const {
    ensureCanCalculate,
    registerCalculation,
    usage,
    isPro: subscriptionPro,
  } = useSubscriptionLimits();

  const effectiveIsPro = useMemo(
    () => subscriptionPro || isPro,
    [isPro, subscriptionPro]
  );

  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);

  const {
    cost,
    margin,
    tax,
    cardFee,
    otherCosts,
    shipping,
    includeShipping,
    result,
    preview,
    history,
    historyError,
    historyLoading,
    isSupabaseConfigured,
    setCostValue,
    setMargin,
    setTaxValue,
    setCardFeeValue,
    setOtherCostsValue,
    setShippingValue,
    setIncludeShipping,
    calculatePrice,
    resetCalculator,
    formatCurrency,
    isLoading,
    // Manual pricing
    manualPrice,
    isManualMode,
    handleManualPriceChange,
    togglePriceMode,
    // setState for template application
    setState
  } = useSimpleCalculator(effectiveIsPro, userId, {
    onAfterCalculation: async () => {
      try {
        await registerCalculation();
      } catch (error) {
        // Falha ao registrar uso não deve bloquear o fluxo principal
        logger.warn("Não foi possível registrar o uso da calculadora", { error });
      }
    },
  });

  const { getDisplayResult } = useSimpleCalculatorUI(isPro);
  const { applyTemplate } = useTemplateApplication();
  const { showOnboarding, closeOnboarding, completeOnboarding } = useOnboarding();

  const handleMarginChange = (values: number[]) => {
    setMargin(values[0]);
  };

  const handleTemplateSelect = (template: CalculationTemplate) => {
    applyTemplate(template, (newState) => {
      setState(newState);
    });
  };

  // Resultado exibido: mostra a prévia enquanto não clicou em calcular
  const displayedResult = getDisplayResult(result, preview);

  const handleUpgrade = useCallback(() => {
    setIsLimitDialogOpen(false);
    navigate("/pricing");
  }, [navigate]);

  const handleCalculateClick = useCallback(async () => {
    try {
      await ensureCanCalculate();
      calculatePrice();
    } catch (error) {
      if (error instanceof UsageLimitError) {
        setIsLimitDialogOpen(true);
        return;
      }

      if (error instanceof SubscriptionAuthError) {
        toast.error("Faça login para continuar calculando preços.");
        navigate("/login");
        return;
      }

      const message = error instanceof Error ? error.message : "Erro ao processar cálculo";
      toast.error(message);
    }
  }, [calculatePrice, ensureCanCalculate, navigate]);

  return (
    <>
      <OfflineIndicator showDetails className="mb-4" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-8"
      >
      {/* Main Calculator Card */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand-500/5 rounded-2xl blur-3xl" />
        
        <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header with gradient bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-brand-500" />
          
          <CardContent className="p-8">
            {/* Title Section - Removida a logo duplicada */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-brand-500 bg-clip-text text-transparent mb-2">
                Calculadora Simples
              </h2>
              <p className="text-muted-foreground text-sm">
                Calcule o preço ideal de venda do seu produto
              </p>
            </div>
            
            {/* Template Selector */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
              data-onboarding="template-selector"
            >
              <TemplateSelector onSelectTemplate={handleTemplateSelect} />
            </motion.div>
            
            {/* Calculator Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CalculatorContent
                isPro={effectiveIsPro}
                cost={cost}
                setCost={setCostValue}
                otherCosts={otherCosts}
                setOtherCosts={setOtherCostsValue}
                shipping={shipping}
                setShipping={setShippingValue}
                includeShipping={includeShipping}
                setIncludeShipping={setIncludeShipping}
                tax={tax}
                setTax={setTaxValue}
                cardFee={cardFee}
                setCardFee={setCardFeeValue}
                margin={margin}
                setMargin={handleMarginChange}
                calculatePrice={handleCalculateClick}
                resetCalculator={resetCalculator}
                displayedResult={displayedResult}
                formatCurrency={formatCurrency}
                isLoading={isLoading}
                // Manual pricing props
                isManualMode={isManualMode}
                manualPrice={manualPrice}
                onToggleMode={togglePriceMode}
                onManualPriceChange={handleManualPriceChange}
              />
            </motion.div>
          </CardContent>
        </Card>
      </div>
      
      {/* Result Analysis Section */}
      {result && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <ResultAnalysis 
            result={result}
            formatCurrency={formatCurrency}
          />
        </motion.div>
      )}
      
      {/* History Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <HistoryDisplay
          isPro={isPro}
          isSupabaseConfigured={isSupabaseConfigured}
          history={history}
          historyLoading={historyLoading}
          historyError={historyError}
          formatCurrency={formatCurrency}
        />
      </motion.div>
      </motion.div>

      <OnboardingTour
        isOpen={showOnboarding}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />

      <UsageLimitDialog
        open={isLimitDialogOpen}
        onOpenChange={setIsLimitDialogOpen}
        used={usage.calculations}
        limit={usage.calculationLimit}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
