
import React from "react";
import { Badge } from "@/components/ui/badge";

interface SeasonalData {
  month: string;
  sales: number;
  seasonalIndex: number;
  trend: number;
  icon: React.ReactNode;
}

interface SeasonalityDetailsProps {
  analysisData: SeasonalData[];
}

export default function SeasonalityDetails({ analysisData }: SeasonalityDetailsProps) {
  const getSeasonalityLevel = (index: number) => {
    if (index >= 1.2) {return { level: "Muito Alta", color: "bg-red-100 text-red-800" };}
    if (index >= 1.1) {return { level: "Alta", color: "bg-orange-100 text-orange-800" };}
    if (index >= 0.9) {return { level: "Normal", color: "bg-green-100 text-green-800" };}
    return { level: "Baixa", color: "bg-blue-100 text-blue-800" };
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-green-100">
      <h4 className="font-semibold text-gray-700 mb-4">Detalhamento Mensal</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {analysisData.map((item, index) => {
          const seasonality = getSeasonalityLevel(item.seasonalIndex);
          return (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-medium">{item.month}</span>
              </div>
              <div className="text-right">
                <Badge className={seasonality.color} variant="outline">
                  {seasonality.level}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {(item.seasonalIndex * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
