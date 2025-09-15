
import React from "react";
import { Progress } from "@/components/ui/progress";

interface MLConfidenceIndicatorProps {
  confidence: number;
}

export default function MLConfidenceIndicator({ confidence }: MLConfidenceIndicatorProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) {return "text-green-600";}
    if (confidence >= 60) {return "text-yellow-600";}
    return "text-red-600";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Confiança da Análise</span>
        <span className={`font-semibold ${getConfidenceColor(confidence)}`}>
          {confidence}%
        </span>
      </div>
      <Progress value={confidence} className="h-2" />
    </div>
  );
}
