import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ChevronRight, 
  Lightbulb, 
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { AIInsight } from '@/types/businessMetrics';

interface AIInsightsWidgetProps {
  insights: AIInsight[];
  isPremium?: boolean;
}

export default function AIInsightsWidget({ insights, isPremium = false }: AIInsightsWidgetProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    const iconMap = {
      growth: TrendingUp,
      opportunity: Target,
      alert: AlertTriangle,
      recommendation: Lightbulb
    };
    return iconMap[type];
  };

  const getInsightColor = (type: AIInsight['type']) => {
    const colorMap = {
      growth: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300',
      opportunity: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      alert: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      recommendation: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
    };
    return colorMap[type];
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
        Alta confiança
      </Badge>;
    } else if (confidence >= 0.6) {
      return <Badge variant="secondary">Média confiança</Badge>;
    }
    return <Badge variant="outline">Baixa confiança</Badge>;
  };

  const displayInsights = isPremium ? insights : insights.slice(0, 2);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Insights da IA</CardTitle>
        </div>
        <CardDescription>Análises automáticas dos seus dados</CardDescription>
      </CardHeader>
      <CardContent>
        {displayInsights.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Colete mais dados para gerar insights personalizados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayInsights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.type);
              
              return (
                <div 
                  key={insight.id} 
                  className="p-3 rounded-lg border border-border/50 hover:border-border transition-all hover:shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-md ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-medium">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                    {getConfidenceBadge(insight.confidence)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(insight.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Ver detalhes
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {insights.length > 2 && !isPremium && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                +{insights.length - 2} insights disponíveis
              </p>
              <Button variant="outline" size="sm" className="h-6 text-xs">
                Ver todos
              </Button>
            </div>
          </div>
        )}

        <CardDescription className="mt-3 text-xs">
          Powered by IA • Atualizado automaticamente
        </CardDescription>
      </CardContent>
    </Card>
  );
}