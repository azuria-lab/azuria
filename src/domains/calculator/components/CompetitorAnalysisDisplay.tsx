
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingDown, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/utils/calculator/formatCurrency";

interface CompetitorAnalysis {
  averagePrice: number;
  pricePosition: 'below' | 'average' | 'above';
  competitiveAdvantage: number;
}

interface CompetitorAnalysisDisplayProps {
  analysis: CompetitorAnalysis;
  sellingPrice: number;
}

export default function CompetitorAnalysisDisplay({ 
  analysis, 
  sellingPrice 
}: CompetitorAnalysisDisplayProps) {
  
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'below': return 'bg-green-100 text-green-800';
      case 'above': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPositionText = (position: string) => {
    switch (position) {
      case 'below': return 'Abaixo da Média';
      case 'above': return 'Acima da Média';
      default: return 'Na Média';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'below': return <TrendingDown className="h-4 w-4" />;
      case 'above': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getAdvantageDescription = () => {
    if (analysis.competitiveAdvantage > 0) {
      return `Seu preço é ${analysis.competitiveAdvantage.toFixed(1)}% mais baixo que a média`;
    } else {
      return `Seu preço é ${Math.abs(analysis.competitiveAdvantage).toFixed(1)}% mais alto que a média`;
    }
  };

  const competitiveScore = Math.max(0, Math.min(100, 50 + analysis.competitiveAdvantage));

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Análise de Concorrência Automática
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Seu Preço</div>
              <div className="text-2xl font-bold text-brand-700">
                R$ {formatCurrency(sellingPrice)}
              </div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Média do Mercado</div>
              <div className="text-2xl font-bold text-gray-700">
                R$ {formatCurrency(analysis.averagePrice)}
              </div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Posição</div>
              <Badge className={getPositionColor(analysis.pricePosition)}>
                {getPositionIcon(analysis.pricePosition)}
                <span className="ml-1">{getPositionText(analysis.pricePosition)}</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Competitividade</span>
                <span className="text-sm text-gray-600">
                  {competitiveScore.toFixed(0)}/100
                </span>
              </div>
              <Progress value={competitiveScore} className="h-3" />
              <p className="text-xs text-gray-500 mt-1">
                {getAdvantageDescription()}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Recomendações Estratégicas:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {analysis.pricePosition === 'below' && (
                  <>
                    <li>✅ Preço competitivo para ganhar market share</li>
                    <li>💡 Considere destacar diferenciais do produto</li>
                    <li>📈 Monitore se a margem permite crescimento sustentável</li>
                  </>
                )}
                {analysis.pricePosition === 'above' && (
                  <>
                    <li>⚠️ Preço acima da média pode reduzir conversões</li>
                    <li>💡 Destaque valor agregado e qualidade superior</li>
                    <li>📊 Considere ajustar estratégia ou reduzir custos</li>
                  </>
                )}
                {analysis.pricePosition === 'average' && (
                  <>
                    <li>✅ Preço alinhado com o mercado</li>
                    <li>💡 Foque em diferenciais competitivos</li>
                    <li>📈 Monitore tendências para ajustes futuros</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>🤖 Análise baseada em dados simulados de mercado</p>
            <p>📊 Amostra: 5 concorrentes principais</p>
            <p>⏱️ Última atualização: agora</p>
            <p className="text-xs text-gray-500 mt-4">
              * Em produção, esta análise seria baseada em dados reais coletados de diferentes marketplaces e APIs de concorrentes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
