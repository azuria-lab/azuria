
import React from "react";
import ProCalculatorDetails from "@/components/calculators/ProCalculatorDetails";

interface ResultsSectionBreakdownProps {
  sellingPrice: number | null;
  breakdown: any;
  taxPercent: number;
  marketplaceName: string;
  marketplaceFee: number;
  targetProfit: number;
  includeShipping: boolean;
  isProfitHealthy: (profit: number) => boolean;
}

export default function ResultsSectionBreakdown({
  sellingPrice,
  breakdown,
  taxPercent,
  marketplaceName,
  marketplaceFee,
  targetProfit,
  includeShipping,
  isProfitHealthy
}: ResultsSectionBreakdownProps) {
  if (!sellingPrice) {return null;}
  
  return (
    <ProCalculatorDetails
      sellingPrice={sellingPrice}
      breakdown={breakdown}
      taxPercent={taxPercent}
      marketplaceName={marketplaceName}
      marketplaceFee={marketplaceFee}
      targetProfit={targetProfit}
      includeShipping={includeShipping}
      discountPercent={0}
      discountedPrice={null}
      discountedProfit={null}
      onDiscountChange={() => {}}
      isProfitHealthy={isProfitHealthy}
    />
  );
}
