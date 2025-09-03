
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Settings, Target, TrendingUp, Zap } from "lucide-react";
import { useAIMarketAnalysis } from "@/hooks/useAIMarketAnalysis";
import AIMarketInsights from "./AIMarketInsights";

interface PriceOptimizationEngineProps {
  onOptimizedPrice?: (price: number) => void;
  initialCost?: number;
  initialPrice?: number;
}

export default function PriceOptimizationEngine({
  onOptimizedPrice,
  initialCost = 0,
  initialPrice = 0
}: PriceOptimizationEngineProps) {
  const { isAnalyzing, analysisResult, analyzeMarket } = useAIMarketAnalysis();
  
  const [formData, setFormData] = useState({
    cost: initialCost.toString(),
    currentPrice: initialPrice.toString(),
    targetMargin: "30",
    category: "",
    seasonality: "medium" as 'high' | 'medium' | 'low',
    region: "sudeste"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptimize = async () => {
    const analysisData = {
      cost: parseFloat(formData.cost) || 0,
      currentPrice: parseFloat(formData.currentPrice) || 0,
      targetMargin: parseFloat(formData.targetMargin) || 30,
      category: formData.category,
      seasonality: formData.seasonality,
      region: formData.region
    };

    await analyzeMarket(analysisData);
  };

  const handleApplyPrice = (price: number) => {
    if (onOptimizedPrice) {
      onOptimizedPrice(price);
    }
  };

  const categories = [
    "Eletrônicos",
    "Moda",
    "Casa e Decoração",
    "Alimentação",
    "Beleza",
    "Esportes",
    "Livros",
    "Automotivo",
    "Ferramentas",
    "Outros"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {!analysisResult ? (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Motor de Otimização de Preços
            </CardTitle>
            <p className="text-sm text-gray-600">
              Use IA avançada para encontrar o preço ideal baseado em dados de mercado
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados do Produto */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Dados do Produto
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Custo (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current-price">Preço Atual (R$)</Label>
                  <Input
                    id="current-price"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.currentPrice}
                    onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-margin">Margem Desejada (%)</Label>
                  <Input
                    id="target-margin"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={formData.targetMargin}
                    onChange={(e) => handleInputChange('targetMargin', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Configurações Avançadas */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações de Mercado
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seasonality">Sazonalidade</Label>
                  <Select value={formData.seasonality} onValueChange={(value: 'high' | 'medium' | 'low') => handleInputChange('seasonality', value)}>
                    <SelectTrigger id="seasonality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Região</Label>
                  <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                    <SelectTrigger id="region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="norte">Norte</SelectItem>
                      <SelectItem value="nordeste">Nordeste</SelectItem>
                      <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                      <SelectItem value="sudeste">Sudeste</SelectItem>
                      <SelectItem value="sul">Sul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Botão de Otimização */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleOptimize}
                disabled={isAnalyzing || !formData.cost || !formData.category}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analisando Mercado...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Otimizar Preço com IA
                  </>
                )}
              </Button>
            </div>

            {/* Indicadores de Qualidade */}
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Zap className="h-3 w-3 mr-1" />
                Análise em Tempo Real
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Target className="h-3 w-3 mr-1" />
                85% Precisão
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                IA Avançada
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AIMarketInsights
          insights={analysisResult.insights}
          optimalPrice={analysisResult.optimalPrice}
          competitivePosition={analysisResult.competitivePosition}
          marketTrend={analysisResult.marketTrend}
          confidenceScore={analysisResult.confidenceScore}
          onApplyPrice={handleApplyPrice}
        />
      )}
    </motion.div>
  );
}
