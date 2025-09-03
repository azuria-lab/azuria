
import React from "react";
import { PriceAlert } from "@/components/calculators/PriceAlert";

interface ProResultHeaderProps {
  currentPrice: number;
  minimumPrice: number;
  priceBelowMinimum: boolean;
  priceNearMinimum: boolean;
  showAlert: boolean;
}

export function ProResultHeader({
  currentPrice,
  minimumPrice,
  priceBelowMinimum,
  priceNearMinimum,
  showAlert,
}: ProResultHeaderProps) {
  // Determine alert type based on price difference
  const alertType = priceBelowMinimum ? "danger" : "warning";

  return (
    <>
      {/* Alerta de preço mínimo quando aplicável */}
      {showAlert && (
        <PriceAlert
          currentPrice={currentPrice}
          minimumPrice={minimumPrice}
          type={alertType}
          showDetails={true}
        />
      )}
      
      {/* Preço Principal */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Preço de Venda Ideal:</span>
        <span className={`text-2xl font-bold ${priceBelowMinimum ? "text-red-600" : "text-brand-600"}`}>
          R$ {currentPrice.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </>
  );
}
