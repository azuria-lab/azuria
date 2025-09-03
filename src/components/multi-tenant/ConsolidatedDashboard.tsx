
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Calculator, 
  DollarSign, 
  Download, 
  Eye, 
  Store,
  TrendingUp,
  Users
} from 'lucide-react';
import { useConsolidatedMetrics } from '@/hooks/useConsolidatedMetrics';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { formatCurrency } from '@/utils/calculator/formatCurrency';

export default function ConsolidatedDashboard() {
  const { currentOrganization, stores } = useMultiTenant();
  const { metrics, isLoading, refreshMetrics } = useConsolidatedMetrics();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Nenhuma métrica disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Consolidado</h2>
          <p className="text-muted-foreground">
            Visão geral de todas as lojas da {currentOrganization?.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshMetrics}>
            Atualizar
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics.growthRate.toFixed(1)}%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cálculos</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCalculations}</div>
            <p className="text-xs text-muted-foreground">
              Média de {Math.round(metrics.totalCalculations / metrics.totalStores)} por loja
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              {stores.filter(s => s.isActive).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Última semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="stores">Por Loja</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loja Top Performer */}
            <Card>
              <CardHeader>
                <CardTitle>Melhor Performance</CardTitle>
                <CardDescription>
                  Loja com maior receita no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.topPerformingStore ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{metrics.topPerformingStore.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(
                          metrics.storeComparison.find(s => s.store.id === metrics.topPerformingStore?.id)?.revenue || 0
                        )}
                      </p>
                    </div>
                    <Badge variant="default">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Top
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Distribuição de Atividade */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Atividade</CardTitle>
                <CardDescription>
                  Cálculos por loja no período
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.storeComparison.slice(0, 5).map((storeMetric, index) => (
                  <div key={storeMetric.store.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm">{storeMetric.store.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(storeMetric.calculations / metrics.totalCalculations) * 100} 
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {storeMetric.calculations}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.storeComparison.map((storeMetric) => (
              <Card key={storeMetric.store.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{storeMetric.store.name}</CardTitle>
                    <Badge variant={storeMetric.store.isActive ? 'default' : 'secondary'}>
                      {storeMetric.store.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita</span>
                    <span className="font-semibold">
                      {formatCurrency(storeMetric.revenue)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cálculos</span>
                    <span className="font-semibold">{storeMetric.calculations}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Margem Média</span>
                    <span className="font-semibold">{storeMetric.avgMargin.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Usuários</span>
                    <span className="font-semibold">{storeMetric.activeUsers}</span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Eye className="h-3 w-3 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance</CardTitle>
              <CardDescription>
                Comparativo detalhado entre lojas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.storeComparison.map((storeMetric, index) => (
                  <div key={storeMetric.store.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{storeMetric.store.name}</h4>
                      <Badge variant="outline">
                        #{index + 1} em receita
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Receita</p>
                        <p className="font-semibold">{formatCurrency(storeMetric.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cálculos</p>
                        <p className="font-semibold">{storeMetric.calculations}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margem Avg</p>
                        <p className="font-semibold">{storeMetric.avgMargin.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usuários</p>
                        <p className="font-semibold">{storeMetric.activeUsers}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendências</CardTitle>
              <CardDescription>
                Análise de crescimento e tendências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Gráficos de tendências serão implementados em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
