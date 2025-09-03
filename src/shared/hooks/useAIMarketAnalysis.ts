
import { useCallback, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface MarketAnalysisData {
  category: string;
  cost: number;
  currentPrice: number;
  targetMargin: number;
  region?: string;
  seasonality?: 'high' | 'medium' | 'low';
}

interface AIMarketInsight {
  type: 'opportunity' | 'warning' | 'optimization' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  suggestedAction: string;
  priceRecommendation?: number;
}

interface MarketAnalysisResult {
  insights: AIMarketInsight[];
  optimalPrice: number;
  competitivePosition: 'aggressive' | 'competitive' | 'premium';
  marketTrend: 'bullish' | 'neutral' | 'bearish';
  demandElasticity: number;
  confidenceScore: number;
}

export const useAIMarketAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MarketAnalysisResult | null>(null);

  const analyzeMarket = useCallback(async (data: MarketAnalysisData): Promise<MarketAnalysisResult> => {
    setIsAnalyzing(true);
    
    // Simular análise de IA avançada
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      const insights = generateMarketInsights(data);
      const optimalPrice = calculateOptimalPrice(data);
      const competitivePosition = determineCompetitivePosition(data, optimalPrice);
      const marketTrend = analyzeMarketTrend(data);
      const demandElasticity = calculateDemandElasticity(data);
      const confidenceScore = calculateConfidenceScore(data);

      const result: MarketAnalysisResult = {
        insights,
        optimalPrice,
        competitivePosition,
        marketTrend,
        demandElasticity,
        confidenceScore
      };

      setAnalysisResult(result);
      
      toast.success(`Análise de IA concluída com ${confidenceScore}% de confiança`);
      
      return result;
    } catch (error) {
      toast.error("Erro na análise de mercado");
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    analyzeMarket,
    setAnalysisResult
  };
};

// Algoritmos de IA simulados
function generateMarketInsights(data: MarketAnalysisData): AIMarketInsight[] {
  const insights: AIMarketInsight[] = [];
  const { cost, currentPrice, targetMargin, category, seasonality } = data;
  
  // Análise de margem
  const actualMargin = ((currentPrice - cost) / currentPrice) * 100;
  if (actualMargin < 15) {
    insights.push({
      type: 'warning',
      title: 'Margem Abaixo do Recomendado',
      description: `Margem atual de ${actualMargin.toFixed(1)}% está abaixo dos 15% mínimos para sustentabilidade`,
      impact: 'high',
      confidence: 92,
      suggestedAction: 'Aumentar preço em 8-12% para margem saudável',
      priceRecommendation: cost / (1 - 0.18)
    });
  }

  // Análise sazonal
  if (seasonality === 'high') {
    insights.push({
      type: 'opportunity',
      title: 'Período de Alta Demanda',
      description: 'Sazonalidade favorável detectada. Momento ideal para preços premium',
      impact: 'medium',
      confidence: 78,
      suggestedAction: 'Aumentar preço em 5-8% aproveitando demanda sazonal',
      priceRecommendation: currentPrice * 1.06
    });
  }

  // Análise por categoria
  const categoryInsights = getCategorySpecificInsights(category, data);
  insights.push(...categoryInsights);

  // Análise de elasticidade
  const elasticity = calculateDemandElasticity(data);
  if (elasticity < 0.5) {
    insights.push({
      type: 'optimization',
      title: 'Baixa Sensibilidade a Preços',
      description: 'Produto com demanda inelástica. Oportunidade para otimização de margem',
      impact: 'high',
      confidence: 85,
      suggestedAction: 'Testar aumento gradual de 3-5% sem impacto significativo nas vendas'
    });
  }

  return insights.slice(0, 4); // Limitar a 4 insights principais
}

function getCategorySpecificInsights(category: string, data: MarketAnalysisData): AIMarketInsight[] {
  const insights: AIMarketInsight[] = [];
  
  // Insights específicos por categoria
  switch (category.toLowerCase()) {
    case 'eletrônicos':
      insights.push({
        type: 'trend',
        title: 'Tendência Tecnológica',
        description: 'Mercado de eletrônicos em alta. Consumidores valorizam inovação',
        impact: 'medium',
        confidence: 73,
        suggestedAction: 'Destacar características técnicas para justificar preço premium'
      });
      break;
      
    case 'moda':
      insights.push({
        type: 'opportunity',
        title: 'Ciclo Sazonal de Moda',
        description: 'Padrões sazonais detectados. Ajuste de preços por temporada recomendado',
        impact: 'medium',
        confidence: 68,
        suggestedAction: 'Implementar estratégia de preços dinâmicos por estação'
      });
      break;
      
    case 'alimentação':
      insights.push({
        type: 'warning',
        title: 'Volatilidade de Custos',
        description: 'Setor alimentício com variação frequente de matéria-prima',
        impact: 'high',
        confidence: 88,
        suggestedAction: 'Revisar preços mensalmente e criar margem de segurança de 5%'
      });
      break;
  }
  
  return insights;
}

function calculateOptimalPrice(data: MarketAnalysisData): number {
  const { cost, targetMargin, seasonality } = data;
  
  // Preço base com margem desejada
  const basePrice = cost / (1 - targetMargin / 100);
  
  // Ajustes por sazonalidade
  const seasonalMultiplier = seasonality === 'high' ? 1.08 : 
                           seasonality === 'medium' ? 1.03 : 1.0;
  
  // Ajuste por elasticidade de demanda
  const elasticity = calculateDemandElasticity(data);
  const elasticityMultiplier = elasticity < 0.5 ? 1.05 : 
                              elasticity > 1.5 ? 0.97 : 1.0;
  
  return basePrice * seasonalMultiplier * elasticityMultiplier;
}

function determineCompetitivePosition(data: MarketAnalysisData, optimalPrice: number): 'aggressive' | 'competitive' | 'premium' {
  const marketAverage = data.cost * 1.6; // Simulação de preço médio do mercado
  
  if (optimalPrice < marketAverage * 0.9) {return 'aggressive';}
  if (optimalPrice > marketAverage * 1.1) {return 'premium';}
  return 'competitive';
}

function analyzeMarketTrend(data: MarketAnalysisData): 'bullish' | 'neutral' | 'bearish' {
  // Simulação baseada em categoria e sazonalidade
  const { category, seasonality } = data;
  
  if (seasonality === 'high') {return 'bullish';}
  if (category === 'eletrônicos') {return 'bullish';}
  if (Math.random() > 0.7) {return 'bearish';}
  
  return 'neutral';
}

function calculateDemandElasticity(data: MarketAnalysisData): number {
  // Simulação de elasticidade baseada em categoria
  const { category } = data;
  
  switch (category.toLowerCase()) {
    case 'alimentação': return 0.3; // Inelástica
    case 'eletrônicos': return 1.2; // Elástica
    case 'moda': return 0.8; // Moderadamente elástica
    case 'casa': return 0.6; // Pouco elástica
    default: return 1.0; // Neutra
  }
}

function calculateConfidenceScore(data: MarketAnalysisData): number {
  let score = 70; // Base
  
  // Aumenta confiança com mais dados
  if (data.category) {score += 10;}
  if (data.seasonality) {score += 8;}
  if (data.region) {score += 7;}
  
  // Ajuste aleatório para simular variabilidade real
  score += Math.random() * 10 - 5;
  
  return Math.min(95, Math.max(60, Math.round(score)));
}
