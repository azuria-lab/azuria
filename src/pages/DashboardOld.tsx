import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/domains/auth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  History,
  LayoutTemplate,
  Loader2,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { logger } from "@/services/logger";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Redirecionar se não estiver autenticado
    if (!isAuthenticated) {
      navigate("/entrar", { replace: true });
      return;
    }

    // Definir saudação baseada no horário
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Bom dia");
    } else if (hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }

    logger.info("📊 Dashboard carregado", { user: user?.email });
  }, [isAuthenticated, navigate, user]);

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

  const stats = [
    {
      title: "Cálculos Hoje",
      value: "0",
      change: "+0%",
      icon: Calculator,
      trend: "up",
    },
    {
      title: "Economia Total",
      value: "R$ 0,00",
      change: "+0%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Produtos Analisados",
      value: "0",
      change: "+0%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Tempo Economizado",
      value: "0h",
      change: "+0%",
      icon: Clock,
      trend: "up",
    },
  ];

  const recentActivity = [
    {
      title: "Bem-vindo ao Azuria!",
      description: "Comece calculando seu primeiro preço",
      time: "Agora",
      icon: CheckCircle2,
      color: "text-green-500",
    },
  ];

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {greeting}, {user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário"}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Pronto para maximizar seus lucros hoje?
                </p>
              </div>
              <Button
                onClick={() => navigate("/calculadora-simples")}
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white group"
              >
                Começar a Calcular
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
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
                        <p className={`text-sm mt-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {stat.change} vs ontem
                        </p>
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
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`${activity.color} mt-1`}>
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
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
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Use Templates para Ganhar Tempo</h4>
                      <p className="text-sm text-brand-50">
                        Crie templates dos seus produtos mais vendidos e economize até 80% do tempo em
                        cálculos repetitivos.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-brand-600 hover:bg-brand-50"
                      onClick={() => navigate("/templates")}
                    >
                      Ver Templates
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
