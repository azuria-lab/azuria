
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MLPredictionResult, PredictiveAnalysis } from "@/types/ai";

interface MarketData {
  category: string;
  cost: number;
  currentPrice: number;
  salesVolume: number;
  competitors: Array<{ price: number; marketShare: number }>;
  seasonality: 'low' | 'medium' | 'high';
  demandTrend: 'growing' | 'stable' | 'declining';
}

export const useMLPricing = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<MLPredictionResult | null>(null);
  const [analysis, setAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predictOptimalPrice = useCallback(async (marketData: MarketData) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Call AI price analysis function
      const { data, error: apiError } = await supabase.functions.invoke('ai-price-analysis', {
        body: {
          productName: `Produto ${marketData.category}`,
          cost: marketData.cost,
          currentPrice: marketData.currentPrice,
          category: marketData.category,
          targetMargin: 30, // Default margin
          competitors: marketData.competitors.map((comp, index) => ({
            name: `Concorrente ${index + 1}`,
            price: comp.price
          }))
        }
      });

      if (apiError) {
        throw new Error(apiError.message || 'Erro na análise de preços');
      }

      // Convert AI response to MLPredictionResult format
      const aiResult = data;
      
      // Calculate factors based on market data and AI analysis
      const factors = calculateMarketFactors(marketData, aiResult);
      
      const mlResult: MLPredictionResult = {
        suggestedPrice: aiResult.suggestedPrice,
        confidence: aiResult.confidence,
        factors: factors,
        reasoning: aiResult.analysis,
        alternatives: generateAlternatives(aiResult.suggestedPrice, marketData)
      };

      setPrediction(mlResult);

      // Generate predictive analysis
      const predictiveAnalysis: PredictiveAnalysis = {
        demandForecast: generateDemandForecast(marketData),
        competitionTrends: analyzeCompetition(marketData),
        priceOptimization: {
          optimalPrice: aiResult.suggestedPrice,
          expectedRevenue: aiResult.suggestedPrice * marketData.salesVolume,
          riskLevel: aiResult.riskLevel as 'low' | 'medium' | 'high',
          recommendation: aiResult.recommendations?.[0] || 'Monitorar mercado regularmente'
        }
      };

      setAnalysis(predictiveAnalysis);

    } catch (err) {
      console.error('Error in ML pricing prediction:', err);
      setError(err instanceof Error ? err.message : 'Erro na análise');
      
      // Fallback prediction
      const fallbackPrediction: MLPredictionResult = {
        suggestedPrice: marketData.cost * 1.4, // 40% margin
        confidence: 60,
        factors: {
          historical_trend: 0,
          seasonality: 0,
          competition: 0,
          demand_elasticity: 0,
          market_conditions: 0
        },
        reasoning: "Análise básica devido a erro na IA. Preço baseado em margem padrão de 40%.",
        alternatives: []
      };
      
      setPrediction(fallbackPrediction);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    prediction,
    analysis,
    error,
    predictOptimalPrice
  };
};

// Helper functions
function calculateMarketFactors(marketData: MarketData, aiResult: any) {
  const seasonalityFactor = marketData.seasonality === 'high' ? 15 : 
                           marketData.seasonality === 'medium' ? 5 : 0;
  
  const demandFactor = marketData.demandTrend === 'growing' ? 10 : 
                       marketData.demandTrend === 'declining' ? -10 : 0;

  const competitionFactor = marketData.competitors.length > 0 ? -5 : 0;

  return {
    historical_trend: demandFactor,
    seasonality: seasonalityFactor,
    competition: competitionFactor,
    demand_elasticity: marketData.salesVolume > 100 ? 5 : -5,
    market_conditions: aiResult.confidence > 80 ? 10 : 0
  };
}

function generateAlternatives(basePrice: number, marketData: MarketData) {
  return [
    {
      price: basePrice * 0.9,
      scenario: "Preço competitivo (-10%)",
      probability: 75
    },
    {
      price: basePrice * 1.1,
      scenario: "Preço premium (+10%)",
      probability: 60
    },
    {
      price: basePrice * 0.85,
      scenario: "Preço promocional (-15%)",
      probability: 85
    }
  ];
}

function generateDemandForecast(marketData: MarketData) {
  const baseVolume = marketData.salesVolume;
  const trend = marketData.demandTrend === 'growing' ? 1.1 : 
                marketData.demandTrend === 'declining' ? 0.9 : 1.0;

  return {
    next7Days: Array.from({ length: 7 }, (_, i) => 
      Math.round(baseVolume * trend * (1 + Math.random() * 0.2 - 0.1))
    ),
    next30Days: Array.from({ length: 30 }, (_, i) => 
      Math.round(baseVolume * trend * (1 + Math.random() * 0.3 - 0.15))
    ),
    confidence: 75
  };
}

function analyzeCompetition(marketData: MarketData) {
  const avgCompetitorPrice = marketData.competitors.length > 0 
    ? marketData.competitors.reduce((sum, comp) => sum + comp.price, 0) / marketData.competitors.length
    : marketData.currentPrice;

  const priceChange = ((avgCompetitorPrice - marketData.currentPrice) / marketData.currentPrice) * 100;

  return {
    avgPriceChange: priceChange,
    marketShare: 25, // Default estimate
    threats: priceChange > 10 ? ['Concorrentes com preços muito mais baixos'] : [],
    opportunities: priceChange < -10 ? ['Oportunidade de aumentar preços'] : []
  };
}
