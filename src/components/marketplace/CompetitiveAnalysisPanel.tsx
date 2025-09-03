
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Target, TrendingDown, TrendingUp } from "lucide-react";

interface CompetitiveData {
  myPrice: number;
  marketAverage: number;
  marketMin: number;
  marketMax: number;
  competitors: number;
  marketPosition: 'aggressive' | 'competitive' | 'premium';
  priceGap: number;
  recommendation: string;
}

interface CompetitiveAnalysisPanelProps {
  data: CompetitiveData;
  onPriceAdjust?: (newPrice: number) => void;
}

export default function CompetitiveAnalysisPanel({ data, onPriceAdjust }: CompetitiveAnalysisPanelProps) {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'aggressive': return 'text-red-600 bg-red-50 border-red-200';
      case 'competitive': return 'text-green-600 bg-green-50 border-green-200';
      case 'premium': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'aggressive': return <TrendingDown className="h-4 w-4" />;
      case 'competitive': return <Target className="h-4 w-4" />;
      case 'premium': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const calculateMarketPosition = () => {
    const percentage = ((data.myPrice - data.marketMin) / (data.marketMax - data.marketMin)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  const getSuggestedPrice = () => {
    switch (data.marketPosition) {
      case 'aggressive':
        return data.marketAverage * 0.95; // 5% abaixo da média
      case 'premium':
        return data.marketAverage * 1.05; // 5% acima da média
      default:
        return data.marketAverage; // Na média
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Análise Competitiva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Posição no Mercado */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Posição no Mercado</span>
            <Badge className={`${getPositionColor(data.marketPosition)} flex items-center gap-1`}>
              {getPositionIcon(data.marketPosition)}
              {data.marketPosition === 'aggressive' ? 'Agressivo' : 
               data.marketPosition === 'competitive' ? 'Competitivo' : 'Premium'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>R$ {data.marketMin.toFixed(2)}</span>
              <span>SEU PREÇO</span>
              <span>R$ {data.marketMax.toFixed(2)}</span>
            </div>
            <Progress value={calculateMarketPosition()} className="h-3" />
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Seu Preço</p>
            <p className="text-lg font-bold text-blue-600">R$ {data.myPrice.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Média do Mercado</p>
            <p className="text-lg font-bold">R$ {data.marketAverage.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Diferença</p>
            <p className={`text-lg font-bold ${data.priceGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {data.priceGap > 0 ? '+' : ''}R$ {data.priceGap.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Concorrentes</p>
            <p className="text-lg font-bold">{data.competitors}</p>
          </div>
        </div>

        {/* Faixa de Preços */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Faixa Competitiva
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mínimo:</span>
              <span className="font-semibold">R$ {data.marketMin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Recomendado:</span>
              <span className="font-semibold text-green-600">R$ {getSuggestedPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Máximo:</span>
              <span className="font-semibold">R$ {data.marketMax.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Recomendação */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recomendação Estratégica
          </h4>
          <p className="text-sm text-yellow-700">{data.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
