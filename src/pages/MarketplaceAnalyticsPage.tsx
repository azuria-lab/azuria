/**
 * Marketplace Analytics Page
 * 
 * Dashboard completo de analytics para marketplaces
 */

import { useCallback, useEffect, useState } from 'react';
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar,
  DollarSign,
  Download, 
  Percent, 
  Receipt, 
  RefreshCw, 
  ShoppingCart, 
  TrendingUp 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { analyticsService } from '@/services/analytics.service';
import type { AIInsight, AnalyticsReport, TimeRange } from '@/types/marketplace-analytics';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const METRIC_ICONS = {
  'dollar-sign': DollarSign,
  'shopping-cart': ShoppingCart,
  'trending-up': TrendingUp,
  'receipt': Receipt,
  'percent': Percent
};

const TIME_RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '1y', label: 'Último ano' },
  { value: 'all', label: 'Todo período' }
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function MarketplaceAnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportData, insightsData] = await Promise.all([
        analyticsService.generateReport({ timeRange }),
        analyticsService.getAIInsights()
      ]);
      setReport(reportData);
      setInsights(insightsData);
    } catch {
      toast({
        title: 'Erro ao carregar analytics',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleExport(): void {
    toast({
      title: 'Exportando relatório',
      description: 'O download começará em instantes'
    });
  }

  if (loading || !report) {
    return (
      <Layout title="Analytics Marketplace - Azuria+">
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics Marketplace - Azuria+">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Marketplace</h1>
            <p className="text-muted-foreground mt-1">
              Análise completa de performance e métricas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {report.metrics.map(metric => {
            const Icon = METRIC_ICONS[metric.icon as keyof typeof METRIC_ICONS] || TrendingUp;
            
            let TrendIcon = null;
            if (metric.trend === 'up') {
              TrendIcon = ArrowUp;
            } else if (metric.trend === 'down') {
              TrendIcon = ArrowDown;
            }
            
            let formattedValue: string;
            if (metric.format === 'currency') {
              formattedValue = formatCurrency(metric.value);
            } else if (metric.format === 'percentage') {
              formattedValue = formatPercentage(metric.value);
            } else {
              formattedValue = formatNumber(metric.value);
            }

            return (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {TrendIcon && (
                      <Badge 
                        variant="secondary"
                        className={cn(
                          metric.trend === 'up' && 'bg-green-100 text-green-800',
                          metric.trend === 'down' && 'bg-red-100 text-red-800'
                        )}
                      >
                        <TrendIcon className="h-3 w-3 mr-1" />
                        {formatPercentage(Math.abs(metric.change))}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mt-2">{formattedValue}</CardTitle>
                  <CardDescription>{metric.name}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="marketplaces">Marketplaces</TabsTrigger>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Categorias */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Categoria</CardTitle>
                  <CardDescription>Receita por categoria de produto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.categoryAnalysis.map(category => (
                      <div key={category.categoryId}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{category.categoryName}</span>
                              <Badge variant="outline">
                                {category.products} produtos
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Top: {category.topProduct.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(category.revenue)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatPercentage(category.revenueShare)}
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${category.revenueShare}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tendências */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendências Identificadas</CardTitle>
                  <CardDescription>Análise de tendências do mercado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.trends.map(trend => (
                      <div 
                        key={trend.id}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{trend.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {trend.description}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              trend.impact === 'positive' && 'bg-green-100 text-green-800',
                              trend.impact === 'negative' && 'bg-red-100 text-red-800',
                              trend.impact === 'neutral' && 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {trend.confidence}%
                          </Badge>
                        </div>
                        {trend.recommendation && (
                          <p className="text-xs text-primary mt-2">
                            💡 {trend.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Produtos</CardTitle>
                <CardDescription>Produtos com melhor performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topProducts.map((product, index) => {
                    let TrendIcon = null;
                    if (product.trend === 'up') {
                      TrendIcon = ArrowUp;
                    } else if (product.trend === 'down') {
                      TrendIcon = ArrowDown;
                    }
                    
                    return (
                      <div
                        key={product.productId}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{product.productName}</h4>
                            {TrendIcon && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  product.trend === 'up' && 'bg-green-100 text-green-800',
                                  product.trend === 'down' && 'bg-red-100 text-red-800'
                                )}
                              >
                                <TrendIcon className="h-3 w-3 mr-1" />
                                {formatPercentage(Math.abs(product.revenueChange))}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Receita</div>
                              <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Pedidos</div>
                              <div className="font-semibold">{formatNumber(product.orders)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Conversão</div>
                              <div className="font-semibold">{formatPercentage(product.conversionRate)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Estoque</div>
                              <div className={cn(
                                'font-semibold',
                                product.stock < 5 && 'text-red-600',
                                product.stock >= 5 && product.stock < 10 && 'text-orange-600',
                                product.stock >= 10 && 'text-green-600'
                              )}>
                                {formatNumber(product.stock)} un
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplaces Tab */}
          <TabsContent value="marketplaces" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.marketplaceComparison.map(marketplace => (
                <Card key={marketplace.marketplaceId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{marketplace.marketplaceName}</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{formatPercentage(marketplace.growth)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {marketplace.activeProducts} produtos ativos • {marketplace.topCategory}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Receita</div>
                        <div className="text-2xl font-bold">{formatCurrency(marketplace.revenue)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(marketplace.revenueShare)} do total
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Pedidos</div>
                        <div className="text-2xl font-bold">{formatNumber(marketplace.orders)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(marketplace.ordersShare)} do total
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Ticket Médio</div>
                        <div className="font-semibold">{formatCurrency(marketplace.avgTicket)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Conversão</div>
                        <div className="font-semibold">{formatPercentage(marketplace.conversionRate)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights de IA</CardTitle>
                <CardDescription>
                  Recomendações inteligentes baseadas em análise de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map(insight => (
                    <div
                      key={insight.id}
                      className={cn(
                        'p-4 border-l-4 rounded-lg',
                        insight.priority === 'critical' && 'border-red-500 bg-red-50',
                        insight.priority === 'high' && 'border-orange-500 bg-orange-50',
                        insight.priority === 'medium' && 'border-blue-500 bg-blue-50',
                        insight.priority === 'low' && 'border-gray-500 bg-gray-50'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge variant="secondary">
                              {insight.confidence}% confiança
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Impacto estimado: </span>
                          <span className="font-semibold">
                            {insight.impact.estimatedChange > 0 ? '+' : ''}
                            {formatPercentage(insight.impact.estimatedChange)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor: </span>
                          <span className="font-semibold">
                            {formatCurrency(Math.abs(insight.impact.estimatedValue))}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {insight.actions.map(action => (
                          <Button
                            key={action.id}
                            variant={action.variant === 'primary' ? 'default' : 'outline'}
                            size="sm"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
