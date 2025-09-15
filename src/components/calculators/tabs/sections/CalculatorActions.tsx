
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save } from "lucide-react";

interface CalculatorActionsProps {
  calculatePrice: () => void;
  handleSaveCalculation: () => void;
  sellingPrice: number | null;
}

export default function CalculatorActions({
  calculatePrice,
  handleSaveCalculation,
  sellingPrice
}: CalculatorActionsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={calculatePrice}
        className="flex-1 bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        size="lg"
      >
        Calcular Preço Ideal
        <ArrowRight className="h-5 w-5 animate-pulse" />
      </Button>
      
      {sellingPrice ? (
        <Button
          onClick={handleSaveCalculation}
          className="bg-green-600 hover:bg-green-700 shadow-md"
          size="lg"
        >
          <Save className="h-5 w-5" />
        </Button>
      ) : null}
    </div>
  );
}
