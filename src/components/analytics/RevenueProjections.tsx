
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, RefreshCw, TrendingUp } from "lucide-react";

export default function RevenueProjections() {

  // Dados de projeção de receita
  const revenueData = [
    { month: 'Jan', atual: 4200, projetado: 4800, otimizado: 5200 },
    { month: 'Fev', atual: 4100, projetado: 4900, otimizado: 5400 },
    { month: 'Mar', atual: 4600, projetado: 5200, otimizado: 5800 },
    { month: 'Abr', atual: 4800, projetado: 5400, otimizado: 6100 },
    { month: 'Mai', atual: 5200, projetado: 5800, otimizado: 6500 },
    { month: 'Jun', atual: 5400, projetado: 6100, otimizado: 6900 }
  ];

  // Dados de margem por categoria
  const marginData = [
    { categoria: 'Eletrônicos', margem: 22.5, vendas: 145, potencial: 28.2 },
    { categoria: 'Roupas', margem: 35.8, vendas: 89, potencial: 41.2 },
    { categoria: 'Casa', margem: 28.3, vendas: 67, potencial: 33.1 },
    { categoria: 'Livros', margem: 15.2, vendas: 234, potencial: 18.9 },
    { categoria: 'Esporte', margem: 31.7, vendas: 56, potencial: 37.4 }
  ];

  // Cenários de crescimento
  const growthScenarios = [
    {
      scenario: 'Conservador',
      growth: '+12%',
      revenue: 'R$ 64.8k',
      margin: '25.2%',
      color: 'bg-gray-100 text-gray-600'
    },
    {
      scenario: 'Realista',
      growth: '+28%',
      revenue: 'R$ 74.2k',
      margin: '29.8%',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      scenario: 'Otimista',
      growth: '+45%',
      revenue: 'R$ 84.1k',
      margin: '34.5%',
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Projeções de Receita</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Próximos 6 meses
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="projections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
          <TabsTrigger value="margins">Margem por Categoria</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
        </TabsList>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Projeção de Receita vs. Receita Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOtimizado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="atual" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorAtual)"
                      name="Receita Atual"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="projetado" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorProjetado)"
                      name="Projeção Base"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="otimizado" 
                      stroke="#F59E0B" 
                      fillOpacity={1} 
                      fill="url(#colorOtimizado)"
                      name="Com Otimização IA"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Margem por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marginData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'vendas' ? `${value} vendas` : `${value}%`, 
                        name === 'margem' ? 'Margem Atual' : 
                        name === 'potencial' ? 'Potencial' : 'Vendas'
                      ]}
                    />
                    <Bar dataKey="margem" fill="#3B82F6" name="margem" />
                    <Bar dataKey="potencial" fill="#10B981" name="potencial" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {growthScenarios.map((scenario, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{scenario.scenario}</h3>
                      <Badge className={scenario.color}>
                        {scenario.growth}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Receita Projetada</p>
                        <p className="text-xl font-bold">{scenario.revenue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Margem Média</p>
                        <p className="text-lg font-semibold text-green-600">{scenario.margin}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
