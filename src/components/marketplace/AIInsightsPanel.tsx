/**
 * AI Insights Panel
 * 
 * Painel de inteligência artificial com recomendações e análises preditivas
 */

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Brain,
  CheckCircle,
  ChevronRight,
  Flame,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { aiInsightsService } from '@/services/ai-insights.service';
import type { AIInsightsReport, PriceRecommendation, SalesOpportunity } from '@/types/ai-insights';

// Helper functions
function getPeriodLabel(period: string): string {
  if (period === '7d') {
    return '7 dias';
  }
  if (period === '30d') {
    return '30 dias';
  }
  return '90 dias';
}

function getTrendBadgeVariant(trend: string): BadgeProps['variant'] {
  if (trend === 'increasing') {
    return 'default';
  }
  if (trend === 'decreasing') {
    return 'destructive';
  }
  return 'secondary';
}

function getTrendLabel(trend: string): string {
  if (trend === 'increasing') {
    return '↗️ Crescente';
  }
  if (trend === 'decreasing') {
    return '↘️ Decrescente';
  }
  return '→ Estável';
}

function getPriorityLabel(priority: string): string {
  if (priority === 'critical') {
    return 'Crítico';
  }
  if (priority === 'high') {
    return 'Alto';
  }
  if (priority === 'medium') {
    return 'Médio';
  }
  return 'Baixo';
}

function getRiskLabel(risk: string): string {
  if (risk === 'low') {
    return 'Baixo';
  }
  if (risk === 'medium') {
    return 'Médio';
  }
  return 'Alto';
}

interface AIInsightsPanelProps {
  marketplaceId: string;
  onApplyRecommendation?: (productId: string, newPrice: number) => void;
}

