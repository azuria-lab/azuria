
import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PriceAlertProps {
  currentPrice: number;
  minimumPrice: number;
  type: "warning" | "danger";
  showDetails?: boolean;
}

export default function PriceAlert({
  currentPrice,
  minimumPrice,
  type,
  showDetails = true
}: PriceAlertProps) {
  const difference = minimumPrice - currentPrice;
  const percentageDiff = (difference / minimumPrice) * 100;
  
  // Determina o estilo do alerta baseado no tipo
  const alertStyle = type === "warning" 
    ? "bg-amber-50 border-amber-200 text-amber-800" 
    : "bg-red-50 border-red-200 text-red-800";
    
  // Ícone apropriado para o tipo de alerta
  const AlertIcon = type === "warning" ? AlertCircle : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Alert className={`flex items-center gap-3 ${alertStyle}`}>
        <div className="flex-shrink-0">
          <AlertIcon className="h-5 w-5" />
        </div>
        <div className="flex-grow">
          <AlertDescription className="text-sm font-medium flex items-center gap-1">
            {type === "warning" ? (
              <>Preço próximo ao mínimo recomendado</>
            ) : (
              <>Preço abaixo do mínimo recomendado</>
            )}
          </AlertDescription>
          
          {showDetails && (
            <div className="mt-1 text-xs flex items-center gap-2">
              <span className="flex items-center">
                <TrendingDown className="inline mr-1 h-3 w-3" />
                {percentageDiff.toFixed(1)}% abaixo
              </span>
              <span className="opacity-75">•</span>
              <span>
                Mínimo sugerido: R$ {minimumPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}
        </div>
      </Alert>
    </motion.div>
  );
}

// Export PriceAlert for use in other components
export { PriceAlert };
