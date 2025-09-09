
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Brain, Crown, Zap } from "lucide-react";
import BatchConfigurationPanel from "./intelligent-batch/BatchConfigurationPanel";
import AIInsightsPanel from "./intelligent-batch/AIInsightsPanel";
import CompetitiveAnalysisPanel from "./intelligent-batch/CompetitiveAnalysisPanel";
import ScenarioSimulationPanel from "./intelligent-batch/ScenarioSimulationPanel";
import BatchResultsTable from "./intelligent-batch/BatchResultsTable";
import ExportOptionsPanel from "./intelligent-batch/ExportOptionsPanel";
import { useToast } from "@/hooks/use-toast";
import type { AIInsightsData, AIRecommendation, BatchItem as SharedBatchItem } from "./intelligent-batch/types";

interface IntelligentBatchCalculatorProps {
  isPro: boolean;
  userId?: string;
}

type BatchItem = SharedBatchItem;

export default function IntelligentBatchCalculator({ isPro, userId }: IntelligentBatchCalculatorProps) {
  void userId; // keep signature without unused var warnings
  const { toast } = useToast();
  const [batches, setBatches] = useState<BatchItem[]>([
    {
      id: "1",
      quantity: 10,
      unitCost: 100,
      discountPercent: 0,
      targetMargin: 30
    }
  ]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [category, setCategory] = useState("eletrônicos");
  const [marketCondition, setMarketCondition] = useState<'high' | 'medium' | 'low'>('medium');
  const [aiInsights, setAIInsights] = useState<AIInsightsData | null>(null);

  const runIntelligentAnalysis = async () => {
    if (!isPro) {
      toast({
        title: "Recurso PRO",
        description: "A análise inteligente está disponível apenas para usuários PRO.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simular análise de IA avançada
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
  const insights: AIInsightsData = {
        optimalQuantities: [25, 50, 100, 250],
        recommendedDiscounts: [0, 5, 12, 20],
        marketAnalysis: {
          competitorAvgPrice: 145.90,
          demandElasticity: 1.2,
          seasonalFactor: 1.05,
          priceOpportunity: "Mercado tem espaço para preços 8% acima da média"
        },
        aiRecommendations: [
          {
            quantity: 25,
            suggestedPrice: 142.50,
            reasoning: "Preço premium para lotes pequenos com alta margem",
            confidence: 87
          },
          {
            quantity: 50,
            suggestedPrice: 138.90,
            reasoning: "Equilíbrio entre margem e competitividade",
            confidence: 92
          },
          {
            quantity: 100,
            suggestedPrice: 135.20,
            reasoning: "Preço competitivo para volume médio",
            confidence: 89
          },
          {
            quantity: 250,
            suggestedPrice: 129.90,
            reasoning: "Preço agressivo para volume alto, foco em market share",
            confidence: 94
          }
        ]
      };

      setAIInsights(insights);
      
      // Atualizar batches com sugestões de IA
  const updatedBatches = insights.aiRecommendations.map((rec: AIRecommendation, index: number) => ({
        id: (index + 1).toString(),
        quantity: rec.quantity,
        unitCost: 100,
        discountPercent: (insights.recommendedDiscounts ?? [0,0,0,0])[index] ?? 0,
        targetMargin: 30,
        aiSuggestedPrice: rec.suggestedPrice,
        competitivePrice: insights.marketAnalysis.competitorAvgPrice * (0.95 + Math.random() * 0.1)
      }));

      setBatches(updatedBatches);
      
      toast({
        title: "Análise Inteligente Concluída",
        description: `IA analisou ${updatedBatches.length} cenários otimizados para sua estratégia.`,
      });
  } catch (_error) {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível completar a análise inteligente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Header com IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            Calculadora em Lote Inteligente
            {isPro && <Badge className="bg-purple-600">PRO</Badge>}
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Precificação estratégica com IA, análise competitiva e simulação de cenários avançados
            </p>
            <Button
              onClick={runIntelligentAnalysis}
              disabled={isAnalyzing || !isPro}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Análise Inteligente
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {!isPro && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-800">Upgrade para PRO</h3>
                  <p className="text-sm text-amber-700">
                    Desbloqueie análise de IA, insights competitivos e exportação avançada
                  </p>
                </div>
              </div>
              <Button className="bg-amber-600 hover:bg-amber-700">
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="configuration">Configuração</TabsTrigger>
          <TabsTrigger value="ai-insights" disabled={!isPro || !aiInsights}>
            IA Insights
          </TabsTrigger>
          <TabsTrigger value="competitive" disabled={!isPro}>
            Competitiva
          </TabsTrigger>
          <TabsTrigger value="scenarios" disabled={!isPro}>
            Cenários
          </TabsTrigger>
          <TabsTrigger value="export" disabled={!isPro}>
            Exportar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <BatchConfigurationPanel
            batches={batches}
            setBatches={setBatches}
            category={category}
            setCategory={setCategory}
            marketCondition={marketCondition}
            setMarketCondition={setMarketCondition}
            isPro={isPro}
          />
          <BatchResultsTable batches={batches} isPro={isPro} />
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          {aiInsights && (
            <AIInsightsPanel 
              insights={aiInsights} 
              batches={batches}
              setBatches={setBatches}
            />
          )}
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <CompetitiveAnalysisPanel 
            batches={batches}
            category={category}
            isPro={isPro}
          />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioSimulationPanel 
            batches={batches}
            setBatches={setBatches}
            isPro={isPro}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportOptionsPanel 
            batches={batches}
            aiInsights={aiInsights}
            isPro={isPro}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
