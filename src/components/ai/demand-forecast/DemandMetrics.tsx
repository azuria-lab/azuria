
import React from "react";

interface ForecastData {
  period: string;
  demand: number;
  forecast?: boolean;
}

interface DemandMetricsProps {
  forecastData: ForecastData[];
  mockHistoricalData: Array<{ period: string; demand: number }>;
}

export default function DemandMetrics({ forecastData, mockHistoricalData }: DemandMetricsProps) {
  const calculateAccuracy = () => {
    const variance = mockHistoricalData.reduce((sum, item, index) => {
      if (index === 0) {return 0;}
      const change = Math.abs(item.demand - mockHistoricalData[index - 1].demand);
      return sum + change;
    }, 0) / mockHistoricalData.length;
    
    const accuracy = Math.max(70, Math.min(95, 95 - (variance / 10)));
    return Math.round(accuracy);
  };

  const forecastedItems = forecastData.filter(d => d.forecast);
  const totalForecastedDemand = forecastedItems.reduce((sum, d) => sum + d.demand, 0);
  const growthRate = forecastedItems.length > 0 
    ? ((forecastedItems[0].demand / mockHistoricalData[mockHistoricalData.length - 1].demand - 1) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
        <div className="text-2xl font-bold text-blue-600">
          {totalForecastedDemand}
        </div>
        <div className="text-sm text-gray-600">Demanda Prevista (6 meses)</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
        <div className="text-2xl font-bold text-green-600">
          {calculateAccuracy()}%
        </div>
        <div className="text-sm text-gray-600">Precisão Estimada</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
        <div className="text-2xl font-bold text-purple-600">
          +{growthRate}%
        </div>
        <div className="text-sm text-gray-600">Crescimento Previsto</div>
      </div>
    </div>
  );
}
