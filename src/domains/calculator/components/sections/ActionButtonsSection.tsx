/**
 * ActionButtonsSection
 * 
 * Seção com botões de ação (Calcular, Reset)
 * Design limpo estilo Apple
 */

import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonsSectionProps {
  onCalculate: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

export default function ActionButtonsSection({
  onCalculate,
  onReset,
  isLoading,
  hasResult,
}: ActionButtonsSectionProps) {
  return (
    <div className="flex gap-3">
      <motion.div 
        className="flex-1" 
        whileHover={{ scale: 1.01 }} 
        whileTap={{ scale: 0.99 }}
      >
        <Button
          onClick={onCalculate}
          disabled={isLoading}
          className="w-full h-12 min-h-[44px] text-base font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white transition-all shadow-md hover:shadow-lg dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
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
      
      {hasResult && (
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onReset}
            variant="outline"
            aria-label="Limpar"
            className="h-12 min-h-[44px] w-12 min-w-[44px] px-4 border-border hover:bg-accent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
