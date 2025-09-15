
import React from "react";
import SalesVolumeSimulator from "../SalesVolumeSimulator";
import { Card } from "@/components/ui/card";

interface ResultVolumeSimulatorProps {
  sellingPrice: number;
  profit: number;
  formatCurrency: (value: number) => string;
}

export default function ResultVolumeSimulator({ 
  sellingPrice, 
  profit, 
  formatCurrency 
}: ResultVolumeSimulatorProps) {
  return (
    <Card>
      <SalesVolumeSimulator
        sellingPrice={sellingPrice}
        profit={profit}
        formatCurrency={formatCurrency}
      />
    </Card>
  );
}
