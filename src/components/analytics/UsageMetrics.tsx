
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calculator, CreditCard, Loader2, TrendingUp, Users } from "lucide-react";
import { useAnalytics, useRevenueAnalytics } from "@/hooks/useAnalytics";

export default function UsageMetrics() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: revenue, isLoading: revenueLoading } = useRevenueAnalytics();

  if (analyticsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const kpis = [
    {
      title: "Usuários Ativos",
      value: analytics?.totalUsers.toLocaleString() || "0",
      change: "+12.3%",
      trend: "up",
      icon: Users,
      color: "blue"
    },
    {
  title: "Total de Cálculos",
      value: analytics?.totalCalculations.toLocaleString() || "0",
      change: "+8.7%",
      trend: "up",
      icon: Calculator,
      color: "green"
    },
    {
      title: "Taxa Conversão PRO",
  value: analytics ? `${analytics.conversionRate.toFixed(1)}%` : "0%",
      change: "+0.8%",
      trend: "up",
      icon: CreditCard,
      color: "purple"
    },
    {
      title: "Receita Mensal",
  value: revenue ? `R$ ${revenue.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00",
      change: "+15.2%",
      trend: "up",
      icon: TrendingUp,
      color: "amber"
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-brand-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{kpi.change} vs. mês anterior</span>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-full bg-${kpi.color}-50 flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 text-${kpi.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos de Uso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Uso Diário da Plataforma</CardTitle>
            <CardDescription>
              Cálculos realizados e usuários ativos por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calculations" 
                    name="Cálculos" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Usuários Ativos" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Upgrades PRO</CardTitle>
            <CardDescription>
              Conversões para plano PRO por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="proUpgrades" name="Upgrades PRO" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Mais Populares */}
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>Templates Mais Baixados</CardTitle>
          <CardDescription>
            Top 5 templates mais populares do mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.topTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{template.downloads}</p>
                  <p className="text-sm text-muted-foreground">downloads</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
