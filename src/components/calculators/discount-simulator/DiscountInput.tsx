
import React from "react";
import { Percent } from "lucide-react";

interface DiscountInputProps {
  discountPercent: number;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DiscountInput({
  discountPercent,
  onDiscountChange
}: DiscountInputProps) {
  return (
    <div>
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <Percent className="h-5 w-5" />
        Simulador de Desconto
      </h4>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          placeholder="% de desconto"
          value={discountPercent || ""}
          onChange={onDiscountChange}
          className="max-w-[150px] px-2 py-1 border border-gray-300 rounded text-base"
        />
        <span className="text-gray-500">% de desconto</span>
      </div>
    </div>
  );
}
