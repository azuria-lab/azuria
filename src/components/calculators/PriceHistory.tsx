/**
 * Feature #7: Price History & Analytics Component
 * Visual interface for price history with trends and automated insights
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  BarChart3,
  History,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { generateSamplePriceHistory, INSIGHT_METADATA, type PriceEntry } from "@/types/priceHistory";
import { cn } from "@/lib/utils";

interface PriceHistoryProps {
  entries?: PriceEntry[]; // Se não fornecido, usa dados de exemplo
}

export default function PriceHistory({ entries: providedEntries }: PriceHistoryProps) {
  const { analyzePriceHistory, generateChartData, compareWithHistory } = usePriceHistory();
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePriceHistory> | null>(null);
  const [chartData, setChartData] = useState<ReturnType<typeof generateChartData>>([]);
  const [comparisons, setComparisons] = useState<ReturnType<typeof compareWithHistory>>([]);
  const [selectedView, setSelectedView] = useState<"overview" | "insights" | "recommendations">("overview");

  useEffect(() => {
    // Use provided entries or generate sample data only if no entries provided
    const dataEntries = providedEntries && providedEntries.length > 0 
      ? providedEntries 
      : generateSamplePriceHistory(30);
    setEntries(dataEntries);

    const analysisResult = analyzePriceHistory(dataEntries);
    setAnalysis(analysisResult);

    const chart = generateChartData(dataEntries);
    setChartData(chart);

    const comp = compareWithHistory(dataEntries);
    setComparisons(comp);
  }, [providedEntries, analyzePriceHistory, generateChartData, compareWithHistory]);

  if (!analysis) {
    return null;
  }

  // Mostrar mensagem se não há entradas reais (apenas dados de exemplo)
  const hasRealData = providedEntries && providedEntries.length > 0;

  const getTrendIcon = () => {
    if (analysis.trend.direction === 'up') { return <TrendingUp className="h-5 w-5 text-green-600" />; }
    if (analysis.trend.direction === 'down') { return <TrendingDown className="h-5 w-5 text-red-600" />; }
    return <Activity className="h-5 w-5 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (analysis.trend.direction === 'up') { return 'text-green-600'; }
    if (analysis.trend.direction === 'down') { return 'text-red-600'; }
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Banner quando não há dados reais */}
      {!hasRealData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <History className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">Histórico vazio - Dados de exemplo</p>
              <p className="text-xs text-blue-800 mt-1">
                Use o botão "Salvar no Histórico" na barra lateral após calcular preços para ver seus dados reais aqui.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Histórico & Analytics
          </h3>
          <p className="text-muted-foreground mt-1">
            Análise de tendências e insights automáticos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getTrendIcon()}
          <div>
            <p className="text-sm text-muted-foreground">Tendência</p>
            <p className={cn("text-lg font-bold", getTrendColor())}>
              {analysis.trend.direction === 'up' ? 'Alta' : analysis.trend.direction === 'down' ? 'Baixa' : 'Estável'}
              {' '}({analysis.trend.strength === 'strong' ? 'Forte' : analysis.trend.strength === 'moderate' ? 'Moderada' : 'Fraca'})
            </p>
          </div>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as typeof selectedView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Preço Atual</p>
                <p className="text-2xl font-bold">R$ {analysis.currentPrice.toFixed(2)}</p>
                <p className={cn(
                  "text-xs mt-1",
                  analysis.priceChangePercent > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {analysis.priceChangePercent > 0 ? '+' : ''}{analysis.priceChangePercent.toFixed(1)}% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Média Histórica</p>
                <p className="text-2xl font-bold">R$ {analysis.averagePrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado em {entries.length} registros
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Faixa de Preço</p>
                <p className="text-xl font-bold">
                  R$ {analysis.minPrice.toFixed(2)} - R$ {analysis.maxPrice.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Variação: R$ {analysis.priceRange.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Volatilidade</p>
                <Badge className={cn(
                  "text-base",
                  analysis.volatility === 'low' && "bg-green-100 text-green-700",
                  analysis.volatility === 'medium' && "bg-yellow-100 text-yellow-700",
                  analysis.volatility === 'high' && "bg-red-100 text-red-700"
                )}>
                  {analysis.volatility === 'low' ? 'Baixa' : analysis.volatility === 'medium' ? 'Média' : 'Alta'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Estabilidade de preços
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Simple Line Chart Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Preços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-1">
                {chartData.map((point, index) => {
                  const maxPrice = Math.max(...chartData.map(p => p.price));
                  const minPrice = Math.min(...chartData.map(p => p.price));
                  const range = maxPrice - minPrice;
                  const height = range > 0 ? ((point.price - minPrice) / range) * 100 : 50;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                        style={{ height: `${height}%` }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                            <p className="font-semibold">{point.date}</p>
                            <p>R$ {point.price.toFixed(2)}</p>
                            <p className="text-gray-300">Lucro: R$ {point.profit.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      {index % Math.ceil(chartData.length / 6) === 0 && (
                        <p className="text-xs text-muted-foreground rotate-45 mt-2">{point.date}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>R$ {Math.min(...chartData.map(p => p.price)).toFixed(2)}</span>
                <span>R$ {Math.max(...chartData.map(p => p.price)).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Comparisons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisons.map((comp, index) => (
              <motion.div
                key={comp.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">{comp.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">R$ {comp.currentValue.toFixed(2)}</p>
                      <Badge variant={comp.trend === 'better' ? 'default' : 'secondary'} className="text-xs">
                        {comp.changePercent > 0 ? '+' : ''}{comp.changePercent.toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      vs R$ {comp.historicalValue.toFixed(2)} (média)
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Insights automáticos baseados no seu histórico de preços
          </p>

          {analysis.insights.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Continue registrando preços para gerar insights automáticos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analysis.insights.map((insight, index) => {
                const metadata = INSIGHT_METADATA[insight.type];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn("border-2", metadata.borderColor)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{insight.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-lg">{insight.title}</h4>
                              {insight.severity === 'high' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Alta Prioridade
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{insight.message}</p>
                            
                            {insight.actionable && insight.suggestedAction && (
                              <div className={cn("p-3 rounded-lg", metadata.bgColor)}>
                                <p className={cn("text-sm font-semibold mb-1", metadata.textColor)}>
                                   Ação Sugerida:
                                </p>
                                <p className="text-sm">{insight.suggestedAction}</p>
                                {insight.impact && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Impacto: {insight.impact}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Recomendações de preço baseadas em análise histórica
          </p>

          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {rec.type === 'increase' && ' Aumentar Preço'}
                          {rec.type === 'decrease' && ' Reduzir Preço'}
                          {rec.type === 'maintain' && ' Manter Preço'}
                          {rec.type === 'test' && ' Testar Novo Preço'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>
                      </div>
                      <Badge className="text-base px-3 py-1">
                        {rec.confidence}% confiança
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Preço Atual</p>
                        <p className="text-2xl font-bold">R$ {rec.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Preço Sugerido</p>
                        <p className="text-2xl font-bold text-green-600">R$ {rec.suggestedPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2"> Impacto Esperado:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Lucro</p>
                          <p className="font-semibold">{rec.expectedImpact.profitChange}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volume</p>
                          <p className="font-semibold">{rec.expectedImpact.volumeChange}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Receita</p>
                          <p className="font-semibold">{rec.expectedImpact.revenueChange}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2"> Baseado em:</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.basedOn.map((reason, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">Aplicar este preço</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
