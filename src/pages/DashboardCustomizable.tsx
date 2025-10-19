import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/domains/auth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import { UserLevelBadge } from "@/components/dashboard/UserLevelBadge";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  GripVertical,
  History,
  LayoutTemplate,
  Loader2,
  RotateCcw,
  Save,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function DashboardCustomizable() {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const { stats, activities, tip, userProfile, isLoading, trackTipActionClick } =
    useDashboardStats();
  const { layouts, hasCustomLayout, saveLayout, resetLayout, onLayoutChange } =
    useWidgetLayout();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/entrar", { replace: true });
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Bom dia");
    } else if (hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, [isAuthenticated, navigate]);

  const handleSaveLayout = () => {
    saveLayout(layouts);
    toast.success("Layout salvo!", {
      description: "Suas preferências foram salvas com sucesso.",
    });
  };

  const handleResetLayout = () => {
    resetLayout();
    toast.info("Layout resetado", {
      description: "O dashboard voltou para o layout padrão.",
    });
  };

  const statsData = [
    {
      title: "Cálculos Realizados",
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

  const quickActions = [
    {
      title: "Calculadora Simples",
      icon: Calculator,
      color: "bg-blue-500",
      path: "/calculadora-simples",
    },
    {
      title: "Calculadora Pro",
      icon: Sparkles,
      color: "bg-purple-500",
      path: "/calculadora-pro",
    },
    {
      title: "Histórico",
      icon: History,
      color: "bg-green-500",
      path: "/historico",
    },
    {
      title: "Templates",
      icon: LayoutTemplate,
      color: "bg-orange-500",
      path: "/templates",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      color: "bg-pink-500",
      path: "/analytics",
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard customizável...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <GripVertical className="h-8 w-8 text-brand-500" />
                  Dashboard Customizável
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {greeting}, {user?.user_metadata?.name || user?.email?.split("@")[0]}! Arraste
                  os cards para personalizar seu layout.
                </p>
                <div className="mt-3">
                  <UserLevelBadge profile={userProfile} />
                </div>
              </div>
              <div className="flex gap-2">
                {hasCustomLayout && (
                  <Button variant="outline" onClick={handleResetLayout}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                  </Button>
                )}
                <Button
                  onClick={handleSaveLayout}
                  className="bg-gradient-to-r from-brand-500 to-brand-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Layout
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Grid Layout */}
          <GridLayout
            className="layout"
            layout={layouts}
            cols={12}
            rowHeight={80}
            width={1200}
            onLayoutChange={onLayoutChange}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onResizeStart={() => setIsDragging(true)}
            onResizeStop={() => setIsDragging(false)}
            draggableHandle=".drag-handle"
            compactType="vertical"
            preventCollision={false}
          >
            {/* Widget: Stats */}
            <div key="stats" className={isDragging ? "dragging" : ""}>
              <Card className="h-full cursor-move shadow-lg">
                <CardHeader className="drag-handle pb-3 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      Estatísticas
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {statsData.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.title} className="flex items-center gap-3">
                          <div className="p-2 bg-brand-50 rounded-lg">
                            <Icon className="h-5 w-5 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{stat.title}</p>
                            <p className="text-lg font-bold">{stat.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Widget: Charts */}
            <div key="charts" className={isDragging ? "dragging" : ""}>
              <Card className="h-full cursor-move shadow-lg">
                <CardHeader className="drag-handle pb-3 cursor-grab active:cursor-grabbing">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    Gráficos de Desempenho
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DashboardCharts period={7} />
                </CardContent>
              </Card>
            </div>

            {/* Widget: Activities */}
            <div key="activities" className={isDragging ? "dragging" : ""}>
              <Card className="h-full cursor-move shadow-lg">
                <CardHeader className="drag-handle pb-3 cursor-grab active:cursor-grabbing">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <CheckCircle2 className={`h-5 w-5 ${activity.color} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Widget: Tip */}
            <div key="tip" className={isDragging ? "dragging" : ""}>
              <Card className="h-full cursor-move shadow-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                <CardHeader className="drag-handle pb-3 cursor-grab active:cursor-grabbing">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <GripVertical className="h-5 w-5" />
                    💡 Dica do Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tip && (
                    <>
                      <h4 className="font-semibold mb-2">{tip.title}</h4>
                      <p className="text-sm text-brand-50 mb-4">{tip.message}</p>
                      {tip.actionUrl && tip.actionLabel && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white text-brand-600 hover:bg-brand-50"
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Widget: Quick Actions */}
            <div key="quick-actions" className={isDragging ? "dragging" : ""}>
              <Card className="h-full cursor-move shadow-lg">
                <CardHeader className="drag-handle pb-3 cursor-grab active:cursor-grabbing">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.title}
                          onClick={() => navigate(action.path)}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`p-2 ${action.color} rounded-lg`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-center">{action.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </GridLayout>
        </div>
      </div>

      <style>{`
        .layout {
          position: relative;
        }
        .react-grid-item {
          transition: all 200ms ease;
        }
        .react-grid-item.dragging {
          opacity: 0.7;
          z-index: 100;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgb(var(--brand-500) / 0.2);
          opacity: 0.5;
          transition-duration: 100ms;
          z-index: 2;
          border-radius: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
