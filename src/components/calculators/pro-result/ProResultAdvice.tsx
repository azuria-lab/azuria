
import React from "react";
import { AlertCircle } from "lucide-react";

export function ProResultAdvice() {
  return (
    <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg">
      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm">
        Este é o preço mínimo sugerido para alcançar a margem de lucro desejada. 
        Considere também a concorrência e o valor percebido do produto no mercado.
      </p>
    </div>
  );
}
