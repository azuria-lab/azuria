
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import DemandForecastHeader from "./demand-forecast/DemandForecastHeader";
import DemandMetrics from "./demand-forecast/DemandMetrics";
import ForecastChart from "./demand-forecast/ForecastChart";
import InsightsPanel from "./demand-forecast/InsightsPanel";
import DemandForecastActions from "./demand-forecast/DemandForecastActions";

interface DemandForecastProps {
  productName?: string;
  historicalSalesData?: Array<{ period: string; demand: number }>;
}

export default function DemandForecast({ 
  productName = "Produto Exemplo",
  historicalSalesData 
}: DemandForecastProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [forecastData, setForecastData] = useState<Array<{ period: string; demand: number; forecast?: boolean }> | null>(null);

  // Dados simulados de histórico
  const mockHistoricalData = historicalSalesData || [
    { period: "Jan", demand: 120 },
    { period: "Fev", demand: 135 },
    { period: "Mar", demand: 158 },
    { period: "Abr", demand: 142 },
    { period: "Mai", demand: 165 },
    { period: "Jun", demand: 180 },
    { period: "Jul", demand: 195 },
    { period: "Ago", demand: 175 },
    { period: "Set", demand: 168 },
    { period: "Out", demand: 185 },
    { period: "Nov", demand: 220 },
    { period: "Dez", demand: 250 }
  ];

  const generateForecast = async () => {
    setIsAnalyzing(true);
    
    // Simular análise de IA
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Algoritmo simples de previsão baseado em tendência e sazonalidade
    const recentData = mockHistoricalData.slice(-6);
    const avgGrowth = recentData.reduce((sum, item, index) => {
      if (index === 0) {return 0;}
      return sum + (item.demand - recentData[index - 1].demand) / recentData[index - 1].demand;
    }, 0) / (recentData.length - 1);

    // Detectar sazonalidade (novembro/dezembro alta, janeiro/fevereiro baixa)
    const seasonalFactors = {
      "Jan": 0.85, "Fev": 0.90, "Mar": 1.05, "Abr": 0.95,
      "Mai": 1.10, "Jun": 1.15, "Jul": 1.20, "Ago": 1.10,
      "Set": 1.05, "Out": 1.15, "Nov": 1.30, "Dez": 1.40
    };

    const nextPeriods = ["Jan+1", "Fev+1", "Mar+1", "Abr+1", "Mai+1", "Jun+1"];
    const lastDemand = mockHistoricalData[mockHistoricalData.length - 1].demand;
    
    const forecastResults = nextPeriods.map((period, index) => {
      const monthKey = period.split("+")[0] as keyof typeof seasonalFactors;
      const baseGrowth = 1 + avgGrowth;
      const seasonalAdjustment = seasonalFactors[monthKey] || 1;
      const trendFactor = Math.pow(baseGrowth, index + 1);
      const predictedDemand = Math.round(lastDemand * trendFactor * seasonalAdjustment);
      
      return {
        period,
        demand: predictedDemand,
        forecast: true
      };
    });

    const combinedData = [
      ...mockHistoricalData.map(item => ({ ...item, forecast: false })),
      ...forecastResults
    ];

    setForecastData(combinedData);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setForecastData(null);
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Previsão de Demanda - {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!forecastData ? (
          <DemandForecastHeader 
            isAnalyzing={isAnalyzing}
            onGenerateForecast={generateForecast}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DemandMetrics 
              forecastData={forecastData}
              mockHistoricalData={mockHistoricalData}
            />

            <ForecastChart forecastData={forecastData} />

            <InsightsPanel 
              forecastData={forecastData}
              mockHistoricalData={mockHistoricalData}
            />

            <DemandForecastActions onNewAnalysis={handleNewAnalysis} />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
