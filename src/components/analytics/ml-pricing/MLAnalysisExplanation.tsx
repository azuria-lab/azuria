
import React from "react";
import { AlertTriangle } from "lucide-react";

interface MLAnalysisExplanationProps {
  reasoning: string;
}

export default function MLAnalysisExplanation({ reasoning }: MLAnalysisExplanationProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 mb-1">Análise da IA</p>
          <p className="text-xs text-blue-700">{reasoning}</p>
        </div>
      </div>
    </div>
  );
}
