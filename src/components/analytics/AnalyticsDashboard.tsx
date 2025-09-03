
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsageMetrics from "./UsageMetrics";
import ConversionFunnel from "./ConversionFunnel";
import ChurnAnalysis from "./ChurnAnalysis";
import UserEngagement from "./UserEngagement";
import RealTimeDashboard from "./RealTimeDashboard";
import { LazyComponentLoader } from "@/components/performance/LazyComponentLoader";
import { Activity, BarChart3, Beaker, Eye, Thermometer, TrendingDown, Users } from "lucide-react";

export default function AnalyticsDashboard() {
  const LazyABTestingDashboard = () => (
    <LazyComponentLoader importFunc={() => import("./ABTestingDashboard").then(m => ({ default: m.ABTestingDashboard }))} />
  );
  const LazyHeatmapVisualization = () => (
    <LazyComponentLoader importFunc={() => import("./HeatmapVisualization").then(m => ({ default: m.HeatmapVisualization }))} />
  );
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Analytics & Métricas</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho e comportamento dos usuários do Precifica+
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Funil
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Churn
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Engajamento
          </TabsTrigger>
          <TabsTrigger value="abtesting" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            A/B Tests
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Heatmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <UsageMetrics />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeDashboard />
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <ConversionFunnel />
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <ChurnAnalysis />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <UserEngagement />
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <LazyABTestingDashboard />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <LazyHeatmapVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
}
