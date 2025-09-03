
import React from "react";
import { type CalculationResult } from "@/types/simpleCalculator";

interface ResultBreakdownProps {
  result: CalculationResult;
  formatCurrency: (value: number) => string;
}

export default function ResultBreakdown({ result, formatCurrency }: ResultBreakdownProps) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-semibold mb-3 text-gray-700">Detalhamento</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Custo do produto:</span>
          <span className="font-semibold">R$ {formatCurrency(result.breakdown.costValue)}</span>
        </div>

        {result.breakdown.otherCostsValue > 0 && (
          <div className="flex justify-between">
            <span>Outros custos variáveis:</span>
            <span className="font-semibold">R$ {formatCurrency(result.breakdown.otherCostsValue)}</span>
          </div>
        )}
        
        {result.breakdown.shippingValue > 0 && (
          <div className="flex justify-between">
            <span>Frete:</span>
            <span className="font-semibold">R$ {formatCurrency(result.breakdown.shippingValue)}</span>
          </div>
        )}

        <div className="flex justify-between font-semibold">
          <span>Custo total:</span>
          <span className="text-brand-700">R$ {formatCurrency(result.breakdown.totalCost)}</span>
        </div>

        <div className="flex justify-between">
          <span>Margem de lucro planejada:</span>
          <span className="font-semibold">R$ {formatCurrency(result.breakdown.marginAmount)}</span>
        </div>

        {result.breakdown.taxAmount > 0 && (
          <div className="flex justify-between">
            <span>Impostos:</span>
            <span className="font-semibold">R$ {formatCurrency(result.breakdown.taxAmount)}</span>
          </div>
        )}

        {result.breakdown.cardFeeAmount > 0 && (
          <div className="flex justify-between">
            <span>Taxa de maquininha:</span>
            <span className="font-semibold">R$ {formatCurrency(result.breakdown.cardFeeAmount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
