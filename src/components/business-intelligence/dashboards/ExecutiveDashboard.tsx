import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell, 
  Legend, 
  Line, 
  LineChart,
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { 
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface ExecutiveDashboardProps {
  period: string;
  userId?: string;
}

interface ExecutiveKPI {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  target?: string;
  progress?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
  profit: number;
}

interface ChannelData {
  name: string;
  value: number;
  color: string;
}

interface AlertData {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function ExecutiveDashboard({ period, userId }: Readonly<ExecutiveDashboardProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simular carregamento de dados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
    };
    loadData();
  }, [period, userId]);

  // KPIs Executivos
  const executiveKPIs: ExecutiveKPI[] = [
    {
      id: 'revenue',
      title: 'Receita Total',
      value: 'R$ 2.847.950',
      change: 12.5,
      changeType: 'positive',
      target: 'R$ 3.000.000',
      progress: 94.9,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'orders',
      title: 'Pedidos Processados',
      value: '18.427',
      change: 8.3,
      changeType: 'positive',
      target: '20.000',
      progress: 92.1,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      id: 'customers',
      title: 'Clientes Ativos',
      value: '4.829',
      change: -2.1,
      changeType: 'negative',
      target: '5.000',
      progress: 96.6,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      id: 'automation',
      title: 'Automações Ativas',
      value: '342',
      change: 15.7,
      changeType: 'positive',
      target: '400',
      progress: 85.5,
      icon: Zap,
      color: 'text-orange-600'
    },
    {
      id: 'efficiency',
      title: 'Eficiência Operacional',
      value: '87.4%',
      change: 3.2,
      changeType: 'positive',
      target: '90%',
      progress: 97.1,
      icon: TrendingUp,
      color: 'text-emerald-600'
    }
  ];

  // Dados de receita mensal
  const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 2450000, target: 2500000, profit: 490000 },
    { month: 'Fev', revenue: 2380000, target: 2500000, profit: 476000 },
    { month: 'Mar', revenue: 2847950, target: 3000000, profit: 569590 },
    { month: 'Abr', revenue: 2650000, target: 2800000, profit: 530000 },
    { month: 'Mai', revenue: 2980000, target: 3000000, profit: 596000 },
    { month: 'Jun', revenue: 3250000, target: 3200000, profit: 650000 }
  ];

  // Dados de canais de venda
  const channelData: ChannelData[] = [
    { name: 'Mercado Livre', value: 35, color: '#FFE302' },
    { name: 'Amazon', value: 28, color: '#FF9900' },
    { name: 'Shopee', value: 18, color: '#EE4D2D' },
    { name: 'Website', value: 12, color: '#3B82F6' },
    { name: 'Outros', value: 7, color: '#6B7280' }
  ];

  // Alertas críticos
  const criticalAlerts: AlertData[] = [
    {
      id: 'alert_1',
      type: 'warning',
      title: 'Meta de receita em risco',
      description: 'Receita atual está 5.1% abaixo da meta mensal',
      timestamp: '2024-03-15T14:30:00Z',
      severity: 'medium'
    },
    {
      id: 'alert_2',
      type: 'error',
      title: 'Integração Amazon offline',
      description: 'Falha na sincronização há 2 horas',
      timestamp: '2024-03-15T12:15:00Z',
      severity: 'high'
    },
    {
      id: 'alert_3',
      type: 'info',
      title: 'Novo recorde de automações',
      description: '342 automações ativas - maior número histórico',
      timestamp: '2024-03-15T10:00:00Z',
      severity: 'low'
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getAlertIcon = (_type: string, _severity: string) => {
    return AlertTriangle;
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-200 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-100 border-blue-200 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={`loading-skeleton-${i}`} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPIs Executivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {executiveKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{kpi.value}</div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {kpi.changeType === 'positive' ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : kpi.changeType === 'negative' ? (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className={`text-sm ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 
                      kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {Math.abs(kpi.change)}%
                    </span>
                  </div>

                  {kpi.target && kpi.progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Meta: {kpi.target}</span>
                        <span>{kpi.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={kpi.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita vs Meta */}
        <Card>
          <CardHeader>
            <CardTitle>Receita vs Meta</CardTitle>
            <CardDescription>Performance mensal comparada às metas estabelecidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Receita"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    name="Meta"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Canal */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Canal</CardTitle>
            <CardDescription>Distribuição percentual das vendas pelos canais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendência de Lucro */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Lucro</CardTitle>
          <CardDescription>Análise mensal da margem de lucro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Lucro']}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Alertas e Notificações</CardTitle>
            <CardDescription>Monitoramento de situações que requerem atenção</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalAlerts.map((alert, index) => {
              const AlertIcon = getAlertIcon(alert.type, alert.severity);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertIcon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1 opacity-90">{alert.description}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}