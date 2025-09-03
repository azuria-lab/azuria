
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Package, Star, TrendingDown, TrendingUp, Users } from "lucide-react";

interface MarketInsight {
  type: 'trend' | 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  value?: string;
  impact: 'high' | 'medium' | 'low';
}

export default function MarketplaceInsights() {
  const insights: MarketInsight[] = [
    {
      type: 'trend',
      title: 'Demanda Crescente',
      description: 'Eletrônicos apresentam 15% de aumento na busca este mês',
      value: '+15%',
      impact: 'high'
    },
    {
      type: 'opportunity',
      title: 'Oportunidade de Nicho',
      description: 'Poucos vendedores na categoria "Casa Inteligente"',
      value: '8 vendedores',
      impact: 'medium'
    },
    {
      type: 'warning',
      title: 'Competição Intensa',
      description: 'Smartphones: 145 vendedores ativos com preços similares',
      value: '145 concorrentes',
      impact: 'high'
    },
    {
      type: 'info',
      title: 'Sazonalidade',
      description: 'Black Friday se aproxima - prepare estratégia de preços',
      impact: 'medium'
    }
  ];

  const marketStats = [
    {
      icon: <Package className="h-5 w-5 text-blue-600" />,
      label: "Produtos Monitorados",
      value: "12,547",
      change: "+8%"
    },
    {
      icon: <Users className="h-5 w-5 text-green-600" />,
      label: "Vendedores Ativos",
      value: "2,108",
      change: "+12%"
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      label: "Avaliação Média",
      value: "4.3",
      change: "+0.2"
    },
    {
      icon: <Activity className="h-5 w-5 text-purple-600" />,
      label: "Atualizações/dia",
      value: "50,2k",
      change: "+5%"
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'opportunity': return <Star className="h-4 w-4 text-blue-600" />;
      case 'warning': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'border-green-200 bg-green-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas do Mercado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {marketStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-600">{stat.icon}</div>
                <Badge variant="outline" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Insights de Mercado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <div className="flex items-center gap-2">
                      {insight.value && (
                        <span className="text-sm font-bold">{insight.value}</span>
                      )}
                      <Badge variant={getImpactBadge(insight.impact)} className="text-xs">
                        {insight.impact === 'high' ? 'Alto' : 
                         insight.impact === 'medium' ? 'Médio' : 'Baixo'} Impacto
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
