
import React from "react";

interface SeasonalData {
  month: string;
  sales: number;
  seasonalIndex: number;
  trend: number;
  icon: React.ReactNode;
}

interface SeasonalityMetricsProps {
  analysisData: SeasonalData[];
}

export default function SeasonalityMetrics({ analysisData }: SeasonalityMetricsProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-4 text-center border border-green-100">
        <div className="text-sm text-gray-600 mb-1">Meses de Pico</div>
        <div className="text-lg font-semibold text-green-600">
          {getPeakMonths().join(", ") || "Nenhum"}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 text-center border border-green-100">
        <div className="text-sm text-gray-600 mb-1">Meses de Baixa</div>
        <div className="text-lg font-semibold text-red-600">
          {getLowMonths().join(", ") || "Nenhum"}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 text-center border border-green-100">
        <div className="text-sm text-gray-600 mb-1">Variação Sazonal</div>
        <div className="text-lg font-semibold text-purple-600">
          {Math.round((Math.max(...analysisData.map(d => d.seasonalIndex)) - 
                      Math.min(...analysisData.map(d => d.seasonalIndex))) * 100)}%
        </div>
      </div>
    </div>
  );
}
