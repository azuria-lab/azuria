
import { Tooltip } from "@/components/ui/TutorialTooltip";
import ProCalculatorResult from "./ProCalculatorResult";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProCalculatorDetailsProps {
  sellingPrice: number | null;
  breakdown: {
    cost: number;
    tax: number;
    marketplaceFee: number;
    shipping: number;
    profit: number;
  } | null;
  taxPercent: number;
  marketplaceName: string;
  marketplaceFee: number;
  targetProfit: number;
  includeShipping: boolean;
  discountPercent: number;
  discountedPrice: number | null;
  discountedProfit: number | null;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProfitHealthy: (profit: number) => boolean;
}

export default function ProCalculatorDetails({
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
  onDiscountChange,
  isProfitHealthy
}: ProCalculatorDetailsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  if (!sellingPrice || !breakdown) {return null;}

  // Funções para compartilhamento e exportação
  const handleExportPdf = () => {
    toast({
      title: "Exportando para PDF",
      description: "Iniciando geração do arquivo PDF"
    });
    
    // Simulação de download
    setTimeout(() => {
      toast({
        title: "PDF Gerado",
        description: "O PDF foi gerado com sucesso e está sendo baixado"
      });
    }, 1500);
  };

  // Gerar texto de compartilhamento
  const generateShareText = () => {
    return `
*Calculadora PRO Precifica+*
Custo: R$ ${breakdown.cost.toFixed(2).replace(".", ",")}
Preço de venda: R$ ${sellingPrice.toFixed(2).replace(".", ",")}
Lucro: R$ ${breakdown.profit.toFixed(2).replace(".", ",")} (${targetProfit}%)
---
Marketplace: ${marketplaceName} (${marketplaceFee}%)
Impostos: ${taxPercent}%
${includeShipping ? `Frete: R$ ${breakdown.shipping.toFixed(2).replace(".", ",")}` : ''}
    `.trim();
  };

  const handleShare = () => {
    const shareText = generateShareText();

    if (navigator.share) {
      navigator.share({
        title: 'Cálculo Precifica+',
        text: shareText
      }).catch(() => {
        // Fallback: copiar para área de transferência
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Texto copiado",
          description: "O texto foi copiado para a área de transferência"
        });
      });
    } else {
      // Fallback para navegadores sem suporte à API Share
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Texto copiado", 
        description: "O texto foi copiado para a área de transferência"
      });
    }
  };
  
  // Função para ir para a página de integrações
  const goToIntegrations = () => {
    // Salvamos os dados temporariamente em localStorage para poder usá-los na página de integrações
    localStorage.setItem('lastCalculation', JSON.stringify({
      cost: breakdown.cost,
      sellingPrice: sellingPrice,
      profit: breakdown.profit,
      marketplaceName: marketplaceName,
      marketplaceFee: marketplaceFee,
      taxPercent: taxPercent,
      shipping: includeShipping ? breakdown.shipping : 0,
      includeShipping: includeShipping
    }));
    
    // Navegamos para a página de integrações
    navigate('/integracoes');
  };

  return (
    <Tooltip
      title="Resultado Detalhado"
      content="Aqui você encontra o detalhamento completo do preço, incluindo todos os custos e sua margem de lucro."
    >
      <ProCalculatorResult
        sellingPrice={sellingPrice}
        breakdown={breakdown}
        taxPercent={taxPercent}
        marketplaceName={marketplaceName}
        marketplaceFee={marketplaceFee}
        targetProfit={targetProfit}
        includeShipping={includeShipping}
        discountPercent={discountPercent}
        discountedPrice={discountedPrice}
        discountedProfit={discountedProfit}
        onDiscountChange={onDiscountChange}
        profitHealthy={isProfitHealthy}
        onExportPdf={handleExportPdf}
        onShare={handleShare}
        onGoToIntegrations={goToIntegrations}
        shareText={generateShareText()}
      />
    </Tooltip>
  );
}
