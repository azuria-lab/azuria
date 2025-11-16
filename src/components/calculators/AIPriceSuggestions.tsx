/**
 * Component: AIPriceSuggestions
 * Displays 4 AI-powered price suggestions
 * Ready for Azuria AI integration
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, TrendingUp } from "lucide-react";
import { usePriceSuggestions } from "@/hooks/usePriceSuggestions";
import type { PriceSuggestion, PriceSuggestionInput } from "@/types/aiPriceSuggestions";
import { cn } from "@/lib/utils";

interface AIPriceSuggestionsProps {
  input: PriceSuggestionInput;
  onSelectPrice?: (price: number) => void;
}

export default function AIPriceSuggestions({ input, onSelectPrice }: AIPriceSuggestionsProps) {
  const { generateSuggestions } = usePriceSuggestions();
  const [suggestions, setSuggestions] = useState<PriceSuggestion[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  useEffect(() => {
    const results = generateSuggestions(input);
    setSuggestions(results);
  }, [input]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) { return "text-green-600"; }
    if (confidence >= 60) { return "text-yellow-600"; }
    return "text-orange-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) { return "Alta Confiança"; }
    if (confidence >= 60) { return "Confiança Moderada"; }
    return "Baixa Confiança";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Sugestões de Preço com IA
          </h3>
          <p className="text-muted-foreground mt-1">
            4 estratégias de precificação otimizadas por análise inteligente
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
           Azuria AI Beta
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.strategy}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all border-2 hover:shadow-lg",
                selectedStrategy === suggestion.strategy && "border-green-500 shadow-lg",
                suggestion.strategy === "ai-recommended" && "bg-gradient-to-br from-green-50 to-emerald-50"
              )}
              onClick={() => setSelectedStrategy(suggestion.strategy)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{suggestion.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{suggestion.label}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                  {selectedStrategy === suggestion.strategy && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/80 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Preço Sugerido</p>
                  <p className="text-3xl font-bold text-blue-600">
                    R$ {suggestion.suggestedPrice.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={cn("h-4 w-4", getConfidenceColor(suggestion.confidence))} />
                    <span className={cn("text-sm font-semibold", getConfidenceColor(suggestion.confidence))}>
                      {getConfidenceLabel(suggestion.confidence)}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {suggestion.confidence}% confiança
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de Conversão:</span>
                    <span className="font-semibold">{suggestion.expectedOutcome.conversionRate}%</span>
                  </div>
                  {suggestion.expectedOutcome.monthlyProfit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro Mensal:</span>
                      <span className="font-semibold text-green-600">
                        R$ {suggestion.expectedOutcome.monthlyProfit.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {selectedStrategy === suggestion.strategy && onSelectPrice && (
                  <Button
                    className="w-full"
                    onClick={() => onSelectPrice(suggestion.suggestedPrice)}
                  >
                    Aplicar este preço
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong> Dica:</strong> As sugestões são baseadas em análise de múltiplos fatores.
            Quando a Azuria AI estiver totalmente integrada, você terá recomendações ainda mais precisas
            baseadas em dados reais de mercado e histórico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
