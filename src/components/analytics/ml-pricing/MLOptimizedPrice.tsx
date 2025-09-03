
import React from "react";
import { Badge } from "@/components/ui/badge";

interface MLOptimizedPriceProps {
  suggestedPrice: number;
  currentPrice: number;
  confidence: number;
}

export default function MLOptimizedPrice({ suggestedPrice, currentPrice, confidence }: MLOptimizedPriceProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) {return "text-green-600";}
    if (confidence >= 60) {return "text-yellow-600";}
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-purple-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Preço Otimizado por IA</span>
        <Badge className={getConfidenceColor(confidence)}>
          {confidence}% confiança
        </Badge>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-purple-600">
          R$ {suggestedPrice.toFixed(2).replace(".", ",")}
        </span>
        {currentPrice !== suggestedPrice && (
          <span className={`text-sm ${
            suggestedPrice > currentPrice ? 'text-green-600' : 'text-red-600'
          }`}>
            {suggestedPrice > currentPrice ? '+' : ''}
            {((suggestedPrice - currentPrice) / currentPrice * 100).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
