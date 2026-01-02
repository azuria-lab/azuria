
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import DashboardGreeting from '@/components/dashboard/DashboardGreeting';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowRight, 
  BarChart3, 
  Bell, 
  Brain,
  Calculator,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Loader2,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Workflow,
  Zap
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { useAllFeaturesData } from '@/hooks/useAllFeaturesData';
import { format } from 'date-fns';

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Buscar dados reais do dashboard
  const { stats, activities, isLoading: statsLoading } = useDashboardStats();
  
  // Buscar dados de todas as funcionalidades
  const allFeaturesData = useAllFeaturesData();
  
  // Estados para controlar os períodos dos gráficos
  const [ticketMedioPeriod, setTicketMedioPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  const [valorFaturadoPeriod, setValorFaturadoPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  const [quantidadePedidosPeriod, setQuantidadePedidosPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  
  // Buscar dados dos gráficos baseado no período selecionado
  const ticketMedioCharts = useDashboardCharts(ticketMedioPeriod);
  const valorFaturadoCharts = useDashboardCharts(valorFaturadoPeriod);
  const quantidadeCharts = useDashboardCharts(quantidadePedidosPeriod);
  
  // Usar dados diretamente dos hooks
  const ticketMedioData = ticketMedioCharts.ticketMedio;
  const valorFaturadoData = valorFaturadoCharts.valorFaturado;
  const quantidadePedidosData = quantidadeCharts.quantidadeCalculos;
  
  // Calcular estatísticas derivadas dos dados reais
  const dashboardStats = useMemo(() => {
    const totalCalculations = stats.calculationsCount;
    const aiAnalysis = activities.filter(a => a.type === 'analysis' || a.type.includes('ai')).length;
    const profitOptimized = stats.totalSavings > 0 
      ? ((stats.totalSavings / (totalCalculations || 1)) / 100) * 100 
      : 0;
    const timesSaved = stats.timeSavedMinutes / 60; // Converter minutos para horas
    const weeklyGrowth = stats.change.calculations;
    
    return {
      totalCalculations,
      aiAnalysis,
      profitOptimized: Math.round(profitOptimized * 10) / 10,
      timesSaved: Math.round(timesSaved * 10) / 10,
      weeklyGrowth
    };
  }, [stats, activities]);


  // Função para calcular média (para ticket médio)
  const calculateAverage = (data: { value: number }[]): number => {
    if (data.length === 0) {return 0;}
    const sum = data.reduce((acc, item) => acc + item.value, 0);
    return sum / data.length;
  };

  // Função para calcular total (para valor faturado e quantidade)
  const calculateTotal = (data: { value: number }[]): number => {
    return data.reduce((acc, item) => acc + item.value, 0);
  };

  // Resumo diário baseado em dados reais
  const dailySummary = useMemo(() => {
    const todayActivities = activities.filter(a => {
      const activityDate = new Date(a.time);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    });
    
    const completedActivities = activities.filter(a => a.type === 'calculation');
    const aiActivities = activities.filter(a => a.type === 'analysis' || a.type.includes('ai'));
    
    return {
      calculations: {
        total: stats.calculationsCount,
        new: todayActivities.length,
        inProgress: 0, // Pode ser calculado se houver status nas atividades
        completed: completedActivities.length
      },
      aiAnalysis: {
        total: aiActivities.length,
        pending: 0, // Pode ser calculado se houver status
        completed: aiActivities.length
      },
      profit: {
        total: stats.totalSavings,
        optimized: stats.totalSavings * 0.15 // Estimativa de 15% de otimização
      },
      recentActivity: todayActivities.length
    };
  }, [stats, activities]);

  // Mapear atividades reais para o formato do componente
  const recentActivity = useMemo(() => {
    const iconMap: Record<string, typeof Calculator> = {
      calculation: Calculator,
      analysis: Brain,
      batch: Zap,
      template_created: BarChart3,
    };
    
    return activities.slice(0, 3).map(activity => ({
      type: activity.type,
      title: activity.title,
      description: activity.description,
      time: activity.time,
      icon: iconMap[activity.type] || CheckCircle2,
      status: 'completed' as const
    }));
  }, [activities]);

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
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  dashboardStats.totalCalculations
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.change.calculations !== 0 && (
                  <span className={`font-medium ${stats.change.calculations > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.change.calculations > 0 ? '+' : ''}{stats.change.calculations}%
                  </span>
                )}
                {' '}desde ontem
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
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  dashboardStats.aiAnalysis
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.change.products > 0 && (
                  <span className="text-green-600 font-medium">+{stats.change.products}%</span>
                )}
                {' '}esta semana
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
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  `+${dashboardStats.profitOptimized}%`
                )}
              </div>
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
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  `${dashboardStats.timesSaved}h`
                )}
              </div>
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

          {/* Todas as Funcionalidades - Visão Consolidada */}
          <Card>
            <CardHeader>
              <CardTitle>Todas as Funcionalidades</CardTitle>
              <CardDescription>Visão consolidada de todas as áreas do Azuria</CardDescription>
            </CardHeader>
            <CardContent>
              {allFeaturesData.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Cálculos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to="/calculadora-rapida">
                      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-sm">Cálculos</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.calculations.total}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Básicos: {allFeaturesData.calculations.basic}</div>
                              <div>Avançados: {allFeaturesData.calculations.advanced}</div>
                              <div>Templates: {allFeaturesData.calculations.templates}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* Marketplace */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Link to="/marketplace">
                      <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-purple-500" />
                            <CardTitle className="text-sm">Marketplace</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.marketplace.monitoredProducts}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Produtos monitorados</div>
                              <div>Alertas: {allFeaturesData.marketplace.priceAlerts}</div>
                              <div>Integrações: {allFeaturesData.marketplace.activeIntegrations}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* Colaboração */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Link to="/equipes">
                      <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <CardTitle className="text-sm">Colaboração</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.collaboration.teams}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Equipes</div>
                              <div>Membros: {allFeaturesData.collaboration.teamMembers}</div>
                              <div>Pendências: {allFeaturesData.collaboration.pendingApprovals}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* Automação */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Link to="/automatizacao">
                      <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Workflow className="h-5 w-5 text-orange-500" />
                            <CardTitle className="text-sm">Automação</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.automation.activeRules}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Regras ativas</div>
                              <div>Execuções: {allFeaturesData.automation.totalExecutions}</div>
                              <div>Alertas: {allFeaturesData.automation.alerts}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* Documentos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Link to="/documentos">
                      <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-500" />
                            <CardTitle className="text-sm">Documentos</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.documents.total}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Total de documentos</div>
                              <div>Válidos: {allFeaturesData.documents.valid}</div>
                              <div className="flex items-center gap-1">
                                <span>Expirando: </span>
                                {allFeaturesData.documents.expiring > 0 && (
                                  <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                                    {allFeaturesData.documents.expiring}
                                  </Badge>
                                )}
                                {allFeaturesData.documents.expiring === 0 && <span>0</span>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* Licitações */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Link to="/licitacoes">
                      <Card className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Gavel className="h-5 w-5 text-indigo-500" />
                            <CardTitle className="text-sm">Licitações</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.bidding.editais}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Editais detectados</div>
                              <div>Alertas: {allFeaturesData.bidding.alerts}</div>
                              <div>Portais: {allFeaturesData.bidding.portals}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* Analytics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Link to="/analytics">
                      <Card className="border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-cyan-500" />
                            <CardTitle className="text-sm">Analytics</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.analytics.businessMetrics}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Métricas de negócio</div>
                              <div>Vendas: {allFeaturesData.analytics.salesRecords}</div>
                              <div>Produtos: {allFeaturesData.analytics.productPerformance}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* IA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <Link to="/ia">
                      <Card className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-pink-500" />
                            <CardTitle className="text-sm">Inteligência Artificial</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{allFeaturesData.ai.totalInteractions}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Interações totais</div>
                              <div>Sugestões: {allFeaturesData.ai.suggestions}</div>
                              <div>Padrões: {allFeaturesData.ai.behaviorPatterns}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                </div>
              )}
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
                    <div className="text-xl sm:text-2xl font-bold mt-1">
                      {formatCurrency(calculateAverage(ticketMedioData))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant={ticketMedioPeriod === '7D' ? 'default' : 'outline'} 
                      size="sm" 
                      className="h-8 sm:h-7 text-xs min-h-[32px]"
                      onClick={() => setTicketMedioPeriod('7D')}
                    >
                      7D
                    </Button>
                    <Button 
                      variant={ticketMedioPeriod === '30D' ? 'default' : 'outline'} 
                      size="sm" 
                      className="h-8 sm:h-7 text-xs min-h-[32px]"
                      onClick={() => setTicketMedioPeriod('30D')}
                    >
                      30D
                    </Button>
                    <Button 
                      variant={ticketMedioPeriod === '90D' ? 'default' : 'outline'} 
                      size="sm" 
                      className="h-8 sm:h-7 text-xs min-h-[32px]"
                      onClick={() => setTicketMedioPeriod('90D')}
                    >
                      90D
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">
                  Atualizado em: {format(new Date(), 'dd/MM')} às {format(new Date(), 'HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-48 sm:h-64">
                  {ticketMedioCharts.isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : ticketMedioData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  ) : (
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
                        formatter={(value: number) => [formatCurrency(value), 'Valor']}
                        labelFormatter={(label) => `Data: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Valor"
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Valor Faturado */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Valor Faturado</CardTitle>
                    <div className="text-xl sm:text-2xl font-bold mt-1">
                      {formatCurrency(calculateTotal(valorFaturadoData))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant={valorFaturadoPeriod === '7D' ? 'default' : 'outline'} 
                      size="sm" 
                      className="h-8 sm:h-7 text-xs min-h-[32px]"
                      onClick={() => setValorFaturadoPeriod('7D')}
                    >
                      7D
                    </Button>
                    <Button 
                      variant={valorFaturadoPeriod === '30D' ? 'default' : 'outline'} 
                      size="sm" 
                      className="h-8 sm:h-7 text-xs min-h-[32px]"
                      onClick={() => setValorFaturadoPeriod('30D')}
                    >
                      30D
                    </Button>
                    <Button 
                      variant={valorFaturadoPeriod === '90D' ? 'default' : 'outline'} 
                      size="sm" 
                      className="h-8 sm:h-7 text-xs min-h-[32px]"
                      onClick={() => setValorFaturadoPeriod('90D')}
                    >
                      90D
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">
                  Atualizado em: {format(new Date(), 'dd/MM')} às {format(new Date(), 'HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-48 sm:h-64">
                  {valorFaturadoCharts.isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : valorFaturadoData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  ) : (
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
                        formatter={(value: number) => [formatCurrency(value), 'Valor']}
                        labelFormatter={(label) => `Data: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Valor"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
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
                  <div className="text-xl sm:text-2xl font-bold mt-1">
                    {calculateTotal(quantidadePedidosData)} cálculos
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant={quantidadePedidosPeriod === '7D' ? 'default' : 'outline'} 
                    size="sm" 
                    className="h-8 sm:h-7 text-xs min-h-[32px]"
                    onClick={() => setQuantidadePedidosPeriod('7D')}
                  >
                    7D
                  </Button>
                  <Button 
                    variant={quantidadePedidosPeriod === '30D' ? 'default' : 'outline'} 
                    size="sm" 
                    className="h-8 sm:h-7 text-xs min-h-[32px]"
                    onClick={() => setQuantidadePedidosPeriod('30D')}
                  >
                    30D
                  </Button>
                  <Button 
                    variant={quantidadePedidosPeriod === '90D' ? 'default' : 'outline'} 
                    size="sm" 
                    className="h-8 sm:h-7 text-xs min-h-[32px]"
                    onClick={() => setQuantidadePedidosPeriod('90D')}
                  >
                    90D
                  </Button>
                </div>
              </div>
              <CardDescription className="text-xs mt-2">
                Atualizado em: {format(new Date(), 'dd/MM')} às {format(new Date(), 'HH:mm')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-64">
                {quantidadeCharts.isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : quantidadePedidosData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Nenhum dado disponível para o período selecionado
                  </div>
                ) : (
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
                      formatter={(value: number) => [`${value} cálculos`, 'Quantidade']}
                      labelFormatter={(label) => `Data: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Quantidade"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                )}
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
                      <span className={stats.change.calculations >= 0 ? "text-green-600" : "text-red-600"}>
                        {stats.change.calculations > 0 ? '+' : ''}{stats.change.calculations}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Análises IA</span>
                    <span className="text-sm font-medium">
                      <span className={stats.change.products >= 0 ? "text-green-600" : "text-red-600"}>
                        {stats.change.products > 0 ? '+' : ''}{stats.change.products}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lucro Otimizado</span>
                    <span className="text-sm font-medium">
                      <span className={stats.change.savings >= 0 ? "text-green-600" : "text-red-600"}>
                        {stats.change.savings > 0 ? '+' : ''}{stats.change.savings}%
                      </span>
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
