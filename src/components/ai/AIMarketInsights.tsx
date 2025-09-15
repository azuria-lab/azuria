
import React from "react";
import { motion } from "framer-motion";
import InsightAnalysisSummary from "./market-insights/InsightAnalysisSummary";
import InsightCard from "./market-insights/InsightCard";

interface AIMarketInsight {
  type: 'opportunity' | 'warning' | 'optimization' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  suggestedAction: string;
  priceRecommendation?: number;
}

interface AIMarketInsightsProps {
  insights: AIMarketInsight[];
  optimalPrice: number;
  competitivePosition: 'aggressive' | 'competitive' | 'premium';
  marketTrend: 'bullish' | 'neutral' | 'bearish';
  confidenceScore: number;
  onApplyPrice?: (price: number) => void;
}

export default function AIMarketInsights({
  insights,
  optimalPrice,
  competitivePosition,
  marketTrend,
  confidenceScore,
  onApplyPrice
}: AIMarketInsightsProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Resumo da Análise */}
      <InsightAnalysisSummary
        optimalPrice={optimalPrice}
        competitivePosition={competitivePosition}
        marketTrend={marketTrend}
        confidenceScore={confidenceScore}
        onApplyPrice={onApplyPrice}
      />

      {/* Insights Individuais */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Insights Inteligentes</h3>
        
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
