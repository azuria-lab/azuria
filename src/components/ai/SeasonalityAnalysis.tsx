
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Flower, Leaf, Snowflake, Sun, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import SeasonalityHeader from "./seasonality/SeasonalityHeader";
import SeasonalityMetrics from "./seasonality/SeasonalityMetrics";
import SeasonalityCharts from "./seasonality/SeasonalityCharts";
import SeasonalityDetails from "./seasonality/SeasonalityDetails";
import SeasonalityInsights from "./seasonality/SeasonalityInsights";
import SeasonalityActions from "./seasonality/SeasonalityActions";

interface SeasonalData {
  month: string;
  sales: number;
  seasonalIndex: number;
  trend: number;
  icon: React.ReactNode;
}

interface SeasonalityAnalysisProps {
  productCategory?: string;
}

export default function SeasonalityAnalysis({ productCategory = "Eletrônicos" }: SeasonalityAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<SeasonalData[] | null>(null);
  const [insights, setInsights] = useState<string[] | null>(null);

  const getSeasonIcon = (month: string) => {
    const seasonIcons = {
      "Jan": <Sun className="h-4 w-4 text-yellow-500" />,
      "Fev": <Sun className="h-4 w-4 text-yellow-500" />,
      "Mar": <Leaf className="h-4 w-4 text-green-500" />,
      "Abr": <Leaf className="h-4 w-4 text-green-500" />,
      "Mai": <Leaf className="h-4 w-4 text-green-500" />,
      "Jun": <Snowflake className="h-4 w-4 text-blue-500" />,
      "Jul": <Snowflake className="h-4 w-4 text-blue-500" />,
      "Ago": <Snowflake className="h-4 w-4 text-blue-500" />,
      "Set": <Flower className="h-4 w-4 text-pink-500" />,
      "Out": <Flower className="h-4 w-4 text-pink-500" />,
      "Nov": <Flower className="h-4 w-4 text-pink-500" />,
      "Dez": <Sun className="h-4 w-4 text-red-500" />
    };
    return seasonIcons[month as keyof typeof seasonIcons] || <Calendar className="h-4 w-4" />;
  };

  const generateSeasonalityAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simular análise de IA
    await new Promise(resolve => setTimeout(resolve, 2800));
    
    // Padrões sazonais por categoria
    const seasonalPatterns = {
      "Eletrônicos": {
        base: [85, 80, 95, 90, 100, 95, 90, 85, 95, 105, 130, 145],
        insights: [
          "Pico em Novembro/Dezembro devido à Black Friday e Natal",
          "Queda em Janeiro/Fevereiro após as festas",
          "Crescimento moderado em Maio (Dia das Mães)",
          "Estabilidade no meio do ano com leve queda no inverno"
        ]
      },
      "Roupas": {
        base: [70, 75, 110, 105, 95, 90, 85, 90, 120, 125, 140, 150],
        insights: [
          "Alta temporada em Março/Abril (outono/inverno)",
          "Pico em Setembro/Outubro (primavera/verão)",
          "Black Friday e Natal impulsionam vendas de fim de ano",
          "Baixa no meio do inverno (Junho/Julho)"
        ]
      },
      "Casa": {
        base: [90, 85, 105, 110, 115, 95, 90, 95, 100, 110, 125, 140],
        insights: [
          "Crescimento em Março/Abril (início do outono)",
          "Pico em Maio (Dia das Mães)",
          "Estabilidade no inverno",
          "Forte crescimento em Novembro/Dezembro"
        ]
      }
    };

    const pattern = seasonalPatterns[productCategory as keyof typeof seasonalPatterns] || seasonalPatterns["Eletrônicos"];
    
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    const data: SeasonalData[] = months.map((month, index) => {
      const baseValue = pattern.base[index];
      const sales = Math.floor(baseValue * (80 + Math.random() * 40)); // Adicionar variação
      const seasonalIndex = baseValue / 100; // Índice sazonal (1.0 = normal)
      const trend = index < 6 ? 1 + (index * 0.02) : 1 + ((11 - index) * 0.02); // Tendência simulada
      
      return {
        month,
        sales,
        seasonalIndex,
        trend,
        icon: getSeasonIcon(month)
      };
    });

    setAnalysisData(data);
    setInsights(pattern.insights);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setInsights(null);
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Análise de Sazonalidade - {productCategory}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysisData ? (
          <div className="text-center py-8">
            <SeasonalityHeader productCategory={productCategory} />
            <Button 
              onClick={generateSeasonalityAnalysis}
              disabled={isAnalyzing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analisando Sazonalidade...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analisar Padrões Sazonais
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SeasonalityMetrics analysisData={analysisData} />
            <SeasonalityCharts analysisData={analysisData} />
            <SeasonalityDetails analysisData={analysisData} />
            {insights && (
              <SeasonalityInsights insights={insights} analysisData={analysisData} />
            )}
            <SeasonalityActions onNewAnalysis={handleNewAnalysis} />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
