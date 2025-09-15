
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Brain, CheckCircle, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { AIInsightsData, AIRecommendation, BatchItem } from "./types.ts";

interface AIInsightsPanelProps {
  insights: AIInsightsData;
  batches: BatchItem[];
  setBatches: React.Dispatch<React.SetStateAction<BatchItem[]>>;
}

export default function AIInsightsPanel({ insights, batches, setBatches }: AIInsightsPanelProps) {
  
  const applyAIRecommendation = (recommendation: AIRecommendation) => {
    const updatedBatches = batches.map((batch) => {
      if (batch.quantity === recommendation.quantity) {
        return {
          ...batch,
          aiSuggestedPrice: recommendation.suggestedPrice
        };
      }
      return batch;
    });
    setBatches(updatedBatches);
  };

  return (
    <div className="space-y-6">
      {/* Análise de Mercado */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Análise Inteligente de Mercado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Preço Concorrência</span>
              </div>
              <p className="text-xl font-bold">R$ {insights.marketAnalysis.competitorAvgPrice}</p>
              <p className="text-xs text-gray-600">Média do mercado</p>
            </div>

            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Elasticidade</span>
              </div>
              <p className="text-xl font-bold">{insights.marketAnalysis.demandElasticity}</p>
              <p className="text-xs text-gray-600">Sensibilidade a preços</p>
            </div>

            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Fator Sazonal</span>
              </div>
              <p className="text-xl font-bold">{(insights.marketAnalysis.seasonalFactor * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-600">Impacto temporal</p>
            </div>

            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Oportunidade</span>
              </div>
              <p className="text-sm font-bold text-purple-600">+8%</p>
              <p className="text-xs text-gray-600">Acima da média</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium mb-2">Insight Estratégico</h4>
            <p className="text-sm text-gray-700">
              {insights.marketAnalysis.priceOpportunity}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações da IA */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Inteligentes por Quantidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.aiRecommendations.map((rec: AIRecommendation, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-100 text-purple-700">
                    {rec.quantity} unidades
                  </Badge>
                  <span className="text-xl font-bold text-green-600">
                    R$ {rec.suggestedPrice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={rec.confidence} className="w-20 h-2" />
                  <span className="text-sm text-gray-600">{rec.confidence}%</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3">
                {rec.reasoning}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>Confiança: {rec.confidence}%</span>
                  <span>Margem Est.: {((rec.suggestedPrice - 100) / rec.suggestedPrice * 100).toFixed(1)}%</span>
                </div>
                <Button
                  onClick={() => applyAIRecommendation(rec)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Aplicar Sugestão
                </Button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Estratégia Recomendada */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Estratégia Recomendada pela IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-green-800 mb-2">Estratégia Principal</h4>
              <p className="text-sm text-gray-700">
                Implementar precificação escalonada com foco em volumes de 50-100 unidades para
                maximizar receita mantendo competitividade.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-xs text-gray-600">Receita Projetada</p>
                <p className="text-lg font-bold text-green-600">R$ 18.4k</p>
              </div>
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-xs text-gray-600">Margem Média</p>
                <p className="text-lg font-bold text-blue-600">32.8%</p>
              </div>
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-xs text-gray-600">Competitividade</p>
                <p className="text-lg font-bold text-purple-600">87%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
