
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculationHistory } from "@/types/simpleCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, FileText, Trash2 } from "lucide-react";
import HistoryDetailDialog from "./HistoryDetailDialog";
import { generatePDF } from "@/utils/pdf/generatePDF";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/logger";

interface HistoryListProps {
  history: CalculationHistory[];
  formatCurrency: (value: number) => string;
  onDeleteItem: (id: string) => Promise<void>;
  loading: boolean;
}

export default function HistoryList({ 
  history, 
  formatCurrency, 
  onDeleteItem,
  loading 
}: HistoryListProps) {
  const [selectedItem, setSelectedItem] = useState<CalculationHistory | null>(null);
  const { toast } = useToast();

  // Função para exportar para PDF
  const handleExportPDF = async (item: CalculationHistory) => {
    try {
      await generatePDF(item, formatCurrency);
      toast({
        title: "PDF gerado com sucesso!",
        description: "O download do PDF foi iniciado automaticamente.",
      });
    } catch (error) {
      logger.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível criar o arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
              <div className="mt-3">
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhum cálculo encontrado no histórico.</p>
          <p className="text-sm text-gray-400 mt-2">
            Os cálculos que você realizar serão salvos automaticamente aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden border-brand-100 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(item.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                </span>
                <span className="text-sm font-medium text-brand-700">
                  R$ {formatCurrency(item.result.sellingPrice)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Custo:</span>
                  <span>R$ {item.cost.replace(".", ",")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margem:</span>
                  <span>{item.margin}%</span>
                </div>
                {item.tax && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Imposto:</span>
                    <span>{item.tax}%</span>
                  </div>
                )}
                {item.result.breakdown.shippingValue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frete:</span>
                    <span>R$ {formatCurrency(item.result.breakdown.shippingValue)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2 border-t pt-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedItem(item)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Detalhes
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExportPDF(item)}
                    className="text-xs"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (window.confirm("Tem certeza que deseja excluir este item?")) {
                      onDeleteItem(item.id);
                    }
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedItem && (
        <HistoryDetailDialog 
          item={selectedItem} 
          formatCurrency={formatCurrency} 
          onClose={() => setSelectedItem(null)} 
          onExportPDF={() => handleExportPDF(selectedItem)}
        />
      )}
    </>
  );
}
