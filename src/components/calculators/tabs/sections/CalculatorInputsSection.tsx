
import React from "react";
import { TutorialTooltip as Tooltip } from "@/components/ui/TutorialTooltip";
import ProCalculatorInputs from "../../ProCalculatorInputs";
import ProfitSlider from "../../ProfitSlider";

interface CalculatorInputsSectionProps {
  cost: string;
  taxPercent: string;
  shipping: string;
  includeShipping: boolean;
  targetProfit: number;
  handleInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTargetProfitChange: (values: number[]) => void;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

export default function CalculatorInputsSection({
  cost,
  taxPercent,
  shipping,
  includeShipping,
  targetProfit,
  handleInputChange,
  handleTargetProfitChange,
  setState
}: CalculatorInputsSectionProps) {
  return (
    <div className="space-y-6">
      <Tooltip
        title="Dados do Produto"
        content="Insira o custo do seu produto, impostos e frete grátis (se aplicável). Estes valores serão usados para calcular o preço ideal de venda."
      >
        <ProCalculatorInputs
          cost={cost}
          onCostChange={handleInputChange('cost')}
          taxPercent={taxPercent}
          onTaxChange={handleInputChange('taxPercent')}
          shipping={shipping}
          onShippingChange={handleInputChange('shipping')}
          includeShipping={includeShipping as boolean}
          onIncludeShippingChange={(value) => 
            setState((prev) => ({ ...prev, includeShipping: value }))}
        />
      </Tooltip>

      <Tooltip
        title="Margem de Lucro"
        content="Ajuste sua margem de lucro desejada. O preço de venda será calculado para atingir esta margem considerando todos os custos."
      >
        <ProfitSlider
          targetProfit={targetProfit as number}
          onChange={handleTargetProfitChange}
        />
      </Tooltip>
    </div>
  );
}
