
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import IntelligenceHeader from "@/components/intelligence/IntelligenceHeader";
import IntelligenceConfig from "@/components/intelligence/IntelligenceConfig";
import IntelligenceTabs from "@/components/intelligence/IntelligenceTabs";
import IntelligenceFooter from "@/components/intelligence/IntelligenceFooter";

export default function IntelligenceDataPage() {
  const [selectedProduct, setSelectedProduct] = useState({
    category: "Eletrônicos",
    currentPrice: 299.99,
    cost: 180.00,
    margin: 40,
    salesVolume: 150
  });
  
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <IntelligenceHeader />
        
        <IntelligenceConfig
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />

        <IntelligenceTabs 
          selectedProduct={selectedProduct}
          timeframe={timeframe}
        />

        <IntelligenceFooter />
      </div>
    </Layout>
  );
}
