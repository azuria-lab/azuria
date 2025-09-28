import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Funnel, 
  FunnelChart, 
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer, 
  Scatter, 
  ScatterChart, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { 
  BarChart3,
  Download,
  Filter,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Settings,
  Target,
  TrendingUp
} from 'lucide-react';

interface DataVisualizationProps {
  period: string;
}

interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'scatter' | 'funnel';
  data: unknown[];
  config: {
    xAxis?: string;
    yAxis?: string;
    dataKey?: string;
    colors?: string[];
  };
  insights?: string[];
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function DataVisualization({ period }: DataVisualizationProps) {
  const [selectedChart, setSelectedChart] = useState('revenue-trend');
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('charts');

  // Dados para diferentes visualizações
  const revenueData = [
    { month: 'Jan', revenue: 2450000, target: 2500000, orders: 1250, customers: 890 },
    { month: 'Fev', revenue: 2380000, target: 2500000, orders: 1180, customers: 920 },
    { month: 'Mar', revenue: 2847950, target: 3000000, orders: 1420, customers: 1050 },
    { month: 'Abr', revenue: 2650000, target: 2800000, orders: 1320, customers: 980 },
    { month: 'Mai', revenue: 2980000, target: 3000000, orders: 1490, customers: 1120 },
    { month: 'Jun', revenue: 3250000, target: 3200000, orders: 1625, customers: 1200 }
  ];

  const channelData = [
    { name: 'Mercado Livre', value: 35, revenue: 1137825, orders: 569 },
    { name: 'Amazon', value: 28, revenue: 910000, orders: 455 },
    { name: 'Shopee', value: 18, revenue: 585000, orders: 292 },
    { name: 'Website', value: 12, revenue: 390000, orders: 195 },
    { name: 'Outros', value: 7, revenue: 227625, orders: 114 }
  ];

  const automationData = [
    { category: 'Vendas', active: 85, performance: 92, errors: 3 },
    { category: 'Estoque', active: 72, performance: 88, errors: 5 },
    { category: 'Preços', active: 94, performance: 95, errors: 1 },
    { category: 'Marketing', active: 68, performance: 78, errors: 8 },
    { category: 'Financeiro', active: 45, performance: 86, errors: 2 }
  ];

  const conversionFunnelData = [
    { name: 'Visitantes', value: 10000, percentage: 100 },
    { name: 'Visualizações', value: 7500, percentage: 75 },
    { name: 'Carrinho', value: 3200, percentage: 32 },
    { name: 'Checkout', value: 1800, percentage: 18 },
    { name: 'Compra', value: 1440, percentage: 14.4 }
  ];

  const performanceData = [
    { metric: 'Velocidade', value: 85, fullMark: 100 },
    { metric: 'Qualidade', value: 92, fullMark: 100 },
    { metric: 'Satisfação', value: 88, fullMark: 100 },
    { metric: 'Eficiência', value: 94, fullMark: 100 },
    { metric: 'Custo', value: 76, fullMark: 100 },
    { metric: 'Tempo', value: 89, fullMark: 100 }
  ];

  const correlationData = [
    { automation: 10, revenue: 2450000 },
    { automation: 15, revenue: 2380000 },
    { automation: 25, revenue: 2847950 },
    { automation: 30, revenue: 2650000 },
    { automation: 42, revenue: 2980000 },
    { automation: 55, revenue: 3250000 }
  ];

  // Configurações dos gráficos
  const chartConfigs: ChartData[] = [
    {
      id: 'revenue-trend',
      title: 'Tendência de Receita',
      type: 'area',
      data: revenueData,
      config: {
        xAxis: 'month',
        yAxis: 'revenue',
        colors: ['#3B82F6', '#10B981']
      },
      insights: [
        'Crescimento de 32% em março comparado a janeiro',
        'Meta de junho foi superada em 1.6%',
        'Tendência positiva consistente nos últimos 3 meses'
      ]
    },
    {
      id: 'channel-distribution',
      title: 'Distribuição por Canal',
      type: 'pie',
      data: channelData,
      config: {
        dataKey: 'value',
        colors: ['#FFE302', '#FF9900', '#EE4D2D', '#3B82F6', '#6B7280']
      },
      insights: [
        'Mercado Livre representa 35% das vendas',
        'Top 3 canais concentram 81% do volume',
        'Website tem potencial de crescimento'
      ]
    },
    {
      id: 'automation-performance',
      title: 'Performance das Automações',
      type: 'radar',
      data: automationData,
      config: {
        colors: ['#8B5CF6', '#F59E0B', '#EF4444']
      },
      insights: [
        'Automações de preços têm melhor performance',
        'Marketing precisa de otimização',
        'Baixa incidência de erros no geral'
      ]
    },
    {
      id: 'conversion-funnel',
      title: 'Funil de Conversão',
      type: 'funnel',
      data: conversionFunnelData,
      config: {
        colors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#172554']
      },
      insights: [
        'Taxa de conversão de 14.4%',
        'Maior perda entre visualização e carrinho',
        'Boa taxa de finalização de checkout'
      ]
    },
    {
      id: 'automation-revenue',
      title: 'Correlação Automação x Receita',
      type: 'scatter',
      data: correlationData,
      config: {
        xAxis: 'automation',
        yAxis: 'revenue',
        colors: ['#10B981']
      },
      insights: [
        'Correlação positiva forte (R² = 0.89)',
        'Cada automação adicional gera ~R$ 45k',
        'ROI das automações é altamente positivo'
      ]
    }
  ];

  // Métricas resumidas
  const metricsCards: MetricCard[] = [
    {
      title: 'Receita Média',
      value: 'R$ 2.76M',
      change: 15.3,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Conversão',
      value: '14.4%',
      change: 2.1,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Automações',
      value: '342',
      change: 8.7,
      icon: Layers,
      color: 'text-purple-600'
    }
  ];

  const selectedChartConfig = chartConfigs.find(c => c.id === selectedChart);

  const renderChart = (config: ChartData): React.ReactElement => {
    switch (config.type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={config.data as typeof revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.config.xAxis} />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
              <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="target" 
              stackId="2" 
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
            />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={config.data as typeof channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {(config.data as typeof channelData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config.config.colors?.[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={config.data as typeof automationData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar 
                name="Performance" 
                dataKey="performance" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.6}
              />
              <Radar 
                name="Ativas" 
                dataKey="active" 
                stroke="#F59E0B" 
                fill="#F59E0B" 
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={config.data as typeof correlationData}>
              <CartesianGrid />
              <XAxis dataKey="automation" name="Automações" />
              <YAxis dataKey="revenue" name="Receita" tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter dataKey="revenue" fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={config.data as typeof revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#3B82F6" />
              <Bar dataKey="customers" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={config.data as typeof revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Visualização de Dados</h3>
          <p className="text-gray-600">Análise visual avançada com insights inteligentes</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'charts')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cards">Cards</SelectItem>
              <SelectItem value="charts">Gráficos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricsCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}% vs anterior
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Área principal de visualização */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Seletor de gráficos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chartConfigs.map((config) => {
                const icons = {
                  line: LineChartIcon,
                  bar: BarChart3,
                  area: LineChartIcon,
                  pie: PieChartIcon,
                  radar: Target,
                  scatter: TrendingUp,
                  funnel: Layers
                };
                const Icon = icons[config.type];
                
                return (
                  <button
                    key={config.id}
                    onClick={() => setSelectedChart(config.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedChart === config.id 
                        ? 'bg-blue-100 border-blue-200 border' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">{config.title}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {config.type}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico principal */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedChartConfig?.title}</CardTitle>
              <CardDescription>
                Dados do período: {period === '7d' ? 'Últimos 7 dias' : period === '30d' ? 'Últimos 30 dias' : 'Período selecionado'}
              </CardDescription>
            </div>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChartConfig ? renderChart(selectedChartConfig) : <div>Nenhum gráfico selecionado</div>}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights automáticos */}
      {selectedChartConfig?.insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights Automáticos
            </CardTitle>
            <CardDescription>
              Análises geradas automaticamente baseadas nos dados visualizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedChartConfig.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <p className="text-sm text-blue-800">{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de múltiplos gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionFunnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}