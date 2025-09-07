
import React from "react";
import { AlertCircle, Calculator, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PriceAlert from "../PriceAlert";
import { type CalculationResult } from "@/types/simpleCalculator";

interface ResultHeaderProps {
  result: CalculationResult;
  formatCurrency: (value: number) => string;
  manualPrice: string;
  isManualMode: boolean;
  onManualPriceChange?: (value: string) => void;
  onTogglePriceMode?: () => void;
}

export default function ResultHeader({
  result,
  formatCurrency,
  manualPrice,
  isManualMode,
  onManualPriceChange,
  onTogglePriceMode
}: ResultHeaderProps) {
  // Calculamos o preço mínimo recomendado (custo total + margem mínima de 10%)
  const minimumMarginRate = 0.10; // 10% de margem mínima
  const minimumPrice = result.breakdown.totalCost / (1 - minimumMarginRate);
  
  // Verificamos se o preço está abaixo ou próximo do mínimo recomendado
  const priceBelowMinimum = result.sellingPrice < minimumPrice;
  const priceNearMinimum = !priceBelowMinimum && result.sellingPrice < minimumPrice * 1.05; // 5% acima do mínimo
  
  // Tipo de alerta baseado na diferença de preço
  const alertType = priceBelowMinimum ? "danger" : "warning";
  const showAlert = priceBelowMinimum || priceNearMinimum;

  return (
    <>
      {/* Alerta de preço mínimo quando aplicável */}
      {showAlert && !isManualMode && (
        <PriceAlert
          currentPrice={result.sellingPrice}
          minimumPrice={minimumPrice}
          type={alertType}
        />
      )}

      {/* Preço de Venda Sugerido */}
      <div className="relative bg-gradient-to-br from-brand-50 via-white to-brand-100 p-7 rounded-2xl border border-brand-100 shadow-md flex flex-col items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-base md:text-lg font-semibold text-brand-700 mb-1">
            {isManualMode ? "Preço de Venda Manual" : "Preço de Venda Sugerido"}
          </h3>
          {onTogglePriceMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePriceMode}
              className="text-brand-600 hover:text-brand-700"
            >
              {isManualMode ? (
                <Calculator className="h-4 w-4 mr-1" />
              ) : (
                <Edit2 className="h-4 w-4 mr-1" />
              )}
              {isManualMode ? "Calcular" : "Editar"}
            </Button>
          )}
        </div>

        {isManualMode ? (
          <Input
            type="text"
            value={manualPrice}
            onChange={(e) => onManualPriceChange?.(e.target.value)}
            className="text-3xl font-bold text-center w-full max-w-[280px] text-brand-600 h-auto py-3"
            placeholder="0,00"
          />
        ) : (
          <p 
            className={`text-[2.8rem] sm:text-6xl font-extrabold drop-shadow-md leading-[1.15] ${
              priceBelowMinimum ? "text-red-600" : "text-brand-600"
            } select-all transition-colors duration-200 border-4 border-brand-300/50 bg-white/70 px-4 py-2 rounded-xl`}
            style={{ letterSpacing: "-2px" }}
            tabIndex={0}
            aria-label={`Preço de venda sugerido: R$ ${formatCurrency(result.sellingPrice)}`}
          >
            R$ {formatCurrency(result.sellingPrice)}
          </p>
        )}
      </div>

      {/* Aviso de Preço Manual */}
      {result.isManualPrice && (
        <Alert className="bg-blue-50 border-blue-100">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Preço definido manualmente. A margem de lucro foi recalculada automaticamente.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
