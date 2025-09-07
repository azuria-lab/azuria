
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer } from "recharts";
import { Calculator, CreditCard, Eye, Users } from "lucide-react";

// Dados mockados do funil de conversão
const funnelData = [
  { name: "Visitantes", value: 10000, percentage: 100, color: "#3b82f6" },
  { name: "Cadastrados", value: 2500, percentage: 25, color: "#22c55e" },
  { name: "Primeiro Cálculo", value: 1800, percentage: 18, color: "#f59e0b" },
  { name: "Usuários Ativos", value: 1200, percentage: 12, color: "#ef4444" },
  { name: "Trial PRO", value: 300, percentage: 3, color: "#8b5cf6" },
  { name: "Assinantes PRO", value: 126, percentage: 1.26, color: "#06b6d4" }
];

const conversionRates = [
  { from: "Visitantes", to: "Cadastrados", rate: 25, icon: Users },
  { from: "Cadastrados", to: "Primeiro Cálculo", rate: 72, icon: Calculator },
  { from: "Primeiro Cálculo", to: "Usuários Ativos", rate: 66.7, icon: Eye },
  { from: "Usuários Ativos", to: "Trial PRO", rate: 25, icon: CreditCard },
  { from: "Trial PRO", to: "Assinantes PRO", rate: 42, icon: CreditCard }
];

export default function ConversionFunnel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil Visual */}
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Jornada completa do usuário no Precifica+
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" stroke="none" />
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Taxas de Conversão */}
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Taxas de Conversão</CardTitle>
            <CardDescription>
              Percentual de conversão entre cada etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionRates.map((conversion, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <conversion.icon className="h-5 w-5 text-brand-600" />
                    <div>
                      <p className="font-medium">{conversion.from} → {conversion.to}</p>
                      <p className="text-sm text-muted-foreground">Taxa de conversão</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      conversion.rate >= 50 ? "text-green-600" :
                      conversion.rate >= 30 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {conversion.rate}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento do Funil */}
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>Detalhamento por Etapa</CardTitle>
          <CardDescription>
            Análise detalhada de cada ponto do funil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: step.color }}
                  />
                  <div>
                    <h4 className="font-semibold">{step.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {step.percentage}% do total inicial
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{step.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">usuários</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
