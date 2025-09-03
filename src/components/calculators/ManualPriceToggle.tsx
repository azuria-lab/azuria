
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Edit3 } from "lucide-react";

interface ManualPriceToggleProps {
  isManualMode: boolean;
  onToggleMode: () => void;
  manualPrice: string;
  onManualPriceChange: (value: string) => void;
  currentPrice: number | null;
}

export default function ManualPriceToggle({
  isManualMode,
  onToggleMode,
  manualPrice,
  onManualPriceChange,
  currentPrice: _currentPrice
}: ManualPriceToggleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Modo de Cálculo</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleMode}
          className="h-8 text-xs"
          aria-label={isManualMode ? "Modo Automático" : "Modo Manual"}
        >
          {isManualMode ? (
            <>
              <Calculator className="w-3 h-3 mr-1" />
              Calcular por Margem
            </>
          ) : (
            <>
              <Edit3 className="w-3 h-3 mr-1" />
              Inserir Preço Final
            </>
          )}
        </Button>
      </div>
      
      {isManualMode && (
        <div className="space-y-2">
          <Label htmlFor="manual-price">Preço Manual</Label>
          <Input
            id="manual-price"
            type="text"
            placeholder="0,00"
            value={manualPrice}
            onChange={(e) => onManualPriceChange(e.target.value)}
            className="text-lg font-medium"
          />
          <p className="text-xs text-gray-500">
            Digite o preço final e veja qual seria sua margem de lucro
          </p>
        </div>
      )}
    </div>
  );
}
