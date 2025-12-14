import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useWebVitals } from '@/hooks/useWebVitals';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Zap } from 'lucide-react';

export const PerformanceDashboard = () => {
  // refreshKey é usado para forçar re-render em intervalos regulares
  const [refreshKey, setRefreshKey] = useState(0);
  const { getPerformanceReport, clearData, violations } = usePerformanceMonitor();
  const { getMetrics, getScore } = useWebVitals();
  const cache = useAdvancedCache();

  const [report, setReport] = useState(() => getPerformanceReport());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(getPerformanceReport());
      setRefreshKey(prev => prev + 1);
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [getPerformanceReport]);

  // Atualiza score quando refreshKey muda
  const webVitalsScore = getScore();
  const cacheStats = cache.getStats();
  
  // RefreshKey usado para forçar re-render (intencional)
  void refreshKey;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {return 'text-green-600';}
    if (score >= 60) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) {return `${ms.toFixed(0)}ms`;}
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Monitore a performance da aplicação em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setRefreshKey(k => k + 1)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            onClick={clearData}
          >
            Limpar Dados
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="violations">Violações</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medições Totais</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.metrics.totalMeasures}</div>
                <p className="text-xs text-muted-foreground">
                  Desde o início da sessão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio de Render</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(report.metrics.averageRenderTime)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Budget: {formatDuration(report.budget.componentRender)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Violações</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(100 - report.metrics.violationRate)}`}>
                  {report.metrics.violationRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.metrics.violationsCount} violações
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalhadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tempo Médio de API</span>
                    <span className="font-mono">
                      {formatDuration(report.metrics.averageApiTime)}
                    </span>
                  </div>
                  <Progress 
                    value={(report.metrics.averageApiTime / report.budget.apiResponse) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tempo Médio de Render</span>
                    <span className="font-mono">
                      {formatDuration(report.metrics.averageRenderTime)}
                    </span>
                  </div>
                  <Progress 
                    value={(report.metrics.averageRenderTime / report.budget.componentRender) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entradas Recentes</CardTitle>
                <CardDescription>
                  Últimas {Math.min(5, report.entries.length)} medições
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.entries.slice(-5).reverse().map((entry) => (
                    <div key={`${entry.type}-${entry.name}-${entry.duration}`} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {entry.type}
                        </Badge>
                        <span className="truncate max-w-32">{entry.name}</span>
                      </div>
                      <span className="font-mono text-xs">
                        {formatDuration(entry.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getMetrics().map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Badge 
                    variant={metric.rating === 'good' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.rating}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getRatingColor(metric.rating)}`}>
                    {metric.value.toFixed(0)}
                    {metric.name === 'CLS' ? '' : 'ms'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Delta: {metric.delta.toFixed(0)}
                    {metric.name === 'CLS' ? '' : 'ms'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {webVitalsScore && (
            <Card>
              <CardHeader>
                <CardTitle>Score Geral</CardTitle>
                <CardDescription>
                  Pontuação baseada nas Core Web Vitals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {webVitalsScore.good.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Bom</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {webVitalsScore.needsImprovement.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Precisa Melhorar</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {webVitalsScore.poor.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Ruim</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entradas no Cache</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cacheStats.size}/{cacheStats.maxSize}
                </div>
                <Progress 
                  value={(cacheStats.size / cacheStats.maxSize) * 100} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(cacheStats.hitRate)}`}>
                  {cacheStats.hitRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {cacheStats.totalAccesses} acessos totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estratégia</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheStats.strategy}</div>
                <p className="text-xs text-muted-foreground">
                  Idade média: {(cacheStats.averageAge / 1000).toFixed(0)}s
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Violações de Performance Budget</CardTitle>
              <CardDescription>
                Últimas violações detectadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhuma violação detectada! 🎉</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {violations.slice(-10).reverse().map((violation) => (
                    <div key={`${violation.type}-${violation.name}-${violation.duration}`} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{violation.type}</Badge>
                          <span className="font-medium">{violation.name}</span>
                        </div>
                        <span className="text-sm font-mono text-red-600">
                          {formatDuration(violation.duration)}
                        </span>
                      </div>
                      {violation.metadata && (
                        <pre className="text-xs text-muted-foreground overflow-auto">
                          {JSON.stringify(violation.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recomendações de Performance</CardTitle>
              <CardDescription>
                Sugestões para melhorar a performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.recommendations.map((rec) => (
                  <div key={`${rec.type}-${rec.priority}`} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                      >
                        {rec.priority}
                      </Badge>
                      <span className="font-medium capitalize">
                        {rec.type.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.message}</p>
                  </div>
                ))}
                
                {report.recommendations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Performance está ótima! Nenhuma recomendação no momento.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};