
import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PricingMetrics from "@/components/analytics/PricingMetrics";
import RevenueProjections from "@/components/analytics/RevenueProjections";
import MarginAnalysis from "@/components/analytics/MarginAnalysis";
import EnhancedUsageMetrics from "@/components/analytics/EnhancedUsageMetrics";
import { 
  Activity, 
  BarChart3, 
  Brain, 
  Crown, 
  DollarSign, 
  Target,
  TrendingUp,
  Users
} from "lucide-react";

export default function AdvancedAnalyticsDashboard() {
  const canonical = globalThis.window === undefined 
    ? "https://azuria.plus/analytics/advanced" 
    : `${globalThis.window.location.origin}/analytics/advanced`;
  const quickStats = [
    {
      label: "Revenue Impact Hoje",
      value: "R$ 12.4k",
      change: "+18.7%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      label: "Produtos Otimizados",
      value: "156",
      change: "+23 hoje",
      icon: Target,
      color: "text-blue-600"
    },
    {
      label: "Usuários PRO Ativos",
      value: "89",
      change: "+12.3%",
      icon: Crown,
      color: "text-purple-600"
    },
    {
      label: "IA Recommendations",
      value: "1,247",
      change: "+156%",
      icon: Brain,
      color: "text-indigo-600"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Analytics Avançado - Azuria+</title>
        <meta
          name="description"
          content="Métricas avançadas, projeções e insights de IA para otimizar precificação e margens em tempo real."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-7 w-7 text-brand-600" />
                <h1 className="text-3xl font-bold text-gray-800">Analytics Avançado</h1>
                <Badge className="bg-brand-600">PRO</Badge>
              </div>
              <p className="text-gray-600 max-w-3xl">
                Dashboard completo com métricas de precificação, projeções de receita e insights inteligentes 
                para otimização de margem e performance de vendas.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      <Badge variant="outline" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="bg-brand-50 p-1">
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Métricas de Precificação
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Projeções de Receita
            </TabsTrigger>
            <TabsTrigger value="margins" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Análise de Margem
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Uso e Engajamento
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing" className="space-y-6">
            <PricingMetrics />
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-6">
            <RevenueProjections />
          </TabsContent>
          
          <TabsContent value="margins" className="space-y-6">
            <MarginAnalysis />
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-6">
            <EnhancedUsageMetrics />
          </TabsContent>
        </Tabs>

        {/* Call to Action para Non-PRO Users */}
        <Card className="mt-8 bg-gradient-to-r from-brand-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Maximize seus Resultados com PRO</h3>
                <p className="opacity-90 mb-4">
                  Acesse relatórios personalizados, alertas inteligentes e insights avançados 
                  para tomar decisões estratégicas baseadas em dados.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Dashboards em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>IA personalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span>Relatórios ilimitados</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <button className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Fazer Upgrade PRO
                </button>
                <p className="text-xs opacity-75 mt-2">
                  7 dias grátis • Cancele quando quiser
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
