
import React from "react";
import { Button } from "@/components/ui/button";

interface SeasonalityActionsProps {
  onNewAnalysis: () => void;
}

export default function SeasonalityActions({ onNewAnalysis }: SeasonalityActionsProps) {
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
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        Exportar Relatório
      </Button>
    </div>
  );
}
