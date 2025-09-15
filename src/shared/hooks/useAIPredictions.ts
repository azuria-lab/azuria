
import { useCallback, useState } from "react";
import { MLPredictionResult, PredictiveAnalysis } from "@/types/ai";

interface ProductData {
  category: string;
  cost: number;
  currentPrice: number;
  salesHistory: Array<{ date: Date; quantity: number; price: number }>;
  competitors: Array<{ price: number; marketShare: number }>;
  seasonality: 'high' | 'medium' | 'low';
}

export const useAIPredictions = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mlResult, setMlResult] = useState<MLPredictionResult | null>(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);

  const generateMLPrediction = useCallback(async (productData: ProductData): Promise<MLPredictionResult> => {
    setIsAnalyzing(true);
    
    // Simular análise de ML complexa
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      // Algoritmo simulado de ML para precificação dinâmica
      const { cost, currentPrice, salesHistory, competitors, seasonality } = productData;
      
      // Análise de tendência histórica
      const recentSales = salesHistory.slice(-30);
      const avgSales = recentSales.reduce((sum, sale) => sum + sale.quantity, 0) / recentSales.length;
      const trendFactor = avgSales > 50 ? 1.1 : avgSales > 20 ? 1.0 : 0.9;
      
      // Análise de sazonalidade
      const seasonalityFactor = seasonality === 'high' ? 1.15 : seasonality === 'medium' ? 1.05 : 1.0;
      
      // Análise competitiva
      const competitorAvg = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length;
      const competitionFactor = currentPrice > competitorAvg ? 0.95 : 1.05;
      
      // Elasticidade de demanda simulada
      const elasticity = avgSales > 100 ? 0.8 : avgSales > 50 ? 1.0 : 1.2;
      
      // Preço sugerido pelo algoritmo ML
      const basePriceFromCost = cost * 1.4;
      const marketAdjustedPrice = competitorAvg * competitionFactor;
      const trendAdjustedPrice = marketAdjustedPrice * trendFactor * seasonalityFactor;
      
      const suggestedPrice = Math.max(basePriceFromCost, trendAdjustedPrice);
      
      // Cálculo de confiança baseado na qualidade dos dados
      const dataQuality = Math.min(1.0, (salesHistory.length / 90) + (competitors.length / 10));
      const confidence = dataQuality * 85 + Math.random() * 15;
      
      const mlResult: MLPredictionResult = {
        suggestedPrice: Number(suggestedPrice.toFixed(2)),
        confidence: Number(confidence.toFixed(1)),
        factors: {
          historical_trend: Number(((trendFactor - 1) * 100).toFixed(1)),
          seasonality: Number(((seasonalityFactor - 1) * 100).toFixed(1)),
          competition: Number(((competitionFactor - 1) * 100).toFixed(1)),
          demand_elasticity: Number(((2 - elasticity) * 50).toFixed(1)),
          market_conditions: Number((Math.random() * 20 - 10).toFixed(1))
        },
        reasoning: generateMLReasoning(trendFactor, seasonalityFactor, competitionFactor, elasticity),
        alternatives: [
          {
            price: suggestedPrice * 0.95,
            scenario: "Estratégia Agressiva",
            probability: 75
          },
          {
            price: suggestedPrice * 1.05,
            scenario: "Estratégia Premium",
            probability: 60
          },
          {
            price: suggestedPrice,
            scenario: "Estratégia Equilibrada",
            probability: 85
          }
        ]
      };
      
      setMlResult(mlResult);
      return mlResult;
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar predição de ML';
      throw new Error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generatePredictiveAnalysis = useCallback(async (productData: ProductData): Promise<PredictiveAnalysis> => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      // Simulação de análise preditiva avançada
      const baselineRevenue = productData.currentPrice * 100; // assumindo 100 unidades base
      
      const analysis: PredictiveAnalysis = {
        demandForecast: {
          next7Days: Array.from({ length: 7 }, (_, i) => 
            Math.floor(80 + Math.random() * 40 + Math.sin(i / 7 * Math.PI) * 20)
          ),
          next30Days: Array.from({ length: 30 }, (_, i) => 
            Math.floor(75 + Math.random() * 50 + Math.sin(i / 30 * Math.PI * 2) * 25)
          ),
          confidence: 78 + Math.random() * 15
        },
        competitionTrends: {
          avgPriceChange: Number((Math.random() * 10 - 5).toFixed(2)),
          marketShare: Number((15 + Math.random() * 25).toFixed(1)),
          threats: [
            "Novo concorrente com preços 15% menores",
            "Promoções sazonais do líder de mercado"
          ],
          opportunities: [
            "Demanda crescente por 20% no segmento",
            "Possibilidade de diferenciação premium"
          ]
        },
        priceOptimization: {
          optimalPrice: productData.currentPrice * (1 + (Math.random() * 0.2 - 0.1)),
          expectedRevenue: baselineRevenue * (1.1 + Math.random() * 0.3),
          riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          recommendation: "Ajuste gradual de preço com monitoramento da elasticidade de demanda"
        }
      };
      
      setPredictiveAnalysis(analysis);
      return analysis;
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na análise preditiva';
      throw new Error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateMLReasoning = (trend: number, seasonality: number, competition: number, elasticity: number): string => {
    const factors = [];
    
    if (trend > 1.05) {factors.push("tendência histórica positiva de vendas");}
    else if (trend < 0.95) {factors.push("declínio nas vendas recentes");}
    
    if (seasonality > 1.1) {factors.push("período de alta demanda sazonal");}
    else if (seasonality < 1.0) {factors.push("período de baixa sazonalidade");}
    
    if (competition > 1.0) {factors.push("oportunidade competitiva identificada");}
    else {factors.push("pressão competitiva no mercado");}
    
    if (elasticity < 1.0) {factors.push("baixa sensibilidade a preços dos consumidores");}
    else {factors.push("alta elasticidade de demanda detectada");}
    
    return `Análise baseada em: ${factors.join(", ")}. Algoritmo considera ${factors.length} fatores principais para otimização de receita.`;
  };

  return {
    isAnalyzing,
    mlResult,
    predictiveAnalysis,
    generateMLPrediction,
    generatePredictiveAnalysis,
    setMlResult,
    setPredictiveAnalysis
  };
};
