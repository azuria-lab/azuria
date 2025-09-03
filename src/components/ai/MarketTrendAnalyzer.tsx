
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertCircle, Target, TrendingDown, TrendingUp, Zap } from "lucide-react";

interface MarketTrendData {
  period: string;
  avgPrice: number;
  demandIndex: number;
  competitionLevel: number;
  seasonalityFactor: number;
}

interface TrendIndicator {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  description: string;
}

interface MarketTrendAnalyzerProps {
  category: string;
  region?: string;
}

export default function MarketTrendAnalyzer({ category, region = "sudeste" }: MarketTrendAnalyzerProps) {
  
  // Dados simulados de tendência de mercado
  const trendData: MarketTrendData[] = [
    { period: "Jan", avgPrice: 85, demandIndex: 70, competitionLevel: 60, seasonalityFactor: 80 },
    { period: "Fev", avgPrice: 88, demandIndex: 75, competitionLevel: 65, seasonalityFactor: 85 },
    { period: "Mar", avgPrice: 92, demandIndex: 85, competitionLevel: 70, seasonalityFactor: 90 },
    { period: "Abr", avgPrice: 95, demandIndex: 80, competitionLevel: 68, seasonalityFactor: 85 },
    { period: "Mai", avgPrice: 90, demandIndex: 72, competitionLevel: 75, seasonalityFactor: 75 },
    { period: "Jun", avgPrice: 87, demandIndex: 68, competitionLevel: 78, seasonalityFactor: 70 },
  ];

  const indicators: TrendIndicator[] = [
    {
      metric: "Demanda",
      value: 78,
      trend: 'up',
      impact: 'high',
      description: "Crescimento de 12% nos últimos 3 meses"
    },
    {
      metric: "Competitividade",
      value: 65,
      trend: 'stable',
      impact: 'medium',
      description: "Nível de concorrência estável no período"
    },
    {
      metric: "Sazonalidade",
      value: 82,
      trend: 'up',
      impact: 'high',
      description: "Período favorável para aumentos de preço"
    },
    {
      metric: "Elasticidade",
      value: 45,
      trend: 'down',
      impact: 'medium',
      description: "Baixa sensibilidade a mudanças de preço"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Análise de Tendências de Mercado
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Categoria: <strong className="text-indigo-600">{category}</strong></span>
            <span>Região: <strong className="text-indigo-600">{region}</strong></span>
          </div>
        </CardHeader>
      </Card>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{indicator.metric}</span>
                <div className={`p-1 rounded-full ${getTrendColor(indicator.trend)}`}>
                  {getTrendIcon(indicator.trend)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{indicator.value}%</span>
                  <Badge variant={getImpactBadgeColor(indicator.impact)} className="text-xs">
                    {indicator.impact === 'high' ? 'Alto' : 
                     indicator.impact === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
                
                <Progress value={indicator.value} className="h-2" />
                
                <p className="text-xs text-gray-500">{indicator.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Tendência de Preços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Evolução de Preços e Demanda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'avgPrice' ? '' : '%'}`,
                    name === 'avgPrice' ? 'Preço Médio' : 
                    name === 'demandIndex' ? 'Índice de Demanda' : 'Nível de Competição'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgPrice" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="demandIndex" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="competitionLevel" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Sazonalidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            Índice de Sazonalidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Fator Sazonal']} />
                <Area 
                  type="monotone" 
                  dataKey="seasonalityFactor" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Oportunidades */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            Alertas e Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
            <Target className="h-4 w-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Oportunidade de Crescimento</p>
              <p className="text-xs text-green-700">
                Demanda crescente detectada. Considere aumentar preços em 3-5% nas próximas 2 semanas.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
            <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Análise Competitiva</p>
              <p className="text-xs text-blue-700">
                Concorrência estável. Posição favorável para manter margens atuais.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">Monitoramento Necessário</p>
              <p className="text-xs text-orange-700">
                Elasticidade em queda. Monitore reação dos clientes a mudanças de preço.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
