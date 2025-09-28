import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  BarChart3,
  Brain,
  Calendar,
  Clock,
  Download,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  Settings,
  Share2,
  TrendingUp
} from 'lucide-react';

// Componentes do BI que vamos criar
import { ExecutiveDashboard } from './dashboards/ExecutiveDashboard';
import { ReportBuilder } from './reports/ReportBuilder';
import { DataVisualization } from './visualization/DataVisualization';
import { KPIManager } from './kpi/KPIManager';
import { AlertsCenter } from './alerts/AlertsCenter';
import { DataConnectors } from './connectors/DataConnectors';

export interface BIDashboard {
  id: string;
  name: string;
  type: 'executive' | 'operational' | 'analytical' | 'custom';
  widgets: BIWidget[];
  permissions: string[];
  refreshInterval: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BIWidget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'scorecard' | 'gauge' | 'heatmap';
  title: string;
  dataSource: string;
  query: string;
  visualization: {
    chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'funnel';
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  };
  filters: BIFilter[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
}

export interface BIFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: unknown;
  label: string;
}

export interface BIReport {
  id: string;
  name: string;
  description: string;
  template: string;
  parameters: Record<string, unknown>;
  schedule?: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv' | 'json';
  };
  lastGenerated?: string;
  status: 'active' | 'inactive' | 'error';
}

interface BusinessIntelligenceDashboardProps {
  userId?: string;
}

export default function BusinessIntelligenceDashboard({ userId }: BusinessIntelligenceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data para demonstração
  const dashboards: BIDashboard[] = [
    {
      id: 'exec_1',
      name: 'Dashboard Executivo',
      type: 'executive',
      widgets: [],
      permissions: ['CEO', 'CFO', 'COO'],
      refreshInterval: 300,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-15T16:00:00Z',
      createdBy: 'admin@empresa.com'
    },
    {
      id: 'ops_1',
      name: 'Operações & Vendas',
      type: 'operational',
      widgets: [],
      permissions: ['Sales Manager', 'Operations'],
      refreshInterval: 60,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-03-15T15:30:00Z',
      createdBy: 'vendas@empresa.com'
    },
    {
      id: 'ana_1',
      name: 'Analytics Avançado',
      type: 'analytical',
      widgets: [],
      permissions: ['Data Analyst', 'Marketing'],
      refreshInterval: 900,
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-03-15T14:00:00Z',
      createdBy: 'analytics@empresa.com'
    }
  ];

  const reports: BIReport[] = [
    {
      id: 'rep_1',
      name: 'Relatório Mensal de Vendas',
      description: 'Análise completa de performance de vendas mensal',
      template: 'sales_monthly',
      parameters: { includeComparisons: true, detailLevel: 'product' },
      schedule: {
        frequency: 'monthly',
        recipients: ['ceo@empresa.com', 'vendas@empresa.com'],
        format: 'pdf'
      },
      lastGenerated: '2024-03-01T00:00:00Z',
      status: 'active'
    },
    {
      id: 'rep_2',
      name: 'KPIs Diários',
      description: 'Indicadores chave atualizados diariamente',
      template: 'kpi_daily',
      parameters: { metrics: ['revenue', 'conversions', 'costs'], format: 'summary' },
      schedule: {
        frequency: 'daily',
        recipients: ['gerencia@empresa.com'],
        format: 'excel'
      },
      lastGenerated: '2024-03-15T08:00:00Z',
      status: 'active'
    },
    {
      id: 'rep_3',
      name: 'Análise de Automações',
      description: 'Performance dos workflows e automações',
      template: 'automation_analysis',
      parameters: { includeErrors: true, timeframe: 'week' },
      lastGenerated: '2024-03-10T12:00:00Z',
      status: 'active'
    }
  ];

  // Estatísticas do BI
  const biStats = {
    totalDashboards: dashboards.length,
    activeReports: reports.filter(r => r.status === 'active').length,
    dataPoints: 2847,
    lastUpdate: new Date().toISOString(),
    systemHealth: 98.5
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implementar lógica de exportação
    console.log(`Exporting dashboard as ${format}`);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 90 dias';
      case '1y': return 'Último ano';
      default: return 'Período personalizado';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Business Intelligence
            </h1>
            <p className="text-gray-600 mt-2">
              Analytics empresarial, relatórios inteligentes e insights em tempo real
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biStats.totalDashboards}</div>
            <p className="text-xs text-muted-foreground">Ativos no sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
            <PieChart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biStats.activeReports}</div>
            <p className="text-xs text-muted-foreground">Agendados e ativos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biStats.dataPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pontos de dados hoje</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <Brain className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biStats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">Performance do sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {new Date(biStats.lastUpdate).toLocaleTimeString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(biStats.lastUpdate).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Visualização
          </TabsTrigger>
          <TabsTrigger value="kpi" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ExecutiveDashboard period={selectedPeriod} userId={userId} />
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Dashboards Empresariais</h3>
              <p className="text-gray-600">Gerencie e visualize seus dashboards personalizados</p>
            </div>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Novo Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard, index) => (
              <motion.div
                key={dashboard.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {dashboard.type}
                      </Badge>
                    </div>
                    <CardDescription>
                      Atualização: {dashboard.refreshInterval}s
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Permissões</span>
                        <span className="font-medium">{dashboard.permissions.length} perfis</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Última atualização</span>
                        <span className="font-medium">
                          {new Date(dashboard.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportBuilder reports={reports} />
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          <DataVisualization period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <KPIManager period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conectores de Dados</CardTitle>
                <CardDescription>Configure fontes de dados para o BI</CardDescription>
              </CardHeader>
              <CardContent>
                <DataConnectors period={selectedPeriod} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Central de Alertas</CardTitle>
                <CardDescription>Configure alertas e notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertsCenter period={selectedPeriod} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}