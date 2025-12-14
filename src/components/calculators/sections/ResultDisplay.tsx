import type { CalculationResult } from "@/types/simpleCalculator";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ResultDisplayProps {
  displayedResult: CalculationResult | null;
  formatCurrency: (value: number) => string;
  isManualMode: boolean;
}

export default function ResultDisplay({ displayedResult, formatCurrency, isManualMode }: ResultDisplayProps) {
  if (!displayedResult) {
    return null;
  }

  return (
    <div className={`rounded-lg border bg-card shadow-sm overflow-hidden border-l-4 ${
      displayedResult.isHealthyProfit 
        ? 'border-l-green-500' 
        : 'border-l-blue-500'
    }`}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isManualMode ? "Análise do Preço Informado" : "Preço de Venda Recomendado"}
            </p>
          </div>
          
          {/* Main Price */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Valor de Venda</p>
            <p className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
              displayedResult.isHealthyProfit ? 'text-green-600' : 'text-blue-600'
            }`}>
              {formatCurrency(displayedResult.sellingPrice)}
            </p>
          </div>
          
          {/* Profit Information */}
          <div className={`p-4 sm:p-5 rounded-lg border-2 ${
            displayedResult.isHealthyProfit 
              ? 'bg-green-50/80 border-green-200' 
              : 'bg-blue-50/80 border-blue-200'
          }`}>
            <div className="flex items-center justify-center gap-2.5 mb-2">
              {displayedResult.isHealthyProfit ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              )}
              <div className="text-center">
                <p className={`text-sm font-semibold ${
                  displayedResult.isHealthyProfit ? 'text-green-700' : 'text-blue-700'
                }`}>
                  Lucro Líquido: {formatCurrency(displayedResult.profit)}
                </p>
                {isManualMode && displayedResult.breakdown && (
                  <p className={`text-xs mt-0.5 ${
                    displayedResult.isHealthyProfit ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    Margem real: {displayedResult.breakdown.realMarginPercent.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Warning for low margin */}
          {!displayedResult.isHealthyProfit && (
            <div className="flex items-start justify-center gap-2.5 p-3 sm:p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left sm:text-center">
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  Atenção: Margem abaixo do recomendado
                </p>
                <p className="text-xs text-blue-700">
                  A margem de lucro está abaixo de 10%, o que pode comprometer a rentabilidade do negócio. 
                  Considere revisar os custos ou ajustar o preço de venda.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
