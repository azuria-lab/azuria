
import React from "react";
import DiscountSimulator from "./discount-simulator/DiscountSimulator";

interface ProDiscountSimulatorProps {
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profitHealthy: (profit: number) => boolean;
}

const ProDiscountSimulator: React.FC<ProDiscountSimulatorProps> = (props) => (
  <DiscountSimulator {...props} />
);

export default ProDiscountSimulator;
