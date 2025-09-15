
import React from "react";
import { AlertCircle } from "lucide-react";

interface DiscountResultsProps {
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  profitHealthy: (profit: number) => boolean;
}

export default function DiscountResults({
  discountPercent,
  discountedPrice,
  discountedProfit,
  profitHealthy
}: DiscountResultsProps) {
  if (discountPercent <= 0 || discountedPrice === null) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex justify-between">
        <span>Preço com desconto:</span>
        <span className="font-semibold">
          R$ {discountedPrice.toFixed(2).replace(".", ",")}
        </span>
      </div>
      
      {discountedProfit !== null && (
        <div className="flex justify-between">
          <span>Lucro após desconto:</span>
          <span className={`font-semibold ${profitHealthy(discountedProfit) ? "text-green-600" : "text-red-500"}`}>
            R$ {discountedProfit.toFixed(2).replace(".", ",")}
            {discountedProfit < 0 && " (Prejuízo)"}
          </span>
        </div>
      )}
      
      {discountedProfit !== null && !profitHealthy(discountedProfit) && (
        <div className="flex items-start gap-2 p-2 bg-red-50 text-red-800 rounded-md text-sm mt-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Este desconto reduz muito sua margem de lucro!
          </p>
        </div>
      )}
    </div>
  );
}
