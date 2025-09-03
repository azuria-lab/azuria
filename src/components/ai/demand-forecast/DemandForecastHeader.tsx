
import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp } from "lucide-react";

interface DemandForecastHeaderProps {
  isAnalyzing: boolean;
  onGenerateForecast: () => void;
}

export default function DemandForecastHeader({ 
  isAnalyzing, 
  onGenerateForecast 
}: DemandForecastHeaderProps) {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Análise Preditiva de Demanda</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Use IA para prever a demanda futura baseada no histórico de vendas e padrões sazonais
        </p>
      </div>
      <Button 
        onClick={onGenerateForecast}
        disabled={isAnalyzing}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Analisando Padrões...
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4 mr-2" />
            Gerar Previsão IA
          </>
        )}
      </Button>
    </div>
  );
}
