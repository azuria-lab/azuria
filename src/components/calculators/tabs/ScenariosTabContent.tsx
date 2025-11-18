
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScenarioSimulator from "../ScenarioSimulator";

interface ScenarioLike {
  name: string;
  costVariation: number;
  marginVariation: number;
  taxVariation: number;
  result: number | null;
}

interface ScenariosTabContentProps {
  sellingPrice: number | null;
  cost: string;
  targetProfit: number;
  taxPercent: string;
  setActiveTab: (tab: string) => void;
  onSaveScenario: (scenario: ScenarioLike) => void;
}

export default function ScenariosTabContent({
  sellingPrice,
  cost,
  targetProfit,
  taxPercent: _taxPercent,
  setActiveTab,
  onSaveScenario: _onSaveScenario
}: ScenariosTabContentProps) {
  
  if (!sellingPrice) {
    return (
      <Card className="shadow-lg w-full mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <p className="text-gray-500">Calcule o preço na aba "Preço" para simular cenários.</p>
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
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-center mb-4">Simulação de Cenários</h3>
          
          <ScenarioSimulator
            baseScenario={{
              cost: Number(cost),
              targetMargin: targetProfit,
              shipping: 0,
              packaging: 0,
              marketing: 0,
              otherCosts: 0,
              marketplace: '',
              paymentMethod: 'credit',
              includePaymentFee: false,
            }}
          />
          
          <div className="border-t pt-4 mt-8">
            <p className="text-sm text-gray-600 text-center">
              As simulações permitem analisar como variações no custo, margem e impostos 
              afetariam seu preço de venda e sua competitividade.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
