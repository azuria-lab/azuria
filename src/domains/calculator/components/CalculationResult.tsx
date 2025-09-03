
import { type CalculationResult } from "../types/calculator";
import { motion } from "framer-motion";
import ResultHeader from "@/components/calculators/result/ResultHeader";
import ResultStatus from "@/components/calculators/result/ResultStatus";
import ResultBreakdown from "@/components/calculators/result/ResultBreakdown";
import ResultVolumeSimulator from "@/components/calculators/result/ResultVolumeSimulator";

interface CalculationResultProps {
  result: CalculationResult | null;
  formatCurrency: (value: number) => string;
  manualPrice?: string;
  isManualMode?: boolean;
  onManualPriceChange?: (value: string) => void;
  onTogglePriceMode?: () => void;
}

export default function CalculationResult({
  result,
  formatCurrency,
  manualPrice = "",
  isManualMode = false,
  onManualPriceChange,
  onTogglePriceMode
}: CalculationResultProps) {
  if (!result) {return null;}

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, type: "spring" }}
      className="mt-10 pt-8 border-t border-gray-200 space-y-6"
      aria-live="polite"
    >
      {/* Preço de Venda e Alertas */}
      <ResultHeader
        result={result}
        formatCurrency={formatCurrency}
        manualPrice={manualPrice}
        isManualMode={isManualMode}
        onManualPriceChange={onManualPriceChange}
        onTogglePriceMode={onTogglePriceMode}
      />

      {/* Status de Lucro e Margem */}
      <ResultStatus
        result={result}
        formatCurrency={formatCurrency}
      />

      {/* Detalhamento dos Custos */}
      <ResultBreakdown
        result={result}
        formatCurrency={formatCurrency}
      />
      
      {/* Simulador de Volume de Vendas */}
      <ResultVolumeSimulator
        sellingPrice={result.sellingPrice}
        profit={result.profit}
        formatCurrency={formatCurrency}
      />
    </motion.div>
  );
}
