
import { motion } from "framer-motion";
import ProPriceVariations from "./ProPriceVariations";
import ProPriceBreakdown from "./ProPriceBreakdown";
import ProDiscountSimulator from "./ProDiscountSimulator";
import { ProResultHeader } from "./pro-result/ProResultHeader";
import { ProResultActions } from "./pro-result/ProResultActions";
import { ProResultAdvice } from "./pro-result/ProResultAdvice";

// Types
interface Breakdown {
  cost: number;
  tax: number;
  marketplaceFee: number;
  shipping: number;
  profit: number;
}

interface ProCalculatorResultProps {
  sellingPrice: number;
  breakdown: Breakdown;
  taxPercent: number;
  marketplaceName: string;
  marketplaceFee: number;
  targetProfit: number;
  includeShipping: boolean;
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profitHealthy: (profit: number) => boolean;
  onExportPdf: () => void;
  onShare: () => void;
  onGoToIntegrations?: () => void;
  shareText?: string;
}

const ProCalculatorResult = ({
  sellingPrice, breakdown, taxPercent, marketplaceName, marketplaceFee, targetProfit,
  includeShipping, discountPercent, discountedPrice, discountedProfit, onDiscountChange, 
  profitHealthy, onExportPdf, onShare, onGoToIntegrations, shareText
}: ProCalculatorResultProps) => {
  
  // Calculate price variations
  const minMargin = Math.max(targetProfit * 0.7, 5); // 70% of target or minimum 5%
  const competitiveMargin = Math.max(targetProfit * 0.85, 8); // 85% of target or minimum 8%
  
  // Calculamos o preço mínimo absoluto (baseado em custo total + margem mínima de segurança de 10%)
  const minimumMarginRate = 0.10; // 10% de margem mínima de segurança
  const totalCost = breakdown.cost + 
    (includeShipping ? breakdown.shipping : 0) + 
    breakdown.tax + 
    breakdown.marketplaceFee;
  const minimumPrice = totalCost / (1 - minimumMarginRate);
  
  // Verificamos se o preço está abaixo ou próximo do mínimo recomendado
  const priceBelowMinimum = sellingPrice < minimumPrice;
  const priceNearMinimum = !priceBelowMinimum && sellingPrice < minimumPrice * 1.05; // 5% acima do mínimo
  const showAlert = priceBelowMinimum || priceNearMinimum;

  const priceVariations = [
    {
      name: "Preço Mínimo",
      price: breakdown.cost / (1 - (minMargin / 100) - (taxPercent / 100) - (marketplaceFee / 100)),
      margin: minMargin,
      description: "Preço mínimo viável para seu negócio",
      highlight: false,
    },
    {
      name: "Preço Ideal",
      price: sellingPrice,
      margin: targetProfit,
      description: "Preço sugerido com base na sua margem alvo",
      highlight: true,
    },
    {
      name: "Preço Competitivo",
      price: breakdown.cost / (1 - (competitiveMargin / 100) - (taxPercent / 100) - (marketplaceFee / 100)),
      margin: competitiveMargin,
      description: "Preço para ganhar competitividade no mercado",
      highlight: false,
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
      className="mt-8 pt-6 border-t border-gray-200 space-y-5"
    >
      {/* Header com alertas e preço principal */}
      <ProResultHeader
        currentPrice={sellingPrice}
        minimumPrice={minimumPrice}
        priceBelowMinimum={priceBelowMinimum}
        priceNearMinimum={priceNearMinimum}
        showAlert={showAlert}
      />
      
      {/* Simulação de Faixas de Preço */}
      <ProPriceVariations variations={priceVariations} />

      {/* Detalhamento dos Custos */}
      <ProPriceBreakdown
        breakdown={breakdown}
        taxPercent={taxPercent}
        marketplaceName={marketplaceName}
        marketplaceFee={marketplaceFee}
        includeShipping={includeShipping}
        targetProfit={targetProfit}
        profitHealthy={profitHealthy}
      />

      {/* Simulador de Desconto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ProDiscountSimulator
          discountPercent={discountPercent}
          discountedPrice={discountedPrice}
          discountedProfit={discountedProfit}
          onDiscountChange={onDiscountChange}
          profitHealthy={profitHealthy}
        />
      </motion.div>
      
      {/* Exportação e Compartilhamento */}
      <ProResultActions
        onExportPdf={onExportPdf}
        onShare={onShare}
        onGoToIntegrations={onGoToIntegrations}
        shareText={shareText}
      />
      
      {/* Conselho sobre precificação */}
      <ProResultAdvice />
    </motion.div>
  );
};

export default ProCalculatorResult;
