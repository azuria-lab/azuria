
import React from "react";
import DiscountInput from "./DiscountInput";
import DiscountResults from "./DiscountResults";

interface DiscountSimulatorProps {
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profitHealthy: (profit: number) => boolean;
}

export default function DiscountSimulator({
  discountPercent,
  discountedPrice,
  discountedProfit,
  onDiscountChange,
  profitHealthy
}: DiscountSimulatorProps) {
  return (
    <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 shadow-sm">
      <DiscountInput 
        discountPercent={discountPercent} 
        onDiscountChange={onDiscountChange} 
      />
      
      <DiscountResults 
        discountPercent={discountPercent}
        discountedPrice={discountedPrice}
        discountedProfit={discountedProfit}
        profitHealthy={profitHealthy}
      />
    </div>
  );
}
