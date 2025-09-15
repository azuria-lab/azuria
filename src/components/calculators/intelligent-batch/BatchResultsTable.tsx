
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface BatchItem {
  id: string;
  quantity: number;
  unitCost: number;
  discountPercent: number;
  targetMargin: number;
  aiSuggestedPrice?: number;
  competitivePrice?: number;
}

interface BatchResultsTableProps {
  batches: BatchItem[];
  isPro: boolean;
}

export default function BatchResultsTable({ batches, isPro }: BatchResultsTableProps) {
  
  const calculateResults = (batch: BatchItem) => {
    const discountedCost = batch.unitCost * (1 - batch.discountPercent / 100);
    const targetPrice = discountedCost / (1 - batch.targetMargin / 100);
    const totalCost = discountedCost * batch.quantity;
    const totalRevenue = targetPrice * batch.quantity;
    const profit = totalRevenue - totalCost;
    const actualMargin = (profit / totalRevenue) * 100;

    return {
      unitCostAfterDiscount: discountedCost,
      suggestedPrice: targetPrice,
      totalCost,
      totalRevenue,
      profit,
      actualMargin
    };
  };

  const getCompetitiveIndicator = (ourPrice: number, competitorPrice?: number) => {
    if (!competitorPrice) {return null;}
    
    const difference = ((ourPrice - competitorPrice) / competitorPrice) * 100;
    
    if (difference > 5) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (difference < -5) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados dos Lotes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo Unit. Final</TableHead>
                <TableHead>Preço Sugerido</TableHead>
                {isPro && <TableHead>IA Sugestão</TableHead>}
                {isPro && <TableHead>Competitivo</TableHead>}
                <TableHead>Margem</TableHead>
                <TableHead>Receita Total</TableHead>
                <TableHead>Lucro Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => {
                const results = calculateResults(batch);
                return (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <Badge variant="outline">{batch.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      R$ {formatCurrency(results.unitCostAfterDiscount)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        R$ {formatCurrency(results.suggestedPrice)}
                      </span>
                    </TableCell>
                    {isPro && (
                      <TableCell>
                        {batch.aiSuggestedPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-600">
                              R$ {formatCurrency(batch.aiSuggestedPrice)}
                            </span>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              IA
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    )}
                    {isPro && (
                      <TableCell>
                        {batch.competitivePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              R$ {formatCurrency(batch.competitivePrice)}
                            </span>
                            {getCompetitiveIndicator(results.suggestedPrice, batch.competitivePrice)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge 
                        className={
                          results.actualMargin >= 30 ? "bg-green-100 text-green-700" :
                          results.actualMargin >= 20 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }
                      >
                        {formatCurrency(results.actualMargin)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        R$ {formatCurrency(results.totalRevenue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-blue-600">
                        R$ {formatCurrency(results.profit)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {batches.length > 1 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Resumo Total</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Receita Total:</span>
                <p className="font-bold text-green-600">
                  R$ {formatCurrency(
                    batches.reduce((total, batch) => {
                      const results = calculateResults(batch);
                      return total + results.totalRevenue;
                    }, 0)
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Lucro Total:</span>
                <p className="font-bold text-blue-600">
                  R$ {formatCurrency(
                    batches.reduce((total, batch) => {
                      const results = calculateResults(batch);
                      return total + results.profit;
                    }, 0)
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Margem Média:</span>
                <p className="font-bold">
                  {formatCurrency(
                    batches.reduce((total, batch) => {
                      const results = calculateResults(batch);
                      return total + results.actualMargin;
                    }, 0) / batches.length
                  )}%
                </p>
              </div>
              <div>
                <span className="text-gray-600">Itens Totais:</span>
                <p className="font-bold">
                  {batches.reduce((total, batch) => total + batch.quantity, 0)} unidades
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
