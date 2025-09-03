
import React from "react";

interface ForecastData {
  period: string;
  demand: number;
  forecast?: boolean;
}

interface InsightsPanelProps {
  forecastData: ForecastData[];
  mockHistoricalData: Array<{ period: string; demand: number }>;
}

export default function InsightsPanel({ forecastData, mockHistoricalData }: InsightsPanelProps) {
  const forecastedItems = forecastData.filter(d => d.forecast);
  const growthTrend = forecastedItems.length > 0 
    ? ((forecastedItems[0].demand / mockHistoricalData[mockHistoricalData.length - 1].demand - 1) * 100)
    : 0;

  return (
    <>
      {/* Insights da IA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Insights da IA</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Padrão sazonal detectado: picos em Nov/Dez, queda em Jan/Fev</li>
          <li>• Tendência de crescimento: {growthTrend > 0 ? 'positiva' : 'negativa'}</li>
          <li>• Recomendação: Prepare estoque para os próximos 2 meses</li>
          <li>• Risco: Baixo (dados históricos consistentes)</li>
        </ul>
      </div>
    </>
  );
}
