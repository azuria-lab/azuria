import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText } from "lucide-react";
import { generateCalculationPDF } from "@/utils/pdf/pdfGenerator";
import { CalculationResult } from "@/types/simpleCalculator";
import { useToast } from "@/hooks/use-toast";

interface PdfExportDialogProps {
  calculation: {
    cost: string;
    margin: number;
    tax: string;
    cardFee: string;
    otherCosts: string;
    shipping: string;
    includeShipping: boolean;
  };
  result: CalculationResult;
  disabled?: boolean;
}

export const PdfExportDialog = ({ calculation, result, disabled }: PdfExportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [productName, setProductName] = useState("");
  const [observations, setObservations] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!result) {
      toast({
        title: "Erro",
        description: "Nenhum cálculo disponível para exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pdfData = {
        calculation,
        result,
        companyName: companyName || undefined,
        productName: productName || `Produto-${Date.now()}`,
        date: new Date().toLocaleDateString("pt-BR"),
        observations
      };

      generateCalculationPDF(pdfData);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O relatório foi baixado para seu dispositivo.",
      });

      setOpen(false);
      
      // Reset form
      setCompanyName("");
      setProductName("");
      setObservations("");
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled || !result}
          className="gap-2 hover:bg-primary/10"
        >
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Exportar Relatório PDF
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Minha Empresa Ltda"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Produto Premium"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observations">Observações (opcional)</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Adicione observações ou notas sobre este cálculo..."
              rows={3}
            />
          </div>
          
          {/* Preview dos dados principais */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Preview do Relatório:</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Preço de Venda:</span>
                <span className="font-medium">R$ {result?.sellingPrice.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Lucro:</span>
                <span className="font-medium text-green-600">R$ {result?.profit.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Margem:</span>
                <span className="font-medium">{result?.breakdown.realMarginPercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGenerating ? "Gerando..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};