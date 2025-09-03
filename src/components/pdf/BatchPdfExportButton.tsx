import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { generateBatchPDF } from "@/utils/pdf/pdfGenerator";
import { CalculationHistory } from "@/types/simpleCalculator";
import { useToast } from "@/hooks/use-toast";

interface BatchPdfExportButtonProps {
  history: CalculationHistory[];
  disabled?: boolean;
}

export const BatchPdfExportButton = ({ history, disabled }: BatchPdfExportButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleBatchExport = async () => {
    if (!history || history.length === 0) {
      toast({
        title: "Nenhum cálculo disponível",
        description: "Não há cálculos no histórico para exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Converter histórico para formato do PDF
      const calculations = history.map((item, index) => ({
        calculation: {
          cost: item.cost,
          margin: item.margin,
          tax: item.tax || "",
          cardFee: item.cardFee || "",
          otherCosts: item.otherCosts || "",
          shipping: item.shipping || "",
          includeShipping: item.includeShipping || false
        },
        result: item.result,
        productName: `Produto ${index + 1}`,
        date: item.date.toLocaleDateString("pt-BR")
      }));

      generateBatchPDF(calculations);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: `Relatório em lote com ${history.length} cálculos foi baixado.`,
      });
      
    } catch (error) {
      console.error("Erro ao gerar PDF em lote:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleBatchExport}
      disabled={disabled || !history || history.length === 0 || isGenerating}
      className="gap-2 hover:bg-primary/10"
    >
      {isGenerating ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isGenerating ? "Gerando..." : "Exportar Histórico PDF"}
    </Button>
  );
};