export default function AIInsightsPanel({ 
  marketplaceId, 
  onApplyRecommendation 
}: Readonly<AIInsightsPanelProps>) {
  const [report, setReport] = useState<AIInsightsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('opportunities');

  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      const data = await aiInsightsService.generateInsightsReport(marketplaceId);
      setReport(data);
    } catch (_error) {
      // Error handling - in production, log to monitoring service
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [marketplaceId]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_optimization':
        return <TrendingUp className="h-4 w-4" />;
      case 'stock_alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'trend_detected':
        return <Flame className="h-4 w-4" />;
      case 'competitor_gap':
        return <Lightbulb className="h-4 w-4" />;
      case 'seasonal_boost':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };



  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-12 w-12 text-brand-600 mb-4" />
          </motion.div>
          <p className="text-lg font-semibold">Analisando dados com IA...</p>
          <p className="text-sm text-gray-600 mt-2">Gerando recomendações inteligentes</p>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar os insights de IA. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Oportunidades Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-brand-600">
                {report.summary.totalOpportunities}
              </span>
              <Lightbulb className="h-8 w-8 text-brand-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0
                }).format(report.summary.potentialRevenue)}
              </span>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Confiança Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-purple-600">
                {Math.round(report.summary.avgConfidence * 100)}%
              </span>
              <Brain className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Recomendação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <span className="text-sm font-medium text-amber-900 line-clamp-2">
                {report.summary.topRecommendation}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs de conteúdo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-600" />
                Insights de Inteligência Artificial
              </CardTitle>
              <CardDescription>
                Análises preditivas e recomendações baseadas em machine learning
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadInsights}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="opportunities">
                Oportunidades ({report.opportunities.length})
              </TabsTrigger>
              <TabsTrigger value="pricing">
                Precificação ({report.priceRecommendations.length})
              </TabsTrigger>
              <TabsTrigger value="predictions">
                Previsões
              </TabsTrigger>
            </TabsList>

            {/* Oportunidades */}
            <TabsContent value="opportunities" className="space-y-4">
              <AnimatePresence mode="popLayout">
                {report.opportunities.map((opportunity, index) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    index={index}
                    getPriorityColor={getPriorityColor}
                    getTypeIcon={getTypeIcon}
                  />
                ))}
              </AnimatePresence>
            </TabsContent>

            {/* Precificação */}
            <TabsContent value="pricing" className="space-y-4">
              <AnimatePresence mode="popLayout">
                {report.priceRecommendations.map((recommendation, index) => (
                  <PriceRecommendationCard
                    key={recommendation.productId}
                    recommendation={recommendation}
                    index={index}
                    getRiskColor={getRiskColor}
                    onApply={onApplyRecommendation}
                  />
                ))}
              </AnimatePresence>
            </TabsContent>

            {/* Previsões */}
            <TabsContent value="predictions" className="space-y-4">
              {report.predictions.map((prediction) => (
                <Card key={prediction.productId} className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">{prediction.productName}</CardTitle>
                    <CardDescription>
                      Previsão para os próximos {prediction.period === '7d' ? '7 dias' : prediction.period === '30d' ? '30 dias' : '90 dias'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant={prediction.trend === 'increasing' ? 'default' : prediction.trend === 'decreasing' ? 'destructive' : 'secondary'}>
                        {prediction.trend === 'increasing' ? '↗️ Crescente' : prediction.trend === 'decreasing' ? '↘️ Decrescente' : '→ Estável'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Acurácia: {Math.round(prediction.accuracy * 100)}%
                      </span>
                      {prediction.seasonality.detected && (
                        <Badge variant="outline">
                          📅 Sazonalidade detectada
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Próximos 7 dias: ~{prediction.predictions.slice(0, 7).reduce((sum, p) => sum + p.predictedSales, 0)} vendas</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function OpportunityCard({ 
  opportunity, 
  index,
  getPriorityColor,
  getTypeIcon 
}: {
  opportunity: SalesOpportunity;
  index: number;
  getPriorityColor: (priority: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-lg", getPriorityColor(opportunity.priority))}>
              {getTypeIcon(opportunity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{opportunity.title}</h3>
                  <p className="text-sm text-gray-600">{opportunity.description}</p>
                </div>
                <Badge className={getPriorityColor(opportunity.priority)}>
                  {opportunity.priority === 'critical' ? 'Crítico' : 
                   opportunity.priority === 'high' ? 'Alto' :
                   opportunity.priority === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm mt-3">
                {opportunity.metrics.potentialRevenue && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    {opportunity.metrics.potentialRevenue > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(Math.abs(opportunity.metrics.potentialRevenue))}
                  </span>
                )}
                {opportunity.metrics.estimatedImpact && (
                  <span className="text-gray-600">
                    Impacto: {opportunity.metrics.estimatedImpact > 0 ? '+' : ''}{opportunity.metrics.estimatedImpact}%
                  </span>
                )}
                {opportunity.metrics.timeframe && (
                  <span className="text-gray-600">
                    ⏱️ {opportunity.metrics.timeframe}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t space-y-3"
                  >
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Ações Recomendadas:
                      </h4>
                      <ul className="space-y-1">
                        {opportunity.action.instructions.map((instruction, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-600" />
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {opportunity.action.automatable && (
                      <Button className="w-full">
                        Aplicar Automaticamente
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PriceRecommendationCard({
  recommendation,
  index,
  getRiskColor,
  onApply
}: {
  recommendation: PriceRecommendation;
  index: number;
  getRiskColor: (risk: string) => string;
  onApply?: (productId: string, newPrice: number) => void;
}) {
  const isPriceIncrease = recommendation.priceChange > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{recommendation.productName}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{recommendation.marketData.competitorCount} concorrentes</span>
                  <span>•</span>
                  <span>Confiança: {Math.round(recommendation.confidence * 100)}%</span>
                </div>
              </div>
              <Badge className={cn(getRiskColor(recommendation.impact.riskLevel), "border")}>
                Risco {recommendation.impact.riskLevel === 'low' ? 'Baixo' : recommendation.impact.riskLevel === 'medium' ? 'Médio' : 'Alto'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Preço Atual</p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(recommendation.currentPrice)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Preço Recomendado</p>
                <p className="text-xl font-bold text-brand-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(recommendation.recommendedPrice)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
              {isPriceIncrease ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <span className={cn("font-semibold", isPriceIncrease ? "text-green-600" : "text-red-600")}>
                {isPriceIncrease ? '+' : ''}{recommendation.priceChangePercent.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-600">
                ({isPriceIncrease ? '+' : ''}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(recommendation.priceChange)})
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Aumento esperado em vendas</span>
                <span className="font-semibold text-green-600">+{recommendation.impact.expectedSalesIncrease.toFixed(1)}%</span>
              </div>
              <Progress value={recommendation.impact.expectedSalesIncrease} className="h-2" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-700">Análise:</p>
              <ul className="space-y-1">
                {recommendation.reasoning.map((reason, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-brand-600 mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              className="w-full"
              onClick={() => onApply?.(recommendation.productId, recommendation.recommendedPrice)}
            >
              Aplicar Recomendação
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
