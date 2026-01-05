/**
 * ResultDisplaySection
 * 
 * Seção para exibição do resultado principal
 * Design limpo estilo Apple
 */

import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ResultDisplaySectionProps {
  result: {
    sellingPrice: number;
    profit: number;
    realMargin: number;
  };
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function ResultDisplaySection({ result }: ResultDisplaySectionProps) {
  const isHealthyProfit = result.realMargin >= 10;

  return (
    <Card className={`border-l-4 ${
      isHealthyProfit 
        ? 'border-l-green-500' 
        : 'border-l-blue-500'
    }`}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Preço de Venda Recomendado
            </p>
          </div>
          
          {/* Main Price */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Valor de Venda</p>
            <p className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
              isHealthyProfit ? 'text-green-600 dark:text-green-500' : 'text-blue-600 dark:text-blue-500'
            }`}>
              {formatCurrency(result.sellingPrice)}
            </p>
          </div>
          
          {/* Profit Information */}
          <div className={`p-4 sm:p-5 rounded-lg border-2 ${
            isHealthyProfit 
              ? 'bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
              : 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center justify-center gap-2.5 mb-2">
              {isHealthyProfit ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              )}
              <div className="text-center">
                <p className={`text-sm font-semibold ${
                  isHealthyProfit 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-blue-700 dark:text-blue-400'
                }`}>
                  Lucro Líquido: {formatCurrency(result.profit)}
                </p>
                <p className={`text-xs mt-0.5 ${
                  isHealthyProfit 
                    ? 'text-green-600 dark:text-green-500' 
                    : 'text-blue-600 dark:text-blue-500'
                }`}>
                  Margem real: {result.realMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Warning for low margin */}
          {!isHealthyProfit && (
            <div className="flex items-start justify-center gap-2.5 p-3 sm:p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-left sm:text-center">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Atenção: Margem abaixo do recomendado
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  A margem de lucro está abaixo de 10%, o que pode comprometer a rentabilidade do negócio. 
                  Considere revisar os custos ou ajustar o preço de venda.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
