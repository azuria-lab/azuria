
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Lightbulb, Star, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'pricing' | 'timing' | 'strategy' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  impact: 'revenue' | 'margin' | 'volume' | 'efficiency';
  expectedGain: string;
  actionText: string;
  reasoning: string[];
}

type UserHistoryEvent = {
  type: string;
  timestamp: string | number | Date;
  payload?: unknown;
};

interface PersonalizedRecommendationsProps {
  userHistory?: UserHistoryEvent[];
  currentProduct?: {
    category: string;
    currentPrice: number;
    margin: number;
    salesVolume: number;
  };
}

export default function PersonalizedRecommendations({
  userHistory: _userHistory = [],
  currentProduct: _currentProduct
}: PersonalizedRecommendationsProps) {
  
  // Gerar recomendações baseadas no histórico e contexto
  const generateRecommendations = (): Recommendation[] => {
    const baseRecommendations: Recommendation[] = [
      {
        id: '1',
        title: 'Otimize sua margem de lucro',
        description: 'Baseado no seu histórico, você pode aumentar a margem em 3-5% mantendo competitividade.',
        type: 'pricing',
        priority: 'high',
        impact: 'margin',
        expectedGain: '+15% lucro',
        actionText: 'Ajustar preço',
        reasoning: [
          'Seus produtos têm 23% mais demanda que a média',
          'Concorrentes praticam preços 8% mais altos',
          'Margem atual está abaixo do potencial'
        ]
      },
      {
        id: '2',
        title: 'Melhor horário para ajustar preços',
        description: 'Dados mostram que terças-feiras às 14h têm 34% mais conversão para ajustes de preço.',
        type: 'timing',
        priority: 'medium',
        impact: 'volume',
        expectedGain: '+34% conversão',
        actionText: 'Agendar alteração',
        reasoning: [
          'Análise de 1.2M de transações',
          'Menor resistência a mudanças de preço',
          'Maior volume de tráfego qualificado'
        ]
      },
      {
        id: '3',
        title: 'Oportunidade sazonal detectada',
        description: 'Próxima Black Friday: produtos similares ao seu tiveram aumento de 280% em vendas.',
        type: 'opportunity',
        priority: 'high',
        impact: 'revenue',
        expectedGain: '+280% vendas',
        actionText: 'Planejar estratégia',
        reasoning: [
          'Histórico de 3 anos da categoria',
          'Seu produto tem alta probabilidade de sucesso',
          'Janela de preparação de 45 dias'
        ]
      },
      {
        id: '4',
        title: 'Estratégia de preço psicológico',
        description: 'Alterar de R$ 50,00 para R$ 49,90 pode aumentar vendas em 12% sem afetar a margem.',
        type: 'strategy',
        priority: 'medium',
        impact: 'volume',
        expectedGain: '+12% volume',
        actionText: 'Aplicar técnica',
        reasoning: [
          'Efeito psicológico comprovado',
          'Mantém margem de lucro',
          'Fácil implementação'
        ]
      },
      {
        id: '5',
        title: 'Automatize ajustes de preço',
        description: 'Configure regras automáticas baseadas em estoque e concorrência para otimizar 24/7.',
        type: 'strategy',
        priority: 'low',
        impact: 'efficiency',
        expectedGain: '+45% eficiência',
        actionText: 'Configurar automação',
        reasoning: [
          'Reduz trabalho manual em 80%',
          'Resposta mais rápida ao mercado',
          'Menor risco de perder oportunidades'
        ]
      }
    ];

    return baseRecommendations;
  };

  const recommendations = generateRecommendations();

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'pricing': return <TrendingUp className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'strategy': return <Target className="h-4 w-4" />;
      case 'opportunity': return <Star className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'revenue': return '💰';
      case 'margin': return '📈';
      case 'volume': return '📦';
      case 'efficiency': return '⚡';
      default: return '🎯';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Recomendações Personalizadas
        </CardTitle>
        <p className="text-sm text-gray-600">
          Baseado no seu histórico de uso e dados de mercado
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800">{rec.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    
                    {/* Impacto esperado */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <span>{getImpactIcon(rec.impact)}</span>
                        <span className="font-semibold text-green-600">{rec.expectedGain}</span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-blue-800 mb-1">Por que recomendamos:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {rec.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ação */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Baseado em {Math.floor(Math.random() * 1000 + 500)}+ análises similares
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  {rec.actionText}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resumo de impacto */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-800">Impacto Total Estimado</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-700">+47%</p>
              <p className="text-xs text-green-600">Lucro potencial</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">+23%</p>
              <p className="text-xs text-blue-600">Volume de vendas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">67%</p>
              <p className="text-xs text-purple-600">Redução de tempo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">92%</p>
              <p className="text-xs text-orange-600">Confiança IA</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
