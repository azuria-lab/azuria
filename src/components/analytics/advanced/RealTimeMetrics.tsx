
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { RealTimeAnalytics } from "@/shared/hooks/useRealTimeAnalytics";
import type { TrendItem } from "@/shared/hooks/useBusinessMetrics";

interface RealTimeMetricsProps {
  analytics: RealTimeAnalytics;
  trends: TrendItem[];
  isLoading: boolean;
}

export default function RealTimeMetrics({ analytics, trends: _trends, isLoading }: RealTimeMetricsProps) {
  // Generate mock real-time data for charts
  const realtimeData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    users: Math.floor(Math.random() * 100) + 20,
    calculations: Math.floor(Math.random() * 200) + 50,
    conversions: Math.floor(Math.random() * 10) + 2
  }));

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      users: Math.floor(Math.random() * 500) + 100,
      sessions: Math.floor(Math.random() * 800) + 200,
      pageviews: Math.floor(Math.random() * 2000) + 500
    };
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Online */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Usuários Online
              </CardTitle>
              <p className="text-sm text-gray-600">Últimas 24 horas</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <Activity className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{analytics.dailyActiveUsers}</p>
                <p className="text-sm text-gray-600">usuários ativos agora</p>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+{analytics.userGrowth.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculations Real-time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Cálculos em Tempo Real
            </CardTitle>
            <p className="text-sm text-gray-600">Atividade por hora</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="calculations" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{analytics.calculationsToday}</p>
                <p className="text-sm text-gray-600">cálculos hoje</p>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Semanal</CardTitle>
          <p className="text-sm text-gray-600">Comparação de usuários, sessões e visualizações</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Usuários"
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Sessões"
                />
                <Line 
                  type="monotone" 
                  dataKey="pageviews" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Visualizações"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+0.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Margem Média</p>
                <p className="text-2xl font-bold">{analytics.avgMarginToday.toFixed(1)}%</p>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+2.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Churn</p>
                <p className="text-2xl font-bold">{analytics.churnRate.toFixed(1)}%</p>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">-0.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
