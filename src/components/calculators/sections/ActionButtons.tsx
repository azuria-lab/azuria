import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw } from "lucide-react";
import { PdfExportDialog } from "@/components/pdf/PdfExportDialog";
import type { CalculationResult } from "@/types/simpleCalculator";
import { motion } from "framer-motion";

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
    <div className="space-y-4">
      {/* Botões principais */}
      <div className="flex gap-3">
        <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={calculatePrice}
            disabled={isLoading}
            className="w-full h-12 min-h-[44px] text-base font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white transition-all shadow-md hover:shadow-lg"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculando...
              </div>
            ) : (
              "Calcular Preço de Venda"
            )}
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={resetCalculator}
            variant="outline"
            aria-label="Limpar"
            className="h-12 min-h-[44px] w-12 min-w-[44px] px-4 border-border hover:bg-accent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Botão de exportação PDF */}
      {result && calculation && (
        <div className="pt-4 border-t border-border">
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