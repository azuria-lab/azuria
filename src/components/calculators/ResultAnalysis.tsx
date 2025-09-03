
import SalesVolumeSimulator from "./SalesVolumeSimulator";
import SalesGoalsProjection from "./SalesGoalsProjection";
import type { CalculationResult } from "@/types/simpleCalculator";

interface ResultAnalysisProps {
  result: CalculationResult;
  formatCurrency: (value: number) => string;
}

export default function ResultAnalysis({ result, formatCurrency }: ResultAnalysisProps) {
  if (!result) {return null;}

  return (
    <div className="space-y-4 mt-6">
      {/* Simulador de Volume de Vendas */}
      <SalesVolumeSimulator
        sellingPrice={result.sellingPrice}
        profit={result.profit}
        formatCurrency={formatCurrency}
      />

      {/* Projeção de Metas */}
      <SalesGoalsProjection
        sellingPrice={result.sellingPrice}
        profitMargin={result.breakdown?.realMarginPercent || 0}
        profitAmount={result.profit}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
