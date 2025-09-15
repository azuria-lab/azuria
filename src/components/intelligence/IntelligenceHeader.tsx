
import React from "react";
import { Brain } from "lucide-react";

export default function IntelligenceHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
        <Brain className="h-8 w-8 text-purple-600" />
        Inteligência de Dados
      </h1>
      <p className="text-gray-600">
        Machine Learning, análise preditiva e insights automáticos para otimizar seus preços
      </p>
    </div>
  );
}
