
import React from "react";
import { Button } from "@/components/ui/button";

interface PricingActionsProps {
  onNewAnalysis: () => void;
}

export default function PricingActions({ onNewAnalysis }: PricingActionsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline"
        onClick={onNewAnalysis}
        className="flex-1"
      >
        Nova Análise
      </Button>
      <Button 
        size="sm"
        className="flex-1 bg-purple-600 hover:bg-purple-700"
      >
        Salvar Sugestões
      </Button>
    </div>
  );
}
