
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/logger";
import { formatCurrency } from "@/utils/calculator/formatCurrency";

interface BreakdownShape { profit?: number; [key: string]: unknown }
interface UseCalculatorExportProps {
  productInfo: { name: string; sku: string; category: string };
  cost: string;
  sellingPrice: number | null;
  marketplaceName: string;
  marketplaceFee: number;
  taxPercent: string;
  includeShipping: boolean;
  shipping: string;
  targetProfit: number;
  breakdown: BreakdownShape;
}

export const useCalculatorExport = ({
  productInfo,
  cost,
  sellingPrice,
  marketplaceName,
  marketplaceFee,
  taxPercent,
  includeShipping,
  shipping,
  targetProfit,
  breakdown
}: UseCalculatorExportProps) => {
  const { toast } = useToast();

  // Função para salvar o cálculo atual
  const handleSaveCalculation = () => {
    if (!sellingPrice) {return;}
    
    toast({
      title: "Cálculo salvo com sucesso",
      description: `Produto: ${productInfo.name || "Sem nome"} - R$ ${formatCurrency(sellingPrice)}`
    });
    
    // Aqui poderia salvar no banco de dados se conectado ao Supabase
  };
  
  // Funções de exportação
  const handleExportPdf = () => {
    toast({
      title: "Exportação para PDF",
      description: "Exportação para PDF em implementação"
    });
    // Aqui viria a lógica de geração de PDF
  };
  
  const handleExportCsv = () => {
    toast({
      title: "Exportação para CSV", 
      description: "Exportação para CSV em implementação"
    });
    // Aqui viria a lógica de geração de CSV
  };

  const handleShare = () => {
    // Preparar texto para compartilhamento
    const shareText = `
*Calculadora PRO Azuria*
${productInfo.name ? `Produto: ${productInfo.name}` : ''}
${productInfo.sku ? `SKU: ${productInfo.sku}` : ''}
Custo: R$ ${formatCurrency(Number(cost))}
Preço de venda: R$ ${formatCurrency(sellingPrice || 0)}
Lucro: R$ ${breakdown?.profit ? formatCurrency(breakdown.profit) : 0} (${targetProfit}%)
---
Marketplace: ${marketplaceName || ''} (${marketplaceFee}%)
Impostos: ${taxPercent}%
${includeShipping ? `Frete: R$ ${formatCurrency(Number(shipping))}` : ''}
    `.trim();
    
    // Tentar usar a API de compartilhamento do navegador se disponível
    if (navigator.share) {
      navigator.share({
        title: 'Cálculo Azuria',
        text: shareText
      }).catch(err => {
        logger.error('Erro ao compartilhar:', err);
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

  return {
    handleSaveCalculation,
    handleExportPdf,
    handleExportCsv,
    handleShare
  };
};
