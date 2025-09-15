import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowRight, Brain, Target } from "lucide-react";

interface InsightAnalysisSummaryProps {
  optimalPrice: number;
  competitivePosition: 'aggressive' | 'competitive' | 'premium';
  marketTrend: 'bullish' | 'neutral' | 'bearish';
  confidenceScore: number;
  onApplyPrice?: (price: number) => void;
}

export default function InsightAnalysisSummary({
  optimalPrice,
  competitivePosition,
  marketTrend,
  confidenceScore,
  onApplyPrice
}: InsightAnalysisSummaryProps) {
  const getCompetitiveColor = (position: string) => {
    switch (position) {
      case 'aggressive': return 'text-red-600 bg-red-50';
      case 'premium': return 'text-purple-600 bg-purple-50';
      case 'competitive': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <Activity className="h-4 w-4 text-green-600" />;
      case 'bearish': return <Activity className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Análise Inteligente de Mercado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preço Otimizado */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div>
            <p className="text-sm text-gray-600 mb-1">Preço Otimizado por IA</p>
            <p className="text-2xl font-bold text-purple-600">
              R$ {optimalPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>
          {onApplyPrice && (
            <Button 
              onClick={() => onApplyPrice(optimalPrice)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Aplicar Preço
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Métricas de Análise */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCompetitiveColor(competitivePosition)}`}>
              <Target className="h-3 w-3" />
              {competitivePosition === 'aggressive' ? 'Agressivo' : 
               competitivePosition === 'premium' ? 'Premium' : 'Competitivo'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Posição</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1">
              {getTrendIcon(marketTrend)}
              <span className="text-xs font-medium">
                {marketTrend === 'bullish' ? 'Alta' : 
                 marketTrend === 'bearish' ? 'Baixa' : 'Estável'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tendência</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-sm font-bold text-green-600">{confidenceScore}%</div>
            <p className="text-xs text-gray-500">Confiança</p>
          </div>
        </div>

        {/* Barra de Confiança */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Confiança da Análise</span>
            <span className="font-semibold">{confidenceScore}%</span>
          </div>
          <Progress value={confidenceScore} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}