
import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bot, Brain, Target, TrendingUp, Zap } from "lucide-react";

// Importar os novos componentes de IA
import PriceOptimizationEngine from "@/components/ai/PriceOptimizationEngine";
import MarketTrendAnalyzer from "@/components/ai/MarketTrendAnalyzer";
import IntelligentPricingSuggestions from "@/components/ai/IntelligentPricingSuggestions";
import MLPricingInsights from "@/components/analytics/MLPricingInsights";

export default function AIPage() {
  const [optimizedPrice, setOptimizedPrice] = useState<number | null>(null);

  const handleOptimizedPrice = (price: number) => {
    setOptimizedPrice(price);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4 space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Inteligência Artificial</h1>
              <p className="text-gray-600">Precificação inteligente com tecnologia de ponta</p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              IA Avançada
            </Badge>
          </div>
          
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Zap className="h-3 w-3 mr-1" />
              Análise em Tempo Real
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Target className="h-3 w-3 mr-1" />
              95% Precisão
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Bot className="h-3 w-3 mr-1" />
              Machine Learning
            </Badge>
          </div>
        </div>

        {/* Tabs de IA */}
        <Tabs defaultValue="optimization" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Otimização
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Insights ML
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendências
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sugestões
            </TabsTrigger>
          </TabsList>

          {/* Aba de Otimização de Preços */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PriceOptimizationEngine onOptimizedPrice={handleOptimizedPrice} />
              </div>
              
              <div className="space-y-4">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      Status da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Algoritmo ML</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Ativo</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Precisão</span>
                      <span className="font-semibold">94.7%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dados Analisados</span>
                      <span className="font-semibold">12.5M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Última Atualização</span>
                      <span className="text-gray-500">2min atrás</span>
                    </div>
                  </CardContent>
                </Card>

                {optimizedPrice && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Resultado IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Preço Otimizado</p>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {optimizedPrice.toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Baseado em análise de mercado
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Aba de Insights ML */}
          <TabsContent value="insights" className="space-y-6">
            <MLPricingInsights 
              currentPrice={100}
              cost={70}
              category="eletrônicos"
              salesData={{ volume: 150, trend: 'growing' }}
              competitors={[
                { name: "Concorrente A", price: 95, marketShare: 25 },
                { name: "Concorrente B", price: 110, marketShare: 30 },
                { name: "Concorrente C", price: 88, marketShare: 20 }
              ]}
            />
          </TabsContent>

          {/* Aba de Análise de Tendências */}
          <TabsContent value="trends" className="space-y-6">
            <MarketTrendAnalyzer 
              category="Eletrônicos"
              region="sudeste"
            />
          </TabsContent>

          {/* Aba de Sugestões Inteligentes */}
          <TabsContent value="suggestions" className="space-y-6">
            <IntelligentPricingSuggestions />
          </TabsContent>
        </Tabs>

        {/* Rodapé com Informações */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Tecnologia de IA Avançada</h3>
            <p className="text-sm text-gray-600 mb-4">
              Nossa inteligência artificial utiliza algoritmos de machine learning para analisar milhões de pontos de dados 
              e fornecer recomendações de preços precisas e personalizadas para seu negócio.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>🧠 Deep Learning</span>
              <span>📊 Big Data Analytics</span>
              <span>🎯 Predição Comportamental</span>
              <span>⚡ Tempo Real</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
}
