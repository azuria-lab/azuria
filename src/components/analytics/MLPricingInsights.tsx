
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useMLPricing } from "@/hooks/useMLPricing";
import { motion } from "framer-motion";
import MLAnalysisButton from "./ml-pricing/MLAnalysisButton";
import MLOptimizedPrice from "./ml-pricing/MLOptimizedPrice";
import MLFactorsAnalysis from "./ml-pricing/MLFactorsAnalysis";
import MLConfidenceIndicator from "./ml-pricing/MLConfidenceIndicator";
import MLAnalysisExplanation from "./ml-pricing/MLAnalysisExplanation";
import MLActionButtons from "./ml-pricing/MLActionButtons";

interface MLPricingInsightsProps {
  currentPrice: number;
  cost: number;
  category: string;
  salesData?: {
    volume: number;
    trend: 'growing' | 'stable' | 'declining';
  };
  competitors?: Array<{ name: string; price: number; marketShare: number }>;
}

export default function MLPricingInsights({
  currentPrice,
  cost,
  category,
  salesData = { volume: 50, trend: 'stable' },
  competitors = []
}: MLPricingInsightsProps) {
  const { isAnalyzing, prediction, predictOptimalPrice } = useMLPricing();
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const runMLAnalysis = async () => {
    const marketData = {
      category,
      cost,
      currentPrice,
      salesVolume: salesData.volume,
      competitors: competitors.map(comp => ({ price: comp.price, marketShare: comp.marketShare })),
      seasonality: 'medium' as const,
      demandTrend: salesData.trend
    };

    try {
      await predictOptimalPrice(marketData);
      setHasAnalyzed(true);
    } catch (error) {
      console.error('ML Analysis failed:', error);
    }
  };

  const handleNewAnalysis = () => {
    setHasAnalyzed(false);
  };

  const handleApplyPrice = () => {
    if (prediction) {
      console.log('Aplicar preço sugerido:', prediction.suggestedPrice);
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Inteligência Artificial de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAnalyzed ? (
          <MLAnalysisButton 
            isAnalyzing={isAnalyzing}
            onRunAnalysis={runMLAnalysis}
          />
        ) : prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <MLOptimizedPrice 
              suggestedPrice={prediction.suggestedPrice}
              currentPrice={currentPrice}
              confidence={prediction.confidence}
            />

            <MLFactorsAnalysis factors={prediction.factors} />

            <MLConfidenceIndicator confidence={prediction.confidence} />

            <MLAnalysisExplanation reasoning={prediction.reasoning} />

            <MLActionButtons 
              onNewAnalysis={handleNewAnalysis}
              onApplyPrice={handleApplyPrice}
              suggestedPrice={prediction.suggestedPrice}
            />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
