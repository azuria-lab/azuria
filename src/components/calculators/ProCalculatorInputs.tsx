
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ProCalculatorInputsProps {
  cost: string;
  onCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  taxPercent: string;
  onTaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shipping: string;
  onShippingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  includeShipping: boolean;
  onIncludeShippingChange: (val: boolean) => void;
}

const ProCalculatorInputs = ({
  cost, onCostChange, taxPercent, onTaxChange,
  shipping, onShippingChange, includeShipping, onIncludeShippingChange
}: ProCalculatorInputsProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="cost" className="text-base">Custo do Produto (R$)</Label>
        <Input
          id="cost"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={cost || ""}
          onChange={onCostChange}
          className="transition-all focus:ring-2 focus:ring-brand-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tax" className="text-base">Imposto da Nota (%) </Label>
        <Input
          id="tax"
          type="text"
          inputMode="decimal"
          placeholder="7"
          value={taxPercent || ""}
          onChange={onTaxChange}
          className="transition-all focus:ring-2 focus:ring-brand-400"
        />
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="shipping" className="text-base">Frete Grátis</Label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="includeShipping" 
            checked={includeShipping}
            onCheckedChange={v => onIncludeShippingChange(v as boolean)}
          />
          <label
            htmlFor="includeShipping"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Incluir frete grátis
          </label>
        </div>
      </div>
      <Input
        id="shipping"
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={shipping || ""}
        onChange={onShippingChange}
        disabled={!includeShipping}
        className={`transition-all focus:ring-2 focus:ring-brand-400 ${!includeShipping ? 'opacity-50' : ''}`}
      />
      {includeShipping && (
        <p className="text-xs text-gray-500 mt-1">
          Este valor será considerado no cálculo do preço final
        </p>
      )}
    </div>
  </div>
);

export default ProCalculatorInputs;
