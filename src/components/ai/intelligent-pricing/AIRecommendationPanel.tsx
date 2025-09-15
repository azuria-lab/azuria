
import React from "react";
import { AlertTriangle } from "lucide-react";

export default function AIRecommendationPanel() {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-purple-800 mb-1">Recomendação da IA</p>
          <p className="text-xs text-purple-700">
            Baseado nos dados fornecidos, recomendamos a estratégia "Competitiva Balanceada" 
            para minimizar riscos e maximizar chances de sucesso no mercado.
          </p>
        </div>
      </div>
    </div>
  );
}
