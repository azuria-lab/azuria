
// Espaçamento, responsividade otimizada para mobile e conforto desktop.

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip } from "@/components/ui/TutorialTooltip";
import { Info } from "lucide-react";
import { FieldGroup } from "@/components/ui/FieldGroup";

interface TaxFeeSectionProps {
  tax: string;
  onTaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cardFee: string;
  onCardFeeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPro: boolean;
}

export default function TaxFeeSection({
  tax,
  onTaxChange,
  cardFee,
  onCardFeeChange,
  isPro: _isPro
}: TaxFeeSectionProps) {
  return (
    <div className="space-y-5 mb-8">
      <div className="grid grid-cols-1 gap-y-5 md:grid-cols-2 md:gap-x-8">
        {/* Impostos */}
        <FieldGroup aria-label="Campo de imposto sobre a venda" className="pb-2">
          <Label htmlFor="tax" className="flex items-center gap-2 text-base md:text-lg">
            <span className="font-bold text-brand-700 text-lg">%</span> 
            <span className="font-semibold">Impostos</span>
            <Tooltip 
              title="Impostos"
              content="Soma dos tributos incidentes na venda"
              side="top"
            >
              <Info className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-80" aria-label="Mais informações sobre impostos"/>
            </Tooltip>
          </Label>
          <Input
            id="tax"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={tax}
            onChange={onTaxChange}
            className="text-lg font-semibold focus:ring-2 focus:ring-brand-400 py-3 mt-1 placeholder:font-normal"
            aria-label="Percentual de impostos"
          />
        </FieldGroup>
        {/* Taxas */}
        <FieldGroup aria-label="Campo de taxas" className="pb-2">
          <Label htmlFor="cardFee" className="flex items-center gap-2 text-base md:text-lg">
            <span className="font-bold text-brand-700 text-lg">%</span> 
            <span className="font-semibold">Taxas</span>
            <Tooltip 
              title="Taxas"
              content="Taxas de maquininha, marketplace e afins"
              side="top"
            >
              <Info className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-80" aria-label="Mais informações sobre taxas"/>
            </Tooltip>
          </Label>
          <Input
            id="cardFee"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={cardFee}
            onChange={onCardFeeChange}
            className="text-lg font-semibold focus:ring-2 focus:ring-brand-400 py-3 mt-1 placeholder:font-normal"
            aria-label="Percentual de taxas"
          />
        </FieldGroup>
      </div>
    </div>
  );
}
