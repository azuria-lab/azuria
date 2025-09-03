
import React from "react";
import { Button } from "@/components/ui/button";

interface DemandForecastActionsProps {
  onNewAnalysis: () => void;
}

export default function DemandForecastActions({ onNewAnalysis }: DemandForecastActionsProps) {
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
        className="flex-1 bg-blue-600 hover:bg-blue-700"
      >
        Exportar Previsão
      </Button>
    </div>
  );
}
