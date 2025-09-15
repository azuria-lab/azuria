
import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MLFactors {
  historical_trend: number;
  seasonality: number;
  competition: number;
  demand_elasticity: number;
  market_conditions: number;
}

interface MLFactorsAnalysisProps {
  factors: MLFactors;
}

export default function MLFactorsAnalysis({ factors }: MLFactorsAnalysisProps) {
  const getFactorIcon = (value: number) => {
    if (value > 0) {return <TrendingUp className="h-4 w-4 text-green-600" />;}
    if (value < 0) {return <TrendingDown className="h-4 w-4 text-red-600" />;}
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const factorLabels = {
    historical_trend: "Tendência Histórica",
    seasonality: "Sazonalidade",
    competition: "Competitividade",
    demand_elasticity: "Elasticidade da Demanda",
    market_conditions: "Condições de Mercado"
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700">Fatores Analisados</h4>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(factors).map(([key, value]) => (
          <div key={key} className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {factorLabels[key as keyof MLFactors]}
              </span>
              {getFactorIcon(value)}
            </div>
            <span className="font-semibold text-sm">
              {value > 0 ? '+' : ''}{value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
