
import React from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricsSummary from "@/components/metrics/MetricsSummary";
import PricingChart from "@/components/metrics/PricingChart";
import RevenueMetrics from "@/components/metrics/RevenueMetrics";
import { ChartBar, DollarSign, TrendingUp } from "lucide-react";

export default function PricingMetricsDashboard() {
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <ChartBar className="h-7 w-7 text-brand-600" />
            <h1 className="text-3xl font-bold text-gray-800">Métricas de Precificação</h1>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Visualize dados e insights sobre sua estratégia de precificação. 
            Monitore margens, lucros e tendências para tomar decisões mais assertivas.
          </p>
        </motion.div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="bg-brand-50">
            <TabsTrigger value="summary">
              <DollarSign className="h-4 w-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita e Lucro
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            <MetricsSummary />
            <PricingChart />
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-6">
            <RevenueMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
