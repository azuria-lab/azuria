
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity, 
  Calculator, 
  Clock, 
  Crown,
  Star,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";

export default function EnhancedUsageMetrics() {
  const { realTimeMetrics } = useRealTimeMetrics();

  // Dados de engajamento do usuário
  const engagementData = [
    { day: 'Seg', calculations: 145, users: 89, avgTime: 12.3 },
    { day: 'Ter', calculations: 167, users: 102, avgTime: 14.1 },
    { day: 'Qua', calculations: 198, users: 123, avgTime: 13.7 },
    { day: 'Qui', calculations: 234, users: 145, avgTime: 15.2 },
    { day: 'Sex', calculations: 289, users: 167, avgTime: 16.8 },
    { day: 'Sab', calculations: 156, users: 98, avgTime: 11.4 },
    { day: 'Dom', calculations: 123, users: 76, avgTime: 9.7 }
  ];

  // Métricas de conversão PRO
  const conversionMetrics = [
    {
      metric: 'Taxa de Conversão PRO',
      value: '12.3%',
      change: +2.1,
      target: 15,
      current: 12.3,
      icon: Crown
    },
    {
      metric: 'Uso de Features PRO',
      value: '78%',
      change: +5.4,
      target: 85,
      current: 78,
      icon: Star
    },
    {
      metric: 'Retenção Semanal',
      value: '64%',
      change: +1.8,
      target: 70,
      current: 64,
      icon: Users
    },
    {
      metric: 'Tempo Médio de Sessão',
      value: '14.2 min',
      change: +0.7,
      target: 16,
      current: 14.2,
      icon: Clock
    }
  ];

  // Funcionalidades mais utilizadas
  const featureUsage = [
    { feature: 'Calculadora Simples', usage: 89, growth: +12 },
    { feature: 'Análise Competitiva', usage: 67, growth: +28 },
    { feature: 'IA Preços', usage: 45, growth: +156 },
    { feature: 'Marketplace', usage: 34, growth: +89 },
    { feature: 'Histórico', usage: 56, growth: +23 },
    { feature: 'Exportação', usage: 23, growth: +45 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Métricas de Uso e Engajamento</h2>
        <Badge variant="outline" className="text-xs">
          <Activity className="h-3 w-3 mr-1" />
          Tempo real
        </Badge>
      </div>

      {/* Métricas Principais em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-600">Live</Badge>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Usuários Ativos</p>
              <p className="text-2xl font-bold text-blue-800">{realTimeMetrics.activeUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calculator className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-600">Hoje</Badge>
            </div>
            <div>
              <p className="text-sm text-green-600 mb-1">Cálculos Realizados</p>
              <p className="text-2xl font-bold text-green-800">{realTimeMetrics.calculationsToday}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-purple-600" />
              <Badge className="bg-purple-600">Média</Badge>
            </div>
            <div>
              <p className="text-sm text-purple-600 mb-1">Margem Média</p>
              <p className="text-2xl font-bold text-purple-800">{realTimeMetrics.avgMarginToday}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <Badge className="bg-orange-600">Impacto</Badge>
            </div>
            <div>
              <p className="text-sm text-orange-600 mb-1">Revenue Impact</p>
              <p className="text-2xl font-bold text-orange-800">R$ {(realTimeMetrics.revenueToday / 1000).toFixed(1)}k</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Conversão PRO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Métricas de Conversão PRO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {conversionMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className={`text-sm font-medium ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">{metric.metric}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                  </div>

                  {metric.target && metric.current && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Meta: {metric.target}{metric.metric.includes('min') ? ' min' : '%'}</span>
                        <span>{((metric.current / metric.target) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={(metric.current / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engajamento Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="colorCalculations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="calculations" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorCalculations)"
                    name="Cálculos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Usuários"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Uso de Funcionalidades */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Mais Utilizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureUsage.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{feature.feature}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={feature.usage} className="flex-1 h-2" />
                      <span className="text-sm text-gray-600">{feature.usage}%</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-3 ${feature.growth > 50 ? 'text-green-600 border-green-200' : 'text-blue-600 border-blue-200'}`}
                  >
                    +{feature.growth}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
