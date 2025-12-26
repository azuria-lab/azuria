
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import DashboardGreeting from '@/components/dashboard/DashboardGreeting';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Brain, 
  Calculator, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardStats {
  totalCalculations: number;
  aiAnalysis: number;
  profitOptimized: number;
  timesSaved: number;
  weeklyGrowth: number;
}

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState<DashboardStats>({
    totalCalculations: 127,
    aiAnalysis: 23,
    profitOptimized: 15.5,
    timesSaved: 8.5,
    weeklyGrowth: 12.3
  });

  // Dados para gráficos
  const ticketMedioData = [
    { date: '10/Nov', value: 180 },
    { date: '15/Nov', value: 220 },
    { date: '20/Nov', value: 253 },
    { date: '24/Nov', value: 280 },
    { date: '28/Nov', value: 240 },
    { date: '01/Dez', value: 260 },
    { date: '05/Dez', value: 253 },
    { date: '08/Dez', value: 270 }
  ];

  const valorFaturadoData = [
    { date: '10/Nov', value: 1200 },
    { date: '15/Nov', value: 1800 },
    { date: '20/Nov', value: 2100 },
    { date: '24/Nov', value: 3200 },
    { date: '28/Nov', value: 1900 },
    { date: '01/Dez', value: 2800 },
    { date: '05/Dez', value: 2400 },
    { date: '08/Dez', value: 2600 }
  ];

  const quantidadePedidosData = [
    { date: '10/Nov', value: 5 },
    { date: '15/Nov', value: 8 },
    { date: '20/Nov', value: 10 },
    { date: '24/Nov', value: 12 },
    { date: '28/Nov', value: 8 },
    { date: '01/Dez', value: 11 },
    { date: '05/Dez', value: 9 },
    { date: '08/Dez', value: 10 }
  ];

  // Resumo diário
  const dailySummary = {
    calculations: {
      total: stats.totalCalculations,
      new: 5,
      inProgress: 2,
      completed: 120
    },
    aiAnalysis: {
      total: stats.aiAnalysis,
      pending: 1,
      completed: 22
    },
    profit: {
      total: 4810.63,
      optimized: 745.65
    },
    recentActivity: 3
  };

  const recentActivity = [
    {
      type: 'calculation',
      title: 'Calculadora Rápida',
      description: 'Produto: Smartphone XYZ - Margem: 25%',
      time: '2 min atrás',
      icon: Calculator,
      status: 'completed'
    },
    {
      type: 'ai',
      title: 'Análise de IA',
      description: 'Sugestão de preço otimizada aplicada',
      time: '15 min atrás',
      icon: Brain,
      status: 'completed'
    },
    {
      type: 'batch',
      title: 'Lote Inteligente',
      description: '3 lotes analisados com IA',
      time: '1 hora atrás',
      icon: Zap,
      status: 'inProgress'
    }
  ];

  const quickActions = [
    {
      title: 'Calculadora Rápida',
      description: 'Cálculo rápido de preços',
      link: '/calculadora-rapida',
      icon: Calculator,
      color: 'bg-blue-500'
    },
    {
      title: 'Lote Inteligente + IA',
      description: 'Precificação em massa com IA',
      link: '/calculadora-lotes-inteligente',
      icon: Zap,
      color: 'bg-purple-500',
      badge: 'Novo'
    },
    {
      title: 'IA para Preços',
      description: 'Otimização inteligente',
      link: '/ia',
      icon: Brain,
      color: 'bg-green-500',
      badge: 'PRO'
    },
    {
      title: 'Analytics',
      description: 'Métricas e relatórios',
      link: '/analytics',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ];

  const news = [
    {
      title: 'Nova regra para datas no controle de lote',
      description: 'Agora você pode tornar obrigatória a data de fabricação no lote.',
      date: '01/12/2024'
    },
    {
      title: 'Novo critério de DIFAL para não contribuinte PB',
      description: 'DIFAL na Paraíba agora conta com Base Única e Exclusão do ICMS.',
      date: '28/11/2024'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `Hoje às ${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <DashboardGreeting />

      {/* Métricas Principais - Cards Estilo Bling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cálculos</CardTitle>
              <Calculator className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalculations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium">+12</span> desde ontem
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Análises de IA</CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aiAnalysis}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium">+5</span> esta semana
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Otimizado</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.profitOptimized}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Margem média melhorada
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Economizado</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.timesSaved}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                Vs. cálculo manual
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 sm:py-2.5">Visão geral</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm py-2 sm:py-2.5">
            <span className="hidden sm:inline">Atividade</span>
            <span className="sm:hidden">Ativ.</span>
            {recentActivity.length > 0 && (
              <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs">
                {recentActivity.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 sm:py-2.5">Analytics</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Resumo Diário - Estilo Bling */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resumo Diário</CardTitle>
                  <CardDescription>Atualizado em tempo real</CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Cálculos */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-muted-foreground">Cálculos</span>
                  </div>
                  <div className="text-2xl font-bold">{dailySummary.calculations.total}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Novos:</span>
                      <span className="ml-1 font-medium text-green-600">{dailySummary.calculations.new}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Em andamento:</span>
                      <span className="ml-1 font-medium text-orange-600">{dailySummary.calculations.inProgress}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Concluídos:</span>
                      <span className="ml-1 font-medium">{dailySummary.calculations.completed}</span>
                    </div>
                  </div>
                </div>

                {/* Análises IA */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-muted-foreground">Análises de IA</span>
                  </div>
                  <div className="text-2xl font-bold">{dailySummary.aiAnalysis.total}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Pendentes:</span>
                      <span className="ml-1 font-medium text-orange-600">{dailySummary.aiAnalysis.pending}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Concluídas:</span>
                      <span className="ml-1 font-medium text-green-600">{dailySummary.aiAnalysis.completed}</span>
                    </div>
                  </div>
                </div>

                {/* Lucro */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-muted-foreground">Lucro Otimizado</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(dailySummary.profit.total)}</div>
                  <div className="text-xs text-muted-foreground">
                    <span>Economizado: </span>
                    <span className="font-medium text-green-600">{formatCurrency(dailySummary.profit.optimized)}</span>
                  </div>
                </div>

                {/* Atividade Recente */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-muted-foreground">Atividades Hoje</span>
                  </div>
                  <div className="text-2xl font-bold">{dailySummary.recentActivity}</div>
                  <div className="text-xs text-muted-foreground">Últimas ações</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos - Estilo Bling */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Ticket Médio */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Ticket Médio</CardTitle>
                    <div className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(253.19)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">7D</Button>
                    <Button variant="default" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">30D</Button>
                    <Button variant="outline" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">90D</Button>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">
                  Atualizado em: 01/12 às 23:50
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ticketMedioData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        stroke="#6b7280"
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        stroke="#6b7280"
                        tickFormatter={(value) => `R$ ${value}`}
                        width={50}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Valor Faturado */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Valor Faturado</CardTitle>
                    <div className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(4810.63)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">7D</Button>
                    <Button variant="default" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">30D</Button>
                    <Button variant="outline" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">90D</Button>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">
                  Atualizado em: 01/12 às 23:50
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={valorFaturadoData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        stroke="#6b7280"
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        stroke="#6b7280"
                        tickFormatter={(value) => `R$ ${value/1000}k`}
                        width={50}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quantidade de Pedidos */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">Quantidade de Cálculos</CardTitle>
                  <div className="text-xl sm:text-2xl font-bold mt-1">19 cálculos</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">7D</Button>
                  <Button variant="default" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">30D</Button>
                  <Button variant="outline" size="sm" className="h-8 sm:h-7 text-xs min-h-[32px]">90D</Button>
                </div>
              </div>
              <CardDescription className="text-xs mt-2">
                Atualizado em: 01/12 às 23:50
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quantidadePedidosData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      stroke="#6b7280"
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      stroke="#6b7280"
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas e Novidades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse suas ferramentas mais utilizadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.02, x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to={action.link}>
                      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer min-h-[60px]">
                        <div className={`p-2 rounded-lg ${action.color} flex-shrink-0`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm sm:text-base">{action.title}</h4>
                            {action.badge && (
                              <Badge variant={action.badge === 'PRO' ? 'default' : 'secondary'} className="text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Novidades */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Novidades no Azuria!</CardTitle>
                  <Link to="/changelog">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Versão 335 <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {news.map((item, index) => (
                  <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                    <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Atividade */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Suas últimas ações na plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <activity.icon className={`h-4 w-4 ${
                      activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      {activity.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
              
              <Link to="/historico">
                <Button variant="outline" className="w-full mt-4">
                  Ver Todo Histórico
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Geral</CardTitle>
                <CardDescription>Métricas consolidadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Taxa de Sucesso</span>
                    <span className="text-lg font-bold text-green-600">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Tempo Médio</span>
                    <span className="text-lg font-bold">2.3s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Precisão IA</span>
                    <span className="text-lg font-bold text-blue-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução Semanal</CardTitle>
                <CardDescription>Comparativo com semana anterior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cálculos</span>
                    <span className="text-sm font-medium">
                      <span className="text-green-600">+{stats.weeklyGrowth}%</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Análises IA</span>
                    <span className="text-sm font-medium">
                      <span className="text-green-600">+8.2%</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lucro Otimizado</span>
                    <span className="text-sm font-medium">
                      <span className="text-green-600">+{stats.profitOptimized}%</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Banner de Upgrade PRO - Mais Discreto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-foreground">
                    Upgrade para PRO
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Acesse recursos avançados de IA, análise de concorrência e relatórios exclusivos
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span>IA ilimitada</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span>Análise competitiva</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span>Relatórios avançados</span>
                  </div>
                </div>
              </div>
              <Link to="/planos">
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    className="border-primary/20 hover:bg-primary/5 hover:border-primary/30 text-foreground font-normal"
                  >
                    Ver planos
                    <ArrowRight className="h-3.5 w-3.5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
