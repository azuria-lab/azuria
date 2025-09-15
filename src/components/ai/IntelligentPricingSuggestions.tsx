
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import PricingInputForm from "./intelligent-pricing/PricingInputForm";
import PricingHeader from "./intelligent-pricing/PricingHeader";
import PricingStrategiesList from "./intelligent-pricing/PricingStrategiesList";
import AIRecommendationPanel from "./intelligent-pricing/AIRecommendationPanel";
import PricingActions from "./intelligent-pricing/PricingActions";

interface PricingSuggestion {
  strategy: string;
  suggestedPrice: number;
  expectedMargin: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  confidence: number;
}

interface ProductData {
  cost: string;
  category: string;
  targetMargin: string;
  competitorPrice: string;
  marketPosition: string;
}

export default function IntelligentPricingSuggestions() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<PricingSuggestion[] | null>(null);
  
  const [productData, setProductData] = useState<ProductData>({
    cost: '',
    category: '',
    targetMargin: '',
    competitorPrice: '',
    marketPosition: 'medium'
  });

  const generateSuggestions = async () => {
    if (!productData.cost || !productData.category) {
      alert('Por favor, preencha pelo menos o custo e categoria do produto');
      return;
    }

    setIsAnalyzing(true);
    
    // Simular análise de IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const cost = parseFloat(productData.cost.replace(',', '.'));
    const targetMargin = parseFloat(productData.targetMargin.replace(',', '.')) || 40;
    const competitorPrice = parseFloat(productData.competitorPrice.replace(',', '.')) || cost * 1.5;
    
    // Algoritmos de precificação inteligente
    const strategies: PricingSuggestion[] = [
      {
        strategy: "Penetração de Mercado",
        suggestedPrice: cost * (1 + (targetMargin - 10) / 100),
        expectedMargin: targetMargin - 10,
        riskLevel: 'high',
        reasoning: "Preço agressivo para ganhar market share rapidamente. Ideal para produtos novos ou mercados competitivos.",
        confidence: 75
      },
      {
        strategy: "Posicionamento Premium",
        suggestedPrice: cost * (1 + (targetMargin + 15) / 100),
        expectedMargin: targetMargin + 15,
        riskLevel: 'medium',
        reasoning: "Preço premium baseado em diferenciação. Requer valor percebido alto e marca forte.",
        confidence: 65
      },
      {
        strategy: "Competitiva Balanceada",
        suggestedPrice: Math.min(competitorPrice * 0.95, cost * (1 + targetMargin / 100)),
        expectedMargin: targetMargin,
        riskLevel: 'low',
        reasoning: "Preço ligeiramente abaixo da concorrência mantendo margem saudável. Estratégia equilibrada e segura.",
        confidence: 85
      },
      {
        strategy: "Maximização de Lucro",
        suggestedPrice: cost * (1 + (targetMargin + 8) / 100),
        expectedMargin: targetMargin + 8,
        riskLevel: 'medium',
        reasoning: "Foco na maximização da margem unitária. Ideal quando há baixa elasticidade de preço.",
        confidence: 70
      }
    ];

    // Ajustar baseado na posição de mercado desejada
    const adjustmentFactor = productData.marketPosition === 'premium' ? 1.1 : 
                           productData.marketPosition === 'economy' ? 0.9 : 1.0;
    
    const adjustedStrategies = strategies.map(strategy => ({
      ...strategy,
      suggestedPrice: strategy.suggestedPrice * adjustmentFactor,
      expectedMargin: ((strategy.suggestedPrice * adjustmentFactor - cost) / (strategy.suggestedPrice * adjustmentFactor)) * 100
    }));

    setSuggestions(adjustedStrategies);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setSuggestions(null);
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Sugestões Inteligentes de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!suggestions ? (
          <div className="space-y-6">
            <PricingInputForm 
              productData={productData}
              onProductDataChange={setProductData}
            />
            <PricingHeader 
              isAnalyzing={isAnalyzing}
              onGenerateSuggestions={generateSuggestions}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <PricingStrategiesList suggestions={suggestions} />
            <AIRecommendationPanel />
            <PricingActions onNewAnalysis={handleNewAnalysis} />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
