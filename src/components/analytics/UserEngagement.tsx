
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calculator, Clock, Eye, MousePointer } from "lucide-react";

// Dados mockados de engajamento
const engagementData = [
  { day: "Dom", sessions: 156, duration: 8.5, calculations: 234, page_views: 892 },
  { day: "Seg", sessions: 298, duration: 12.3, calculations: 445, page_views: 1245 },
  { day: "Ter", sessions: 325, duration: 11.8, calculations: 523, page_views: 1356 },
  { day: "Qua", sessions: 312, duration: 13.2, calculations: 498, page_views: 1298 },
  { day: "Qui", sessions: 289, duration: 12.7, calculations: 467, page_views: 1189 },
  { day: "Sex", sessions: 267, duration: 10.9, calculations: 398, page_views: 1098 },
  { day: "Sáb", sessions: 198, duration: 9.2, calculations: 298, page_views: 956 }
];

const featureUsage = [
  { feature: "Calculadora Rápida", usage: 2856, percentage: 68 },
  { feature: "Calculadora PRO", usage: 892, percentage: 21 },
  { feature: "Histórico", usage: 567, percentage: 13 },
  { feature: "Análise Concorrência", usage: 234, percentage: 6 },
  { feature: "Exportar PDF", usage: 189, percentage: 4 },
  { feature: "Comparador Marketplaces", usage: 145, percentage: 3 }
];

export default function UserEngagement() {
  const avgSessionDuration = 11.4; // minutos
  const avgCalculationsPerSession = 2.3;
  const bounceRate = 24.5; // %
  const returnUserRate = 67.8; // %

  return (
    <div className="space-y-6">
      {/* KPIs de Engajamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Duração Média</p>
                <h3 className="text-2xl font-bold mt-1">{avgSessionDuration}min</h3>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>+8.3% vs. semana anterior</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cálculos/Sessão</p>
                <h3 className="text-2xl font-bold mt-1">{avgCalculationsPerSession}</h3>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <Calculator className="h-4 w-4 mr-1" />
                  <span>+12.5% vs. semana anterior</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Rejeição</p>
                <h3 className="text-2xl font-bold mt-1">{bounceRate}%</h3>
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <MousePointer className="h-4 w-4 mr-1" />
                  <span>-2.1% vs. semana anterior</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                <MousePointer className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Recorrentes</p>
                <h3 className="text-2xl font-bold mt-1">{returnUserRate}%</h3>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>+5.7% vs. semana anterior</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Engajamento por Dia */}
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>Engajamento por Dia da Semana</CardTitle>
          <CardDescription>
            Padrões de uso e engajamento ao longo da semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  name="Sessões" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="calculations" 
                  name="Cálculos" 
                  stackId="2" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Uso de Funcionalidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Uso de Funcionalidades</CardTitle>
            <CardDescription>
              Funcionalidades mais utilizadas pelos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Detalhamento de Features</CardTitle>
            <CardDescription>
              Estatísticas detalhadas de uso por funcionalidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureUsage.map((feature) => (
                <div key={feature.feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{feature.feature}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.usage.toLocaleString()} usos este mês
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-600">{feature.percentage}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-brand-600 h-2 rounded-full transition-all" 
                        style={{ width: `${feature.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>Insights de Engajamento</CardTitle>
          <CardDescription>
            Análises e recomendações baseadas nos dados de uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🎯 Alto Engajamento</h4>
              <p className="text-sm text-green-700">
                Duração média de sessão de 11.4min indica alta qualidade do produto. Usuários estão encontrando valor.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📊 Oportunidade PRO</h4>
              <p className="text-sm text-blue-700">
                68% dos usuários usam apenas calculadora rápida. Campanhas direcionadas podem aumentar uso PRO.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🔄 Fidelização</h4>
              <p className="text-sm text-purple-700">
                67.8% de usuários recorrentes é excelente. Foco em novos recursos pode aumentar ainda mais.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">⏰ Padrão de Uso</h4>
              <p className="text-sm text-amber-700">
                Pico de uso entre terça e quinta. Considere campanhas especiais nesses dias.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
