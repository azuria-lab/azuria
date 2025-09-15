
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalculationHistory } from "@/types/simpleCalculator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText } from "lucide-react";

interface HistoryDetailDialogProps {
  item: CalculationHistory;
  formatCurrency: (value: number) => string;
  onClose: () => void;
  onExportPDF: () => void;
}

export default function HistoryDetailDialog({
  item,
  formatCurrency,
  onClose,
  onExportPDF
}: HistoryDetailDialogProps) {
  const { result, cost, margin, tax, cardFee, otherCosts, shipping, includeShipping, date } = item;
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Cálculo</DialogTitle>
          <DialogDescription>
            {format(new Date(date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Custo do Produto</h3>
              <p className="text-base">R$ {cost.replace(".", ",")}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Margem</h3>
              <p className="text-base">{margin}%</p>
            </div>
            
            {tax && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Imposto</h3>
                <p className="text-base">{tax}%</p>
              </div>
            )}
            
            {cardFee && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Taxa de Cartão</h3>
                <p className="text-base">{cardFee}%</p>
              </div>
            )}
            
            {otherCosts && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Outros Custos</h3>
                <p className="text-base">R$ {otherCosts.replace(".", ",")}</p>
              </div>
            )}
            
            {shipping && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Frete</h3>
                <p className="text-base">
                  R$ {shipping.replace(".", ",")}
                  {includeShipping ? " (incluído no preço)" : ""}
                </p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Resultado do Cálculo</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-xs text-gray-500">Preço de Venda</h4>
                <p className="text-lg font-semibold text-brand-700">
                  R$ {formatCurrency(result.sellingPrice)}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xs text-gray-500">Lucro</h4>
                <p className={`text-base ${result.isHealthyProfit ? "text-green-600" : "text-amber-600"}`}>
                  R$ {formatCurrency(result.profit)}
                </p>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">Composição do Preço</h3>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Custo base:</span>
                <span>R$ {formatCurrency(result.breakdown.costValue)}</span>
              </div>
              
              {result.breakdown.otherCostsValue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Outros custos:</span>
                  <span>R$ {formatCurrency(result.breakdown.otherCostsValue)}</span>
                </div>
              )}
              
              {result.breakdown.shippingValue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Frete:</span>
                  <span>R$ {formatCurrency(result.breakdown.shippingValue)}</span>
                </div>
              )}
              
              {result.breakdown.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Imposto:</span>
                  <span>R$ {formatCurrency(result.breakdown.taxAmount)}</span>
                </div>
              )}
              
              {result.breakdown.cardFeeAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxa cartão:</span>
                  <span>R$ {formatCurrency(result.breakdown.cardFeeAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-500">Margem:</span>
                <span>R$ {formatCurrency(result.breakdown.marginAmount)} ({result.breakdown.realMarginPercent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          
          <Button onClick={onExportPDF} className="bg-brand-600 hover:bg-brand-700">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
