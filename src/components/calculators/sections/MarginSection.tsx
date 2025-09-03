
import { Slider } from "@/components/ui/slider";

interface MarginSectionProps {
  margin: number;
  setMargin: (values: number[]) => void;
  isManualMode: boolean;
}

export default function MarginSection({ margin, setMargin, isManualMode }: MarginSectionProps) {
  if (isManualMode) {
    return null;
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 30) { return 'text-green-600'; }
    if (margin >= 20) { return 'text-blue-600'; }
    if (margin >= 10) { return 'text-amber-600'; }
    return 'text-red-600';
  };

  const getMarginStatus = (margin: number) => {
    if (margin >= 30) { return 'Excelente 🎯'; }
    if (margin >= 20) { return 'Boa 👍'; }
    if (margin >= 10) { return 'Adequada ⚠️'; }
    return 'Baixa 📉';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
          <span className="text-xs font-bold text-primary">📈</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Margem de Lucro</h3>
      </div>

      {/* Margin Display */}
      <div className="p-6 bg-gradient-to-r from-primary/5 to-brand-500/5 rounded-xl border border-primary/10">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Margem Desejada</p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-3xl font-bold ${getMarginColor(margin)}`}>
                {margin}%
              </span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full bg-white/60 ${getMarginColor(margin)}`}>
                {getMarginStatus(margin)}
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <Slider
              value={[margin]}
              onValueChange={setMargin}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            {/* Hidden accessible input for testing and keyboards */}
            <input
              aria-label="Margem de Lucro"
              type="range"
              min={1}
              max={100}
              step={1}
              value={margin}
              onChange={(e) => setMargin([Number(e.target.value)])}
              className="sr-only"
            />
            
            {/* Scale indicators */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex flex-col items-center">
                <span className="font-medium">1%</span>
                <span>Mínimo</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">10%</span>
                <span>Básico</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">30%</span>
                <span>Ideal</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">100%</span>
                <span>Máximo</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
