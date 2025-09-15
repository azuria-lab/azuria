
import React from "react";

interface SeasonalData {
  month: string;
  sales: number;
  seasonalIndex: number;
  trend: number;
  icon: React.ReactNode;
}

interface SeasonalityInsightsProps {
  insights: string[];
  analysisData: SeasonalData[];
}

export default function SeasonalityInsights({ insights, analysisData }: SeasonalityInsightsProps) {
  const getPeakMonths = () => {
    return analysisData
      .filter(item => item.seasonalIndex >= 1.15)
      .map(item => item.month);
  };

  const getLowMonths = () => {
    return analysisData
      .filter(item => item.seasonalIndex <= 0.85)
      .map(item => item.month);
  };

  return (
    <>
      {/* Insights da IA */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">💡 Insights de Sazonalidade</h4>
        <ul className="text-sm text-green-700 space-y-1">
          {insights.map((insight, index) => (
            <li key={index}>• {insight}</li>
          ))}
        </ul>
      </div>

      {/* Recomendações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">🎯 Recomendações Estratégicas</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Aumente preços em {getPeakMonths().slice(0, 2).join(" e ")} (alta demanda)</li>
          <li>• Promova vendas em {getLowMonths().slice(0, 2).join(" e ")} (baixa demanda)</li>
          <li>• Prepare estoque 2 meses antes dos picos sazonais</li>
          <li>• Considere campanhas de marketing direcionadas por sazonalidade</li>
        </ul>
      </div>
    </>
  );
}
