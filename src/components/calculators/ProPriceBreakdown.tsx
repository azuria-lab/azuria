
import React from "react";

interface Breakdown {
  cost: number;
  tax: number;
  marketplaceFee: number;
  shipping: number;
  profit: number;
}

interface ProPriceBreakdownProps {
  breakdown: Breakdown;
  taxPercent: number;
  marketplaceName: string;
  marketplaceFee: number;
  includeShipping: boolean;
  targetProfit: number;
  profitHealthy: (profit: number) => boolean;
}

const ProPriceBreakdown: React.FC<ProPriceBreakdownProps> = ({
  breakdown,
  taxPercent,
  marketplaceName,
  marketplaceFee,
  includeShipping,
  targetProfit,
  profitHealthy,
}) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
    <h4 className="font-medium mb-3 text-gray-700">Detalhamento:</h4>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Custo do produto:</span>
        <span>R$ {breakdown.cost.toFixed(2).replace(".", ",")}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Imposto ({taxPercent}%):</span>
        <span>R$ {breakdown.tax.toFixed(2).replace(".", ",")}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Taxa {marketplaceName} ({marketplaceFee}%):</span>
        <span>R$ {breakdown.marketplaceFee.toFixed(2).replace(".", ",")}</span>
      </div>
      {includeShipping && (
        <div className="flex justify-between text-sm">
          <span>Frete grátis:</span>
          <span>R$ {breakdown.shipping.toFixed(2).replace(".", ",")}</span>
        </div>
      )}
      <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200">
        <span>Lucro ({targetProfit}%):</span>
        <span className={profitHealthy(breakdown.profit) ? "text-green-600" : "text-red-500"}>
          R$ {breakdown.profit.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </div>
  </div>
);

export default ProPriceBreakdown;
