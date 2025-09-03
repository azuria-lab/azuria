
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Calendar, TrendingDown, TrendingUp } from "lucide-react";

interface TrendData {
  date: string;
  price: number;
  demand: number;
  competition: number;
}

interface MarketTrendAnalysisProps {
  category: string;
  timeframe: '7d' | '30d' | '90d';
}

export default function MarketTrendAnalysis({ category, timeframe }: MarketTrendAnalysisProps) {
  // Dados simulados - em produção viriam de uma API real
  const generateTrendData = (): TrendData[] => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const data: TrendData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simular tendências realistas
      const basePrice = 100;
      const seasonalVariation = Math.sin((i / days) * Math.PI * 2) * 10;
      const randomVariation = (Math.random() - 0.5) * 20;
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        price: basePrice + seasonalVariation + randomVariation,
        demand: 50 + Math.sin((i / days) * Math.PI * 4) * 30 + Math.random() * 20,
        competition: 70 + Math.random() * 30
      });
    }
    
    return data;
  };

  const trendData = generateTrendData();
  
  // Calcular tendências
  const priceChange = trendData.length > 1 ? 
    ((trendData[trendData.length - 1].price - trendData[0].price) / trendData[0].price) * 100 : 0;
  
  const demandChange = trendData.length > 1 ? 
    ((trendData[trendData.length - 1].demand - trendData[0].demand) / trendData[0].demand) * 100 : 0;

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 3 meses';
      default: return 'Período selecionado';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Análise de Tendências - {category}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{getTimeframeLabel()}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Variação de Preço</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-700">
                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                  </span>
                  {priceChange > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Demanda</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-700">
                    {demandChange > 0 ? '+' : ''}{demandChange.toFixed(1)}%
                  </span>
                  {demandChange > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Status do Mercado</p>
                <div className="flex items-center gap-2">
                  <Badge variant={priceChange > 2 ? "default" : priceChange > -2 ? "secondary" : "destructive"}>
                    {priceChange > 2 ? "Aquecido" : priceChange > -2 ? "Estável" : "Resfriado"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Preços */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Evolução dos Preços</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(0)}`, 'Preço Médio']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#priceGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Demanda vs Competição */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Demanda vs Competição</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Demanda (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="competition" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Competição (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Automatizados */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2">💡 Insights Automáticos</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {priceChange > 5 && (
              <li>• Preços em alta acentuada - oportunidade para aumentar margens</li>
            )}
            {demandChange > 10 && (
              <li>• Demanda crescente detectada - considere aumentar produção</li>
            )}
            {priceChange < -5 && (
              <li>• Pressão deflacionária no mercado - foque em eficiência</li>
            )}
            {Math.abs(priceChange) < 2 && (
              <li>• Mercado estável - boa oportunidade para testes de preço</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
