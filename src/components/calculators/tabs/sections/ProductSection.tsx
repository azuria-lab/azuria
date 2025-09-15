
import React from "react";
import { TutorialTooltip as Tooltip } from "@/components/ui/TutorialTooltip";
import MarketplaceSelector from "../../MarketplaceSelector";
import ProductInfoForm from "../../ProductInfoForm";
import { Marketplace } from "@/data/marketplaces";

interface ProductSectionProps {
  marketplace: string;
  setMarketplace: (value: string) => void;
  marketplaces: Marketplace[];
  productInfo: { name: string; sku: string; category: string };
  setProductInfo: React.Dispatch<React.SetStateAction<{ name: string; sku: string; category: string }>>;
}

export default function ProductSection({
  marketplace,
  setMarketplace,
  marketplaces,
  productInfo,
  setProductInfo
}: ProductSectionProps) {
  // Function to handle product info submission
  const handleProductInfoSubmit = (data: { name: string; sku: string; category: string }) => {
    setProductInfo(data);
  };

  return (
    <div className="space-y-6">
      <Tooltip 
        title="Seleção de Marketplace"
        content="Selecione o marketplace onde você vende. A taxa correta será aplicada automaticamente no cálculo."
      >
        <MarketplaceSelector
          marketplace={marketplace}
          onChange={(value) => setMarketplace(value)}
          marketplaces={marketplaces}
        />
      </Tooltip>

      <ProductInfoForm 
        onSubmit={handleProductInfoSubmit}
        initialData={productInfo}
      />
    </div>
  );
}
