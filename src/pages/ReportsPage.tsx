import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ExportOptions from "@/components/reports/ExportOptions";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import MarketplaceIntelligence from "@/components/intelligence/MarketplaceIntelligence";
import RealTimeMetricsDashboard from "@/components/analytics/RealTimeMetricsDashboard";
import CompetitorAlerts from "@/components/analytics/CompetitorAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BarChart3, Bell, Download, TrendingUp } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ReportsPage() {
  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-accent">
              Relatórios e Inteligência
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Analise o desempenho, exporte dados, configure notificações inteligentes 
              e monitore a concorrência em tempo real.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas
                </TabsTrigger>
                <TabsTrigger value="exports" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportações
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Inteligência
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <RealTimeMetricsDashboard />
              </TabsContent>

              <TabsContent value="alerts" className="mt-6">
                <CompetitorAlerts />
              </TabsContent>

              <TabsContent value="exports" className="mt-6">
                <ExportOptions />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <NotificationCenter />
              </TabsContent>

              <TabsContent value="intelligence" className="mt-6">
                <MarketplaceIntelligence />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
