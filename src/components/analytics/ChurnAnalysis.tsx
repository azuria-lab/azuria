
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Calendar, TrendingDown, Users } from "lucide-react";

// Dados mockados para análise de churn
const churnTrend = [
  { month: "Jul", churn_rate: 8.5, retained: 91.5, new_users: 45 },
  { month: "Ago", churn_rate: 7.2, retained: 92.8, new_users: 52 },
  { month: "Set", churn_rate: 6.8, retained: 93.2, new_users: 48 },
  { month: "Out", churn_rate: 5.9, retained: 94.1, new_users: 61 },
  { month: "Nov", churn_rate: 4.2, retained: 95.8, new_users: 58 },
  { month: "Dez", churn_rate: 3.8, retained: 96.2, new_users: 67 }
];

const churnReasons = [
  { reason: "Preço muito alto", value: 35, color: "#ef4444" },
  { reason: "Falta de funcionalidades", value: 28, color: "#f59e0b" },
  { reason: "Interface complexa", value: 18, color: "#8b5cf6" },
  { reason: "Concorrência", value: 12, color: "#06b6d4" },
  { reason: "Outros", value: 7, color: "#6b7280" }
];

const cohortRetention = [
  { cohort: "Nov 2024", month_1: 100, month_2: 85, month_3: 72, month_4: 68 },
  { cohort: "Out 2024", month_1: 100, month_2: 88, month_3: 75, month_4: 71 },
  { cohort: "Set 2024", month_1: 100, month_2: 82, month_3: 69, month_4: 65 },
  { cohort: "Ago 2024", month_1: 100, month_2: 79, month_3: 66, month_4: 62 }
];

export default function ChurnAnalysis() {
  const currentChurnRate = 3.8;
  const churnTrend30d = -1.1; // redução de 1.1%

  return (
    <div className="space-y-6">
      {/* KPIs de Churn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Churn</p>
                <h3 className="text-2xl font-bold mt-1">{currentChurnRate}%</h3>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>{churnTrend30d}% vs. mês anterior</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retenção</p>
                <h3 className="text-2xl font-bold mt-1">96.2%</h3>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>+1.1% vs. mês anterior</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churned Users</p>
                <h3 className="text-2xl font-bold mt-1">47</h3>
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Este mês</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV Médio</p>
                <h3 className="text-2xl font-bold mt-1">R$ 287</h3>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>+12% vs. mês anterior</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Churn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Tendência de Churn</CardTitle>
            <CardDescription>
              Evolução da taxa de churn nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={churnTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="churn_rate" 
                    name="Taxa de Churn %" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="retained" 
                    name="Taxa de Retenção %" 
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
            <CardTitle>Motivos do Churn</CardTitle>
            <CardDescription>
              Principais razões para cancelamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={churnReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ reason, value }) => `${reason}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {churnReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Cohort */}
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>Análise de Cohort - Retenção</CardTitle>
          <CardDescription>
            Taxa de retenção por cohort ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohortRetention}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Legend />
                <Line type="monotone" dataKey="month_1" name="Mês 1" stroke="#3b82f6" />
                <Line type="monotone" dataKey="month_2" name="Mês 2" stroke="#22c55e" />
                <Line type="monotone" dataKey="month_3" name="Mês 3" stroke="#f59e0b" />
                <Line type="monotone" dataKey="month_4" name="Mês 4" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>Ações Recomendadas</CardTitle>
          <CardDescription>
            Sugestões para reduzir churn baseadas nos dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">🚨 Alta Prioridade</h4>
              <p className="text-sm text-red-700">
                35% dos churns são por preço alto. Considere criar um plano intermediário ou oferecer desconto por volume.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ Média Prioridade</h4>
              <p className="text-sm text-amber-700">
                28% citam falta de funcionalidades. Acelerar roadmap de features PRO pode ajudar.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Oportunidade</h4>
              <p className="text-sm text-blue-700">
                Interface complexa (18%). Investir em UX/UI pode melhorar retenção significativamente.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">✅ Ponto Forte</h4>
              <p className="text-sm text-green-700">
                Taxa de churn em queda constante. Estratégia atual está funcionando bem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
