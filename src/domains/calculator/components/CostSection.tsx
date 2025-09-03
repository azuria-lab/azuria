
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/TutorialTooltip";
import { Info } from "lucide-react";
import { FieldGroup } from "@/components/ui/FieldGroup";

interface CostSectionProps {
  cost: string;
  onCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  otherCosts: string;
  onOtherCostsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shipping: string;
  onShippingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  includeShipping: boolean;
  onIncludeShippingChange: (checked: boolean) => void;
  isPro: boolean;
}

export default function CostSection({
  cost,
  onCostChange,
  otherCosts,
  onOtherCostsChange,
  shipping,
  onShippingChange,
  includeShipping,
  onIncludeShippingChange,
  isPro: _isPro
}: CostSectionProps) {
  return (
    <div className="space-y-5 mb-8">
      <FieldGroup aria-label="Campo de custo do produto" className="pb-2">
        <Label htmlFor="cost" className="flex items-center gap-2 text-base md:text-lg">
          <span className="font-bold text-brand-700 text-lg">R$</span> 
          <span className="font-semibold">Custo do Produto</span>
          <Tooltip 
            title="Custo do Produto"
            content="Valor de aquisição/composição do item (sem impostos/taxas)."
            side="top"
          >
            <Info className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-80" aria-label="Mais informações sobre custo do produto"/>
          </Tooltip>
        </Label>
        <Input
          id="cost"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={cost}
          onChange={onCostChange}
          className="text-lg font-semibold focus:ring-2 focus:ring-brand-400 py-3 mt-1 placeholder:font-normal"
          aria-label="Valor do custo do produto"
        />
      </FieldGroup>

      <FieldGroup aria-label="Campo de custos variáveis" className="pb-2">
        <Label htmlFor="otherCosts" className="flex items-center gap-2 text-base md:text-lg">
          <span className="font-bold text-brand-700 text-lg">R$</span> 
          <span className="font-semibold">Custos Variáveis</span>
          <Tooltip 
            title="Custos variáveis"
            content="Embalagem, etiquetas, comissão, etc."
            side="top"
          >
            <Info className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-80" aria-label="Mais informações sobre custos variáveis"/>
          </Tooltip>
        </Label>
        <Input
          id="otherCosts"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={otherCosts}
          onChange={onOtherCostsChange}
          className="text-lg font-semibold focus:ring-2 focus:ring-brand-400 py-3 mt-1 placeholder:font-normal"
          aria-label="Valor de outros custos variáveis"
        />
      </FieldGroup>

      <FieldGroup aria-label="Campo de frete" className="pb-1">
        <Label htmlFor="shipping" className="flex items-center gap-2 text-base md:text-lg">
          <span className="font-bold text-brand-700 text-lg">R$</span> 
          <span className="font-semibold">Frete</span>
          <Tooltip 
            title="Custo de frete"
            content="Valor investido em frete se aplicável ao cálculo."
            side="top"
          >
            <Info className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-80" aria-label="Mais informações sobre frete"/>
          </Tooltip>
        </Label>
        <Input
          id="shipping"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={shipping}
          onChange={onShippingChange}
          className="text-lg font-semibold focus:ring-2 focus:ring-brand-400 py-3 mt-1 placeholder:font-normal"
          disabled={!includeShipping}
          aria-label="Valor do frete"
        />
        <div className="flex items-center space-x-2 ml-1 mt-3">
          <Switch
            id="includeShipping"
            checked={includeShipping}
            onCheckedChange={onIncludeShippingChange}
            aria-label={includeShipping ? "Frete incluído" : "Frete não incluído"}
          />
          <Label htmlFor="includeShipping" className="text-sm text-gray-600">
            Incluir frete no cálculo
          </Label>
        </div>
      </FieldGroup>
    </div>
  );
}
