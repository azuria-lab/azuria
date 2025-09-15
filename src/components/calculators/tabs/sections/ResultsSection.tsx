
import React from "react";
import ResultsSectionBreakdown from "./results/ResultsSectionBreakdown";
import ResultsSectionDiscounts from "./results/ResultsSectionDiscounts";
import ResultsSectionExport from "./results/ResultsSectionExport";

interface ResultsSectionProps {
  sellingPrice: number | null;
  breakdown: {
    cost?: number;
    tax?: number;
    marketplaceFee?: number;
    shipping?: number;
    profit?: number;
    [key: string]: unknown;
  } | null;
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
  const toBreakdown = (b: ResultsSectionProps['breakdown']): {
    cost: number; tax: number; marketplaceFee: number; shipping: number; profit: number;
  } | null => {
    if (!b) { return null; }
    return {
      cost: Number((b as unknown as { cost?: number }).cost ?? 0),
      tax: Number((b as unknown as { tax?: number }).tax ?? 0),
      marketplaceFee: Number((b as unknown as { marketplaceFee?: number }).marketplaceFee ?? 0),
      shipping: Number(b.shipping ?? 0),
      profit: Number((b as unknown as { profit?: number }).profit ?? 0)
    };
  };
  return (
    <div className="space-y-6">
      <ResultsSectionBreakdown 
        sellingPrice={sellingPrice}
        breakdown={toBreakdown(breakdown)}
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
    shipping: includeShipping ? Number((breakdown?.shipping ?? 0)) : undefined,
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
