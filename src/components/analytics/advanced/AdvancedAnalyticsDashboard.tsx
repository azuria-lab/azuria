
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealTimeAnalytics } from "@/hooks/useRealTimeAnalytics";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import RealTimeMetrics from "./RealTimeMetrics";
import BusinessMetrics from "./BusinessMetrics";
import PerformanceMetrics from "./PerformanceMetrics";
import CustomEventsPanel from "./CustomEventsPanel";
import ExportPanel from "./ExportPanel";
import { 
  Activity, 
  BarChart3, 
  DollarSign, 
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  Users
} from "lucide-react";

export default function AdvancedAnalyticsDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('today');
  const [segment, setSegment] = useState<'all' | 'free' | 'pro'>('all');
  const [showExport, setShowExport] = useState(false);

  const { 
    analytics, 
    isRefreshing, 
    lastUpdated, 
    refreshAnalytics 
  } = useRealTimeAnalytics({ period, segment });

  const { 
    businessMetrics, 
    cohortData, 
    trends, 
    isLoading 
  } = useBusinessMetrics();

  const quickStats = [
    {
      label: "Usuários Ativos",
      value: analytics.dailyActiveUsers,
      change: `+${analytics.userGrowth.toFixed(1)}%`,
      icon: Users,
      color: "bg-blue-500"
    },
    {
      label: "Cálculos Hoje",
      value: analytics.calculationsToday,
      change: "+12.3%",
      icon: Activity,
      color: "bg-green-500"
    },
    {
      label: "Taxa de Conversão",
      value: `${analytics.conversionRate.toFixed(1)}%`,
      change: `+${(analytics.conversionRate * 0.1).toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-purple-500"
    },
    {
      label: "Impacto na Receita",
      value: `R$ ${(analytics.revenueImpact / 1000).toFixed(1)}k`,
      change: "+18.7%",
      icon: DollarSign,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Analytics Avançado</h1>
              <Badge className="bg-blue-600">Tempo Real</Badge>
            </div>
            <p className="text-gray-600">
              Dashboard completo com métricas em tempo real e insights de negócio
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAnalytics}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">7 dias</SelectItem>
              <SelectItem value="month">30 dias</SelectItem>
              <SelectItem value="quarter">3 meses</SelectItem>
              <SelectItem value="year">1 ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={segment} onValueChange={(value: any) => setSegment(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="free">Gratuito</SelectItem>
              <SelectItem value="pro">PRO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Export Panel */}
        {showExport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <ExportPanel onClose={() => setShowExport(false)} />
          </motion.div>
        )}

        {/* Analytics Tabs */}
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tempo Real
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Negócio
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeMetrics 
              analytics={analytics} 
              trends={trends}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <BusinessMetrics 
              businessMetrics={businessMetrics}
              cohortData={cohortData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics 
              performanceScore={analytics.performanceScore}
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <CustomEventsPanel />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
