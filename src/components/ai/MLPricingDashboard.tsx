
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Brain, Target, TrendingUp, Zap } from "lucide-react";
import { useAIPredictions } from "@/hooks/useAIPredictions";
import { formatCurrency } from "@/utils/calculator/formatCurrency";

interface MLPricingDashboardProps {
  productData?: {
    category: string;
    cost: number;
    currentPrice: number;
    salesHistory: Array<{ date: Date; quantity: number; price: number }>;
    competitors: Array<{ price: number; marketShare: number }>;
    seasonality: 'high' | 'medium' | 'low';
  };
}

export default function MLPricingDashboard({ productData }: MLPricingDashboardProps) {
  const { isAnalyzing, mlResult, predictiveAnalysis, generateMLPrediction, generatePredictiveAnalysis } = useAIPredictions();
  
  const mockProductData = productData || {
    category: "Eletrônicos",
    cost: 180.00,
    currentPrice: 299.99,
    salesHistory: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      quantity: Math.floor(Math.random() * 50 + 20),
      price: 299.99 + Math.random() * 20 - 10
    })),
    competitors: [
      { price: 285.90, marketShare: 15 },
      { price: 310.50, marketShare: 25 },
      { price: 275.00, marketShare: 12 }
    ],
    seasonality: 'high' as const
  };

  const handleMLAnalysis = () => {
    generateMLPrediction(mockProductData);
  };

  const handlePredictiveAnalysis = () => {
    generatePredictiveAnalysis(mockProductData);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) {return "text-green-600 bg-green-100";}
    if (confidence >= 60) {return "text-yellow-600 bg-yellow-100";}
    return "text-red-600 bg-red-100";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return "text-green-600 bg-green-100";
      case 'medium': return "text-yellow-600 bg-yellow-100";
      case 'high': return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IA de Precificação</h1>
            <p className="text-gray-600">Machine Learning para otimização inteligente de preços</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleMLAnalysis}
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analisando...' : 'Análise ML'}
          </Button>
          <Button 
            onClick={handlePredictiveAnalysis}
            disabled={isAnalyzing}
            variant="outline"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Análise Preditiva
          </Button>
        </div>
      </div>

      {/* Current Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Produto Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Categoria</div>
              <div className="text-lg font-semibold">{mockProductData.category}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Custo</div>
              <div className="text-lg font-semibold">R$ {formatCurrency(mockProductData.cost)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Preço Atual</div>
              <div className="text-lg font-semibold">R$ {formatCurrency(mockProductData.currentPrice)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Margem</div>
              <div className="text-lg font-semibold">
                {(((mockProductData.currentPrice - mockProductData.cost) / mockProductData.currentPrice) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ML Prediction Results */}
      {mlResult && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Brain className="h-5 w-5" />
              Resultado da Análise ML
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preço Sugerido */}
            <div className="text-center p-6 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-2">Preço Sugerido pelo ML</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                R$ {formatCurrency(mlResult.suggestedPrice)}
              </div>
              <Badge className={getConfidenceColor(mlResult.confidence)}>
                {mlResult.confidence}% de confiança
              </Badge>
            </div>

            {/* Fatores de Análise */}
            <div>
              <h4 className="font-semibold mb-4">Fatores Considerados</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mlResult.factors).map(([factor, value]) => (
                  <div key={factor} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {factor.replace('_', ' ')}
                      </span>
                      <span className={`text-sm font-semibold ${
                        value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {value > 0 ? '+' : ''}{value}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.abs(value) * 2} 
                      className={`h-2 ${value > 0 ? 'bg-green-100' : 'bg-red-100'}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Cenários Alternativos */}
            <div>
              <h4 className="font-semibold mb-4">Cenários Alternativos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mlResult.alternatives.map((alt, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-gray-600">{alt.scenario}</div>
                    <div className="text-lg font-bold">R$ {formatCurrency(alt.price)}</div>
                    <div className="text-sm text-gray-500">{alt.probability}% probabilidade</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">Análise do Algoritmo</h4>
              <p className="text-sm text-gray-700">{mlResult.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Analysis Results */}
      {predictiveAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forecast de Demanda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Previsão de Demanda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Próximos 7 dias</span>
                <Badge variant="outline">
                  {predictiveAnalysis.demandForecast.confidence.toFixed(1)}% confiança
                </Badge>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {predictiveAnalysis.demandForecast.next7Days.map((demand, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500">D{index + 1}</div>
                    <div className="text-sm font-semibold">{demand}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600">Tendência do Mercado</div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-xs text-gray-500">Mudança Média de Preço</div>
                    <div className="font-semibold">
                      {predictiveAnalysis.competitionTrends.avgPriceChange > 0 ? '+' : ''}
                      {predictiveAnalysis.competitionTrends.avgPriceChange}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Market Share</div>
                    <div className="font-semibold">{predictiveAnalysis.competitionTrends.marketShare}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Otimização de Preço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Otimização de Preço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Preço Otimizado</div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {formatCurrency(predictiveAnalysis.priceOptimization.optimalPrice)}
                </div>
                <Badge className={getRiskColor(predictiveAnalysis.priceOptimization.riskLevel)}>
                  Risco {predictiveAnalysis.priceOptimization.riskLevel}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">Receita Esperada</div>
                <div className="text-lg font-semibold">
                  R$ {formatCurrency(predictiveAnalysis.priceOptimization.expectedRevenue)}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium mb-1">Recomendação</div>
                <div className="text-sm text-gray-700">
                  {predictiveAnalysis.priceOptimization.recommendation}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
              <div className="text-lg font-medium">Processando com IA...</div>
              <div className="text-sm text-gray-600">
                Analisando {mockProductData.salesHistory.length} pontos de dados históricos
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
