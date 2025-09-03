
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Zap } from "lucide-react";

interface MLAnalysisButtonProps {
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

export default function MLAnalysisButton({ isAnalyzing, onRunAnalysis }: MLAnalysisButtonProps) {
  return (
    <div className="text-center py-6">
      <div className="mb-4">
        <Zap className="h-12 w-12 text-purple-600 mx-auto mb-2" />
        <h3 className="font-semibold text-lg">Análise Inteligente de Preços</h3>
        <p className="text-gray-600 text-sm">
          Use IA para otimizar seu preço baseado em dados de mercado
        </p>
      </div>
      <Button 
        onClick={onRunAnalysis}
        disabled={isAnalyzing}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Analisando...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            Analisar com IA
          </>
        )}
      </Button>
    </div>
  );
}
