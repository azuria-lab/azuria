
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, PlayCircle, Target, TrendingUp } from "lucide-react";

interface ScenarioSimulationPanelProps {
  batches: any[];
  setBatches: (batches: any[]) => void;
  isPro: boolean;
}

export default function ScenarioSimulationPanel({ batches, setBatches, isPro }: ScenarioSimulationPanelProps) {
  const [selectedScenario, setSelectedScenario] = useState("market_penetration");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const scenarios = [
    { 
      id: "market_penetration", 
      name: "Penetração de Mercado", 
      description: "Preços agressivos para ganhar market share rapidamente" 
    },
    { 
      id: "premium_positioning", 
      name: "Posicionamento Premium", 
      description: "Preços altos com foco em margem e qualidade percebida" 
    },
    { 
      id: "competitive_parity", 
      name: "Paridade Competitiva", 
      description: "Preços alinhados com principais concorrentes" 
    },
    { 
      id: "seasonal_optimization", 
      name: "Otimização Sazonal", 
      description: "Ajustes baseados em sazonalidade e demanda" 
    }
  ];

  const runScenarioSimulation = async () => {
    setIsSimulating(true);
    
    // Simular análise de cenários
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      scenario: selectedScenario,
      projections: {
        revenue: [
          { month: "Mês 1", atual: 12000, projetado: 15000 },
          { month: "Mês 2", atual: 12500, projetado: 16200 },
          { month: "Mês 3", atual: 13000, projetado: 17500 },
          { month: "Mês 4", atual: 13200, projetado: 18800 },
          { month: "Mês 5", atual: 13500, projetado: 20100 },
          { month: "Mês 6", atual: 14000, projetado: 21500 }
        ],
        marketShare: [
          { segment: "Pequenos Lotes", atual: 15, projetado: 22 },
          { segment: "Lotes Médios", atual: 12, projetado: 18 },
          { segment: "Grandes Lotes", atual: 8, projetado: 14 }
        ],
        risks: [
          { factor: "Reação Concorrência", probability: 65, impact: "medium" },
          { factor: "Mudança Demanda", probability: 40, impact: "low" },
          { factor: "Pressão Margem", probability: 55, impact: "high" }
        ]
      },
      recommendations: [
        {
          action: "Implementar preços escalonados por volume",
          impact: "Aumento de 23% na receita",
          priority: "high"
        },
        {
          action: "Monitorar resposta da concorrência",
          impact: "Mitigação de riscos competitivos",
          priority: "medium"
        },
        {
          action: "Ajustar margem para lotes grandes",
          impact: "Melhoria de 15% na competitividade",
          priority: "high"
        }
      ]
    };

    setSimulationResults(mockResults);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-orange-600" />
            Simulação de Cenários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Selecionar Cenário:</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={runScenarioSimulation}
                disabled={isSimulating || !isPro}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isSimulating ? "Simulando..." : "Executar Simulação"}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-700">
              {scenarios.find(s => s.id === selectedScenario)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {simulationResults && (
        <>
          {/* Projeções de Receita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Projeção de Receita - {scenarios.find(s => s.id === selectedScenario)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationResults.projections.revenue}>
                    <defs>
                      <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="atual" stroke="#3B82F6" fillOpacity={1} fill="url(#colorAtual)" name="Receita Atual" />
                    <Area type="monotone" dataKey="projetado" stroke="#10B981" fillOpacity={1} fill="url(#colorProjetado)" name="Projeção Cenário" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Share por Segmento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Impacto no Market Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simulationResults.projections.marketShare}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="atual" fill="#94A3B8" name="Market Share Atual (%)" />
                    <Bar dataKey="projetado" fill="#10B981" name="Market Share Projetado (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Riscos */}
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
            <CardHeader>
              <CardTitle>Análise de Riscos do Cenário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {simulationResults.projections.risks.map((risk: any, index: number) => (
                <div key={index} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{risk.factor}</h4>
                    <Badge className={
                      risk.impact === 'high' ? 'bg-red-600' :
                      risk.impact === 'medium' ? 'bg-orange-600' : 'bg-yellow-600'
                    }>
                      {risk.impact === 'high' ? 'Alto Impacto' :
                       risk.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Probabilidade:</span>
                      <span>{risk.probability}%</span>
                    </div>
                    <Progress value={risk.probability} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recomendações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {simulationResults.recommendations.map((rec: any, index: number) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={
                      rec.priority === 'high' ? 'bg-red-600' : 'bg-blue-600'
                    }>
                      {rec.priority === 'high' ? 'Alta Prioridade' : 'Média Prioridade'}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-1">{rec.action}</h4>
                  <p className="text-sm text-gray-600">{rec.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
