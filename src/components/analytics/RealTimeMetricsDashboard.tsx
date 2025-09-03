
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Package, 
  RefreshCw, 
  TrendingUp,
  Users
} from "lucide-react";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import MetricCard from "./dashboard/MetricCard";
import TrendsChart from "./dashboard/TrendsChart";
import CategoriesChart from "./dashboard/CategoriesChart";
import CompetitorChart from "./dashboard/CompetitorChart";
import VolumeChart from "./dashboard/VolumeChart";
import SystemStatus from "./dashboard/SystemStatus";

export default function RealTimeMetricsDashboard() {
  const { 
    realTimeMetrics, 
    priceData, 
    categoryData, 
    competitorData, 
    isRefreshing, 
    handleRefresh 
  } = useRealTimeMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Métricas em Tempo Real</h2>
          <p className="text-gray-600">Acompanhe o desempenho e tendências do mercado</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Usuários Ativos"
          value={realTimeMetrics.activeUsers}
          change={2.5}
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="Cálculos Hoje"
          value={realTimeMetrics.calculationsToday}
          change={8.2}
          icon={Package}
          color="bg-green-500"
        />
        <MetricCard
          title="Margem Média (%)"
          value={realTimeMetrics.avgMarginToday.toFixed(1)}
          change={-1.3}
          icon={TrendingUp}
          color="bg-orange-500"
        />
        <MetricCard
          title="Receita Potencial"
          value={`R$ ${realTimeMetrics.revenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={5.7}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="competition">Concorrência</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <TrendsChart data={priceData} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesChart data={categoryData} />
        </TabsContent>

        <TabsContent value="competition" className="space-y-4">
          <CompetitorChart data={competitorData} />
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <VolumeChart data={priceData} />
        </TabsContent>
      </Tabs>

      {/* Status em tempo real */}
      <SystemStatus />
    </div>
  );
}
