
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProComparisonTable from "../ProComparisonTable";
import SalesGoalsProjection from "../SalesGoalsProjection";

interface Competitor {
  name: string;
  price: number;
  difference: number;
}

interface AdvancedTabContentProps {
  sellingPrice: number | null;
  competitors: Competitor[];
  updateCompetitor: (index: number, price: number) => void;
  targetProfit: number;
  breakdown: { profit?: number } | null;
  setActiveTab: (tab: string) => void;
  formatCurrency: (value: number) => string;
}

export default function AdvancedTabContent({
  sellingPrice,
  competitors,
  updateCompetitor,
  targetProfit,
  breakdown,
  setActiveTab,
  formatCurrency
}: AdvancedTabContentProps) {
  
  if (!sellingPrice) {
    return (
      <Card className="shadow-lg w-full mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <p className="text-gray-500">Calcule o preço na aba "Preço" para visualizar análises.</p>
            <Button 
              className="mt-4"
              onClick={() => setActiveTab("basic")}
            >
              Ir para cálculo de preço
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg w-full mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-8">
          <h3 className="text-lg font-medium text-center mb-4">Análise de Vendas e Projeções</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">Preços da Concorrência</h4>
              
              <div className="space-y-4">
                {competitors.map((comp, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-sm mb-1" htmlFor={`competitor-${index}`}>
                        {comp.name}
                      </label>
                      <input
                        id={`competitor-${index}`}
                        type="text"
                        value={comp.price || ""}
                        onChange={(e) => updateCompetitor(index, Number(e.target.value.replace(",", ".")))}
                        placeholder="0,00"
                        className="px-3 py-2 w-full border rounded-md"
                      />
                    </div>
                    <div className="text-sm pb-2 min-w-[90px]">
                      {comp.price > 0 && (
                        <span className={comp.difference > 0 ? "text-green-600" : "text-red-500"}>
                          {comp.difference > 0 ? "+" : ""}
                          R$ {formatCurrency(Math.abs(comp.difference))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <ProComparisonTable 
                sellingPrice={sellingPrice} 
                competitors={competitors}
                formatCurrency={formatCurrency}
              />
            </div>
            
            <SalesGoalsProjection
              sellingPrice={sellingPrice}
              profitMargin={targetProfit as number}
              profitAmount={breakdown?.profit ?? 0}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
