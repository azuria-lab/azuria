
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Target, TrendingUp, Zap } from "lucide-react";

interface CompetitiveAnalysisPanelProps {
  batches: any[];
  category: string;
  isPro: boolean;
}

export default function CompetitiveAnalysisPanel({ batches, category, isPro }: CompetitiveAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [competitiveData, setCompetitiveData] = useState<any>(null);

  const runCompetitiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simular análise competitiva
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockData = {
      competitors: [
        { name: "Líder do Mercado", avgPrice: 142.90, marketShare: 35, strength: 95 },
        { name: "Concorrente A", avgPrice: 138.50, marketShare: 22, strength: 78 },
        { name: "Concorrente B", avgPrice: 145.20, marketShare: 18, strength: 82 },
        { name: "Novos Entrantes", avgPrice: 129.90, marketShare: 12, strength: 65 }
      ],
      priceEvolution: [
        { month: "Jan", nossa: 135, mercado: 140, oportunidade: 5 },
        { month: "Fev", nossa: 138, mercado: 142, oportunidade: 4 },
        { month: "Mar", nossa: 140, mercado: 145, oportunidade: 5 },
        { month: "Abr", nossa: 142, mercado: 147, oportunidade: 5 },
        { month: "Mai", nossa: 145, mercado: 150, oportunidade: 5 },
        { month: "Jun", nossa: 148, mercado: 152, oportunidade: 4 }
      ],
      threats: [
        {
          level: "high",
          description: "Concorrente principal reduziu preços em 8% no último mês",
          impact: "Possível perda de 15% do market share"
        },
        {
          level: "medium",
          description: "Novo player com preços 12% menores",
          impact: "Pressão em segmentos de volume médio"
        }
      ],
      opportunities: [
        {
          level: "high",
          description: "Líder aumentou preços acima da inflação",
          impact: "Oportunidade de ganhar 8% de market share"
        },
        {
          level: "medium",
          description: "Demanda sazonal crescendo 15%",
          impact: "Espaço para preços premium temporários"
        }
      ]
    };

    setCompetitiveData(mockData);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Análise Competitiva Inteligente
            </CardTitle>
            <Button
              onClick={runCompetitiveAnalysis}
              disabled={isAnalyzing || !isPro}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Analisar Concorrência
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {!competitiveData && (
          <CardContent>
            <p className="text-gray-600">
              Execute a análise competitiva para obter insights sobre posicionamento de preços,
              ameaças e oportunidades no mercado de {category}.
            </p>
          </CardContent>
        )}
      </Card>

      {competitiveData && (
        <>
          {/* Mapeamento Competitivo */}
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento Competitivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={competitiveData.competitors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgPrice" fill="#3B82F6" name="Preço Médio (R$)" />
                    <Bar dataKey="marketShare" fill="#10B981" name="Market Share (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {competitiveData.competitors.map((competitor: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{competitor.name}</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-600">Preço Médio:</span>
                        <p className="font-bold">R$ {competitor.avgPrice}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Market Share:</span>
                        <p className="font-bold">{competitor.marketShare}%</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Força:</span>
                        <Progress value={competitor.strength} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evolução de Preços */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Preços vs. Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={competitiveData.priceEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="nossa" stroke="#3B82F6" strokeWidth={3} name="Nossos Preços" />
                    <Line type="monotone" dataKey="mercado" stroke="#10B981" strokeWidth={2} name="Média do Mercado" />
                    <Line type="monotone" dataKey="oportunidade" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Gap de Oportunidade" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ameaças e Oportunidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Ameaças Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {competitiveData.threats.map((threat: any, index: number) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        threat.level === 'high' ? 'bg-red-600' : 'bg-orange-600'
                      }>
                        {threat.level === 'high' ? 'Alto Risco' : 'Médio Risco'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{threat.description}</p>
                    <p className="text-xs text-gray-600">{threat.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {competitiveData.opportunities.map((opp: any, index: number) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        opp.level === 'high' ? 'bg-green-600' : 'bg-blue-600'
                      }>
                        {opp.level === 'high' ? 'Alto Potencial' : 'Médio Potencial'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{opp.description}</p>
                    <p className="text-xs text-gray-600">{opp.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
