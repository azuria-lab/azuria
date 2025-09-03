
import React from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface PricingHeaderProps {
  isAnalyzing: boolean;
  onGenerateSuggestions: () => void;
}

export default function PricingHeader({ isAnalyzing, onGenerateSuggestions }: PricingHeaderProps) {
  return (
    <div className="text-center py-4">
      <Button 
        onClick={onGenerateSuggestions}
        disabled={isAnalyzing}
        className="bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Analisando com IA...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Gerar Sugestões Inteligentes
          </>
        )}
      </Button>
    </div>
  );
}
