
import React from "react";
import { AlertCircle, Check } from "lucide-react";
import { type CalculationResult } from "@/types/simpleCalculator";

interface ResultStatusProps {
  result: CalculationResult;
  formatCurrency: (value: number) => string;
}

export default function ResultStatus({ result, formatCurrency }: ResultStatusProps) {
  return (
    <div className="grid gap-4">
      {/* Cards Principais de Resultado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PREÇO INFORMADO */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <h4 className="text-sm font-bold text-blue-700 mb-1 tracking-wider">PREÇO INFORMADO</h4>
          <p className="text-2xl font-bold text-blue-900">
            R$ {formatCurrency(result.sellingPrice)}
          </p>
        </div>

        {/* CUSTOS TOTAIS */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-1 tracking-wider">CUSTOS TOTAIS</h4>
          <p className="text-2xl font-bold text-gray-900">
            R$ {formatCurrency(result.breakdown.totalCost)}
          </p>
        </div>
      </div>

      {/* Segunda linha - Lucro e Margem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LUCRO */}
        <div className={`p-4 rounded-xl border ${
          result.isHealthyProfit 
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
        }`}>
          <h4 className={`text-sm font-bold mb-1 tracking-wider ${
            result.isHealthyProfit ? 'text-green-700' : 'text-red-700'
          }`}>LUCRO</h4>
          <p className={`text-2xl font-bold ${
            result.isHealthyProfit ? 'text-green-900' : 'text-red-900'
          }`}>
            R$ {formatCurrency(result.profit)}
          </p>
        </div>

        {/* MARGEM REAL */}
        <div className={`p-4 rounded-xl border ${
          result.isHealthyProfit 
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
        }`}>
          <h4 className={`text-sm font-bold mb-1 tracking-wider ${
            result.isHealthyProfit ? 'text-green-700' : 'text-red-700'
          }`}>MARGEM REAL</h4>
          <p className={`text-2xl font-bold ${
            result.isHealthyProfit ? 'text-green-900' : 'text-red-900'
          }`}>
            {formatCurrency(result.breakdown.realMarginPercent)}%
          </p>
        </div>
      </div>
      
      {/* Status do Lucro */}
      <div className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
        result.isHealthyProfit 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {result.isHealthyProfit ? (
          <Check className="w-5 h-5 flex-shrink-0" aria-label="Margem saudável" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-label="Margem baixa" />
        )}
        <p className="font-medium">
          {result.isHealthyProfit 
            ? 'Margem de lucro saudável para o seu negócio!' 
            : 'Margem de lucro baixa. Recomendamos pelo menos 10%.'}
        </p>
      </div>
    </div>
  );
}
