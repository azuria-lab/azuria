
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Target, TrendingUp, Users } from "lucide-react";

interface BusinessMetricsProps {
  businessMetrics: any;
  cohortData: any[];
  isLoading: boolean;
}

export default function BusinessMetrics({ businessMetrics, cohortData, isLoading }: BusinessMetricsProps) {
  if (isLoading || !businessMetrics) {
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

  const funnelData = [
    { stage: 'Visitantes', value: businessMetrics.conversionFunnel.visitors, color: '#3B82F6' },
    { stage: 'Cadastros', value: businessMetrics.conversionFunnel.signups, color: '#10B981' },
    { stage: 'Trials', value: businessMetrics.conversionFunnel.trials, color: '#F59E0B' },
    { stage: 'Conversões', value: businessMetrics.conversionFunnel.conversions, color: '#EF4444' }
  ];

  const revenueData = cohortData.map(item => ({
    ...item,
    mrr: businessMetrics.mrr * (Math.random() * 0.3 + 0.85) // Simulate MRR variation
  }));

  return (
    <div className="space-y-6">
      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MRR</p>
                <p className="text-2xl font-bold">R$ {(businessMetrics.mrr / 1000).toFixed(1)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+{businessMetrics.growthRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CAC</p>
                <p className="text-2xl font-bold">R$ {businessMetrics.cac}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">LTV/CAC: {(businessMetrics.ltv / businessMetrics.cac).toFixed(1)}x</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">LTV</p>
                <p className="text-2xl font-bold">R$ {businessMetrics.ltv}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">ARPU: R$ {businessMetrics.arpu}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold">{businessMetrics.churnRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">-0.8% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel & Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <p className="text-sm text-gray-600">Jornada do usuário até a conversão</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Taxa de Conversão:</span>
                <span className="font-semibold ml-1">
                  {((businessMetrics.conversionFunnel.conversions / businessMetrics.conversionFunnel.visitors) * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Trial → Paid:</span>
                <span className="font-semibold ml-1">
                  {((businessMetrics.conversionFunnel.conversions / businessMetrics.conversionFunnel.trials) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
            <p className="text-sm text-gray-600">MRR por cohort nos últimos meses</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10B981" name="Receita" />
                  <Bar dataKey="mrr" fill="#3B82F6" name="MRR" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Cohort</CardTitle>
          <p className="text-sm text-gray-600">Retenção de usuários por período de cadastro</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newUsers" fill="#3B82F6" name="Novos Usuários" />
                <Bar dataKey="retainedUsers" fill="#10B981" name="Usuários Retidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {cohortData.reduce((sum, item) => sum + item.newUsers, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Novos Usuários</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {cohortData.reduce((sum, item) => sum + item.retainedUsers, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Retidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {(cohortData.reduce((sum, item) => sum + item.retentionRate, 0) / cohortData.length).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Retenção Média</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
