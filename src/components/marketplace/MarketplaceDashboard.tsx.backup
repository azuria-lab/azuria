import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUp,
  Box,
  Clock,
  DollarSign,
  Download,
  Package,
  RefreshCw,
  Settings,
  ShoppingCart,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/ui/stat-card';
import AreaChart from '@/components/ui/area-chart';
import BarChart from '@/components/ui/bar-chart';
import { cn } from '@/lib/utils';
import type { MarketplaceDashboardData } from '@/types/marketplace-api';

interface MarketplaceDashboardProps {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceColor: string;
  data: MarketplaceDashboardData;
  onRefresh: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  isLoading?: boolean;
  isPremium?: boolean;
}

export default function MarketplaceDashboard({
  marketplaceId: _marketplaceId,
  marketplaceName,
  marketplaceColor: _marketplaceColor,
  data,
  onRefresh,
  onExport,
  onSettings,
  isLoading = false,
  isPremium = false,
}: Readonly<MarketplaceDashboardProps>) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getAlertBadgeVariant = (severity: 'low' | 'medium' | 'high') => {
    if (severity === 'high') {
      return 'destructive';
    }
    if (severity === 'medium') {
      return 'default';
    }
    return 'secondary';
  };

  const getPricePositionColor = (position: 'above' | 'below' | 'equal') => {
    if (position === 'below') {
      return 'text-green-600';
    }
    if (position === 'above') {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getDemandLevelVariant = (level: 'low' | 'medium' | 'high') => {
    if (level === 'high') {
      return 'default';
    }
    if (level === 'medium') {
      return 'secondary';
    }
    return 'outline';
  };

  const getInventoryStatusVariant = (status: 'available' | 'low' | 'out' | 'unintegrated') => {
    if (status === 'available') {
      return 'default';
    }
    if (status === 'low') {
      return 'secondary';
    }
    if (status === 'out') {
      return 'destructive';
    }
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard {marketplaceName}</h2>
          <p className="text-muted-foreground">
            Análise completa do marketplace em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
            Atualizar
          </Button>

          {isPremium && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}

          {onSettings && (
            <Button variant="outline" size="sm" onClick={onSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Visão Geral - Melhorados */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour="metrics-cards">
        <StatCard
          title="Total de Produtos"
          value={data.overview.totalProducts}
          icon={Package}
          iconColor="#8b5cf6"
          iconBgColor="#f3e8ff"
          delay={0.1}
          footer={
            <span>
              {data.overview.activeListings} ativos • {data.overview.inactiveListings} inativos
            </span>
          }
        />

        <StatCard
          title="Vendas Totais"
          value={data.overview.totalSales}
          change={12}
          changeLabel="vs mês anterior"
          icon={ShoppingCart}
          iconColor="#10b981"
          iconBgColor="#d1fae5"
          trend="up"
          delay={0.2}
        />

        <StatCard
          title="Receita Bruta"
          value={data.overview.grossRevenue}
          prefix="R$ "
          change={8.5}
          changeLabel="vs mês anterior"
          icon={DollarSign}
          iconColor="#3b82f6"
          iconBgColor="#dbeafe"
          trend="up"
          delay={0.3}
        />

        <StatCard
          title="Margem Média"
          value={data.overview.averageMargin}
          suffix="%"
          decimals={2}
          icon={TrendingUp}
          iconColor="#f59e0b"
          iconBgColor="#fef3c7"
          delay={0.4}
          footer={
            <Progress value={data.overview.averageMargin} className="h-2" />
          }
        />
      </div>

      {/* Alertas de Preços */}
      {data.pricing.priceAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Alertas de Preço ({data.pricing.priceAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.pricing.priceAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.productName}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge variant={getAlertBadgeVariant(alert.severity)}>
                    {alert.alertType === 'below_margin' && 'Margem Baixa'}
                    {alert.alertType === 'above_market' && 'Acima do Mercado'}
                    {alert.alertType === 'competitor_change' && 'Concorrente Mudou'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Análises */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="pricing" data-tour="products-tab">Análise de Preços</TabsTrigger>
          <TabsTrigger value="ai-insights" data-tour="ai-insights-tab">🤖 IA Insights</TabsTrigger>
          <TabsTrigger value="intelligence">Inteligência</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          {/* Gráficos de Vendas e Receita */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Vendas (30 dias)</CardTitle>
                <CardDescription>Vendas diárias no último mês</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={[
                    { label: '1', value: 45 },
                    { label: '5', value: 52 },
                    { label: '10', value: 61 },
                    { label: '15', value: 58 },
                    { label: '20', value: 72 },
                    { label: '25', value: 68 },
                    { label: '30', value: 85 }
                  ]}
                  width={500}
                  height={250}
                  color="#10b981"
                  showGrid
                  showLabels
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Semana</CardTitle>
                <CardDescription>Comparativo das últimas 4 semanas</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    { label: 'Sem 1', value: 12500 },
                    { label: 'Sem 2', value: 15200 },
                    { label: 'Sem 3', value: 14800 },
                    { label: 'Sem 4', value: 18900 }
                  ]}
                  width={500}
                  height={250}
                  defaultColor="#3b82f6"
                  showValues
                  showLabels
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Produtos Mais Vendidos</CardTitle>
              <CardDescription>Produtos com melhor desempenho no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700">
                      {index + 1}
                    </div>
                    
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(product.salesCount)} vendas
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-green-600">{formatPercentage(product.margin)} margem</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análise de Preços */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Comparativo com Concorrência</CardTitle>
                <CardDescription>Sua posição no mercado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Seu Preço Médio</span>
                      <span className="font-bold">{formatCurrency(data.pricing.competitorComparison.myPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Média dos Concorrentes</span>
                      <span className="font-bold">{formatCurrency(data.pricing.competitorComparison.competitorAverage)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Diferença</span>
                      <span
                        className={cn(
                          'font-bold',
                          getPricePositionColor(data.pricing.competitorComparison.position)
                        )}
                      >
                        {data.pricing.competitorComparison.difference > 0 ? '+' : ''}
                        {formatCurrency(data.pricing.competitorComparison.difference)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    {data.pricing.competitorComparison.position === 'below' && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        <span>Seus preços estão mais competitivos</span>
                      </div>
                    )}
                    {data.pricing.competitorComparison.position === 'above' && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>Seus preços estão acima do mercado</span>
                      </div>
                    )}
                    {data.pricing.competitorComparison.position === 'equal' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ArrowUp className="h-4 w-4" />
                        <span>Seus preços estão alinhados ao mercado</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variação por Categoria</CardTitle>
                <CardDescription>Preço médio e variação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.pricing.priceVariationByCategory.map((category) => (
                    <div key={category.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-muted-foreground">{formatCurrency(category.averagePrice)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.abs(category.variation)}
                          className="flex-1"
                        />
                        <span
                          className={cn(
                            'text-xs font-medium',
                            category.variation > 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {category.variation > 0 ? '+' : ''}
                          {formatPercentage(category.variation)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Inteligência de Mercado */}
        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Palavras-Chave Mais Buscadas</CardTitle>
                <CardDescription>Termos populares no marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.marketIntelligence.topKeywords.map((keyword) => (
                    <div key={keyword.keyword} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium">{keyword.keyword}</span>
                        {keyword.trend === 'up' && (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        )}
                        {keyword.trend === 'down' && (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      <Badge variant="secondary">{formatNumber(keyword.searchVolume)} buscas</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horários de Pico</CardTitle>
                <CardDescription>Melhores horários para vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.marketIntelligence.peakHours.slice(0, 5).map((peak) => (
                    <div key={peak.hour} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{peak.hour}:00</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatNumber(peak.salesCount)} vendas</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(peak.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reputação</CardTitle>
                <CardDescription>Sua avaliação no marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-6 w-6',
                            star <= Math.round(data.marketIntelligence.reputation.score)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold">
                      {data.marketIntelligence.reputation.score.toFixed(1)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de Avaliações</span>
                      <span className="font-medium">{formatNumber(data.marketIntelligence.reputation.totalReviews)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo Médio de Resposta</span>
                      <span className="font-medium">{data.marketIntelligence.reputation.averageResponseTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avaliações Positivas</span>
                      <span className="font-medium text-green-600">
                        {formatPercentage(data.marketIntelligence.reputation.positivePercentage)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências por Categoria</CardTitle>
                <CardDescription>Crescimento e demanda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.marketIntelligence.categoryTrends.map((trend) => (
                    <div key={trend.category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{trend.category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getDemandLevelVariant(trend.demandLevel)}>
                            {trend.demandLevel === 'high' && 'Alta'}
                            {trend.demandLevel === 'medium' && 'Média'}
                            {trend.demandLevel === 'low' && 'Baixa'}
                          </Badge>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              trend.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {trend.salesGrowth > 0 ? '+' : ''}
                            {formatPercentage(trend.salesGrowth)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: IA Insights */}
        <TabsContent value="ai-insights" className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-50 to-brand-50 rounded-lg border-2 border-purple-200">
            <div className="text-2xl">🤖</div>
            <div>
              <h3 className="font-bold text-purple-900">Insights Baseados em Inteligência Artificial</h3>
              <p className="text-sm text-purple-700">Recomendações automáticas para aumentar suas vendas e otimizar preços</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Recomendações de Preço
                <Badge className="bg-purple-100 text-purple-700">Novo</Badge>
              </CardTitle>
              <CardDescription>
                Sugestões inteligentes baseadas em análise de mercado e concorrência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-green-900">iPhone 15 Pro 256GB</h4>
                      <p className="text-sm text-green-700">Recomendação: Reduzir preço em 5.5%</p>
                    </div>
                    <Badge className="bg-green-600 text-white">92% confiança</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Preço Atual</p>
                      <p className="font-bold text-lg">R$ 7.299</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Preço Recomendado</p>
                      <p className="font-bold text-lg text-green-600">R$ 6.899</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700">
                      ✓ Aumento esperado de vendas: +23%<br/>
                      ✓ 147 concorrentes analisados<br/>
                      ✓ Baseado em tendência dos últimos 30 dias
                    </p>
                  </div>
                  <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                    Aplicar Recomendação
                  </Button>
                </div>

                <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-blue-900">Samsung Galaxy S24 Ultra</h4>
                      <p className="text-sm text-blue-700">Recomendação: Reduzir preço em 3.1%</p>
                    </div>
                    <Badge className="bg-blue-600 text-white">88% confiança</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Preço Atual</p>
                      <p className="font-bold text-lg">R$ 6.499</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Preço Recomendado</p>
                      <p className="font-bold text-lg text-blue-600">R$ 6.299</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      ✓ Aumento esperado de vendas: +15%<br/>
                      ✓ 89 concorrentes analisados<br/>
                      ✓ Preço alinhado com média do mercado
                    </p>
                  </div>
                  <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                    Aplicar Recomendação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Previsão de Vendas
                  <Badge variant="outline">IA</Badge>
                </CardTitle>
                <CardDescription>
                  Projeção para os próximos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Próxima semana</span>
                      <Badge className="bg-purple-600 text-white">↗️ Crescente</Badge>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">~215 vendas</p>
                    <p className="text-xs text-purple-700 mt-1">Confiança: 87% • Acurácia: 91%</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próximos 7 dias:</span>
                      <span className="font-semibold">~215 vendas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próximos 30 dias:</span>
                      <span className="font-semibold">~920 vendas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tendência:</span>
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        +18% vs mês anterior
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600">
                      🎯 Sazonalidade detectada • Pico esperado em Nov-Dez
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💡 Oportunidades Detectadas
                  <Badge variant="destructive">5</Badge>
                </CardTitle>
                <CardDescription>
                  Ações recomendadas pela IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-red-900">Preço acima do mercado</p>
                        <p className="text-xs text-red-700 mt-1">3 produtos precificados 8-12% acima</p>
                        <p className="text-xs text-red-600 font-medium mt-1">Potencial: +R$ 12.500 em 30 dias</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border-l-4 border-orange-500 bg-orange-50">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-orange-900">Tendência de alta</p>
                        <p className="text-xs text-orange-700 mt-1">Demanda +47% em eletrônicos</p>
                        <p className="text-xs text-orange-600 font-medium mt-1">Potencial: +R$ 28.900 em 15 dias</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-yellow-900">Produtos sem rotação</p>
                        <p className="text-xs text-yellow-700 mt-1">5 produtos parados há +45 dias</p>
                        <p className="text-xs text-yellow-600 font-medium mt-1">Considerar liquidação 15-20%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Ver Todas as Oportunidades
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏷️ Sugestões de Categorização
                <Badge variant="secondary">ML</Badge>
              </CardTitle>
              <CardDescription>
                Otimização automática de categorias usando NLP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">iPhone 15 Pro 256GB</p>
                    <p className="text-xs text-gray-600">Categoria sugerida: Eletrônicos › Celulares e Smartphones</p>
                    <p className="text-xs text-brand-600 mt-1">✓ Confiança: 92% • Melhora SEO em 34%</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Aplicar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">MacBook Air M3 13"</p>
                    <p className="text-xs text-gray-600">Categoria sugerida: Informática › Notebooks</p>
                    <p className="text-xs text-brand-600 mt-1">✓ Confiança: 95% • Melhora SEO em 28%</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Aplicar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gestão de Estoque */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
                <Box className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.inventory.totalStock)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fora de Estoque</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.inventory.outOfStock}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{data.inventory.lowStock}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Integrados</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.inventory.unintegrated}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Itens de Estoque</CardTitle>
              <CardDescription>
                Última atualização: {new Date(data.inventory.lastUpdate).toLocaleString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.inventory.items.slice(0, 10).map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold">{item.stock} unidades</p>
                      </div>
                      
                      <Badge variant={getInventoryStatusVariant(item.status)}>
                        {item.status === 'available' && 'Disponível'}
                        {item.status === 'low' && 'Estoque Baixo'}
                        {item.status === 'out' && 'Fora de Estoque'}
                        {item.status === 'unintegrated' && 'Não Integrado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm">
                  Ver Todos os Itens ({data.inventory.items.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
