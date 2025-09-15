
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface PricingSuggestion {
  strategy: string;
  suggestedPrice: number;
  expectedMargin: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  confidence: number;
}

interface PricingStrategiesListProps {
  suggestions: PricingSuggestion[];
}

export default function PricingStrategiesList({ suggestions }: PricingStrategiesListProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) {return 'text-green-600';}
    if (confidence >= 70) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  return (
    <div className="grid gap-4">
      {suggestions.map((suggestion, index) => (
        <div key={index} className="bg-white rounded-lg p-6 border border-purple-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-semibold text-gray-800">{suggestion.strategy}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getRiskColor(suggestion.riskLevel)}>
                    {suggestion.riskLevel === 'low' ? 'Baixo Risco' : 
                     suggestion.riskLevel === 'medium' ? 'Médio Risco' : 'Alto Risco'}
                  </Badge>
                  <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                    {suggestion.confidence}% confiança
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                R$ {suggestion.suggestedPrice.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-sm text-gray-600">
                Margem: {suggestion.expectedMargin.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{suggestion.reasoning}</p>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              Ver Detalhes
            </Button>
            <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
              Aplicar Preço
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
