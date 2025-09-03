import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Brain, Lightbulb, Target } from "lucide-react";

interface AIMarketInsight {
  type: 'opportunity' | 'warning' | 'optimization' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  suggestedAction: string;
  priceRecommendation?: number;
}

interface InsightCardProps {
  insight: AIMarketInsight;
  index: number;
}

export default function InsightCard({ insight, index }: InsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'optimization': return <Target className="h-4 w-4 text-blue-600" />;
      case 'trend': return <Activity className="h-4 w-4 text-purple-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getInsightIcon(insight.type)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={getImpactColor(insight.impact)} className="text-xs">
                    {insight.impact === 'high' ? 'Alto' : 
                     insight.impact === 'medium' ? 'Médio' : 'Baixo'} Impacto
                  </Badge>
                  <span className="text-xs text-gray-500">{insight.confidence}%</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">{insight.description}</p>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">Ação Recomendada:</p>
                <p className="text-xs text-gray-600">{insight.suggestedAction}</p>
                
                {insight.priceRecommendation && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Preço sugerido:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      R$ {insight.priceRecommendation.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}