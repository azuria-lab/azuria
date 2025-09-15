
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/TutorialTooltip";
import { Calculator, Info, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import { useToast } from "@/hooks/use-toast";

interface BatchCalculatorProps {
  isPro: boolean;
}

interface BatchConfig {
  id: string;
  quantity: number;
  individualCost: number;
  discountPercent: number;
  otherCosts: number;
  margin: number;
  result: BatchResult | null;
}

interface BatchResult {
  unitCost: number;
  totalCost: number;
  unitPrice: number;
  totalPrice: number;
  profit: number;
  margin: number;
}

export default function BatchCalculator({ isPro: _isPro }: BatchCalculatorProps) {
  const { toast } = useToast();
  const [batches, setBatches] = useState<BatchConfig[]>([
    {
      id: "1",
      quantity: 10,
      individualCost: 100,
      discountPercent: 0,
      otherCosts: 50,
      margin: 30,
      result: null
    }
  ]);
  
  const [enableComparison, setEnableComparison] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calcular resultados para um lote
  const calculateBatchResult = (batch: BatchConfig): BatchResult => {
    // Calcular custo com desconto
    const discountMultiplier = 1 - (batch.discountPercent / 100);
    const discountedCost = batch.individualCost * discountMultiplier;
    
    // Custo unitário considerando outros custos
    const unitCost = discountedCost + (batch.otherCosts / batch.quantity);
    const totalCost = unitCost * batch.quantity;
    
    // Preço de venda
    const marginMultiplier = 1 / (1 - (batch.margin / 100));
    const unitPrice = unitCost * marginMultiplier;
    const totalPrice = unitPrice * batch.quantity;
    
    // Lucro e margem real
    const profit = totalPrice - totalCost;
    const realMargin = (profit / totalPrice) * 100;
    
    return {
      unitCost,
      totalCost,
      unitPrice,
      totalPrice,
      profit,
      margin: realMargin
    };
  };
  
  // Calcular todos os lotes
  const calculateAll = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedBatches = batches.map(batch => ({
        ...batch,
        result: calculateBatchResult(batch)
      }));
      
      setBatches(updatedBatches);
      setIsLoading(false);
      
      toast({
        title: "Cálculos concluídos",
        description: `${updatedBatches.length} lotes foram calculados com sucesso.`,
      });
    }, 600);
  };
  
  // Adicionar novo lote
  const addNewBatch = () => {
    const lastBatch = batches[batches.length - 1];
    const newQuantity = lastBatch.quantity * 2; // Dobrar a quantidade do último lote
    
    setBatches([
      ...batches,
      {
        id: Date.now().toString(),
        quantity: newQuantity,
        individualCost: lastBatch.individualCost,
        discountPercent: lastBatch.discountPercent + 5, // Aumentar o desconto em 5%
        otherCosts: lastBatch.otherCosts,
        margin: lastBatch.margin,
        result: null
      }
    ]);
    
    toast({
      title: "Novo lote adicionado",
      description: "Configure os valores e calcule os resultados.",
    });
  };
  
  // Remover um lote
  const removeBatch = (id: string) => {
    if (batches.length <= 1) {
      toast({
        title: "Operação não permitida",
        description: "Você precisa manter pelo menos um lote.",
        variant: "destructive"
      });
      return;
    }
    
    setBatches(batches.filter(batch => batch.id !== id));
    
    toast({
      title: "Lote removido",
      description: "O lote foi removido com sucesso.",
    });
  };
  
  // Atualizar valores de um lote
  const updateBatch = (id: string, field: keyof BatchConfig, value: number) => {
    setBatches(batches.map(batch => 
      batch.id === id ? { ...batch, [field]: value, result: null } : batch
    ));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="shadow-lg border-t-4 border-t-brand-600">
        <CardContent className="p-6">
          {/* Configurações gerais */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-brand-700 flex items-center gap-2">
              <Package2 className="h-5 w-5" /> Cálculo por Quantidade
            </h2>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableComparison"
                checked={enableComparison}
                onCheckedChange={setEnableComparison}
              />
              <Label htmlFor="enableComparison">Comparar lotes</Label>
            </div>
          </div>
          
          {/* Lista de lotes */}
          <div className="space-y-6">
            {batches.map((batch, index) => (
              <div 
                key={batch.id} 
                className="p-4 border rounded-lg border-brand-100 bg-white"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Lote #{index + 1}</h3>
                  
                  <button 
                    onClick={() => removeBatch(batch.id)}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantidade */}
                  <div>
                    <Label htmlFor={`quantity-${batch.id}`} className="flex items-center gap-2">
                      Quantidade 
                      <Tooltip content="Número de unidades no lote">
                        <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                      </Tooltip>
                    </Label>
                    <Input
                      id={`quantity-${batch.id}`}
                      type="number"
                      min="1"
                      value={batch.quantity}
                      onChange={(e) => updateBatch(batch.id, "quantity", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Custo individual */}
                  <div>
                    <Label htmlFor={`cost-${batch.id}`} className="flex items-center gap-2">
                      Custo Unitário (R$)
                      <Tooltip content="Custo de aquisição de cada item">
                        <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                      </Tooltip>
                    </Label>
                    <Input
                      id={`cost-${batch.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={batch.individualCost}
                      onChange={(e) => updateBatch(batch.id, "individualCost", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Desconto por volume */}
                  <div>
                    <div className="flex justify-between">
                      <Label htmlFor={`discount-${batch.id}`}>Desconto por Volume (%)</Label>
                      <span className="text-sm font-medium">{batch.discountPercent}%</span>
                    </div>
                    <Slider
                      id={`discount-${batch.id}`}
                      min={0}
                      max={50}
                      step={1}
                      value={[batch.discountPercent]}
                      onValueChange={([value]) => updateBatch(batch.id, "discountPercent", value)}
                      className="mt-2"
                    />
                  </div>
                  
                  {/* Outros custos */}
                  <div>
                    <Label htmlFor={`otherCosts-${batch.id}`} className="flex items-center gap-2">
                      Outros Custos (R$)
                      <Tooltip content="Custos fixos do lote (frete, embalagem, etc)">
                        <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                      </Tooltip>
                    </Label>
                    <Input
                      id={`otherCosts-${batch.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={batch.otherCosts}
                      onChange={(e) => updateBatch(batch.id, "otherCosts", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Margem desejada */}
                  <div className="md:col-span-2">
                    <div className="flex justify-between">
                      <Label htmlFor={`margin-${batch.id}`}>Margem de Lucro Desejada (%)</Label>
                      <span className="text-sm font-medium">{batch.margin}%</span>
                    </div>
                    <Slider
                      id={`margin-${batch.id}`}
                      min={0}
                      max={80}
                      step={1}
                      value={[batch.margin]}
                      onValueChange={([value]) => updateBatch(batch.id, "margin", value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                {/* Resultados do lote */}
                {batch.result && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Resultados:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Custo unitário:</div>
                        <div className="font-medium">R$ {formatCurrency(batch.result.unitCost)}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Preço unitário:</div>
                        <div className="font-medium">R$ {formatCurrency(batch.result.unitPrice)}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Custo total:</div>
                        <div className="font-medium">R$ {formatCurrency(batch.result.totalCost)}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Receita total:</div>
                        <div className="font-medium">R$ {formatCurrency(batch.result.totalPrice)}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Lucro total:</div>
                        <div className="font-medium">R$ {formatCurrency(batch.result.profit)}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Margem real:</div>
                        <div className="font-medium">{formatCurrency(batch.result.margin)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={calculateAll}
              className="flex-1 bg-brand-600 hover:bg-brand-700 gap-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Calculando..." : "Calcular Todos os Lotes"}
              <Calculator className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={addNewBatch}
              variant="outline"
              className="border-brand-200 hover:bg-brand-50 gap-2"
              size="lg"
            >
              Adicionar Lote
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Tabela comparativa */}
          {enableComparison && batches.some(b => b.result) && (
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Comparação de Lotes:</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote #</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unitário</TableHead>
                      <TableHead>Economia/un.</TableHead>
                      <TableHead>Margem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches
                      .filter(b => b.result)
                      .map((batch, index) => {
                        // Calcular economia em relação ao primeiro lote
                        const firstBatchPrice = batches[0].result?.unitPrice || 0;
                        const currentBatchPrice = batch.result?.unitPrice || 0;
                        const savings = firstBatchPrice - currentBatchPrice;
                        const savingsPercent = (savings / firstBatchPrice) * 100;
                        
                        return (
                          <TableRow key={batch.id} className={index === 0 ? "" : ""}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{batch.quantity}</TableCell>
                            <TableCell>R$ {formatCurrency(batch.result?.unitPrice || 0)}</TableCell>
                            <TableCell>
                              {index === 0 ? (
                                "Referência"
                              ) : (
                                <span className="text-green-600">
                                  {formatCurrency(savings)} ({formatCurrency(savingsPercent)}%)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{formatCurrency(batch.result?.margin || 0)}%</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Gráfico de comparação pode ser adicionado aqui */}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente de ícone para lotes
const Package2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
    <path d="M12 3v6" />
  </svg>
);
