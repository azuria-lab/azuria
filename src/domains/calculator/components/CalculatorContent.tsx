
import type { CalculationResult } from "../types/calculator";
import ManualPriceToggle from "@/components/calculators/ManualPriceToggle";
import InputFields from "@/components/calculators/sections/InputFields";
import MarginSection from "@/components/calculators/sections/MarginSection";
import ActionButtons from "@/components/calculators/sections/ActionButtons";
import ResultDisplay from "@/components/calculators/sections/ResultDisplay";
import SimulatorsSection from "@/components/calculators/sections/SimulatorsSection";

interface CalculatorContentProps {
  isPro: boolean;
  cost: string;
  setCost: (value: string) => void;
  otherCosts: string;
  setOtherCosts: (value: string) => void;
  shipping: string;
  setShipping: (value: string) => void;
  includeShipping: boolean;
  setIncludeShipping: (value: boolean) => void;
  tax: string;
  setTax: (value: string) => void;
  cardFee: string;
  setCardFee: (value: string) => void;
  margin: number;
  setMargin: (values: number[]) => void;
  calculatePrice: () => void;
  resetCalculator: () => void;
  displayedResult: CalculationResult | null;
  formatCurrency: (value: number) => string;
  isLoading: boolean;
  // Manual pricing props
  isManualMode?: boolean;
  manualPrice?: string;
  onToggleMode?: () => void;
  onManualPriceChange?: (value: string) => void;
  // Modals props
  onOpenMaquininhaModal?: () => void;
  onOpenImpostosModal?: () => void;
}

export default function CalculatorContent({
  isPro: _isPro,
  cost,
  setCost,
  otherCosts,
  setOtherCosts,
  shipping,
  setShipping,
  includeShipping,
  setIncludeShipping,
  tax,
  setTax,
  cardFee,
  setCardFee,
  margin,
  setMargin,
  calculatePrice,
  resetCalculator,
  displayedResult,
  formatCurrency,
  isLoading,
  isManualMode = false,
  manualPrice = "",
  onToggleMode,
  onManualPriceChange,
  onOpenMaquininhaModal,
  onOpenImpostosModal
}: CalculatorContentProps) {
  return (
    <div className="space-y-6">
      {/* Input Fields */}
      <InputFields
        cost={cost}
        setCost={setCost}
        otherCosts={otherCosts}
        setOtherCosts={setOtherCosts}
        shipping={shipping}
        setShipping={setShipping}
        includeShipping={includeShipping}
        setIncludeShipping={setIncludeShipping}
        tax={tax}
        setTax={setTax}
        cardFee={cardFee}
        setCardFee={setCardFee}
        onOpenMaquininhaModal={onOpenMaquininhaModal}
        onOpenImpostosModal={onOpenImpostosModal}
      />

      {/* Manual Price Toggle - só mostra se as funções foram passadas */}
      {onToggleMode && onManualPriceChange && (
        <ManualPriceToggle
          isManualMode={isManualMode}
          onToggleMode={onToggleMode}
          manualPrice={manualPrice}
          onManualPriceChange={onManualPriceChange}
          currentPrice={displayedResult?.sellingPrice || null}
        />
      )}

      {/* Margem de Lucro - só mostra se não estiver no modo manual */}
      <MarginSection
        margin={margin}
        setMargin={setMargin}
        isManualMode={isManualMode}
      />

      {/* Botões de Ação */}
      <ActionButtons
        calculatePrice={calculatePrice}
        resetCalculator={resetCalculator}
        isLoading={isLoading}
        calculation={{
          cost,
          margin,
          tax,
          cardFee,
          otherCosts,
          shipping,
          includeShipping
        }}
        result={displayedResult}
      />

      {/* Resultado */}
      <ResultDisplay
        displayedResult={displayedResult}
        formatCurrency={formatCurrency}
        isManualMode={isManualMode}
      />

      {/* Simuladores e Análises */}
      <SimulatorsSection
        displayedResult={displayedResult}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
