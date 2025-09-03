
import SalesVolumeSimulator from "../SalesVolumeSimulator";
import SalesGoalsProjection from "../SalesGoalsProjection";
import type { CalculationResult } from "@/types/simpleCalculator";

interface SimulatorsSectionProps {
  displayedResult: CalculationResult | null;
  formatCurrency: (value: number) => string;
}

export default function SimulatorsSection({ displayedResult, formatCurrency }: SimulatorsSectionProps) {
  if (!displayedResult) {return null;}

  const margin = displayedResult.breakdown?.realMarginPercent || 0;

  return (
    <div className="space-y-4">
      {/* Simulador de Volume de Vendas */}
      <SalesVolumeSimulator
        sellingPrice={displayedResult.sellingPrice}
        profit={displayedResult.profit}
        formatCurrency={formatCurrency}
      />

      {/* Projeção de Metas */}
      <SalesGoalsProjection
        sellingPrice={displayedResult.sellingPrice}
        profitMargin={margin}
        profitAmount={displayedResult.profit}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
