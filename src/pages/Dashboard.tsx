import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/domains/auth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { UserLevelBadge } from "@/components/dashboard/UserLevelBadge";
import { getGreetingWithName } from "@/utils/greetings";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  GripVertical,
  History,
  LayoutTemplate,
  Loader2,
  Plug,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";
import { logger } from "@/services/logger";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading, userProfile: authUserProfile } = useAuthContext();
  const navigate = useNavigate();
  const previousNotificationCountRef = useRef(0);
  
  // Hook com dados reais do banco
  const { stats, activities, notifications, tip, userProfile, isLoading, trackTipActionClick } = useDashboardStats();

  // Use userProfile do dashboard ou do auth (fallback) e extrair nome
  const currentUserProfile = userProfile || authUserProfile;
  const userName = 
    (currentUserProfile && 'name' in currentUserProfile ? currentUserProfile.name : null) ||
    user?.user_metadata?.name || 
    user?.email?.split("@")[0] || 
    "Usuário";
  const greeting = getGreetingWithName(userName);

  // Toast para novas notificações
  useEffect(() => {
    if (notifications.length > previousNotificationCountRef.current && previousNotificationCountRef.current > 0) {
      const newNotification = notifications[0]; // Mais recente
      const icon = getNotificationIcon(newNotification.type);
      const toastFn = getToastFunction(newNotification.type);
      
      toastFn(newNotification.title, {
        description: newNotification.message,
        icon,
        duration: 5000,
      });
    }
    previousNotificationCountRef.current = notifications.length;
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
      case "error": return "❌";
      default: return "🔔";
    }
  };

  const getToastFunction = (type: string) => {
    switch (type) {
      case "success": return toast.success;
      case "warning": return toast.warning;
      case "info": return toast.info;
      case "error": return toast.error;
      default: return toast;
    }
  };

  useEffect(() => {
    // Verificar localStorage primeiro (fallback enquanto carrega)
    const wasAuthenticated = localStorage.getItem('azuria_authenticated') === 'true';
    
    // Não redirecionar se ainda estiver carregando OU se estava autenticado
    if (authLoading || wasAuthenticated) {
      if (wasAuthenticated) {
        logger.info("✅ Autenticação detectada no localStorage, aguardando carregamento...");
      }
      return;
    }

    // Redirecionar se não estiver autenticado E não estava autenticado antes
    if (!isAuthenticated && !wasAuthenticated) {
      logger.info("❌ Usuário não autenticado, redirecionando para login");
      navigate("/entrar", { replace: true });
      return;
    }

    logger.info("📊 Dashboard carregado", { user: user?.email });
  }, [isAuthenticated, authLoading, navigate, user]);

  const quickActions = [
    {
      title: "Calculadora Simples",
      description: "Calcule preços rapidamente",
      icon: Calculator,
      color: "bg-blue-500",
      path: "/calculadora-simples",
    },
    {
      title: "Calculadora Pro",
      description: "Recursos avançados de precificação",
      icon: Sparkles,
      color: "bg-purple-500",
      path: "/calculadora-pro",
    },
    {
      title: "Histórico",
      description: "Veja seus cálculos anteriores",
      icon: History,
      color: "bg-green-500",
      path: "/historico",
    },
    {
      title: "Templates",
      description: "Use modelos prontos",
      icon: LayoutTemplate,
      color: "bg-orange-500",
      path: "/templates",
    },
    {
      title: "Analytics",
      description: "Análise de dados e métricas",
      icon: BarChart3,
      color: "bg-pink-500",
      path: "/analytics",
    },
    {
      title: "Marketplace",
      description: "Compare marketplaces",
      icon: ShoppingCart,
      color: "bg-indigo-500",
      path: "/marketplace",
    },
  ];

  // Configuração dos cards de estatísticas com dados reais
  const statsCards = [
    {
      title: "Cálculos Hoje",
      value: stats.calculationsCount.toString(),
      change: `${stats.change.calculations >= 0 ? "+" : ""}${stats.change.calculations}%`,
      icon: Calculator,
      trend: stats.change.calculations >= 0 ? "up" : "down",
    },
    {
      title: "Economia Total",
      value: `R$ ${stats.totalSavings.toFixed(2)}`,
      change: `${stats.change.savings >= 0 ? "+" : ""}${stats.change.savings}%`,
      icon: DollarSign,
      trend: stats.change.savings >= 0 ? "up" : "down",
    },
    {
      title: "Produtos Analisados",
      value: stats.productsAnalyzed.toString(),
      change: `${stats.change.products >= 0 ? "+" : ""}${stats.change.products}%`,
      icon: ShoppingCart,
      trend: stats.change.products >= 0 ? "up" : "down",
    },
    {
      title: "Tempo Economizado",
      value: `${Math.floor(stats.timeSavedMinutes / 60)}h ${stats.timeSavedMinutes % 60}min`,
      change: `${stats.change.time >= 0 ? "+" : ""}${stats.change.time}%`,
      icon: Clock,
      trend: stats.change.time >= 0 ? "up" : "down",
    },
  ];

  // Atividades com fallback para usuário novo
  const displayActivities = activities.length > 0 ? activities : [
    {
      id: "welcome",
      title: "Bem-vindo ao Azuria!",
      description: "Comece calculando seu primeiro preço",
      time: "Agora",
      icon: "CheckCircle2",
      color: "text-green-500",
    },
  ];

  // Loading de autenticação
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Autenticando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading dos dados do dashboard
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header com Saudação */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {greeting}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Pronto para maximizar seus lucros hoje?
                </p>
                <div className="mt-3">
                  <UserLevelBadge profile={userProfile} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard-customizavel")}
                  className="group"
                >
                  <GripVertical className="h-4 w-4 mr-2" />
                  Layout Customizável
                </Button>
                <Button
                  onClick={() => navigate("/calculadora-simples")}
                  className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white group"
                >
                  Começar a Calcular
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {stat.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <p className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                            {stat.change} vs ontem
                          </p>
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-brand-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <motion.div
                      key={action.title}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-md transition-all border-2 border-transparent hover:border-brand-200"
                        onClick={() => navigate(action.path)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`${action.color} p-3 rounded-lg`}>
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráficos de Desempenho */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <DashboardCharts period={7} />
          </motion.div>

          {/* Atividade Recente e Dicas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividade Recente */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Suas últimas ações na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayActivities.slice(0, 5).map((activity) => {
                      // Mapeamento dinâmico de ícones baseado no tipo de atividade
                      const iconMap: Record<string, typeof CheckCircle2> = {
                        Calculator,
                        LayoutTemplate,
                        Download,
                        Upload,
                        BarChart3,
                        Plug,
                        CheckCircle2,
                      };
                      const ActivityIcon = iconMap[activity.icon] || CheckCircle2;
                      
                      return (
                        <div key={activity.id} className="flex items-start gap-4">
                          <div className={activity.color}>
                            <ActivityIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dicas e Sugestões */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                <CardHeader>
                  <CardTitle className="text-white">💡 Dica do Dia</CardTitle>
                  <CardDescription className="text-brand-100">
                    Maximize seus resultados com nossas sugestões
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tip ? (
                      <>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{tip.title}</h4>
                          <p className="text-sm text-brand-50">{tip.message}</p>
                        </div>
                        {tip.actionUrl && tip.actionLabel && (
                          <Button
                            variant="secondary"
                            className="w-full bg-white text-brand-600 hover:bg-brand-50"
                            onClick={() => {
                              if (tip.actionUrl) {
                                trackTipActionClick(tip.id);
                                navigate(tip.actionUrl);
                              }
                            }}
                          >
                            {tip.actionLabel}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Bem-vindo ao Azuria!</h4>
                        <p className="text-sm text-brand-50">
                          Explore todas as funcionalidades e maximize seus lucros com nossa plataforma.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
