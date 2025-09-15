
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Brain, Lightbulb, TrendingUp } from "lucide-react";
import MLPricingInsights from "@/components/analytics/MLPricingInsights";
import MarketTrendAnalysis from "@/components/analytics/MarketTrendAnalysis";
import CompetitorAlerts from "@/components/analytics/CompetitorAlerts";
import PersonalizedRecommendations from "@/components/analytics/PersonalizedRecommendations";

interface ProductSettings {
  category: string;
  currentPrice: number;
  cost: number;
  margin: number;
  salesVolume: number;
}

interface IntelligenceTabsProps {
  selectedProduct: ProductSettings;
  timeframe: '7d' | '30d' | '90d';
}

export default function IntelligenceTabs({ selectedProduct, timeframe }: IntelligenceTabsProps) {
  const mockCompetitors = [
    { name: "Concorrente A", price: 285.90, marketShare: 15 },
    { name: "Marketplace B", price: 310.50, marketShare: 25 },
    { name: "Loja C", price: 275.00, marketShare: 12 }
  ];

  const mockSalesData = {
    volume: 150,
    trend: 'growing' as const
  };

  return (
    <Tabs defaultValue="ml-pricing" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="ml-pricing" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          IA de Preços
        </TabsTrigger>
        <TabsTrigger value="market-trends" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Tendências
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Alertas
        </TabsTrigger>
        <TabsTrigger value="recommendations" className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Recomendações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ml-pricing" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MLPricingInsights
            currentPrice={selectedProduct.currentPrice}
            cost={180.00}
            category={selectedProduct.category}
            salesData={mockSalesData}
            competitors={mockCompetitors}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Análise de Sensibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Impacto de Mudanças de Preço</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>+5% no preço:</span>
                      <span className="text-red-600">-8% volume, +12% receita</span>
                    </div>
                    <div className="flex justify-between">
                      <span>-5% no preço:</span>
                      <span className="text-green-600">+15% volume, +6% receita</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço ótimo:</span>
                      <span className="font-semibold text-purple-600">R$ 295,90</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-600">
                    💡 Baseado em análise de elasticidade de preço e comportamento histórico de 50.000+ produtos similares
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="market-trends" className="space-y-6">
        <MarketTrendAnalysis 
          category={selectedProduct.category}
          timeframe={timeframe}
        />
      </TabsContent>

      <TabsContent value="alerts" className="space-y-6">
        <CompetitorAlerts />
      </TabsContent>

      <TabsContent value="recommendations" className="space-y-6">
        <PersonalizedRecommendations 
          currentProduct={selectedProduct}
        />
      </TabsContent>
    </Tabs>
  );
}
