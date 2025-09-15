
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalculationHistory } from "@/types/simpleCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users } from "lucide-react";
import { useState } from "react";
import CollaborationPanel from "../collaboration/CollaborationPanel";
import { BatchPdfExportButton } from "@/components/pdf/BatchPdfExportButton";

interface HistorySectionProps {
  history: CalculationHistory[];
  formatCurrency: (value: number) => string;
  isPro: boolean;
  loading?: boolean;
  error?: string | null;
}

export default function HistorySection({
  history,
  formatCurrency,
  isPro,
  loading = false,
  error = null
}: HistorySectionProps) {
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationHistory | null>(null);

  if (!isPro) {return null;}
  
  if (loading) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4">Histórico de Cálculos</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-brand-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4">Histórico de Cálculos</h3>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4 flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (history.length === 0) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4">Histórico de Cálculos</h3>
        <Card className="bg-gray-50">
          <CardContent className="p-4 text-center text-gray-500">
            Nenhum cálculo salvo ainda.
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Histórico de Cálculos</h3>
        {history.length > 0 && (
          <BatchPdfExportButton history={history} />
        )}
      </div>
      
      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden border-brand-100">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-brand-700">
                      R$ {formatCurrency(item.result.sellingPrice)}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCalculation(item)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Colaborar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Colaboração - Cálculo</DialogTitle>
                        </DialogHeader>
                        {selectedCalculation && (
                          <CollaborationPanel calculation={selectedCalculation} />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
