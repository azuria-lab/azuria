
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, CheckCircle, Lightbulb, Target, TrendingUp, X } from "lucide-react";
import { usePersonalizedRecommendations } from "@/hooks/usePersonalizedRecommendations";
import { PersonalizedRecommendation } from "@/types/ai";

interface PersonalizedRecommendationsProps {
  userContext?: {
    calculationsCount: number;
    avgMargin: number;
    preferredCategories: string[];
    recentActivity: string[];
    businessSize: 'small' | 'medium' | 'large';
  };
}

export default function PersonalizedRecommendations({ userContext }: PersonalizedRecommendationsProps) {
  const mockUserContext = userContext || {
    calculationsCount: 47,
    avgMargin: 32,
    preferredCategories: ['Eletrônicos', 'Casa e Jardim'],
    recentActivity: ['Cálculo de preço', 'Análise de concorrência'],
    businessSize: 'medium' as const
  };

  const { 
    recommendations, 
    isLoading, 
    dismissRecommendation, 
    markAsImplemented 
  } = usePersonalizedRecommendations(mockUserContext);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pricing': return <Target className="h-4 w-4" />;
      case 'strategy': return <TrendingUp className="h-4 w-4" />;
      case 'market': return <BarChart className="h-4 w-4" />;
      case 'optimization': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pricing': return 'bg-blue-100 text-blue-800';
      case 'strategy': return 'bg-purple-100 text-purple-800';
      case 'market': return 'bg-green-100 text-green-800';
      case 'optimization': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <div className="text-lg font-medium">Gerando recomendações personalizadas...</div>
            <div className="text-sm text-gray-600">
              Analisando seu perfil e histórico de uso
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Lightbulb className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recomendações Personalizadas</h1>
          <p className="text-gray-600">IA personalizada baseada no seu perfil e comportamento</p>
        </div>
      </div>

      {/* User Context Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">Seu Perfil de Negócio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockUserContext.calculationsCount}</div>
              <div className="text-sm text-gray-600">Cálculos realizados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockUserContext.avgMargin}%</div>
              <div className="text-sm text-gray-600">Margem média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mockUserContext.preferredCategories.length}</div>
              <div className="text-sm text-gray-600">Categorias ativas</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="capitalize">
                {mockUserContext.businessSize}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Porte do negócio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onDismiss={dismissRecommendation}
            onImplement={markAsImplemented}
            getCategoryIcon={getCategoryIcon}
            getPriorityColor={getPriorityColor}
            getCategoryColor={getCategoryColor}
          />
        ))}
      </div>

      {recommendations.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Todas as recomendações foram implementadas!
            </h3>
            <p className="text-gray-600">
              Continue usando o Precifica+ e receberá novas sugestões personalizadas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: PersonalizedRecommendation;
  onDismiss: (id: string) => void;
  onImplement: (id: string) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
}

function RecommendationCard({
  recommendation,
  onDismiss,
  onImplement,
  getCategoryIcon,
  getPriorityColor,
  getCategoryColor
}: RecommendationCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(recommendation.id)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {getCategoryIcon(recommendation.category)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getPriorityColor(recommendation.priority)}>
                {recommendation.priority}
              </Badge>
              <Badge className={getCategoryColor(recommendation.category)}>
                {recommendation.category}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              {recommendation.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {recommendation.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Impacto Potencial</span>
            <span className="text-sm font-bold text-green-600">
              {recommendation.impact}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${recommendation.impact}%` }}
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">
            Como implementar:
          </div>
          <div className="text-sm text-blue-800">
            {recommendation.implementation}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Baseado em:
          </div>
          <div className="flex flex-wrap gap-1">
            {recommendation.dataPoints.map((point, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {point}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onImplement(recommendation.id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Implementar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-4"
          >
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
