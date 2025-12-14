
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Edit3, Settings } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 border border-blue-100">
            <Settings className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">Modo de Cálculo</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isManualMode 
                ? "Insira o preço de venda desejado para análise de margem" 
                : "Calcule automaticamente o preço baseado na margem de lucro configurada"}
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleMode}
            className="h-9 text-xs border-border hover:bg-accent"
            aria-label={isManualMode ? "Modo Automático" : "Modo Manual"}
          >
            {isManualMode ? (
              <>
                <Calculator className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                Calcular por Margem
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                Inserir Preço Final
              </>
            )}
          </Button>
        </motion.div>
      </div>
      
      {isManualMode && (
        <div className="space-y-2">
          <Label htmlFor="manual-price" className="text-sm font-medium text-foreground">
            Preço de Venda
          </Label>
          <Input
            id="manual-price"
            type="text"
            placeholder="0,00"
            value={manualPrice}
            onChange={(e) => onManualPriceChange(e.target.value)}
            className="h-11 text-base font-medium border-border focus:ring-2 focus:ring-blue-500/20 border-l-4 border-l-blue-500"
          />
          <p className="text-xs text-muted-foreground">
            Informe o preço de venda desejado para calcular a margem de lucro correspondente
          </p>
        </div>
      )}
    </div>
  );
}
