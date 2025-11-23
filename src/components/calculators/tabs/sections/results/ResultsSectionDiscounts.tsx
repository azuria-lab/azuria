
import React from "react";
import DiscountSimulator from "@/components/calculators/discount-simulator/DiscountSimulator";

interface ResultsSectionDiscountsProps {
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProfitHealthy: (profit: number) => boolean;
}

export default function ResultsSectionDiscounts(props: ResultsSectionDiscountsProps) {
  return (
    <DiscountSimulator
      discountPercent={props.discountPercent}
      discountedPrice={props.discountedPrice}
      discountedProfit={props.discountedProfit}
      onDiscountChange={props.onDiscountChange}
      profitHealthy={props.isProfitHealthy}
    />
  );
}
