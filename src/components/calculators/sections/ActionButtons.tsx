import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw } from "lucide-react";
import { PdfExportDialog } from "@/components/pdf/PdfExportDialog";
import type { CalculationResult } from "@/types/simpleCalculator";

interface ActionButtonsProps {
  calculatePrice: () => void;
  resetCalculator: () => void;
  isLoading: boolean;
  // PDF export props
  calculation?: {
    cost: string;
    margin: number;
    tax: string;
    cardFee: string;
    otherCosts: string;
    shipping: string;
    includeShipping: boolean;
  };
  result?: CalculationResult | null;
}

export default function ActionButtons({ calculatePrice, resetCalculator, isLoading, calculation, result }: ActionButtonsProps) {
  return (
    <div className="space-y-6">
      {/* Botões principais */}
      <div className="flex gap-4">
        <Button
          onClick={calculatePrice}
          disabled={isLoading}
          className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-primary to-brand-500 hover:from-primary/90 hover:to-brand-500/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <Calculator className="w-5 h-5 mr-3" />
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Calculando...
            </div>
          ) : (
            "Calcular Preço"
          )}
        </Button>
        
        <Button
          onClick={resetCalculator}
          variant="outline"
          aria-label="Limpar"
          className="h-14 px-6 border-2 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Botão de exportação PDF */}
      {result && calculation && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-center">
            <PdfExportDialog 
              calculation={calculation}
              result={result}
            />
          </div>
        </div>
      )}
    </div>
  );
}