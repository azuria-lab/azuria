
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Marketplace } from "@/data/marketplaces";
import { useCalculatorExport } from "@/domains/calculator/hooks/useCalculatorExport";
import { AppIcon } from "@/components/ui/app-icon";

// Import refactored sections
import ProductSection from "./sections/ProductSection";
import CalculatorInputsSection from "./sections/CalculatorInputsSection";
import CalculatorActions from "./sections/CalculatorActions";
import ResultsSection from "./sections/ResultsSection";

interface BasicTabContentProps {
  readonly marketplace: string;
  readonly setMarketplace: (value: string) => void;
  readonly marketplaces: Marketplace[];
  readonly selectedMarketplace: Marketplace | undefined;
  readonly marketplaceFee: number;
  readonly productInfo: { name: string; sku: string; category: string };
  readonly setProductInfo: React.Dispatch<React.SetStateAction<{ name: string; sku: string; category: string }>>;
  readonly cost: string;
  readonly taxPercent: string;
  readonly shipping: string;
  readonly includeShipping: boolean;
  readonly targetProfit: number;
  readonly sellingPrice: number | null;
  readonly discountPercent: number;
  readonly discountedPrice: number | null;
  readonly discountedProfit: number | null;
  readonly breakdown: { profit?: number; [key: string]: unknown };
  readonly handleInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleTargetProfitChange: (values: number[]) => void;
  readonly setState: React.Dispatch<React.SetStateAction<unknown>>;
  readonly calculatePrice: () => void;
  readonly isProfitHealthy: (profit: number) => boolean;
}

export default function BasicTabContent({
  marketplace,
  setMarketplace,
  marketplaces,
  selectedMarketplace,
  marketplaceFee,
  productInfo,
  setProductInfo,
  cost,
  taxPercent,
  shipping,
  includeShipping,
  targetProfit,
  sellingPrice,
  discountPercent,
  discountedPrice,
  discountedProfit,
  breakdown,
  handleInputChange,
  handleTargetProfitChange,
  setState,
  calculatePrice,
  isProfitHealthy
}: BasicTabContentProps) {
  
  const { 
    handleSaveCalculation, 
    handleExportPdf, 
    handleExportCsv, 
    handleShare 
  } = useCalculatorExport({
    productInfo,
    cost,
    sellingPrice,
    marketplaceName: selectedMarketplace?.name ?? "",
    marketplaceFee,
    taxPercent,
    includeShipping,
    shipping,
    targetProfit,
    breakdown
  });

  return (
    <Card className="shadow-lg w-full max-w-xl mx-auto border-t-4 border-t-brand-600">
      {/* Header with Azuria Logo */}
      <div className="pt-6 pb-4 text-center border-b">
        <div className="flex items-center justify-center mb-3">
          <AppIcon size={48} withShadow />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Calculadora Rápida
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Precificação inteligente para seu produto
        </p>
      </div>
      
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Product information section */}
          <ProductSection 
            marketplace={marketplace}
            setMarketplace={setMarketplace}
            marketplaces={marketplaces}
            productInfo={productInfo}
            setProductInfo={setProductInfo}
          />

          {/* Calculator inputs section */}
          <CalculatorInputsSection 
            cost={cost}
            taxPercent={taxPercent}
            shipping={shipping}
            includeShipping={includeShipping}
            targetProfit={targetProfit}
            handleInputChange={handleInputChange}
            handleTargetProfitChange={handleTargetProfitChange}
            setState={setState}
          />

          {/* Action buttons */}
          <CalculatorActions 
            calculatePrice={calculatePrice}
            handleSaveCalculation={handleSaveCalculation}
            sellingPrice={sellingPrice}
          />

          {/* Results section */}
          <ResultsSection 
            sellingPrice={sellingPrice}
            breakdown={(() => {
              if (!breakdown) { return null as unknown as { cost: number; tax: number; marketplaceFee: number; shipping: number; profit: number } | null; }
              const bd = breakdown as Record<string, unknown>;
              return {
                cost: Number(bd.cost ?? 0),
                tax: Number(bd.tax ?? 0),
                marketplaceFee: Number(bd.marketplaceFee ?? 0),
                shipping: Number(bd.shipping ?? 0),
                profit: Number(bd.profit ?? 0),
              };
            })()}
            taxPercent={Number(taxPercent)}
            marketplaceName={selectedMarketplace?.name ?? ""}
            marketplaceFee={marketplaceFee}
            targetProfit={targetProfit}
            includeShipping={includeShipping}
            discountPercent={discountPercent}
            discountedPrice={discountedPrice}
            discountedProfit={discountedProfit}
            handleInputChange={handleInputChange}
            isProfitHealthy={isProfitHealthy}
            handleExportPdf={handleExportPdf}
            handleExportCsv={handleExportCsv}
            handleShare={handleShare}
            cost={cost}
            productInfo={productInfo}
          />
        </div>
      </CardContent>
    </Card>
  );
}
