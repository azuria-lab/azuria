
import React from "react";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import ResultsSectionBreakdown from "./results/ResultsSectionBreakdown";
import ResultsSectionDiscounts from "./results/ResultsSectionDiscounts";
import ResultsSectionExport from "./results/ResultsSectionExport";

interface ResultsSectionProps {
  sellingPrice: number | null;
  breakdown: any;
  taxPercent: number;
  marketplaceName: string;
  marketplaceFee: number;
  targetProfit: number;
  includeShipping: boolean;
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  handleInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProfitHealthy: (profit: number) => boolean;
  handleExportPdf: () => void;
  handleExportCsv: () => void;
  handleShare: () => void;
  cost: string;
  productInfo: { name: string; sku: string; category: string };
}

export default function ResultsSection({
  sellingPrice,
  breakdown,
  taxPercent,
  marketplaceName,
  marketplaceFee,
  targetProfit,
  includeShipping,
  discountPercent,
  discountedPrice,
  discountedProfit,
  handleInputChange,
  isProfitHealthy,
  handleExportPdf,
  handleExportCsv,
  handleShare,
  cost,
  productInfo
}: ResultsSectionProps) {
  return (
    <div className="space-y-6">
      <ResultsSectionBreakdown 
        sellingPrice={sellingPrice}
        breakdown={breakdown}
        taxPercent={taxPercent}
        marketplaceName={marketplaceName}
        marketplaceFee={marketplaceFee}
        targetProfit={targetProfit}
        includeShipping={includeShipping}
        isProfitHealthy={isProfitHealthy}
      />

      {sellingPrice && discountPercent !== undefined && (
        <ResultsSectionDiscounts
          discountPercent={discountPercent}
          discountedPrice={discountedPrice}
          discountedProfit={discountedProfit}
          onDiscountChange={handleInputChange('discountPercent')}
          isProfitHealthy={isProfitHealthy}
        />
      )}

      {sellingPrice ? (
        <ResultsSectionExport 
          data={{
            sellingPrice: sellingPrice,
            cost: Number(cost),
            margin: targetProfit,
            tax: taxPercent,
            marketplaceFee: marketplaceFee,
            shipping: includeShipping ? Number(breakdown?.shipping) : undefined,
            productName: productInfo.name
          }}
          onExportPdf={handleExportPdf}
          onExportCsv={handleExportCsv}
          onShare={handleShare}
        />
      ) : null}
    </div>
  );
}
