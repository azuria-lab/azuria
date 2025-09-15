
import type { CalculationResult } from "@/types/simpleCalculator";

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
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-brand-500/10 rounded-2xl" />
      
      <div className={`relative p-8 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 ${
        displayedResult.isHealthyProfit 
          ? 'border-green-200/50 bg-green-50/80 shadow-lg shadow-green-100/50' 
          : 'border-amber-200/50 bg-amber-50/80 shadow-lg shadow-amber-100/50'
      }`}>
        {/* Status Icon */}
        <div className="absolute top-4 right-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            displayedResult.isHealthyProfit ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            <span className="text-lg">
              {displayedResult.isHealthyProfit ? '✅' : '⚠️'}
            </span>
          </div>
        </div>

        <div className="text-center space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {isManualMode ? "Preço Informado" : "Preço Sugerido"}
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-brand-500 rounded-full mx-auto" />
          </div>
          
          {/* Main Price */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Preço de venda</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-primary to-brand-500 bg-clip-text text-transparent">
              {formatCurrency(displayedResult.sellingPrice)}
            </p>
          </div>
          
          {/* Profit Information */}
          <div className={`p-4 rounded-xl ${
            displayedResult.isHealthyProfit 
              ? 'bg-green-100/60 border border-green-200/50' 
              : 'bg-amber-100/60 border border-amber-200/50'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-medium">💰</span>
              <span className={`font-semibold ${
                displayedResult.isHealthyProfit ? 'text-green-700' : 'text-amber-700'
              }`}>
                Lucro: {formatCurrency(displayedResult.profit)}
              </span>
            </div>
            
            {isManualMode && displayedResult.breakdown && (
              <p className={`text-sm ${
                displayedResult.isHealthyProfit ? 'text-green-600' : 'text-amber-600'
              }`}>
                Margem real: {displayedResult.breakdown.realMarginPercent.toFixed(1)}%
              </p>
            )}
          </div>
          
          {/* Warning for low margin */}
          {!displayedResult.isHealthyProfit && (
            <div className="flex items-center justify-center gap-2 p-3 bg-amber-100/80 rounded-lg border border-amber-200/50">
              <span className="text-amber-600">⚠️</span>
              <p className="text-sm font-medium text-amber-700">
                Margem abaixo do recomendado (menos de 10%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
