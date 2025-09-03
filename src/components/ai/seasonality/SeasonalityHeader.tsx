
import React from "react";
import { Calendar } from "lucide-react";

interface SeasonalityHeaderProps {
  productCategory: string;
}

export default function SeasonalityHeader({ productCategory }: SeasonalityHeaderProps) {
  return (
    <div className="mb-4">
      <Calendar className="h-16 w-16 text-green-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Análise de Padrões Sazonais</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Identifique os padrões sazonais de vendas para otimizar preços e estoque ao longo do ano
      </p>
    </div>
  );
}
