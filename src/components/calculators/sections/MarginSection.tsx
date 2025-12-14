
import { Slider } from "@/components/ui/slider";
import { TrendingUp } from "lucide-react";

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
    if (margin >= 10) { return 'text-cyan-600'; }
    return 'text-slate-600';
  };

  const getMarginIconColor = (margin: number) => {
    if (margin >= 30) { return 'text-green-500'; }
    if (margin >= 20) { return 'text-blue-500'; }
    if (margin >= 10) { return 'text-cyan-500'; }
    return 'text-slate-500';
  };

  const getMarginBorderColor = (margin: number) => {
    if (margin >= 30) { return 'border-l-green-500'; }
    if (margin >= 20) { return 'border-l-blue-500'; }
    if (margin >= 10) { return 'border-l-cyan-500'; }
    return 'border-l-slate-500';
  };

  const getMarginStatus = (margin: number) => {
    if (margin >= 30) { return 'Excelente'; }
    if (margin >= 20) { return 'Boa'; }
    if (margin >= 10) { return 'Adequada'; }
    return 'Baixa';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md border ${
          margin >= 30 ? 'bg-green-50 border-green-100' :
          margin >= 20 ? 'bg-blue-50 border-blue-100' :
          margin >= 10 ? 'bg-cyan-50 border-cyan-100' :
          'bg-slate-50 border-slate-100'
        }`}>
          <TrendingUp className={`h-4 w-4 ${getMarginIconColor(margin)}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Margem de Lucro</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Defina a margem de lucro desejada para o cálculo
          </p>
        </div>
      </div>

      {/* Margin Display */}
      <div className={`p-4 sm:p-6 rounded-lg border border-border bg-card border-l-4 ${getMarginBorderColor(margin)}`}>
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Margem Configurada
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span className={`text-2xl sm:text-3xl font-semibold ${getMarginColor(margin)}`}>
                {margin}%
              </span>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 ${getMarginColor(margin)} bg-opacity-5`}>
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
              <span className="flex flex-col items-center gap-0.5">
                <span className="font-medium">1%</span>
                <span className="text-[10px]">Mínimo</span>
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span className="font-medium">10%</span>
                <span className="text-[10px]">Básico</span>
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span className="font-medium">30%</span>
                <span className="text-[10px]">Ideal</span>
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span className="font-medium">100%</span>
                <span className="text-[10px]">Máximo</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
